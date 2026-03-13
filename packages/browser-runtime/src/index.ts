import { loadCharacterPack, loadSourcePack, loadWorldPack } from "@brain-vat/config-schema";
import type { AssetProvider, CapabilityProfile, DeviceProfileHint } from "@brain-vat/engine-core";
import { resolveSiblingPath } from "@brain-vat/shared";

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

function buildPackManifestPath(kind: "character" | "source" | "world", id: string): string {
  const [namespace, name] = id.split("/");
  if (!namespace || !name) {
    throw new Error(`无效的 Pack 标识：${id}`);
  }

  const folder = kind === "world" ? "worlds" : `${kind}s`;
  const file =
    kind === "world" ? "world.manifest.json" : kind === "source" ? "source.manifest.json" : "character.manifest.json";

  return `${folder}/${namespace}/${name}/${file}`;
}

function createJsonReader(baseUrl: string) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  return {
    async loadJson(path: string): Promise<unknown> {
      const url = new URL(path, normalizedBaseUrl).toString();
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`资源加载失败：${url}`);
      }

      return response.json();
    }
  };
}

export function createBrowserAssetProvider(options: { baseUrl?: string } = {}): AssetProvider {
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? "/packs");
  const reader = createJsonReader(baseUrl);

  return {
    name: "browser-asset-provider",
    async getWorldPack(id) {
      return loadWorldPack(reader, buildPackManifestPath("world", id));
    },
    async getCharacterPack(id) {
      return loadCharacterPack(reader, buildPackManifestPath("character", id));
    },
    async getSourcePack(id) {
      return loadSourcePack(reader, buildPackManifestPath("source", id));
    },
    resolveAssetUrl(manifestPath, assetPath) {
      return new URL(resolveSiblingPath(manifestPath, assetPath), baseUrl).toString();
    }
  };
}

export async function detectBrowserCapabilityProfile(
  deviceProfileHint: DeviceProfileHint = "auto"
): Promise<CapabilityProfile> {
  const hasNavigator = typeof navigator !== "undefined";
  const nav = hasNavigator ? (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }) : undefined;
  const notes: string[] = [];
  const profile: CapabilityProfile = {
    webGpuSupported: Boolean(nav?.gpu),
    webGpuAvailable: false,
    deviceProfile: deviceProfileHint,
    performanceTier: "medium",
    estimatedVisibleCharacterBudget: 2,
    estimatedActiveCharacterBudget: 3,
    degradationState: "none",
    notes
  };

  if (!hasNavigator) {
    notes.push("当前环境没有浏览器 navigator，能力探测已降级。");
    return profile;
  }

  if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
    profile.deviceProfile = deviceProfileHint === "auto" ? "mobile" : deviceProfileHint;
    profile.performanceTier = "low";
    profile.estimatedVisibleCharacterBudget = 1;
    profile.estimatedActiveCharacterBudget = 2;
    profile.degradationState = "safe";
    notes.push("检测到移动设备，默认进入保守档位。");
  } else if (deviceProfileHint === "auto") {
    profile.deviceProfile = "desktop";
  }

  if (profile.webGpuSupported) {
    try {
      const adapter = await nav?.gpu?.requestAdapter();
      profile.webGpuAvailable = Boolean(adapter);
      if (!adapter) {
        profile.degradationState = "lite";
        notes.push("浏览器支持 WebGPU，但当前没有可用适配器。");
      }
    } catch (error) {
      profile.degradationState = "lite";
      notes.push(error instanceof Error ? error.message : "WebGPU 探测失败。");
    }
  } else {
    profile.degradationState = "lite";
    notes.push("当前浏览器不支持 WebGPU。");
  }

  if (typeof navigator !== "undefined" && "deviceMemory" in navigator) {
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
    if (deviceMemory <= 4) {
      profile.performanceTier = "low";
      profile.estimatedVisibleCharacterBudget = 1;
      profile.estimatedActiveCharacterBudget = 2;
      profile.degradationState = profile.degradationState === "none" ? "lite" : profile.degradationState;
    } else if (deviceMemory >= 8) {
      profile.performanceTier = "high";
      profile.estimatedVisibleCharacterBudget = 3;
      profile.estimatedActiveCharacterBudget = 5;
    }
  }

  return profile;
}

export function observePageVisibility(onChange: (visible: boolean) => void): () => void {
  if (typeof document === "undefined") {
    return () => undefined;
  }

  const handler = () => {
    onChange(document.visibilityState === "visible");
  };
  document.addEventListener("visibilitychange", handler);
  handler();

  return () => {
    document.removeEventListener("visibilitychange", handler);
  };
}

export interface LeaderCoordinator {
  id: string;
  isLeader(): boolean;
  release(): void;
}

export function createLeaderCoordinator(namespace: string): LeaderCoordinator {
  const id = `leader_${Math.random().toString(36).slice(2, 10)}`;
  const key = `brain-vat:${namespace}:leader`;

  const claim = () => {
    try {
      const current = localStorage.getItem(key);
      if (!current) {
        localStorage.setItem(key, id);
        return;
      }
    } catch {
      return;
    }
  };

  claim();

  return {
    id,
    isLeader() {
      try {
        return localStorage.getItem(key) === id;
      } catch {
        return true;
      }
    },
    release() {
      try {
        if (localStorage.getItem(key) === id) {
          localStorage.removeItem(key);
        }
      } catch {
        return;
      }
    }
  };
}
