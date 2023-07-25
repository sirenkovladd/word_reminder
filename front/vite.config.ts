import solid from "solid-start/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [solid({ ssr: false })],
  server: {
    host: '0.0.0.0',
    proxy: {
      "/api": {
        target: "http://localhost:5999",
      }
    }
  }
});
