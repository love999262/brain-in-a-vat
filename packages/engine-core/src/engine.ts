import { clamp, createStableId, Emitter, nowIso } from "@brain-vat/shared";
import type { RelationshipEdge } from "@brain-vat/config-schema";

import type {
  CapabilityProfile,
  CharacterMood,
  CharacterViewModel,
  ConversationMessage,
  ConversationViewModel,
  EngineCommand,
  EngineError,
  EngineEvent,
  EngineHandle,
  EngineSnapshot,
  InitConfig,
  MemoryRecord,
  RelationshipDimensions,
  RelationshipViewModel,
  ResolvedCharacter,
  ResolvedWorld,
  ResourceViewModel,
  SourceItem,
  WorldInitInput,
  WorldViewModel
} from "./types.js";

interface InternalState {
  lifecycle: WorldViewModel["lifecycle"];
  world: ResolvedWorld | null;
  warnings: string[];
  errors: EngineError[];
  conversation: ConversationMessage[];
  inputLocked: boolean;
  generatingCharacterIds: string[];
  memories: MemoryRecord[];
  capability: CapabilityProfile;
  focusedCharacterId?: string;
}

const DEFAULT_CAPABILITY: CapabilityProfile = {
  webGpuSupported: false,
  webGpuAvailable: false,
  deviceProfile: "auto",
  performanceTier: "medium",
  estimatedVisibleCharacterBudget: 2,
  estimatedActiveCharacterBudget: 3,
  degradationState: "none",
  notes: []
};

function createInitialState(initConfig: InitConfig): InternalState {
  const initialCapability = initConfig.extensions?.capabilityProfile as Partial<CapabilityProfile> | undefined;
  return {
    lifecycle: "created",
    world: null,
    warnings: [],
    errors: [],
    conversation: [],
    inputLocked: false,
    generatingCharacterIds: [],
    memories: [],
    capability: {
      ...DEFAULT_CAPABILITY,
      ...initialCapability,
      notes: [...DEFAULT_CAPABILITY.notes, ...(initialCapability?.notes ?? [])],
      deviceProfile: initConfig.runtime?.deviceProfileHint ?? initialCapability?.deviceProfile ?? "auto"
    }
  };
}

function relationSummary(edge: RelationshipEdge): string {
  const { from, to, dimensions } = edge;
  return `${from} -> ${to} 信任 ${dimensions.trust.toFixed(2)} / 张力 ${dimensions.tension.toFixed(2)}`;
}

function getLatestSourceHighlights(world: ResolvedWorld, characterId: string): string[] {
  return Object.values(world.sourceBindings)
    .filter((binding) => binding.enabled && (binding.deliverTo.includes(characterId) || binding.sharedChannels.length > 0))
    .flatMap((binding) => binding.lastItems.slice(0, 1).map((item) => `${item.title}：${item.summary}`))
    .slice(0, 3);
}

function moodForText(text: string): CharacterMood {
  if (/[!！]/.test(text)) {
    return "bright";
  }
  if (/为什么|质疑|问题/.test(text)) {
    return "serious";
  }
  if (/好奇|想知道|看看/.test(text)) {
    return "curious";
  }
  return "calm";
}

function updateRelation(edge: RelationshipEdge, patch: Partial<RelationshipDimensions>): RelationshipEdge {
  return {
    ...edge,
    dimensions: {
      familiarity: clamp(edge.dimensions.familiarity + (patch.familiarity ?? 0), 0, 1),
      trust: clamp(edge.dimensions.trust + (patch.trust ?? 0), 0, 1),
      warmth: clamp(edge.dimensions.warmth + (patch.warmth ?? 0), 0, 1),
      tension: clamp(edge.dimensions.tension + (patch.tension ?? 0), 0, 1),
      curiosity: clamp(edge.dimensions.curiosity + (patch.curiosity ?? 0), 0, 1),
      influence: clamp(edge.dimensions.influence + (patch.influence ?? 0), 0, 1)
    }
  };
}

