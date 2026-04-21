import { useState, useEffect, useMemo, useCallback } from "react";
import "./index.css";

// ═══════════════════════════════════════════════════════════════════
// DATA: Denominations, Questions, Categories, Seed Submissions
// ═══════════════════════════════════════════════════════════════════

const DENOMS = [
  { id:'ifb',name:'Independent Fundamental Baptist',short:'IFB',blurb:'Sola Scriptura, KJV-onlyism, dispensational, separatist.' },
  { id:'sbc',name:'Southern Baptist Convention',short:'SBC',blurb:'Believer\u2019s baptism, congregational, evangelical Protestant.' },
  { id:'reformedbap',name:'Reformed Baptist',short:'Reformed Baptist',blurb:'Calvinistic soteriology with credobaptist ecclesiology.' },
  { id:'presby',name:'Reformed / Presbyterian',short:'Reformed/Presby',blurb:'Covenantal, confessional, elder-led, paedobaptist.' },
  { id:'lutheran',name:'Lutheran',short:'Lutheran',blurb:'Sacramental union, law & gospel, justification by faith.' },
  { id:'anglican',name:'Anglican',short:'Anglican',blurb:'Via media, Book of Common Prayer, threefold order.' },
  { id:'catholic',name:'Roman Catholic',short:'Catholic',blurb:'Magisterium, seven sacraments, communion with Rome.' },
  { id:'orthodox',name:'Eastern Orthodox',short:'Orthodox',blurb:'Holy Tradition, theosis, the undivided seven councils.' },
  { id:'pentecostal',name:'Pentecostal',short:'Pentecostal',blurb:'Baptism in the Spirit, charismatic gifts, revivalist.' },
  { id:'nondenom',name:'Non-Denominational',short:'Non-Denom',blurb:'Low church, contemporary, scripture-centered, flexible.' },
  { id:'methodist',name:'Methodist',short:'Methodist',blurb:'Wesleyan holiness, prevenient grace, connectional polity.' },
  { id:'anabaptist',name:'Anabaptist',short:'Anabaptist',blurb:'Discipleship, nonviolence, separation from the world.' },
];

