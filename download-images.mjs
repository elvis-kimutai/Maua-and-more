// Saves every product photo into ./images so the site no longer depends on the original links.
// Run once on your computer (needs Node 18+):   node download-images.mjs
import fs from "node:fs";
const txt = fs.readFileSync("products.js", "utf8").replace(/^[\s\S]*?window\.PRODUCTS\s*=\s*/, "").replace(/;\s*$/, "");
const products = JSON.parse(txt);
fs.mkdirSync("images", { recursive: true });
let done = 0, failed = [];
async function one(p) {
  const file = `images/${p.id}.jpg`;
  if (fs.existsSync(file)) return;
  try {
    const r = await fetch(p.img);
    if (!r.ok) throw new Error(r.status);
    fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  } catch (e) { failed.push(p.id + " (" + e.message + ")"); }
  if (++done % 20 === 0) console.log(done + "/" + products.length);
}
const queue = [...products];
await Promise.all(Array.from({ length: 6 }, async () => { while (queue.length) await one(queue.shift()); }));
console.log("Finished. Saved:", products.length - failed.length, "Failed:", failed.length);
if (failed.length) console.log(failed.join("\n"));
