# ✠ The Berwez Questionnaire

**Forty Questions on Faith and Practice** — An examination of conscience and conviction.

A theological questionnaire that matches your answers to 12 Christian denominations. Features admin panel, community comparison board, and theological analysis.

## Features

- **40 theological questions** across 5 categories
- **Denomination matching** against 12 traditions (IFB, SBC, Reformed Baptist, Presbyterian, Lutheran, Anglican, Catholic, Orthodox, Pentecostal, Non-Denom, Methodist, Anabaptist)
- **Community board** — see everyone's results, compare any two people side-by-side
- **Theological analysis** — category-by-category breakdown of disagreements
- **Admin panel** — edit/add/delete/reorder questions, manage responses, password-protected
- **Dashboard** — view individual submissions with full denomination scores

## Setup

### 1. Firebase (free database)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create project → name it "berwez"
3. Build → Realtime Database → Create Database
4. Rules tab → paste and publish:
   ```json
   { "rules": { ".read": true, ".write": true } }
   ```
5. Project Settings → Your apps → Web (</>) → Register
6. Copy the config values into `src/firebase.js`

### 2. Run locally

```bash
npm install
npm run dev
```

### 3. Deploy to GitHub Pages

```bash
npm run build
# Push to GitHub, enable Pages from gh-pages branch
```

## Built with

React + Vite + Firebase Realtime Database

---

*"Examine yourselves to see whether you are in the faith; test yourselves." — 2 Corinthians 13:5*
