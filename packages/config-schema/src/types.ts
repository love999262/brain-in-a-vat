import type {
  CastEntry,
  CharacterManifest,
  MemoryProfile,
  NormalizationConfig,
  PersonaProfile,
  RelationshipEdge,
  RelationshipProfile,
  RenderManifest,
  SceneConfig,
  SourceAffinityProfile,
  SourceFilters,
  SourceManifest,
  SourceRouting,
  UiHints,
  WorldManifest,
  WorldSourceBinding
} from "./schemas.js";

export interface CharacterPack {
  manifestPath: string;
  manifest: CharacterManifest;
  persona: PersonaProfile;
  memoryProfile: MemoryProfile;
  renderManifest: RenderManifest;
  sourceAffinity: SourceAffinityProfile;
  relationshipProfile: RelationshipProfile;
}

export interface SourcePack {
  manifestPath: string;
  manifest: SourceManifest;
  filters: SourceFilters;
  routing: SourceRouting;
  normalization: NormalizationConfig;
}

export interface WorldPack {
  manifestPath: string;
  manifest: WorldManifest;
  cast: CastEntry[];
  sources: WorldSourceBinding[];
  relationships: RelationshipEdge[];
  scene: SceneConfig;
  uiHints: UiHints | null;
}

export interface PackFileReader {
  loadJson(path: string): Promise<unknown>;
}
