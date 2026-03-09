const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.post("/api/intelligence", async (req, res) => {
  const { systemPrompt, userPrompt } = req.body || {};
  if (!systemPrompt || !userPrompt) return res.status(400).json({ error: "Missing prompts" });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set on server" });
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 4000,
        system: systemPrompt,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    const raw = await r.text();
    if (!r.ok) {
      let msg = "Anthropic error " + r.status;
      try { const j = JSON.parse(raw); if (j.error && j.error.message) msg = j.error.message; } catch(e) {}
      return res.status(r.status).json({ error: msg });
    }
    const data = JSON.parse(raw);
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    if (!text) return res.status(500).json({ error: "Empty response (stop_reason: " + data.stop_reason + ")" });
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return res.status(500).json({ error: "No JSON found: " + text.substring(0, 150) });
    return res.json(JSON.parse(match[0]));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("*", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(HTML);
});

app.listen(PORT, () => console.log("AI.5 running on port " + PORT));

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>AI.5 // Brand Creative Intelligence</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{background:#F4F3F0;color:#111110;font-family:'IBM Plex Mono','Courier New',monospace;-webkit-font-smoothing:antialiased;min-height:100vh}
::-webkit-scrollbar{width:3px;background:#F4F3F0}::-webkit-scrollbar-thumb{background:#CECBC4}
::selection{background:#111110;color:#F4F3F0}
input,textarea,button{font-family:'IBM Plex Mono','Courier New',monospace;outline:none}
button{cursor:pointer;background:none;border:none;color:inherit}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes blink{0%,49%,100%{opacity:1}50%,99%{opacity:0}}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.2}}
@keyframes scan{0%{top:0}100%{top:100%}}
.fi{animation:fadeIn .35s ease both}
.grid-bg{background-image:linear-gradient(rgba(206,203,196,0.4) 1px,transparent 1px),linear-gradient(90deg,rgba(206,203,196,0.4) 1px,transparent 1px);background-size:32px 32px}
.scan-wrap{position:relative;overflow:hidden}
.scan-wrap::after{content:'';position:absolute;left:0;right:0;height:2px;background:linear-gradient(transparent,rgba(200,35,26,0.07),transparent);animation:scan 4s linear infinite;pointer-events:none}
.rh{transition:background .1s;cursor:pointer}
.rh:hover{background:#E2E0DB!important}

#app{display:none}
.chip{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:500;letter-spacing:0.13em;text-transform:uppercase;padding:4px 10px;border:1px solid #CECBC4;color:#999590;background:transparent;cursor:pointer;transition:all .12s}
.chip:hover{border-color:#111110;color:#111110}
.tag{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:500;letter-spacing:0.13em;text-transform:uppercase;padding:4px 10px;border:1px solid #111110;color:#111110;background:#E2E0DB;display:inline-block}
.spinner{display:inline-block;width:13px;height:13px;border:1px solid #CECBC4;border-top:1px solid #C8231A;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle}
.led{display:inline-block;width:7px;height:7px;border-radius:50%;flex-shrink:0}
.led-red{background:#C8231A;box-shadow:0 0 6px #C8231A88}
.led-green{background:#1A7A3C;box-shadow:0 0 6px #1A7A3C88}
.led-pulse{animation:pulse 2s ease infinite}
.blink{animation:blink 1.2s step-end infinite}
.nav-btn{font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:500;letter-spacing:0.16em;padding:10px 22px;color:#999590;background:transparent;border-top:none;border-bottom:none;border-left:none;border-right:1px solid #CECBC4;cursor:pointer;transition:all .1s}
.nav-btn.active{color:#111110;background:#ECEAE6}
.view{display:none;padding:40px 40px 80px}
.view.active{display:block}
.search-btn{position:absolute;right:0;top:0;bottom:0;padding:0 18px;background:#ECEAE6;color:#999590;font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;border:none;border-left:1px solid #CECBC4;transition:all .15s;cursor:not-allowed;font-family:'IBM Plex Mono',monospace}
.search-btn.ready{background:#111110;color:#F4F3F0;cursor:pointer}
.submit-btn{width:100%;padding:12px;background:#ECEAE6;color:#999590;font-size:9px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;border:none;border-top:1px solid #CECBC4;transition:all .15s;cursor:not-allowed;font-family:'IBM Plex Mono',monospace}
.submit-btn.ready{background:#111110;color:#F4F3F0;cursor:pointer}
.error-box{margin-top:20px;padding:12px 16px;border:1px solid #C8231A;border-left:3px solid #C8231A;background:#FDF5F4}
.panel{background:#ECEAE6;border:1px solid #CECBC4}
.panel-header{padding:8px 12px;border-bottom:1px solid #CECBC4;background:#E2E0DB}
</style>
</head>
<body>

<div id="app" class="grid-bg" style="min-height:100vh">

  <div style="background:#111110;height:24px;overflow:hidden;display:flex;align-items:center">
    <div id="ticker" style="display:flex;white-space:nowrap;animation:ticker 30s linear infinite"></div>
  </div>

  <div style="position:sticky;top:0;z-index:100;background:#F4F3F0;border-bottom:2px solid #111110;display:flex;align-items:stretch;justify-content:space-between;padding:0 40px">
    <div style="display:flex;align-items:center;padding:14px 0">
      <span style="font-size:14px;font-weight:700;color:#111110">AI</span>
      <span style="font-size:14px;font-weight:700;color:#C8231A">.</span>
      <span style="font-size:14px;font-weight:700;color:#111110">5</span>
      <span style="font-size:8px;color:#999590;letter-spacing:0.14em;margin-left:10px;text-transform:uppercase">// Brand Intelligence</span>
    </div>
    <div style="display:flex;border:1px solid #CECBC4;border-bottom:none;margin-bottom:-2px">
      <button class="nav-btn active" onclick="showView('search')" id="nav-search">BRAND SEARCH</button>
      <button class="nav-btn" onclick="showView('brief')" id="nav-brief">BRIEF MATCH</button>
      <button class="nav-btn" onclick="showView('category')" id="nav-category">CATEGORY MAP</button>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <span class="led led-green led-pulse"></span>
      <span style="font-size:9px;font-weight:700;color:#1A7A3C;letter-spacing:0.14em;text-transform:uppercase">ONLINE</span>
    </div>
  </div>

  <!-- SEARCH VIEW -->
  <div id="view-search" class="view active" style="max-width:720px">
    <div style="margin-bottom:40px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <span class="led led-red led-pulse"></span>
        <span style="font-size:9px;font-weight:700;color:#C8231A;letter-spacing:0.14em;text-transform:uppercase;margin-left:4px">BRAND INTELLIGENCE // LIVE FEED</span>
      </div>
      <div style="font-size:28px;font-weight:700;color:#111110;letter-spacing:-0.03em;line-height:1.05;margin-bottom:10px">
        SEARCH ANY<br>
        <span style="color:#C8231A">TARGET_<span class="blink">&#x2588;</span></span>
      </div>
      <span style="font-size:10px;font-weight:300;color:#999590">Real campaigns &middot; Real strategy &middot; Real agencies &middot; Pulled live from the web.</span>
    </div>
    <div class="panel" style="margin-bottom:0">
      <div class="panel-header"><span style="font-size:8px;color:#999590;letter-spacing:0.14em;text-transform:uppercase">SEARCH QUERY</span></div>
      <div style="position:relative;border-bottom:1px solid #CECBC4">
        <input id="brand-input" type="text" placeholder="Enter brand name — ASAHI, LOEWE, OATLY..." oninput="updateBtn('brand-input','brand-btn')" onkeydown="if(event.key==='Enter')runBrand()" style="width:100%;background:#fff;border:none;padding:14px 120px 14px 16px;color:#111110;font-size:12px;letter-spacing:0.04em"/>
        <button id="brand-btn" class="search-btn" onclick="runBrand()">SEARCH &#x2192;</button>
      </div>
      <input id="cat-hint" type="text" placeholder="Category hint (optional) — e.g. Japanese beer, luxury fashion..." style="width:100%;background:transparent;border:none;padding:9px 16px;color:#555350;font-size:10px;letter-spacing:0.03em"/>
    </div>
    <div id="search-loading" style="display:none;padding:40px 0">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
        <span class="spinner"></span>
        <span style="font-size:9px;font-weight:700;color:#111110;letter-spacing:0.14em;text-transform:uppercase">RETRIEVING INTELLIGENCE...</span>
      </div>
      <div id="search-steps"></div>
    </div>
    <div id="search-error" style="display:none" class="error-box">
      <span style="font-size:8px;font-weight:700;color:#C8231A;letter-spacing:0.14em;text-transform:uppercase">RETRIEVAL FAILED &#x2014; </span>
      <span id="search-error-msg" style="font-size:9px;color:#555350"></span>
    </div>
    <div id="recent-wrap" style="margin-top:40px">
      <span style="font-size:8px;color:#999590;letter-spacing:0.14em;text-transform:uppercase">RECENT TARGETS</span>
      <div id="recent-chips" style="display:flex;gap:4px;flex-wrap:wrap;margin-top:12px"></div>
    </div>
    <div id="brand-profile"></div>
  </div>

  <!-- BRIEF VIEW -->
  <div id="view-brief" class="view">
    <div style="margin-bottom:36px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <span class="led led-red led-pulse"></span>
        <span style="font-size:9px;font-weight:700;color:#C8231A;letter-spacing:0.14em;text-transform:uppercase;margin-left:4px">BRIEF MATCH ENGINE // ACTIVE</span>
      </div>
      <div style="font-size:28px;font-weight:700;color:#111110;letter-spacing:-0.03em;line-height:1.05;margin-bottom:10px">
        SUBMIT<br><span style="color:#C8231A">BRIEF_<span class="blink">&#x2588;</span></span>
      </div>
      <span style="font-size:10px;font-weight:300;color:#999590">Paste your brief. Get best-in-class creative references from across industries.</span>
    </div>
    <div style="max-width:660px">
      <div class="panel">
        <div class="panel-header"><span style="font-size:8px;color:#999590;letter-spacing:0.14em;text-transform:uppercase">BRIEF INPUT // CLASSIFIED</span></div>
        <textarea id="brief-input" oninput="updateBtn('brief-input','brief-btn')" placeholder="ENTER BRIEF..." style="width:100%;min-height:180px;background:#fff;border:none;border-bottom:1px solid #CECBC4;padding:14px 16px;color:#111110;font-size:11px;line-height:1.8;resize:vertical;font-weight:300;letter-spacing:0.02em"></textarea>
        <button id="brief-btn" class="submit-btn" onclick="runBrief()">MATCH TO CREATIVE REFERENCES &#x2192;</button>
      </div>
    </div>
    <div id="brief-loading" style="display:none;padding:40px 0">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
        <span class="spinner"></span>
        <span style="font-size:9px;font-weight:700;color:#111110;letter-spacing:0.14em;text-transform:uppercase">ANALYSING BRIEF...</span>
      </div>
      <div id="brief-steps"></div>
    </div>
    <div id="brief-error" style="display:none;margin-top:14px;font-size:9px;color:#C8231A"></div>
    <div id="brief-results" style="display:none;margin-top:40px"></div>
  </div>

  <!-- CATEGORY VIEW -->
  <div id="view-category" class="view">
    <div style="margin-bottom:36px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <span class="led led-red led-pulse"></span>
        <span style="font-size:9px;font-weight:700;color:#C8231A;letter-spacing:0.14em;text-transform:uppercase;margin-left:4px">CATEGORY LANDSCAPE // MAPPING</span>
      </div>
      <div style="font-size:28px;font-weight:700;color:#111110;letter-spacing:-0.03em;line-height:1.05;margin-bottom:10px">
        MAP THE<br><span style="color:#C8231A">FIELD_<span class="blink">&#x2588;</span></span>
      </div>
      <span style="font-size:10px;font-weight:300;color:#999590">Enter any product category. Leaders &middot; Themes &middot; Whitespace &middot; Opportunity.</span>
    </div>
    <div style="max-width:560px;margin-bottom:24px">
      <div class="panel">
        <div class="panel-header"><span style="font-size:8px;color:#999590;letter-spacing:0.14em;text-transform:uppercase">TARGET CATEGORY</span></div>
        <div style="position:relative">
          <input id="cat-input" type="text" placeholder="CATEGORY — e.g. CRAFT BEER, ELECTRIC SUV..." oninput="updateBtn('cat-input','cat-btn')" onkeydown="if(event.key==='Enter')runCategory()" style="width:100%;background:#fff;border:none;padding:13px 120px 13px 16px;color:#111110;font-size:11px;letter-spacing:0.04em"/>
          <button id="cat-btn" class="search-btn" style="padding:0 16px" onclick="runCategory()">MAP &#x2192;</button>
        </div>
      </div>
      <div id="cat-chips" style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px"></div>
    </div>
    <div id="cat-loading" style="display:none;padding:40px 0">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
        <span class="spinner"></span>
        <span style="font-size:9px;font-weight:700;color:#111110;letter-spacing:0.14em;text-transform:uppercase">MAPPING CATEGORY...</span>
      </div>
      <div id="cat-steps"></div>
    </div>
    <div id="cat-error" style="display:none;font-size:9px;color:#C8231A;margin-top:16px"></div>
    <div id="cat-results" style="display:none;margin-top:0"></div>
  </div>

</div>

<script>
var recent = ["Asahi","Loewe","Oatly","Barclays","Patagonia","Netflix","Guinness","Chanel"];
var catQuick = ["Craft Beer","Luxury Fashion","Electric Vehicles","Fintech","Sportswear","QSR","Streaming","Beauty","Spirits","Airlines"];
var BOOT = [
  "INITIALISING AI.5 INTELLIGENCE SYSTEM...",
  "LOADING BRAND DATABASE MODULES............OK",
  "CONNECTING TO LIVE WEB FEEDS.............OK",
  "CAMPAIGN ANALYSIS ENGINE.................READY",
  "BRIEF MATCH PROTOCOLS....................ACTIVE",
  "CATEGORY LANDSCAPE MAPPER................ONLINE",
  "ENCRYPTION LAYER.........................ENABLED",
  "---------------------------------------------------",
  "SYSTEM READY. CLASSIFICATION: TOP SECRET"
];

function e(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
window.addEventListener("load", initApp);

function initApp(){
  var tk=document.getElementById("ticker");
  var items=["LIVE INTELLIGENCE FEED //","BRAND CREATIVE DATABASE //","REAL-TIME WEB SEARCH //","CLASSIFICATION: UNRESTRICTED //","AI.5 SYSTEM ONLINE //","ALL MARKETS // ALL MEDIA // ALL CATEGORIES //"];
  var all=items.concat(items).concat(items);
  all.forEach(function(t,i){
    var s=document.createElement("span");
    s.style.cssText="font-size:8px;font-weight:500;letter-spacing:0.2em;padding-right:48px;color:"+(i%5===0?"#C8231A":"#555555");
    s.textContent=t;
    tk.appendChild(s);
  });
  renderRecent();
  var cc=document.getElementById("cat-chips");
  catQuick.forEach(function(q){
    var b=document.createElement("button");
    b.className="chip";b.textContent=q;
    b.onclick=function(){document.getElementById("cat-input").value=q;updateBtn("cat-input","cat-btn");runCategory();};
    cc.appendChild(b);
  });
}

function renderRecent(){
  var el=document.getElementById("recent-chips");el.innerHTML="";
  recent.forEach(function(r){
    var b=document.createElement("button");b.className="chip";b.textContent=r;
    b.onclick=function(){document.getElementById("brand-input").value=r;updateBtn("brand-input","brand-btn");runBrand();};
    el.appendChild(b);
  });
}

function showView(v){
  ["search","brief","category"].forEach(function(id){
    document.getElementById("view-"+id).classList.toggle("active",id===v);
    document.getElementById("nav-"+id).classList.toggle("active",id===v);
  });
}

function updateBtn(inputId,btnId){
  var v=document.getElementById(inputId).value.trim();
  document.getElementById(btnId).classList.toggle("ready",!!v);
}

function loadingSteps(containerId,steps){
  var el=document.getElementById(containerId);el.innerHTML="";
  steps.forEach(function(s,i){
    var div=document.createElement("div");
    div.id=containerId+"-s"+i;
    div.style.cssText="display:flex;gap:12px;align-items:center;padding:5px 0;opacity:0.15;transition:opacity .4s";
    div.innerHTML='<span style="font-size:9px;font-weight:700;color:#999590">[..]</span><span style="font-size:9px;color:#999590">'+e(s)+'</span>';
    el.appendChild(div);
  });
  var cur=0;
  function tick(){
    if(cur>0){
      var prev=document.getElementById(containerId+"-s"+(cur-1));
      if(prev){prev.style.opacity="1";prev.children[0].style.color="#1A7A3C";prev.children[0].textContent="[OK]";}
    }
    if(cur<steps.length){
      var d=document.getElementById(containerId+"-s"+cur);
      if(d){d.style.opacity="1";d.children[0].style.color="#C8231A";d.children[0].textContent="[>>]";d.children[1].style.color="#111110";}
      cur++;setTimeout(tick,1800);
    }
  }
  tick();
}

async function callAPI(sys,usr){
  var res=await fetch("/api/intelligence",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({systemPrompt:sys,userPrompt:usr})});
  var data=await res.json();
  if(!res.ok||data.error)throw new Error(data.error||"Server error "+res.status);
  return data;
}

var SB="You are a brand creative intelligence analyst. Use web_search to find real advertising campaigns. After searching, return ONLY a raw JSON object with no markdown, no code fences, no explanation.";
var SBR="You are a senior creative strategist. Use web_search to find brand creative references. After searching, return ONLY a raw JSON object with no markdown, no code fences, no explanation.";
var SC="You are a brand intelligence analyst. Use web_search to map category creative landscapes. After searching, return ONLY a raw JSON object with no markdown, no code fences, no explanation.";

// BRAND SEARCH
var brandBusy=false;
async function runBrand(){
  var name=document.getElementById("brand-input").value.trim();
  if(!name||brandBusy)return;
  var cat=document.getElementById("cat-hint").value.trim();
  brandBusy=true;
  document.getElementById("search-loading").style.display="block";
  document.getElementById("search-error").style.display="none";
  document.getElementById("recent-wrap").style.display="none";
  document.getElementById("brand-profile").innerHTML="";
  loadingSteps("search-steps",["SEARCHING WEB FOR CAMPAIGNS","ANALYSING CREATIVE STRATEGY","MAPPING COMPETITIVE CONTEXT","COMPILING INTELLIGENCE FILE"]);
  try{
    var hint=cat?" ("+cat+")":"";
    var p='Search the web for advertising campaigns and creative strategy of "'+name+'"'+hint+'. Focus on the last 4 years. Return ONLY this raw JSON: {"brand":"'+name+'","category":"","tagline":"","headquarterCountry":"","appeal":["","",""],"brandColor":"#hex","creativeThemes":["",""],"campaigns":[{"title":"","year":2023,"type":"TV","market":"","description":"","mood":"","agency":"","awards":"","reach":""}],"competitiveContext":"","recentDirection":""} Include 4-7 real verified campaigns only.';
    var data=await callAPI(SB,p);
    recent=[name].concat(recent.filter(function(x){return x.toLowerCase()!==name.toLowerCase();})).slice(0,8);
    renderRecent();
    document.getElementById("search-loading").style.display="none";
    renderProfile(data);
  }catch(err){
    document.getElementById("search-loading").style.display="none";
    document.getElementById("search-error").style.display="block";
    document.getElementById("search-error-msg").textContent=err.message;
    document.getElementById("recent-wrap").style.display="block";
  }
  brandBusy=false;
}

var _profileData=null;
var _openRow=null;
var _activeType="All";

function renderProfile(d){
  _profileData=d;_openRow=null;_activeType="All";
  drawProfile();
}

function drawProfile(){
  var d=_profileData;
  var camps=d.campaigns||[];
  var types=["All"].concat(Array.from(new Set(camps.map(function(c){return c.type;}))));
  var filtered=_activeType==="All"?camps:camps.filter(function(c){return c.type===_activeType;});
  var html='<button onclick="backToSearch()" style="display:flex;align-items:center;gap:8px;margin-bottom:32px"><span style="font-size:9px;color:#999590;letter-spacing:0.14em;text-transform:uppercase">&#x2190; RETURN TO SEARCH</span></button>';
  html+='<div class="scan-wrap" style="border-top:2px solid #111110;border-bottom:1px solid #CECBC4;padding:20px 0;margin-bottom:32px;display:flex;align-items:flex-start;justify-content:space-between;gap:20px">';
  html+='<div><div style="font-size:10px;font-weight:500;color:#999590;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px">INTELLIGENCE FILE // '+e((d.category||"").toUpperCase())+'</div>';
  html+='<div style="font-size:26px;font-weight:700;color:#111110;letter-spacing:-0.02em;line-height:1">'+e((d.brand||"").toUpperCase())+'</div></div>';
  html+='<div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end"><div style="display:flex;align-items:center;gap:8px"><span class="led led-green"></span><span style="font-size:9px;color:#1A7A3C;letter-spacing:0.14em;text-transform:uppercase">ACTIVE PROFILE</span></div>';
  html+='<span style="font-size:9px;color:#999590;letter-spacing:0.14em">'+e(d.headquarterCountry||"")+'</span></div></div>';
  html+='<div style="display:grid;grid-template-columns:1fr 260px;gap:44px;margin-bottom:40px">';
  html+='<div><div style="border-left:2px solid #C8231A;padding-left:14px;margin-bottom:20px"><div style="font-size:8px;color:#999590;letter-spacing:0.14em;text-transform:uppercase">POSITIONING</div>';
  html+='<div style="font-size:13px;font-weight:300;font-style:italic;color:#555350;margin-top:6px;line-height:1.55">&ldquo;'+e(d.tagline||"")+'&rdquo;</div></div>';
  html+='<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:20px">'+(d.appeal||[]).map(function(a){return '<span class="tag">'+e(a)+'</span>';}).join("")+'</div>';
  html+='<div style="background:#ECEAE6;border:1px solid #CECBC4;padding:14px 16px"><div style="font-size:8px;color:#999590;letter-spacing:0.14em;text-transform:uppercase">CURRENT DIRECTION</div>';
  html+='<p style="font-size:11px;font-weight:300;color:#555350;margin-top:8px;line-height:1.7">'+e(d.recentDirection||"")+'</p></div></div>';
  html+='<div style="border-left:1px solid #CECBC4;padding-left:24px"><div style="font-size:8px;color:#999590;letter-spacing:0.14em;text-transform:uppercase">CREATIVE TERRITORIES</div>';
  html+='<div style="margin-top:10px">'+(d.creativeThemes||[]).map(function(t,i){return '<div style="display:flex;gap:10px;align-items:flex-start;padding:7px 0;border-bottom:1px solid #CECBC4"><span style="font-size:9px;font-weight:700;color:#C8231A">'+String(i+1).padStart(2,"0")+'</span><span style="font-size:10px;color:#555350">'+e(t)+'</span></div>';}).join("")+'</div>';
  html+='<div style="height:1px;background:#CECBC4;margin:18px 0"></div><div style="font-size:8px;color:#999590;letter-spacing:0.14em;text-transform:uppercase">VS COMPETITION</div>';
  html+='<p style="font-size:10px;font-weight:300;color:#555350;margin-top:8px;line-height:1.7">'+e(d.competitiveContext||"")+'</p></div></div>';
  html+='<div style="border:1px solid #CECBC4;background:#ECEAE6">';
  html+='<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #CECBC4;background:#E2E0DB">';
  html+='<div style="display:flex;align-items:center;gap:10px"><span class="led led-red led-pulse"></span><span style="font-size:9px;font-weight:700;color:#111110;letter-spacing:0.14em;text-transform:uppercase">CAMPAIGN INTELLIGENCE &mdash; '+filtered.length+' RECORDS</span></div>';
  html+='<div style="display:flex;gap:3px">'+types.map(function(t){return '<button class="chip'+(t===_activeType?" tag":"")+ '" onclick="setType(\''+t.replace(/'/g,"\\'")+'\')" style="'+(t===_activeType?"border-color:#111110;color:#111110;background:#E2E0DB":"")+'">'+e(t)+'</button>';}).join("")+'</div></div>';
  html+='<div style="display:grid;grid-template-columns:28px 1fr 80px 80px 50px;gap:12px;padding:8px 16px;border-bottom:1px solid #CECBC4">'+["REF","OPERATION","FORMAT","MARKET","YEAR"].map(function(h){return '<span style="font-size:8px;color:#999590;letter-spacing:0.14em;text-transform:uppercase">'+h+'</span>';}).join("")+'</div>';
  html+='<div>'+filtered.map(function(c,i){
    var open=_openRow===i;
    var row='<div style="border-bottom:1px solid #CECBC4"><div class="rh" onclick="toggleRow('+i+')" style="display:grid;grid-template-columns:28px 1fr 80px 80px 50px;gap:12px;padding:12px 16px">';
    row+='<span style="font-size:9px;font-weight:700;color:#C8231A">'+String(i+1).padStart(2,"0")+'</span>';
    row+='<div><div style="font-size:11px;font-weight:500;color:#111110;letter-spacing:0.02em">'+e(c.title||"")+'</div>'+(c.agency&&c.agency!=="Unknown"?'<div style="font-size:9px;color:#999590">'+e(c.agency)+'</div>':"")+'</div>';
    row+='<span style="font-size:9px;color:#555350;letter-spacing:0.1em;text-transform:uppercase">'+e(c.type||"")+'</span>';
    row+='<span style="font-size:9px;color:#555350">'+e(c.market||"")+'</span>';
    row+='<span style="font-size:9px;font-weight:700;color:#555350">'+e(String(c.year||""))+'</span></div>';
    if(open){
      row+='<div class="fi" style="padding:14px 16px 14px 56px;background:#F4F3F0;border-top:1px solid #CECBC4">';
      row+='<p style="font-size:11px;font-weight:300;color:#555350;line-height:1.75;max-width:560px;margin-bottom:14px">'+e(c.description||"")+'</p>';
      row+='<div style="display:flex;gap:28px">';
      if(c.mood)row+='<div><div style="font-size:8px;color:#999590;letter-spacing:0.14em;text-transform:uppercase">TONE</div><div style="font-size:10px;color:#111110;margin-top:4px">'+e(c.mood)+'</div></div>';
      if(c.reach&&c.reach!=="unknown")row+='<div><div style="font-size:8px;color:#999590;letter-spacing:0.14em;text-transform:uppercase">REACH</div><div style="font-size:10px;color:#111110;margin-top:4px">'+e(c.reach)+'</div></div>';
      if(c.awards&&c.awards!=="none")row+='<div><div style="font-size:8px;color:#999590;letter-spacing:0.14em;text-transform:uppercase">AWARDS</div><div style="font-size:10px;color:#C8231A;font-weight:500;margin-top:4px">'+e(c.awards)+'</div></div>';
      row+='</div></div>';
    }
    row+='</div>';
    return row;
  }).join("")+'</div></div>';
  document.getElementById("brand-profile").innerHTML=html;
}

function setType(t){_activeType=t;_openRow=null;drawProfile();}
function toggleRow(i){_openRow=_openRow===i?null:i;drawProfile();}
function backToSearch(){document.getElementById("brand-profile").innerHTML="";document.getElementById("recent-wrap").style.display="block";}

// BRIEF MATCH
var briefBusy=false;
async function runBrief(){
  var brief=document.getElementById("brief-input").value.trim();
  if(!brief||briefBusy)return;
  briefBusy=true;
  document.getElementById("brief-loading").style.display="block";
  document.getElementById("brief-error").style.display="none";
  document.getElementById("brief-results").style.display="none";
  loadingSteps("brief-steps",["READING STRATEGIC TERRITORY","SEARCHING CREATIVE LANDSCAPE","SCORING BRAND REFERENCES","COMPILING MATCHES"]);
  try{
    var p='Analyse this creative brief and find 4 brands whose advertising is the best creative reference. Brief: "'+brief+'" Return ONLY this raw JSON: {"analysis":"","territory":"","matches":[{"brand":"","category":"","score":88,"why":"","keyWork":"","lesson":"","brandColor":"#hex"}]}';
    var data=await callAPI(SBR,p);
    document.getElementById("brief-loading").style.display="none";
    renderBrief(data);
  }catch(err){
    document.getElementById("brief-loading").style.display="none";
    document.getElementById("brief-error").style.display="block";
    document.getElementById("brief-error").textContent=err.message;
  }
  briefBusy=false;
}

function renderBrief(d){
  var el=document.getElementById("brief-results");el.style.display="block";
  var html='<div style="display:grid;grid-template-columns:1fr 1fr;gap:48px">';
  html+='<div><div style="font-size:9px;font-weight:700;color:#111110;letter-spacing:0.14em;text-transform:uppercase">STRATEGIC READ</div>';
  html+='<p style="font-size:11px;font-weight:300;color:#555350;line-height:1.75;margin-top:10px">'+e(d.analysis||"")+'</p>';
  if(d.territory)html+='<div style="margin-top:12px;display:inline-flex;align-items:center;gap:8px;border:1px solid #CECBC4;padding:6px 12px;background:#ECEAE6"><span class="led led-red"></span><span style="font-size:8px;color:#999590;letter-spacing:0.12em;text-transform:uppercase">TERRITORY &mdash; <strong style="color:#111110">'+e(d.territory)+'</strong></span></div>';
  html+='</div><div style="border-left:1px solid #CECBC4;padding-left:36px">';
  html+='<div style="font-size:9px;font-weight:700;color:#111110;letter-spacing:0.14em;text-transform:uppercase">REFERENCES &mdash; '+(d.matches||[]).length+'</div>';
  html+='<div style="margin-top:14px">'+(d.matches||[]).map(function(m){
    var s='<div style="padding:16px 0;border-bottom:1px solid #CECBC4">';
    s+='<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px">';
    s+='<div style="display:flex;align-items:baseline;gap:10px"><span style="font-size:13px;font-weight:700;color:#111110">'+e((m.brand||"").toUpperCase())+'</span><span style="font-size:8px;color:#999590;letter-spacing:0.14em;text-transform:uppercase">'+e(m.category||"")+'</span></div>';
    s+='<span style="font-size:20px;font-weight:700;color:'+e(m.brandColor||"#C8231A")+'">'+e(String(m.score||""))+'<span style="font-size:9px">%</span></span></div>';
    s+='<p style="font-size:10px;font-weight:300;color:#555350;line-height:1.7;margin-bottom:9px">'+e(m.why||"")+'</p>';
    if(m.keyWork)s+='<div style="font-size:9px;color:#999590;margin-bottom:4px">KEY WORK &mdash; <span style="color:#C8231A">'+e(m.keyWork)+'</span></div>';
    if(m.lesson)s+='<div style="font-size:9px;color:#999590;font-style:italic">&#x2192; '+e(m.lesson)+'</div>';
    s+='</div>';return s;
  }).join("")+'</div></div></div>';
  el.innerHTML=html;
}

// CATEGORY MAP
var catBusy=false;
async function runCategory(){
  var cat=document.getElementById("cat-input").value.trim();
  if(!cat||catBusy)return;
  catBusy=true;
  document.getElementById("cat-loading").style.display="block";
  document.getElementById("cat-error").style.display="none";
  document.getElementById("cat-results").style.display="none";
  loadingSteps("cat-steps",["IDENTIFYING CATEGORY LEADERS","SCANNING CAMPAIGN LANDSCAPE","EXTRACTING CREATIVE THEMES","LOCATING WHITESPACE"]);
  try{
    var p='Search the web for the creative advertising landscape in the "'+cat+'" category. Return ONLY this raw JSON: {"category":"'+cat+'","summary":"","dominantThemes":["","","",""],"leadingBrands":[{"brand":"","position":"","standout":"","brandColor":"#hex"}],"whitespace":"","trend":""}';
    var data=await callAPI(SC,p);
    document.getElementById("cat-loading").style.display="none";
    renderCat(data);
  }catch(err){
    document.getElementById("cat-loading").style.display="none";
    document.getElementById("cat-error").style.display="block";
    document.getElementById("cat-error").textContent=err.message;
  }
  catBusy=false;
}

function renderCat(d){
  var el=document.getElementById("cat-results");el.style.display="block";
  var html='<div style="display:grid;grid-template-columns:1fr 1fr;gap:44px;margin-bottom:36px">';
  html+='<div><div style="font-size:9px;font-weight:700;color:#111110;letter-spacing:0.14em;text-transform:uppercase">OVERVIEW &mdash; '+e((d.category||"").toUpperCase())+'</div>';
  html+='<p style="font-size:11px;font-weight:300;color:#555350;line-height:1.75;margin-top:12px">'+e(d.summary||"")+'</p>';
  if(d.trend)html+='<div style="margin-top:18px;padding:13px 16px;border-left:3px solid #C8231A;background:#ECEAE6"><div style="font-size:8px;font-weight:700;color:#C8231A;letter-spacing:0.14em;text-transform:uppercase">DOMINANT TREND</div><div style="font-size:11px;font-weight:300;color:#111110;margin-top:6px;line-height:1.55">'+e(d.trend)+'</div></div>';
  if(d.whitespace)html+='<div style="margin-top:10px;padding:13px 16px;border-left:3px solid #111110;background:#ECEAE6"><div style="font-size:8px;color:#999590;letter-spacing:0.14em;text-transform:uppercase">CREATIVE WHITESPACE</div><div style="font-size:11px;font-weight:300;color:#555350;margin-top:6px;line-height:1.55">'+e(d.whitespace)+'</div></div>';
  html+='</div><div><div style="font-size:9px;font-weight:700;color:#111110;letter-spacing:0.14em;text-transform:uppercase">CREATIVE THEMES</div>';
  html+='<div style="margin-top:12px">'+(d.dominantThemes||[]).map(function(t,i){return '<div style="display:flex;gap:12px;padding:9px 0;border-bottom:1px solid #CECBC4"><span style="font-size:9px;font-weight:700;color:#C8231A">'+String(i+1).padStart(2,"0")+'</span><span style="font-size:10px;color:#111110">'+e(t)+'</span></div>';}).join("")+'</div></div></div>';
  html+='<div style="height:2px;background:#111110;margin:0 0 24px 0"></div>';
  html+='<div style="font-size:9px;font-weight:700;color:#111110;letter-spacing:0.14em;text-transform:uppercase">LEADING BRANDS</div>';
  html+='<div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:1px;background:#B0ADA5">';
  html+=(d.leadingBrands||[]).map(function(b){return '<div style="background:#F4F3F0;padding:16px 20px"><div style="font-size:12px;font-weight:700;color:#111110;margin-bottom:4px">'+e((b.brand||"").toUpperCase())+'</div><div style="font-size:9px;color:#999590;margin-bottom:10px">'+e(b.position||"")+'</div>'+(b.standout?'<div style="font-size:8px;color:#999590;letter-spacing:0.14em;text-transform:uppercase">STANDOUT</div><div style="font-size:9px;color:#555350;margin-top:4px;line-height:1.5">'+e(b.standout)+'</div>':"")+'</div>';}).join("")+'</div>';
  el.innerHTML=html;
}
</script>
</body>
</html>`;
