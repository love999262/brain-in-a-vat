# Brain-in-a-Vat Engine 总纲

## 项目定义

`Brain-in-a-Vat Engine` 是一个前端优先、本地优先、配置驱动的多角色持续演化引擎。

这个项目不由某一套固定 UI、某一组固定角色或某一个主题定义。它的核心是一套可复用运行时：加载角色包、消息源包和世界包，然后在其上管理记忆、关系、信息摄取、互动调度和状态演化。

## 项目目标

- 支持任意数量的配置化角色，每个角色都通过结构化内容描述，而不是硬编码逻辑
- 支持多个角色在同一世界中因用户行为、外部信息和彼此影响而持续演化
- 默认纯前端部署，不依赖专用后端，不引入 token 成本
- 支持独立运行，同时为网站嵌入、浏览器插件和可选 `serverless` 增强保留空间
- 以单仓库开发、多个 npm 包发布的方式组织工程

## 非目标

- 不在引擎内部写死角色名单
- 不让 UI 持有业务真相
- 不让默认产品路径依赖服务端运行
- 不在 V1 阶段追求大规模并发渲染或推理
- 不把浏览器插件作为 V1 主线
- 不把完整移动端适配作为 V1 主线

## V1 已冻结决策

以下内容在 V1 中视为已冻结：

- 唯一一等壳层是 `Standalone App`
- 唯一公开 UI 入口是 `<brain-vat-world>`
- 浏览器插件只保留接口层面的兼容空间
- 角色内容采用目录型 manifest，不采用单文件 JSON
- 官方演示世界固定为三个角色
- 第三方扩展在 V1 只开放角色包和消息源包
- `serverless` 只能增强，不能成为真相来源
- 移动端兼容只保留扩展口，不进入 V1 主开发线

## 核心原则

- 配置驱动内容
- 引擎与 UI 分离
- 本地状态是默认真相来源
- 先固定公开协议，再推进实现细节
- 内容包负责描述内容，引擎负责策略和执行
- 外部能力通过 Provider 接入
- V1 有意保持收敛

## 产品形态

项目由四层组成：

- 无界面引擎 `Headless Engine`
  - 负责世界生命周期、角色状态、记忆、关系、调度、信息流和公开 API
- `Web Components`
  - 第一层公开 UI 入口，只接收引擎输出的 ViewModel
- `Standalone App`
  - V1 官方壳层
- `NPM Packages`
  - 引擎及相关模块的发布形态

## Headless Engine

引擎只负责业务行为，不负责展示层。

负责：

- 加载世界
- 实例化角色
- 管理角色状态
- 写入与压缩记忆
- 更新关系
- 消费外部信息
- 调度互动
- 归一化模型输出
- 对外暴露 Command、Event 和 ViewModel

不负责：

- 页面布局
- 面板编排
- 品牌样式
- 渲染层展示决策

## 仓库结构

推荐仓库结构如下：

```text
/brain-in-a-vat
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
    /official
      /demo-world
  /characters
    /official
      /niziiro-mao
      /hiyori-momose
      /jin-natori
  /sources
    /official
      /entertainment-feed
      /history-tech-feed
      /world-briefing
  /docs
  /tooling
```

## 包职责

### `packages/engine-core`

世界生命周期、角色、记忆、关系、调度、事件流和公开协议的唯一真相源。

### `packages/browser-runtime`

浏览器执行层：能力探测、页面可见性、多标签页主实例选举和运行等级划分。

当前已落地：

- WebGPU 能力探测
- 页面可见性处理
- 多标签页主实例选举
- 基础运行等级输出

当前仍为后续扩展位：

- Worker 深度编排
- Service Worker 协调

### `packages/config-schema`

负责所有 Pack 的 schema 定义、校验、迁移和结构化错误处理。

### `packages/provider-webllm`

面向浏览器本地推理的模型 Provider 实现。

### `packages/provider-indexeddb`

面向状态、记忆、关系和日志的持久化 Provider 实现。

### `packages/provider-rss`

负责 RSS、Atom 和 JSON Feed 的获取、规范化和基础处理。

### `packages/renderer-live2d`

负责角色渲染、资源生命周期、动作/表情映射和降级展示。

### `packages/web-components`

公开 UI 包。根据稳定 ViewModel 渲染界面，并把 Command 派发回引擎。

### `packages/shared`

