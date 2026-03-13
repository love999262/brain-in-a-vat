# 测试策略

## 目标

测试体系要覆盖协议、配置、引擎闭环和 UI 烟测，而不是只测页面。

## 分层

### Schema 测试

- Pack fixture 校验
- 非法字段报错
- 引用关系校验

### 引擎测试

- 世界加载
- Command 分发
- Event 产生
- ViewModel 生成
- 记忆与关系变化

### Provider 契约测试

- 模型 Provider
- 存储 Provider
- 消息源 Provider

### UI 烟测

- `<brain-vat-world>` 挂载
- 基础交互
- 销毁和重建

## 回放

V1 应尽早支持事件回放和固定输入重放测试。