const DEFAULT_QUESTIONS = [
  // I. SCRIPTURE & DOCTRINE
  { id:1,cat:'scripture',text:'Do you believe the Bible to be the ultimate and final authority on all matters of faith and life?',weights:{ifb:3,sbc:3,reformedbap:3,presby:2,lutheran:2,anglican:1,catholic:-2,orthodox:-2,pentecostal:2,nondenom:3,methodist:1,anabaptist:2}},
  { id:2,cat:'scripture',text:'Do you affirm all points of the Nicene Creed?',weights:{ifb:0,sbc:1,reformedbap:2,presby:3,lutheran:3,anglican:3,catholic:3,orthodox:3,pentecostal:1,nondenom:1,methodist:2,anabaptist:1}},
  { id:3,cat:'scripture',text:'Do you believe the King James Bible is the most reliable English Bible?',weights:{ifb:3,sbc:0,reformedbap:0,presby:0,lutheran:-1,anglican:0,catholic:-1,orthodox:-1,pentecostal:0,nondenom:-1,methodist:-1,anabaptist:0}},
  { id:4,cat:'scripture',text:'Do you reject most modern Bible translations as corrupted?',weights:{ifb:3,sbc:-1,reformedbap:-1,presby:-1,lutheran:-1,anglican:-1,catholic:-1,orthodox:-1,pentecostal:0,nondenom:-1,methodist:-1,anabaptist:0}},
  { id:5,cat:'scripture',text:'Do you believe the Bible should always be interpreted literally unless the text shows otherwise (e.g., the Beast of Revelation 13)?',weights:{ifb:3,sbc:2,reformedbap:2,presby:1,lutheran:1,anglican:0,catholic:-1,orthodox:-1,pentecostal:2,nondenom:2,methodist:0,anabaptist:1}},
  { id:6,cat:'scripture',text:'Do you believe in the Five Solas?',weights:{ifb:3,sbc:3,reformedbap:3,presby:3,lutheran:3,anglican:2,catholic:-3,orthodox:-3,pentecostal:2,nondenom:2,methodist:1,anabaptist:1}},

  // II. SACRAMENTS & ORDINANCES
  { id:7,cat:'sacraments',text:'Do you believe baptism is for believers only?',weights:{ifb:3,sbc:3,reformedbap:3,presby:-3,lutheran:-3,anglican:-2,catholic:-3,orthodox:-3,pentecostal:3,nondenom:2,methodist:-2,anabaptist:3}},
  { id:8,cat:'sacraments',text:'Do you believe baptism must follow true repentance?',weights:{ifb:3,sbc:3,reformedbap:3,presby:-1,lutheran:-1,anglican:0,catholic:-1,orthodox:-1,pentecostal:3,nondenom:2,methodist:1,anabaptist:3}},
  { id:9,cat:'sacraments',text:'Do you believe baptism is a symbol of salvation rather than a means of grace (like a wedding ring)?',weights:{ifb:3,sbc:3,reformedbap:2,presby:-1,lutheran:-3,anglican:-2,catholic:-3,orthodox:-3,pentecostal:2,nondenom:2,methodist:-1,anabaptist:2}},
  { id:10,cat:'sacraments',text:'Do you believe baptism must be by full immersion only?',weights:{ifb:3,sbc:3,reformedbap:3,presby:-2,lutheran:-1,anglican:-1,catholic:-1,orthodox:2,pentecostal:3,nondenom:2,methodist:-1,anabaptist:3}},
  { id:11,cat:'sacraments',text:'Do you believe the Lord\u2019s Supper is purely symbolic rather than the literal body and blood of Christ?',weights:{ifb:3,sbc:3,reformedbap:2,presby:-1,lutheran:-3,anglican:-2,catholic:-3,orthodox:-3,pentecostal:2,nondenom:2,methodist:-1,anabaptist:2}},

  // III. SALVATION & ECCLESIOLOGY
  { id:12,cat:'ecclesiology',text:'Do you believe that a believer should have had a personal conversion experience (a moment of conviction of sin and need for salvation)?',weights:{ifb:3,sbc:3,reformedbap:2,presby:1,lutheran:0,anglican:0,catholic:-1,orthodox:-1,pentecostal:3,nondenom:2,methodist:2,anabaptist:2}},
  { id:13,cat:'ecclesiology',text:'Do you believe in "once saved always saved" (unless the person falls away)?',weights:{ifb:2,sbc:2,reformedbap:1,presby:1,lutheran:-1,anglican:0,catholic:-2,orthodox:-2,pentecostal:1,nondenom:1,methodist:-1,anabaptist:0}},
  { id:14,cat:'ecclesiology',text:'Do you believe most churches today are false or apostate?',weights:{ifb:3,sbc:0,reformedbap:1,presby:0,lutheran:0,anglican:-1,catholic:-2,orthodox:-1,pentecostal:1,nondenom:0,methodist:-1,anabaptist:2}},
  { id:15,cat:'ecclesiology',text:'Do you believe that each church should govern itself with no central authority?',weights:{ifb:3,sbc:3,reformedbap:2,presby:-2,lutheran:-1,anglican:-2,catholic:-3,orthodox:-2,pentecostal:2,nondenom:3,methodist:-2,anabaptist:2}},
  { id:16,cat:'ecclesiology',text:'Do you believe Roman Catholicism is not truly Christian?',weights:{ifb:3,sbc:1,reformedbap:1,presby:0,lutheran:0,anglican:-2,catholic:-3,orthodox:-1,pentecostal:1,nondenom:0,methodist:-1,anabaptist:0}},
  { id:17,cat:'ecclesiology',text:'Do you believe churches should denounce, rebuke, and completely separate from heretics and pagans (except for evangelistic purposes)?',weights:{ifb:3,sbc:1,reformedbap:2,presby:1,lutheran:1,anglican:-1,catholic:0,orthodox:0,pentecostal:2,nondenom:0,methodist:-1,anabaptist:2}},
  { id:18,cat:'ecclesiology',text:'Do you support confrontational street preaching?',weights:{ifb:3,sbc:1,reformedbap:0,presby:-1,lutheran:-1,anglican:-2,catholic:-2,orthodox:-2,pentecostal:2,nondenom:0,methodist:0,anabaptist:-1}},
  { id:19,cat:'ecclesiology',text:'Do you believe pastors should aggressively call out and condemn all unbiblical teachings, practices, and ideologies?',weights:{ifb:3,sbc:2,reformedbap:2,presby:1,lutheran:1,anglican:-1,catholic:0,orthodox:0,pentecostal:2,nondenom:1,methodist:0,anabaptist:1}},

  // IV. CREATION & ORIGINS
  { id:20,cat:'creation',text:'Do you believe the creation account in the Book of Genesis is 100% literal history?',weights:{ifb:3,sbc:2,reformedbap:2,presby:1,lutheran:1,anglican:-1,catholic:-1,orthodox:0,pentecostal:2,nondenom:1,methodist:-1,anabaptist:1}},
  { id:21,cat:'creation',text:'Do you believe the earth is about 6,000\u201310,000 years old?',weights:{ifb:3,sbc:1,reformedbap:1,presby:0,lutheran:0,anglican:-2,catholic:-2,orthodox:-1,pentecostal:1,nondenom:0,methodist:-2,anabaptist:0}},
  { id:22,cat:'creation',text:'Do you reject evolution in all forms?',weights:{ifb:3,sbc:2,reformedbap:2,presby:1,lutheran:1,anglican:-1,catholic:-1,orthodox:0,pentecostal:2,nondenom:1,methodist:-1,anabaptist:1}},
  { id:23,cat:'creation',text:'Do you believe Adam and Eve were real historical individuals?',weights:{ifb:3,sbc:3,reformedbap:3,presby:3,lutheran:3,anglican:1,catholic:2,orthodox:3,pentecostal:3,nondenom:2,methodist:1,anabaptist:2}},
  { id:24,cat:'creation',text:'Do you believe Noah\u2019s flood covered the entire earth, annihilating all life?',weights:{ifb:3,sbc:2,reformedbap:2,presby:1,lutheran:1,anglican:0,catholic:0,orthodox:1,pentecostal:2,nondenom:1,methodist:0,anabaptist:1}},
  { id:25,cat:'creation',text:'Do you believe all humans today descend from Noah after the flood?',weights:{ifb:3,sbc:2,reformedbap:2,presby:1,lutheran:1,anglican:0,catholic:0,orthodox:1,pentecostal:2,nondenom:1,methodist:0,anabaptist:1}},

  // V. CHRISTIAN LIFE & CONDUCT
  { id:26,cat:'life',text:'Do you believe Christians should follow strict modest dress standards?',weights:{ifb:3,sbc:1,reformedbap:1,presby:0,lutheran:0,anglican:-1,catholic:0,orthodox:2,pentecostal:2,nondenom:0,methodist:0,anabaptist:3}},
  { id:27,cat:'life',text:'Do you believe men should have short hair and women long hair as a command?',weights:{ifb:3,sbc:0,reformedbap:1,presby:0,lutheran:0,anglican:-1,catholic:0,orthodox:2,pentecostal:2,nondenom:0,methodist:0,anabaptist:3}},
  { id:28,cat:'life',text:'Do you believe women should not teach or have authority over men in church and most other contexts?',weights:{ifb:3,sbc:3,reformedbap:3,presby:2,lutheran:1,anglican:0,catholic:3,orthodox:3,pentecostal:0,nondenom:1,methodist:-2,anabaptist:2}},
  { id:29,cat:'life',text:'Do you believe men and women have strictly separate, God-ordained roles?',weights:{ifb:3,sbc:3,reformedbap:3,presby:2,lutheran:1,anglican:0,catholic:2,orthodox:2,pentecostal:1,nondenom:1,methodist:-1,anabaptist:2}},
  { id:30,cat:'life',text:'Do you oppose all forms of LGBTQ+ acceptance, including legal recognition?',weights:{ifb:3,sbc:3,reformedbap:3,presby:2,lutheran:1,anglican:0,catholic:2,orthodox:2,pentecostal:3,nondenom:1,methodist:0,anabaptist:1}},
  { id:31,cat:'life',text:'Do you believe Christians should avoid secular entertainment?',weights:{ifb:3,sbc:0,reformedbap:0,presby:0,lutheran:-1,anglican:-1,catholic:-2,orthodox:0,pentecostal:1,nondenom:-1,methodist:0,anabaptist:2}},
  { id:32,cat:'life',text:'Do you believe Christians should avoid secular music entirely?',weights:{ifb:3,sbc:0,reformedbap:0,presby:0,lutheran:-1,anglican:-1,catholic:-2,orthodox:0,pentecostal:1,nondenom:-1,methodist:0,anabaptist:2}},
  { id:33,cat:'life',text:'Do you believe drinking alcohol is always sinful?',weights:{ifb:3,sbc:2,reformedbap:-1,presby:-1,lutheran:-2,anglican:-1,catholic:-2,orthodox:-2,pentecostal:2,nondenom:0,methodist:1,anabaptist:1}},
  { id:34,cat:'life',text:'Do you believe Christians should avoid close friendships with non-believers?',weights:{ifb:3,sbc:0,reformedbap:0,presby:0,lutheran:-1,anglican:-1,catholic:-1,orthodox:0,pentecostal:1,nondenom:0,methodist:-1,anabaptist:2}},
  { id:35,cat:'life',text:'Do you believe the modern world is irredeemably corrupt and hostile to true Christianity?',weights:{ifb:3,sbc:1,reformedbap:1,presby:0,lutheran:0,anglican:-1,catholic:-1,orthodox:0,pentecostal:2,nondenom:0,methodist:-1,anabaptist:2}},

  // VI. AUTHORITY & SOCIETY
  { id:36,cat:'authority',text:'Do you believe strong, harsh preaching is necessary and biblical?',weights:{ifb:3,sbc:1,reformedbap:1,presby:0,lutheran:0,anglican:-2,catholic:-1,orthodox:-1,pentecostal:2,nondenom:0,methodist:-1,anabaptist:0}},
  { id:37,cat:'authority',text:'Do you believe pastors should exercise strong authority over members\u2019 lives?',weights:{ifb:3,sbc:1,reformedbap:1,presby:1,lutheran:0,anglican:0,catholic:1,orthodox:1,pentecostal:2,nondenom:-1,methodist:0,anabaptist:1}},
  { id:38,cat:'authority',text:'Do you believe homeschooling is preferable or necessary to protect children\u2019s faith?',weights:{ifb:3,sbc:1,reformedbap:2,presby:1,lutheran:0,anglican:-1,catholic:0,orthodox:0,pentecostal:1,nondenom:1,methodist:-1,anabaptist:3}},
  { id:39,cat:'authority',text:'Do you believe physical discipline is a required biblical method in raising children?',weights:{ifb:3,sbc:2,reformedbap:2,presby:1,lutheran:0,anglican:-1,catholic:0,orthodox:0,pentecostal:2,nondenom:1,methodist:0,anabaptist:1}},
  { id:40,cat:'authority',text:'Do you believe that all leadership roles and positions are strictly reserved for men?',weights:{ifb:3,sbc:3,reformedbap:3,presby:2,lutheran:1,anglican:0,catholic:3,orthodox:3,pentecostal:0,nondenom:1,methodist:-2,anabaptist:2}},
  { id:41,cat:'authority',text:'Do you believe that Christians should engage in politics?',weights:{ifb:2,sbc:2,reformedbap:2,presby:3,lutheran:2,anglican:2,catholic:3,orthodox:2,pentecostal:1,nondenom:1,methodist:2,anabaptist:-3}},
  { id:42,cat:'authority',text:'Do you believe that all non-Christians go to hell?',weights:{ifb:3,sbc:3,reformedbap:3,presby:3,lutheran:2,anglican:0,catholic:0,orthodox:0,pentecostal:3,nondenom:2,methodist:0,anabaptist:2}},
  { id:43,cat:'authority',text:'Do you believe that Christians can and should be armed and have the right to use lethal force in self-defense?',weights:{ifb:3,sbc:2,reformedbap:2,presby:2,lutheran:1,anglican:0,catholic:1,orthodox:0,pentecostal:1,nondenom:1,methodist:0,anabaptist:-3}},
];

