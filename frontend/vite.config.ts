import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    target: "es2022",
    outDir: resolve(import.meta.dirname, "../custom_components/zigbee_floorplan/frontend"),
    emptyOutDir: true,
    sourcemap: false,
    minify: true,
    lib: {
      entry: resolve(import.meta.dirname, "src/index.ts"),
      formats: ["es"],
      fileName: () => "zigbee-floorplan.js",
    },
    // lib mode keeps whitespace in ES output; this is a final bundle, so minify fully
    rolldownOptions: { output: { minify: true } },
  },
  worker: { format: "es" },
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
