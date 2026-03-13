import { z } from "zod";

const packIdSchema = z.string().regex(/^[a-z0-9-]+\/[a-z0-9-]+$/);
const instanceIdSchema = z.string().regex(/^[a-z0-9-]+$/);
const versionSchema = z.string().min(1);
const weightSchema = z.number().min(0).max(1);
const boostSchema = z.number().min(-1).max(1);
const nonEmptyStringSchema = z.string().min(1);
const relativePathSchema = z.string().min(1);

const manifestBaseSchema = z.object({
  id: packIdSchema,
  name: z.string().min(1).max(80),
  version: versionSchema,
  schemaVersion: z.literal("1.0"),
  engine: z.object({
    min: versionSchema,
    maxTested: versionSchema.optional()
  }),
  description: z.string().max(300).optional(),
  license: z.string().optional(),
  authors: z.array(z.string()).optional(),
  tags: z.array(z.string()).max(20).optional(),
  extensions: z.record(z.string(), z.unknown()).optional()
});

const moodSchema = z.enum([
  "neutral",
  "bright",
  "calm",
  "curious",
  "playful",
  "serious",
  "tense",
  "down"
]);

const traitVectorSchema = z.object({
  energy: weightSchema,
  warmth: weightSchema,
  humor: weightSchema,
  sarcasm: weightSchema,
  formality: weightSchema,
  analytical: weightSchema,
  skepticism: weightSchema,
  curiosity: weightSchema,
  spontaneity: weightSchema,
  emotionalExpressiveness: weightSchema,
  assertiveness: weightSchema
});

const speechStyleSchema = z.object({
  directness: weightSchema,
  playfulness: weightSchema,
  verbosity: weightSchema,
  tempo: weightSchema
});

const cognitionStyleSchema = z.object({
  intuition: weightSchema,
  structureSeeking: weightSchema,
  noveltySeeking: weightSchema,
  conflictTolerance: weightSchema
});

const relationshipDimensionsSchema = z.object({
  familiarity: weightSchema,
  trust: weightSchema,
  warmth: weightSchema,
  tension: weightSchema,
  curiosity: weightSchema,
  influence: weightSchema
});

export const characterManifestSchema = manifestBaseSchema.extend({
  kind: z.literal("character"),
  title: z.string().optional(),
  files: z.object({
    persona: relativePathSchema.default("persona.json"),
    memoryProfile: relativePathSchema.default("memory-profile.json"),
    renderManifest: relativePathSchema.default("render.manifest.json"),
    sourceAffinity: relativePathSchema.default("source-affinity.json"),
    relationshipProfile: relativePathSchema.default("relationship-profile.json")
  }),
  capabilities: z
    .object({
      chat: z.boolean().default(true),
      live2d: z.boolean().default(true),
      groupConversation: z.boolean().default(true)
    })
    .default({
      chat: true,
      live2d: true,
      groupConversation: true
    }),
  defaults: z
    .object({
      initialMood: moodSchema.default("neutral"),
      initialEnergy: weightSchema.default(0.6),
      visibleAtBootstrap: z.boolean().default(false)
    })
    .default({
      initialMood: "neutral",
      initialEnergy: 0.6,
      visibleAtBootstrap: false
    })
});

export const personaSchema = z.object({
  identity: z.object({
    displayName: nonEmptyStringSchema,
    selfReference: nonEmptyStringSchema,
    roleSummary: nonEmptyStringSchema,
    primaryLanguage: nonEmptyStringSchema
  }),
  coreIdentityTags: z.array(nonEmptyStringSchema).min(1).max(10),
  traitVector: traitVectorSchema,
  speechStyle: speechStyleSchema,
  cognitionStyle: cognitionStyleSchema,
  interests: z.record(nonEmptyStringSchema, weightSchema).refine((value) => Object.keys(value).length > 0),
  valueAnchors: z.array(nonEmptyStringSchema).min(1),
  guardrails: z.object({
    immutableIdentity: z.array(nonEmptyStringSchema).min(1),
    behaviorRules: z.array(nonEmptyStringSchema).min(1),
    hardNoTopics: z.array(nonEmptyStringSchema).default([])
  }),
  promptBlocks: z
    .object({
      systemCore: z.string().optional(),
      style: z.string().optional(),
      reasoningBias: z.string().optional()
    })
    .optional()
});

export const memoryProfileSchema = z.object({
  retentionBias: z.object({
    selfRelevance: weightSchema,
    userRelevance: weightSchema,
    emotionalIntensity: weightSchema,
    novelty: weightSchema,
    repetition: weightSchema,
    sourceCredibility: weightSchema
  }),
  sharingPreference: z.enum(["private-first", "balanced", "shared-first"]),
  summaryStyle: z.enum(["compact", "narrative", "analytic"]),
  forgetBias: z.object({
    stale: weightSchema,
    lowCredibility: weightSchema,
    lowRelevance: weightSchema,
    duplicate: weightSchema
  }),
  sensitivity: z.object({
    praise: weightSchema,
    criticism: weightSchema,
    conflict: weightSchema,
    uncertainty: weightSchema
  }),
  longTermFocusTags: z.array(nonEmptyStringSchema).default([])
});