export class BrainVatEngine implements EngineHandle {
  private readonly emitter = new Emitter<{ event: EngineEvent }>();
  private readonly state: InternalState;

  constructor(private readonly initConfig: InitConfig) {
    this.state = createInitialState(initConfig);
    void this.bootstrap();
  }

  async start(): Promise<void> {
    if (this.state.lifecycle === "running") {
      return;
    }

    if (!this.state.world) {
      await this.loadWorld(this.initConfig.world);
    }

    this.state.lifecycle = "running";
    await this.refreshAllSources();
    this.emit({
      type: "engine.started",
      payload: {
        worldId: this.requireWorld().pack.manifest.id
      }
    });
  }

  pause(): void {
    if (!this.state.world) {
      return;
    }

    this.state.lifecycle = "paused";
    this.emit({
      type: "engine.paused",
      payload: {
        worldId: this.state.world.pack.manifest.id
      }
    });
  }

  async resume(): Promise<void> {
    await this.start();
  }

  async destroy(): Promise<void> {
    this.state.lifecycle = "destroyed";
    await this.initConfig.providers.model.dispose?.();
    this.emit({
      type: "engine.destroyed",
      payload: {
        worldId: this.state.world?.pack.manifest.id
      }
    });
    this.emitter.clear();
  }

  async dispatch(command: EngineCommand): Promise<void> {
    switch (command.type) {
      case "engine.loadWorld":
        await this.loadWorld(command.payload.world);
        return;
      case "engine.start":
        await this.start();
        return;
      case "engine.pause":
        this.pause();
        return;
      case "engine.resume":
        await this.resume();
        return;
      case "conversation.sendMessage":
        await this.handleSendMessage(command);
        return;
      case "conversation.interrupt":
        this.state.inputLocked = false;
        this.state.generatingCharacterIds = [];
        return;
      case "scene.focusCharacter":
        this.focusCharacter(command.payload.characterId);
        return;
      case "scene.setVisibleCharacters":
        this.setVisibleCharacters(command.payload.characterIds);
        return;
      case "character.activate":
        this.setCharacterActive(command.payload.characterId, true);
        return;
      case "character.deactivate":
        this.setCharacterActive(command.payload.characterId, false);
        return;
      case "source.enable":
        this.setSourceEnabled(command.payload.bindingId, true);
        return;
      case "source.disable":
        this.setSourceEnabled(command.payload.bindingId, false);
        return;
      case "source.refresh":
        await this.refreshSources(command.payload.bindingId ? [command.payload.bindingId] : undefined);
        return;
      case "source.injectItems":
        this.ingestSourceItems(command.payload.bindingId, command.payload.items);
        return;
      case "state.export":
        this.exportState();
        return;
      case "state.import":
        await this.importState(command.payload.snapshot);
        return;
      case "memory.forgetById":
        this.state.memories = this.state.memories.filter((memory) => memory.id !== command.payload.memoryId);
        await this.persistState();
        return;
      case "memory.forgetByScope":
        this.state.memories = this.state.memories.filter((memory) => {
          if (memory.scope !== command.payload.scope) {
            return true;
          }

          if (!command.payload.characterId) {
            return false;
          }

          return !memory.characterIds.includes(command.payload.characterId);
        });
        await this.persistState();
        return;
      default:
        return;
    }
  }

  subscribe(listener: (event: EngineEvent) => void): () => void {
    return this.emitter.on("event", listener);
  }

  getViewModel(name: "world"): WorldViewModel;
  getViewModel(name: "characters"): CharacterViewModel[];
  getViewModel(name: "conversation"): ConversationViewModel;
  getViewModel(name: "relationships"): RelationshipViewModel;
  getViewModel(name: "resources"): ResourceViewModel;
  getViewModel(name: "world" | "characters" | "conversation" | "relationships" | "resources") {
    switch (name) {
      case "world":
        return this.buildWorldViewModel();
      case "characters":
        return this.buildCharacterViewModels();
      case "conversation":
        return this.buildConversationViewModel();
      case "relationships":
        return this.buildRelationshipViewModel();
      case "resources":
        return this.buildResourceViewModel();
      default:
        return this.buildWorldViewModel();
    }
  }

