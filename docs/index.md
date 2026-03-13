# 文档索引

这里收纳 `Brain-in-a-Vat Engine` 的项目定义、架构说明、Pack 规范和开发路线。

## 当前文档

### 00 总览

- [00-overview/overview.md](./00-overview/overview.md)

### 01 架构

- [01-architecture/module-boundaries.md](./01-architecture/module-boundaries.md)
- [01-architecture/package-responsibilities.md](./01-architecture/package-responsibilities.md)
- [01-architecture/dependency-rules.md](./01-architecture/dependency-rules.md)
- [01-architecture/coding-conventions.md](./01-architecture/coding-conventions.md)

### 02 领域模型

- [02-domain/domain-model.md](./02-domain/domain-model.md)
- [02-domain/memory-system.md](./02-domain/memory-system.md)
- [02-domain/relationship-system.md](./02-domain/relationship-system.md)
- [02-domain/scene-and-world-system.md](./02-domain/scene-and-world-system.md)

### 03 Pack 规范

- [03-pack-spec/pack-overview.md](./03-pack-spec/pack-overview.md)
- [03-pack-spec/character-pack-spec.md](./03-pack-spec/character-pack-spec.md)
- [03-pack-spec/source-pack-spec.md](./03-pack-spec/source-pack-spec.md)
- [03-pack-spec/world-pack-spec.md](./03-pack-spec/world-pack-spec.md)
- [03-pack-spec/schema-field-spec.md](./03-pack-spec/schema-field-spec.md)

### 04 引擎 API

- [04-engine-api/init-protocol.md](./04-engine-api/init-protocol.md)
- [04-engine-api/public-api.md](./04-engine-api/public-api.md)
- [04-engine-api/command-spec.md](./04-engine-api/command-spec.md)
- [04-engine-api/event-spec.md](./04-engine-api/event-spec.md)
- [04-engine-api/viewmodel-spec.md](./04-engine-api/viewmodel-spec.md)
- [04-engine-api/error-model.md](./04-engine-api/error-model.md)

### 05 运行时

- [05-runtime/browser-runtime.md](./05-runtime/browser-runtime.md)
- [05-runtime/provider-contracts.md](./05-runtime/provider-contracts.md)
- [05-runtime/capability-profile.md](./05-runtime/capability-profile.md)
- [05-runtime/multi-tab-coordination.md](./05-runtime/multi-tab-coordination.md)

### 06 渲染与 UI

- [06-rendering-ui/renderer-live2d.md](./06-rendering-ui/renderer-live2d.md)
- [06-rendering-ui/web-components.md](./06-rendering-ui/web-components.md)
- [06-rendering-ui/standalone-shell.md](./06-rendering-ui/standalone-shell.md)

### 07 数据层

- [07-data/storage-and-persistence.md](./07-data/storage-and-persistence.md)
- [07-data/cache-strategy.md](./07-data/cache-strategy.md)
- [07-data/import-export.md](./07-data/import-export.md)
- [07-data/debug-observability.md](./07-data/debug-observability.md)

### 08 质量保障

- [08-quality/test-strategy.md](./08-quality/test-strategy.md)
- [08-quality/release-strategy.md](./08-quality/release-strategy.md)
- [08-quality/versioning-policy.md](./08-quality/versioning-policy.md)

### 09 路线图

- [09-roadmap/execution-status.md](./09-roadmap/execution-status.md)
- [09-roadmap/v1-task-tree.md](./09-roadmap/v1-task-tree.md)
- [09-roadmap/milestones.md](./09-roadmap/milestones.md)
- [09-roadmap/post-v1-roadmap.md](./09-roadmap/post-v1-roadmap.md)
- [09-roadmap/phase-0-checklist.md](./09-roadmap/phase-0-checklist.md)
- [09-roadmap/phase-1-checklist.md](./09-roadmap/phase-1-checklist.md)

### 示例

- [examples/README.md](./examples/README.md)
- [examples/character-pack/character.manifest.json](./examples/character-pack/character.manifest.json)
- [examples/source-pack/source.manifest.json](./examples/source-pack/source.manifest.json)
- [examples/world-pack/world.manifest.json](./examples/world-pack/world.manifest.json)
- [examples/protocols/init-config.json](./examples/protocols/init-config.json)

### ADR

- [adr/0001-standalone-as-primary-shell.md](./adr/0001-standalone-as-primary-shell.md)
- [adr/0002-directory-pack-format.md](./adr/0002-directory-pack-format.md)
- [adr/0003-single-public-web-component.md](./adr/0003-single-public-web-component.md)
- [adr/0004-serverless-optional.md](./adr/0004-serverless-optional.md)

## 阅读顺序

1. 先读 [00-overview/overview.md](./00-overview/overview.md)
2. 在开始建包之前，继续读 Architecture、Pack Spec 和示例文件
3. 在实现引擎、运行时和 UI 边界之前，继续读 Engine API
4. 按 Roadmap 文档和 Phase 检查清单推进具体开发任务
