# Character Pack 规范

## 目标

Character Pack 用于描述一个角色模板，而不是一个具体运行实例。

## 推荐目录结构

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

## 文件职责

### `character.manifest.json`

根清单，负责：

- Pack 元信息
- 入口文件路径
- 能力声明
- 默认初始状态

### `persona.json`

负责：

- 身份
- 性格向量
- 说话风格
- 兴趣权重
- 价值锚点
- 不可突破的 guardrails

### `memory-profile.json`

负责：

- 角色偏好记住什么
- 更适合怎样的摘要风格
- 对冲突、赞美、不确定性的敏感度

### `render.manifest.json`

负责：

- Live2D 资源入口
- 动作和表情表
- 情绪到动作的映射
- fallback 静态图

### `source-affinity.json`

负责：

- 对哪些消息源或标签更感兴趣
- 对哪些消息源或标签更排斥
- 对可信度和新颖度的偏好

### `relationship-profile.json`

负责：

- 默认社交倾向
- 更容易亲近或冲突的触发条件
- 主导或跟随风格

## 边界

Character Pack 不负责：

- 世界装配
- 全局缓存
- 调度参数
- 具体数据库结构
- 具体模型推理实现