  getCapabilityProfile(): CapabilityProfile {
    return this.state.capability;
  }

  exportState(): EngineSnapshot {
    const world = this.requireWorld();
    const snapshot: EngineSnapshot = {
      worldId: world.pack.manifest.id,
      exportedAt: nowIso(),
      conversation: this.state.conversation,
      memories: this.state.memories,
      relationships: world.relationships,
      characterState: Object.values(world.characters).map((character) => ({
        characterId: character.instanceId,
        mood: character.mood,
        energy: character.energy,
        visible: character.visible,
        focused: character.focused,
        active: character.active,
        currentTopic: character.currentTopic
      })),
      sourceState: Object.values(world.sourceBindings).map((binding) => ({
        bindingId: binding.bindingId,
        enabled: binding.enabled,
        lastFetchedAt: binding.lastFetchedAt,
        lastStatus: binding.lastStatus,
        lastError: binding.lastError,
        lastItems: binding.lastItems
      }))
    };

    this.emit({
      type: "state.exported",
      payload: {
        namespace: this.initConfig.persistence?.namespace
      }
    });

    return snapshot;
  }

  async importState(snapshot: EngineSnapshot): Promise<void> {
    const world = this.requireWorld();
    if (snapshot.worldId !== world.pack.manifest.id) {
      return;
    }

    this.state.conversation = snapshot.conversation;
    this.state.memories = snapshot.memories;
    world.relationships = snapshot.relationships;

    snapshot.characterState.forEach((entry) => {
      const character = world.characters[entry.characterId];
      if (!character) {
        return;
      }

      character.mood = entry.mood;
      character.energy = entry.energy;
      character.visible = entry.visible;
      character.focused = entry.focused;
      character.active = entry.active;
      character.currentTopic = entry.currentTopic;
    });

    snapshot.sourceState.forEach((entry) => {
      const binding = world.sourceBindings[entry.bindingId];
      if (!binding) {
        return;
      }

      binding.enabled = entry.enabled;
      binding.lastFetchedAt = entry.lastFetchedAt;
      binding.lastStatus = entry.lastStatus;
      binding.lastError = entry.lastError;
      binding.lastItems = entry.lastItems;
    });

    await this.persistState();
    this.emit({
      type: "state.restored",
      payload: {
        namespace: this.initConfig.persistence?.namespace
      }
    });
    this.emitSceneUpdated();
    this.emitResourceStatus();
  }

  private async bootstrap(): Promise<void> {
    try {
      await this.initConfig.providers.model.initialize?.({
        capabilityProfile: this.state.capability
      });

      await this.loadWorld(this.initConfig.world);

      if (this.initConfig.runtime?.autoStart !== false) {
        await this.start();
      }
    } catch (error) {
      this.pushError({
        code: "ENGINE_INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "引擎启动失败",
        cause: error
      });
    }
  }

