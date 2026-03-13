import path from "node:path";
import { readFile } from "node:fs/promises";

import { loadCharacterPack, loadSourcePack, loadWorldPack } from "@brain-vat/config-schema";
import { describe, expect, it } from "vitest";

import { createEngine } from "./index.js";
import type { AssetProvider, ModelProvider, ProviderStatus, SourceProvider, StorageProvider } from "./types.js";

function createFileReader() {
  return {
    async loadJson(filePath: string): Promise<unknown> {
      const absolutePath = path.resolve(process.cwd(), "../..", filePath);
      const content = await readFile(absolutePath, "utf8");
      return JSON.parse(content) as unknown;
    }
  };
}

function createFsAssetProvider(): AssetProvider {
  const reader = createFileReader();

  return {
    name: "test-asset-provider",
    getWorldPack(id) {
      return loadWorldPack(reader, `worlds/official/${id.split("/")[1]}/world.manifest.json`);
    },
    getCharacterPack(id) {
      const [, name] = id.split("/");
      return loadCharacterPack(reader, `characters/official/${name}/character.manifest.json`);
    },
    getSourcePack(id) {
      const [, name] = id.split("/");
      return loadSourcePack(reader, `sources/official/${name}/source.manifest.json`);
    },
    resolveAssetUrl(manifestPath, assetPath) {
      return `${manifestPath}#${assetPath}`;
    }
  };
}

function createMockModelProvider(): ModelProvider {
  let status: ProviderStatus = {
    status: "ready",
    label: "mock-model"
  };

  return {
    name: "mock-model",
    getStatus() {
      return status;
    },
    async generate(input) {
      return {
        text: `${input.characterName}：我收到你的话题了，先从 ${input.personaSummary} 这条线继续展开。`,
        provider: status.label,
        degraded: false
      };
    }
  };
}

function createMemoryStorageProvider(): StorageProvider {
  const state = new Map<string, unknown>();

  return {
    name: "memory-storage",
    async restore(namespace) {
      return (state.get(namespace) as never) ?? null;
    },
    async save(namespace, snapshot) {
      state.set(namespace, snapshot);
    },
    async clear(namespace) {
      state.delete(namespace);
    }
  };
}

function createMockSourceProvider(): SourceProvider {
  return {
    name: "mock-source",
    async refreshSource({ bindingId }) {
      return {
        status: "success",
        fetchedAt: new Date().toISOString(),
        items: [
          {
            id: `${bindingId}-item-1`,
            title: "测试条目",
            summary: "这是一条给引擎测试用的消息源条目。"
          }
        ]
      };
    }
  };
}

describe("BrainVatEngine", () => {
  it("loads the demo world, ingests sources, and produces replies", async () => {
    const engine = createEngine({
      apiVersion: "1.0",
      world: {
        type: "pack-ref",
        id: "official/demo-world"
      },
      providers: {
        model: createMockModelProvider(),
        asset: createFsAssetProvider(),
        storage: createMemoryStorageProvider(),
        source: createMockSourceProvider()
      },
      persistence: {
        namespace: "test-world",
        restorePreviousState: false
      },
      runtime: {
        autoStart: false,
        surface: "standalone"
      }
    });

    await engine.dispatch({
      type: "engine.loadWorld",
      requestId: "req-load",
      payload: {
        world: {
          type: "pack-ref",
          id: "official/demo-world"
        }
      }
    });
    await engine.dispatch({
      type: "engine.start",
      requestId: "req-start",
      payload: {}
    });
    await engine.dispatch({
      type: "conversation.sendMessage",
      requestId: "req-chat",
      payload: {
        message: "今天我们先聊电影还是科技？",
        targetCharacterIds: ["char-mao", "char-jin"]
      }
    });

    const conversation = engine.getViewModel("conversation");
    const snapshot = engine.exportState();
    const relationships = engine.getViewModel("relationships");

    expect(conversation.messages.length).toBeGreaterThanOrEqual(3);
    expect(snapshot.memories.length).toBeGreaterThan(0);
    expect(snapshot.sourceState.some((entry) => entry.lastItems.length > 0)).toBe(true);
    expect(relationships.edges.length).toBeGreaterThan(0);
  });
});
