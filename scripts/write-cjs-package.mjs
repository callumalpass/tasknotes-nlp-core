import { mkdir, writeFile } from "node:fs/promises";

const distCjsUrl = new URL("../dist-cjs/", import.meta.url);

await mkdir(distCjsUrl, { recursive: true });
await writeFile(
  new URL("package.json", distCjsUrl),
  `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`
);