  private async loadWorld(input: WorldInitInput): Promise<void> {
    this.state.lifecycle = "loading-world";

    const worldPack =
      input.type === "pack" ? input.pack : await this.initConfig.providers.asset.getWorldPack(input.id);

    this.state.lifecycle = "resolving-packs";
    const characters = Object.fromEntries(
      await Promise.all(
        worldPack.cast.map(async (entry) => {
          const pack = await this.initConfig.providers.asset.getCharacterPack(entry.characterPackId);
          const visible = entry.visibleAtStart || pack.manifest.defaults.visibleAtBootstrap;
          const modelUrl = this.initConfig.providers.asset.resolveAssetUrl(
            pack.manifestPath,
            pack.renderManifest.model.entry
          );
          const posterUrl = pack.renderManifest.fallback.poster
            ? this.initConfig.providers.asset.resolveAssetUrl(pack.manifestPath, pack.renderManifest.fallback.poster)
            : undefined;

          const character: ResolvedCharacter = {
            instanceId: entry.instanceId,
            pack,
            name: entry.alias ?? pack.persona.identity.displayName,
            title: pack.manifest.title,
            mood: entry.initialState.mood ?? pack.manifest.defaults.initialMood,
            energy: entry.initialState.energy ?? pack.manifest.defaults.initialEnergy,
            visible,
            focused: visible && !this.state.focusedCharacterId,
            active: entry.enabled,
            speaking: false,
            focusPriority: entry.focusPriority,
            currentTopic: undefined,
            affinitySummary: this.buildAffinitySummary(pack),
            modelUrl,
            posterUrl,
            live2dStatus: posterUrl ? "fallback" : "loading",
            live2dDetail: posterUrl ? "已准备 fallback poster" : "等待渲染器接管"
          };

          if (character.focused) {
            this.state.focusedCharacterId = character.instanceId;
          }

          return [entry.instanceId, character] as const;
        })
      )
    );

    const sourcePackEntries = await Promise.all(
      worldPack.sources.map(async (binding) => {
        const pack = await this.initConfig.providers.asset.getSourcePack(binding.sourcePackId);
        return [binding.bindingId, pack] as const;
      })
    );

    const sourcePacks = Object.fromEntries(sourcePackEntries);
    const sourceBindings = Object.fromEntries(
      worldPack.sources.map((binding) => [
        binding.bindingId,
        {
          bindingId: binding.bindingId,
          sourcePackId: binding.sourcePackId,
          enabled: binding.enabled,
          deliverTo: binding.deliverTo,
          sharedChannels: binding.sharedChannels,
          priorityMode: binding.priorityMode,
          lastItems: [] as SourceItem[]
        }
      ])
    );

    const channels =
      worldPack.scene.channels.length > 0
        ? worldPack.scene.channels
        : [
            {
              id: "main-group",
              kind: "group" as const,
              participants: Object.keys(characters),
              default: true
            }
          ];

    this.state.world = {
      pack: worldPack,
      characters,
      sourcePacks,
      sourceBindings,
      relationships: worldPack.relationships,
      channels
    };

    this.state.conversation = [
      {
        id: createStableId("msg"),
        channelId: channels.find((channel) => channel.default)?.id ?? channels[0]?.id ?? "main-group",
        authorType: "system",
        authorId: "system",
        text: `${worldPack.manifest.name} 已就绪，角色世界开始运转。`,
        timestamp: nowIso()
      }
    ];

    this.state.lifecycle = "binding-providers";

    if (this.initConfig.persistence?.restorePreviousState) {
      this.state.lifecycle = "restoring-state";
      try {
        const snapshot =
          this.initConfig.persistence.initialSnapshot ??
          (this.initConfig.persistence.namespace && this.initConfig.providers.storage
            ? await this.initConfig.providers.storage.restore(this.initConfig.persistence.namespace)
            : null);

        if (snapshot) {
          await this.importState(snapshot);
        }
      } catch (error) {
        this.pushError({
          code: "STATE_RESTORE_FAILED",
          message: "世界状态恢复失败",
          cause: error
        });
      }
    }

    this.state.lifecycle = "ready";
    this.emit({
      type: "world.loaded",
      payload: {
        worldId: worldPack.manifest.id
      }
    });
    this.emit({
      type: "engine.ready",
      payload: {
        worldId: worldPack.manifest.id
      }
    });
    this.emit({
      type: "capability.profile.changed",
      payload: this.state.capability
    });
    this.emitSceneUpdated();
    this.emitResourceStatus();
    this.initConfig.hooks?.onReady?.();
  }

