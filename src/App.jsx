import { useState, useEffect } from "react";
import { storage } from "./firebase.js";

const C={gold:"#8B6914",wine:"#5C1A1B",parch:"#F5ECD7",brown:"#3B2314",lgold:"#E8D5A3",bgold:"#9E7C1B",sub:"#FAF6EC",warm:"#FFFDF5",grn:"#2D6A2E",red:"#9B1C1C"};
const F="Georgia,'Times New Roman',serif";
const catNames=["I. Scripture & Doctrine","II. Ecclesiology","III. Creation & Origins","IV. Christian Life & Conduct","V. Authority & Society"];
const catSubs=["On the Authority of Holy Writ and the Rule of Faith","On the Church, Her Governance, and the Office of the Ministry","On the Beginning of All Things","On Piety, Modesty, and Separation from the World","On Leadership, the Sword, and the Public Square"];
const ansOpts=["Yes","No","Partially / With Nuance"];
const SK_Q="fq-qs",SK_R="fq-rs",SK_PW="fq-pw";

const defaultQs=[
  {t:"Do you believe the Bible to be the ultimate and final authority on all matters of faith and life?",c:0},
  {t:"Do you affirm all points of the Nicene Creed?",c:0},
  {t:"Do you believe that baptism strictly is: for believers only, after true repentance, a symbol of salvation (wedding ring analogy), and by full immersion only?",c:0},
  {t:"Do you believe the Lord\u2019s Supper is symbolic, or is it the literal body and blood of Christ?",c:0},
  {t:"Do you believe the King James Bible is the most reliable English Bible?",c:0},
  {t:"Do you reject most modern Bible translations as corrupted?",c:0},
  {t:"Do you believe the Bible should always be interpreted literally unless the text shows otherwise (e.g., the Beast of Revelation 13)?",c:0},
  {t:"Do you believe in the Five Solas?",c:0},
  {t:"Do you believe that a believer should most likely have had a personal conversion experience (e.g., a moment of conviction of sin and need for salvation)?",c:0},
  {t:"Do you believe in \u201Conce saved always saved\u201D (unless the person falls away)?",c:0},
  {t:"Do you believe most churches today are false or apostate?",c:1},
  {t:"Do you believe that each church should govern itself with no central authority?",c:1},
  {t:"Do you believe Roman Catholicism is not truly Christian?",c:1},
  {t:"Do you believe churches should denounce, rebuke, and completely separate from heretics and pagans (except for evangelistic purposes)?",c:1},
  {t:"Do you support confrontational street preaching?",c:1},
  {t:"Do you believe pastors should aggressively call out and condemn all unbiblical teachings, practices, and ideologies?",c:1},
  {t:"Do you believe the creation account in the Book of Genesis is 100% literal history?",c:2},
  {t:"Do you believe the earth is about 6,000\u201310,000 years old?",c:2},
  {t:"Do you reject evolution in all forms?",c:2},
  {t:"Do you believe Adam and Eve were real historical individuals?",c:2},
  {t:"Do you believe Noah\u2019s flood covered the entire earth, annihilating all life?",c:2},
  {t:"Do you believe all humans today descend from Noah after the flood?",c:2},
  {t:"Do you believe Christians should follow strict modest dress standards?",c:3},
  {t:"Do you believe men should have short hair and women long hair as a command?",c:3},
  {t:"Do you believe women should not teach or have authority over men in church and most other contexts?",c:3},
  {t:"Do you believe men and women have strictly separate, God-ordained roles?",c:3},
  {t:"Do you oppose all forms of LGBTQ+ acceptance, including legal recognition?",c:3},
  {t:"Do you believe Christians should avoid secular entertainment?",c:3},
  {t:"Do you believe Christians should avoid secular music entirely?",c:3},
  {t:"Do you believe drinking alcohol is always sinful?",c:3},
  {t:"Do you believe Christians should avoid close friendships with non-believers?",c:3},
  {t:"Do you believe the modern world is irredeemably corrupt and hostile to true Christianity?",c:3},
  {t:"Do you believe strong, harsh preaching is necessary and biblical?",c:4},
  {t:"Do you believe pastors should exercise strong authority over members\u2019 lives?",c:4},
  {t:"Do you believe homeschooling is preferable or necessary to protect children\u2019s faith?",c:4},
  {t:"Do you believe physical discipline is a required biblical method in raising children?",c:4},
  {t:"Do you believe that all leadership roles and positions are strictly reserved for men?",c:4},
  {t:"Do you believe that Christians should engage in politics?",c:4},
  {t:"Do you believe that all non-Christians go to hell?",c:4},
  {t:"Do you believe that Christians can and should be armed and have the right to use lethal force in self-defense?",c:4},
];

const shortQ=["Bible as ultimate authority","Nicene Creed","Believer\u2019s baptism / immersion only","Lord\u2019s Supper: symbolic or literal?","KJV most reliable","Modern translations corrupted","Literal interpretation default","Five Solas","Personal conversion experience","Once saved always saved","Most churches false/apostate","Church self-governance only","Catholicism not truly Christian","Separate from heretics completely","Confrontational street preaching","Pastors condemn all unbiblical teaching","Genesis 100% literal history","Earth 6K\u201310K years old","Reject all evolution","Adam & Eve historical","Global flood","All descend from Noah","Strict modest dress","Hair length as command","Women cannot teach/lead men","Strictly separate gender roles","Oppose all LGBTQ+ acceptance","Avoid secular entertainment","Avoid secular music entirely","Alcohol always sinful","Avoid friendships with non-believers","Modern world irredeemably corrupt","Harsh preaching necessary","Pastors: strong authority over members","Homeschooling preferable/necessary","Physical discipline required","All leadership reserved for men","Christians should engage in politics","All non-Christians go to hell","Christians armed / lethal self-defense"];

