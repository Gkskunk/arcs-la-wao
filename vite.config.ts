import { defineConfig } from "vite";
import { cliDiscoveryPlugin } from "../packages/wao-cli/discovery.mjs";

export default defineConfig({
  plugins: [cliDiscoveryPlugin("arcs-la-wao")],
});
