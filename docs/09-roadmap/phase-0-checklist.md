# Phase 0 检查清单

## 目标

完成仓库底座，让后续开发可以在稳定工程基础上推进。

## 输入

- 当前总纲与文档体系
- 已冻结的 V1 决策

## 输出

至少应产出以下内容：

- 根 `package.json`
- `pnpm-workspace.yaml`
- `apps / packages / worlds / characters / sources / tooling` 目录骨架
- TypeScript 共享配置
- lint / format / test 基础配置
- 基础脚本命令

## 任务清单

### 目录与 workspace

- [ ] 建立 `apps`
- [ ] 建立 `packages`
- [ ] 建立 `worlds`
- [ ] 建立 `characters`
- [ ] 建立 `sources`
- [ ] 建立 `tooling`
- [ ] 建立 `pnpm-workspace.yaml`

### 根配置

- [ ] 建立根 `package.json`
- [ ] 建立统一脚本：`lint`、`typecheck`、`test`、`build`
- [ ] 固定 Node 版本要求

### 共享工具链

- [ ] 建立 TypeScript 基础配置
- [ ] 建立 lint 基础配置
- [ ] 建立格式化基础配置
- [ ] 建立测试基础配置

### 空包骨架

- [ ] 建立 `packages/engine-core`
- [ ] 建立 `packages/browser-runtime`
- [ ] 建立 `packages/config-schema`
- [ ] 建立 `packages/provider-webllm`
- [ ] 建立 `packages/provider-indexeddb`
- [ ] 建立 `packages/provider-rss`
- [ ] 建立 `packages/renderer-live2d`
- [ ] 建立 `packages/web-components`
- [ ] 建立 `packages/shared`
- [ ] 建立 `apps/standalone`

## 验收标准

- 所有 workspace 可被识别
- 所有空包可被 `pnpm` 正常解析
- 根脚本能运行到至少不报结构性错误
- 目录结构与文档一致

## 本阶段不要做的事

- 不写业务逻辑
- 不接真实模型
- 不接真实消息源
- 不提前做页面样式

## 完成后必须更新

- `docs/09-roadmap/execution-status.md`
- 如果目录结构有变化，同时更新总纲和文档索引
