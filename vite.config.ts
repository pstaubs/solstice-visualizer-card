import { defineConfig } from "vite";
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { resolve } from "path";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
	base: "",
	plugins: [react(), cssInjectedByJsPlugin()],
	server: {
		watch: {
			usePolling: true
		}
	},
	build: {
		sourcemap: "inline",
		minify: false,
		rollupOptions: {
			input: resolve(__dirname, "src/main.tsx"),
			output: {
				entryFileNames: `index.js`,
				chunkFileNames: `[name].js`,
				assetFileNames: `[hash].[ext]`,
			},
		},
	},
});
