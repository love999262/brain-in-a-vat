import { createEngine, type CharacterViewModel, type EngineHandle, type InitConfig } from "@brain-vat/engine-core";
import { mountLive2D, type Live2DMountedInstance } from "@brain-vat/renderer-live2d";

const TEMPLATE_STYLE = `
  :host {
    display: block;
    color: #0f172a;
    font-family: "Georgia", "Times New Roman", serif;
  }

  .shell {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.9fr);
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(248, 213, 162, 0.35), transparent 28%),
      radial-gradient(circle at top right, rgba(176, 218, 255, 0.35), transparent 24%),
      linear-gradient(180deg, #f6efe4 0%, #eef4fb 100%);
  }

  .main {
    display: grid;
    grid-template-rows: auto 1fr auto;
    gap: 20px;
    padding: 24px;
  }

  .hero, .sidebar-card, .composer, .messages {
    background: rgba(255, 255, 255, 0.76);
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 24px;
    backdrop-filter: blur(12px);
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  }

  .hero {
    padding: 22px;
  }

  .hero h1 {
    margin: 0 0 8px;
    font-size: 30px;
  }

  .hero p {
    margin: 0;
    color: #475569;
    line-height: 1.5;
  }

  .stage {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }

  .character-card {
    display: grid;
    gap: 12px;
    padding: 16px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.84);
    border: 1px solid rgba(15, 23, 42, 0.08);
  }

  .character-stage {
    position: relative;
    min-height: 280px;
    border-radius: 18px;
    overflow: hidden;
    background: linear-gradient(180deg, rgba(255, 247, 234, 0.9), rgba(226, 236, 249, 0.95));
  }

  .brain-vat-live2d-fallback,
  .brain-vat-live2d-canvas {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .character-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .character-header h2 {
    margin: 0;
    font-size: 22px;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 12px;
    background: rgba(15, 23, 42, 0.08);
    color: #334155;
  }

  .meta {
    color: #475569;
    font-size: 13px;
    line-height: 1.5;
  }

  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  button, select, textarea, input[type="file"] {
    font: inherit;
  }

  button {
    border: 0;
    border-radius: 999px;
    padding: 10px 16px;
    background: #0f172a;
    color: white;
    cursor: pointer;
  }

  button.ghost {
    background: rgba(15, 23, 42, 0.08);
    color: #0f172a;
  }

  .messages {
    padding: 18px;
    min-height: 280px;
    max-height: 420px;
    overflow: auto;
  }

  .message-list {
    display: grid;
    gap: 12px;
  }

  .message {
    display: grid;
    gap: 4px;
    padding: 12px 14px;
    border-radius: 18px;
    background: rgba(15, 23, 42, 0.04);
  }

  .message[data-role="user"] {
    background: rgba(201, 223, 255, 0.45);
  }

  .message[data-role="character"] {
    background: rgba(255, 234, 204, 0.55);
  }

  .message-meta {
    font-size: 12px;
    color: #64748b;
  }

  .composer {
    padding: 18px;
    display: grid;
    gap: 12px;
  }

  .composer-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }

  select, textarea {
    border: 1px solid rgba(15, 23, 42, 0.12);
    border-radius: 16px;
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.9);
  }

  textarea {
    min-height: 96px;
    resize: vertical;
    width: 100%;
  }

  .sidebar {
    display: grid;
    align-content: start;
    gap: 16px;
    padding: 24px 24px 24px 0;
  }

  .sidebar-card {
    padding: 18px;
  }

  .sidebar-card h3 {
    margin: 0 0 12px;
    font-size: 20px;
  }

  .kv-list, .relation-list {
    display: grid;
    gap: 10px;
  }

  .kv-item strong, .relation-item strong {
    display: block;
    margin-bottom: 4px;
  }

  @media (max-width: 1080px) {
    .shell {
      grid-template-columns: 1fr;
    }

    .sidebar {
      padding: 0 24px 24px;
    }
  }
`;

export class BrainVatWorldElement extends HTMLElement {
  private engineHandle: EngineHandle | null = null;
  private initConfigValue: InitConfig | null = null;
  private unsubscribe: (() => void) | null = null;
  private live2dInstances = new Map<string, Live2DMountedInstance>();
  private targetMode = "__group__";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  set engine(value: EngineHandle | null) {
    this.engineHandle = value;
    void this.connectEngine();
  }

  get engine(): EngineHandle | null {
    return this.engineHandle;
  }

  set initConfig(value: InitConfig | null) {
    this.initConfigValue = value;
    if (!this.engineHandle && value) {
      this.engineHandle = createEngine(value);
    }
    void this.connectEngine();
  }