  private async handleSendMessage(
    command: Extract<EngineCommand, { type: "conversation.sendMessage" }>
  ): Promise<void> {
    const world = this.requireWorld();
    const activeChannelId =
      command.payload.channelId ??
      world.channels.find((channel) => channel.default)?.id ??
      world.channels[0]?.id ??
      "main-group";

    const userMessage: ConversationMessage = {
      id: createStableId("msg"),
      channelId: activeChannelId,
      authorType: "user",
      authorId: "user",
      text: command.payload.message,
      timestamp: nowIso()
    };

    this.state.conversation = [...this.state.conversation, userMessage];
    this.appendMemory({
      scope: "short-term",
      characterIds: command.payload.targetCharacterIds ?? [],
      sourceType: "user",
      sourceRef: userMessage.id,
      summary: command.payload.message,
      salience: 0.55
    });

    const responders = this.pickResponders(command.payload.targetCharacterIds);
    this.state.inputLocked = true;

    for (const responder of responders) {
      this.state.generatingCharacterIds = [...new Set([...this.state.generatingCharacterIds, responder.instanceId])];
      responder.speaking = true;
      this.emit({
        type: "character.reply.started",
        payload: {
          characterId: responder.instanceId,
          channelId: activeChannelId,
          requestId: command.requestId
        }
      });

      const generation = await this.initConfig.providers.model.generate({
        worldId: world.pack.manifest.id,
        characterId: responder.instanceId,
        characterName: responder.name,
        personaSummary: responder.pack.persona.identity.roleSummary,
        traitHints: responder.pack.persona.coreIdentityTags,
        memorySnippets: this.state.memories
          .filter((memory) => memory.characterIds.length === 0 || memory.characterIds.includes(responder.instanceId))
          .slice(-3)
          .map((memory) => memory.summary),
        sourceHighlights: getLatestSourceHighlights(world, responder.instanceId),
        relationshipHints: world.relationships
          .filter((edge) => edge.from === responder.instanceId)
          .slice(0, 3)
          .map((edge) => relationSummary(edge)),
        conversation: this.state.conversation.slice(-8).map((message) => ({
          role:
            message.authorType === "user"
              ? "user"
              : message.authorType === "character"
                ? "assistant"
                : "system",
          speakerId: message.authorId,
          content: message.text
        }))
      });

      const reply: ConversationMessage = {
        id: createStableId("msg"),
        channelId: activeChannelId,
        authorType: "character",
        authorId: responder.instanceId,
        text: generation.text,
        timestamp: nowIso()
      };

      responder.speaking = false;
      responder.currentTopic = this.extractTopic(command.payload.message, generation.text);
      responder.mood = moodForText(generation.text);
      responder.energy = clamp(responder.energy + 0.02, 0, 1);
      this.state.conversation = [...this.state.conversation, reply];
      this.state.generatingCharacterIds = this.state.generatingCharacterIds.filter((id) => id !== responder.instanceId);

      this.appendMemory({
        scope: "short-term",
        characterIds: [responder.instanceId],
        sourceType: "character",
        sourceRef: reply.id,
        summary: reply.text,
        salience: 0.62
      });
      this.appendMemory({
        scope: command.payload.message.length > 18 ? "episodic" : "short-term",
        characterIds: responders.map((character) => character.instanceId),
        sourceType: "system",
        sourceRef: command.requestId,
        summary: `用户发起了一次互动：${command.payload.message}`,
        salience: 0.66
      });

      this.adjustRelationshipsAfterReply(responder.instanceId, command.payload.targetCharacterIds ?? []);

      this.emit({
        type: "character.reply.completed",
        payload: {
          characterId: responder.instanceId,
          channelId: activeChannelId,
          messageId: reply.id,
          text: reply.text
        }
      });
      this.emit({
        type: "character.state.changed",
        payload: {
          characterId: responder.instanceId,
          mood: responder.mood,
          energy: responder.energy
        }
      });
    }

    this.state.inputLocked = false;
    await this.persistState();
  }

