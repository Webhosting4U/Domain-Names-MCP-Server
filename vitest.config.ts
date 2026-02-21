import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.test.ts"],
    alias: {
      "agents/mcp": path.resolve(__dirname, "node_modules/agents/src/mcp"),
    },
  },
  resolve: {
    alias: {
      "agents/mcp": path.resolve(__dirname, "node_modules/agents/src/mcp"),
    },
  },
});
