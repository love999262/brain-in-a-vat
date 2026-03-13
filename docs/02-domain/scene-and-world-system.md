# 场景与世界系统

## 目标

世界系统负责装配内容，场景系统负责定义当前前台如何运行。

## World

World 是运行的基本单位，包含：

- 世界配置
- 角色实例
- 消息源绑定
- 初始关系图
- 场景配置
- 世界级状态

## 世界加载顺序

1. 读取 World Pack
2. 校验 `world.manifest.json`
3. 读取角色实例配置
4. 读取消息源绑定配置
5. 加载相关 Character Pack 与 Source Pack
6. 构建初始关系图
7. 构建初始 Scene
8. 进入运行态

## Scene

Scene 表示当前前台上下文，至少包含：

- 当前可见角色
- 当前焦点角色
- 当前频道
- 展示模式
- 共享记忆模式

## 频道

V1 支持三类频道：

- `direct`
- `group`
- `ambient`

频道只决定当前互动上下文，不改变角色底层配置。

## 角色运行状态

建议运行态：

- `dormant`
- `idle`
- `active`
- `focused`
- `speaking`

## 场景与 UI 的边界

Scene 是业务对象，不是 UI 布局对象。  
UI 可以根据 Scene 选择如何展示，但 Scene 不应包含具体像素或组件状态。