无业务归属的底层共享类型和工具函数。

### `apps/standalone`

V1 唯一官方壳层。

## 依赖规则

允许的依赖方向：

- `apps/standalone -> web-components / browser-runtime / providers / config-schema`
- `web-components -> engine-core(public api) / renderer-live2d`
- `browser-runtime -> engine-core`
- `provider-* -> engine-core(interface) / config-schema`
- `renderer-live2d -> config-schema / shared`

禁止的依赖方向：

- `engine-core -> web-components`
- `engine-core -> renderer-live2d`
- `engine-core -> 具体 provider 实现`
- `provider-* -> web-components`
- `renderer-live2d -> engine-core` 业务模块

## 核心领域模型

- `World`
  - 一个完整可运行的世界
- `Character`
  - 一个角色实体或世界内实例
- `Relationship`
  - 角色之间的有向关系边
- `Memory`
  - 短期记忆、情节记忆、长期记忆
- `Scene`
  - 可见角色、焦点状态、频道和展示上下文
- `Source`
  - 外部信息输入
- `Interaction`
  - 一次消息、回应、冲突、认同或旁观行为
- `Event`
  - 标准状态变化单位

## 角色数量模型

引擎要支持很多角色在同一世界模型中“存在”，但不要求它们同时处于高成本活跃态。

运行分层：

- 已注册角色
- 已加载角色
- 已激活角色
- 已可视角色

V1 用三个角色验证架构。大规模并发执行不属于 V1 要求。

## Pack 体系

V1 只定义三类 Pack：

- `Character Pack`
- `Source Pack`
- `World Pack`

共同约束：

- 目录型
- 声明式
- 无代码
- 不允许携带脚本或敏感信息
- 不允许覆盖引擎策略

## Character Pack

Character Pack 回答一个问题：这个角色是谁。

推荐目录结构：

```text
character-pack/
  character.manifest.json
  persona.json
  memory-profile.json
  render.manifest.json
  source-affinity.json
  relationship-profile.json
  assets/
```

负责定义：

- 身份
- 性格画像
- 说话风格
- 兴趣权重
- 记忆偏好
- 消息源偏好
- 默认关系倾向
- 渲染资源映射

不负责：

- 全局世界规则
- 缓存策略
- 调度策略
- 引擎记忆算法

## Source Pack

Source Pack 回答一个问题：这个信息源是什么。

推荐目录结构：

```text
source-pack/
  source.manifest.json
  filters.json
  routing.json
  normalization.json
  assets/
```

负责定义：

- 源类型
- 地址入口
- 分类
- 可信度
- 源自身过滤规则
- 路由提示
- 规范化提示

不负责：

- 最终缓存 TTL
- 最终目标角色列表
- 世界内是否启用
- 引擎侧消费节奏

## World Pack

World Pack 回答一个问题：角色和消息源如何组装成一个运行中的世界。

推荐目录结构：

```text
world-pack/
  world.manifest.json
  cast.json
  sources.json
  relationships.json
  scene.json
  ui-hints.json
```

负责定义：

- 世界身份和启动行为
- 角色实例
- 消息源绑定
- 初始关系图
- 初始场景和频道

不负责：

- 改写角色核心身份
- 引擎缓存或调度策略

## 配置归属规则

- 性格、兴趣和说话方式属于 Character Pack
- 源类型、源自身过滤和可信度属于 Source Pack
- 某个世界里启用了哪些角色和消息源属于 World Pack
- 世界内的显式路由和屏蔽属于 World Pack
- 缓存、调度、恢复、记忆压缩和关系算法属于引擎

## 解析优先级

从高到低如下：

1. 引擎硬约束
2. World Pack 显式绑定或禁用
3. Character Pack 偏好和禁忌
4. Source Pack 默认建议
5. 引擎启发式补全

## 初始化协议

引擎通过一个统一入口创建：

```text
createEngine(initConfig) -> EngineHandle
```

`initConfig` 顶层结构包括：

- `apiVersion`
- `world`
- `assets`
- `providers`
- `persistence`
- `runtime`
- `hooks`
- `extensions`

各字段职责：

- `apiVersion`
  - 协议版本
- `world`
  - 要加载的世界
- `assets`
  - 资源定位和解析规则
- `providers`
  - 模型、存储、消息源、资源和可选的 `serverless` bridge
- `persistence`
  - 命名空间、恢复策略和导入快照
