import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      core: path.resolve(__dirname, "src/core"),
      pages: path.resolve(__dirname, "src/pages"),
      App: path.resolve(__dirname, "src/App.tsx"),
    },
  },
  build: {
    outDir: "build",
    emptyOutDir: false,
  },
});
