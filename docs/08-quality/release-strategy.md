# 发布策略

## 目标

项目以单仓库开发、多个 npm 包发布。

## V1 发布重点

优先稳定这些包：

- `@brain-vat/engine-core`
- `@brain-vat/config-schema`
- `@brain-vat/web-components`

其余包可以先标记为实验性。

## 版本发布原则

- 公开协议变动要有版本说明
- Pack schema 变动要有迁移说明
- README 和 docs 必须与当前发布状态一致

## 文档要求

每次准备发布前，应至少检查：

- 安装说明
- 公开 API
- 当前稳定包列表
- 版本兼容说明
