import { useState, useMemo, useEffect, useCallback } from "react";

const CATEGORIES  = ["Vêtements", "Sneakers", "Électronique", "Montres", "Mobilier", "Autre"];
const CAT_EMOJI   = { "Vêtements":"👕","Sneakers":"👟","Électronique":"📱","Montres":"⌚","Mobilier":"🪑","Autre":"📦" };
const CAT_COLORS  = ["#f97316","#a855f7","#3b82f6","#eab308","#22c55e","#6b7280"];
const MONTHS_FR   = ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"];
const MONTHS_FULL = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const formatEur   = (n) => new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR"}).format(n);
const today       = new Date();
const todayStr    = today.toISOString().slice(0,10);
function genId()  { return Math.random().toString(36).slice(2); }

const THEMES = {
  noir:   { name:"Noir",   accent:"#ffffff", accentDim:"rgba(255,255,255,0.08)", bg:"#000000", surface:"#0f0f0f", border:"#2a2a2a", text:"#ffffff", muted:"#777" },
  orange: { name:"Orange", accent:"#f97316", accentDim:"rgba(249,115,22,0.13)",  bg:"#0a0a0a", surface:"#131313", border:"#222",    text:"#f0ede6", muted:"#666" },
  blue:   { name:"Bleu",   accent:"#3b82f6", accentDim:"rgba(59,130,246,0.13)",  bg:"#080c14", surface:"#0e1520", border:"#1a2540", text:"#e8f0ff", muted:"#4a6080" },
  green:  { name:"Vert",   accent:"#22c55e", accentDim:"rgba(34,197,94,0.13)",   bg:"#080f0a", surface:"#0d1a10", border:"#1a3020", text:"#e8ffe0", muted:"#3a6045" },
  purple: { name:"Violet", accent:"#a855f7", accentDim:"rgba(168,85,247,0.13)",  bg:"#0a080f", surface:"#120e1a", border:"#251840", text:"#f0e8ff", muted:"#5a4070" },
  red:    { name:"Rouge",  accent:"#ef4444", accentDim:"rgba(239,68,68,0.13)",   bg:"#0f0808", surface:"#1a0e0e", border:"#3a1818", text:"#ffe8e8", muted:"#6a3535" },
  gold:   { name:"Or",     accent:"#eab308", accentDim:"rgba(234,179,8,0.13)",   bg:"#0f0e08", surface:"#1a1800", border:"#3a3000", text:"#fff8e0", muted:"#6a5a20" },
};

const DEMO_SALES = [
  { id:genId(), name:"Nike Air Jordan 1", category:"Sneakers",     buyPrice:120, sellPrice:220, date:new Date(today.getFullYear(),today.getMonth(),3).toISOString().slice(0,10) },
  { id:genId(), name:"iPhone 13 Pro",     category:"Électronique", buyPrice:450, sellPrice:620, date:new Date(today.getFullYear(),today.getMonth(),7).toISOString().slice(0,10) },
  { id:genId(), name:"Veste Supreme",     category:"Vêtements",    buyPrice:80,  sellPrice:180, date:new Date(today.getFullYear(),today.getMonth(),12).toISOString().slice(0,10) },
  { id:genId(), name:"PS5",              category:"Électronique", buyPrice:400, sellPrice:550, date:new Date(today.getFullYear(),today.getMonth()-1,18).toISOString().slice(0,10) },
  { id:genId(), name:"MacBook Air M2",   category:"Électronique", buyPrice:900, sellPrice:1150,date:new Date(today.getFullYear(),today.getMonth()-2,25).toISOString().slice(0,10) },
  { id:genId(), name:"Hoodie Off-White", category:"Vêtements",    buyPrice:75,  sellPrice:190, date:new Date(today.getFullYear(),today.getMonth()-3,14).toISOString().slice(0,10) },
];

