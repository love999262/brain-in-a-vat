# 缓存策略

## 目标

缓存策略用于减少 Live2D 资源、模型资源和消息源重复加载带来的成本。

## 目标缓存分层

### 静态资源缓存

规划中使用 `Service Worker + Cache Storage`，缓存：

- 应用静态资源
- Live2D 资源
- 消息源原始响应

### 大文件缓存

优先用于模型文件和大资源。

### 结构化状态缓存

由 `IndexedDB` 承担，用于状态恢复和世界真相持久化。

## 当前实现状态

- `DONE` 使用 `IndexedDB` 持久化世界状态、记忆、关系和对话快照
- `DONE` 使用构建产物中的静态资源目录承载 Pack 内容
- `TODO` 引入 `Service Worker + Cache Storage`
- `TODO` 引入大文件缓存层

## TTL 分类

V1 采用类别型 TTL，而不是在 Pack 中写死秒数：

- `realtime`
- `slowburn`
- `archive`

具体秒数由引擎内部策略决定。

## 边界

- 用户不直接配置缓存算法
- Pack 不携带缓存秒数
