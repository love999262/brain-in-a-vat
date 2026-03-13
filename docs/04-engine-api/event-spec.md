# Event 规范

## 目标

所有对外状态变化都通过 Event 离开引擎。

## 通用结构

```json
{
  "type": "character.reply.completed",
  "eventId": "evt_xxx",
  "timestamp": "2026-03-14T00:00:00Z",
  "payload": {},
  "meta": {}
}
```

## 字段说明

- `type`：事件类型
- `eventId`：事件标识
- `timestamp`：事件时间
- `payload`：结果内容
- `meta`：追踪信息

## V1 稳定事件

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

## 规则

- Event 表示结果，不表示意图
- UI、调试面板和宿主站都可以订阅 Event
- Event 可以输出摘要，不必暴露内部所有细节
