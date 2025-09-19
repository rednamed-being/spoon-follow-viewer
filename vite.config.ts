import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/", // カスタムドメイン用にルートパスに戻す
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