const CATEGORIES = [
  { id:'scripture',roman:'I.',name:'Scripture & Doctrine',subtitle:'On the Authority of Holy Writ and the Rule of Faith' },
  { id:'sacraments',roman:'II.',name:'Sacraments & Ordinances',subtitle:'On Baptism, the Lord\u2019s Supper, and the Means of Grace' },
  { id:'ecclesiology',roman:'III.',name:'Salvation & Ecclesiology',subtitle:'On the Nature of the Church and the Salvation of Souls' },
  { id:'creation',roman:'IV.',name:'Creation & Origins',subtitle:'On the Works of God in the Beginning and the End' },
  { id:'life',roman:'V.',name:'Christian Life & Conduct',subtitle:'On Piety, Modesty, and the Discipline of the Faithful' },
  { id:'authority',roman:'VI.',name:'Authority & Society',subtitle:'On the Offices of Men and the Affairs of the Commonwealth' },
];

const SEED = [];

// ═══════════════════════════════════════════════════════════════════
// SCORING ENGINE
// ═══════════════════════════════════════════════════════════════════

function scoreSubmission(submission, questions = DEFAULT_QUESTIONS) {
  const raw = {}, maxPos = {};
  DENOMS.forEach(d => { raw[d.id] = 0; maxPos[d.id] = 0; });
  questions.forEach(q => {
    const ans = submission.answers[q.id];
    if (!ans) return;
    Object.entries(q.weights || {}).forEach(([dId, w]) => {
      maxPos[dId] = (maxPos[dId]||0) + Math.abs(w);
      let mult = 0;
      if (ans === 'yes') mult = 1;
      else if (ans === 'no') mult = -1;
      else if (ans === 'partial') mult = 0.5 * Math.sign(w);
      raw[dId] += w * mult;
    });
  });
  return DENOMS.map(d => {
    const max = maxPos[d.id] || 1;
    const pct = Math.round(((raw[d.id] + max) / (2 * max)) * 100);
    return { id:d.id, name:d.name, short:d.short, blurb:d.blurb, score:Math.max(0,Math.min(100,pct)), raw:raw[d.id] };
  }).sort((a,b) => b.score - a.score);
}
function colorForScore(s) { return s >= 70 ? 'strong' : s >= 50 ? 'medium' : 'weak'; }
function answeredCount(sub) { return Object.keys(sub.answers || {}).length; }

// ═══════════════════════════════════════════════════════════════════
// API STORAGE (Railway Express backend)
// ═══════════════════════════════════════════════════════════════════

