# 依赖规则

## 目的

本文档用于冻结包之间的依赖方向，防止后续出现倒灌依赖和架构塌陷。

## 允许的依赖方向

- `apps/standalone -> web-components / browser-runtime / config-schema / provider-*`
- `web-components -> engine-core(public api) / renderer-live2d`
- `browser-runtime -> engine-core`
- `provider-* -> engine-core(interface) / config-schema`
- `renderer-live2d -> config-schema / shared`
- `config-schema -> shared`

## 禁止的依赖方向

- `engine-core -> web-components`
- `engine-core -> renderer-live2d`
- `engine-core -> 具体 provider 包`
- `engine-core -> apps/standalone`
- `provider-* -> web-components`
- `renderer-live2d -> engine-core` 业务模块
- `shared -> 任何高层业务包`

## 依赖判断原则

如果一个包需要知道业务真相，它应通过 `engine-core` 的公开协议获取，而不是反向依赖 UI 或 App。

如果一个包只提供能力，就不应该依赖展示层。

## 反模式

- 为了图省事，在 `apps/standalone` 里补一个业务状态管理器
- 让 `renderer-live2d` 直接访问角色完整实体
- 让 `provider-rss` 根据角色名做分发
- 在 `shared` 中放引擎状态对象

## 例外处理

如果确实需要新增依赖方向，必须先更新本文档和总纲，再开始实现。