const denoms=[
  {id:"ifb",name:"Independent Fundamental Baptist",short:"IFB",desc:"Strictly separatist, KJV-only, dispensationalist, strong pastoral authority, cultural conservatism.",ex:["Y","P","Y","S","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","P","Y","Y"]},
  {id:"sbc",name:"Southern Baptist Convention",short:"SBC",desc:"Conservative evangelical, believer\u2019s baptism, congregational governance, complementarian.",ex:["Y","P","Y","S","N","N","P","Y","Y","Y","N","Y","N","P","N","P","Y","P","Y","Y","Y","P","P","N","Y","Y","Y","N","N","N","N","P","P","N","P","P","Y","Y","Y","P"]},
  {id:"refbap",name:"Reformed Baptist",short:"Ref. Baptist",desc:"Calvinist soteriology, 1689 Confession, believer\u2019s baptism, elder-led, doctrinally rigorous.",ex:["Y","Y","Y","S","N","N","P","Y","Y","Y","P","Y","P","P","N","Y","P","P","P","Y","P","P","P","N","Y","Y","Y","N","N","N","N","P","P","N","P","P","Y","P","Y","P"]},
  {id:"presb",name:"Reformed / Presbyterian",short:"Reformed",desc:"Confessional Calvinism, covenant theology, infant baptism, elder governance.",ex:["Y","Y","N","P","N","N","P","Y","Y","Y","P","N","P","P","N","Y","P","N","P","Y","P","P","P","N","Y","Y","Y","N","N","N","N","P","P","N","P","P","Y","Y","Y","P"]},
  {id:"luth",name:"Confessional Lutheran (LCMS)",short:"Lutheran",desc:"Sola Scriptura, sacramental theology, real presence in Eucharist, two kingdoms.",ex:["Y","Y","N","L","N","N","P","Y","P","P","P","N","P","P","N","P","P","N","P","Y","P","P","N","N","Y","Y","Y","N","N","N","N","P","N","N","P","P","Y","Y","Y","P"]},
  {id:"angl",name:"Anglican (ACNA)",short:"Anglican",desc:"Via media, creedal, sacramental, episcopal, Book of Common Prayer.",ex:["Y","Y","N","P","N","N","N","P","P","P","N","N","N","N","N","N","P","N","N","Y","P","P","N","N","P","P","Y","N","N","N","N","N","N","N","N","N","P","Y","P","P"]},
  {id:"cath",name:"Roman Catholic",short:"Catholic",desc:"Scripture + Tradition, Magisterium, seven sacraments, transubstantiation, papal authority.",ex:["P","Y","N","L","N","N","N","N","N","N","N","N","N","N","N","N","P","N","N","Y","P","P","P","N","Y","Y","Y","N","N","N","N","P","N","N","N","P","Y","Y","P","P"]},
  {id:"ortho",name:"Eastern Orthodox",short:"Orthodox",desc:"Holy Tradition, seven ecumenical councils, theosis, mystery sacraments, liturgical.",ex:["P","Y","N","L","N","N","N","N","N","N","N","N","N","N","N","N","P","N","N","Y","P","P","P","N","Y","Y","Y","N","N","N","N","P","N","N","N","P","Y","P","P","N"]},
  {id:"pente",name:"Pentecostal / Charismatic",short:"Pentecostal",desc:"Spirit baptism, tongues, divine healing, expressive worship.",ex:["Y","P","Y","S","N","N","P","P","Y","P","P","Y","P","P","Y","Y","Y","P","Y","Y","Y","Y","Y","Y","Y","Y","Y","P","P","P","N","Y","Y","Y","P","P","Y","Y","Y","P"]},
  {id:"nonde",name:"Non-Denominational Evangelical",short:"Non-Denom",desc:"Bible-focused, contemporary worship, pragmatic ecclesiology.",ex:["Y","P","P","S","N","N","P","P","Y","P","N","Y","N","N","N","P","P","P","P","Y","P","P","N","N","P","P","P","N","N","N","N","P","N","N","N","N","P","Y","P","P"]},
  {id:"meth",name:"Traditional Methodist",short:"Methodist",desc:"Wesleyan-Arminian, prevenient grace, sanctification, social holiness.",ex:["Y","Y","N","P","N","N","N","P","Y","N","N","N","N","N","N","N","N","N","N","Y","P","P","N","N","N","N","P","N","N","N","N","N","N","N","N","N","N","Y","P","P"]},
  {id:"anab",name:"Anabaptist / Mennonite",short:"Anabaptist",desc:"Believer\u2019s baptism, pacifism, separation from state, simple living.",ex:["Y","P","Y","S","N","N","P","P","Y","N","P","Y","P","Y","N","P","Y","P","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","Y","P","Y","Y","N","P","Y","Y","Y","N","P","N"]},
];

function scoreMatch(ans,ex){let tot=0,m=0;for(let i=0;i<ex.length;i++){const a=ans[i];if(!a)continue;tot++;const n=a==="Yes"?"Y":a==="No"?"N":"P",e=ex[i];if(i===3){if((e==="S"&&(n==="Y"||n==="P"))||(e==="L"&&n==="N"))m+=0.7;else if(e==="P")m+=0.5;continue;}if(n===e)m++;else if(e==="P"||n==="P")m+=0.4;}return tot>0?Math.round((m/tot)*100):0;}
function getDenom(ans){return denoms.map(d=>({...d,score:scoreMatch(ans,d.ex)})).sort((a,b)=>b.score-a.score);}

