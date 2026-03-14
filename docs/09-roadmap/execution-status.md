# V1 执行状态

本文档是当前仓库的唯一进度真相。任何 AI 助手在开始开发前都必须先阅读本文件，并在完成一部分工作后立即更新。

## 1. 当前状态概览

- 项目阶段：`V1 演示基线已完成，进入下一轮补强阶段`
- 当前主线：`Phase 9：Live2D 渲染层` 与 `Phase 12：调试与观测`
- 当前目标：补齐真实官方 Live2D 资源、事件流与记忆日志面板，并继续收敛发布面
- V1 范围：`1 个官方壳 + 1 个公开组件 + 1 个世界 + 3 个角色 + 3 个消息源`

## 2. 已冻结的 V1 决策

- `Standalone App` 是 V1 唯一官方壳层
- `<brain-vat-world>` 是 V1 唯一公开 Web Component
- 角色包采用目录型 manifest
- 官方 Demo 固定 3 个角色
- 第三方扩展 V1 仅开放角色包和消息源包
- `serverless` 只能增强，不能成为世界真相
- 移动端只保留扩展口，不进入 V1 主开发线

## 3. 已完成事项

### 文档与产品定义

- `DONE` 仓库首页 README 已建立
- `DONE` 文档索引已建立
- `DONE` 项目总纲已落地
- `DONE` V1 范围、边界和核心原则已冻结
- `DONE` Pack 体系、初始化协议、开发顺序已完成讨论并沉淀为总纲
- `DONE` 架构、领域模型、Pack 规范、引擎 API、运行时、渲染/UI、数据、质量、路线图文档已补齐
- `DONE` 已补充编码约定、Phase 0/1 检查清单和完整示例文件

### 协作约束

- `DONE` 已建立根目录 `AGENTS.md`
- `DONE` 已定义“开发前必读文档”和“完成后必须更新状态文档”的规则
- `DONE` 已建立执行状态文档，作为唯一进度真相

### 工程底座与内容包

- `DONE` 已建立 `pnpm workspace` 与 monorepo 基础骨架
- `DONE` 已建立 `apps / packages / worlds / characters / sources / tooling` 目录结构
- `DONE` 已建立根 `package.json`、`pnpm-workspace.yaml`、TypeScript 共享配置和 ESLint 配置
- `DONE` 已建立核心 package 的入口与导出面
- `DONE` 已落地官方世界包 `official/demo-world`
- `DONE` 已落地三个官方角色包：`official/niziiro-mao`、`official/hiyori-momose`、`official/jin-natori`
- `DONE` 已落地三个官方消息源包：`official/entertainment-feed`、`official/history-tech-feed`、`official/world-briefing`

### Schema、协议与引擎

- `DONE` 已实现 `packages/config-schema`
- `DONE` 已实现三类 Pack schema、结构化错误码、Pack 加载器与路径解析器
- `DONE` 已实现 `InitConfig`、`EngineHandle`、`Command`、`Event`、`ViewModel`、错误模型与生命周期状态
- `DONE` 已实现世界加载、角色实例化、消息源绑定解析、初始关系图构建、场景初始化和事件总线
- `DONE` 已实现用户输入 -> 角色回复 -> 记忆更新 -> 关系变化 -> ViewModel 更新的最小闭环
- `DONE` 已实现短期记忆、情节记忆入口、长期记忆占位与审计字段

### Provider、运行时、UI 与官方壳

- `DONE` 已实现 `provider-indexeddb`
- `DONE` 已实现 `provider-rss`，并支持浏览器模式下的本地回退快照
- `DONE` 已实现 `provider-webllm`，并支持能力不足时自动降级
- `DONE` 已实现 `browser-runtime` 的能力探测、页面可见性处理和多标签页主实例逻辑
- `DONE` 已实现 `renderer-live2d` 的真实接入路径和静态降级路径
- `DONE` 已实现唯一公开组件 `<brain-vat-world>`
- `DONE` 已实现 `apps/standalone` 官方壳，并接入导入导出、关系摘要、资源状态与对话区

### 验证

- `DONE` 已通过 `corepack pnpm typecheck`
- `DONE` 已通过 `corepack pnpm test`
- `DONE` 已通过 `corepack pnpm build`
- `DONE` 已验证官方页面可启动、可加载世界、可展示 3 个角色并可发送消息

## 4. 当前进行中

- `IN_PROGRESS` 官方演示基线已经稳定，下一步优先补齐真实 Live2D 资产和观测面板

## 5. 下一步优先任务

### 下一阶段优先项

- `TODO` 将真实 Live2D 官方 Sample Data 资源补齐到当前三角色目录
- `TODO` 为 `renderer-live2d` 接通真实模型资源后的动作与表情映射验证
- `TODO` 扩充事件流面板与记忆日志面板
- `TODO` 补齐 Web Component smoke tests
- `TODO` 完善发布前文档与最小接入示例

## 6. 后续阶段任务总览

### Phase 3：Engine Core 最小闭环

- `DONE` 世界加载流程
- `DONE` 角色实例化
- `DONE` 场景初始化
- `DONE` 初始关系图构建
- `DONE` 事件总线
- `DONE` 命令分发器
- `DONE` 基础 ViewModel 输出

