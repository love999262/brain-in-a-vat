import { XMLParser } from "fast-xml-parser";

import type { AssetProvider, SourceItem, SourceProvider, SourceRefreshResult } from "@brain-vat/engine-core";
import type { SourcePack } from "@brain-vat/config-schema";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true
});

function normalizeItems(items: unknown[]): SourceItem[] {
  const normalized: SourceItem[] = [];

  items.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const record = item as Record<string, unknown>;
    const title = String(record.title ?? record.headline ?? `未命名条目 ${index + 1}`);
    const summary = String(record.summary ?? record.description ?? record.content ?? title);
    const url = record.url ? String(record.url) : record.link ? String(record.link) : undefined;
    const publishedAt = record.publishedAt
      ? String(record.publishedAt)
      : record.pubDate
        ? String(record.pubDate)
        : undefined;
    const tags = Array.isArray(record.tags) ? record.tags.map(String) : undefined;

    normalized.push({
      id: String(record.id ?? record.guid ?? record.link ?? `${title}-${index}`),
      title,
      summary,
      content: record.content ? String(record.content) : undefined,
      url,
      publishedAt,
      tags,
      category: record.category ? String(record.category) : undefined,
      credibility: typeof record.credibility === "number" ? record.credibility : undefined
    });
  });

  return normalized;
}

function parseRssText(xmlText: string): SourceItem[] {
  const parsed = parser.parse(xmlText) as Record<string, unknown>;
  const rssItems = ((parsed.rss as { channel?: { item?: unknown[] | unknown } } | undefined)?.channel?.item ??
    []) as unknown[] | unknown;
  const atomItems = ((parsed.feed as { entry?: unknown[] | unknown } | undefined)?.entry ?? []) as
    | unknown[]
    | unknown;

  const items = Array.isArray(rssItems)
    ? rssItems
    : rssItems
      ? [rssItems]
      : Array.isArray(atomItems)
        ? atomItems
        : atomItems
          ? [atomItems]
          : [];

  return normalizeItems(items);
}

async function fetchJsonItems(url: string): Promise<SourceItem[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`);
  }

  const data = (await response.json()) as unknown;
  if (Array.isArray(data)) {
    return normalizeItems(data);
  }

  if (typeof data === "object" && data !== null) {
    const record = data as Record<string, unknown>;
    if (Array.isArray(record.items)) {
      return normalizeItems(record.items);
    }
  }

  return [];
}

async function fetchTextItems(url: string): Promise<SourceItem[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`请求失败：${response.status}`);
  }

  return parseRssText(await response.text());
}

async function loadFallbackItems(sourcePack: SourcePack, assetProvider: AssetProvider): Promise<SourceItem[]> {
  const fallbackItemsFile = (sourcePack.manifest.extensions?.fallbackItemsFile as string | undefined) ?? "";
  if (!fallbackItemsFile) {
    return [];
  }

  const url = assetProvider.resolveAssetUrl(sourcePack.manifestPath, fallbackItemsFile);
  const response = await fetch(url);
  if (!response.ok) {
    return [];
  }

  return normalizeItems((await response.json()) as unknown[]);
}

async function fetchSourceItems(sourcePack: SourcePack): Promise<SourceItem[]> {
  if (sourcePack.manifest.access.mode !== "browser-direct") {
    return [];
  }

  const endpoint = sourcePack.manifest.endpoints[0];
  if (!endpoint) {
    return [];
  }

  if (endpoint.format === "jsonfeed" || sourcePack.manifest.sourceType === "jsonfeed") {
    return fetchJsonItems(endpoint.url);
  }

  if (endpoint.format === "manual" || sourcePack.manifest.sourceType === "manual") {
    return [];
  }

  return fetchTextItems(endpoint.url);
}

export function createRssSourceProvider(): SourceProvider {
  return {
    name: "RSS 消息源",
    async refreshSource({ sourcePack, assetProvider }): Promise<SourceRefreshResult> {
      const fetchedAt = new Date().toISOString();

      try {
        const items = await fetchSourceItems(sourcePack);
        if (items.length > 0) {
          return {
            status: "success",
            items,
            fetchedAt
          };
        }

        const fallbackItems = await loadFallbackItems(sourcePack, assetProvider);
        return {
          status: fallbackItems.length > 0 ? "success" : "empty",
          items: fallbackItems,
          fetchedAt,
          errorMessage:
            sourcePack.manifest.access.mode === "browser-direct"
              ? undefined
              : "当前源在纯浏览器演示模式下使用本地回退快照。"
        };
      } catch (error) {
        const fallbackItems = await loadFallbackItems(sourcePack, assetProvider);
        if (fallbackItems.length > 0) {
          return {
            status: "success",
            items: fallbackItems,
            fetchedAt,
            errorMessage: error instanceof Error ? error.message : "源刷新失败，已使用本地回退数据。"
          };
        }

        return {
          status: "error",
          items: [],
          fetchedAt,
          errorMessage: error instanceof Error ? error.message : "源刷新失败"
        };
      }
    }
  };
}