function CrosshairLogo({ color, size=32 }) {
  const cx=size/2, cy=size/2;
  const outerR=size*0.32, innerR=size*0.18, dotR=size*0.07, gap=size*0.08, lw=size*0.05;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <circle cx={cx} cy={cy} r={outerR} stroke={color} strokeWidth={lw} opacity="0.35"/>
      <circle cx={cx} cy={cy} r={innerR} stroke={color} strokeWidth={lw} opacity="0.65"/>
      <circle cx={cx} cy={cy} r={dotR} fill={color}/>
      <line x1={cx} y1={0}               x2={cx} y2={cy-innerR-gap}  stroke={color} strokeWidth={lw} strokeLinecap="round"/>
      <line x1={cx} y1={cy+innerR+gap}   x2={cx} y2={size}           stroke={color} strokeWidth={lw} strokeLinecap="round"/>
      <line x1={0}           y1={cy}     x2={cx-innerR-gap} y2={cy}  stroke={color} strokeWidth={lw} strokeLinecap="round"/>
      <line x1={cx+innerR+gap} y1={cy}   x2={size}          y2={cy}  stroke={color} strokeWidth={lw} strokeLinecap="round"/>
    </svg>
  );
}

export default function App() {
  const [sales,     setSales]     = useState(null);
  const [view,      setView]      = useState("dashboard");
  const [themeKey,  setThemeKey]  = useState("orange");
  const [showTheme, setShowTheme] = useState(false);
  const [saveOK,    setSaveOK]    = useState(false);
  const [deleteId,  setDeleteId]  = useState(null);
  const [editId,    setEditId]    = useState(null);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [goal,      setGoal]      = useState({ from: new Date(today.getFullYear(),today.getMonth(),1).toISOString().slice(0,10), to: todayStr, amount: 500 });
  const [showGoal,  setShowGoal]  = useState(false);
  const [goalDraft, setGoalDraft] = useState(null);
  const [form,      setForm]      = useState({ name:"", category:"Vêtements", buyPrice:"", sellPrice:"", date:todayStr });
  const [formError, setFormError] = useState("");
  const [aiMsg,     setAiMsg]     = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const T = THEMES[themeKey];

  // ── Storage ────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const s = localStorage.getItem("pt_sales_v4");
      const t = localStorage.getItem("pt_theme");
      const g = localStorage.getItem("pt_goal_v2");
      setSales(s ? JSON.parse(s) : DEMO_SALES);
      if (t) setThemeKey(t);
      if (g) setGoal(JSON.parse(g));
    } catch { setSales(DEMO_SALES); }
  }, []);

  useEffect(() => {
    if (!sales) return;
    try { localStorage.setItem("pt_sales_v4", JSON.stringify(sales)); setSaveOK(true); setTimeout(()=>setSaveOK(false),2000); } catch {}
  }, [sales]);

  useEffect(() => { try { localStorage.setItem("pt_theme", themeKey); } catch {} }, [themeKey]);
  useEffect(() => { try { localStorage.setItem("pt_goal_v2", JSON.stringify(goal)); } catch {} }, [goal]);

  // ── Derived data ───────────────────────────────────────────────────
  const monthSales = useMemo(() =>
    (sales||[]).filter(s => { const d=new Date(s.date); return d.getMonth()===viewMonth && d.getFullYear()===viewYear; }),
    [sales, viewMonth, viewYear]
  );

  const goalSales = useMemo(() => {
    const mStart = new Date(viewYear, viewMonth, 1).toISOString().slice(0,10);
    const mEnd   = new Date(viewYear, viewMonth+1, 0).toISOString().slice(0,10);
    const from   = goal.from > mStart ? goal.from : mStart;
    const to     = goal.to   < mEnd   ? goal.to   : mEnd;
    if (from > to) return [];
    return (sales||[]).filter(s => s.date >= from && s.date <= to);
  }, [sales, goal, viewMonth, viewYear]);

  const goalProfit = useMemo(() => goalSales.reduce((a,s)=>a+s.sellPrice-s.buyPrice,0), [goalSales]);
  const goalPct    = Math.min((goalProfit / goal.amount) * 100, 100);

  const stats = useMemo(() => {
    const revenue = monthSales.reduce((a,s)=>a+s.sellPrice,0);
    const cost    = monthSales.reduce((a,s)=>a+s.buyPrice,0);
    const profit  = revenue - cost;
    const margin  = revenue>0 ? (profit/revenue)*100 : 0;
    const best    = monthSales.reduce((b,s)=> (s.sellPrice-s.buyPrice) > (b ? b.sellPrice-b.buyPrice : -Infinity) ? s : b, null);
    return { revenue, cost, profit, margin, count:monthSales.length, avgProfit:monthSales.length>0?profit/monthSales.length:0, best };
  }, [monthSales]);

  const chartData = useMemo(() => Array.from({length:6},(_,i) => {
    const d=new Date(viewYear,viewMonth-(5-i),1); const m=d.getMonth(), y=d.getFullYear();
    const ms=(sales||[]).filter(s=>{ const sd=new Date(s.date); return sd.getMonth()===m&&sd.getFullYear()===y; });
    return { label:MONTHS_FR[m], profit:ms.reduce((a,s)=>a+s.sellPrice-s.buyPrice,0) };
  }), [sales, viewMonth, viewYear]);
  const maxProfit = Math.max(...chartData.map(d=>d.profit), 1);

  const catAnalysis = useMemo(() => {
    const map={};
    (sales||[]).forEach(s => {
      const p=s.sellPrice-s.buyPrice;
      if (!map[s.category]) map[s.category]={profit:0,count:0};
      map[s.category].profit+=p; map[s.category].count+=1;
    });
    return Object.entries(map).sort((a,b)=>b[1].profit-a[1].profit);
  }, [sales]);

  // ── Handlers ───────────────────────────────────────────────────────
  const handleAddSale = () => {
    if (!form.name.trim())               return setFormError("Donne un nom.");
    if (!form.buyPrice||!form.sellPrice) return setFormError("Remplis les prix.");
    const buy=parseFloat(form.buyPrice), sell=parseFloat(form.sellPrice);
    if (isNaN(buy)||isNaN(sell)||buy<0||sell<0) return setFormError("Prix invalides.");
    const entry = { id:editId||genId(), name:form.name, category:form.category, buyPrice:buy, sellPrice:sell, date:form.date };
    setSales(prev => editId ? prev.map(s=>s.id===editId?entry:s) : [entry,...prev]);
    setForm({ name:"", category:"Vêtements", buyPrice:"", sellPrice:"", date:todayStr });
    setFormError(""); setEditId(null); setView("dashboard");
  };

  const handleEditSale = (s) => {
    setForm({ name:s.name, category:s.category, buyPrice:String(s.buyPrice), sellPrice:String(s.sellPrice), date:s.date });
    setEditId(s.id); setView("add");
  };

  const prevMonth = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
  const nextMonth = () => { const isCur=viewMonth===today.getMonth()&&viewYear===today.getFullYear(); if(isCur)return; if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };
  const isCurrentMonth = viewMonth===today.getMonth() && viewYear===today.getFullYear();
  const periodLabel = `${MONTHS_FULL[viewMonth]}${viewYear!==today.getFullYear()?" "+viewYear:""}`;

  const handleAnalysis = useCallback(async () => {
    setAiLoading(true); setAiMsg("");
    const best = catAnalysis[0];
    const statsStr = `Mois: ${periodLabel}. Ventes: ${stats.count}. Bénéfice: ${stats.profit.toFixed(2)}€. Marge: ${stats.margin.toFixed(1)}%. Top catégorie: ${best?best[0]+" ("+formatEur(best[1].profit)+")":"aucune"}. Objectif: ${formatEur(goal.amount)} du ${goal.from} au ${goal.to} (${goalPct.toFixed(0)}% atteint).`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:300,
          messages:[{role:"user",content:`Tu es un coach business pour un revendeur achat-revente sur Vinted. Voici ses stats: ${statsStr}. Fais une analyse en 3-4 phrases: 1 point fort, 1 conseil concret, 1 encouragement. Direct et motivant. Pas de markdown ni de titres.`}]
        })
      });
      const data = await res.json();
      setAiMsg(data.content?.[0]?.text || "Continue comme ça !");
    } catch { setAiMsg("Impossible de charger l'analyse. Vérifie ta connexion."); }
    setAiLoading(false);
  }, [stats, periodLabel, catAnalysis, goal, goalPct]);

  // ── CSS ───────────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Bebas+Neue&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html,body{overflow-x:hidden;max-width:100vw;}
    ::-webkit-scrollbar{width:3px;} ::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px;}
    .card{background:${T.surface};border:1px solid ${T.border};border-radius:16px;padding:18px;}
    .card-glow{background:${T.surface};border:1px solid ${T.border};border-radius:16px;padding:18px;box-shadow:0 0 28px ${T.accentDim};}
    .btn-primary{background:${T.accent};color:${themeKey==="noir"?"#000":"#000"};border:none;border-radius:12px;padding:15px 20px;font-family:inherit;font-size:16px;font-weight:700;cursor:pointer;width:100%;transition:opacity .2s;}
    .btn-primary:active{opacity:.8;}
    .btn-ghost{background:transparent;color:${T.muted};border:1px solid ${T.border};border-radius:10px;padding:10px 16px;font-family:inherit;font-size:14px;cursor:pointer;transition:all .2s;}
    .btn-ghost:hover{border-color:${T.accent}55;color:${T.text};}
    .input{background:${T.bg};border:1.5px solid ${T.border};border-radius:12px;padding:14px;color:${T.text};font-family:inherit;font-size:16px;width:100%;outline:none;transition:border .2s;-webkit-appearance:none;}
    .input:focus{border-color:${T.accent};box-shadow:0 0 0 3px ${T.accentDim};}
    .select{background:${T.bg};border:1.5px solid ${T.border};border-radius:12px;padding:14px;color:${T.text};font-family:inherit;font-size:16px;width:100%;outline:none;cursor:pointer;-webkit-appearance:none;}
    .select:focus{border-color:${T.accent};}
    .nav-btn{background:transparent;border:none;color:${T.muted};font-family:inherit;font-size:11px;cursor:pointer;padding:6px 8px;border-radius:10px;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;}
    .nav-btn .ico{font-size:20px;line-height:1;}
    .nav-btn.active{color:${T.accent};background:${T.accentDim};}
    .row{border-bottom:1px solid ${T.border};padding:14px 0;display:flex;align-items:center;gap:12px;}
    .row:last-child{border-bottom:none;}
    .icon-btn{background:none;border:none;cursor:pointer;padding:6px;border-radius:6px;transition:color .2s;flex-shrink:0;font-size:16px;}
    .del-btn{color:${T.border};} .del-btn:hover{color:#f87171;}
    .edit-btn-s{color:${T.muted};} .edit-btn-s:hover{color:${T.accent};}
    .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.88);display:flex;align-items:flex-end;justify-content:center;z-index:100;backdrop-filter:blur(6px);}
    .modal{background:${T.surface};border:1px solid ${T.border};border-radius:20px 20px 0 0;padding:28px 20px 52px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;}
    .theme-panel{position:fixed;top:64px;right:10px;background:${T.surface};border:1px solid ${T.border};border-radius:16px;padding:14px;z-index:200;box-shadow:0 20px 60px rgba(0,0,0,.8);min-width:160px;}
    .ai-box{background:linear-gradient(135deg,${T.surface},${T.accentDim});border:1px solid ${T.accent}44;border-radius:16px;padding:18px;}
    .lbl{font-size:12px;color:${T.muted};margin-bottom:8px;text-transform:uppercase;letter-spacing:.8px;font-weight:600;}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.12)}}
    .anim{animation:fadeIn .3s ease;}
    .pulse{animation:pulse 3s ease-in-out infinite;}
  `;

  if (!sales) return (
    <div style={{fontFamily:"Inter,sans-serif",background:"#000",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"#555",gap:16}}>
      <CrosshairLogo color="#f97316" size={52}/>
      <div style={{fontSize:13,letterSpacing:2}}>CHARGEMENT...</div>
    </div>
  );

  const formProfit = parseFloat(form.sellPrice||0) - parseFloat(form.buyPrice||0);

  return (
    <div style={{fontFamily:"Inter,sans-serif",background:T.bg,minHeight:"100vh",color:T.text,overflowX:"hidden"}}>
      <style>{css}</style>

      {/* ── Header ── */}
      <div style={{background:T.bg+"f0",borderBottom:`1px solid ${T.border}`,padding:"0 14px",position:"sticky",top:0,zIndex:50,backdropFilter:"blur(14px)"}}>
        <div style={{maxWidth:600,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:58}}>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div className="pulse"><CrosshairLogo color={T.accent} size={30}/></div>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:19,letterSpacing:3,whiteSpace:"nowrap"}}>
              PROFIT<span style={{color:T.accent}}>TRACKER</span>
            </span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            {saveOK && <span style={{fontSize:13}}>✅</span>}
            <button className="nav-btn" style={{flex:"none"}} onClick={()=>setShowTheme(s=>!s)}>
              <span className="ico">🎨</span><span>Thème</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Theme panel ── */}
      {showTheme && (<>
        <div style={{position:"fixed",inset:0,zIndex:190}} onClick={()=>setShowTheme(false)}/>
        <div className="theme-panel anim">
          <div className="lbl" style={{marginBottom:12}}>Couleur</div>
          {Object.entries(THEMES).map(([key,theme]) => (
            <button key={key} onClick={()=>{setThemeKey(key);setShowTheme(false);}}
              style={{display:"flex",alignItems:"center",gap:10,background:themeKey===key?theme.accentDim:"transparent",border:`1px solid ${themeKey===key?theme.accent:T.border}`,borderRadius:10,padding:"8px 12px",cursor:"pointer",color:T.text,fontFamily:"inherit",fontSize:14,width:"100%",marginBottom:6,transition:"all .15s"}}>
              <div style={{width:11,height:11,borderRadius:"50%",background:theme.accent,flexShrink:0}}/>
              {theme.name}
              {themeKey===key && <span style={{marginLeft:"auto",color:theme.accent,fontSize:12}}>✓</span>}
            </button>
          ))}
        </div>
      </>)}

      <div style={{maxWidth:600,margin:"0 auto",padding:"16px 14px 100px"}}>

        {/* ══ DASHBOARD ══ */}
        {view==="dashboard" && (
          <div className="anim">

            {/* Month nav */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <button onClick={prevMonth} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,width:42,height:42,cursor:"pointer",color:T.text,fontSize:22,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
              <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:30,letterSpacing:2}}>{periodLabel}</h1>
              <button onClick={nextMonth} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,width:42,height:42,cursor:"pointer",fontSize:22,display:"flex",alignItems:"center",justifyContent:"center",color:isCurrentMonth?T.border:T.text,opacity:isCurrentMonth?.35:1}}>›</button>
            </div>

            {/* Objectif */}
            <div className="card" style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <span className="lbl" style={{margin:0}}>🎯 Objectif</span>
                <button onClick={()=>{setGoalDraft({...goal});setShowGoal(true);}} style={{background:"none",border:"none",color:T.accent,fontSize:13,cursor:"pointer",fontFamily:"inherit",fontWeight:600}}>Modifier</button>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:10}}>
                <div>
                  <div style={{fontSize:26,fontWeight:700,color:goalProfit>=goal.amount?"#4ade80":T.accent}}>{formatEur(goalProfit)}</div>
                  <div style={{fontSize:11,color:T.muted,marginTop:3}}>{goal.from} → {goal.to}</div>
                </div>
                <span style={{fontSize:16,color:T.muted}}>/ {formatEur(goal.amount)}</span>
              </div>
              <div style={{background:T.border,borderRadius:100,height:10}}>
                <div style={{background:goalPct>=100?"#4ade80":T.accent,borderRadius:100,height:"100%",width:`${goalPct}%`,transition:"width .8s cubic-bezier(.34,1.56,.64,1)",boxShadow:`0 0 12px ${goalPct>=100?"#4ade8066":T.accent+"66"}`}}/>
              </div>
              <div style={{fontSize:13,color:T.muted,marginTop:8,textAlign:"right",fontWeight:600}}>{goalPct.toFixed(0)}% atteint</div>
            </div>

            {/* KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
              {[
                {label:"Bénéfice net",   value:formatEur(stats.profit),  sub:`${stats.count} vente${stats.count>1?"s":""}`, color:stats.profit>=0?"#4ade80":"#f87171"},
                {label:"Chiffre d'aff.", value:formatEur(stats.revenue), sub:"Total vendu"},
                {label:"Nb de ventes",   value:String(stats.count),      sub:"ce mois", color:T.accent},
                {label:"Marge moyenne",  value:`${stats.margin.toFixed(1)}%`, sub:`Moy. ${formatEur(stats.avgProfit)}/vente`},
              ].map((k,i) => (
                <div key={i} className="card-glow">
                  <div className="lbl" style={{marginBottom:10}}>{k.label}</div>
                  <div style={{fontSize:26,fontFamily:"'Bebas Neue',sans-serif",color:k.color||T.accent,lineHeight:1}}>{k.value}</div>
                  <div style={{fontSize:12,color:T.muted,marginTop:8}}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="card" style={{marginBottom:14}}>
              <div className="lbl" style={{marginBottom:18}}>Bénéfices — 6 mois</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:6,height:110}}>
                {chartData.map((d,i) => {
                  const h = maxProfit>0 ? Math.max((d.profit/maxProfit)*100,2) : 2;
                  const isCur = i===5;
                  return (
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5,height:"100%"}}>
                      <div style={{flex:1,display:"flex",alignItems:"flex-end",width:"100%"}}>
                        <div title={formatEur(d.profit)} style={{width:"100%",borderRadius:"4px 4px 0 0",background:isCur?T.accent:T.border,height:`${h}%`,transition:"height .6s",boxShadow:isCur?`0 0 10px ${T.accent}66`:""}}/>
                      </div>
                      <div style={{fontSize:10,color:isCur?T.accent:T.muted,fontWeight:isCur?700:400}}>{d.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Meilleure vente du mois */}
            {stats.best && (
              <div className="card" style={{background:`linear-gradient(135deg,${T.surface},${T.accentDim})`,borderColor:T.accent+"33"}}>
                <div className="lbl" style={{marginBottom:12}}>🏆 Meilleure vente du mois</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:18,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{stats.best.name}</div>
                    <div style={{fontSize:12,color:T.muted,marginTop:4}}>{stats.best.category} · {stats.best.date}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:26,fontFamily:"'Bebas Neue',sans-serif",color:"#4ade80"}}>+{formatEur(stats.best.sellPrice-stats.best.buyPrice)}</div>
                    <div style={{fontSize:11,color:T.muted}}>{formatEur(stats.best.buyPrice)} → {formatEur(stats.best.sellPrice)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ ADD / EDIT ══ */}
        {view==="add" && (
          <div className="anim">
            <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,marginBottom:20}}>{editId?"✏️ Modifier":"➕ Nouvelle vente"}</h1>
            <div className="card" style={{display:"flex",flexDirection:"column",gap:16}}>
              <div>
                <div className="lbl">Nom de l'article</div>
                <input className="input" placeholder="ex: Veste Supreme Noir M" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
              </div>
              <div>
                <div className="lbl">Catégorie</div>
                <select className="select" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <div className="lbl">Prix achat (€)</div>
                  <input className="input" type="number" min="0" placeholder="0.00" value={form.buyPrice} onChange={e=>setForm(f=>({...f,buyPrice:e.target.value}))}/>
                </div>
                <div>
                  <div className="lbl">Prix vente (€)</div>
                  <input className="input" type="number" min="0" placeholder="0.00" value={form.sellPrice} onChange={e=>setForm(f=>({...f,sellPrice:e.target.value}))}/>
                </div>
              </div>
              {form.buyPrice && form.sellPrice && !isNaN(form.buyPrice) && !isNaN(form.sellPrice) && (
                <div style={{background:T.accentDim,border:`1px solid ${T.accent}44`,borderRadius:12,padding:"13px 14px",fontSize:15}}>
                  Bénéfice : <span style={{color:formProfit>=0?"#4ade80":"#f87171",fontWeight:700}}>
                    {formProfit>=0?"+":""}{formatEur(formProfit)}
                  </span>
                </div>
              )}
              <div>
                <div className="lbl">Date de vente</div>
                <input className="input" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
              </div>
              {formError && <div style={{background:"#1a0a0a",border:"1px solid #3a1818",borderRadius:12,padding:"12px 14px",fontSize:14,color:"#f87171"}}>{formError}</div>}
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <button className="btn-ghost" style={{flex:1}} onClick={()=>{setView("dashboard");setEditId(null);}}>Annuler</button>
                <button className="btn-primary" style={{flex:2,width:"auto"}} onClick={handleAddSale}>✓ {editId?"Modifier":"Enregistrer"}</button>
              </div>
            </div>
          </div>
        )}

        {/* ══ HISTORIQUE ══ */}
        {view==="history" && (
          <div className="anim">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2}}>Ventes</h1>
              <span style={{fontSize:13,color:T.muted,fontWeight:600}}>{(sales||[]).length} au total</span>
            </div>
            <div className="card" style={{padding:(sales||[]).length>0?"4px 14px":"18px"}}>
              {(sales||[]).length===0 && <div style={{color:T.muted,fontSize:14,textAlign:"center",padding:"30px 0"}}>Aucune vente.</div>}
              {[...(sales||[])].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(s => {
                const p=s.sellPrice-s.buyPrice;
                const col=CAT_COLORS[CATEGORIES.indexOf(s.category)%CAT_COLORS.length];
                return (
                  <div key={s.id} className="row">
                    <div style={{width:44,height:44,borderRadius:12,background:col+"22",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21}}>{CAT_EMOJI[s.category]||"📦"}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:15,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                      <div style={{fontSize:12,color:T.muted,marginTop:3}}>{s.category} · {s.date}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:16,color:p>=0?"#4ade80":"#f87171",fontWeight:700}}>{p>=0?"+":""}{formatEur(p)}</div>
                      <div style={{fontSize:11,color:T.muted}}>{formatEur(s.buyPrice)} → {formatEur(s.sellPrice)}</div>
                    </div>
                    <button className="icon-btn edit-btn-s" onClick={()=>handleEditSale(s)}>✏️</button>
                    <button className="icon-btn del-btn" onClick={()=>setDeleteId(s.id)}>✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ ANALYSE ══ */}
        {view==="analyse" && (
          <div className="anim">
            <h1 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2,marginBottom:20}}>📈 Analyse</h1>

            {/* IA */}
            <div className="ai-box" style={{marginBottom:16}}>
              <div className="lbl" style={{marginBottom:12}}>🤖 Coach IA — {periodLabel}</div>
              {aiMsg
                ? <div style={{fontSize:15,lineHeight:1.75,marginBottom:14}}>{aiMsg}</div>
                : <div style={{fontSize:14,color:T.muted,lineHeight:1.7,marginBottom:14}}>Lance l'analyse pour recevoir des conseils personnalisés basés sur tes vraies stats.</div>
              }
              <button onClick={handleAnalysis} disabled={aiLoading}
                style={{background:T.accent,border:"none",borderRadius:12,padding:"13px 20px",color:"#000",fontFamily:"inherit",fontSize:15,fontWeight:700,cursor:"pointer",width:"100%",opacity:aiLoading?.7:1}}>
                {aiLoading ? "⏳ Analyse en cours..." : "🔍 Analyser mon mois"}
              </button>
            </div>

            {/* Top 3 produits */}
            {(()=>{
              const top3 = [...(sales||[])].sort((a,b)=>(b.sellPrice-b.buyPrice)-(a.sellPrice-a.buyPrice)).slice(0,3);
              if (top3.length===0) return null;
              const medals = ["🥇","🥈","🥉"];
              return (
                <div className="card" style={{marginBottom:14}}>
                  <div className="lbl" style={{marginBottom:16}}>🏆 Produits les plus rentables</div>
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    {top3.map((s,i) => {
                      const p=s.sellPrice-s.buyPrice;
                      const col=CAT_COLORS[CATEGORIES.indexOf(s.category)%CAT_COLORS.length];
                      return (
                        <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,paddingBottom:i<2?14:0,borderBottom:i<2?`1px solid ${T.border}`:"none"}}>
                          <span style={{fontSize:22,flexShrink:0}}>{medals[i]}</span>
                          <div style={{width:38,height:38,borderRadius:10,background:col+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>{CAT_EMOJI[s.category]||"📦"}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:14,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                            <div style={{fontSize:11,color:T.muted,marginTop:2}}>{s.category} · {s.date}</div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            <div style={{fontSize:16,color:"#4ade80",fontWeight:700}}>+{formatEur(p)}</div>
                            <div style={{fontSize:10,color:T.muted}}>{formatEur(s.buyPrice)} → {formatEur(s.sellPrice)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {(sales||[]).length===0 && <div className="card" style={{color:T.muted,textAlign:"center",padding:"40px 0",fontSize:14}}>Ajoute des ventes pour voir l'analyse.</div>}
          </div>
        )}

      </div>

      {/* ── Bottom nav ── */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,background:T.bg+"f5",borderTop:`1px solid ${T.border}`,backdropFilter:"blur(14px)"}}>
        <div style={{maxWidth:600,margin:"0 auto",display:"flex",padding:"6px 8px 10px"}}>
          {[["dashboard","📊","Stats"],["history","📋","Ventes"],["add","➕","Ajouter"],["analyse","📈","Analyse"]].map(([v,icon,label]) => (
            <button key={v} className={`nav-btn${view===v?" active":""}`}
              onClick={()=>{setView(v);setShowTheme(false);if(v==="add"&&!editId){setForm({name:"",category:"Vêtements",buyPrice:"",sellPrice:"",date:todayStr});}}}>
              <span className="ico">{icon}</span><span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Goal modal ── */}
      {showGoal && goalDraft && (
        <div className="modal-overlay" onClick={()=>setShowGoal(false)}>
          <div className="modal anim" onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:22,fontWeight:700,marginBottom:20}}>🎯 Modifier l'objectif</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <div className="lbl">Montant (€)</div>
                <input className="input" type="number" min="0" value={goalDraft.amount}
                  onChange={e=>setGoalDraft(d=>({...d,amount:parseFloat(e.target.value)||0}))}
                  style={{fontSize:20,textAlign:"center"}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <div className="lbl">Du</div>
                  <input className="input" type="date" value={goalDraft.from} onChange={e=>setGoalDraft(d=>({...d,from:e.target.value}))}/>
                </div>
                <div>
                  <div className="lbl">Au</div>
                  <input className="input" type="date" value={goalDraft.to} onChange={e=>setGoalDraft(d=>({...d,to:e.target.value}))}/>
                </div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:8}}>
                <button className="btn-ghost" style={{flex:1}} onClick={()=>setShowGoal(false)}>Annuler</button>
                <button className="btn-primary" style={{flex:2,width:"auto"}} onClick={()=>{setGoal(goalDraft);setShowGoal(false);}}>Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete modal ── */}
      {deleteId && (
        <div className="modal-overlay" onClick={()=>setDeleteId(null)}>
          <div className="modal anim" onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:22,fontWeight:700,marginBottom:8,textAlign:"center"}}>Supprimer ?</div>
            <div style={{fontSize:14,color:T.muted,marginBottom:24,textAlign:"center"}}>Cette action est irréversible.</div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn-ghost" style={{flex:1}} onClick={()=>setDeleteId(null)}>Annuler</button>
              <button className="btn-primary" style={{flex:1,width:"auto",background:"#ef4444"}}
                onClick={()=>{setSales(p=>p.filter(s=>s.id!==deleteId));setDeleteId(null);}}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
