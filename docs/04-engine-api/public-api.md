# 公开 API

## 目标

本文档定义对外稳定的引擎句柄和最小操作面。

## `EngineHandle`

这是唯一公开运行句柄。

## 最小公开方法

- `start()`
- `pause()`
- `resume()`
- `destroy()`
- `dispatch(command)`
- `subscribe(listener)`
- `unsubscribe(listener)`
- `getViewModel(name, query?)`
- `getCapabilityProfile()`
- `exportState()`
- `importState(snapshot)`

## 方法说明

### `start()`

启动世界运行。

### `pause()`

暂停自动运行，但不销毁状态。

### `resume()`

从暂停状态恢复。

### `destroy()`

销毁当前实例，释放订阅和运行时资源。

### `dispatch(command)`

所有业务输入统一从这里进入。

### `subscribe(listener)`

订阅 Event。

### `getViewModel(name, query?)`

获取当前渲染所需的稳定视图数据。

### `exportState()` / `importState(snapshot)`

导出与导入世界状态。

## 不公开的内容

- 内部 store
- 内部实体结构
- 具体数据库表结构
- 缓存实现细节
- 调度器内部状态