### Phase 4：记忆系统

- `DONE` 短期记忆
- `DONE` 情节记忆
- `IN_PROGRESS` 长期记忆占位实现
- `DONE` 记忆写入入口
- `IN_PROGRESS` 摘要占位管线
- `DONE` 审计与遗忘能力

### Phase 5：关系与互动调度

- `DONE` 关系维度更新规则
- `DONE` 三角色互动调度器（最小可用版）
- `DONE` 用户输入触发互动
- `DONE` 消息源摄取触发互动
- `DONE` 关系变化事件

### Phase 6：Provider 接口层

- `DONE` `ModelProvider`
- `DONE` `StorageProvider`
- `DONE` `SourceProvider`
- `DONE` `AssetProvider`
- `DONE` `ServerlessBridge` 预留接口

### Phase 7：真实 Provider 实现

- `DONE` `provider-indexeddb`
- `DONE` `provider-rss`
- `DONE` `provider-webllm`

### Phase 8：Browser Runtime

- `DONE` WebGPU 能力探测
- `DONE` 运行等级系统
- `DONE` 页面可见性控制
- `DONE` 多标签页主实例选举（简化版）
- `DONE` 生命周期暂停恢复

### Phase 9：Live2D 渲染层

- `DONE` 渲染输入协议
- `IN_PROGRESS` 资源加载（当前以真实路径 + poster 回退为主）
- `DONE` 动作与表情映射
- `DONE` fallback 与降级态

### Phase 10：Web Components

- `DONE` 建立 `packages/web-components`
- `DONE` 只公开 `<brain-vat-world>`
- `DONE` 支持传入 `engine instance`
- `DONE` 支持传入 `initConfig`
- `DONE` 建立命令派发桥和 ViewModel 渲染桥

### Phase 11：Standalone 官方壳

- `DONE` 建立 `apps/standalone`
- `DONE` 接入官方世界
- `DONE` 接入调试入口（基础版）
- `DONE` 接入导入导出
- `DONE` 接入错误态和降级态

### Phase 12：调试与观测

- `TODO` 事件流面板
- `DONE` 角色状态摘要
- `DONE` 关系变化日志（摘要版）
- `TODO` 记忆写入日志
- `DONE` 资源与 provider 状态面板

### Phase 13：测试体系

- `DONE` schema fixture tests
- `DONE` pack loader tests
- `DONE` command / event contract tests（基础版）
- `DONE` memory / relationship tests（基础版）
- `TODO` web component smoke tests

### Phase 14：发布准备

- `TODO` npm 导出检查
- `TODO` 包稳定性划分
- `TODO` 最小接入示例
- `TODO` 发布说明

## 7. 明确不进入 V1 主线

- `TODO` 之外的事项不应擅自插队进入主线开发
- 浏览器插件正式实现
- 完整 serverless 实现
- 完整移动端适配
- 多公开组件体系
- 高权限第三方插件系统
- 100 角色压力验证

## 8. 更新规则

每次完成一部分工作后，必须同步更新以下内容：

1. 把对应任务从 `TODO` 改为 `IN_PROGRESS` 或 `DONE`
2. 如果阶段切换，更新“当前主线”
3. 在“变更记录”追加一条记录
4. 如果本次工作修改了架构边界或协议，同时更新相关设计文档
5. 如果本次工作修改了代码、目录结构或运行行为，提交前必须完成一次“文档与实现一致性审计”

## 9. 变更记录

- `2026-03-14`
  - 建立仓库首页 README
  - 建立文档索引 `docs/index.md`
  - 建立项目总纲 `docs/00-overview/overview.md`
  - 建立 `AGENTS.md`
  - 建立本执行状态文档，作为唯一进度真相
  - 更新 README 和 docs 入口，接入执行状态文档与 AI 规则文件
  - 在 README 顶部新增 Contributor Notice，明确协作者必读文档
  - 统一 README、文档索引和项目总纲的文案语言，改为中文表述为主
  - 建立架构、领域模型、Pack 规范、引擎 API、运行时、渲染/UI、数据、质量、路线图和 ADR 文档
  - 补充编码约定、Phase 0/1 检查清单、Pack 与协议示例，并接入索引与协作规则
  - 建立 monorepo 工程骨架、核心 package、官方世界包、三角色包和三消息源包
  - 实现 `config-schema`、`engine-core`、`browser-runtime`、三个 Provider、`renderer-live2d`、`web-components` 与 `apps/standalone`
  - 打通用户输入、角色回复、记忆写入、关系更新、状态导入导出和基础资源状态展示
  - 完成 `typecheck`、`test`、`build` 和页面可运行验证
  - 将官方演示角色锁定为 `Niziiro Mao`、`Hiyori Momose`、`Jin Natori`
  - 收口浏览器演示模式下的消息源跨域噪音，改为优先使用本地回退快照
  - 新增 Standalone favicon，并同步调整首页、总纲、执行状态与示例文件
  - 新增“文档与实现一致性审计”协作规则，要求后续所有 AI 在代码改动后强制执行并回写文档
  - 完成一轮代码与文档一致性审计，修正文档中的旧目录、旧示例和未实现能力表述
