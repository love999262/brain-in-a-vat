# 错误模型

## 目标

错误必须结构化，供 UI、调试面板和宿主站统一处理。

## 通用结构

```json
{
  "code": "CONFIG_INVALID",
  "message": "配置不合法",
  "detail": {},
  "source": "config-schema"
}
```

## V1 核心错误码

- `CONFIG_INVALID`
- `PACK_NOT_FOUND`
- `SCHEMA_MISMATCH`
- `PROVIDER_UNAVAILABLE`
- `MODEL_LOAD_FAILED`
- `SOURCE_FETCH_FAILED`
- `STATE_RESTORE_FAILED`
- `UNSUPPORTED_CAPABILITY`
- `ENGINE_INTERNAL_ERROR`

## 使用规则

- 不要依赖错误文案做判断
- 优先依赖 `code`
- `detail` 用于调试和日志，不保证给最终用户直接展示

## 分层原则

- 配置错误优先由 `config-schema` 抛出
- Provider 错误优先由对应 Provider 包映射后上报
- 引擎错误统一转成 `engine.error` 事件
