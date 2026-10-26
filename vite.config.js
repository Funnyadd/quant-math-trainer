import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "prompt",
            includeAssets: ["favicon.svg", "apple-touch-icon.png"],
            manifest: {
                id: "/",
                name: "Quant Math Trainer",
                short_name: "Quant Math",
                description:
                    "Timed multiplication, derivative, and integral practice, available offline.",
                theme_color: "#245d48",
                background_color: "#f4f6f0",
                display: "standalone",
                start_url: "/",
                scope: "/",
                icons: [
                    {
                        src: "/pwa-192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "any",
                    },
                    {
                        src: "/pwa-512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any",
                    },
                    {
                        src: "/pwa-maskable-512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2,wav,mp3}"],
                maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
                navigateFallback: "index.html",
                cleanupOutdatedCaches: true,
            },
        }),
    ],
});
