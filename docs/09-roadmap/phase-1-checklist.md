# Phase 1 检查清单

## 目标

完成 Pack schema、校验器和样例内容骨架，为后续引擎和运行时实现提供稳定输入。

## 输入

- `Phase 0` 工程骨架
- Pack 总览和字段规范文档

## 输出

至少应产出以下内容：

- `packages/config-schema` 包骨架
- 通用 manifest schema
- Character / Source / World schema
- 结构化错误码
- Pack 加载器和路径解析器
- 官方样例世界、角色、消息源骨架

## 任务清单

### schema

- [x] 定义通用 manifest schema
- [x] 定义 Character Pack schema
- [x] 定义 Source Pack schema
- [x] 定义 World Pack schema
- [x] 定义 schema 版本约束

### 错误与校验

- [x] 定义结构化错误码
- [x] 实现字段缺失校验
- [x] 实现引用关系校验
- [ ] 实现路径存在性校验

### 加载器

- [x] 实现 Pack 根路径解析
- [x] 实现 manifest 解析
- [x] 实现 World 组装前的预校验

### 样例内容

- [x] 建立官方 world 目录骨架
- [x] 建立三个官方 character 目录骨架
- [x] 建立三个官方 source 目录骨架

## 验收标准

- 正确 Pack 能通过校验
- 错误 Pack 能返回结构化错误
- World 对 Character / Source 的引用能被解析
- 样例内容目录结构与文档一致

## 本阶段不要做的事

- 不提前补 Command / Event 实现
- 不在 schema 中夹带引擎运行时逻辑
- 不在样例 Pack 中塞业务代码

## 完成后必须更新

- `docs/09-roadmap/execution-status.md`
- 如有字段调整，同时更新 Pack 文档与示例文件
