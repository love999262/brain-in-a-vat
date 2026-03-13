# Pack 总览

## 目标

Pack 是项目的内容装配单位，用来把“角色、消息源、世界”从代码中剥离出来。

V1 只定义三类 Pack：

- `Character Pack`
- `Source Pack`
- `World Pack`

## 通用原则

- 使用目录型结构
- 使用 JSON 描述内容
- 不包含可执行代码
- 不携带敏感凭据
- 不覆盖引擎缓存、调度、回收和安全策略

## 通用字段

所有 manifest 至少包含：

- `id`
- `kind`
- `name`
- `version`
- `schemaVersion`
- `engine`

## Pack 的职责边界

### Character Pack

定义角色是谁。

### Source Pack

定义信息源是什么。

### World Pack

定义角色和消息源如何在一个世界中组合运行。

## 加载原则

Pack 加载顺序固定为：

1. 读取 World Pack
2. 解析角色实例和消息源绑定
3. 加载相关 Character Pack 与 Source Pack
4. 校验所有引用
5. 组装成运行世界

## 优先级原则

从高到低：

1. 引擎硬约束
2. World Pack 显式绑定或禁用
3. Character Pack 默认偏好
4. Source Pack 默认建议
5. 引擎启发式补全
