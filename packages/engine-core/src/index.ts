export { BrainVatEngine } from "./engine.js";
export type * from "./types.js";

import { BrainVatEngine } from "./engine.js";
import type { EngineHandle, InitConfig } from "./types.js";

export function createEngine(initConfig: InitConfig): EngineHandle {
  return new BrainVatEngine(initConfig);
}
