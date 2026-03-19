'use strict';
const express = require("express");
const fetch = require("node-fetch");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3001;

app.post("/api/intelligence", async (req, res) => {
  const { systemPrompt, userPrompt } = req.body || {};
  if (!systemPrompt || !userPrompt) return res.status(400).json({ error: "Missing prompts" });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY not set" });
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: systemPrompt,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: userPrompt }]
      })
    });
    const raw = await r.text();
    if (!r.ok) {
      let msg = "Anthropic API error " + r.status;
      try { const j = JSON.parse(raw); if (j.error && j.error.message) msg = j.error.message; } catch (e) {}
      return res.status(r.status).json({ error: msg });
    }
    const data = JSON.parse(raw);
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
    if (!text) return res.status(500).json({ error: "No text in response" });
    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const m = clean.match(/\{[\s\S]*\}/);
    if (!m) return res.status(500).json({ error: "No JSON found" });
    return res.json(JSON.parse(m[0]));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("*", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(HTML);
});

app.listen(PORT, () => console.log("AI.5 on port " + PORT));

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>AI.5 // Brand Creative Intelligence</title>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,700&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{background:#F4F3F0;color:#111110;font-family:"IBM Plex Mono","Courier New",monospace;-webkit-font-smoothing:antialiased}
::-webkit-scrollbar{width:3px;background:#F4F3F0}
::-webkit-scrollbar-thumb{background:#CECBC4}
::selection{background:#111110;color:#F4F3F0}
input,textarea,button{font-family:"IBM Plex Mono","Courier New",monospace;outline:none}
button{cursor:pointer;background:none;border:none;color:inherit}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.2}}
@keyframes scan{0%{top:0}100%{top:100%}}
.grid-bg{background-image:linear-gradient(rgba(206,203,196,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(206,203,196,.4) 1px,transparent 1px);background-size:32px 32px}
.chip{font-size:9px;font-weight:500;letter-spacing:.13em;text-transform:uppercase;padding:4px 10px;border:1px solid #CECBC4;color:#999590;background:transparent;cursor:pointer}
.chip:hover{border-color:#111110;color:#111110}
.tag{font-size:9px;font-weight:500;letter-spacing:.13em;text-transform:uppercase;padding:4px 10px;border:1px solid #111110;color:#111110;background:#E2E0DB;display:inline-block}
.spinner{display:inline-block;width:13px;height:13px;border:1px solid #CECBC4;border-top:1px solid #C8231A;border-radius:50%;animation:spin .7s linear infinite;vertical-align:middle}
.led{display:inline-block;width:7px;height:7px;border-radius:50%}
.led-r{background:#C8231A;box-shadow:0 0 6px rgba(200,35,26,.5)}
.led-g{background:#1A7A3C;box-shadow:0 0 6px rgba(26,122,60,.5)}
.pulse{animation:pulse 2s ease infinite}
.blink{animation:blink 1.2s step-end infinite}
.nav-btn{font-size:9px;font-weight:500;letter-spacing:.16em;padding:10px 22px;color:#999590;background:transparent;border:none;border-right:1px solid #CECBC4;cursor:pointer}
.nav-btn.on{color:#111110;background:#ECEAE6}
.view{display:none;padding:40px 40px 80px}
.view.on{display:block}
.sbtn{position:absolute;right:0;top:0;bottom:0;padding:0 18px;background:#ECEAE6;color:#999590;font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;border:none;border-left:1px solid #CECBC4;cursor:not-allowed}
.sbtn.ok{background:#111110;color:#F4F3F0;cursor:pointer}
.wbtn{width:100%;padding:12px;background:#ECEAE6;color:#999590;font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;border:none;border-top:1px solid #CECBC4;cursor:not-allowed}
.wbtn.ok{background:#111110;color:#F4F3F0;cursor:pointer}
.panel{background:#ECEAE6;border:1px solid #CECBC4}
.ph{padding:8px 12px;border-bottom:1px solid #CECBC4;background:#E2E0DB;font-size:8px;color:#999590;letter-spacing:.14em;text-transform:uppercase}
.err{margin-top:16px;padding:12px 16px;border:1px solid #C8231A;border-left:3px solid #C8231A;background:#FDF5F4;font-size:9px;color:#C8231A}
.rh{cursor:pointer}
.rh:hover{background:#E2E0DB}
.al{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #CECBC4;background:#ECEAE6;margin-bottom:6px;text-decoration:none}
.al:hover{background:#E2E0DB}
.scan-line{position:relative;overflow:hidden}
.scan-line::after{content:"";position:absolute;left:0;right:0;height:2px;background:linear-gradient(transparent,rgba(200,35,26,.07),transparent);animation:scan 4s linear infinite;pointer-events:none}
</style>
</head>
<body>
<div id="app" class="grid-bg" style="min-height:100vh">
  <div style="background:#111110;height:24px;overflow:hidden;display:flex;align-items:center">
    <div id="ticker" style="display:flex;white-space:nowrap;animation:ticker 30s linear infinite"></div>
  </div>
  <div style="position:sticky;top:0;z-index:100;background:#F4F3F0;border-bottom:2px solid #111110;display:flex;align-items:stretch;justify-content:space-between;padding:0 40px">
    <div style="display:flex;align-items:center;padding:14px 0">
      <span style="font-size:14px;font-weight:700">AI</span>
      <span style="font-size:14px;font-weight:700;color:#C8231A">.</span>
      <span style="font-size:14px;font-weight:700">5</span>
      <span style="font-size:8px;color:#999590;letter-spacing:.14em;margin-left:10px;text-transform:uppercase">// Brand Intelligence</span>
    </div>
    <div style="display:flex;border:1px solid #CECBC4;border-bottom:none;margin-bottom:-2px">
      <button class="nav-btn on" id="nav-search" onclick="showView('search')">BRAND SEARCH</button>
      <button class="nav-btn" id="nav-brief" onclick="showView('brief')">BRIEF MATCH</button>
      <button class="nav-btn" id="nav-category" onclick="showView('category')">CATEGORY MAP</button>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <span class="led led-g pulse"></span>
      <span style="font-size:9px;font-weight:700;color:#1A7A3C;letter-spacing:.14em;text-transform:uppercase">ONLINE</span>
    </div>
  </div>
  <div id="view-search" class="view on" style="max-width:720px">
    <div style="margin-bottom:40px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <span class="led led-r pulse"></span>
        <span style="font-size:9px;font-weight:700;color:#C8231A;letter-spacing:.14em;text-transform:uppercase;margin-left:4px">BRAND INTELLIGENCE // LIVE FEED</span>
      </div>
      <div style="font-size:28px;font-weight:700;letter-spacing:-.03em;line-height:1.05;margin-bottom:10px">SEARCH ANY<br><span style="color:#C8231A">TARGET_<span class="blink">&#9608;</span></span></div>
      <span style="font-size:10px;font-weight:300;color:#999590">Real campaigns &middot; Real strategy &middot; Real agencies &middot; Pulled live from the web.</span>
    </div>
    <div class="panel">
      <div class="ph">SEARCH QUERY</div>
      <div style="position:relative;border-bottom:1px solid #CECBC4">
        <input id="bi" type="text" placeholder="Enter brand name..." oninput="ub()" onkeydown="if(event.key==='Enter')runBrand()" style="width:100%;background:#fff;border:none;padding:14px 120px 14px 16px;color:#111110;font-size:12px;letter-spacing:.04em"/>
        <button id="bb" class="sbtn" onclick="runBrand()">SEARCH &#8594;</button>
      </div>
      <input id="ch" type="text" placeholder="Category hint (optional)..." style="width:100%;background:transparent;border:none;padding:9px 16px;color:#555350;font-size:10px;letter-spacing:.03em"/>
    </div>
    <div id="sl" style="display:none;padding:40px 0">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
        <span class="spinner"></span>
        <span style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">RETRIEVING INTELLIGENCE...</span>
      </div>
      <div id="ss"></div>
    </div>
    <div id="se" class="err" style="display:none"></div>
    <div id="rw" style="margin-top:40px">
      <span style="font-size:8px;color:#999590;letter-spacing:.14em;text-transform:uppercase">RECENT TARGETS</span>
      <div id="rc" style="display:flex;gap:4px;flex-wrap:wrap;margin-top:12px"></div>
    </div>
    <div id="bp"></div>
  </div>
  <div id="view-brief" class="view">
    <div style="margin-bottom:36px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <span class="led led-r pulse"></span>
        <span style="font-size:9px;font-weight:700;color:#C8231A;letter-spacing:.14em;text-transform:uppercase;margin-left:4px">BRIEF MATCH ENGINE // ACTIVE</span>
      </div>
      <div style="font-size:28px;font-weight:700;letter-spacing:-.03em;line-height:1.05;margin-bottom:10px">SUBMIT<br><span style="color:#C8231A">BRIEF_<span class="blink">&#9608;</span></span></div>
      <span style="font-size:10px;font-weight:300;color:#999590">Paste your brief. Get best-in-class creative references from across industries.</span>
    </div>
    <div style="max-width:660px">
      <div class="panel">
        <div class="ph">BRIEF INPUT // CLASSIFIED</div>
        <textarea id="bri" oninput="ubr()" placeholder="ENTER BRIEF..." style="width:100%;min-height:180px;background:#fff;border:none;border-bottom:1px solid #CECBC4;padding:14px 16px;color:#111110;font-size:11px;line-height:1.8;resize:vertical;font-weight:300;letter-spacing:.02em"></textarea>
        <button id="brb" class="wbtn" onclick="runBrief()">MATCH TO CREATIVE REFERENCES &#8594;</button>
      </div>
    </div>
    <div id="brl" style="display:none;padding:40px 0">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
        <span class="spinner"></span>
        <span style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">ANALYSING BRIEF...</span>
      </div>
      <div id="brs"></div>
    </div>
    <div id="bre" class="err" style="display:none"></div>
    <div id="brr" style="display:none;margin-top:40px"></div>
  </div>
  <div id="view-category" class="view">
    <div style="margin-bottom:36px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <span class="led led-r pulse"></span>
        <span style="font-size:9px;font-weight:700;color:#C8231A;letter-spacing:.14em;text-transform:uppercase;margin-left:4px">CATEGORY LANDSCAPE // MAPPING</span>
      </div>
      <div style="font-size:28px;font-weight:700;letter-spacing:-.03em;line-height:1.05;margin-bottom:10px">MAP THE<br><span style="color:#C8231A">FIELD_<span class="blink">&#9608;</span></span></div>
      <span style="font-size:10px;font-weight:300;color:#999590">Enter any product category. Leaders &middot; Themes &middot; Whitespace &middot; Opportunity.</span>
    </div>
    <div style="max-width:560px;margin-bottom:24px">
      <div class="panel">
        <div class="ph">TARGET CATEGORY</div>
        <div style="position:relative">
          <input id="ci" type="text" placeholder="e.g. CRAFT BEER, ELECTRIC SUV..." oninput="uc()" onkeydown="if(event.key==='Enter')runCat()" style="width:100%;background:#fff;border:none;padding:13px 120px 13px 16px;color:#111110;font-size:11px;letter-spacing:.04em"/>
          <button id="cb" class="sbtn" style="padding:0 16px" onclick="runCat()">MAP &#8594;</button>
        </div>
      </div>
      <div id="cch" style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px"></div>
    </div>
    <div id="cl" style="display:none;padding:40px 0">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px">
        <span class="spinner"></span>
        <span style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">MAPPING CATEGORY...</span>
      </div>
      <div id="cs"></div>
    </div>
    <div id="ce" class="err" style="display:none"></div>
    <div id="cr" style="display:none;margin-top:0"></div>
  </div>
</div>
<script>
var recent = ["Asahi","Loewe","Oatly","Barclays","Patagonia","Netflix","Guinness","Chanel"];
var _pd = null, _openRow = null, _activeType = "All";

function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function xe(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&apos;");
}

function showView(v) {
  ["search","brief","category"].forEach(function(id) {
    document.getElementById("view-"+id).classList.toggle("on", id===v);
    document.getElementById("nav-"+id).classList.toggle("on", id===v);
  });
}

function ub()  { document.getElementById("bb").classList.toggle("ok",  !!document.getElementById("bi").value.trim()); }
function ubr() { document.getElementById("brb").classList.toggle("ok", !!document.getElementById("bri").value.trim()); }
function uc()  { document.getElementById("cb").classList.toggle("ok",  !!document.getElementById("ci").value.trim()); }

function runSteps(cid, arr) {
  var el = document.getElementById(cid);
  el.innerHTML = "";
  arr.forEach(function(s, i) {
    var d = document.createElement("div");
    d.id = cid + "_" + i;
    d.style.cssText = "display:flex;gap:12px;padding:5px 0;opacity:.15;transition:opacity .4s";
    d.innerHTML = '<span style="font-size:9px;font-weight:700;color:#999590">[..]</span><span style="font-size:9px;color:#999590">' + esc(s) + '</span>';
    el.appendChild(d);
  });
  var cur = 0;
  function tick() {
    if (cur > 0) {
      var p = document.getElementById(cid + "_" + (cur-1));
      if (p) { p.style.opacity="1"; p.children[0].style.color="#1A7A3C"; p.children[0].textContent="[OK]"; }
    }
    if (cur < arr.length) {
      var e2 = document.getElementById(cid + "_" + cur);
      if (e2) { e2.style.opacity="1"; e2.children[0].style.color="#C8231A"; e2.children[0].textContent="[>>]"; e2.children[1].style.color="#111110"; }
      cur++; setTimeout(tick, 1800);
    }
  }
  tick();
}

async function callAPI(sys, usr) {
  var r = await fetch("/api/intelligence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ systemPrompt: sys, userPrompt: usr })
  });
  var d = await r.json();
  if (!r.ok || d.error) throw new Error(d.error || "Server error " + r.status);
  return d;
}

var SB  = "You are a brand creative intelligence analyst. Use web_search to find real advertising campaigns. Return ONLY a raw JSON object with no markdown, no code fences, no explanation.";
var SBR = "You are a senior creative strategist. Use web_search to find brand creative references. Return ONLY a raw JSON object with no markdown, no code fences, no explanation.";
var SC  = "You are a brand intelligence analyst. Use web_search to map category creative landscapes. Return ONLY a raw JSON object with no markdown, no code fences, no explanation.";

var bBusy = false;
async function runBrand() {
  var name = document.getElementById("bi").value.trim();
  if (!name || bBusy) return;
  var cat = document.getElementById("ch").value.trim();
  bBusy = true;
  document.getElementById("sl").style.display = "block";
  document.getElementById("se").style.display = "none";
  document.getElementById("rw").style.display = "none";
  document.getElementById("bp").innerHTML = "";
  runSteps("ss", ["SEARCHING WEB FOR CAMPAIGNS","LOCATING CAMPAIGN ASSETS","ANALYSING CREATIVE STRATEGY","COMPILING INTELLIGENCE FILE"]);
  try {
    var prompt = 'Search the web for advertising campaigns and creative strategy of "' + name + '"';
    if (cat) prompt += ' (' + cat + ')';
    prompt += '. Also search for the brand logo SVG or PNG URL and for reception/impact data for each campaign (awards won, views, press scores, effectiveness stats). Return ONLY this raw JSON: {"brand":"","category":"","tagline":"","headquarterCountry":"","brandDomain":"","logoUrl":"","appeal":[""],"creativeThemes":[""],"ignobility":{"overallScore":72,"label":"","breakdown":[{"dimension":"CULTURAL IMPACT","score":80,"evidence":""},{"dimension":"CREATIVE ORIGINALITY","score":75,"evidence":""},{"dimension":"AUDIENCE RECEPTION","score":68,"evidence":""},{"dimension":"AWARDS RECOGNITION","score":65,"evidence":""},{"dimension":"COMMERCIAL EFFECTIVENESS","score":70,"evidence":""}],"verdict":""},"campaigns":[{"title":"","year":2023,"type":"TV","market":"","description":"","mood":"","agency":"","awards":"","reach":"","visualStyle":"","palette":["#hex"],"links":[{"type":"TVC","label":"","url":""}]}],"competitiveContext":"","recentDirection":""}. The ignobility score is 0-100 where 100 means universally celebrated. Base it on real data where possible. Include 4-7 real campaigns. Only include link objects where you found a real URL.';
    var data = await callAPI(SB, prompt);
    recent = [name].concat(recent.filter(function(r) { return r.toLowerCase() !== name.toLowerCase(); })).slice(0, 8);
    renderRecent();
    document.getElementById("sl").style.display = "none";
    _pd = data; _openRow = null; _activeType = "All";
    drawProfile();
  } catch(err) {
    document.getElementById("sl").style.display = "none";
    document.getElementById("se").style.display = "block";
    document.getElementById("se").textContent = "RETRIEVAL FAILED -- " + err.message;
    document.getElementById("rw").style.display = "block";
  }
  bBusy = false;
}

function setType(t) { _activeType = t; _openRow = null; drawProfile(); }
function togRow(i)  { _openRow = (_openRow === i) ? null : i; drawProfile(); }
function backToSearch() { document.getElementById("bp").innerHTML = ""; document.getElementById("rw").style.display = "block"; }

function logoFallback(img) {
  var init = (_pd && _pd.brand) ? _pd.brand.substring(0,2).toUpperCase() : "??";
  img.parentNode.innerHTML = '<span style="font-size:18px;font-weight:700;color:#CECBC4">' + init + '</span>';
}

function downloadLogo() {
  var d = _pd;
  if (!d) return;
  var logoSrc = "";
  if (d.logoUrl && d.logoUrl.indexOf("http") === 0) {
    logoSrc = d.logoUrl;
  } else if (d.brandDomain) {
    logoSrc = "https://logo.clearbit.com/" + d.brandDomain;
  }
  if (!logoSrc) { alert("No logo URL found for this brand."); return; }
  var a = document.createElement("a");
  a.href = logoSrc;
  a.download = (d.brand||"brand").toLowerCase().replace(/\s+/g, "-") + "-logo";
  a.target = "_blank";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function drawProfile() {
  var d = _pd;
  var camps = d.campaigns || [];
  var types = ["All"].concat(camps.map(function(c){return c.type;}).filter(function(v,i,a){return a.indexOf(v)===i;}));
  var shown = _activeType === "All" ? camps : camps.filter(function(c){return c.type===_activeType;});
  var h = "";

  h += '<button onclick="backToSearch()" style="display:inline-flex;align-items:center;gap:8px;margin-bottom:32px;padding:0">';
  h += '<span style="font-size:9px;color:#999590;letter-spacing:.14em;text-transform:uppercase">&#8592; RETURN TO SEARCH</span></button>';

  // Header: logo + brand name + status
  h += '<div class="scan-line" style="border-top:2px solid #111110;border-bottom:1px solid #CECBC4;padding:20px 0;margin-bottom:32px;display:flex;align-items:flex-start;justify-content:space-between;gap:20px">';
  h += '<div style="display:flex;align-items:center;gap:20px">';
  h += '<div style="width:72px;height:72px;background:#fff;border:1px solid #CECBC4;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden">';

  var logoSrc = "";
  if (d.logoUrl && d.logoUrl.indexOf("http") === 0) logoSrc = d.logoUrl;
  else if (d.brandDomain) logoSrc = "https://logo.clearbit.com/" + d.brandDomain;

  if (logoSrc) {
    h += '<img src="' + esc(logoSrc) + '" alt="logo" style="max-width:64px;max-height:64px;object-fit:contain" onerror="logoFallback(this)">';
  } else {
    h += '<span style="font-size:18px;font-weight:700;color:#CECBC4">' + esc((d.brand||"").substring(0,2).toUpperCase()) + '</span>';
  }

  h += '</div><div>';
  h += '<div style="font-size:10px;font-weight:500;color:#999590;letter-spacing:.2em;text-transform:uppercase;margin-bottom:8px">INTELLIGENCE FILE // ' + esc((d.category||"").toUpperCase()) + '</div>';
  h += '<div style="font-size:26px;font-weight:700;letter-spacing:-.02em">' + esc((d.brand||"").toUpperCase()) + '</div>';
  if (logoSrc) {
    h += '<button onclick="downloadLogo()" style="display:inline-flex;align-items:center;gap:5px;margin-top:8px;padding:5px 10px;background:#ECEAE6;border:1px solid #CECBC4;cursor:pointer;font-family:inherit">';
    h += '<span style="font-size:8px;color:#555350;letter-spacing:.12em;text-transform:uppercase">&#8595; DOWNLOAD LOGO</span></button>';
  }
  h += '</div></div>';

  h += '<div style="display:flex;flex-direction:column;gap:10px;align-items:flex-end">';
  h += '<div style="display:flex;align-items:center;gap:8px"><span class="led led-g"></span>';
  h += '<span style="font-size:9px;color:#1A7A3C;letter-spacing:.14em;text-transform:uppercase">ACTIVE PROFILE</span></div>';
  h += '<span style="font-size:9px;color:#999590">' + esc(d.headquarterCountry||"") + '</span>';
  h += '</div></div>';

  // Brand meta: positioning + themes + context
  h += '<div style="display:grid;grid-template-columns:1fr 260px;gap:44px;margin-bottom:40px">';
  h += '<div>';
  h += '<div style="border-left:2px solid #C8231A;padding-left:14px;margin-bottom:20px">';
  h += '<div style="font-size:8px;color:#999590;letter-spacing:.14em;text-transform:uppercase">POSITIONING</div>';
  h += '<div style="font-size:13px;font-weight:300;font-style:italic;color:#555350;margin-top:6px;line-height:1.55">"' + esc(d.tagline||"") + '"</div></div>';
  h += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:20px">';
  (d.appeal||[]).forEach(function(a){ h += '<span class="tag">' + esc(a) + '</span>'; });
  h += '</div>';
  h += '<div style="background:#ECEAE6;border:1px solid #CECBC4;padding:14px 16px">';
  h += '<div style="font-size:8px;color:#999590;letter-spacing:.14em;text-transform:uppercase">CURRENT DIRECTION</div>';
  h += '<p style="font-size:11px;font-weight:300;color:#555350;margin-top:8px;line-height:1.7">' + esc(d.recentDirection||"") + '</p></div></div>';
  h += '<div style="border-left:1px solid #CECBC4;padding-left:24px">';
  h += '<div style="font-size:8px;color:#999590;letter-spacing:.14em;text-transform:uppercase">CREATIVE TERRITORIES</div>';
  h += '<div style="margin-top:10px">';
  (d.creativeThemes||[]).forEach(function(t,i){
    h += '<div style="display:flex;gap:10px;padding:7px 0;border-bottom:1px solid #CECBC4">';
    h += '<span style="font-size:9px;font-weight:700;color:#C8231A">' + String(i+1).padStart(2,"0") + '</span>';
    h += '<span style="font-size:10px;color:#555350">' + esc(t) + '</span></div>';
  });
  h += '</div>';
  h += '<div style="height:1px;background:#CECBC4;margin:18px 0"></div>';
  h += '<div style="font-size:8px;color:#999590;letter-spacing:.14em;text-transform:uppercase">VS COMPETITION</div>';
  h += '<p style="font-size:10px;font-weight:300;color:#555350;margin-top:8px;line-height:1.7">' + esc(d.competitiveContext||"") + '</p>';
  h += '</div></div>';

  // IGNOBILITY SECTION
  var ign = d.ignobility;
  if (ign) {
    var overall = parseInt(ign.overallScore) || 0;
    var barColor = overall >= 75 ? "#1A7A3C" : overall >= 50 ? "#C8231A" : "#999590";
    h += '<div style="border:1px solid #CECBC4;background:#ECEAE6;margin-bottom:40px">';
    h += '<div style="padding:12px 16px;border-bottom:1px solid #CECBC4;background:#E2E0DB;display:flex;align-items:center;justify-content:space-between">';
    h += '<div style="display:flex;align-items:center;gap:10px"><span class="led led-r pulse"></span>';
    h += '<span style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">IGNOBILITY RATING // CAMPAIGN RECEPTION ANALYSIS</span></div>';
    h += '<div style="display:flex;align-items:baseline;gap:6px">';
    h += '<span style="font-size:28px;font-weight:700;color:' + barColor + ';line-height:1">' + overall + '</span>';
    h += '<span style="font-size:9px;color:#999590">/100</span>';
    if (ign.label) h += '<span style="font-size:9px;font-weight:700;color:' + barColor + ';letter-spacing:.1em;text-transform:uppercase;margin-left:8px">' + esc(ign.label) + '</span>';
    h += '</div></div>';

    // Overall bar
    h += '<div style="padding:16px 20px;border-bottom:1px solid #CECBC4">';
    h += '<div style="height:6px;background:#CECBC4;width:100%">';
    h += '<div style="height:6px;background:' + barColor + ';width:' + overall + '%;transition:width 1s ease"></div></div>';
    h += '</div>';

    // Breakdown bars
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0">';
    (ign.breakdown||[]).forEach(function(b, bi) {
      var sc = parseInt(b.score) || 0;
      var bc = sc >= 75 ? "#1A7A3C" : sc >= 50 ? "#C8231A" : "#999590";
      var isRight = bi % 2 === 1;
      h += '<div style="padding:14px 20px;border-bottom:1px solid #CECBC4' + (isRight ? '' : ';border-right:1px solid #CECBC4') + '">';
      h += '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px">';
      h += '<span style="font-size:8px;color:#999590;letter-spacing:.12em;text-transform:uppercase">' + esc(b.dimension||"") + '</span>';
      h += '<span style="font-size:14px;font-weight:700;color:' + bc + '">' + sc + '</span></div>';
      h += '<div style="height:3px;background:#CECBC4;margin-bottom:8px">';
      h += '<div style="height:3px;background:' + bc + ';width:' + sc + '%"></div></div>';
      if (b.evidence) h += '<p style="font-size:9px;font-weight:300;color:#555350;line-height:1.6">' + esc(b.evidence) + '</p>';
      h += '</div>';
    });
    h += '</div>';

    if (ign.verdict) {
      h += '<div style="padding:14px 20px;border-top:1px solid #CECBC4;background:#F4F3F0">';
      h += '<span style="font-size:8px;color:#999590;letter-spacing:.12em;text-transform:uppercase">VERDICT // </span>';
      h += '<span style="font-size:10px;font-weight:300;color:#555350;font-style:italic">' + esc(ign.verdict) + '</span>';
      h += '</div>';
    }
    h += '</div>';
  }

  // Campaign table
  h += '<div style="border:1px solid #CECBC4;background:#ECEAE6">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #CECBC4;background:#E2E0DB">';
  h += '<div style="display:flex;align-items:center;gap:10px"><span class="led led-r pulse"></span>';
  h += '<span style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">CAMPAIGN INTELLIGENCE -- ' + shown.length + ' RECORDS</span></div>';
  h += '<div style="display:flex;gap:3px">';
  types.forEach(function(t) {
    h += '<button class="chip' + (t===_activeType ? ' tag' : '') + '" data-type="' + esc(t) + '" onclick="setType(this.dataset.type)">' + esc(t) + '</button>';
  });
  h += '</div></div>';
  h += '<div style="display:grid;grid-template-columns:28px 1fr 80px 80px 50px;gap:12px;padding:8px 16px;border-bottom:1px solid #CECBC4">';
  ["REF","OPERATION","FORMAT","MARKET","YEAR"].forEach(function(lbl){
    h += '<span style="font-size:8px;color:#999590;letter-spacing:.14em;text-transform:uppercase">' + lbl + '</span>';
  });
  h += '</div><div>';

  shown.forEach(function(c, i) {
    h += '<div style="border-bottom:1px solid #CECBC4">';
    h += '<div class="rh" data-row="' + i + '" onclick="togRow(parseInt(this.dataset.row))" style="display:grid;grid-template-columns:28px 1fr 80px 80px 50px;gap:12px;padding:12px 16px">';
    h += '<span style="font-size:9px;font-weight:700;color:#C8231A">' + String(i+1).padStart(2,"0") + '</span>';
    h += '<div><div style="font-size:11px;font-weight:500;letter-spacing:.02em">' + esc(c.title||"") + '</div>';
    if (c.agency && c.agency !== "Unknown") h += '<div style="font-size:9px;color:#999590">' + esc(c.agency) + '</div>';
    h += '</div>';
    h += '<span style="font-size:9px;color:#555350;text-transform:uppercase">' + esc(c.type||"") + '</span>';
    h += '<span style="font-size:9px;color:#555350">' + esc(c.market||"") + '</span>';
    h += '<span style="font-size:9px;font-weight:700;color:#555350">' + esc(String(c.year||"")) + '</span>';
    h += '</div>';

    if (_openRow === i) {
      h += '<div style="background:#F4F3F0;border-top:1px solid #CECBC4">';
      h += '<div style="padding:20px 20px 16px 56px;border-bottom:1px solid #CECBC4">';
      h += '<p style="font-size:11px;font-weight:300;color:#555350;line-height:1.75;max-width:580px;margin-bottom:16px">' + esc(c.description||"") + '</p>';
      h += '<div style="display:flex;gap:28px;flex-wrap:wrap">';
      if (c.mood) h += '<div><div style="font-size:8px;color:#999590;letter-spacing:.12em;text-transform:uppercase">TONE</div><div style="font-size:10px;margin-top:4px">' + esc(c.mood) + '</div></div>';
      if (c.reach && c.reach !== "unknown") h += '<div><div style="font-size:8px;color:#999590;letter-spacing:.12em;text-transform:uppercase">REACH</div><div style="font-size:10px;margin-top:4px">' + esc(c.reach) + '</div></div>';
      if (c.awards && c.awards !== "none") h += '<div><div style="font-size:8px;color:#999590;letter-spacing:.12em;text-transform:uppercase">AWARDS</div><div style="font-size:10px;color:#C8231A;font-weight:500;margin-top:4px">' + esc(c.awards) + '</div></div>';
      h += '</div></div>';

      h += '<div style="padding:16px 20px 20px 56px">';
      h += '<div style="font-size:8px;color:#999590;letter-spacing:.14em;text-transform:uppercase;margin-bottom:12px">CAMPAIGN ASSETS // MOODBOARD</div>';
      h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">';

      h += '<div>';
      if (c.visualStyle) {
        h += '<div style="background:#ECEAE6;border:1px solid #CECBC4;padding:14px 16px;margin-bottom:12px">';
        h += '<div style="font-size:8px;color:#999590;letter-spacing:.12em;text-transform:uppercase;margin-bottom:8px">VISUAL LANGUAGE</div>';
        h += '<p style="font-size:10px;font-weight:300;color:#555350;line-height:1.65">' + esc(c.visualStyle) + '</p>';
        h += '</div>';
      }
      if (c.palette && c.palette.length) {
        h += '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">';
        h += '<div style="font-size:8px;color:#999590;letter-spacing:.12em;text-transform:uppercase;width:100%;margin-bottom:4px">PALETTE</div>';
        (c.palette||[]).forEach(function(col) {
          if (!col || col === "#hex") return;
          h += '<div title="' + esc(col) + '" style="width:28px;height:28px;background:' + esc(col) + ';border:1px solid rgba(0,0,0,.1)"></div>';
          h += '<span style="font-size:8px;color:#999590">' + esc(col) + '</span>';
        });
        h += '</div>';
      }
      h += '</div>';

      h += '<div>';
      var ticons = { TVC: "&#9654;", OOH: "&#9632;", SOCIAL: "&#9670;", PRESS: "&#9656;" };
      var tcols  = { TVC: "#C8231A", OOH: "#1A7A3C", SOCIAL: "#555350", PRESS: "#999590" };
      var links = (c.links||[]).filter(function(l){ return l && l.url && l.url.indexOf("http") === 0; });
      if (links.length) {
        links.forEach(function(l) {
          var icon = ticons[l.type] || "&#9656;";
          var lc = tcols[l.type] || "#555350";
          h += '<a href="' + esc(l.url) + '" target="_blank" rel="noopener" class="al">';
          h += '<span style="font-size:10px;color:' + lc + ';flex-shrink:0">' + icon + '</span>';
          h += '<div style="min-width:0"><div style="font-size:8px;font-weight:700;color:' + lc + ';letter-spacing:.12em;text-transform:uppercase">' + esc(l.type) + '</div>';
          h += '<div style="font-size:9px;color:#555350;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(l.label||l.url) + '</div></div>';
          h += '<span style="margin-left:auto;font-size:9px;color:#CECBC4;flex-shrink:0">&#8599;</span></a>';
        });
      } else {
        h += '<div style="padding:14px 16px;border:1px solid #CECBC4;background:#ECEAE6;font-size:9px;color:#999590">No asset links retrieved.</div>';
      }
      h += '</div>';
      h += '</div></div></div>';
    }
    h += '</div>';
  });

  h += '</div></div>';
  document.getElementById("bp").innerHTML = h;
}

var brBusy = false;
async function runBrief() {
  var brief = document.getElementById("bri").value.trim();
  if (!brief || brBusy) return;
  brBusy = true;
  document.getElementById("brl").style.display = "block";
  document.getElementById("bre").style.display = "none";
  document.getElementById("brr").style.display = "none";
  runSteps("brs", ["READING STRATEGIC TERRITORY","SEARCHING CREATIVE LANDSCAPE","SCORING BRAND REFERENCES","COMPILING MATCHES"]);
  try {
    var prompt = 'Analyse this creative brief and find 4 brand advertising references that are the best creative match. Brief: "' + brief + '". Return ONLY this raw JSON: {"analysis":"","territory":"","matches":[{"brand":"","category":"","score":88,"why":"","keyWork":"","lesson":"","brandColor":"#C8231A"}]}';
    var data = await callAPI(SBR, prompt);
    document.getElementById("brl").style.display = "none";
    renderBrief(data);
  } catch(err) {
    document.getElementById("brl").style.display = "none";
    document.getElementById("bre").style.display = "block";
    document.getElementById("bre").textContent = err.message;
  }
  brBusy = false;
}

function renderBrief(d) {
  var el = document.getElementById("brr");
  el.style.display = "block";
  var h = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:48px">';
  h += '<div><div style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">STRATEGIC READ</div>';
  h += '<p style="font-size:11px;font-weight:300;color:#555350;line-height:1.75;margin-top:10px">' + esc(d.analysis||"") + '</p>';
  if (d.territory) {
    h += '<div style="margin-top:12px;display:inline-flex;align-items:center;gap:8px;border:1px solid #CECBC4;padding:6px 12px;background:#ECEAE6">';
    h += '<span class="led led-r"></span><span style="font-size:8px;color:#999590;letter-spacing:.12em;text-transform:uppercase">TERRITORY -- <strong style="color:#111110">' + esc(d.territory) + '</strong></span></div>';
  }
  h += '</div>';
  h += '<div style="border-left:1px solid #CECBC4;padding-left:36px">';
  h += '<div style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">REFERENCES -- ' + (d.matches||[]).length + '</div>';
  h += '<div style="margin-top:14px">';
  (d.matches||[]).forEach(function(m) {
    h += '<div style="padding:16px 0;border-bottom:1px solid #CECBC4">';
    h += '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px">';
    h += '<div style="display:flex;align-items:baseline;gap:10px">';
    h += '<span style="font-size:13px;font-weight:700">' + esc((m.brand||"").toUpperCase()) + '</span>';
    h += '<span style="font-size:8px;color:#999590;text-transform:uppercase">' + esc(m.category||"") + '</span></div>';
    h += '<span style="font-size:20px;font-weight:700;color:' + esc(m.brandColor||"#C8231A") + '">' + esc(String(m.score||"")) + '<span style="font-size:9px">%</span></span></div>';
    h += '<p style="font-size:10px;font-weight:300;color:#555350;line-height:1.7;margin-bottom:9px">' + esc(m.why||"") + '</p>';
    if (m.keyWork) h += '<div style="font-size:9px;color:#999590;margin-bottom:4px">KEY WORK -- <span style="color:#C8231A">' + esc(m.keyWork) + '</span></div>';
    if (m.lesson)  h += '<div style="font-size:9px;color:#999590;font-style:italic">&#8594; ' + esc(m.lesson) + '</div>';
    h += '</div>';
  });
  h += '</div></div></div>';
  el.innerHTML = h;
}

var cBusy = false;
async function runCat() {
  var cat = document.getElementById("ci").value.trim();
  if (!cat || cBusy) return;
  cBusy = true;
  document.getElementById("cl").style.display = "block";
  document.getElementById("ce").style.display = "none";
  document.getElementById("cr").style.display = "none";
  runSteps("cs", ["IDENTIFYING CATEGORY LEADERS","SCANNING CAMPAIGN LANDSCAPE","EXTRACTING CREATIVE THEMES","LOCATING WHITESPACE"]);
  try {
    var prompt = 'Search the web for the creative advertising landscape in the "' + cat + '" category. Return ONLY this raw JSON: {"category":"' + cat + '","summary":"","dominantThemes":[""],"leadingBrands":[{"brand":"","position":"","standout":"","brandColor":"#hex"}],"whitespace":"","trend":""}';
    var data = await callAPI(SC, prompt);
    document.getElementById("cl").style.display = "none";
    renderCat(data);
  } catch(err) {
    document.getElementById("cl").style.display = "none";
    document.getElementById("ce").style.display = "block";
    document.getElementById("ce").textContent = err.message;
  }
  cBusy = false;
}

function renderCat(d) {
  var el = document.getElementById("cr");
  el.style.display = "block";
  var h = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:44px;margin-bottom:36px">';
  h += '<div><div style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">OVERVIEW -- ' + esc((d.category||"").toUpperCase()) + '</div>';
  h += '<p style="font-size:11px;font-weight:300;color:#555350;line-height:1.75;margin-top:12px">' + esc(d.summary||"") + '</p>';
  if (d.trend) {
    h += '<div style="margin-top:18px;padding:13px 16px;border-left:3px solid #C8231A;background:#ECEAE6">';
    h += '<div style="font-size:8px;font-weight:700;color:#C8231A;text-transform:uppercase">DOMINANT TREND</div>';
    h += '<div style="font-size:11px;font-weight:300;margin-top:6px;line-height:1.55">' + esc(d.trend) + '</div></div>';
  }
  if (d.whitespace) {
    h += '<div style="margin-top:10px;padding:13px 16px;border-left:3px solid #111110;background:#ECEAE6">';
    h += '<div style="font-size:8px;color:#999590;text-transform:uppercase">CREATIVE WHITESPACE</div>';
    h += '<div style="font-size:11px;font-weight:300;color:#555350;margin-top:6px;line-height:1.55">' + esc(d.whitespace) + '</div></div>';
  }
  h += '</div><div>';
  h += '<div style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">CREATIVE THEMES</div>';
  h += '<div style="margin-top:12px">';
  (d.dominantThemes||[]).forEach(function(t,i){
    h += '<div style="display:flex;gap:12px;padding:9px 0;border-bottom:1px solid #CECBC4">';
    h += '<span style="font-size:9px;font-weight:700;color:#C8231A">' + String(i+1).padStart(2,"0") + '</span>';
    h += '<span style="font-size:10px">' + esc(t) + '</span></div>';
  });
  h += '</div></div></div>';
  h += '<div style="height:2px;background:#111110;margin:0 0 24px"></div>';
  h += '<div style="font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">LEADING BRANDS</div>';
  h += '<div style="margin-top:14px;display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:1px;background:#B0ADA5">';
  (d.leadingBrands||[]).forEach(function(b){
    h += '<div style="background:#F4F3F0;padding:16px 20px">';
    h += '<div style="font-size:12px;font-weight:700;margin-bottom:4px">' + esc((b.brand||"").toUpperCase()) + '</div>';
    h += '<div style="font-size:9px;color:#999590;margin-bottom:10px">' + esc(b.position||"") + '</div>';
    if (b.standout) {
      h += '<div style="font-size:8px;color:#999590;text-transform:uppercase">STANDOUT</div>';
      h += '<div style="font-size:9px;color:#555350;margin-top:4px;line-height:1.5">' + esc(b.standout) + '</div>';
    }
    h += '</div>';
  });
  h += '</div>';
  el.innerHTML = h;
}

function renderRecent() {
  var el = document.getElementById("rc");
  el.innerHTML = "";
  recent.forEach(function(r) {
    var b = document.createElement("button");
    b.className = "chip"; b.textContent = r;
    b.onclick = function() { document.getElementById("bi").value = r; ub(); runBrand(); };
    el.appendChild(b);
  });
}

(function init() {
  var tk = document.getElementById("ticker");
  ["LIVE INTELLIGENCE FEED //","BRAND CREATIVE DATABASE //","REAL-TIME WEB SEARCH //","CLASSIFICATION: UNRESTRICTED //","AI.5 SYSTEM ONLINE //","ALL MARKETS // ALL MEDIA // ALL CATEGORIES //"].forEach(function(t, i) {
    var s = document.createElement("span");
    s.style.cssText = "font-size:8px;font-weight:500;letter-spacing:.2em;padding-right:48px;color:" + (i%5===0 ? "#C8231A" : "#555555");
    s.textContent = t;
    tk.appendChild(s);
  });
  Array.from(tk.children).forEach(function(c) { tk.appendChild(c.cloneNode(true)); });
  renderRecent();
  var cch = document.getElementById("cch");
  ["Craft Beer","Luxury Fashion","Electric Vehicles","Fintech","Sportswear","Streaming","Beauty","Spirits"].forEach(function(q) {
    var b = document.createElement("button");
    b.className = "chip"; b.textContent = q;
    b.onclick = function() { document.getElementById("ci").value = q; uc(); runCat(); };
    cch.appendChild(b);
  });
})();
</script>
</body>
</html>`;