  private appendMemory(input: Omit<MemoryRecord, "id" | "createdAt">): void {
    const memory: MemoryRecord = {
      id: createStableId("mem"),
      createdAt: nowIso(),
      ...input
    };
    this.state.memories = [...this.state.memories, memory].slice(-60);
    this.emit({
      type: "memory.updated",
      payload: {
        memoryId: memory.id,
        scope: memory.scope,
        characterIds: memory.characterIds
      }
    });
  }

  private adjustRelationshipsAfterReply(responderId: string, targetIds: string[]): void {
    const world = this.requireWorld();
    const visibleIds = Object.values(world.characters)
      .filter((character) => character.visible)
      .map((character) => character.instanceId);
    const interestedIds = targetIds.length > 0 ? targetIds : visibleIds.filter((id) => id !== responderId);

    world.relationships = world.relationships.map((edge) => {
      if (edge.from === responderId && interestedIds.includes(edge.to)) {
        const updated = updateRelation(edge, {
          familiarity: 0.03,
          trust: 0.03,
          warmth: 0.02,
          influence: 0.02
        });
        this.emit({
          type: "relationship.changed",
          payload: {
            from: updated.from,
            to: updated.to,
            dimensions: updated.dimensions
          }
        });
        return updated;
      }

      if (edge.from !== responderId && edge.to === responderId) {
        const updated = updateRelation(edge, {
          curiosity: 0.02,
          tension: interestedIds.includes(edge.from) ? 0.01 : 0
        });
        this.emit({
          type: "relationship.changed",
          payload: {
            from: updated.from,
            to: updated.to,
            dimensions: updated.dimensions
          }
        });
        return updated;
      }

      return edge;
    });
  }

  private pickResponders(targetCharacterIds?: string[]): ResolvedCharacter[] {
    const world = this.requireWorld();
    const candidates = Object.values(world.characters).filter((character) => character.active);
    const relevantCandidates =
      targetCharacterIds && targetCharacterIds.length > 0
        ? candidates.filter((character) => targetCharacterIds.includes(character.instanceId))
        : candidates;

    const sorted = [...relevantCandidates].sort((left, right) => {
      const leftScore = (left.focused ? 1 : 0) + left.focusPriority + left.energy;
      const rightScore = (right.focused ? 1 : 0) + right.focusPriority + right.energy;
      return rightScore - leftScore;
    });

    if (sorted.length <= 1) {
      return sorted.slice(0, 1);
    }

    return targetCharacterIds && targetCharacterIds.length > 1 ? sorted.slice(0, 2) : sorted.slice(0, 1);
  }

  private extractTopic(userText: string, replyText: string): string | undefined {
    const text = `${userText} ${replyText}`;
    const topics = ["电影", "游戏", "科技", "历史", "娱乐", "世界"];
    return topics.find((topic) => text.includes(topic));
  }

  private focusCharacter(characterId: string): void {
    const world = this.requireWorld();
    Object.values(world.characters).forEach((character) => {
      character.focused = character.instanceId === characterId;
    });
    this.state.focusedCharacterId = characterId;
    this.emitSceneUpdated();
  }

  private setVisibleCharacters(characterIds: string[]): void {
    const world = this.requireWorld();
    Object.values(world.characters).forEach((character) => {
      character.visible = characterIds.includes(character.instanceId);
      if (!character.visible) {
        character.focused = false;
      }
    });
    if (!world.characters[this.state.focusedCharacterId ?? ""]?.visible) {
      const firstVisible = Object.values(world.characters).find((character) => character.visible);
      if (firstVisible) {
        this.focusCharacter(firstVisible.instanceId);
      }
    }
    this.emitSceneUpdated();
  }

  private setCharacterActive(characterId: string, active: boolean): void {
    const character = this.requireWorld().characters[characterId];
    if (character) {
      character.active = active;
    }
  }

  private setSourceEnabled(bindingId: string, enabled: boolean): void {
    const binding = this.requireWorld().sourceBindings[bindingId];
    if (binding) {
      binding.enabled = enabled;
    }
  }

