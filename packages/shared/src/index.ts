export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T extends object
      ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
      : T;

export type Unsubscribe = () => void;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function createStableId(prefix: string): string {
  const randomChunk = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${randomChunk}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function resolveSiblingPath(basePath: string, relativePath: string): string {
  const sanitizedBase = basePath.replace(/\\/g, "/");
  const sanitizedRelative = relativePath.replace(/\\/g, "/");

  if (/^https?:\/\//.test(sanitizedRelative) || sanitizedRelative.startsWith("/")) {
    return sanitizedRelative;
  }

  const baseDir = sanitizedBase.slice(0, sanitizedBase.lastIndexOf("/") + 1);
  return new URL(sanitizedRelative, `https://brain-vat.local/${baseDir}`).pathname.replace(/^\//, "");
}

type Listener<T> = (payload: T) => void;

export class Emitter<EventMap extends Record<string, unknown>> {
  private readonly listeners = new Map<keyof EventMap, Set<Listener<EventMap[keyof EventMap]>>>();

  on<K extends keyof EventMap>(type: K, listener: Listener<EventMap[K]>): Unsubscribe {
    const current = this.listeners.get(type) ?? new Set<Listener<EventMap[keyof EventMap]>>();
    current.add(listener as Listener<EventMap[keyof EventMap]>);
    this.listeners.set(type, current);

    return () => {
      const next = this.listeners.get(type);
      next?.delete(listener as Listener<EventMap[keyof EventMap]>);
    };
  }

  emit<K extends keyof EventMap>(type: K, payload: EventMap[K]): void {
    this.listeners.get(type)?.forEach((listener) => {
      listener(payload);
    });
  }

  clear(): void {
    this.listeners.clear();
  }
}

export function groupBy<T, K extends PropertyKey>(
  values: readonly T[],
  getKey: (value: T) => K
): Record<K, T[]> {
  return values.reduce(
    (acc, value) => {
      const key = getKey(value);
      acc[key] ??= [];
      acc[key].push(value);
      return acc;
    },
    {} as Record<K, T[]>
  );
}
