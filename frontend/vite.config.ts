import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    target: "es2022",
    outDir: resolve(__dirname, "../custom_components/zigbee_floorplan/frontend"),
    emptyOutDir: true,
    sourcemap: false,
    minify: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "zigbee-floorplan.js",
    },
  },
  worker: { format: "es" },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