  private async refreshAllSources(): Promise<void> {
    await this.refreshSources();
  }

  private async refreshSources(bindingIds?: string[]): Promise<void> {
    const world = this.requireWorld();
    const sourceProvider = this.initConfig.providers.source;
    if (!sourceProvider) {
      return;
    }

    const ids =
      bindingIds ??
      Object.values(world.sourceBindings)
        .filter((binding) => binding.enabled)
        .map((binding) => binding.bindingId);

    for (const bindingId of ids) {
      const binding = world.sourceBindings[bindingId];
      if (!binding) {
        continue;
      }
      const sourcePack = world.sourcePacks[binding.bindingId];
      if (!sourcePack) {
        continue;
      }

      try {
        const result = await sourceProvider.refreshSource({
          bindingId,
          sourcePack,
          assetProvider: this.initConfig.providers.asset
        });

        binding.lastFetchedAt = result.fetchedAt;
        binding.lastStatus = result.status;
        binding.lastError = result.errorMessage;
        binding.lastItems = result.items;

        if (result.status === "error") {
          this.emit({
            type: "source.fetch.failed",
            payload: {
              bindingId,
              message: result.errorMessage ?? "源刷新失败"
            }
          });
          continue;
        }

        if (result.items.length > 0) {
          this.ingestSourceItems(bindingId, result.items);
        }
      } catch (error) {
        this.emit({
          type: "source.fetch.failed",
          payload: {
            bindingId,
            message: error instanceof Error ? error.message : "源刷新失败"
          }
        });
      }
    }

    this.emitResourceStatus();
  }

  private ingestSourceItems(bindingId: string, items: SourceItem[]): void {
    const world = this.requireWorld();
    const binding = world.sourceBindings[bindingId];
    if (!binding) {
      return;
    }

    binding.lastItems = items;
    binding.lastFetchedAt = nowIso();
    binding.lastStatus = items.length > 0 ? "success" : "empty";

    const sourcePack = world.sourcePacks[bindingId];
    items.forEach((item) => {
      this.appendMemory({
        scope: "episodic",
        characterIds: binding.deliverTo,
        sourceType: "source",
        sourceRef: item.id,
        summary: `${sourcePack?.manifest.name ?? binding.sourcePackId}：${item.title}`,
        salience: 0.58
      });
    });

    this.emit({
      type: "source.items.ingested",
      payload: {
        bindingId,
        count: items.length
      }
    });
  }