export const renderManifestSchema = z.object({
  type: z.literal("live2d"),
  model: z.object({
    entry: relativePathSchema,
    version: z.string().optional()
  }),
  layout: z
    .object({
      scale: z.number().min(0.1).max(3).default(1),
      offsetX: z.number().min(-1).max(1).default(0),
      offsetY: z.number().min(-1).max(1).default(0)
    })
    .default({
      scale: 1,
      offsetX: 0,
      offsetY: 0
    }),
  textures: z.array(relativePathSchema).default([]),
  motions: z
    .array(
      z.object({
        id: nonEmptyStringSchema,
        file: relativePathSchema,
        group: z.string().optional()
      })
    )
    .default([]),
  expressions: z
    .array(
      z.object({
        id: nonEmptyStringSchema,
        file: relativePathSchema
      })
    )
    .default([]),
  emotionMap: z
    .record(
      nonEmptyStringSchema,
      z.object({
        motionId: z.string().optional(),
        expressionId: z.string().optional()
      })
    )
    .default({}),
  fallback: z
    .object({
      poster: relativePathSchema.optional()
    })
    .default({}),
  constraints: z
    .object({
      preferredQuality: z.enum(["low", "medium", "high"]).default("medium")
    })
    .default({
      preferredQuality: "medium"
    })
});

export const sourceAffinitySchema = z.object({
  preferredSourceIds: z.array(packIdSchema).default([]),
  blockedSourceIds: z.array(packIdSchema).default([]),
  preferredTags: z.record(nonEmptyStringSchema, weightSchema).default({}),
  blockedTags: z.array(nonEmptyStringSchema).default([]),
  categoryWeights: z.record(nonEmptyStringSchema, weightSchema).default({}),
  credibilitySensitivity: weightSchema.default(0.5),
  noveltyPreference: weightSchema.default(0.5),
  engagementStyle: z.enum(["curious", "selective", "reactive"]).default("selective"),
  conflictTriggers: z.array(nonEmptyStringSchema).default([])
});

export const relationshipProfileSchema = z.object({
  defaultStance: z.enum(["friendly", "neutral", "guarded", "competitive"]),
  baselineDimensions: z.object({
    warmth: weightSchema,
    trust: weightSchema,
    tension: weightSchema,
    curiosity: weightSchema,
    influence: weightSchema
  }),
  bondingTriggers: z.array(nonEmptyStringSchema).default([]),
  conflictTriggers: z.array(nonEmptyStringSchema).default([]),
  imitationBias: weightSchema.default(0.5),
  dominanceStyle: z.enum(["leading", "balanced", "following"]).default("balanced"),
  humorCompatibility: z.enum(["low", "medium", "high"]).default("medium")
});

export const sourceManifestSchema = manifestBaseSchema.extend({
  kind: z.literal("source"),
  sourceType: z.enum(["rss", "atom", "jsonfeed", "manual", "host-injected"]),
  endpoints: z
    .array(
      z.object({
        url: nonEmptyStringSchema,
        format: z.enum(["rss", "atom", "jsonfeed", "manual"]),
        priority: z.number().int().min(1).optional()
      })
    )
    .min(1),
  access: z.object({
    mode: z.enum(["browser-direct", "requires-bridge", "manual-only"])
  }),
  contentClass: z.enum(["realtime", "slowburn", "archive"]),
  category: nonEmptyStringSchema,
  language: nonEmptyStringSchema,
  credibility: weightSchema,
  tags: z.array(nonEmptyStringSchema).default([]),
  presentation: z
    .object({
      icon: relativePathSchema.optional()
    })
    .optional(),
  terms: z
    .object({
      note: z.string().optional()
    })
    .optional()
});

export const sourceFiltersSchema = z.object({
  includeTags: z.array(nonEmptyStringSchema).default([]),
  excludeTags: z.array(nonEmptyStringSchema).default([]),
  includeKeywords: z.array(nonEmptyStringSchema).default([]),
  excludeKeywords: z.array(nonEmptyStringSchema).default([]),
  authorAllowlist: z.array(nonEmptyStringSchema).default([]),
  authorBlocklist: z.array(nonEmptyStringSchema).default([]),
  domainAllowlist: z.array(nonEmptyStringSchema).default([]),
  domainBlocklist: z.array(nonEmptyStringSchema).default([]),
  minContentLength: z.number().int().min(0).default(0),
  safeContentProfile: z.enum(["standard", "strict", "off"]).default("standard"),
  stripTrackingLinks: z.boolean().default(true),
  dedupeHints: z.array(nonEmptyStringSchema).default([])
});

export const sourceRoutingSchema = z.object({
  audienceTags: z.array(nonEmptyStringSchema).default([]),
  deliveryMode: z.enum(["shared", "targeted", "broadcast"]).default("shared"),
  priorityBoosts: z.record(nonEmptyStringSchema, boostSchema).default({}),
  topicHints: z.array(nonEmptyStringSchema).default([]),
  defaultChannels: z.array(nonEmptyStringSchema).default([])
});

