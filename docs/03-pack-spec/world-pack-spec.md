# World Pack 规范

## 目标

World Pack 负责把角色包和消息源包组合成一个可运行世界。

## 推荐目录结构

```text
world-pack/
  world.manifest.json
  cast.json
  sources.json
  relationships.json
  scene.json
  ui-hints.json
```

## 文件职责

### `world.manifest.json`

负责：

- 世界标识
- 启动行为
- 语言与区域设置
- 默认展示主题提示

### `cast.json`

负责：

- 角色实例列表
- 角色实例与 Character Pack 的绑定
- 角色实例初始可见性和初始状态覆盖

### `sources.json`

负责：

- 消息源绑定列表
- 源与世界实例角色的显式路由
- 源的显式禁用或优先级覆盖

### `relationships.json`

负责：

- 初始关系图
- 初始关系维度值

### `scene.json`

负责：

- 默认可见角色
- 默认焦点角色
- 频道与场景模式
- 共享记忆模式

### `ui-hints.json`

只提供官方壳展示提示，不承载业务真相。

## 边界

World Pack 可以覆盖实例态，但不能改写角色核心人格和引擎底层策略。
