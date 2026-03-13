# Brain-in-a-Vat Engine

> 一个面向浏览器的、本地优先、配置驱动的多角色持续演化引擎。

![状态](https://img.shields.io/badge/%E7%8A%B6%E6%80%81-%E6%9E%B6%E6%9E%84%E5%B7%B2%E5%86%BB%E7%BB%93-1f6feb)
![V1](https://img.shields.io/badge/V1-Standalone%20%2B%203%E8%A7%92%E8%89%B2-0f766e)
![界面](https://img.shields.io/badge/UI-Web%20Components-f59e0b)
![运行方式](https://img.shields.io/badge/%E8%BF%90%E8%A1%8C%E6%96%B9%E5%BC%8F-%E6%9C%AC%E5%9C%B0%E4%BC%98%E5%85%88-7c3aed)

`Brain-in-a-Vat Engine` 的目标不是做一个一次性的 Live2D 页面 Demo，而是提供一套可复用的运行时底座：角色包、消息源包和世界包通过配置装配，引擎负责角色状态、记忆、关系、信息摄取和运行时协调，UI 则保持可替换。

[项目总纲](./docs/00-overview/overview.md) · [文档索引](./docs/index.md) · [执行状态](./docs/09-roadmap/execution-status.md) · [AI 协作规则](./AGENTS.md)

## 协作者须知

在进行任何设计、编码或文档修改之前，请先阅读以下文件：

1. [AGENTS.md](./AGENTS.md)
2. [docs/00-overview/overview.md](./docs/00-overview/overview.md)
3. [docs/09-roadmap/execution-status.md](./docs/09-roadmap/execution-status.md)

这条规则同时适用于人类协作者和 AI 编码助手。

## 仓库定位

- 一个主要运行在浏览器中的多角色世界引擎
- 一套围绕角色包、消息源包、世界包建立的配置化内容系统
- 一个默认把记忆、关系和世界状态保存在本地的运行时
- 一个以 `Standalone App` 作为 V1 官方壳层的项目仓库

## 这不是一个什么项目

- 不是一个把 22/33 写死在代码里的项目
- 不是一个把业务逻辑和 UI 混在一起的单页 Demo
- 不是一个依赖服务端才能工作的产品
- 不是一个在 V1 阶段就追求大规模并发多智能体渲染的实验

## V1 快照

V1 范围刻意收窄，目的是先把底层边界和闭环跑通。

- 一个官方壳层：`Standalone App`
- 一个公开组件：`<brain-vat-world>`
- 一个官方演示世界
- 三个官方角色包
- 三个官方消息源包
- `serverless` 只作为可选增强能力预留，不作为默认前提

## 架构总览

- `engine-core` 负责世界生命周期、角色状态、记忆、关系、调度和公开 API
- `browser-runtime` 负责能力探测、Worker 协调和多标签页行为
- `config-schema` 负责 Pack schema、校验和迁移
- `provider-*` 负责连接模型、存储、消息源和资源
- `renderer-live2d` 负责角色渲染和视觉降级
- `web-components` 负责根据稳定的 ViewModel 渲染 UI，并把命令派发回引擎
- `apps/standalone` 是 V1 唯一官方壳层

## 仓库结构

```text
/apps
  /standalone
/packages
  /engine-core
  /browser-runtime
  /config-schema
  /provider-webllm
  /provider-indexeddb
  /provider-rss
  /renderer-live2d
  /web-components
  /shared
/worlds
/characters
/sources
/docs
```

## 开发顺序

建议按以下顺序推进：

1. 建立 workspace 和工具链
2. 落地 Pack schema 与校验
3. 固定引擎初始化协议、命令、事件和 ViewModel
4. 建立 Headless Engine 最小闭环
5. 实现记忆系统和关系系统
6. 接入 Provider
7. 建立浏览器运行时
8. 接入 Live2D 渲染和 Web Component
9. 组装 `Standalone App`

## 文档入口

- [项目总纲](./docs/00-overview/overview.md)
- [文档索引](./docs/index.md)
- [执行状态](./docs/09-roadmap/execution-status.md)
- [AI 协作规则](./AGENTS.md)

## 当前状态

当前已经完成架构对齐和 V1 边界冻结。下一步进入仓库初始化阶段，重点是 monorepo 搭建、package 骨架、schema 实现和引擎协议骨架。