export const normalizationSchema = z.object({
  titleFields: z.array(nonEmptyStringSchema).default(["title"]),
  summaryFields: z.array(nonEmptyStringSchema).default(["summary", "description"]),
  contentFields: z.array(nonEmptyStringSchema).default(["content", "content_html"]),
  publishedAtFields: z.array(nonEmptyStringSchema).default(["published", "pubDate", "date_published"]),
  authorFields: z.array(nonEmptyStringSchema).default(["author", "dc:creator"]),
  tagFields: z.array(nonEmptyStringSchema).default(["tags", "category"]),
  preferHtml: z.boolean().default(false),
  extractPlainText: z.boolean().default(true)
});

export const worldManifestSchema = manifestBaseSchema.extend({
  kind: z.literal("world"),
  locale: nonEmptyStringSchema,
  defaultLanguage: nonEmptyStringSchema,
  startup: z.object({
    autoStart: z.boolean().default(true),
    restorePreviousState: z.boolean().default(true),
    entryScene: nonEmptyStringSchema.default("default")
  }),
  presentation: z
    .object({
      defaultTheme: z.string().optional()
    })
    .optional()
});

export const castEntrySchema = z.object({
  instanceId: instanceIdSchema,
  characterPackId: packIdSchema,
  enabled: z.boolean().default(true),
  alias: z.string().optional(),
  visibleAtStart: z.boolean().default(false),
  focusPriority: weightSchema.default(0.5),
  initialState: z
    .object({
      mood: moodSchema.optional(),
      energy: weightSchema.optional()
    })
    .default({}),
  contextOverlay: z
    .object({
      worldRole: z.string().optional(),
      notes: z.string().optional()
    })
    .default({}),
  tags: z.array(nonEmptyStringSchema).default([])
});

const characterSourceOverrideSchema = z.object({
  blocked: z.boolean().default(false),
  priorityBoost: boostSchema.default(0),
  tagBias: z.record(nonEmptyStringSchema, boostSchema).default({})
});

export const worldSourceBindingSchema = z.object({
  bindingId: instanceIdSchema,
  sourcePackId: packIdSchema,
  enabled: z.boolean().default(true),
  deliverTo: z.array(instanceIdSchema).default([]),
  sharedChannels: z.array(nonEmptyStringSchema).default([]),
  priorityMode: z.enum(["normal", "boosted", "background"]).default("normal"),
  characterOverrides: z.record(instanceIdSchema, characterSourceOverrideSchema).default({})
});

export const relationshipEdgeSchema = z.object({
  from: instanceIdSchema,
  to: instanceIdSchema,
  dimensions: relationshipDimensionsSchema,
  notes: z.string().optional(),
  sharedHistoryHints: z.array(nonEmptyStringSchema).default([])
});

export const sceneChannelSchema = z.object({
  id: nonEmptyStringSchema,
  kind: z.enum(["direct", "group", "ambient"]),
  participants: z.array(instanceIdSchema).default([]),
  default: z.boolean().default(false)
});

export const sceneSchema = z.object({
  id: nonEmptyStringSchema.default("default"),
  visibleCharacters: z.array(instanceIdSchema).default([]),
  defaultFocus: instanceIdSchema.optional(),
  channels: z.array(sceneChannelSchema).default([]),
  interactionProfile: z.enum(["quiet", "balanced", "lively"]).default("balanced"),
  sharedMemoryMode: z.enum(["isolated", "selective", "open"]).default("selective"),
  presentationMode: z.enum(["stage", "chat-first", "split"]).default("split"),
  ambientNarration: z.boolean().default(false)
});

export const uiHintsSchema = z.object({
  layoutHint: z.enum(["stage-split", "chat-first", "compact"]).default("stage-split"),
  defaultPanels: z.array(nonEmptyStringSchema).default([]),
  themeHint: z.string().optional(),
  heroCharacter: instanceIdSchema.optional()
});

export type CharacterManifest = z.infer<typeof characterManifestSchema>;
export type PersonaProfile = z.infer<typeof personaSchema>;
export type MemoryProfile = z.infer<typeof memoryProfileSchema>;
export type RenderManifest = z.infer<typeof renderManifestSchema>;
export type SourceAffinityProfile = z.infer<typeof sourceAffinitySchema>;
export type RelationshipProfile = z.infer<typeof relationshipProfileSchema>;
export type SourceManifest = z.infer<typeof sourceManifestSchema>;
export type SourceFilters = z.infer<typeof sourceFiltersSchema>;
export type SourceRouting = z.infer<typeof sourceRoutingSchema>;
export type NormalizationConfig = z.infer<typeof normalizationSchema>;
export type WorldManifest = z.infer<typeof worldManifestSchema>;
export type CastEntry = z.infer<typeof castEntrySchema>;
export type WorldSourceBinding = z.infer<typeof worldSourceBindingSchema>;
export type RelationshipEdge = z.infer<typeof relationshipEdgeSchema>;
export type SceneConfig = z.infer<typeof sceneSchema>;
export type UiHints = z.infer<typeof uiHintsSchema>;