  get initConfig(): InitConfig | null {
    return this.initConfigValue;
  }

  connectedCallback(): void {
    void this.connectEngine();
  }

  disconnectedCallback(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.live2dInstances.forEach((instance) => instance.destroy());
    this.live2dInstances.clear();
  }

  private async connectEngine(): Promise<void> {
    if (!this.isConnected || !this.engineHandle) {
      return;
    }

    this.unsubscribe?.();
    this.unsubscribe = this.engineHandle.subscribe(() => {
      this.render();
    });
    this.render();
  }

  private render(): void {
    if (!this.shadowRoot) {
      return;
    }

    if (!this.engineHandle) {
      this.shadowRoot.innerHTML = `<style>${TEMPLATE_STYLE}</style><div class="main"><p>等待引擎挂载…</p></div>`;
      return;
    }

    let world;
    let characters;
    let conversation;
    let relationships;
    let resources;

    try {
      world = this.engineHandle.getViewModel("world");
      characters = this.engineHandle.getViewModel("characters");
      conversation = this.engineHandle.getViewModel("conversation");
      relationships = this.engineHandle.getViewModel("relationships");
      resources = this.engineHandle.getViewModel("resources");
    } catch {
      this.shadowRoot.innerHTML = `<style>${TEMPLATE_STYLE}</style><div class="main"><section class="hero"><h1>Brain-in-a-Vat Engine</h1><p>世界正在装配中，请稍候…</p></section></div>`;
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>${TEMPLATE_STYLE}</style>
      <div class="shell">
        <div class="main">
          <section class="hero">
            <h1>${world.name}</h1>
            <p>当前阶段：${world.lifecycle} · 可视角色 ${world.visibleCharacterCount} / 活跃角色 ${world.activeCharacterCount} · 启用消息源 ${world.enabledSourceCount}</p>
          </section>

          <section class="stage">
            ${characters.map((character) => this.renderCharacterCard(character)).join("")}
          </section>

          <section class="messages">
            <div class="message-list">
              ${conversation.messages.map((message) => this.renderMessage(message)).join("")}
            </div>
          </section>

          <section class="composer">
            <div class="composer-row">
              <select id="targetMode">
                <option value="__group__"${this.targetMode === "__group__" ? " selected" : ""}>群聊</option>
                ${characters
                  .map(
                    (character) =>
                      `<option value="${character.id}"${this.targetMode === character.id ? " selected" : ""}>${character.name}</option>`
                  )
                  .join("")}
              </select>
              <button class="ghost" id="refreshSources">刷新消息源</button>
              <button class="ghost" id="exportState">导出状态</button>
              <label class="chip">
                导入状态
                <input id="importState" type="file" accept="application/json" hidden />
              </label>
            </div>
            <textarea id="messageInput" placeholder="输入你想对这个世界说的话…" ${
              conversation.inputLocked ? "disabled" : ""
            }></textarea>
            <div class="composer-row">
              <button id="sendMessage" ${conversation.inputLocked ? "disabled" : ""}>发送消息</button>
              <span class="meta">${conversation.generatingCharacterIds.length > 0 ? `正在生成：${conversation.generatingCharacterIds.join("、")}` : "世界空闲中"}</span>
            </div>
          </section>
        </div>

        <aside class="sidebar">
          <section class="sidebar-card">
            <h3>关系摘要</h3>
            <div class="relation-list">
              ${relationships.edges.map((edge) => `<div class="relation-item"><strong>${edge.from} → ${edge.to}</strong><span>${edge.summary}</span></div>`).join("")}
            </div>
          </section>
          <section class="sidebar-card">
            <h3>资源状态</h3>
            <div class="kv-list">
              <div class="kv-item"><strong>模型</strong><span>${resources.model.label}${resources.model.details ? ` · ${resources.model.details}` : ""}</span></div>
              <div class="kv-item"><strong>存储</strong><span>${resources.storage.label}${resources.storage.details ? ` · ${resources.storage.details}` : ""}</span></div>
              <div class="kv-item"><strong>消息源</strong><span>${resources.source.label}${resources.source.details ? ` · ${resources.source.details}` : ""}</span></div>
              <div class="kv-item"><strong>能力档位</strong><span>${resources.capability.performanceTier} · ${resources.capability.notes.join("；") || "运行正常"}</span></div>
            </div>
          </section>
          <section class="sidebar-card">
            <h3>角色状态</h3>
            <div class="kv-list">
              ${characters
                .map(
                  (character) =>
                    `<div class="kv-item"><strong>${character.name}</strong><span>心境 ${character.mood} · 精力 ${character.energy.toFixed(2)} · ${character.affinitySummary}</span></div>`
                )
                .join("")}
            </div>
          </section>
        </aside>
      </div>
    `;

    this.bindInteractions(characters);
    void this.syncLive2D(characters);
  }

  private renderCharacterCard(character: CharacterViewModel): string {
    return `
      <article class="character-card">
        <div class="character-stage" data-live2d-stage="${character.id}"></div>
        <div class="character-header">
          <div>
            <h2>${character.name}</h2>
            <div class="meta">${character.title ?? ""}</div>
          </div>
          <span class="chip">${character.focused ? "焦点角色" : character.speaking ? "回复中" : character.mood}</span>
        </div>
        <div class="meta">
          精力 ${character.energy.toFixed(2)} · ${character.currentTopic ? `当前话题：${character.currentTopic}` : "等待新话题"}<br />
          ${character.affinitySummary}
        </div>
        <div class="actions">
          <button class="ghost" data-focus="${character.id}">聚焦</button>
        </div>
      </article>
    `;
  }

  private renderMessage(message: { authorType: string; authorId: string; text: string; timestamp: string }): string {
    return `
      <div class="message" data-role="${message.authorType}">
        <div class="message-meta">${message.authorId} · ${new Date(message.timestamp).toLocaleTimeString()}</div>
        <div>${message.text}</div>
      </div>
    `;
  }

  private bindInteractions(characters: CharacterViewModel[]): void {
    const root = this.shadowRoot;
    if (!root || !this.engineHandle) {
      return;
    }

    const sendButton = root.getElementById("sendMessage");
    const textarea = root.getElementById("messageInput") as HTMLTextAreaElement | null;
    const targetSelect = root.getElementById("targetMode") as HTMLSelectElement | null;
    const refreshSources = root.getElementById("refreshSources");
    const exportState = root.getElementById("exportState");
    const importState = root.getElementById("importState") as HTMLInputElement | null;

    targetSelect?.addEventListener("change", () => {
      this.targetMode = targetSelect.value;
    });

    sendButton?.addEventListener("click", async () => {
      if (!textarea || !textarea.value.trim()) {
        return;
      }

      const targetCharacterIds = this.targetMode === "__group__" ? characters.map((character) => character.id) : [this.targetMode];
      const message = textarea.value.trim();
      textarea.value = "";
      await this.engineHandle?.dispatch({
        type: "conversation.sendMessage",
        requestId: `req_${Date.now()}`,
        payload: {
          message,
          targetCharacterIds
        }
      });
    });

    refreshSources?.addEventListener("click", async () => {
      await this.engineHandle?.dispatch({
        type: "source.refresh",
        requestId: `req_${Date.now()}`,
        payload: {}
      });
    });

    exportState?.addEventListener("click", () => {
      const snapshot = this.engineHandle?.exportState();
      if (!snapshot) {
        return;
      }
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "brain-vat-state.json";
      anchor.click();
      URL.revokeObjectURL(url);
    });

    importState?.parentElement?.addEventListener("click", () => {
      importState.click();
    });

    importState?.addEventListener("change", async () => {
      const file = importState.files?.[0];
      if (!file) {
        return;
      }
      const snapshot = JSON.parse(await file.text()) as ReturnType<EngineHandle["exportState"]>;
      await this.engineHandle?.importState(snapshot);
      importState.value = "";
    });

    root.querySelectorAll<HTMLButtonElement>("[data-focus]").forEach((button) => {
      button.addEventListener("click", async () => {
        const characterId = button.dataset.focus;
        if (!characterId) {
          return;
        }
        await this.engineHandle?.dispatch({
          type: "scene.focusCharacter",
          requestId: `req_${Date.now()}`,
          payload: {
            characterId
          }
        });
      });
    });
  }

  private async syncLive2D(characters: CharacterViewModel[]): Promise<void> {
    if (!this.shadowRoot) {
      return;
    }

    const seen = new Set<string>();
    for (const character of characters) {
      const container = this.shadowRoot.querySelector<HTMLElement>(`[data-live2d-stage="${character.id}"]`);
      if (!container) {
        continue;
      }
      seen.add(character.id);

      const current = this.live2dInstances.get(character.id);
      if (current) {
        await current.update(character);
        continue;
      }

      const mounted = await mountLive2D(container, character);
      this.live2dInstances.set(character.id, mounted);
    }

    [...this.live2dInstances.entries()].forEach(([characterId, instance]) => {
      if (!seen.has(characterId)) {
        instance.destroy();
        this.live2dInstances.delete(characterId);
      }
    });
  }
}

export function registerBrainVatWorldElement(): void {
  if (!customElements.get("brain-vat-world")) {
    customElements.define("brain-vat-world", BrainVatWorldElement);
  }
}
