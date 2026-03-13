import type { CharacterPack, RelationshipEdge, SourcePack, WorldPack } from "@brain-vat/config-schema";

export type EngineLifecycleState =
  | "created"
  | "loading-world"
  | "resolving-packs"
  | "validating-config"
  | "binding-providers"
  | "restoring-state"
  | "ready"
  | "running"
  | "paused"
  | "destroyed";

export type RuntimeSurface = "standalone" | "embedded" | "extension";
export type PerformancePreset = "auto" | "lite" | "balanced" | "immersive";
export type DeviceProfileHint = "auto" | "desktop" | "mobile";

export interface CapabilityProfile {
  webGpuSupported: boolean;
  webGpuAvailable: boolean;
  deviceProfile: DeviceProfileHint;
  performanceTier: "low" | "medium" | "high";
  estimatedVisibleCharacterBudget: number;
  estimatedActiveCharacterBudget: number;
  degradationState: "none" | "lite" | "safe";
  notes: string[];
}

export interface WorldPackReference {
  type: "pack-ref";
  id: string;
}

export interface WorldPackInline {
  type: "pack";
  pack: WorldPack;
}

export type WorldInitInput = WorldPackReference | WorldPackInline;

export interface PersistenceConfig {
  namespace: string;
  restorePreviousState?: boolean;
  initialSnapshot?: EngineSnapshot | null;
}

export interface RuntimeConfig {
  surface?: RuntimeSurface;
  autoStart?: boolean;
  debug?: boolean;
  performancePreset?: PerformancePreset;
  allowBackgroundEvolution?: boolean;
  deviceProfileHint?: DeviceProfileHint;
}

export interface AssetProvider {
  name: string;
  getWorldPack(id: string): Promise<WorldPack>;
  getCharacterPack(id: string): Promise<CharacterPack>;
  getSourcePack(id: string): Promise<SourcePack>;
  resolveAssetUrl(manifestPath: string, assetPath: string): string;
}

export interface StorageProvider {
  name: string;
  restore(namespace: string): Promise<EngineSnapshot | null>;
  save(namespace: string, snapshot: EngineSnapshot): Promise<void>;
  clear(namespace: string): Promise<void>;
}

export interface SourceItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  url?: string;
  publishedAt?: string;
  tags?: string[];
  category?: string;
  credibility?: number;
}

export interface SourceRefreshResult {
  status: "success" | "empty" | "error";
  items: SourceItem[];
  fetchedAt: string;
  errorMessage?: string;
}

export interface SourceProvider {
  name: string;
  refreshSource(input: {
    bindingId: string;
    sourcePack: SourcePack;
    assetProvider: AssetProvider;
  }): Promise<SourceRefreshResult>;
}

export interface GenerationMessage {
  role: "system" | "user" | "assistant";
  speakerId?: string;
  content: string;
}

export interface ModelGenerationResult {
  text: string;
  provider: string;
  degraded: boolean;
  notes?: string[];
}

export interface ProviderStatus {
  status: "idle" | "loading" | "ready" | "degraded" | "error";
  label: string;
  details?: string;
}

export interface ModelProvider {
  name: string;
  initialize?(input: { capabilityProfile: CapabilityProfile }): Promise<void>;
  generate(input: {
    worldId: string;
    characterId: string;
    characterName: string;
    personaSummary: string;
    traitHints: string[];
    memorySnippets: string[];
    sourceHighlights: string[];
    conversation: GenerationMessage[];
    relationshipHints: string[];
  }): Promise<ModelGenerationResult>;
  getStatus(): ProviderStatus;
  dispose?(): Promise<void>;
}

export interface ServerlessBridge {
  name: string;
}

export interface InitConfig {
  apiVersion: "1.0";
  world: WorldInitInput;
  assets?: {
    baseUrl?: string;
  };
  providers: {
    model: ModelProvider;
    asset: AssetProvider;
    storage?: StorageProvider;
    source?: SourceProvider;
    serverlessBridge?: ServerlessBridge;
  };
  persistence?: PersistenceConfig;
  runtime?: RuntimeConfig;
  hooks?: {
    onReady?: () => void;
    onError?: (error: EngineError) => void;
    onEvent?: (event: EngineEvent) => void;
    onCapabilityChanged?: (profile: CapabilityProfile) => void;
  };
  extensions?: Record<string, unknown>;
}

