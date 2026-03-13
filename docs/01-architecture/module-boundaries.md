# 模块边界

## 目的

本文档用于明确各层的边界，避免后续开发再次出现业务、UI、资源和运行时混写的问题。

## 总体分层

项目分为六层：

1. `engine-core`
2. `browser-runtime`
3. `config-schema`
4. `provider-*`
5. `renderer-live2d`
6. `web-components` / `apps/standalone`

## 各层职责

### `engine-core`

负责世界生命周期、角色实例、记忆、关系、互动调度、事件总线、公开协议。

它是业务真相唯一来源。

### `browser-runtime`

负责浏览器环境适配，包括能力探测、Worker 协调、页面可见性、多标签页主实例选举、运行等级判定。

### `config-schema`

负责角色包、消息源包、世界包的 schema、校验、错误码与迁移。

### `provider-*`

负责接入模型、存储、消息源、资源等外部能力。

### `renderer-live2d`

负责 Live2D 资源加载、动作映射、实例生命周期和降级显示。

### `web-components`

负责把引擎输出的 ViewModel 渲染为 UI，并把用户意图转换为 Command。

### `apps/standalone`

负责官方壳层编排，不承载核心业务。

## 边界原则

- UI 不读取内部实体，只读取 ViewModel
- UI 不直接改状态，只派发 Command
- Provider 不承担业务决策
- Renderer 不理解记忆和关系
- Pack 只描述内容，不描述引擎算法
- Runtime 不决定世界业务，只提供运行环境能力

## 允许跨层通信的方式

- `engine-core` 通过公开 API 与外部通信
- `provider-*` 通过接口向 `engine-core` 提供能力
- `web-components` 通过 `EngineHandle` 读写公开协议
- `renderer-live2d` 只接收渲染态输入

## 禁止事项

- 在 `web-components` 中直接持有业务真相
- 在 `provider-*` 中写死角色、世界或消息源规则
- 在 `renderer-live2d` 中推导关系或记忆逻辑
- 在 `apps/standalone` 中补写引擎缺失功能
- 让 `serverless` 成为默认启动前提
