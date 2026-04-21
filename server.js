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

// ── SUBMISSIONS API (individual storage, no race conditions) ─────────────────
const SUBS_DIR = path.join(DATA_DIR, "submissions");
if (!fs.existsSync(SUBS_DIR)) fs.mkdirSync(SUBS_DIR, { recursive: true });

function subPath(id) { return path.join(SUBS_DIR, `${id.replace(/[^a-zA-Z0-9_-]/g, "_")}.json`); }

// Get all submissions
app.get("/api/submissions", (req, res) => {
  try {
    if (!fs.existsSync(SUBS_DIR)) return res.json([]);
    const files = fs.readdirSync(SUBS_DIR).filter(f => f.endsWith('.json'));
    const subs = files.map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(SUBS_DIR, f), 'utf-8')); }
      catch { return null; }
    }).filter(Boolean);
    // Sort newest first
    subs.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    res.json(subs);
  } catch (e) { res.json([]); }
});

// Save or update a single submission
app.post("/api/submissions/:id", (req, res) => {
  try {
    const sub = req.body;
    sub.id = req.params.id;
    fs.writeFileSync(subPath(req.params.id), JSON.stringify(sub), 'utf-8');
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: "Failed to save submission." }); }
});

// Update a submission (partial — e.g. add analysis)
app.patch("/api/submissions/:id", (req, res) => {
  try {
    const p = subPath(req.params.id);
    if (!fs.existsSync(p)) return res.status(404).json({ error: "Not found." });
    const existing = JSON.parse(fs.readFileSync(p, 'utf-8'));
    const updated = { ...existing, ...req.body };
    fs.writeFileSync(p, JSON.stringify(updated), 'utf-8');
    res.json({ ok: true, submission: updated });
  } catch (e) { res.status(500).json({ error: "Failed to update." }); }
});

// Delete a single submission
app.delete("/api/submissions/:id", (req, res) => {
  try {
    const p = subPath(req.params.id);
    if (fs.existsSync(p)) fs.unlinkSync(p);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: "Failed to delete." }); }
});

// Delete all submissions
app.delete("/api/submissions", (req, res) => {
  try {
    if (fs.existsSync(SUBS_DIR)) {
      fs.readdirSync(SUBS_DIR).forEach(f => fs.unlinkSync(path.join(SUBS_DIR, f)));
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: "Failed to wipe." }); }
});

// ── MIGRATE: if old "submissions" key exists, split into individual files ────
(function migrateOldData() {
  const oldPath = getPath('submissions');
  if (fs.existsSync(oldPath)) {
    try {
      const oldSubs = JSON.parse(fs.readFileSync(oldPath, 'utf-8'));
      if (Array.isArray(oldSubs) && oldSubs.length > 0) {
        console.log(`Migrating ${oldSubs.length} submissions from old format...`);
        oldSubs.forEach(sub => {
          if (sub && sub.id) fs.writeFileSync(subPath(sub.id), JSON.stringify(sub), 'utf-8');
        });
        // Rename old file so we don't migrate again
        fs.renameSync(oldPath, oldPath + '.migrated');
        console.log('Migration complete.');
      }
    } catch (e) { console.error('Migration error:', e); }
  }
})();

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

// ── CLAUDE AI WEIGHT GENERATION ──────────────────────────────────────────────
app.post("/api/generate-weights", async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured." });

  const { questionText } = req.body;
  if (!questionText) return res.status(400).json({ error: "No question text provided." });

  const prompt = `You are a Christian systematic theologian. Given a doctrinal question from a denominational alignment questionnaire, assign a weight between -3 and +3 for each of the 12 denominations below. The weight represents how likely a member of that denomination would answer "Yes" to this question:

+3 = strongly characteristic, almost all would say Yes
+2 = commonly held, most would say Yes
+1 = leaning Yes but not defining
 0 = neutral, no strong lean either way
-1 = leaning No but not defining
-2 = commonly rejected, most would say No
-3 = strongly against, almost all would say No

The 12 denominations:
- ifb: Independent Fundamental Baptist (KJV-only, dispensational, separatist, very conservative)
- sbc: Southern Baptist Convention (evangelical, congregational, conservative Protestant)
- reformedbap: Reformed Baptist (Calvinistic soteriology, 1689 confession, credobaptist)
- presby: Reformed / Presbyterian (covenantal, confessional, elder-led, paedobaptist)
- lutheran: Lutheran (sacramental, law & gospel, two kingdoms doctrine)
- anglican: Anglican (via media, Book of Common Prayer, broad church)
- catholic: Roman Catholic (Magisterium, seven sacraments, papal authority)
- orthodox: Eastern Orthodox (Holy Tradition, theosis, seven ecumenical councils)
- pentecostal: Pentecostal (Spirit baptism, charismatic gifts, revivalist)
- nondenom: Non-Denominational (low church, contemporary, Bible-focused, flexible)
- methodist: Methodist (Wesleyan holiness, prevenient grace, connectional)
- anabaptist: Anabaptist (discipleship, nonviolence, separation from the world)

The question is: "${questionText}"

Respond with ONLY a JSON object, no explanation, no markdown, no backticks. Example format:
{"ifb":2,"sbc":1,"reformedbap":0,"presby":-1,"lutheran":0,"anglican":1,"catholic":-2,"orthodox":-2,"pentecostal":1,"nondenom":0,"methodist":1,"anabaptist":-1}`;

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
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Claude API error (weights):", err);
      return res.status(500).json({ error: "Claude API error." });
    }

    const data = await response.json();
    const text = (data.content?.map(b => b.text || '').join('') || '').trim();
    const clean = text.replace(/```json|```/g, '').trim();
    const weights = JSON.parse(clean);

    // Validate: must have all 12 keys, values between -3 and 3
    const ids = ['ifb','sbc','reformedbap','presby','lutheran','anglican','catholic','orthodox','pentecostal','nondenom','methodist','anabaptist'];
    const valid = {};
    ids.forEach(id => {
      const v = Number(weights[id]);
      valid[id] = isNaN(v) ? 0 : Math.max(-3, Math.min(3, Math.round(v)));
    });

    res.json({ weights: valid });
  } catch (err) {
    console.error("Weight generation failed:", err);
    res.status(500).json({ error: "Failed to generate weights." });
  }
});

app.use(express.static(path.join(__dirname, "dist")));
// Express 5 wildcard syntax
app.get("/{*splat}", (req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✠ Berwez Questionnaire running on port ${PORT}`));
