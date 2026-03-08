import { useState, useMemo, useEffect } from "react";

const CATEGORIES = ["Vêtements", "Électronique", "Sneakers", "Montres", "Mobilier", "Autre"];
const formatEur = (n) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
const today = new Date();
const MONTHS_FR = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
const MONTHS_FULL = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
function genId() { return Math.random().toString(36).slice(2); }

const THEMES = {
  orange: { name: "🔥 Feu",    accent: "#f97316", accentHover: "#fb923c", accentDim: "rgba(249,115,22,0.12)",  bg: "#0a0a0a", surface: "#111",    border: "#1e1e1e", text: "#f0ede6", muted: "#555" },
  blue:   { name: "🌊 Océan",  accent: "#3b82f6", accentHover: "#60a5fa", accentDim: "rgba(59,130,246,0.12)",  bg: "#080c14", surface: "#0e1520", border: "#1a2540", text: "#e8f0ff", muted: "#4a6080" },
  green:  { name: "🌿 Matrix", accent: "#22c55e", accentHover: "#4ade80", accentDim: "rgba(34,197,94,0.12)",   bg: "#080f0a", surface: "#0d1a10", border: "#1a3020", text: "#e8ffe0", muted: "#3a6045" },
  purple: { name: "💜 Nuit",   accent: "#a855f7", accentHover: "#c084fc", accentDim: "rgba(168,85,247,0.12)",  bg: "#0a080f", surface: "#120e1a", border: "#251840", text: "#f0e8ff", muted: "#5a4070" },
  red:    { name: "🔴 Danger", accent: "#ef4444", accentHover: "#f87171", accentDim: "rgba(239,68,68,0.12)",   bg: "#0f0808", surface: "#1a0e0e", border: "#3a1818", text: "#ffe8e8", muted: "#6a3535" },
  gold:   { name: "✨ Or",     accent: "#eab308", accentHover: "#facc15", accentDim: "rgba(234,179,8,0.12)",   bg: "#0f0e08", surface: "#1a1800", border: "#3a3000", text: "#fff8e0", muted: "#6a5a20" },
};

const DEMO_DATA = [
  { id: genId(), name: "Nike Air Jordan 1",  category: "Sneakers",     buyPrice: 120, sellPrice: 220,  date: new Date(today.getFullYear(), today.getMonth(), 3).toISOString().slice(0,10) },
  { id: genId(), name: "iPhone 13 Pro",      category: "Électronique", buyPrice: 450, sellPrice: 620,  date: new Date(today.getFullYear(), today.getMonth(), 7).toISOString().slice(0,10) },
  { id: genId(), name: "Veste Supreme",      category: "Vêtements",    buyPrice: 80,  sellPrice: 180,  date: new Date(today.getFullYear(), today.getMonth(), 12).toISOString().slice(0,10) },
  { id: genId(), name: "Apple Watch S8",     category: "Montres",      buyPrice: 230, sellPrice: 310,  date: new Date(today.getFullYear(), today.getMonth()-1, 5).toISOString().slice(0,10) },
  { id: genId(), name: "PS5",                category: "Électronique", buyPrice: 400, sellPrice: 550,  date: new Date(today.getFullYear(), today.getMonth()-1, 18).toISOString().slice(0,10) },
  { id: genId(), name: "Adidas Yeezy 350",   category: "Sneakers",     buyPrice: 200, sellPrice: 380,  date: new Date(today.getFullYear(), today.getMonth()-1, 22).toISOString().slice(0,10) },
  { id: genId(), name: "Canapé vintage",     category: "Mobilier",     buyPrice: 60,  sellPrice: 160,  date: new Date(today.getFullYear(), today.getMonth()-2, 10).toISOString().slice(0,10) },
  { id: genId(), name: "MacBook Air M2",     category: "Électronique", buyPrice: 900, sellPrice: 1150, date: new Date(today.getFullYear(), today.getMonth()-2, 25).toISOString().slice(0,10) },
  { id: genId(), name: "Hoodie Off-White",   category: "Vêtements",    buyPrice: 75,  sellPrice: 190,  date: new Date(today.getFullYear(), today.getMonth()-3, 14).toISOString().slice(0,10) },
];

const CATEGORY_COLORS = ["#f97316","#3b82f6","#a855f7","#eab308","#22c55e","#6b7280"];

