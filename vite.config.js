import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    optimizeDeps: {
        include: ['@radix-ui/react-tooltip'],
    },
    server: {
        allowedHosts: [
            "nutlike-crushing-anatomist.ngrok-free.dev",
            "dating-unison-cosmos.ngrok-free.dev",
            // Add other allowed hosts if needed
        ],
    },
});
