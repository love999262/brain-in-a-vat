# V1 开发任务树

## Phase 0：仓库底座

- 建立 `pnpm workspace`
- 建立根 `package.json`
- 建立 `pnpm-workspace.yaml`
- 建立 `apps / packages / worlds / characters / sources / tooling`
- 建立 TypeScript 共享配置
- 建立 lint / test / format 基线

## Phase 1：Schema 与 Pack 基建

- 建立 `config-schema`
- 定义通用 manifest schema
- 定义角色包 schema
- 定义消息源包 schema
- 定义世界包 schema
- 定义结构化错误码
- 建立 pack 加载器

## Phase 2：公开协议骨架

- 定义 `InitConfig`
- 定义 `EngineHandle`
- 定义 Command / Event / ViewModel 协议
- 定义错误模型与生命周期

## Phase 3：引擎最小闭环

- 世界加载
- 角色实例化
- 场景初始化
- 初始关系图构建
- 事件总线
- 命令分发器

## Phase 4：记忆系统

- 短期记忆
- 情节记忆
- 长期记忆
- 摘要和审计能力

## Phase 5：关系与互动调度

- 关系更新规则
- 三角色互动调度
- 用户和消息源触发链路

## Phase 6：Provider 接口层

- `ModelProvider`
- `StorageProvider`
- `SourceProvider`
- `AssetProvider`
- `ServerlessBridge`

## Phase 7：真实 Provider 实现

- `provider-indexeddb`
- `provider-rss`
- `provider-webllm`

## Phase 8：运行时

- 能力探测
- 运行等级
- 多标签页主实例
- 生命周期暂停恢复

## Phase 9：渲染层

- Live2D 渲染输入协议
- 资源加载
- 动作表情映射
- fallback

## Phase 10：Web Components

- 建立 `web-components`
- 公开 `<brain-vat-world>`
- 命令桥与 ViewModel 渲染桥

## Phase 11：Standalone 壳层

- 建立 `apps/standalone`
- 接入官方世界
- 接入调试与导入导出

## Phase 12：测试与发布准备

- 契约测试
- 烟测
- 文档对齐
- npm 发布准备
