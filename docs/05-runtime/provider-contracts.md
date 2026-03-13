# Provider 协议

## 目标

Provider 负责接入外部能力，但不承担业务决策。

## Provider 列表

- `ModelProvider`
- `StorageProvider`
- `SourceProvider`
- `AssetProvider`
- `ServerlessBridge`

## `ModelProvider`

负责：

- 模型加载
- 推理执行
- 结果标准化
- 模型状态上报

## `StorageProvider`

负责：

- 状态读写
- 记忆读写
- 关系读写
- 日志读写

## `SourceProvider`

负责：

- 获取外部内容
- 原始条目规范化
- 提供源状态

## `AssetProvider`

负责：

- Pack 路径解析
- 资源路径解析
- 资源加载入口适配

## `ServerlessBridge`

职责仅限于增强能力，例如：

- 代理
- 同步
- 备份
- 预处理

## 共同规则

- Provider 不得直接修改世界业务状态
- Provider 不得写死角色或消息源规则
- Provider 错误必须结构化上报