export interface EngineError {
  code:
    | "CONFIG_INVALID"
    | "PACK_NOT_FOUND"
    | "SCHEMA_MISMATCH"
    | "PROVIDER_UNAVAILABLE"
    | "MODEL_LOAD_FAILED"
    | "SOURCE_FETCH_FAILED"
    | "STATE_RESTORE_FAILED"
    | "UNSUPPORTED_CAPABILITY"
    | "ENGINE_INTERNAL_ERROR";
  message: string;
  cause?: unknown;
}

export interface BaseCommand<TType extends string, TPayload> {
  type: TType;
  requestId: string;
  payload: TPayload;
  meta?: Record<string, string | number | boolean | null>;
}

export type EngineCommand =
  | BaseCommand<"engine.loadWorld", { world: WorldInitInput }>
  | BaseCommand<"engine.start", Record<string, never>>
  | BaseCommand<"engine.pause", Record<string, never>>
  | BaseCommand<"engine.resume", Record<string, never>>
  | BaseCommand<
      "conversation.sendMessage",
      {
        channelId?: string;
        targetCharacterIds?: string[];
        message: string;
      }
    >
  | BaseCommand<"conversation.interrupt", { channelId?: string }>
  | BaseCommand<"scene.focusCharacter", { characterId: string }>
  | BaseCommand<"scene.setVisibleCharacters", { characterIds: string[] }>
  | BaseCommand<"character.activate", { characterId: string }>
  | BaseCommand<"character.deactivate", { characterId: string }>
  | BaseCommand<"source.enable", { bindingId: string }>
  | BaseCommand<"source.disable", { bindingId: string }>
  | BaseCommand<"source.refresh", { bindingId?: string }>
  | BaseCommand<"source.injectItems", { bindingId: string; items: SourceItem[] }>
  | BaseCommand<"state.export", Record<string, never>>
  | BaseCommand<"state.import", { snapshot: EngineSnapshot }>
  | BaseCommand<"memory.forgetById", { memoryId: string }>
  | BaseCommand<"memory.forgetByScope", { scope: MemoryScope; characterId?: string }>;

export interface BaseEvent<TType extends string, TPayload> {
  type: TType;
  eventId: string;
  timestamp: string;
  payload: TPayload;
  meta?: Record<string, string | number | boolean | null | undefined>;
}

export type EngineEvent =
  | BaseEvent<"engine.ready", { worldId: string }>
  | BaseEvent<"engine.started", { worldId: string }>
  | BaseEvent<"engine.paused", { worldId: string }>
  | BaseEvent<"engine.destroyed", { worldId?: string }>
  | BaseEvent<"world.loaded", { worldId: string }>
  | BaseEvent<"scene.updated", { focusedCharacterId?: string; visibleCharacterIds: string[] }>
  | BaseEvent<"character.reply.started", { characterId: string; channelId: string; requestId: string }>
  | BaseEvent<
      "character.reply.completed",
      { characterId: string; channelId: string; messageId: string; text: string }
    >
  | BaseEvent<"character.state.changed", { characterId: string; mood: CharacterMood; energy: number }>
  | BaseEvent<"relationship.changed", { from: string; to: string; dimensions: RelationshipDimensions }>
  | BaseEvent<"memory.updated", { memoryId: string; scope: MemoryScope; characterIds: string[] }>
  | BaseEvent<"source.items.ingested", { bindingId: string; count: number }>
  | BaseEvent<"source.fetch.failed", { bindingId: string; message: string }>
  | BaseEvent<"resource.status.changed", ResourceViewModel>
  | BaseEvent<"capability.profile.changed", CapabilityProfile>
  | BaseEvent<"state.restored", { namespace?: string }>
  | BaseEvent<"state.exported", { namespace?: string }>
  | BaseEvent<"engine.error", EngineError>;

export type CharacterMood =
  | "neutral"
  | "bright"
  | "calm"
  | "curious"
  | "playful"
  | "serious"
  | "tense"
  | "down";

export interface ConversationMessage {
  id: string;
  channelId: string;
  authorType: "user" | "character" | "system";
  authorId: string;
  text: string;
  timestamp: string;
}

export type MemoryScope = "short-term" | "episodic" | "long-term";

export interface MemoryRecord {
  id: string;
  scope: MemoryScope;
  characterIds: string[];
  summary: string;
  createdAt: string;
  sourceType: "user" | "character" | "source" | "system";
  sourceRef: string;
  salience: number;
}

