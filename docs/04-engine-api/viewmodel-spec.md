# ViewModel 规范

## 目标

ViewModel 是 UI 与引擎之间的数据边界。UI 只能读取 ViewModel，不应接触内部实体。

## V1 稳定 ViewModel

- `WorldViewModel`
- `CharacterViewModel`
- `ConversationViewModel`
- `RelationshipViewModel`
- `ResourceViewModel`

## `WorldViewModel`

至少包含：

- 世界标识
- 当前生命周期状态
- 当前能力等级
- 当前活跃角色数
- 当前可视角色数
- 全局错误或警告摘要

## `CharacterViewModel`

至少包含：

- `id`
- `name`
- 可见状态
- 焦点状态
- 发言状态
- 当前情绪
- 当前精力
- 当前主题摘要
- 渲染状态摘要

## `ConversationViewModel`

至少包含：

- 当前频道
- 参与者
- 消息列表
- 正在生成状态
- 输入锁状态

## `RelationshipViewModel`

至少包含：

- 主要关系边
- 最近变化摘要
- UI 可直接渲染的关系图数据

## `ResourceViewModel`

至少包含：

- 模型状态
- Live2D 状态
- 缓存状态摘要
- 当前降级状态

## 规则

- ViewModel 是渲染友好数据，不是原始实体直出
- UI 不应依赖 ViewModel 之外的内部字段