function CrosshairLogo({ color, size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="13" stroke={color} strokeWidth="1.5" opacity="0.3"/>
      <circle cx="16" cy="16" r="8"  stroke={color} strokeWidth="1.5" opacity="0.6"/>
      <circle cx="16" cy="16" r="3"  fill={color}/>
      <line x1="16" y1="1"  x2="16" y2="8"  stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="16" y1="24" x2="16" y2="31" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="1"  y1="16" x2="8"  y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="24" y1="16" x2="31" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export default function App() {
  const [sales,     setSales]     = useState(null);
  const [view,      setView]      = useState("dashboard");
  const [period,    setPeriod]    = useState("month");
  const [form,      setForm]      = useState({ name: "", category: "Sneakers", buyPrice: "", sellPrice: "", date: today.toISOString().slice(0,10) });
  const [formError, setFormError] = useState("");
  const [deleteId,  setDeleteId]  = useState(null);
  const [themeKey,  setThemeKey]  = useState("orange");
  const [showTheme, setShowTheme] = useState(false);
  const [saveStatus,setSaveStatus]= useState("");

  // ── Load from localStorage on mount ────────────────────────────────
  useEffect(() => {
    try {
      const s = localStorage.getItem("pt_sales");
      const t = localStorage.getItem("pt_theme");
      setSales(s ? JSON.parse(s) : DEMO_DATA);
      if (t) setThemeKey(t);
    } catch {
      setSales(DEMO_DATA);
    }
  }, []);

  // ── Auto-save sales whenever they change ───────────────────────────
  useEffect(() => {
    if (sales === null) return;
    try {
      localStorage.setItem("pt_sales", JSON.stringify(sales));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch { setSaveStatus(""); }
  }, [sales]);

  // ── Save theme ─────────────────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem("pt_theme", themeKey); } catch {}
  }, [themeKey]);

  const T = THEMES[themeKey];

  // ── Filtered sales for current period ─────────────────────────────
  const filtered = useMemo(() => {
    if (!sales) return [];
    const now = new Date();
    return sales.filter(s => {
      const d = new Date(s.date);
      if (period === "day")   return d.toDateString() === now.toDateString();
      if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (period === "year")  return d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [sales, period]);

  // ── Stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalRevenue = filtered.reduce((a, s) => a + s.sellPrice, 0);
    const totalCost    = filtered.reduce((a, s) => a + s.buyPrice, 0);
    const totalProfit  = totalRevenue - totalCost;
    const margin       = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const count        = filtered.length;
    const avgProfit    = count > 0 ? totalProfit / count : 0;
    const best         = filtered.reduce((b, s) => {
      const p = s.sellPrice - s.buyPrice;
      return p > (b ? b.sellPrice - b.buyPrice : -Infinity) ? s : b;
    }, null);
    return { totalRevenue, totalCost, totalProfit, margin, count, avgProfit, best };
  }, [filtered]);

  // ── Bar chart — last 6 months ──────────────────────────────────────
  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d  = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
      const m  = d.getMonth();
      const y  = d.getFullYear();
      const ms = (sales || []).filter(s => {
        const sd = new Date(s.date);
        return sd.getMonth() === m && sd.getFullYear() === y;
      });
      const profit = ms.reduce((a, s) => a + s.sellPrice - s.buyPrice, 0);
      return { label: MONTHS_FR[m], profit, count: ms.length };
    });
  }, [sales]);

  const maxProfit = Math.max(...chartData.map(d => d.profit), 1);

  // ── Category breakdown ─────────────────────────────────────────────
  const catData = useMemo(() => {
    const map = {};
    filtered.forEach(s => {
      const p = s.sellPrice - s.buyPrice;
      if (!map[s.category]) map[s.category] = { profit: 0, count: 0 };
      map[s.category].profit += p;
      map[s.category].count  += 1;
    });
    return Object.entries(map).sort((a, b) => b[1].profit - a[1].profit);
  }, [filtered]);

  // ── Add sale ───────────────────────────────────────────────────────
  const handleAdd = () => {
    if (!form.name.trim())              return setFormError("Donne un nom à l'article.");
    if (!form.buyPrice || !form.sellPrice) return setFormError("Remplis les prix d'achat et de vente.");
    const buy  = parseFloat(form.buyPrice);
    const sell = parseFloat(form.sellPrice);
    if (isNaN(buy) || isNaN(sell) || buy < 0 || sell < 0) return setFormError("Prix invalides.");
    setSales(prev => [{ id: genId(), name: form.name, category: form.category, buyPrice: buy, sellPrice: sell, date: form.date }, ...prev]);
    setForm({ name: "", category: "Sneakers", buyPrice: "", sellPrice: "", date: today.toISOString().slice(0,10) });
    setFormError("");
    setView("dashboard");
  };

  const periodLabel = { day: "Aujourd'hui", month: MONTHS_FULL[today.getMonth()], year: `${today.getFullYear()}`, all: "Tout le temps" };

  // ── Dynamic CSS ────────────────────────────────────────────────────
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Bebas+Neue&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { overflow-x: hidden; max-width: 100vw; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: ${T.bg}; }
    ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }

    .card      { background: ${T.surface}; border: 1px solid ${T.border}; border-radius: 12px; padding: 16px; }
    .card-glow { background: ${T.surface}; border: 1px solid ${T.border}; border-radius: 12px; padding: 16px; box-shadow: 0 0 24px ${T.accentDim}; }

    .btn-primary { background: ${T.accent}; color: #000; border: none; border-radius: 8px; padding: 12px 20px; font-family: inherit; font-size: 14px; font-weight: 500; cursor: pointer; transition: all .2s; letter-spacing: .5px; width: 100%; }
    .btn-primary:hover { background: ${T.accentHover}; transform: translateY(-1px); }

    .btn-ghost  { background: transparent; color: ${T.muted}; border: 1px solid ${T.border}; border-radius: 8px; padding: 9px 14px; font-family: inherit; font-size: 12px; cursor: pointer; transition: all .2s; }
    .btn-ghost:hover  { border-color: ${T.accent}55; color: ${T.text}; }
    .btn-ghost.active { border-color: ${T.accent}; color: ${T.accent}; background: ${T.accentDim}; }

    .input  { background: ${T.bg}; border: 1px solid ${T.border}; border-radius: 8px; padding: 11px 12px; color: ${T.text}; font-family: inherit; font-size: 14px; width: 100%; outline: none; transition: border .2s; -webkit-appearance: none; }
    .input:focus  { border-color: ${T.accent}; box-shadow: 0 0 0 3px ${T.accentDim}; }
    .select { background: ${T.bg}; border: 1px solid ${T.border}; border-radius: 8px; padding: 11px 12px; color: ${T.text}; font-family: inherit; font-size: 14px; width: 100%; outline: none; cursor: pointer; -webkit-appearance: none; }

    .nav-btn { background: transparent; border: none; color: ${T.muted}; font-family: inherit; font-size: 11px; cursor: pointer; padding: 5px 10px; border-radius: 8px; transition: all .2s; display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .nav-btn .icon { font-size: 18px; line-height: 1; }
    .nav-btn:hover  { color: ${T.text}; background: ${T.border}; }
    .nav-btn.active { color: ${T.accent}; background: ${T.accentDim}; }

    .sale-row { border-bottom: 1px solid ${T.border}; padding: 12px 0; display: flex; align-items: center; gap: 12px; transition: all .15s; border-radius: 8px; }
    .sale-row:last-child  { border-bottom: none; }
    .sale-row:hover { background: ${T.accentDim}; padding-left: 8px; padding-right: 8px; }

    .delete-btn { background: none; border: none; color: ${T.border}; cursor: pointer; font-size: 15px; padding: 4px 6px; border-radius: 4px; transition: color .2s; flex-shrink: 0; }
    .delete-btn:hover { color: #f87171; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.85); display: flex; align-items: center; justify-content: center; z-index: 100; backdrop-filter: blur(6px); padding: 20px; }
    .modal { background: ${T.surface}; border: 1px solid ${T.border}; border-radius: 16px; padding: 24px; width: 100%; max-width: 340px; }

    .theme-panel { position: fixed; top: 64px; right: 12px; background: ${T.surface}; border: 1px solid ${T.border}; border-radius: 14px; padding: 16px; z-index: 200; box-shadow: 0 20px 60px rgba(0,0,0,.6); min-width: 200px; }

    @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse  { 0%,100% { opacity:.6; transform:scale(1); } 50% { opacity:1; transform:scale(1.08); } }
    .animate-in  { animation: fadeIn .3s ease; }
    .logo-pulse  { animation: pulse 3s ease-in-out infinite; }
  `;

  // ── Loading screen ─────────────────────────────────────────────────
  if (sales === null) {
    return (
      <div style={{ fontFamily:"'DM Mono',monospace", background:"#0a0a0a", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#555", gap:16 }}>
        <CrosshairLogo color="#f97316" size={48}/>
        <div style={{ fontSize:12, letterSpacing:2 }}>CHARGEMENT...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily:"'DM Mono','Courier New',monospace", background:T.bg, minHeight:"100vh", color:T.text, transition:"background .4s,color .4s", overflowX:"hidden" }}>
      <style>{css}</style>

      {/* ── Header ── */}
      <div style={{ background:T.bg+"ee", borderBottom:`1px solid ${T.border}`, padding:"0 14px", position:"sticky", top:0, zIndex:50, backdropFilter:"blur(12px)" }}>
        <div style={{ maxWidth:700, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:56 }}>

          <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"default", flexShrink:0 }}>
            <div className="logo-pulse"><CrosshairLogo color={T.accent} size={26}/></div>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:3, color:T.text, whiteSpace:"nowrap" }}>
              PROFIT<span style={{ color:T.accent }}>TRACKER</span>
            </span>
          </div>

          <nav style={{ display:"flex", alignItems:"center", gap:2 }}>
            {[["dashboard","📊","Stats"],["history","📋","Ventes"],["add","＋","Ajouter"]].map(([v,icon,label]) => (
              <button key={v} className={`nav-btn${view===v?" active":""}`} onClick={() => { setView(v); setShowTheme(false); }}>
                <span className="icon">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
            {saveStatus === "saved" && <span style={{ fontSize:15, marginLeft:4 }} title="Sauvegardé">✅</span>}
            <button className="nav-btn" onClick={() => setShowTheme(s => !s)}>
              <span className="icon">🎨</span>
              <span>Thème</span>
            </button>
          </nav>
        </div>
      </div>

      {/* ── Theme panel ── */}
      {showTheme && (
        <>
          <div style={{ position:"fixed", inset:0, zIndex:190 }} onClick={() => setShowTheme(false)}/>
          <div className="theme-panel animate-in">
            <div style={{ fontSize:10, color:T.muted, letterSpacing:1.2, textTransform:"uppercase", marginBottom:12 }}>Couleur</div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {Object.entries(THEMES).map(([key, theme]) => (
                <button key={key} onClick={() => { setThemeKey(key); setShowTheme(false); }} style={{ display:"flex", alignItems:"center", gap:10, background: themeKey===key ? theme.accentDim : "transparent", border:`1px solid ${themeKey===key ? theme.accent : T.border}`, borderRadius:8, padding:"8px 12px", cursor:"pointer", color:T.text, fontFamily:"inherit", fontSize:13, transition:"all .2s" }}>
                  <div style={{ width:12, height:12, borderRadius:"50%", background:theme.accent, boxShadow:`0 0 8px ${theme.accent}88`, flexShrink:0 }}/>
                  {theme.name}
                  {themeKey===key && <span style={{ marginLeft:"auto", color:theme.accent }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div style={{ maxWidth:700, margin:"0 auto", padding:"16px 14px 40px" }}>

        {/* ══ DASHBOARD ══ */}
        {view === "dashboard" && (
          <div className="animate-in">

            {/* Period selector */}
            <div style={{ marginBottom:18 }}>
              <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2, color:T.text, marginBottom:10 }}>
                {periodLabel[period]}
              </h1>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                {[["day","Jour"],["month","Mois"],["year","Année"],["all","Tout"]].map(([p,l]) => (
                  <button key={p} className={`btn-ghost${period===p?" active":""}`} onClick={() => setPeriod(p)}>{l}</button>
                ))}
              </div>
            </div>

            {/* KPI cards — 2×2 */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
              {[
                { label:"Bénéfice net",      value:formatEur(stats.totalProfit),  sub:`${stats.count} vente${stats.count>1?"s":""}`,    accent: stats.totalProfit>=0 ? "#4ade80" : "#f87171" },
                { label:"Chiffre d'affaires",value:formatEur(stats.totalRevenue), sub:"Total vendu" },
                { label:"Total investi",     value:formatEur(stats.totalCost),    sub:"Total acheté" },
                { label:"Marge",             value:`${stats.margin.toFixed(1)}%`, sub:`Moy. ${formatEur(stats.avgProfit)}` },
              ].map((k,i) => (
                <div key={i} className="card-glow">
                  <div style={{ fontSize:9, color:T.muted, letterSpacing:1.2, textTransform:"uppercase", marginBottom:8 }}>{k.label}</div>
                  <div style={{ fontSize:20, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, color:k.accent||T.accent, lineHeight:1 }}>{k.value}</div>
                  <div style={{ fontSize:10, color:T.muted, marginTop:6 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            <div className="card" style={{ marginBottom:12 }}>
              <div style={{ fontSize:9, color:T.muted, letterSpacing:1.2, textTransform:"uppercase", marginBottom:16 }}>Bénéfices — 6 derniers mois</div>
              <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:110 }}>
                {chartData.map((d, i) => {
                  const h = maxProfit > 0 ? Math.max((d.profit/maxProfit)*100, 2) : 2;
                  const isCurrent = i === 5;
                  return (
                    <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5, height:"100%" }}>
                      <div style={{ flex:1, display:"flex", alignItems:"flex-end", width:"100%" }}>
                        <div title={`${formatEur(d.profit)} · ${d.count} vente(s)`} style={{ width:"100%", borderRadius:"3px 3px 0 0", background: isCurrent ? T.accent : T.border, height:`${h}%`, transition:"height .6s cubic-bezier(.34,1.56,.64,1)", boxShadow: isCurrent ? `0 0 10px ${T.accent}66` : "none" }}/>
                      </div>
                      <div style={{ fontSize:9, color: isCurrent ? T.accent : T.muted }}>{d.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="card" style={{ marginBottom:12 }}>
              <div style={{ fontSize:9, color:T.muted, letterSpacing:1.2, textTransform:"uppercase", marginBottom:14 }}>Par catégorie</div>
              {catData.length === 0
                ? <div style={{ color:T.muted, fontSize:12 }}>Aucune vente sur cette période.</div>
                : <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {catData.map(([cat, d]) => {
                      const maxCat = Math.max(...catData.map(c => c[1].profit), 1);
                      const col    = CATEGORY_COLORS[CATEGORIES.indexOf(cat) % CATEGORY_COLORS.length];
                      return (
                        <div key={cat}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5, fontSize:12 }}>
                            <span style={{ color:col }}>● {cat}</span>
                            <span style={{ color:"#4ade80" }}>{formatEur(d.profit)}</span>
                          </div>
                          <div style={{ background:T.border, borderRadius:4, height:5 }}>
                            <div style={{ background:col, borderRadius:4, height:"100%", width:`${(d.profit/maxCat)*100}%`, transition:"width .7s cubic-bezier(.34,1.56,.64,1)" }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
              }
            </div>

            {/* Best flip */}
            {stats.best && (
              <div className="card" style={{ background:`linear-gradient(135deg,${T.surface} 0%,${T.accentDim} 100%)`, borderColor:T.accent+"33" }}>
                <div style={{ fontSize:9, color:T.muted, letterSpacing:1.2, textTransform:"uppercase", marginBottom:10 }}>🏆 Meilleur flip — {periodLabel[period]}</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:17, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{stats.best.name}</div>
                    <div style={{ fontSize:11, color:T.muted, marginTop:3 }}>{stats.best.category} · {stats.best.date}</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:22, fontFamily:"'Bebas Neue',sans-serif", color:"#4ade80" }}>+{formatEur(stats.best.sellPrice-stats.best.buyPrice)}</div>
                    <div style={{ fontSize:10, color:T.muted }}>{formatEur(stats.best.buyPrice)} → {formatEur(stats.best.sellPrice)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ ADD SALE ══ */}
        {view === "add" && (
          <div className="animate-in">
            <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2, marginBottom:20, color:T.text }}>Nouvelle vente</h1>
            <div className="card" style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <div style={{ fontSize:9, color:T.muted, marginBottom:6, letterSpacing:1.2, textTransform:"uppercase" }}>Nom de l'article</div>
                <input className="input" placeholder="ex: Nike Air Jordan 1 Retro" value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))}/>
              </div>
              <div>
                <div style={{ fontSize:9, color:T.muted, marginBottom:6, letterSpacing:1.2, textTransform:"uppercase" }}>Catégorie</div>
                <select className="select" value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <div style={{ fontSize:9, color:T.muted, marginBottom:6, letterSpacing:1.2, textTransform:"uppercase" }}>Prix achat (€)</div>
                  <input className="input" type="number" min="0" placeholder="0.00" value={form.buyPrice} onChange={e => setForm(f => ({...f, buyPrice:e.target.value}))}/>
                </div>
                <div>
                  <div style={{ fontSize:9, color:T.muted, marginBottom:6, letterSpacing:1.2, textTransform:"uppercase" }}>Prix vente (€)</div>
                  <input className="input" type="number" min="0" placeholder="0.00" value={form.sellPrice} onChange={e => setForm(f => ({...f, sellPrice:e.target.value}))}/>
                </div>
              </div>

              {form.buyPrice && form.sellPrice && !isNaN(form.buyPrice) && !isNaN(form.sellPrice) && (
                <div style={{ background:T.accentDim, border:`1px solid ${T.accent}44`, borderRadius:8, padding:"10px 12px", fontSize:13 }}>
                  Bénéfice estimé : <span style={{ color: parseFloat(form.sellPrice)-parseFloat(form.buyPrice)>=0 ? "#4ade80" : "#f87171", fontWeight:600 }}>
                    {parseFloat(form.sellPrice)-parseFloat(form.buyPrice)>=0?"+":""}{formatEur(parseFloat(form.sellPrice)-parseFloat(form.buyPrice))}
                  </span>
                </div>
              )}

              <div>
                <div style={{ fontSize:9, color:T.muted, marginBottom:6, letterSpacing:1.2, textTransform:"uppercase" }}>Date de vente</div>
                <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({...f, date:e.target.value}))}/>
              </div>

              {formError && <div style={{ background:"#1a0a0a", border:"1px solid #3a1818", borderRadius:8, padding:"10px 12px", fontSize:12, color:"#f87171" }}>{formError}</div>}

              <div style={{ display:"flex", gap:10, marginTop:4 }}>
                <button className="btn-ghost" style={{ flex:1 }} onClick={() => setView("dashboard")}>Annuler</button>
                <button className="btn-primary" style={{ flex:2, width:"auto" }} onClick={handleAdd}>✓ Enregistrer</button>
              </div>
            </div>
          </div>
        )}

        {/* ══ HISTORY ══ */}
        {view === "history" && (
          <div className="animate-in">
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, gap:10 }}>
              <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:2, color:T.text }}>Historique</h1>
              <div style={{ fontSize:11, color:T.muted }}>{(sales||[]).length} vente{(sales||[]).length>1?"s":""}</div>
            </div>
            <div className="card" style={{ padding:"4px 16px" }}>
              {(sales||[]).length === 0 && <div style={{ color:T.muted, fontSize:13, textAlign:"center", padding:"40px 0" }}>Aucune vente enregistrée.</div>}
              {[...(sales||[])].sort((a,b) => new Date(b.date)-new Date(a.date)).map(s => {
                const profit = s.sellPrice - s.buyPrice;
                const col    = CATEGORY_COLORS[CATEGORIES.indexOf(s.category) % CATEGORY_COLORS.length];
                return (
                  <div key={s.id} className="sale-row">
                    <div style={{ width:9, height:9, borderRadius:"50%", background:col, flexShrink:0, boxShadow:`0 0 6px ${col}88` }}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{s.name}</div>
                      <div style={{ fontSize:10, color:T.muted, marginTop:2 }}>{s.category} · {s.date}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <div style={{ fontSize:14, color: profit>=0?"#4ade80":"#f87171", fontFamily:"'Bebas Neue',sans-serif" }}>
                        {profit>=0?"+":""}{formatEur(profit)}
                      </div>
                      <div style={{ fontSize:10, color:T.muted }}>{formatEur(s.buyPrice)} → {formatEur(s.sellPrice)}</div>
                    </div>
                    <button className="delete-btn" onClick={() => setDeleteId(s.id)}>✕</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Delete modal ── */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal animate-in" onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}><CrosshairLogo color="#f87171" size={38}/></div>
            <div style={{ fontSize:17, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:1, marginBottom:8, textAlign:"center", color:T.text }}>Supprimer la vente ?</div>
            <div style={{ fontSize:12, color:T.muted, marginBottom:22, textAlign:"center" }}>Cette action est irréversible.</div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn-ghost" style={{ flex:1 }} onClick={() => setDeleteId(null)}>Annuler</button>
              <button className="btn-primary" style={{ flex:1, width:"auto", background:"#ef4444" }} onClick={() => { setSales(p => p.filter(s => s.id !== deleteId)); setDeleteId(null); }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
