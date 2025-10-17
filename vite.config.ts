import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      assets: path.resolve(__dirname, "./src/assets"),
      shared: path.resolve(__dirname, "./src/shared"),
    },
  },
  build: {
    target: "es2020",
    minify: "esbuild",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ["react", "react-dom", "react-router-dom"],
          ethers: ["ethers", "@wagmi/core", "viem"],
          ui: ["@tanstack/react-query"],
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit to 1000kb
  },
  server: {
    host: true,
    port: 5173,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "ethers",
      "@wagmi/core",
      "@tanstack/react-query",
    ],
  },
})
