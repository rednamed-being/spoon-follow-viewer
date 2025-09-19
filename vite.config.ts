import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/spoon-follow-viewer/", // GitHub Pagesリポジトリ名に合わせる
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        notfound: "404.html"
      }
    }
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
