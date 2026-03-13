# Source Pack 规范

## 目标

Source Pack 用于描述一个可复用的信息源模板。

## 推荐目录结构

```text
source-pack/
  source.manifest.json
  filters.json
  routing.json
  normalization.json
  assets/
```

## 文件职责

### `source.manifest.json`

负责：

- 源标识
- 源类型
- 地址入口
- 访问模式
- 内容类别
- 基础可信度

### `filters.json`

负责：

- 源自身过滤规则
- 关键字和标签白黑名单
- 作者和域名过滤
- 基础安全过滤提示

### `routing.json`

负责：

- 默认受众标签
- 默认投递模式
- 优先级提示
- 主题提示

### `normalization.json`

负责：

- 标题字段回退
- 正文字段回退
- 时间字段回退
- 标签提取提示

## 边界

Source Pack 不负责：

- 最终缓存 TTL
- 最终投递角色实例
- 世界内是否启用
- 最终消费节奏