  private buildAffinitySummary(characterPack: ResolvedCharacter["pack"]): string {
    const interests = Object.entries(characterPack.persona.interests)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 2)
      .map(([interest]) => interest);
    return interests.length > 0 ? `最近更偏向 ${interests.join("、")} 相关话题` : "暂无明显偏好变化";
  }

  private buildWorldViewModel(): WorldViewModel {
    const world = this.requireWorld();
    const characters = Object.values(world.characters);
    const enabledSourceCount = Object.values(world.sourceBindings).filter((binding) => binding.enabled).length;

    return {
      worldId: world.pack.manifest.id,
      name: world.pack.manifest.name,
      lifecycle: this.state.lifecycle,
      capabilityTier: this.state.capability.performanceTier,
      activeCharacterCount: characters.filter((character) => character.active).length,
      visibleCharacterCount: characters.filter((character) => character.visible).length,
      enabledSourceCount,
      warnings: this.state.warnings,
      errors: this.state.errors
    };
  }

  private buildCharacterViewModels(): CharacterViewModel[] {
    return Object.values(this.requireWorld().characters)
      .sort((left, right) => Number(right.focused) - Number(left.focused))
      .map((character) => ({
        id: character.instanceId,
        name: character.name,
        title: character.title,
        visible: character.visible,
        active: character.active,
        speaking: character.speaking,
        focused: character.focused,
        mood: character.mood,
        energy: character.energy,
        currentTopic: character.currentTopic,
        affinitySummary: character.affinitySummary,
        live2d: {
          modelId: character.pack.manifest.id,
          motion: character.pack.renderManifest.motions[0]?.id ?? "idle",
          expression: character.pack.renderManifest.expressions[0]?.id ?? "default",
          status: character.live2dStatus,
          modelUrl: character.modelUrl,
          posterUrl: character.posterUrl,
          detail: character.live2dDetail
        }
      }));
  }

  private buildConversationViewModel(): ConversationViewModel {
    const world = this.requireWorld();
    const activeChannelId =
      world.channels.find((channel) => channel.default)?.id ?? world.channels[0]?.id ?? "main-group";
    const participants =
      world.channels.find((channel) => channel.id === activeChannelId)?.participants ?? Object.keys(world.characters);

    return {
      activeChannelId,
      participants,
      messages: this.state.conversation,
      generatingCharacterIds: this.state.generatingCharacterIds,
      inputLocked: this.state.inputLocked
    };
  }

  private buildRelationshipViewModel(): RelationshipViewModel {
    const world = this.requireWorld();
    return {
      edges: world.relationships.map((edge) => ({
        ...edge,
        summary: relationSummary(edge)
      })),
      recentChanges: world.relationships.slice(-3).map((edge) => relationSummary(edge))
    };
  }

  private buildResourceViewModel(): ResourceViewModel {
    const modelStatus = this.initConfig.providers.model.getStatus();
    const storageStatus = this.initConfig.providers.storage
      ? {
          status: "ready" as const,
          label: this.initConfig.providers.storage.name
        }
      : {
          status: "degraded" as const,
          label: "未接入持久化",
          details: "当前使用内存态"
        };
    const sourceStatus = this.initConfig.providers.source
      ? {
          status: "ready" as const,
          label: this.initConfig.providers.source.name
        }
      : {
          status: "degraded" as const,
          label: "未接入消息源 Provider"
        };

    return {
      model: modelStatus,
      storage: storageStatus,
      source: sourceStatus,
      live2d: Object.values(this.requireWorld().characters).map((character) => ({
        characterId: character.instanceId,
        status: character.live2dStatus,
        detail: character.live2dDetail
      })),
      capability: this.state.capability
    };
  }

  private emit(event: Omit<EngineEvent, "eventId" | "timestamp">): void {
    const enriched: EngineEvent = {
      ...event,
      eventId: createStableId("evt"),
      timestamp: nowIso()
    } as EngineEvent;
    this.emitter.emit("event", enriched);
    this.initConfig.hooks?.onEvent?.(enriched);
    if (enriched.type === "capability.profile.changed") {
      this.initConfig.hooks?.onCapabilityChanged?.(enriched.payload);
    }
    if (enriched.type === "engine.error") {
      this.initConfig.hooks?.onError?.(enriched.payload);
    }
  }

  private emitSceneUpdated(): void {
    const world = this.requireWorld();
    this.emit({
      type: "scene.updated",
      payload: {
        focusedCharacterId: this.state.focusedCharacterId,
        visibleCharacterIds: Object.values(world.characters)
          .filter((character) => character.visible)
          .map((character) => character.instanceId)
      }
    });
  }

  private emitResourceStatus(): void {
    if (!this.state.world) {
      return;
    }

    this.emit({
      type: "resource.status.changed",
      payload: this.buildResourceViewModel()
    });
  }

  private pushError(error: EngineError): void {
    this.state.errors = [...this.state.errors, error];
    this.emit({
      type: "engine.error",
      payload: error
    });
  }

  private requireWorld(): ResolvedWorld {
    if (!this.state.world) {
      throw new Error("World is not loaded.");
    }

    return this.state.world;
  }

  private async persistState(): Promise<void> {
    if (!this.initConfig.persistence?.namespace || !this.initConfig.providers.storage || !this.state.world) {
      return;
    }

    await this.initConfig.providers.storage.save(this.initConfig.persistence.namespace, this.exportState());
  }
}
