import path from "node:path";
import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { PackValidationError } from "./errors.js";
import { loadCharacterPack, loadSourcePack, loadWorldPack } from "./loaders.js";

function createFileReader() {
  return {
    async loadJson(filePath: string): Promise<unknown> {
      const absolutePath = path.resolve(process.cwd(), "../..", filePath);
      const content = await readFile(absolutePath, "utf8");
      return JSON.parse(content) as unknown;
    }
  };
}

describe("pack loaders", () => {
  it("loads official character, source, and world packs", async () => {
    const reader = createFileReader();

    const characterPack = await loadCharacterPack(
      reader,
      "characters/official/niziiro-mao/character.manifest.json"
    );
    const sourcePack = await loadSourcePack(reader, "sources/official/entertainment-feed/source.manifest.json");
    const worldPack = await loadWorldPack(reader, "worlds/official/demo-world/world.manifest.json");

    expect(characterPack.manifest.id).toBe("official/niziiro-mao");
    expect(sourcePack.manifest.id).toBe("official/entertainment-feed");
    expect(worldPack.manifest.id).toBe("official/demo-world");
    expect(worldPack.cast).toHaveLength(3);
  });

  it("returns structured validation errors for invalid pack data", async () => {
    const reader = {
      async loadJson(): Promise<unknown> {
        return {};
      }
    };

    await expect(loadWorldPack(reader, "worlds/bad-world/world.manifest.json")).rejects.toBeInstanceOf(
      PackValidationError
    );
  });
});
