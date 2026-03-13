import { createLeaderCoordinator, createBrowserAssetProvider, detectBrowserCapabilityProfile, observePageVisibility } from "@brain-vat/browser-runtime";
import { createEngine } from "@brain-vat/engine-core";
import { createIndexedDbStorageProvider } from "@brain-vat/provider-indexeddb";
import { createRssSourceProvider } from "@brain-vat/provider-rss";
import { createWebLlmModelProvider } from "@brain-vat/provider-webllm";
import { registerBrainVatWorldElement } from "@brain-vat/web-components";

registerBrainVatWorldElement();

const host = document.getElementById("app");
if (!(host instanceof HTMLElement)) {
  throw new Error("未找到 brain-vat-world 挂载点。");
}

const capabilityProfile = await detectBrowserCapabilityProfile("auto");
const leader = createLeaderCoordinator("official-demo");
if (!leader.isLeader()) {
  capabilityProfile.notes.push("当前标签页不是主实例，适合用来观察世界状态。");
}

window.addEventListener("beforeunload", () => {
  leader.release();
});

const engine = createEngine({
  apiVersion: "1.0",
  world: {
    type: "pack-ref",
    id: "official/demo-world"
  },
  assets: {
    baseUrl: "/packs"
  },
  providers: {
    model: createWebLlmModelProvider(),
    asset: createBrowserAssetProvider({
      baseUrl: `${window.location.origin}/packs/`
    }),
    storage: createIndexedDbStorageProvider(),
    source: createRssSourceProvider()
  },
  persistence: {
    namespace: "official-demo",
    restorePreviousState: true
  },
  runtime: {
    surface: "standalone",
    autoStart: true,
    debug: true,
    performancePreset: "balanced",
    deviceProfileHint: capabilityProfile.deviceProfile
  },
  extensions: {
    capabilityProfile
  }
});

observePageVisibility((visible: boolean) => {
  if (!visible) {
    engine.pause();
    return;
  }
  void engine.resume();
});

(host as HTMLElement & { engine?: typeof engine }).engine = engine;
