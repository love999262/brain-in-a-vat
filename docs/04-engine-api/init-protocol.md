# 初始化协议

## 目标

引擎初始化必须是稳定协议，而不是一组零散参数。

## 统一入口

概念入口：

```text
createEngine(initConfig) -> EngineHandle
```

## `initConfig` 顶层字段

- `apiVersion`
- `world`
- `assets`
- `providers`
- `persistence`
- `runtime`
- `hooks`
- `extensions`

## 字段职责

### `apiVersion`

初始化协议版本。V1 固定为 `1.0`。

### `world`

要加载的世界。必须存在。

### `assets`

资源定位规则，包括 Pack、模型和 Live2D 资源路径解析。

### `providers`

模型、存储、消息源、资源和可选 serverless bridge。

### `persistence`

本地命名空间、状态恢复开关、导入快照。

### `runtime`

运行表面和高层偏好，例如：

- `surface`
- `autoStart`
- `debug`
- `performancePreset`
- `deviceProfileHint`

### `hooks`

生命周期和错误回调。

### `extensions`

未来扩展字段。

## 最小初始化要求

最小可用初始化至少提供：

- `apiVersion`
- `world`
- `providers.model`

如果世界依赖外部路径，还需要提供 `assets`。

## 边界

初始化协议不开放以下实现细节：

- 缓存 TTL
- 数据表结构
- 调度器参数
- 内部 Worker 数量
