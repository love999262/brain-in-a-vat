import path from "node:path";

import { viteStaticCopy } from "vite-plugin-static-copy";
import { defineConfig, normalizePath } from "vite";

const workspaceRoot = path.resolve(__dirname, "../..");
const worldsPath = normalizePath(path.resolve(workspaceRoot, "worlds", "official"));
const charactersPath = normalizePath(path.resolve(workspaceRoot, "characters", "official"));
const sourcesPath = normalizePath(path.resolve(workspaceRoot, "sources", "official"));

export default defineConfig({
  resolve: {
    alias: {
      "@brain-vat/shared": path.resolve(workspaceRoot, "packages/shared/src/index.ts"),
      "@brain-vat/config-schema": path.resolve(workspaceRoot, "packages/config-schema/src/index.ts"),
      "@brain-vat/engine-core": path.resolve(workspaceRoot, "packages/engine-core/src/index.ts"),
      "@brain-vat/browser-runtime": path.resolve(workspaceRoot, "packages/browser-runtime/src/index.ts"),
      "@brain-vat/provider-webllm": path.resolve(workspaceRoot, "packages/provider-webllm/src/index.ts"),
      "@brain-vat/provider-indexeddb": path.resolve(workspaceRoot, "packages/provider-indexeddb/src/index.ts"),
      "@brain-vat/provider-rss": path.resolve(workspaceRoot, "packages/provider-rss/src/index.ts"),
      "@brain-vat/renderer-live2d": path.resolve(workspaceRoot, "packages/renderer-live2d/src/index.ts"),
      "@brain-vat/web-components": path.resolve(workspaceRoot, "packages/web-components/src/index.ts")
    }
  },
  server: {
    fs: {
      allow: [workspaceRoot]
    }
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: worldsPath,
          dest: "packs/worlds"
        },
        {
          src: charactersPath,
          dest: "packs/characters"
        },
        {
          src: sourcesPath,
          dest: "packs/sources"
        }
      ]
    })
  ]
});
