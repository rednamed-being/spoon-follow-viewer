import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/spoon-follow-viewer/", // GitHub Pages リポジトリ名に合わせる
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
