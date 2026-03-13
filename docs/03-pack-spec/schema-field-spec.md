# Schema 字段规范

## 目标

本文档定义 V1 Pack 的核心字段、约束和命名规则，供后续 schema 实现参考。

## 通用字段

所有 manifest 必须包含：

- `id`：格式建议为 `<namespace>/<name>`
- `kind`：`character` / `source` / `world`
- `name`
- `version`
- `schemaVersion`
- `engine.min`

推荐包含：

- `description`
- `license`
- `authors`
- `tags`

## Character Pack 关键字段

### `character.manifest.json`

- `files.persona`
- `files.memoryProfile`
- `files.renderManifest`
- `files.sourceAffinity`
- `files.relationshipProfile`
- `capabilities.chat`
- `capabilities.live2d`
- `defaults.initialMood`
- `defaults.initialEnergy`

### `persona.json`

- `identity`
- `coreIdentityTags`
- `traitVector`
- `speechStyle`
- `cognitionStyle`
- `interests`
- `valueAnchors`
- `guardrails`

### `memory-profile.json`

- `retentionBias`
- `sharingPreference`
- `summaryStyle`
- `forgetBias`
- `sensitivity`

### `render.manifest.json`

- `type`
- `model.entry`
- `motions`
- `expressions`
- `emotionMap`
- `fallback.poster`

## Source Pack 关键字段

### `source.manifest.json`

- `sourceType`
- `endpoints`
- `access.mode`
- `contentClass`
- `category`
- `language`
- `credibility`

### `filters.json`

- `includeTags`
- `excludeTags`
- `includeKeywords`
- `excludeKeywords`
- `authorAllowlist`
- `authorBlocklist`
- `domainAllowlist`
- `domainBlocklist`

### `routing.json`

- `audienceTags`
- `deliveryMode`
- `priorityBoosts`
- `topicHints`
- `defaultChannels`

### `normalization.json`

- `titleFields`
- `summaryFields`
- `contentFields`
- `publishedAtFields`
- `authorFields`
- `tagFields`

## World Pack 关键字段

### `world.manifest.json`

- `locale`
- `defaultLanguage`
- `startup.autoStart`
- `startup.restorePreviousState`
- `startup.entryScene`

### `cast.json`

每项至少包含：

- `instanceId`
- `characterPackId`
- `enabled`
- `visibleAtStart`
- `initialState`

### `sources.json`

每项至少包含：

- `bindingId`
- `sourcePackId`
- `enabled`
- `deliverTo`
- `sharedChannels`
- `characterOverrides`

### `relationships.json`

每项至少包含：

- `from`
- `to`
- `dimensions.familiarity`
- `dimensions.trust`
- `dimensions.warmth`
- `dimensions.tension`
- `dimensions.curiosity`
- `dimensions.influence`

### `scene.json`

- `visibleCharacters`
- `defaultFocus`
- `channels`
- `interactionProfile`
- `sharedMemoryMode`
- `presentationMode`

## 通用约束

- 数值权重统一建议使用 `0 ~ 1`
- `instanceId` 必须在世界内唯一
- `from` 和 `to` 不能相同
- 任何路径字段都相对当前 Pack 根目录解析
- V1 不允许自定义脚本字段

## 禁止字段

V1 Pack 中禁止出现：

- token
- cookie
- 可执行脚本
- 缓存 TTL 秒数
- 数据库表结构
- Worker 数量
- 调度器内部参数
