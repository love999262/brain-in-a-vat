# 包职责

## 目标

本文档用于定义每个包的职责范围、输入输出和明确禁止项。

## `packages/engine-core`

负责：

- 世界加载
- 角色实例化
- 记忆系统
- 关系系统
- 互动调度
- Command / Event / ViewModel 协议

不负责：

- DOM
- 浏览器存储实现
- Live2D 细节
- 具体模型实现

## `packages/browser-runtime`

负责：

- WebGPU 能力探测
- Worker 编排
- Service Worker 协调
- 页面可见性与暂停恢复
- 多标签页主实例机制

不负责：

- 角色业务规则
- UI 布局

## `packages/config-schema`

负责：

- Pack schema 定义
- Pack 校验
- 迁移器
- 结构化配置错误

不负责：

- 加载模型
- 执行消息源请求
- 运行角色逻辑

## `packages/provider-webllm`

负责：

- 模型加载
- 推理调用
- 生成结果标准化
- 模型状态上报

不负责：

- 决定角色该说什么
- 记忆写入规则

## `packages/provider-indexeddb`

负责：

- 世界状态持久化
- 记忆持久化
- 关系持久化
- 日志持久化

不负责：

- 决定数据何时写入
- 决定数据保留策略

## `packages/provider-rss`

负责：

- RSS / Atom / JSON Feed 获取
- 原始响应规范化
- 基础去重和字段提取

不负责：

- 角色路由
- 最终信息消费决策

## `packages/renderer-live2d`

负责：

- 模型资源加载
- 动作与表情映射
- 渲染实例管理
- fallback 与降级显示

不负责：

- UI 面板
- 业务状态计算

## `packages/web-components`

负责：

- 公开 `<brain-vat-world>`
- 内部界面组合
- ViewModel 订阅与渲染
- 用户命令派发

不负责：

- 业务真相
- 配置校验算法

## `packages/shared`

负责：

- 共享基础类型
- 纯工具函数

不负责：

- 临时杂项堆放
- 业务状态

## `apps/standalone`

负责：

- 官方壳层
- 官方世界装配
- 调试入口
- 导入导出入口

不负责：

- 引擎补丁
- 临时硬编码角色逻辑
