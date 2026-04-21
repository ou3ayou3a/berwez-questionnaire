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

// ── CLAUDE AI ANALYSIS ───────────────────────────────────────────────────────
app.post("/api/analyze", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured on server." });

  const { name, answers, notes, scores, questions } = req.body;

  // Build a readable summary of answers for Claude
  const answerLines = questions.map(q => {
    const a = answers[q.id] || 'unanswered';
    const n = notes[q.id] ? ` (note: "${notes[q.id]}")` : '';
    return `Q${q.id}. ${q.text} → ${a.toUpperCase()}${n}`;
  }).join('\n');

  const scoreLines = scores.slice(0, 12).map((s, i) =>
    `${i + 1}. ${s.name} — ${s.score}%`
  ).join('\n');

  const prompt = `You are a warm, knowledgeable Christian theologian analyzing the results of a denominational alignment questionnaire called "The Berwez Questionnaire." A person named ${name} answered 43 doctrinal questions with Yes, No, or Partially (with optional notes explaining their nuance).

Here are their answers:
${answerLines}

Here are their denomination alignment scores (highest to lowest):
${scoreLines}

Write a personalized 3-4 paragraph theological analysis for ${name}. Your tone should be warm, fraternal, and insightful — like a wise seminary professor who genuinely cares about the student.

Paragraph 1: Identify their primary theological identity — which tradition(s) they most align with and WHY based on their specific answers. Name the 2-3 strongest signals (specific questions/answers that drove the result).

Paragraph 2: Identify the most interesting tensions or surprises in their answers — places where they break from their primary tradition or hold views that bridge multiple traditions. Reference specific questions.

Paragraph 3: If they answered "Partially" on any questions with notes, engage with their nuance directly. What does their partial position reveal about their theological instincts?

Paragraph 4: A brief, encouraging closing — what their unique blend says about their faith journey. End with a thought-provoking question they might want to explore further.

Keep it under 400 words. Write in second person ("You lean toward..."). Do not use bullet points. Do not use markdown headers. Write flowing prose.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Claude API error:", err);
      return res.status(500).json({ error: "Claude API returned an error." });
    }

    const data = await response.json();
    const text = data.content?.map(b => b.text || '').join('') || '';
    res.json({ analysis: text });
  } catch (err) {
    console.error("Claude API call failed:", err);
    res.status(500).json({ error: "Failed to reach Claude API." });
  }
});

app.use(express.static(path.join(__dirname, "dist")));
// Express 5 wildcard syntax
app.get("/{*splat}", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✠ Berwez Questionnaire running on port ${PORT}`));
