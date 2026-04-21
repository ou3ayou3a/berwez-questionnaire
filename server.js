import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "5mb" }));

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function getPath(key) {
  return path.join(DATA_DIR, `${key.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`);
}
function read(key) {
  const p = getPath(key);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch { return null; }
}
function write(key, val) { fs.writeFileSync(getPath(key), JSON.stringify(val), "utf-8"); }
function del(key) { const p = getPath(key); if (fs.existsSync(p)) fs.unlinkSync(p); }

app.get("/api/data/:key", (req, res) => {
  const v = read(req.params.key);
  res.json({ value: v === null ? null : JSON.stringify(v) });
});
app.post("/api/data/:key", (req, res) => {
  try { write(req.params.key, JSON.parse(req.body.value)); res.json({ ok: true }); }
  catch { res.status(400).json({ error: "Invalid JSON" }); }
});
app.delete("/api/data/:key", (req, res) => { del(req.params.key); res.json({ ok: true }); });

app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Berwez Questionnaire running on port ${PORT}`));
