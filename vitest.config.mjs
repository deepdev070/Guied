import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/vitest/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/lib/**/*.ts", "packages/utils/src/**/*.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@civic/types": path.resolve(import.meta.dirname, "./packages/types/src"),
      "@civic/utils": path.resolve(import.meta.dirname, "./packages/utils/src"),
    },
  },
});
