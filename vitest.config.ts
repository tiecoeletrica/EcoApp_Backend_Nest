import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";
import tsConfigParh from "vite-tsconfig-paths";

export default defineConfig({
  test: {
    globals: true,
    root: "./",
  },
  plugins: [
    tsConfigParh(),
    swc.vite({
      module: { type: "es6" },
    }),
  ],
});
