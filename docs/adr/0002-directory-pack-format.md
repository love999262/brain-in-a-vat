# ADR 0002：内容包采用目录型 manifest

## 决策

Character Pack、Source Pack、World Pack 全部采用目录型结构。

## 原因

- 角色和消息源不只是单个 JSON
- 后续资源文件、渲染文件、说明文件需要自然归档
- 目录型结构更适合扩展和维护

## 影响

- 需要路径解析器
- 需要 Pack 校验器
- 单文件 JSON 方案不再作为 V1 主方案
