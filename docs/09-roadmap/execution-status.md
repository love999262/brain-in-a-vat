# V1 执行状态

本文档是当前仓库的唯一进度真相。任何 AI 助手在开始开发前都必须先阅读本文件，并在完成一部分工作后立即更新。

## 1. 当前状态概览

- 项目阶段：`架构冻结完成，进入工程启动阶段`
- 当前主线：`Phase 0：仓库底座`
- 当前目标：完成 monorepo 骨架、文档入口、Schema 与协议实现的工程起点
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

## 4. 当前进行中

- `TODO` 当前尚未开始代码开发，下一步进入 `Phase 0：仓库底座`

## 5. 下一步优先任务

### Phase 0：仓库底座

- `TODO` 建立 `pnpm workspace` 基础配置
- `TODO` 建立 `apps / packages / worlds / characters / sources / tooling` 目录骨架
- `TODO` 建立根 `package.json`
- `TODO` 建立 `pnpm-workspace.yaml`
- `TODO` 建立 TypeScript 共享配置
- `TODO` 建立 lint / format / test 基础配置
- `TODO` 建立 package 导出规范

### Phase 1：Schema 与 Pack 基建

- `TODO` 建立 `packages/config-schema`
- `TODO` 定义通用 manifest schema
- `TODO` 定义 `character` schema
- `TODO` 定义 `source` schema
- `TODO` 定义 `world` schema
- `TODO` 定义结构化错误码
- `TODO` 建立 pack 加载器和路径解析器
- `TODO` 建立官方样例 world/character/source 目录骨架

### Phase 2：公开协议骨架

- `TODO` 定义 `InitConfig`
- `TODO` 定义 `EngineHandle`
- `TODO` 定义 `Command` 协议
- `TODO` 定义 `Event` 协议
- `TODO` 定义 `ViewModel` 协议
- `TODO` 定义错误模型与生命周期状态

## 6. 后续阶段任务总览

### Phase 3：Engine Core 最小闭环

- `TODO` 世界加载流程
- `TODO` 角色实例化
- `TODO` 场景初始化
- `TODO` 初始关系图构建
- `TODO` 事件总线
- `TODO` 命令分发器
- `TODO` 基础 ViewModel 输出

### Phase 4：记忆系统

- `TODO` 短期记忆
- `TODO` 情节记忆
- `TODO` 长期记忆
- `TODO` 记忆写入入口
- `TODO` 摘要占位管线
- `TODO` 审计与遗忘能力

### Phase 5：关系与互动调度

- `TODO` 关系维度更新规则
- `TODO` 三角色互动调度器
- `TODO` 用户输入触发互动
- `TODO` 消息源摄取触发互动
- `TODO` 关系变化事件

### Phase 6：Provider 接口层

- `TODO` `ModelProvider`
- `TODO` `StorageProvider`
- `TODO` `SourceProvider`
- `TODO` `AssetProvider`
- `TODO` `ServerlessBridge` 预留接口

### Phase 7：真实 Provider 实现

- `TODO` `provider-indexeddb`
- `TODO` `provider-rss`
- `TODO` `provider-webllm`

### Phase 8：Browser Runtime

- `TODO` WebGPU 能力探测
- `TODO` 运行等级系统
- `TODO` 页面可见性控制
- `TODO` 多标签页主实例选举
- `TODO` 生命周期暂停恢复

### Phase 9：Live2D 渲染层

- `TODO` 渲染输入协议
- `TODO` 资源加载
- `TODO` 动作与表情映射
- `TODO` fallback 与降级态

### Phase 10：Web Components

- `TODO` 建立 `packages/web-components`
- `TODO` 只公开 `<brain-vat-world>`
- `TODO` 支持传入 `engine instance`
- `TODO` 支持传入 `initConfig`
- `TODO` 建立命令派发桥和 ViewModel 渲染桥

### Phase 11：Standalone 官方壳

- `TODO` 建立 `apps/standalone`
- `TODO` 接入官方世界
- `TODO` 接入调试入口
- `TODO` 接入导入导出
- `TODO` 接入错误态和降级态

### Phase 12：调试与观测

- `TODO` 事件流面板
- `TODO` 角色状态摘要
- `TODO` 关系变化日志
- `TODO` 记忆写入日志
- `TODO` 资源与 provider 状态面板

### Phase 13：测试体系

- `TODO` schema fixture tests
- `TODO` pack loader tests
- `TODO` command / event contract tests
- `TODO` memory / relationship tests
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