export default function App(){
  const[pg,setPg]=useState("form");
  const[qs,setQs]=useState(defaultQs);
  const[resp,setResp]=useState([]);
  const[apw,setApw]=useState("");
  const[ld,setLd]=useState(true);

  useEffect(()=>{(async()=>{
    try{const r=await storage.get(SK_Q);if(r?.value)setQs(JSON.parse(r.value));}catch(e){}
    try{const r=await storage.get(SK_R);if(r?.value)setResp(JSON.parse(r.value));}catch(e){}
    try{const r=await storage.get(SK_PW);if(r?.value)setApw(JSON.parse(r.value));}catch(e){}
    setLd(false);
  })();},[]);

  const sQ=async q=>{setQs(q);try{await storage.set(SK_Q,JSON.stringify(q));}catch(e){}};
  const sR=async r=>{setResp(r);try{await storage.set(SK_R,JSON.stringify(r));}catch(e){}};
  const sP=async p=>{setApw(p);try{await storage.set(SK_PW,JSON.stringify(p));}catch(e){}};

  if(ld)return<div style={{background:C.parch,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F}}><p style={{color:C.gold,fontSize:20,letterSpacing:2}}>Loading...</p></div>;

  const tabs=[["form","\u2720 Fill"],["community","Community"],["dash","Dashboard"],["admin","Admin"]];
  return(
    <div style={{background:`linear-gradient(180deg,${C.parch} 0%,${C.warm} 30%,${C.parch} 100%)`,minHeight:"100vh",fontFamily:F,color:C.brown}}>
      <nav style={{position:"sticky",top:0,zIndex:100,background:C.wine,display:"flex",justifyContent:"center",borderBottom:`3px solid ${C.gold}`,flexWrap:"wrap"}}>
        {tabs.map(([id,lb])=><button key={id} onClick={()=>setPg(id)} style={{background:pg===id?C.gold:"transparent",color:pg===id?C.wine:C.lgold,border:"none",padding:"12px 18px",cursor:"pointer",fontFamily:F,fontSize:11,letterSpacing:1.5,textTransform:"uppercase",fontWeight:pg===id?"bold":"normal"}}>{lb}</button>)}
      </nav>
      {pg==="form"&&<FormPage qs={qs} onSubmit={e=>sR([...resp,e])}/>}
      {pg==="community"&&<CommunityPage resp={resp} qs={qs}/>}
      {pg==="dash"&&<DashPage resp={resp} qs={qs} apw={apw} onDel={i=>{const u=[...resp];u.splice(i,1);sR(u);}}/>}
      {pg==="admin"&&<AdminPage qs={qs} onSQ={sQ} apw={apw} onSP={sP} resp={resp} onClear={()=>sR([])}/>}
    </div>
  );
}