- `runtime`
  - 运行表面和高层运行偏好
- `hooks`
  - 生命周期与错误回调
- `extensions`
  - 未来扩展字段

## Provider 体系

Provider 类型包括：

- `ModelProvider`
- `StorageProvider`
- `SourceProvider`
- `AssetProvider`
- `ServerlessBridge`

规则：

- Provider 负责接入外部能力
- 业务决策由引擎负责
- `serverless` 只能增强，不能取代本地真相源

## 公开 API

引擎只暴露一个运行句柄：`EngineHandle`

最小公开方法：

- `start()`
- `pause()`
- `resume()`
- `destroy()`
- `dispatch(command)`
- `subscribe(listener)`
- `getViewModel(name, query?)`
- `getCapabilityProfile()`
- `exportState()`
- `importState(snapshot)`

不公开的内容：

- 内部 store
- 内部实体
- 存储表结构
- 调度器内部状态
- 缓存实现细节

## Command 协议

所有业务输入都统一通过 Command 进入引擎。

V1 稳定命令包括：

- `engine.loadWorld`
- `engine.start`
- `engine.pause`
- `engine.resume`
- `conversation.sendMessage`
- `conversation.interrupt`
- `scene.focusCharacter`
- `scene.setVisibleCharacters`
- `character.activate`
- `character.deactivate`
- `source.enable`
- `source.disable`
- `source.refresh`
- `source.injectItems`
- `state.export`
- `state.import`
- `memory.forgetById`
- `memory.forgetByScope`

UI 可以发送消息，但只能通过派发命令进入引擎。

## Event 协议

所有对外状态变化都通过 Event 离开引擎。

V1 稳定事件包括：

- `engine.ready`
- `engine.started`
- `engine.paused`
- `engine.destroyed`
- `world.loaded`
- `scene.updated`
- `character.reply.started`
- `character.reply.completed`
- `character.state.changed`
- `relationship.changed`
- `memory.updated`
- `source.items.ingested`
- `source.fetch.failed`
- `resource.status.changed`
- `capability.profile.changed`
- `state.restored`
- `state.exported`
- `engine.error`

## ViewModel 协议

UI 只能读取 ViewModel。

V1 稳定 ViewModel 包括：

- `WorldViewModel`
- `CharacterViewModel`
- `ConversationViewModel`
- `RelationshipViewModel`
- `ResourceViewModel`

ViewModel 是内部业务状态和可渲染数据之间的翻译层。

## UI 边界

UI 层只有三项职责：

- 渲染 ViewModel
- 捕获用户意图
- 把用户意图转换为 Command

UI 不得：

- 持有业务真相
- 直接修改角色状态
- 直接遍历内部记忆和关系结构

## Web Component 方案

V1 只公开一个组件：

- `<brain-vat-world>`

支持两种接入方式：

- 接收一个已经创建好的 `engine instance`
- 接收一份 `initConfig` 并在组件内部创建引擎

它不定义第二套业务协议，只消费引擎已有公开能力。

## Standalone App

`Standalone App` 是 V1 唯一官方壳层。

负责：

- 加载官方世界包
- 挂载 `<brain-vat-world>`
- 暴露调试入口
- 暴露导入导出入口
- 展示资源、关系、记忆和错误状态

它不是系统本体，只是官方展示和接入壳。

## 记忆系统

记忆分三层：

- 短期记忆
- 情节记忆
- 长期记忆

要求：

- 长期记忆必须经过摘要、筛选和去重
- 记忆必须保留来源和审计元数据
- 必须支持遗忘、删除、降权和回滚
- 角色漂移必须被 guardrails 限制住

## 关系系统

关系是有向的。

V1 固定六个维度：

- `familiarity`
- `trust`
- `warmth`
- `tension`
- `curiosity`
- `influence`

关系变化由以下因素共同驱动：

- 用户输入
- 消息源内容
- 角色互动
- 场景上下文

## 信息消费管线

引擎通过一条统一管线消费信息：

1. 获取
2. 解析
3. 规范化
4. 去重
5. 过滤
6. 安全清洗
7. 分类与打标签
8. 路由
9. 摘要
10. 写入记忆
11. 触发互动

这条管线属于引擎和 Provider，不属于 Pack。

## 缓存与持久化

目标分层如下：