export interface RelationshipDimensions {
  familiarity: number;
  trust: number;
  warmth: number;
  tension: number;
  curiosity: number;
  influence: number;
}

export interface CharacterViewModel {
  id: string;
  name: string;
  title?: string;
  visible: boolean;
  active: boolean;
  speaking: boolean;
  focused: boolean;
  mood: CharacterMood;
  energy: number;
  currentTopic?: string;
  affinitySummary: string;
  live2d: {
    modelId: string;
    expression?: string;
    motion?: string;
    status: "loading" | "ready" | "fallback" | "error";
    modelUrl?: string;
    posterUrl?: string;
    detail?: string;
  };
}

export interface ConversationViewModel {
  activeChannelId: string;
  participants: string[];
  messages: ConversationMessage[];
  generatingCharacterIds: string[];
  inputLocked: boolean;
}

export interface RelationshipViewModel {
  edges: Array<RelationshipEdge & { summary: string }>;
  recentChanges: string[];
}

export interface ResourceViewModel {
  model: ProviderStatus;
  storage: ProviderStatus;
  source: ProviderStatus;
  live2d: Array<{
    characterId: string;
    status: "loading" | "ready" | "fallback" | "error";
    detail?: string;
  }>;
  capability: CapabilityProfile;
}

export interface WorldViewModel {
  worldId: string;
  name: string;
  lifecycle: EngineLifecycleState;
  capabilityTier: CapabilityProfile["performanceTier"];
  activeCharacterCount: number;
  visibleCharacterCount: number;
  enabledSourceCount: number;
  warnings: string[];
  errors: EngineError[];
}

export interface EngineSnapshot {
  worldId: string;
  exportedAt: string;
  conversation: ConversationMessage[];
  memories: MemoryRecord[];
  relationships: RelationshipEdge[];
  characterState: Array<{
    characterId: string;
    mood: CharacterMood;
    energy: number;
    visible: boolean;
    focused: boolean;
    active: boolean;
    currentTopic?: string;
  }>;
  sourceState: Array<{
    bindingId: string;
    enabled: boolean;
    lastFetchedAt?: string;
    lastStatus?: "success" | "empty" | "error";
    lastError?: string;
    lastItems: SourceItem[];
  }>;
}

export interface EngineHandle {
  start(): Promise<void>;
  pause(): void;
  resume(): Promise<void>;
  destroy(): Promise<void>;
  dispatch(command: EngineCommand): Promise<void>;
  subscribe(listener: (event: EngineEvent) => void): () => void;
  getViewModel(name: "world"): WorldViewModel;
  getViewModel(name: "characters"): CharacterViewModel[];
  getViewModel(name: "conversation"): ConversationViewModel;
  getViewModel(name: "relationships"): RelationshipViewModel;
  getViewModel(name: "resources"): ResourceViewModel;
  getCapabilityProfile(): CapabilityProfile;
  exportState(): EngineSnapshot;
  importState(snapshot: EngineSnapshot): Promise<void>;
}

export interface ResolvedCharacter {
  instanceId: string;
  pack: CharacterPack;
  name: string;
  title?: string;
  mood: CharacterMood;
  energy: number;
  visible: boolean;
  focused: boolean;
  active: boolean;
  speaking: boolean;
  focusPriority: number;
  currentTopic?: string;
  affinitySummary: string;
  modelUrl?: string;
  posterUrl?: string;
  live2dStatus: "loading" | "ready" | "fallback" | "error";
  live2dDetail?: string;
}

export interface ResolvedWorld {
  pack: WorldPack;
  characters: Record<string, ResolvedCharacter>;
  sourcePacks: Record<string, SourcePack>;
  sourceBindings: Record<
    string,
    {
      bindingId: string;
      sourcePackId: string;
      enabled: boolean;
      deliverTo: string[];
      sharedChannels: string[];
      priorityMode: "normal" | "boosted" | "background";
      lastFetchedAt?: string;
      lastStatus?: "success" | "empty" | "error";
      lastError?: string;
      lastItems: SourceItem[];
    }
  >;
  relationships: RelationshipEdge[];
  channels: Array<{
    id: string;
    kind: "direct" | "group" | "ambient";
    participants: string[];
    default: boolean;
  }>;
}
