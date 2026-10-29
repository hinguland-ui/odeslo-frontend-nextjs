// MapLibre runs its heavy work in a Web Worker. Bundlers can fail to find the worker file (the map then stays on
// "Loading map…"), so its files are served from /public/maplibre and the app points MapLibre at them.
import { copyFileSync, mkdirSync } from "node:fs";

const from = new URL("../node_modules/maplibre-gl/dist/", import.meta.url);
const to = new URL("../public/maplibre/", import.meta.url);
mkdirSync(to, { recursive: true });
for (const f of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) copyFileSync(new URL(f, from), new URL(f, to));
console.log("MapLibre worker files copied to public/maplibre");
