# Command 规范

## 目标

所有业务输入都通过 Command 进入引擎，避免 UI 或宿主直接修改内部状态。

## 通用结构

```json
{
  "type": "conversation.sendMessage",
  "requestId": "req_xxx",
  "payload": {},
  "meta": {}
}
```

## 字段说明

- `type`：命令类型
- `requestId`：请求标识，便于追踪
- `payload`：业务内容
- `meta`：来源与追踪信息

## V1 稳定命令

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

## 规则

- UI 发送消息必须走 `conversation.sendMessage`
- 不允许出现“直接设定某个内部字段”的命令
- `meta` 不能承载业务真相