- `Service Worker + Cache Storage`
  - 静态资源、Live2D 资源、消息源原始响应
- `IndexedDB`
  - 世界状态、记忆、关系、事件日志、消息源游标
- `OPFS` 或等价的大文件层
  - 模型文件缓存

缓存策略、恢复规则和底层 TTL 由引擎负责，不向普通用户开放。

当前 V1 实现中，已经落地的是 `IndexedDB` 持久化与浏览器默认静态资源缓存；`Service Worker + Cache Storage` 和大文件缓存层仍属于下一轮补强项。

## 浏览器运行时

`browser-runtime` 负责：

- WebGPU 能力探测
- 页面可见性与生命周期处理
- 多标签页主实例选举
- 能力等级上报

当前已落地的是能力探测、页面可见性、多标签页主实例选举和能力等级输出；Worker 协调与 Service Worker 协调仍属于预留能力。

它解决运行环境约束，不负责世界行为。

## 能力分级

能力分级决定：

- 模型档位
- 可视角色数量
- 激活角色数量
- 动画精度
- 后台自动演化强度

设备能力会影响运行方式，但不会反向影响 Pack 结构。

## 移动端策略

移动端不是 V1 交付主线，但架构必须保留扩展口。

需要预留的扩展点：

- `deviceProfileHint`
- 能力画像上报
- 资源降级状态
- 布局模式扩展

V1 只要求架构上不把后续移动端支持的路堵死。

## 浏览器插件策略

浏览器插件不进入 V1 主开发线。

但架构上仍需为以下事项保留空间：

- 资源路径解析
- Provider 替换
- Host Bridge 接入
- 生命周期适配

## Serverless 策略

`serverless` 只能增强项目，不能成为世界运行的基础。

未来可以承担：

- 消息源代理
- 同步
- 备份
- 预处理

未来不能承担：

- 世界状态的唯一真相源
- 角色主推理的唯一真相源
- 唯一记忆真相源

## 安全边界

- 所有外部内容都按资料处理，不按指令处理
- 必须把 prompt injection 和内容污染纳入威胁模型
- Pack 不允许携带脚本和敏感信息
- V1 第三方扩展只开放角色包和消息源包
- 高权限行为插件不在当前范围内

## 官方 V1 演示

官方演示刻意收窄：

- 一个世界包
- 三个角色包
- 三个消息源包
- 一个官方壳
- 一个公开 Web Component

目标是验证：

- 三角色关系张力
- 记忆流转
- 消息源分流
- 共享世界行为
- 引擎和 UI 的分离

## 开发顺序

推荐实现顺序如下：

1. Workspace 和工具链
2. Schema 与 Pack 基建
3. 公开协议骨架
4. 引擎最小闭环
5. 记忆系统
6. 关系与互动调度
7. Provider 接口
8. Provider 实现
9. 浏览器运行时
10. Live2D 渲染层
11. Web Components
12. Standalone 壳层
13. 调试与观测
14. 测试体系
15. 发布准备

不要先做页面，再回头补架构。

## V1 明确不做

- 多公开组件体系
- 浏览器插件正式主线
- 完整 `serverless` 实现
- 完整移动端适配
- 大规模角色压力验证
- 高权限第三方插件体系

## V1 完成标准

V1 至少要满足以下条件：

- 可以通过 World Pack 启动世界
- 可以同时加载三个角色包和三个消息源包
- “用户输入 -> 引擎处理 -> 角色回复 -> 记忆更新 -> 关系变化 -> UI 渲染”闭环可正常运行
- 世界状态可以导出和恢复
- 角色、消息源和世界内容全部来自 Pack，而不是硬编码分支
- UI 与引擎保持解耦
- 初始化协议、Command、Event 和 ViewModel 已固定并可使用
- `Standalone App` 能完整演示 V1 闭环

## 文档规划

推荐文档结构：

```text
/docs
  /00-overview
  /01-architecture
  /02-domain
  /03-pack-spec
  /04-engine-api
  /05-runtime
  /06-rendering-ui
  /07-data
  /08-quality
  /09-roadmap
  /adr
```

## 结论

`Brain-in-a-Vat Engine` 应按“配置驱动的无界面引擎 + 最小稳定 UI 协议 + 单一官方壳 + 多包 monorepo”的方向推进。

顺序很重要：先定义协议、边界和内容结构，再在其上实现运行时、渲染层和应用壳。