const api = {
  async get(key) {
    try { const r = await fetch(`/api/data/${key}`); const d = await r.json(); return d.value ? JSON.parse(d.value) : null; }
    catch { return null; }
  },
  async set(key, val) {
    try { await fetch(`/api/data/${key}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({value:JSON.stringify(val)}) }); return true; }
    catch { return false; }
  },
};

// ═══════════════════════════════════════════════════════════════════
// UI PRIMITIVES
// ═══════════════════════════════════════════════════════════════════

function OrnamentDivider({ glyph = "✠" }) {
  return <div className="ornament-divider"><span className="glyph">{glyph}</span></div>;
}
function GoldLine() { return <div className="hline-gold" />; }

function Nav({ tab, setTab }) {
  const tabs = [
    { id:'questionnaire', glyph:'✠', label:'Fill Questionnaire' },
    { id:'community',     glyph:'❦', label:'Community' },
    { id:'dashboard',     glyph:'☩', label:'Dashboard' },
    { id:'admin',         glyph:'⚜', label:'Admin' },
  ];
  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-brand"><div className="nav-brand-mark">✠</div><span>Berwez</span></div>
        <div className="nav-tabs">
          {tabs.map(t => (
            <button key={t.id} className={"nav-tab " + (tab === t.id ? "active" : "")} onClick={() => setTab(t.id)}>
              <span className="nav-tab-glyph">{t.glyph}</span>{t.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function PageFrame({ children, wide }) {
  return <div className={"page " + (wide ? "page-wide" : "")}><div className="frame">{children}</div></div>;
}

function AnswerBadge({ value }) {
  if (value === 'yes') return <span className="badge yes">✓ Yes</span>;
  if (value === 'no') return <span className="badge no">✗ No</span>;
  if (value === 'partial') return <span className="badge partial">○ Partial</span>;
  return <span className="badge neutral">— —</span>;
}

function CategoryHeader({ cat }) {
  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ textAlign:'center', color:'var(--gold)', fontSize:26, lineHeight:1 }}>❦</div>
      <div className="section-title" style={{ justifyContent:'center' }}>
        <span className="roman">{cat.roman}</span><span className="name">{cat.name}</span>
      </div>
      <div className="section-subtitle" style={{ textAlign:'center' }}>{cat.subtitle}</div>
      <GoldLine />
    </div>
  );
}

function toRoman(n) { return ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][n-1] || String(n); }
function formatDate(d) { try { return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); } catch { return d; } }

// ═══════════════════════════════════════════════════════════════════
// TAB 1: QUESTIONNAIRE
// ═══════════════════════════════════════════════════════════════════

function QuestionCard({ q, num, answer, note, onAnswer, onNote }) {
  const answered = !!answer;
  return (
    <div className={"card " + (answered ? "answered" : "")} style={{ marginBottom:12 }}>
      <div className="q-text"><span className="q-num">{num}.</span>{q.text}</div>
      <div className="ans-row">
        <button className={"ans-btn " + (answer==='yes'?'selected':'')} onClick={()=>onAnswer('yes')}><span className="mark">✓</span>Yes</button>
        <button className={"ans-btn " + (answer==='no'?'selected':'')} onClick={()=>onAnswer('no')}><span className="mark">✗</span>No</button>
        <button className={"ans-btn ans-partial " + (answer==='partial'?'selected':'')} onClick={()=>onAnswer('partial')}><span className="mark">○</span>Partially / With Nuance</button>
      </div>
      {answered && <input className="input input-italic note-field" placeholder="Add a note (optional) — explain your nuance…" value={note||''} onChange={e=>onNote(e.target.value)} style={{borderLeft:'2px solid var(--gold-soft)'}} />}
    </div>
  );
}

function ResultsScreen({ submission, questions, onDone }) {
  const scores = useMemo(() => scoreSubmission(submission, questions), [submission, questions]);
  const top5 = scores.slice(0,5);
  return (
    <div className="fade-in">
      <div style={{ textAlign:'center', marginBottom:8 }}>
        <div className="smallcaps" style={{ color:'var(--gold)', fontSize:13 }}>Testimony Received</div>
        <h1 className="display" style={{ color:'var(--wine)', fontSize:48, margin:'6px 0 2px', fontWeight:500 }}>Thy Five Closest Kindreds</h1>
        <div className="italic-serif" style={{ color:'var(--gold)', fontSize:16 }}>According to the Forty Answers of <strong>{submission.name}</strong></div>
      </div>
      <OrnamentDivider glyph="✠" />
      <div style={{ marginTop:20 }}>
        {top5.map((d,i) => (
          <div key={d.id} className={"denom-row fade-in " + (i<3?"top":"")} style={{ animationDelay:(i*90)+'ms' }}>
            <div className="rank">{toRoman(i+1)}</div>
            <div className="name">{d.name}</div>
            <div className={"pct " + (d.score>=70?'score-strong':d.score>=50?'score-medium':'score-weak')}>{d.score}%</div>
            <div className="blurb">{d.blurb}</div>
            <div className="bar progress-bar" style={{ gridColumn:'2 / span 2' }}><div className="progress-fill bar-grow" style={{ width:d.score+'%', animationDelay:(i*90+120)+'ms' }} /></div>
          </div>
        ))}
      </div>
      <div style={{ textAlign:'center', marginTop:28 }}><button className="btn" onClick={onDone}>View Community Board</button></div>
    </div>
  );
}

function Questionnaire({ onSubmit, goTo, questions }) {
  const [name, setName] = useState('');
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const [submitted, setSubmitted] = useState(null);
  const answeredNum = Object.keys(answers).length;
  const pct = Math.round((answeredNum / questions.length) * 100);
  const categorized = useMemo(() => CATEGORIES.map(c => ({ cat:c, items:questions.filter(q=>q.cat===c.id) })), [questions]);
  const canSubmit = name.trim().length > 0 && answeredNum >= 33;

  const handleSubmit = () => {
    const sub = { id:'s-'+Date.now(), name:name.trim(), date:new Date().toISOString().slice(0,10), answers, notes };
    setSubmitted(sub);
    onSubmit(sub);
    window.scrollTo({ top:0, behavior:'smooth' });
  };

  if (submitted) return <PageFrame><ResultsScreen submission={submitted} questions={questions} onDone={()=>goTo('community')} /></PageFrame>;

  return (
    <>
      <div style={{ maxWidth:920, margin:'0 auto', padding:'0 18px' }}>
        <header style={{ textAlign:'center', padding:'40px 10px 18px' }}>
          <div className="smallcaps" style={{ color:'var(--gold)', fontSize:12, marginBottom:10 }}>✠ Anno Domini MMXXVI ✠</div>
          <h1 className="display" style={{ color:'var(--wine)', fontSize:'clamp(38px, 7vw, 68px)', margin:'6px 0 6px', letterSpacing:'0.015em', lineHeight:1.05, fontWeight:500 }}>The Berwez<br/>Questionnaire</h1>
          <div className="smallcaps" style={{ color:'var(--gold)', fontSize:13, marginTop:10 }}>Forty Questions on Faith &amp; Practice</div>
          <OrnamentDivider glyph="✠" />
          <blockquote style={{ fontStyle:'italic', color:'var(--espresso-soft)', maxWidth:620, margin:'0 auto', fontFamily:'var(--serif-display)', fontSize:18, lineHeight:1.55 }}>
            "Examine yourselves to see whether you are in the faith; test yourselves."
            <div className="smallcaps" style={{ fontSize:11, marginTop:10, color:'var(--gold)', fontStyle:'normal' }}>— II Corinthians XIII. V</div>
          </blockquote>
        </header>
      </div>
      <div className="progress-sticky">
        <div className="progress-inner">
          <div className="progress-label"><span>Progress</span><span className="val">{answeredNum}/{questions.length} · {pct}%</span></div>
          <div className="progress-bar"><div className="progress-fill" style={{ width:pct+'%' }} /></div>
        </div>
      </div>
      <PageFrame>
        <div style={{ maxWidth:480, margin:'0 auto 12px' }}>
          <div className="card" style={{ borderColor:'var(--gold)', padding:'18px 22px' }}>
            <div className="smallcaps" style={{ color:'var(--wine)', fontSize:11, marginBottom:8, textAlign:'center' }}>✠  Your Name  ✠</div>
            <input className="input" style={{ textAlign:'center', fontSize:18, fontFamily:'var(--serif-display)' }} placeholder="Thy Christian name…" value={name} onChange={e=>setName(e.target.value)} />
          </div>
        </div>
        {categorized.map(({ cat, items }) => (
          <section key={cat.id}>
            <CategoryHeader cat={cat} />
            <div style={{ marginTop:18 }}>{items.map(q => <QuestionCard key={q.id} q={q} num={q.id} answer={answers[q.id]} note={notes[q.id]} onAnswer={v=>setAnswers(a=>({...a,[q.id]:v}))} onNote={v=>setNotes(n=>({...n,[q.id]:v}))} />)}</div>
          </section>
        ))}
        <OrnamentDivider glyph="✠" />
        <div style={{ textAlign:'center', marginTop:24 }}>
          {!canSubmit && <div className="italic-serif" style={{ color:'var(--espresso-soft)', marginBottom:12, fontSize:14 }}>{!name.trim() ? 'Enter thy name to proceed.' : `Answer at least 30 of the ${questions.length} questions — ${answeredNum} so far.`}</div>}
          <button className="btn primary" disabled={!canSubmit} onClick={handleSubmit} style={{ fontSize:13, padding:'16px 44px' }}>✠  Submit Testimony  ✠</button>
        </div>
      </PageFrame>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 2: COMMUNITY
// ═══════════════════════════════════════════════════════════════════

function PersonCard({ sub, onSelect, selected, selectable = true, questions }) {
  const scores = useMemo(() => scoreSubmission(sub, questions), [sub, questions]);
  const one = scores[0], two = scores[1];
  const cls = colorForScore(one.score);
  return (
    <div className={"card " + (selected?"answered":"")} onClick={()=>selectable&&onSelect?.(sub.id)} style={{ cursor:selectable?'pointer':'default', position:'relative', borderLeft:selected?'3px solid var(--gold)':undefined }}>
      {selected && <div className="select-check">✓</div>}
      <div className="display" style={{ color:'var(--wine)', fontSize:22, fontWeight:600, letterSpacing:'0.01em' }}>{sub.name}</div>
      <div className="mono" style={{ color:'var(--espresso-soft)', marginTop:2 }}>{formatDate(sub.date)} · {answeredCount(sub)}/40 answered</div>
      <div className="hline-gold" style={{ margin:'12px 0' }} />
      <div className="smallcaps" style={{ color:'var(--espresso-soft)', fontSize:10, marginBottom:2 }}>Closest Kindred</div>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:10 }}>
        <div className="display" style={{ fontSize:20, color:'var(--ink)', fontWeight:500 }}>{one.short}</div>
        <div className={"display " + (cls==='strong'?'score-strong':cls==='medium'?'score-medium':'score-weak')} style={{ fontSize:30, fontWeight:600 }}>{one.score}%</div>
      </div>
      <div className="progress-bar" style={{ marginTop:6 }}><div className="progress-fill" style={{ width:one.score+'%' }} /></div>
      <div style={{ marginTop:10, display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <div style={{ color:'var(--espresso-soft)', fontStyle:'italic', fontSize:13.5 }}>then <strong style={{ color:'var(--wine)', fontStyle:'normal' }}>{two.short}</strong></div>
        <div className="mono" style={{ color:'var(--espresso-soft)' }}>{two.score}%</div>
      </div>
    </div>
  );
}

function TopDenomCard({ person, top }) {
  const cls = top.score >= 70 ? 'score-strong' : top.score >= 50 ? 'score-medium' : 'score-weak';
  return (
    <div className="compare-person">
      <div className="smallcaps" style={{ color:'var(--espresso-soft)', fontSize:10 }}>Closest Kindred</div>
      <div className="name">{person.name}</div>
      <div className="top-denom">{top.name}</div>
      <div className={"top-score " + cls}>{top.score}%</div>
      <div className="progress-bar" style={{ marginTop:6 }}><div className="progress-fill" style={{ width:top.score+'%' }} /></div>
      <div className="italic-serif" style={{ color:'var(--espresso-soft)', fontSize:13.5, marginTop:8 }}>{top.blurb}</div>
    </div>
  );
}

function ComparisonView({ a, b, onClose, questions }) {
  const sA = useMemo(() => scoreSubmission(a, questions), [a, questions]);
  const sB = useMemo(() => scoreSubmission(b, questions), [b, questions]);
  const comparison = useMemo(() => {
    let agree=0, differ=0, both=0;
    const diffsByCat = {}; CATEGORIES.forEach(c => diffsByCat[c.id] = []);
    questions.forEach(q => {
      const aa=a.answers[q.id], bb=b.answers[q.id];
      if (aa && bb) { both++; if (aa===bb) agree++; else { differ++; diffsByCat[q.cat].push({q,aa,bb}); } }
    });
    return { agree, differ, aligned:both?Math.round((agree/both)*100):0, diffsByCat, both };
  }, [a,b,questions]);
  const oneA=sA[0], oneB=sB[0];
  const summary = useMemo(() => {
    const strongestCat = Object.entries(comparison.diffsByCat).map(([id,arr])=>({id,n:arr.length,cat:CATEGORIES.find(c=>c.id===id)})).sort((x,y)=>y.n-x.n)[0];
    const p = [`Of the ${comparison.both} questions both ${a.name} and ${b.name} answered, they agree on ${comparison.agree} and differ on ${comparison.differ} — an alignment of ${comparison.aligned}%.`];
    if (strongestCat?.n > 0) p.push(`Their greatest divergence lies in ${strongestCat.cat.name.toLowerCase()} (${strongestCat.n} disagreement${strongestCat.n===1?'':'s'}).`);
    p.push(`${a.name} leans toward ${oneA.name} (${oneA.score}%), while ${b.name} leans toward ${oneB.name} (${oneB.score}%).`);
    if (oneA.id===oneB.id && Math.abs(oneA.score-oneB.score)<12) p.push('They share the same tradition — communion is near at hand.');
    else if (comparison.aligned>=70) p.push('Though their nearest kindreds differ, a warm fraternity remains between them.');
    else p.push('They draw from distinct wells of the Christian tradition.');
    return p.join(' ');
  }, [comparison,oneA,oneB,a,b]);
  const byCatDiffs = Object.entries(comparison.diffsByCat).filter(([,arr])=>arr.length>0);

  return (
    <div className="fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div className="smallcaps" style={{ color:'var(--gold)', fontSize:12 }}>Comparison</div>
        <button className="btn small" onClick={onClose}>← Back to Board</button>
      </div>
      <h2 className="display" style={{ color:'var(--wine)', fontSize:36, margin:'4px 0 12px', fontWeight:500 }}>{a.name} <span style={{ color:'var(--gold)', fontStyle:'italic', fontWeight:400 }}>versus</span> {b.name}</h2>
      <OrnamentDivider glyph="❦" />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}><TopDenomCard person={a} top={oneA} /><TopDenomCard person={b} top={oneB} /></div>
      <div className="stat-row" style={{ marginTop:20 }}>
        <div className="stat-box agree"><div className="v">{comparison.agree}</div><div className="l">Agree</div></div>
        <div className="stat-box differ"><div className="v">{comparison.differ}</div><div className="l">Differ</div></div>
        <div className="stat-box aligned"><div className="v">{comparison.aligned}%</div><div className="l">Aligned</div></div>
      </div>
      <div className="summary-box"><h4>Summary of the Comparison</h4><p style={{ fontStyle:'italic' }}>{summary}</p></div>
      <div style={{ marginTop:20 }}>
        <div className="section-title" style={{ margin:'10px 0' }}><span className="name" style={{ color:'var(--wine)' }}>Where You Differ</span></div>
        <GoldLine />
        {byCatDiffs.length===0 ? <div className="italic-serif" style={{ color:'var(--espresso-soft)', marginTop:12 }}>No disagreements — a rare and blessed harmony.</div> : byCatDiffs.map(([catId,diffs]) => {
          const cat = CATEGORIES.find(c=>c.id===catId);
          return (
            <div key={catId} style={{ marginTop:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}><div className="smallcaps" style={{ color:'var(--wine)', fontSize:12, fontWeight:600 }}>{cat.roman} {cat.name}</div><span className="pill-count">{diffs.length}</span></div>
              <div style={{ marginTop:10 }}>
                {diffs.map(({q,aa,bb}) => (
                  <div key={q.id} className="card" style={{ padding:'14px 16px', marginBottom:8 }}>
                    <div className="q-text" style={{ fontSize:15 }}><span className="q-num">{q.id}.</span>{q.text}</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10 }}>
                      <div><div className="mono" style={{ color:'var(--espresso-soft)', marginBottom:4 }}>{a.name}</div><AnswerBadge value={aa} />{a.notes?.[q.id]&&<div className="italic-serif" style={{ fontSize:13, color:'var(--espresso-soft)', marginTop:4 }}>"{a.notes[q.id]}"</div>}</div>
                      <div><div className="mono" style={{ color:'var(--espresso-soft)', marginBottom:4 }}>{b.name}</div><AnswerBadge value={bb} />{b.notes?.[q.id]&&<div className="italic-serif" style={{ fontSize:13, color:'var(--espresso-soft)', marginTop:4 }}>"{b.notes[q.id]}"</div>}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:30 }}>
        <div className="section-title" style={{ margin:'10px 0' }}><span className="name" style={{ color:'var(--wine)' }}>Every Answer, Side by Side</span></div>
        <GoldLine />
        <div className="compare-scroll" style={{ marginTop:12 }}>
          <table className="compare-table">
            <thead><tr><th className="sticky" style={{ minWidth:320 }}>Question</th><th>{a.name}</th><th>{b.name}</th><th style={{ width:60 }}>Match</th></tr></thead>
            <tbody>
              {questions.map(q => { const aa=a.answers[q.id], bb=b.answers[q.id], match=aa&&bb&&aa===bb; return (
                <tr key={q.id}><td className="sticky"><strong style={{ color:'var(--wine)' }}>{q.id}.</strong> {q.text}</td><td><AnswerBadge value={aa} /></td><td><AnswerBadge value={bb} /></td><td style={{ textAlign:'center', fontSize:16 }}>{match?<span style={{ color:'var(--green)' }}>✓</span>:(aa&&bb?<span style={{ color:'var(--red)' }}>⚠</span>:<span style={{ color:'var(--espresso-soft)' }}>—</span>)}</td></tr>
              ); })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Community({ submissions, questions }) {
  const [selected, setSelected] = useState([]);
  const [compareAId, setCompareAId] = useState('');
  const [compareBId, setCompareBId] = useState('');
  const [comparing, setComparing] = useState(null);
  const toggleSelect = id => setSelected(curr => curr.includes(id)?curr.filter(x=>x!==id):curr.length>=2?[curr[1],id]:[...curr,id]);
  const runCards = () => { if (selected.length===2) { setComparing({a:submissions.find(s=>s.id===selected[0]),b:submissions.find(s=>s.id===selected[1])}); window.scrollTo({top:0,behavior:'smooth'}); } };
  const runBar = () => { if (compareAId&&compareBId&&compareAId!==compareBId) { setComparing({a:submissions.find(s=>s.id===compareAId),b:submissions.find(s=>s.id===compareBId)}); window.scrollTo({top:0,behavior:'smooth'}); } };
  if (comparing) return <PageFrame wide><ComparisonView a={comparing.a} b={comparing.b} questions={questions} onClose={()=>setComparing(null)} /></PageFrame>;
  return (
    <PageFrame wide>
      <header style={{ textAlign:'center' }}>
        <div className="smallcaps" style={{ color:'var(--gold)', fontSize:12 }}>✠ ❦ ✠</div>
        <h1 className="display" style={{ color:'var(--wine)', fontSize:52, margin:'6px 0 4px', fontWeight:500 }}>Community Board</h1>
        <div className="italic-serif" style={{ color:'var(--gold)', fontSize:16 }}>See everyone's results · Select two to compare</div>
      </header>
      <OrnamentDivider glyph="❦" />
      <div className="compare-bar">
        <div style={{ flex:1, display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <select className="select" value={compareAId} onChange={e=>setCompareAId(e.target.value)}><option value="">— Choose first —</option>{submissions.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <span className="vs">vs</span>
          <select className="select" value={compareBId} onChange={e=>setCompareBId(e.target.value)}><option value="">— Choose second —</option>{submissions.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <button className="btn" onClick={runBar} disabled={!compareAId||!compareBId||compareAId===compareBId}>Compare</button>
        </div>
        {selected.length>0&&<button className="btn primary small" onClick={runCards} disabled={selected.length!==2}>Compare Selected ({selected.length}/2)</button>}
      </div>
      <div className="person-grid">{submissions.map(s=><PersonCard key={s.id} sub={s} questions={questions} selected={selected.includes(s.id)} onSelect={toggleSelect} />)}</div>
    </PageFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TAB 3 & 4: DASHBOARD + ADMIN
// ═══════════════════════════════════════════════════════════════════

function PasswordGate({ onUnlock, title = "The Gate" }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  const submit = () => {
    const stored = localStorage.getItem('berwez-pw') || 'berwez';
    if (pw === stored) onUnlock();
    else { setErr(true); setTimeout(() => setErr(false), 2000); }
  };
  return (
    <PageFrame>
      <div style={{ maxWidth:440, margin:'60px auto', textAlign:'center' }}>
        <div style={{ color:'var(--gold)', fontSize:42, lineHeight:1 }}>✠</div>
        <div className="smallcaps" style={{ color:'var(--gold)', fontSize:12, marginTop:12 }}>Restricted</div>
        <h2 className="display" style={{ color:'var(--wine)', fontSize:34, margin:'6px 0 18px', fontWeight:500 }}>{title}</h2>
        <OrnamentDivider glyph="✠" />
        <div className="italic-serif" style={{ color:'var(--espresso-soft)', marginBottom:16 }}>Enter the password to proceed.</div>
        <input className="input" type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&submit()} placeholder="••••••••" style={{ textAlign:'center', fontSize:18, letterSpacing:'0.3em' }} />
        {err && <div style={{ color:'var(--red)', marginTop:10, fontStyle:'italic' }}>Incorrect. Try again.</div>}
        <div style={{ marginTop:18 }}><button className="btn primary" onClick={submit}>Enter</button></div>
        <div className="mono" style={{ color:'var(--espresso-soft)', marginTop:22, fontSize:11 }}>Default password: <strong>berwez</strong></div>
      </div>
    </PageFrame>
  );
}

function PersonDetail({ sub, onBack, onDelete, questions }) {
  const scores = useMemo(() => scoreSubmission(sub, questions), [sub, questions]);
  return (
    <div className="fade-in">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}><button className="btn small" onClick={onBack}>← Back</button><div className="mono" style={{ color:'var(--espresso-soft)' }}>{formatDate(sub.date)}</div></div>
      <h2 className="display" style={{ color:'var(--wine)', fontSize:42, margin:'12px 0 4px', fontWeight:500 }}>{sub.name}</h2>
      <div className="italic-serif" style={{ color:'var(--gold)' }}>{Object.keys(sub.answers).length} of {questions.length} questions answered</div>
      <OrnamentDivider glyph="✠" />
      <div className="section-title"><span className="name" style={{ color:'var(--wine)' }}>Full Ranking</span></div>
      <GoldLine />
      <div style={{ marginTop:14 }}>{scores.map((d,i) => <div key={d.id} className={"denom-row "+(i<3?"top":"")}><div className="rank">{i+1}</div><div className="name">{d.name}</div><div className={"pct "+(d.score>=70?'score-strong':d.score>=50?'score-medium':'score-weak')}>{d.score}%</div><div className="bar progress-bar"><div className="progress-fill" style={{ width:d.score+'%' }} /></div></div>)}</div>
      {CATEGORIES.map(cat => { const items = questions.filter(q=>q.cat===cat.id); return (
        <div key={cat.id} style={{ marginTop:30 }}>
          <div className="section-title"><span className="roman">{cat.roman}</span><span className="name">{cat.name}</span></div><GoldLine />
          <div style={{ marginTop:10 }}>{items.map(q => <div key={q.id} style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(139,105,20,0.12)' }}><div style={{ fontSize:15 }}><span className="q-num">{q.id}.</span>{q.text}{sub.notes?.[q.id]&&<div className="italic-serif" style={{ fontSize:13, color:'var(--espresso-soft)', marginTop:4 }}>"{sub.notes[q.id]}"</div>}</div><div><AnswerBadge value={sub.answers[q.id]} /></div></div>)}</div>
        </div>
      ); })}
      {onDelete && <div style={{ marginTop:36, paddingTop:20, borderTop:'1px solid var(--red)' }}><button className="btn danger" onClick={()=>{if(confirm('Delete '+sub.name+"'s response permanently?"))onDelete(sub.id);}}>✗ Delete Response</button></div>}
    </div>
  );
}

function Dashboard({ submissions, questions }) {
  const [detailId, setDetailId] = useState(null);
  if (detailId) { const sub = submissions.find(s=>s.id===detailId); if (!sub) { setDetailId(null); return null; } return <PageFrame><PersonDetail sub={sub} questions={questions} onBack={()=>setDetailId(null)} /></PageFrame>; }
  return (
    <PageFrame wide>
      <header style={{ textAlign:'center' }}>
        <div className="smallcaps" style={{ color:'var(--gold)', fontSize:12 }}>✠ All Testimonies ✠</div>
        <h1 className="display" style={{ color:'var(--wine)', fontSize:48, margin:'6px 0', fontWeight:500 }}>Dashboard</h1>
        <div className="italic-serif" style={{ color:'var(--gold)' }}>{submissions.length === 0 ? 'No testimonies yet — be the first to fill the questionnaire.' : `All ${submissions.length} testimonies · Click any to view detail`}</div>
      </header>
      <OrnamentDivider glyph="❦" />
      {submissions.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ color:'var(--gold)', fontSize:48, marginBottom:12 }}>✠</div>
          <div className="italic-serif" style={{ color:'var(--espresso-soft)', fontSize:18 }}>The scroll is empty. Share the link and gather thy brethren.</div>
        </div>
      ) : (
        <div className="person-grid">{submissions.map(s=><PersonCard key={s.id} sub={s} questions={questions} onSelect={()=>setDetailId(s.id)} />)}</div>
      )}
    </PageFrame>
  );
}

function Admin({ submissions, questions, setQuestions, onWipeResponses, onResetQuestions, authed, setAuthed }) {
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCat, setNewCat] = useState(CATEGORIES[0].id);
  const [pw, setPw] = useState(''); const [pwNew, setPwNew] = useState(''); const [pwMsg, setPwMsg] = useState('');
  if (!authed) return <PasswordGate onUnlock={()=>setAuthed(true)} title="Admin Gate" />;
  const savePwChange = () => {
    const stored = localStorage.getItem('berwez-pw') || 'berwez';
    if (pw !== stored) { setPwMsg('Current password incorrect.'); return; }
    if (pwNew.length < 4) { setPwMsg('New password too short (min 4).'); return; }
    localStorage.setItem('berwez-pw', pwNew); setPw(''); setPwNew(''); setPwMsg('Password updated.'); setTimeout(()=>setPwMsg(''),2500);
  };
  const saveEdit = (id, changes) => { setQuestions(qs=>qs.map(q=>q.id===id?{...q,...changes}:q)); setEditingId(null); };
  const delQ = id => { if (confirm('Delete question permanently?')) setQuestions(qs=>qs.filter(q=>q.id!==id)); };
  const moveQ = (idx, delta) => { setQuestions(qs=>{ const n=[...qs]; const t=idx+delta; if(t<0||t>=n.length) return qs; [n[idx],n[t]]=[n[t],n[idx]]; return n; }); };
  const addNew = () => { if (!newText.trim()) return; const nextId=Math.max(...questions.map(q=>q.id))+1; const weights={}; DENOMS.forEach(d=>weights[d.id]=0); setQuestions(qs=>[...qs,{id:nextId,cat:newCat,text:newText.trim(),weights}]); setNewText(''); setAdding(false); };

  return (
    <PageFrame wide>
      <header style={{ textAlign:'center' }}>
        <div className="smallcaps" style={{ color:'var(--gold)', fontSize:12 }}>⚜ Administrator ⚜</div>
        <h1 className="display" style={{ color:'var(--wine)', fontSize:48, margin:'6px 0', fontWeight:500 }}>Admin</h1>
        <div className="italic-serif" style={{ color:'var(--gold)' }}>Edit questions, rotate the password, manage responses.</div>
      </header>
      <OrnamentDivider glyph="⚜" />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div className="stat-box aligned"><div className="v">{questions.length}</div><div className="l">Questions</div></div>
        <div className="stat-box agree"><div className="v">{submissions.length}</div><div className="l">Responses</div></div>
      </div>
      <div style={{ marginTop:30 }}>
        <div className="section-title"><span className="name" style={{ color:'var(--wine)' }}>Rotate Password</span></div><GoldLine />
        <div className="card" style={{ marginTop:12, display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:10, alignItems:'end' }}>
          <div><div className="smallcaps" style={{ fontSize:10, marginBottom:4, color:'var(--espresso-soft)' }}>Current</div><input className="input" type="password" value={pw} onChange={e=>setPw(e.target.value)} /></div>
          <div><div className="smallcaps" style={{ fontSize:10, marginBottom:4, color:'var(--espresso-soft)' }}>New</div><input className="input" type="password" value={pwNew} onChange={e=>setPwNew(e.target.value)} /></div>
          <button className="btn" onClick={savePwChange}>Update</button>
        </div>
        {pwMsg&&<div className="italic-serif" style={{ color:pwMsg.includes('updated')?'var(--green)':'var(--red)', marginTop:8 }}>{pwMsg}</div>}
      </div>
      <div style={{ marginTop:30 }}>
        <div className="section-title" style={{ justifyContent:'space-between', display:'flex' }}><span className="name" style={{ color:'var(--wine)' }}>Questions ({questions.length})</span><button className="btn small" onClick={()=>setAdding(v=>!v)}>+ Add</button></div><GoldLine />
        {adding&&<div className="q-admin-edit" style={{ marginTop:12 }}><textarea className="input" rows={3} placeholder="New question text…" value={newText} onChange={e=>setNewText(e.target.value)} /><div style={{ display:'flex', gap:10, marginTop:10, alignItems:'center' }}><select className="select" value={newCat} onChange={e=>setNewCat(e.target.value)} style={{ maxWidth:280 }}>{CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.roman} {c.name}</option>)}</select><div style={{ marginLeft:'auto', display:'flex', gap:8 }}><button className="btn small" onClick={()=>{setAdding(false);setNewText('');}}>Cancel</button><button className="btn primary small" onClick={addNew}>Add Question</button></div></div></div>}
        <div style={{ marginTop:14, border:'1px solid rgba(139,105,20,0.25)', background:'var(--cream)' }}>
          {questions.map((q,idx) => editingId===q.id ? (
            <div key={q.id} className="q-admin-edit"><textarea className="input" rows={3} defaultValue={q.text} id={`edit-${q.id}`} /><div style={{ display:'flex', gap:10, marginTop:10, alignItems:'center' }}><select className="select" defaultValue={q.cat} id={`cat-${q.id}`} style={{ maxWidth:280 }}>{CATEGORIES.map(c=><option key={c.id} value={c.id}>{c.roman} {c.name}</option>)}</select><div style={{ marginLeft:'auto', display:'flex', gap:8 }}><button className="btn small" onClick={()=>setEditingId(null)}>Cancel</button><button className="btn primary small" onClick={()=>saveEdit(q.id,{text:document.getElementById(`edit-${q.id}`).value,cat:document.getElementById(`cat-${q.id}`).value})}>Save</button></div></div></div>
          ) : (
            <div key={q.id} className="q-admin"><div className="num">{idx+1}</div><div><div style={{ fontSize:15, lineHeight:1.4 }}>{q.text}</div><div style={{ marginTop:6 }}><span className="cat-tag">{CATEGORIES.find(c=>c.id===q.cat)?.roman} {CATEGORIES.find(c=>c.id===q.cat)?.name}</span></div></div><div className="actions"><button className="icon-btn" title="Move up" disabled={idx===0} onClick={()=>moveQ(idx,-1)}>▲</button><button className="icon-btn" title="Move down" disabled={idx===questions.length-1} onClick={()=>moveQ(idx,1)}>▼</button><button className="icon-btn" title="Edit" onClick={()=>setEditingId(q.id)}>✎</button><button className="icon-btn danger" title="Delete" onClick={()=>delQ(q.id)}>✗</button></div></div>
          ))}
        </div>
      </div>
      <div className="danger-zone"><h3>✗ Danger Zone</h3><p style={{ fontStyle:'italic', color:'var(--espresso-soft)', margin:'0 0 14px' }}>These actions cannot be undone. Tread carefully.</p><div style={{ display:'flex', gap:10, flexWrap:'wrap' }}><button className="btn danger" onClick={()=>{if(confirm('Delete ALL submitted responses? This cannot be undone.'))onWipeResponses();}}>Delete All Responses</button><button className="btn danger" onClick={()=>{if(confirm('Reset questions to the original 40? All edits will be lost.'))onResetQuestions();}}>Reset Questions</button></div></div>
    </PageFrame>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════

export default function App() {
  const [tab, setTab] = useState('questionnaire');
  const [submissions, setSubmissions] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminAuthed, setAdminAuthed] = useState(false);

  // Load from API on mount
  useEffect(() => {
    (async () => {
      const [subs, qs] = await Promise.all([api.get('submissions'), api.get('questions')]);
      setSubmissions(subs || SEED);
      setQuestions(qs || DEFAULT_QUESTIONS);
      setLoading(false);
    })();
  }, []);

  // Persist to API on change
  useEffect(() => { if (submissions !== null) api.set('submissions', submissions); }, [submissions]);
  useEffect(() => { if (questions !== null) api.set('questions', questions); }, [questions]);

  if (loading || !submissions || !questions) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:'var(--serif-display)', color:'var(--wine)', fontSize:22 }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ color:'var(--gold)', fontSize:48, marginBottom:12 }}>✠</div>
        Loading the Questionnaire…
      </div>
    </div>
  );

  const addSub = sub => setSubmissions(s => [sub, ...s]);
  const delSub = id => setSubmissions(s => s.filter(x => x.id !== id));
  const wipe = () => setSubmissions([]);
  const resetQ = () => setQuestions(DEFAULT_QUESTIONS);

  return (
    <>
      <Nav tab={tab} setTab={setTab} />
      {tab === 'questionnaire' && <Questionnaire onSubmit={addSub} goTo={setTab} questions={questions} />}
      {tab === 'community' && <Community submissions={submissions} questions={questions} />}
      {tab === 'dashboard' && <Dashboard submissions={submissions} questions={questions} />}
      {tab === 'admin' && <Admin submissions={submissions} questions={questions} setQuestions={setQuestions} onWipeResponses={wipe} onResetQuestions={resetQ} authed={adminAuthed} setAuthed={setAdminAuthed} />}
      <footer style={{ textAlign:'center', padding:'30px 20px 60px', color:'var(--espresso-soft)', fontFamily:'var(--serif-display)', fontSize:13, letterSpacing:'0.15em', textTransform:'uppercase', opacity:0.7 }}>
        <div style={{ color:'var(--gold)', fontSize:18, marginBottom:6 }}>✠ ❦ ✠</div>
        The Berwez Questionnaire · Anno Domini MMXXVI
      </footer>
    </>
  );
}
