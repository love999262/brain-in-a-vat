import { resolveSiblingPath } from "@brain-vat/shared";
import { z } from "zod";

import { PackValidationError } from "./errors.js";
import {
  castEntrySchema,
  characterManifestSchema,
  memoryProfileSchema,
  normalizationSchema,
  personaSchema,
  relationshipEdgeSchema,
  relationshipProfileSchema,
  renderManifestSchema,
  sceneSchema,
  sourceAffinitySchema,
  sourceFiltersSchema,
  sourceManifestSchema,
  sourceRoutingSchema,
  uiHintsSchema,
  worldManifestSchema,
  worldSourceBindingSchema
} from "./schemas.js";
import type { CharacterPack, PackFileReader, SourcePack, WorldPack } from "./types.js";

function parseWithSchema<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  input: unknown,
  context: string
): z.output<TSchema> {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw new PackValidationError(
      `Pack 校验失败：${context}`,
      result.error.issues.map((issue) => ({
        code: "SCHEMA_INVALID",
        message: issue.message,
        path: issue.path.map(String)
      }))
    );
  }

  return result.data;
}

function ensureUniqueValues(values: readonly string[], kind: string): void {
  const seen = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      throw new PackValidationError(`${kind} 出现重复标识`, [
        {
          code: "DUPLICATE_ID",
          message: `${kind} "${value}" 重复`,
          path: [kind]
        }
      ]);
    }

    seen.add(value);
  }
}

export async function loadCharacterPack(reader: PackFileReader, manifestPath: string): Promise<CharacterPack> {
  const manifest = parseWithSchema(
    characterManifestSchema,
    await reader.loadJson(manifestPath),
    `${manifestPath}#character.manifest`
  );

  const persona = parseWithSchema(
    personaSchema,
    await reader.loadJson(resolveSiblingPath(manifestPath, manifest.files.persona)),
    `${manifest.id} persona`
  );

  const memoryProfile = parseWithSchema(
    memoryProfileSchema,
    await reader.loadJson(resolveSiblingPath(manifestPath, manifest.files.memoryProfile)),
    `${manifest.id} memory-profile`
  );

  const renderManifest = parseWithSchema(
    renderManifestSchema,
    await reader.loadJson(resolveSiblingPath(manifestPath, manifest.files.renderManifest)),
    `${manifest.id} render-manifest`
  );

  const sourceAffinity = parseWithSchema(
    sourceAffinitySchema,
    await reader.loadJson(resolveSiblingPath(manifestPath, manifest.files.sourceAffinity)),
    `${manifest.id} source-affinity`
  );

  const relationshipProfile = parseWithSchema(
    relationshipProfileSchema,
    await reader.loadJson(resolveSiblingPath(manifestPath, manifest.files.relationshipProfile)),
    `${manifest.id} relationship-profile`
  );

  return {
    manifestPath,
    manifest,
    persona,
    memoryProfile,
    renderManifest,
    sourceAffinity,
    relationshipProfile
  };
}

export async function loadSourcePack(reader: PackFileReader, manifestPath: string): Promise<SourcePack> {
  const manifest = parseWithSchema(
    sourceManifestSchema,
    await reader.loadJson(manifestPath),
    `${manifestPath}#source.manifest`
  );

  const filters = parseWithSchema(
    sourceFiltersSchema,
    await reader.loadJson(resolveSiblingPath(manifestPath, "filters.json")),
    `${manifest.id} filters`
  );
  const routing = parseWithSchema(
    sourceRoutingSchema,
    await reader.loadJson(resolveSiblingPath(manifestPath, "routing.json")),
    `${manifest.id} routing`
  );
  const normalization = parseWithSchema(
    normalizationSchema,
    await reader.loadJson(resolveSiblingPath(manifestPath, "normalization.json")),
    `${manifest.id} normalization`
  );

  return {
    manifestPath,
    manifest,
    filters,
    routing,
    normalization
  };
}

export async function loadWorldPack(reader: PackFileReader, manifestPath: string): Promise<WorldPack> {
  const manifest = parseWithSchema(
    worldManifestSchema,
    await reader.loadJson(manifestPath),
    `${manifestPath}#world.manifest`
  );

  const cast = parseWithSchema(
    z.array(castEntrySchema),
    await reader.loadJson(resolveSiblingPath(manifestPath, "cast.json")),
    `${manifest.id} cast`
  );
  ensureUniqueValues(
    cast.map((entry) => entry.instanceId),
    "cast.instanceId"
  );

  const sources = parseWithSchema(
    z.array(worldSourceBindingSchema),
    await reader.loadJson(resolveSiblingPath(manifestPath, "sources.json")),
    `${manifest.id} sources`
  );
  ensureUniqueValues(
    sources.map((entry) => entry.bindingId),
    "sources.bindingId"
  );

  const relationships = parseWithSchema(
    z.array(relationshipEdgeSchema),
    await reader.loadJson(resolveSiblingPath(manifestPath, "relationships.json")),
    `${manifest.id} relationships`
  );

  const scene = parseWithSchema(
    sceneSchema,
    await reader.loadJson(resolveSiblingPath(manifestPath, "scene.json")),
    `${manifest.id} scene`
  );

  const uiHintsPath = resolveSiblingPath(manifestPath, "ui-hints.json");
  let uiHints = null;

  try {
    uiHints = parseWithSchema(uiHintsSchema, await reader.loadJson(uiHintsPath), `${manifest.id} ui-hints`);
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }
  }

  const castIds = new Set(cast.map((entry) => entry.instanceId));
  relationships.forEach((edge) => {
    if (!castIds.has(edge.from) || !castIds.has(edge.to)) {
      throw new PackValidationError(`${manifest.id} 关系边引用了不存在的角色`, [
        {
          code: "RELATION_REFERENCE_INVALID",
          message: `${edge.from} -> ${edge.to} 引用不存在的角色实例`,
          path: ["relationships"]
        }
      ]);
    }
  });

  Object.entries(Object.fromEntries(sources.map((binding) => [binding.bindingId, binding]))).forEach(() => {
    return;
  });

  for (const binding of sources) {
    for (const characterId of Object.keys(binding.characterOverrides)) {
      if (!castIds.has(characterId)) {
        throw new PackValidationError(`${manifest.id} source override 引用了不存在的角色`, [
          {
            code: "SOURCE_OVERRIDE_TARGET_INVALID",
            message: `source ${binding.bindingId} 引用了不存在的角色 ${characterId}`,
            path: ["sources", binding.bindingId, "characterOverrides", characterId]
          }
        ]);
      }
    }
  }

  return {
    manifestPath,
    manifest,
    cast,
    sources,
    relationships,
    scene,
    uiHints
  };
}