function FormPage({qs,onSubmit}){
  const[ans,setAns]=useState({});const[notes,setNotes]=useState({});const[name,setName]=useState("");const[done,setDone]=useState(false);const[res,setRes]=useState(null);
  const prog=Math.round((Object.keys(ans).length/qs.length)*100);
  const submit=()=>{if(!name.trim())return alert("Enter your name.");if(Object.keys(ans).length<Math.floor(qs.length*0.5))return alert("Answer at least half the questions.");const e={name:name.trim(),ans:{...ans},notes:{...notes},at:new Date().toISOString()};onSubmit(e);setRes(getDenom(ans));setDone(true);};
  if(done&&res)return(<div style={{maxWidth:700,margin:"0 auto",padding:"50px 24px",textAlign:"center"}}><p style={{color:C.gold,fontSize:28,letterSpacing:3}}>{"\u2720 \u2721 \u2720"}</p><h2 style={{color:C.wine,fontSize:24,margin:"20px 0 8px",fontWeight:"normal"}}>Testimony Recorded, {name}</h2><p style={{color:C.brown,fontSize:14,fontStyle:"italic",marginBottom:28}}>Your top denomination matches:</p><div style={{textAlign:"left"}}>{res.slice(0,5).map((d,i)=><DBar key={d.id} d={d} r={i+1}/>)}</div><p style={{color:C.gold,fontSize:16,marginTop:30}}>{"\u2766"}</p><p style={{color:C.brown,fontStyle:"italic",fontSize:12}}>Switch to <strong>Community</strong> to compare with your friends.</p></div>);
  const grouped={};qs.forEach((q,i)=>{if(!grouped[q.c])grouped[q.c]=[];grouped[q.c].push({...q,idx:i});});
  return(
    <div style={{maxWidth:760,margin:"0 auto",padding:"0 20px 80px"}}>
      <div style={{textAlign:"center",padding:"42px 0 22px"}}>
        <p style={{color:C.gold,fontSize:22,letterSpacing:4,margin:0}}>{"\u2720 \u2721 \u2720"}</p>
        <h1 style={{color:C.wine,fontSize:30,margin:"20px 0 6px",fontWeight:"normal",letterSpacing:2}}>THE BERWEZ QUESTIONNAIRE</h1>
        <p style={{color:C.gold,fontSize:14,letterSpacing:4,margin:0,fontVariant:"small-caps"}}>Forty Questions on Faith and Practice</p>
        <Dv/><p style={{color:C.brown,fontStyle:"italic",fontSize:13}}>An Examination of Conscience & Conviction</p>
        <p style={{color:C.brown,fontStyle:"italic",fontSize:13,margin:"14px 0 4px"}}>{"\u201CExamine yourselves to see whether you are in the faith; test yourselves.\u201D"}</p>
        <p style={{color:C.gold,fontSize:10,letterSpacing:1,fontVariant:"small-caps"}}>{"\u2014 2 Corinthians 13:5"}</p>
      </div>
      <div style={{background:C.warm,border:`2px solid ${C.bgold}`,borderRadius:4,padding:"18px 22px",marginBottom:24,textAlign:"center"}}>
        <label style={{display:"block",color:C.wine,fontSize:13,marginBottom:8,letterSpacing:1}}>YOUR NAME</label>
        <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your name..." style={iS({textAlign:"center",maxWidth:340,fontSize:14})}/>
      </div>
      <div style={{background:C.warm,border:`1px solid ${C.lgold}`,borderRadius:4,padding:"10px 16px",marginBottom:24,position:"sticky",top:45,zIndex:50,boxShadow:"0 2px 10px rgba(59,35,20,0.07)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:C.brown,fontSize:10,letterSpacing:1}}>PROGRESS</span><span style={{color:C.gold,fontSize:10,fontWeight:"bold"}}>{Object.keys(ans).length}/{qs.length}</span></div>
        <div style={{background:C.parch,borderRadius:10,height:5,overflow:"hidden"}}><div style={{width:`${prog}%`,height:"100%",background:`linear-gradient(90deg,${C.wine},${C.gold})`,borderRadius:10,transition:"width 0.4s"}}/></div>
      </div>
      {Object.keys(grouped).sort().map(ck=>{const ci=parseInt(ck);return(
        <div key={ci} style={{marginBottom:32}}>
          <div style={{textAlign:"center",margin:"24px 0 14px"}}><p style={{color:C.gold,fontSize:14,margin:"0 0 4px"}}>{"\u2766"}</p><h2 style={{color:C.wine,fontSize:14,letterSpacing:3,fontVariant:"small-caps",margin:"0 0 2px",fontWeight:"bold"}}>{catNames[ci]||`Category ${ci+1}`}</h2><p style={{color:C.gold,fontStyle:"italic",fontSize:10,margin:0}}>{catSubs[ci]||""}</p></div>
          {grouped[ck].map(q=>{const gi=q.idx,d=ans[gi]!==undefined;return(
            <div key={gi} style={{background:d?C.warm:"transparent",border:`1px solid ${d?C.bgold:C.lgold}`,borderLeft:`4px solid ${d?C.gold:C.lgold}`,borderRadius:4,padding:"12px 16px",marginBottom:8}}>
              <p style={{margin:"0 0 8px",fontSize:13,lineHeight:1.6}}><span style={{color:C.wine,fontWeight:"bold",marginRight:4}}>{gi+1}.</span>{q.t}</p>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{ansOpts.map(o=>{const s=ans[gi]===o;return<button key={o} onClick={()=>setAns(p=>({...p,[gi]:o}))} style={aB(s)}>{o}</button>;})}</div>
              {ans[gi]&&<input type="text" value={notes[gi]||""} onChange={e=>setNotes(p=>({...p,[gi]:e.target.value}))} placeholder="Optional note..." style={iS({marginTop:5,fontSize:10,fontStyle:"italic"})}/>}
            </div>);})}
        </div>);})}
      <div style={{textAlign:"center",padding:"20px 0"}}><button onClick={submit} style={subBtn}>Submit Testimony</button></div>
    </div>
  );
}

function CommunityPage({resp,qs}){
  const[selA,setSelA]=useState(null);const[selB,setSelB]=useState(null);const[mode,setMode]=useState("board");
  if(!resp.length)return<div style={{maxWidth:700,margin:"0 auto",padding:"80px 24px",textAlign:"center"}}><p style={{color:C.gold,fontSize:28}}>{"\u2766"}</p><p style={{color:C.brown,fontSize:15,fontStyle:"italic"}}>No testimonies yet. Be the first to fill the questionnaire.</p></div>;
  const startCompare=()=>{if(selA===null||selB===null)return alert("Select two people.");if(selA===selB)return alert("Select two different people.");setMode("compare");};
  if(mode==="compare"&&selA!==null&&selB!==null){
    const a=resp[selA],b=resp[selB],denomA=getDenom(a.ans),denomB=getDenom(b.ans);
    const diffs=[],agrees=[];
    for(let i=0;i<qs.length;i++){const aa=a.ans[i],bb=b.ans[i];if(!aa||!bb)continue;if(aa===bb)agrees.push(i);else diffs.push(i);}
    const catDiffs={};diffs.forEach(i=>{const cc=qs[i]?.c??0;if(!catDiffs[cc])catDiffs[cc]=[];catDiffs[cc].push(i);});
    return(
      <div style={{maxWidth:800,margin:"0 auto",padding:"30px 16px 80px"}}>
        <button onClick={()=>setMode("board")} style={{...sB(false),marginBottom:16}}>{"\u2190"} Back</button>
        <div style={{textAlign:"center",marginBottom:24}}><p style={{color:C.gold,fontSize:22,letterSpacing:4}}>{"\u2720 \u2721 \u2720"}</p><h2 style={{color:C.wine,fontSize:22,fontWeight:"normal",margin:"10px 0 4px",letterSpacing:2}}>COMPARISON</h2><p style={{color:C.gold,fontSize:14,fontWeight:"bold"}}>{a.name} <span style={{fontWeight:"normal",fontStyle:"italic"}}>vs</span> {b.name}</p></div>
        <div style={{display:"flex",gap:14,marginBottom:24,flexWrap:"wrap"}}>{[{r:a,d:denomA},{r:b,d:denomB}].map(({r:p,d},idx)=>(<div key={idx} style={{flex:1,minWidth:240,background:C.warm,border:`2px solid ${C.bgold}`,borderRadius:4,padding:"16px",textAlign:"center"}}><div style={{color:C.wine,fontWeight:"bold",fontSize:16,marginBottom:8}}>{p.name}</div><div style={{color:C.gold,fontSize:11,letterSpacing:1,marginBottom:6}}>TOP MATCH</div><div style={{fontSize:18,fontWeight:"bold",color:C.wine}}>{d[0].short}</div><div style={{fontSize:26,fontWeight:"bold",color:d[0].score>=70?C.grn:d[0].score>=50?C.gold:C.red}}>{d[0].score}%</div><div style={{fontSize:10,color:C.brown,fontStyle:"italic"}}>{d[0].name}</div></div>))}</div>
        <div style={{display:"flex",gap:14,marginBottom:24,justifyContent:"center",flexWrap:"wrap"}}><SB n={agrees.length} l="AGREE" bg="#E8F5E9" bd="#A5D6A7" c={C.grn}/><SB n={diffs.length} l="DIFFER" bg="#FDECEC" bd="#E0A0A0" c={C.red}/><SB n={Math.round((agrees.length/(agrees.length+diffs.length||1))*100)} l="% ALIGNED" bg="#FFF8E1" bd={C.lgold} c={C.gold} s="%"/></div>
        {diffs.length>0&&(<div style={{border:`2px solid ${C.bgold}`,borderRadius:4,overflow:"hidden",marginBottom:24}}>
          <div style={{background:C.wine,padding:"10px 16px",color:C.lgold,fontSize:12,letterSpacing:2,fontVariant:"small-caps"}}>Where You Differ</div>
          <div style={{padding:"16px"}}>
            {Object.keys(catDiffs).sort().map(ck=>{const ci=parseInt(ck);return(<div key={ci} style={{marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{color:C.wine,fontSize:12,fontWeight:"bold",fontVariant:"small-caps",letterSpacing:1}}>{catNames[ci]}</span><span style={{background:"#FDECEC",color:C.red,fontSize:10,padding:"2px 8px",borderRadius:10,fontWeight:"bold"}}>{catDiffs[ck].length}</span></div>
              {catDiffs[ck].map(i=>(<div key={i} style={{background:C.sub,border:`1px solid ${C.lgold}`,borderRadius:4,padding:"10px 14px",marginBottom:8}}>
                <div style={{fontSize:12,fontWeight:"bold",color:C.brown,marginBottom:6}}>Q{i+1}. {shortQ[i]||qs[i]?.t}</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{[a,b].map((p,pi)=>(<div key={pi} style={{flex:1,minWidth:120}}><div style={{fontSize:10,color:C.gold,marginBottom:3}}>{p.name}</div><Bg v={p.ans[i]}/>{p.notes?.[i]&&<div style={{fontSize:9,fontStyle:"italic",color:C.gold,marginTop:2}}>{"\u201C"}{p.notes[i]}{"\u201D"}</div>}</div>))}</div>
              </div>))}
            </div>);})}
            <div style={{marginTop:16,padding:"14px 16px",background:C.warm,border:`1px solid ${C.bgold}`,borderRadius:4,borderLeft:`4px solid ${C.gold}`}}>
              <div style={{color:C.wine,fontSize:12,fontWeight:"bold",marginBottom:6,letterSpacing:1}}>SUMMARY</div>
              <p style={{fontSize:12,lineHeight:1.7,color:C.brown,margin:0}}>
                {a.name} and {b.name} agree on <strong>{agrees.length}</strong> question{agrees.length!==1?"s":""} and differ on <strong>{diffs.length}</strong>.
                {agrees.length>diffs.length?" More common ground than division.":" Significant theological divergence."}
                {" "}Strongest disagreement area: <strong>{catNames[parseInt(Object.keys(catDiffs).sort((x,y)=>(catDiffs[y]?.length||0)-(catDiffs[x]?.length||0))[0])]||"theology"}</strong>.
                {" "}{a.name} leans <strong>{denomA[0].short}</strong> while {b.name} leans <strong>{denomB[0].short}</strong>
                {denomA[0].id===denomB[0].id?"\u2014same tradition, differences are within the family.":`\u2014different traditions, reflecting distinct doctrinal convictions.`}
              </p>
            </div>
          </div>
        </div>)}
        <div style={{border:`2px solid ${C.bgold}`,borderRadius:4,overflow:"hidden"}}><div style={{background:C.wine,padding:"10px 16px",color:C.lgold,fontSize:12,letterSpacing:2,fontVariant:"small-caps"}}>Full Side-by-Side</div>
          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{background:C.wine}}><th style={{padding:"8px 10px",textAlign:"left",color:C.lgold,fontSize:10,minWidth:180,position:"sticky",left:0,background:C.wine,zIndex:2}}>Question</th><th style={{padding:"8px",textAlign:"center",color:C.lgold,fontSize:11,minWidth:100}}>{a.name}</th><th style={{padding:"8px",textAlign:"center",color:C.lgold,fontSize:11,minWidth:100}}>{b.name}</th><th style={{padding:"8px",textAlign:"center",color:C.lgold,fontSize:10,minWidth:30}}></th></tr></thead>
            <tbody>{qs.map((q,i)=>{const aa=a.ans[i],bb=b.ans[i],same=aa&&bb&&aa===bb,diff=aa&&bb&&aa!==bb;return(<tr key={i} style={{background:i%2===0?C.warm:C.sub,borderBottom:`1px solid ${C.lgold}`}}><td style={{padding:"7px 10px",position:"sticky",left:0,background:i%2===0?C.warm:C.sub,zIndex:1,borderRight:`2px solid ${C.lgold}`,lineHeight:1.4}}><span style={{color:C.wine,fontWeight:"bold"}}>{i+1}.</span> {shortQ[i]||q.t}</td><td style={{padding:"6px",textAlign:"center"}}><Bg v={aa}/></td><td style={{padding:"6px",textAlign:"center"}}><Bg v={bb}/></td><td style={{padding:"6px",textAlign:"center",fontSize:12}}>{same?<span style={{color:C.grn}}>{"\u2713"}</span>:diff?<span style={{color:C.red}}>{"\u26A0"}</span>:""}</td></tr>);})}</tbody>
          </table></div>
        </div>
      </div>
    );
  }
  return(
    <div style={{maxWidth:760,margin:"0 auto",padding:"36px 20px 80px"}}>
      <div style={{textAlign:"center",marginBottom:24}}><p style={{color:C.gold,fontSize:22,letterSpacing:4}}>{"\u2720 \u2721 \u2720"}</p><h2 style={{color:C.wine,fontSize:22,fontWeight:"normal",margin:"10px 0 4px",letterSpacing:2}}>COMMUNITY BOARD</h2><p style={{color:C.gold,fontStyle:"italic",fontSize:12}}>See everyone{"\u2019"}s results {"\u2022"} Select two to compare</p></div>
      <div style={{background:C.warm,border:`2px solid ${C.bgold}`,borderRadius:4,padding:"14px 18px",marginBottom:24,textAlign:"center"}}>
        <p style={{color:C.wine,fontSize:12,letterSpacing:1,marginBottom:10}}>SELECT TWO PEOPLE TO COMPARE</p>
        <div style={{display:"flex",gap:10,justifyContent:"center",alignItems:"center",flexWrap:"wrap"}}>
          <select value={selA??""} onChange={e=>setSelA(e.target.value===""?null:parseInt(e.target.value))} style={slS}><option value="">Person 1...</option>{resp.map((r,i)=><option key={i} value={i}>{r.name}</option>)}</select>
          <span style={{color:C.gold,fontSize:14,fontStyle:"italic"}}>vs</span>
          <select value={selB??""} onChange={e=>setSelB(e.target.value===""?null:parseInt(e.target.value))} style={slS}><option value="">Person 2...</option>{resp.map((r,i)=><option key={i} value={i}>{r.name}</option>)}</select>
          <button onClick={startCompare} style={{...sB(true),padding:"8px 20px"}}>Compare</button>
        </div>
      </div>
      {resp.map((r,i)=>{const top=getDenom(r.ans),t1=top[0],t2=top[1];const selected=selA===i||selB===i;return(
        <div key={i} onClick={()=>{if(selA===null)setSelA(i);else if(selB===null&&selA!==i)setSelB(i);else if(selA===i)setSelA(null);else if(selB===i)setSelB(null);}}
          style={{border:`2px solid ${selected?C.gold:C.bgold}`,borderRadius:4,marginBottom:12,padding:"14px 18px",background:selected?`${C.lgold}22`:C.warm,cursor:"pointer",borderLeft:`5px solid ${selected?C.gold:C.lgold}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
            <div><div style={{fontSize:16,fontWeight:"bold",color:C.wine}}>{selected&&"\u2713 "}{r.name}</div><div style={{fontSize:10,color:C.gold,marginTop:2}}>{new Date(r.at).toLocaleDateString("en-US",{month:"short",day:"numeric"})} {"\u2022"} {Object.keys(r.ans).length}/{qs.length}</div></div>
            <div style={{display:"flex",gap:16,alignItems:"center"}}>
              <div style={{textAlign:"center"}}><div style={{fontSize:10,color:C.gold,letterSpacing:1}}>#1</div><div style={{fontSize:13,fontWeight:"bold",color:C.wine}}>{t1.short}</div><div style={{fontSize:18,fontWeight:"bold",color:t1.score>=70?C.grn:t1.score>=50?C.gold:C.red}}>{t1.score}%</div></div>
              <div style={{textAlign:"center",opacity:0.7}}><div style={{fontSize:10,color:C.gold,letterSpacing:1}}>#2</div><div style={{fontSize:11,color:C.wine}}>{t2.short}</div><div style={{fontSize:14,fontWeight:"bold",color:C.gold}}>{t2.score}%</div></div>
            </div>
          </div>
        </div>
      );})}
      <p style={{textAlign:"center",color:C.brown,fontSize:11,fontStyle:"italic",marginTop:16}}>Tap a card to select for comparison. Tap again to deselect.</p>
    </div>
  );
}

function DashPage({resp,qs,apw,onDel}){
  const[auth,setAuth]=useState(!apw);const[sel,setSel]=useState(null);
  if(!auth)return<PwGate apw={apw} onAuth={()=>setAuth(true)}/>;
  if(sel!==null){const r=resp[sel];if(!r){setSel(null);return null;}const res=getDenom(r.ans);return(
    <div style={{maxWidth:760,margin:"0 auto",padding:"30px 20px 80px"}}>
      <button onClick={()=>setSel(null)} style={{...sB(false),marginBottom:16}}>{"\u2190"} Back</button>
      <div style={{textAlign:"center",marginBottom:20}}><h2 style={{color:C.wine,fontSize:22,fontWeight:"normal",margin:"0 0 4px"}}>{r.name}</h2><p style={{color:C.gold,fontSize:11}}>Submitted {new Date(r.at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})} {"\u2014"} {Object.keys(r.ans).length}/{qs.length}</p></div>
      <div style={{border:`2px solid ${C.bgold}`,borderRadius:4,overflow:"hidden",marginBottom:24}}><div style={{background:C.wine,padding:"8px 14px",color:C.lgold,fontSize:11,letterSpacing:2,fontVariant:"small-caps"}}>Answers</div><div style={{padding:"10px 14px",background:C.sub,maxHeight:400,overflowY:"auto"}}>{qs.map((q,i)=>{const a=r.ans[i];if(!a)return null;return(<div key={i} style={{display:"flex",gap:6,padding:"4px 0",borderBottom:`1px dotted ${C.lgold}`,fontSize:11,lineHeight:1.5}}><span style={{flex:1}}><strong style={{color:C.wine}}>{i+1}.</strong> {q.t}</span><span style={{color:a==="Yes"?C.grn:a==="No"?C.red:C.gold,fontWeight:"bold",minWidth:90,textAlign:"right",flexShrink:0}}>{a}</span></div>);})}</div></div>
      <div style={{border:`2px solid ${C.bgold}`,borderRadius:4,overflow:"hidden"}}><div style={{background:C.wine,padding:"8px 14px",color:C.lgold,fontSize:11,letterSpacing:2,fontVariant:"small-caps"}}>Denomination Match</div><div style={{padding:"14px"}}>{res.map((d,i)=><DBar key={d.id} d={d} r={i+1}/>)}</div></div>
      <div style={{textAlign:"center",marginTop:20}}><button onClick={()=>{if(confirm(`Delete ${r.name}'s response?`)){onDel(sel);setSel(null);}}} style={{...sB(false),color:C.red,borderColor:C.red}}>Delete Response</button></div>
    </div>);}
  return(
    <div style={{maxWidth:760,margin:"0 auto",padding:"36px 20px 80px"}}>
      <div style={{textAlign:"center",marginBottom:24}}><p style={{color:C.gold,fontSize:22,letterSpacing:4}}>{"\u2720 \u2721 \u2720"}</p><h2 style={{color:C.wine,fontSize:22,fontWeight:"normal",margin:"10px 0 4px",letterSpacing:2}}>DASHBOARD</h2><p style={{color:C.gold,fontStyle:"italic",fontSize:11}}>{resp.length} testimonies</p></div>
      {!resp.length?<p style={{textAlign:"center",color:C.brown,fontStyle:"italic",fontSize:14,marginTop:40}}>No submissions yet.</p>:
        resp.map((r,i)=>{const top=getDenom(r.ans)[0];return(
          <div key={i} onClick={()=>setSel(i)} style={{border:`2px solid ${C.bgold}`,borderRadius:4,marginBottom:12,padding:"14px 18px",background:C.warm,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C.gold} onMouseLeave={e=>e.currentTarget.style.borderColor=C.bgold}>
            <div><div style={{fontSize:16,fontWeight:"bold",color:C.wine}}>{r.name}</div><div style={{fontSize:10,color:C.gold,marginTop:2}}>{new Date(r.at).toLocaleDateString("en-US",{month:"short",day:"numeric"})} {"\u2014"} {Object.keys(r.ans).length}/{qs.length}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:12,fontWeight:"bold",color:C.wine}}>{top.short}</div><div style={{fontSize:18,fontWeight:"bold",color:top.score>=70?C.grn:top.score>=50?C.gold:C.red}}>{top.score}%</div></div>
          </div>);})}
    </div>
  );
}

function AdminPage({qs,onSQ,apw,onSP,resp,onClear}){
  const[auth,setAuth]=useState(!apw);const[newPw,setNewPw]=useState(apw||"");const[eI,setEI]=useState(null);const[eT,setET]=useState("");const[eC,setEC]=useState(0);const[addM,setAddM]=useState(false);const[nT,setNT]=useState("");const[nC,setNC]=useState(0);
  if(!auth)return<PwGate apw={apw} onAuth={()=>setAuth(true)} onSet={p=>{onSP(p);setAuth(true);}}/>;
  const mv=(i,d)=>{const u=[...qs];const t=u[i];u[i]=u[i+d];u[i+d]=t;onSQ(u);};const del=i=>{if(confirm("Delete?")){const u=[...qs];u.splice(i,1);onSQ(u);}};const sav=()=>{if(!eT.trim())return;const u=[...qs];u[eI]={t:eT.trim(),c:eC};onSQ(u);setEI(null);};const add=()=>{if(!nT.trim())return;onSQ([...qs,{t:nT.trim(),c:nC}]);setNT("");setAddM(false);};
  return(
    <div style={{maxWidth:760,margin:"0 auto",padding:"36px 20px 80px"}}>
      <div style={{textAlign:"center",marginBottom:24}}><p style={{color:C.gold,fontSize:22,letterSpacing:4}}>{"\u2720 \u2721 \u2720"}</p><h2 style={{color:C.wine,fontSize:22,fontWeight:"normal",margin:"10px 0 4px",letterSpacing:2}}>ADMIN PANEL</h2></div>
      <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap",justifyContent:"center"}}>{[[qs.length,"Questions"],[resp.length,"Responses"]].map(([v,l])=><div key={l} style={{background:C.warm,border:`1px solid ${C.bgold}`,borderRadius:4,padding:"10px 20px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:"bold",color:C.wine}}>{v}</div><div style={{fontSize:9,color:C.gold,letterSpacing:1}}>{l}</div></div>)}</div>
      <div style={{background:C.warm,border:`1px solid ${C.lgold}`,borderRadius:4,padding:"12px 16px",marginBottom:20,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><span style={{color:C.wine,fontSize:11,letterSpacing:1}}>PASSWORD:</span><input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} style={iS({flex:1,minWidth:120,fontSize:11})}/><button onClick={()=>{if(newPw.length>=3){onSP(newPw);alert("Saved!");}}} style={sB(true)}>Save</button></div>
      <div style={{border:`2px solid ${C.bgold}`,borderRadius:4,overflow:"hidden",marginBottom:20}}>
        <div style={{background:C.wine,padding:"8px 14px",color:C.lgold,fontSize:11,letterSpacing:2,fontVariant:"small-caps",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span>Questions ({qs.length})</span><button onClick={()=>setAddM(!addM)} style={{background:C.gold,color:C.wine,border:"none",padding:"4px 12px",borderRadius:3,fontFamily:F,fontSize:10,cursor:"pointer",fontWeight:"bold"}}>+ Add</button></div>
        {addM&&<div style={{padding:"10px 14px",background:"#FFF8E1",borderBottom:`2px solid ${C.lgold}`}}><textarea value={nT} onChange={e=>setNT(e.target.value)} placeholder="New question..." rows={2} style={{...iS({}),width:"100%",resize:"vertical",marginBottom:6,fontSize:12}}/><div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}><select value={nC} onChange={e=>setNC(parseInt(e.target.value))} style={slS}>{catNames.map((n,i)=><option key={i} value={i}>{n}</option>)}</select><button onClick={add} style={sB(true)}>Add</button><button onClick={()=>setAddM(false)} style={sB(false)}>Cancel</button></div></div>}
        <div style={{maxHeight:450,overflowY:"auto"}}>{qs.map((q,i)=><div key={i} style={{padding:"8px 14px",borderBottom:`1px solid ${C.lgold}`,background:i%2===0?C.warm:C.sub,fontSize:11}}>
          {eI===i?<div><textarea value={eT} onChange={e=>setET(e.target.value)} rows={2} style={{...iS({}),width:"100%",resize:"vertical",marginBottom:4,fontSize:11}}/><div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}><select value={eC} onChange={e=>setEC(parseInt(e.target.value))} style={slS}>{catNames.map((n,ci)=><option key={ci} value={ci}>{n}</option>)}</select><button onClick={sav} style={sB(true)}>Save</button><button onClick={()=>setEI(null)} style={sB(false)}>Cancel</button></div></div>:
          <div style={{display:"flex",alignItems:"flex-start",gap:6}}><span style={{color:C.wine,fontWeight:"bold",minWidth:22}}>{i+1}.</span><span style={{flex:1,lineHeight:1.4}}>{q.t}<span style={{display:"inline-block",marginLeft:6,fontSize:8,color:C.gold,background:C.parch,padding:"1px 5px",borderRadius:2,border:`1px solid ${C.lgold}`}}>{catNames[q.c]?.split(". ")[1]||`Cat ${q.c}`}</span></span><div style={{display:"flex",gap:3,flexShrink:0}}>{i>0&&<button onClick={()=>mv(i,-1)} style={ib}>{"\u25B2"}</button>}{i<qs.length-1&&<button onClick={()=>mv(i,1)} style={ib}>{"\u25BC"}</button>}<button onClick={()=>{setEI(i);setET(q.t);setEC(q.c);}} style={ib}>{"\u270E"}</button><button onClick={()=>del(i)} style={{...ib,color:C.red}}>{"\u2717"}</button></div></div>}
        </div>)}</div>
      </div>
      <div style={{border:`1px solid #E0A0A0`,borderRadius:4,padding:"12px 16px",background:"#FFF5F5"}}><p style={{color:C.red,fontSize:11,fontWeight:"bold",marginBottom:8,letterSpacing:1}}>DANGER ZONE</p><button onClick={()=>{if(confirm("Delete ALL responses?"))onClear();}} style={{padding:"5px 14px",background:C.red,color:"#fff",border:"none",borderRadius:3,fontFamily:F,fontSize:10,cursor:"pointer"}}>Delete All Responses</button><button onClick={()=>{if(confirm("Reset questions?"))onSQ(defaultQs);}} style={{padding:"5px 14px",background:"transparent",color:C.red,border:`1px solid ${C.red}`,borderRadius:3,fontFamily:F,fontSize:10,cursor:"pointer",marginLeft:8}}>Reset Questions</button></div>
    </div>
  );
}

function PwGate({apw,onAuth,onSet}){const[pw,setPw]=useState("");const[np,setNp]=useState("");
  if(!apw&&onSet)return(<div style={{maxWidth:380,margin:"0 auto",padding:"80px 24px",textAlign:"center"}}><p style={{color:C.gold,fontSize:22}}>{"\u2720"}</p><h2 style={{color:C.wine,fontSize:20,fontWeight:"normal",margin:"14px 0"}}>Set Admin Password</h2><input type="password" value={np} onChange={e=>setNp(e.target.value)} placeholder="Create password..." style={iS({textAlign:"center",maxWidth:260,margin:"0 auto 12px"})}/><br/><button onClick={()=>{if(np.length>=3)onSet(np);else alert("Min 3 chars.");}} style={sB(true)}>Set & Enter</button></div>);
  return(<div style={{maxWidth:380,margin:"0 auto",padding:"80px 24px",textAlign:"center"}}><p style={{color:C.gold,fontSize:22}}>{"\u2720"}</p><h2 style={{color:C.wine,fontSize:20,fontWeight:"normal",margin:"14px 0"}}>Enter Password</h2><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Password..." style={iS({textAlign:"center",maxWidth:260,margin:"0 auto 12px"})} onKeyDown={e=>e.key==="Enter"&&(pw===apw?onAuth():alert("Wrong."))}/><br/><button onClick={()=>pw===apw?onAuth():alert("Wrong password.")} style={sB(true)}>Enter</button></div>);
}

function DBar({d,r}){const c=d.score>=70?C.grn:d.score>=50?C.gold:d.score>=30?"#B8860B":C.red;return(<div style={{marginBottom:10,padding:"10px 14px",background:C.warm,border:`1px solid ${C.lgold}`,borderRadius:4,borderLeft:`4px solid ${r<=3?C.gold:C.lgold}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}><div><span style={{color:C.wine,fontWeight:"bold",fontSize:13}}>#{r} </span><span style={{color:C.wine,fontSize:13,fontWeight:"bold"}}>{d.name}</span></div><span style={{fontSize:18,fontWeight:"bold",color:c}}>{d.score}%</span></div><div style={{background:C.parch,borderRadius:6,height:6,overflow:"hidden",marginBottom:4}}><div style={{width:`${d.score}%`,height:"100%",background:`linear-gradient(90deg,${c},${C.gold})`,borderRadius:6,transition:"width 0.6s"}}/></div><p style={{color:C.brown,fontSize:10,fontStyle:"italic",margin:0,lineHeight:1.4}}>{d.desc}</p></div>);}
function Bg({v}){if(!v)return<span style={{color:"#bbb",fontSize:10}}>{"\u2014"}</span>;const s=v==="Yes"?{bg:"#E8F5E9",c:C.grn,t:"\u2713 Yes",bd:"#A5D6A7"}:v==="No"?{bg:"#FDECEC",c:C.red,t:"\u2717 No",bd:"#E0A0A0"}:{bg:"#FFF8E1",c:C.gold,t:"\u25CB Partial",bd:C.lgold};return<span style={{display:"inline-block",padding:"2px 9px",borderRadius:3,background:s.bg,color:s.c,border:`1px solid ${s.bd}`,fontSize:10,fontWeight:"bold"}}>{s.t}</span>;}
function SB({n,l,bg,bd,c,s=""}){return<div style={{background:bg,border:`1px solid ${bd}`,borderRadius:4,padding:"8px 18px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:"bold",color:c}}>{n}{s}</div><div style={{fontSize:9,color:c,letterSpacing:1}}>{l}</div></div>;}
function Dv(){return<div style={{width:200,height:1,background:`linear-gradient(90deg,transparent,${C.gold},transparent)`,margin:"14px auto"}}/>;}
function iS(x={}){return{width:"100%",padding:"7px 10px",border:`1px solid ${C.lgold}`,borderRadius:3,fontFamily:F,fontSize:12,color:C.brown,background:C.parch,outline:"none",boxSizing:"border-box",...x};}
function aB(s){return{padding:"5px 13px",border:`1.5px solid ${s?C.gold:C.lgold}`,borderRadius:3,background:s?`linear-gradient(135deg,${C.wine},#7A2526)`:C.parch,color:s?C.lgold:C.brown,fontFamily:F,fontSize:11,cursor:"pointer",fontWeight:s?"bold":"normal"};}
const subBtn={padding:"12px 36px",background:`linear-gradient(135deg,${C.wine},#7A2526)`,color:C.lgold,border:`2px solid ${C.gold}`,borderRadius:4,fontFamily:F,fontSize:15,letterSpacing:2,cursor:"pointer",fontVariant:"small-caps"};
function sB(p){return{padding:"5px 14px",borderRadius:3,fontFamily:F,fontSize:10,cursor:"pointer",letterSpacing:.5,background:p?C.gold:"transparent",color:p?C.wine:C.brown,border:`1px solid ${p?C.gold:C.lgold}`,fontWeight:p?"bold":"normal"};}
const slS={fontFamily:F,fontSize:11,padding:"6px 10px",border:`1px solid ${C.lgold}`,borderRadius:3,background:C.parch,color:C.brown};
const ib={background:"transparent",border:"none",cursor:"pointer",fontSize:12,color:C.gold,padding:"2px 4px",fontFamily:F};
