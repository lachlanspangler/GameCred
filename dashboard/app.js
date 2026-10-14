/* GameCred dashboard — vanilla JS, no dependencies. Data: window.GAMECRED (dashboard/data.js).
 * All data-derived strings are inserted with textContent (via h()/s()), never innerHTML. */
(() => {
"use strict";
const D = window.GAMECRED;
if (!D) { document.body.textContent = "dashboard/data.js not found — run `python -m gamecred export`."; return; }
const MECH = D.taxonomy.mechanics;
const FAMS = D.taxonomy.families;
const HYBRIDS = Object.keys(MECH).filter(m => MECH[m].subfamily === "hybrids");
const GAMES = D.games;
const BY_ID = new Map(GAMES.map(g => [g.id, g]));
const AN = D.analysis;

// ---------- DOM helpers ----------
const SVGNS = "http://www.w3.org/2000/svg";
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "style") el.style.cssText = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}
function s(tag, attrs, ...kids) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null) continue;
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v);
  }
  for (const c of kids.flat()) if (c != null) el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return el;
}
const $ = sel => document.querySelector(sel);
const put = (el, ...kids) => el.replaceChildren(...kids.flat().filter(k => k != null && k !== false));
const fmt = {
  n: x => x == null ? "–" : x >= 1e9 ? (x / 1e9).toFixed(1) + "B" : x >= 1e6 ? (x / 1e6).toFixed(1) + "M" : x >= 1e3 ? (x / 1e3).toFixed(x >= 1e4 ? 0 : 1) + "K" : String(Math.round(x)),
  usd: x => x == null ? "–" : "$" + fmt.n(x),
  pct: x => x == null ? "–" : Math.round(x * 100) + "%",
  d1: x => x == null || isNaN(x) ? "–" : (x > 0 ? "+" : "") + x.toFixed(1),
  f1: x => x == null || isNaN(x) ? "–" : x.toFixed(1),
  f2: x => x == null || isNaN(x) ? "–" : x.toFixed(2),
};
const mname = id => (MECH[id] || { name: id }).name;
const famName = id => (FAMS.find(f => f.id === id) || { name: id }).name;

// ---------- tooltip ----------
const TT = $("#tooltip");
function tip(ev, value, label, extra) {
  put(TT, h("div", { class: "tv" }, value), label ? h("div", { class: "tl" }, label) : null,
    ...(extra || []).map(e => h("div", { class: "tl" }, e)));
  TT.classList.add("on");
  const x = Math.min(ev.clientX + 14, innerWidth - 330), y = Math.min(ev.clientY + 14, innerHeight - 120);
  TT.style.left = x + "px"; TT.style.top = y + "px";
}
const untip = () => TT.classList.remove("on");
function hover(el, fn) {
  el.addEventListener("pointermove", ev => { const [v, l, e] = fn(); tip(ev, v, l, e); });
  el.addEventListener("pointerleave", untip);
  el.setAttribute("tabindex", "0");
  el.addEventListener("focus", () => { const r = el.getBoundingClientRect(); const [v, l, e] = fn(); tip({ clientX: r.right, clientY: r.top }, v, l, e); });
  el.addEventListener("blur", untip);
}

// ---------- state & slicing ----------
const state = { sub: "", year: 0, rev: 0, conf: 0, out: "gsi", w: { q: 40, c: 45, k: 15, e: 0 }, adjust: true, view: "overview" };
const OUT_LABEL = { gsi: "Success Index", q: "Quality pct", c: "Commercial pct", k: "Critic pct", e: "Community pct" };

function outcome(g) {
  if (state.out !== "gsi") return g[state.out];
  const parts = [[g.q, state.w.q], [g.c, state.w.c], [g.k, state.w.k], [g.e, state.w.e]].filter(([v, w]) => v != null && w > 0);
  const ws = parts.reduce((a, [, w]) => a + w, 0);
  return ws ? parts.reduce((a, [v, w]) => a + v * w, 0) / ws : null;
}
function mechConf(g, mid) { const m = g.m[mid]; return m ? m[1] / 10 : 0; }
function has(g, mid) { const m = g.m[mid]; return !!m && m[1] / 10 >= state.conf - 1e-9; }
function inten(g, mid) { return has(g, mid) ? g.m[mid][0] : 0; }

function slice() {
  return GAMES.filter(g => (!state.sub || g.sg === state.sub) && (!state.year || (g.y || 0) >= state.year)
    && (g.rv || 0) >= state.rev && (state.conf < 1 || g.src === "curated"))
    .map(g => ({ g, y: outcome(g) })).filter(r => r.y != null);
}

function quantile(sorted, q) {
  if (!sorted.length) return NaN;
  const p = (sorted.length - 1) * q, lo = Math.floor(p), hi = Math.ceil(p);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (p - lo);
}
const mean = a => a.reduce((x, y) => x + y, 0) / (a.length || 1);
const variance = a => { const m = mean(a); return a.reduce((x, y) => x + (y - m) ** 2, 0) / Math.max(a.length - 1, 1); };

function ridgeScope() {
  if (state.sub && AN.subgenres[state.sub]) return AN.subgenres[state.sub];
  if (state.conf >= 1) return AN.scopes.curated;
  if (state.conf > 0) return AN.scopes.high_conf;
  if (state.out === "q") return AN.scopes["all:quality_pct"];
  if (state.out === "c") return AN.scopes["all:commercial_pct"];
  return AN.scopes.all;
}

/** Live with/without analysis on the current slice (Welch CI). Ridge partial effects come from the nearest precomputed scope. */
let _cache = null;
function impact() {
  const key = JSON.stringify([state.sub, state.year, state.rev, state.conf, state.out, state.w, state.adjust]);
  if (_cache && _cache.key === key) return _cache.val;
  const rows = slice();
  const ys = rows.map(r => r.y).sort((a, b) => a - b);
  const hitT = quantile(ys, 0.75), flopT = quantile(ys, 0.25);
  const scope = ridgeScope();
  const rc = new Map(((scope && scope.ridge && scope.ridge.coefs) || []).map(c => [c.feature, c]));
  const pre = new Map(((scope && scope.mechanics) || []).map(r => [r.mechanic, r]));
  const out = [];
  // Strata: tag source x (optionally) documentation-depth tertile. Curated and well-documented games are both
  // better known and more richly tagged, so comparisons are made within comparable games (see Method).
  const strataOf = new Map();
  for (const src of ["curated", "auto"]) {
    const grp = rows.filter(r => (r.g.src === "curated") === (src === "curated"));
    const counts = grp.map(r => Object.values(r.g.m).filter(v => v[1] / 10 >= state.conf - 1e-9).length).sort((a, b) => a - b);
    const c1 = quantile(counts, 1 / 3), c2 = quantile(counts, 2 / 3);
    for (const r of grp) {
      const n = Object.values(r.g.m).filter(v => v[1] / 10 >= state.conf - 1e-9).length;
      strataOf.set(r, state.adjust && grp.length >= 9 ? `${src}${n < c1 ? 0 : n < c2 ? 1 : 2}` : src);
    }
  }
  const strataKeys = [...new Set(strataOf.values())];
  for (const mid of Object.keys(MECH)) {
    const cell = {}, ev = {};
    for (const k of strataKeys) { cell[k] = [[], []]; ev[k] = { h: [0, 0], f: [0, 0] }; }
    let n1 = 0, n0 = 0, hw = 0, intenSum = 0; const all1 = [], all0 = [];
    for (const r of rows) {
      const sk = strataOf.get(r), k = has(r.g, mid) ? 0 : 1;
      cell[sk][k].push(r.y); (k ? all0 : all1).push(r.y);
      if (r.y >= hitT) ev[sk].h[k]++; if (r.y <= flopT) ev[sk].f[k]++;
      if (!k) { n1++; intenSum += r.g.m[mid][0]; if (r.y >= hitT) hw++; } else n0++;
    }
    const row = { mid, n1, n0, prev: rows.length ? n1 / rows.length : 0 };
    const c = rc.get(mid);
    row.ridge = c ? c.coef : null; row.rlo = c ? c.ci_lo : null; row.rhi = c ? c.ci_hi : null;
    const pm = pre.get(mid);
    if (pm && pm.matched_att != null) { row.matt = pm.matched_att; row.mlo = pm.matched_lo; row.mhi = pm.matched_hi; row.robust = pm.robust; }
    let W = 0, D = 0, V = 0, nEff = 0;
    for (const sk of strataKeys) {
      const [a, b] = cell[sk];
      if (a.length < 2 || b.length < 2) continue;
      const wt = a.length * b.length / (a.length + b.length);
      W += wt; D += wt * (mean(a) - mean(b)); V += wt * wt * (variance(a) / a.length + variance(b) / b.length); nEff += a.length;
    }
    const mh = key => { let num = 0, den = 0; for (const sk of strataKeys) { const a = cell[sk][0].length, b = cell[sk][1].length; if (!a || !b) continue; const N = a + b; num += ev[sk][key][0] * b / N; den += ev[sk][key][1] * a / N; } return den > 0 ? num / den : null; };
    if (n1 >= 3 && n0 >= 3 && W > 0) {
      const diff = D / W, se = Math.sqrt(V) / W || 1e-9;
      Object.assign(row, { m1: mean(all1), m0: mean(all0), diff, lo: diff - 1.96 * se, hi: diff + 1.96 * se, nEff, mi: intenSum / n1,
        raw: mean(all1) - mean(all0), lift: mh("h"), flopR: mh("f") });
      const nh = rows.filter(r => r.y >= hitT).length;
      row.prevHits = nh ? hw / nh : null;
    }
    row.verdict = verdict(row);
    out.push(row);
  }
  // Benjamini-Hochberg across mechanics on normal-approx p-values (controls false discoveries in live verdicts)
  const withP = out.filter(r => r.diff != null).map(r => { const z = Math.abs(r.diff) / (((r.hi - r.lo) / 3.92) || 1e-9); r.p = 2 * (1 - ncdf(z)); return r; }).sort((a, b) => a.p - b.p);
  let minq = 1; for (let i = withP.length - 1; i >= 0; i--) { minq = Math.min(minq, withP[i].p * withP.length / (i + 1)); withP[i].q = minq; }
  for (const r of out) r.verdict = verdict(r);
  const val = { rows: out, n: rows.length, hitT, flopT, slice: rows, scope };
  _cache = { key, val };
  return val;
}
function verdict(r) {
  if (r.diff == null || (r.nEff ?? r.n1) < 15 || r.n0 < 15) return "insufficient data";
  const sig = r.q != null && r.q < 0.1, posU = r.lo > 0 && sig, negU = r.hi < 0 && sig;
  const posR = r.rlo != null && r.rlo > 0, negR = r.rhi != null && r.rhi < 0;
  const riskRed = r.flopR != null && r.flopR <= 0.7;
  if ((negU && (r.ridge == null || r.ridge < 0)) || negR) return "red flag";
  if ((r.prevHits || 0) >= 0.5 && r.diff >= 0 && riskRed) return "table stakes";
  if (r.prev <= 0.35 && (posU || posR)) return "differentiator";
  if (posU || posR) return "positive";
  if (riskRed) return "risk reducer";
  return "neutral";
}
const VERDICT_ORDER = ["table stakes", "differentiator", "positive", "risk reducer", "neutral", "red flag", "insufficient data"];
function chip(v, small) { return h("span", { class: `chip ${small ? "small " : ""}v-${v.replace(/ /g, "-")}` }, h("span", { class: "dot" }), v); }

// ---------- color: diverging via color-mix (theme-aware) ----------
function divFill(x, max = 12) {
  if (x == null || isNaN(x)) return "var(--surface-2)";
  const t = Math.max(-1, Math.min(1, x / max));
  const pct = Math.round(Math.abs(t) * 100);
  return `color-mix(in oklab, ${t >= 0 ? "var(--pos)" : "var(--neg)"} ${pct}%, var(--mid))`;
}
function divText(x, max = 12) { return x != null && Math.abs(x / max) > 0.55 ? "darkfill" : "lightfill"; }

// ---------- SVG chart primitives ----------
function colPath(x, y, w, hgt, r = 4) { // column with rounded top, square base
  if (hgt <= 0) return "";
  r = Math.min(r, w / 2, hgt);
  return `M${x},${y + hgt}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + hgt}Z`;
}
function hbarPath(x0, x1, y, hgt, r = 4) { // horizontal bar from baseline x0 to data end x1 (rounded at x1)
  const w = Math.abs(x1 - x0); if (w < 0.5) return "";
  r = Math.min(r, w, hgt / 2);
  if (x1 >= x0) return `M${x0},${y}H${x1 - r}Q${x1},${y} ${x1},${y + r}V${y + hgt - r}Q${x1},${y + hgt} ${x1 - r},${y + hgt}H${x0}Z`;
  return `M${x0},${y}H${x1 + r}Q${x1},${y} ${x1},${y + r}V${y + hgt - r}Q${x1},${y + hgt} ${x1 + r},${y + hgt}H${x0}Z`;
}
function niceTicks(lo, hi, n = 5) {
  const span = hi - lo || 1, step0 = span / n, mag = 10 ** Math.floor(Math.log10(step0));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => span / s <= n) || mag * 10;
  const out = []; for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(10));
  return out;
}

function histogram(values, { width = 560, height = 200, bins = 20, lo = 0, hi = 100, color = "var(--series-1)", label = "games", xlabel = "" } = {}) {
  const pad = { l: 36, r: 10, t: 10, b: 30 }, W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const counts = new Array(bins).fill(0), bw = (hi - lo) / bins;
  for (const v of values) counts[Math.min(bins - 1, Math.max(0, Math.floor((v - lo) / bw)))]++;
  const ymax = Math.max(1, ...counts);
  let ticks = niceTicks(0, ymax, 4);
  if (ticks[ticks.length - 1] < ymax) ticks.push(ticks[ticks.length - 1] + (ticks[1] - ticks[0] || ymax));
  const svg = s("svg", { class: "svgchart", style: `max-width:${width}px`, viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": `Histogram of ${xlabel}` });
  for (const t of ticks) {
    const y = pad.t + H - (t / ticks[ticks.length - 1]) * H;
    svg.append(s("line", { class: "gridline", x1: pad.l, x2: pad.l + W, y1: y, y2: y }), s("text", { x: pad.l - 6, y: y + 4, "text-anchor": "end" }, fmt.n(t)));
  }
  const top = ticks[ticks.length - 1], cw = W / bins;
  counts.forEach((c, i) => {
    const x = pad.l + i * cw + 1, hh = (c / top) * H, w = Math.max(1, cw - 2);
    const g = s("g", { class: "hov" });
    g.append(s("path", { class: "mark", d: colPath(x, pad.t + H - hh, w, hh), fill: color }));
    const hit = s("rect", { class: "hit", x: x - 1, y: pad.t, width: cw, height: H });
    hover(hit, () => [`${c} ${label}`, `${xlabel} ${Math.round(lo + i * bw)}–${Math.round(lo + (i + 1) * bw)}`]);
    g.append(hit); svg.append(g);
  });
  svg.append(s("line", { class: "axisline", x1: pad.l, x2: pad.l + W, y1: pad.t + H, y2: pad.t + H }));
  for (const t of niceTicks(lo, hi, 5)) svg.append(s("text", { x: pad.l + ((t - lo) / (hi - lo)) * W, y: height - 10, "text-anchor": "middle" }, t));
  return svg;
}

/** Horizontal bars: items [{label, value, sub, onclick, color}] */
function hbars(items, { width = 560, rowH = 26, max = null, fmtv = fmt.f1, color = "var(--series-1)", labelW = 190, diverging = false } = {}) {
  const pad = { l: labelW, r: 56, t: 4, b: 4 }, W = width - pad.l - pad.r, height = pad.t + pad.b + items.length * rowH;
  const vals = items.flatMap(i => [i.value, i.lo, i.hi]).filter(v => v != null), mx = max ?? Math.max(1e-9, ...vals.map(Math.abs));
  const svg = s("svg", { class: "svgchart", style: `max-width:${width}px`, viewBox: `0 0 ${width} ${height}` });
  const x0 = diverging ? pad.l + W / 2 : pad.l, scale = diverging ? (W / 2) / mx : W / mx;
  if (diverging) svg.append(s("line", { class: "axisline", x1: x0, x2: x0, y1: 0, y2: height }));
  items.forEach((it, i) => {
    const y = pad.t + i * rowH, bh = Math.min(16, rowH - 8), by = y + (rowH - bh) / 2;
    const g = s("g", { class: "hov", style: it.onclick ? "cursor:pointer" : "" });
    g.append(s("text", { class: "lbl", x: pad.l - 8, y: y + rowH / 2 + 4, "text-anchor": "end" }, it.label.length > 28 ? it.label.slice(0, 27) + "…" : it.label));
    const x1 = x0 + it.value * scale;
    g.append(s("path", { class: "mark", d: hbarPath(x0, x1, by, bh), fill: it.color || (diverging ? (it.value >= 0 ? "var(--pos)" : "var(--neg)") : color) }));
    if (it.lo != null) {
      const a = x0 + it.lo * scale, b = x0 + it.hi * scale;
      g.append(s("line", { x1: a, x2: b, y1: by + bh / 2, y2: by + bh / 2, stroke: "var(--text-secondary)", "stroke-width": 1.5 }));
    }
    g.append(s("text", { class: "val", x: diverging ? (it.value >= 0 ? Math.max(x1, it.hi != null ? x0 + it.hi * scale : x1) + 6 : Math.min(x1, it.lo != null ? x0 + it.lo * scale : x1) - 6) : x1 + 6,
      y: y + rowH / 2 + 4, "text-anchor": diverging && it.value < 0 ? "end" : "start" }, fmtv(it.value)));
    const hit = s("rect", { class: "hit", x: 0, y, width, height: rowH });
    hover(hit, () => [fmtv(it.value), it.label, it.sub ? [it.sub] : []]);
    if (it.onclick) hit.addEventListener("click", it.onclick);
    g.append(hit); svg.append(g);
  });
  return svg;
}

/** Mechanic scatter: x = prevalence, y = effect. */
function effectScatter(rows, { width = 720, height = 380, onclick } = {}) {
  const pad = { l: 44, r: 16, t: 14, b: 36 }, W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const pts = rows.filter(r => r.diff != null && r.verdict !== "insufficient data");
  const ymax = Math.max(5, ...pts.map(r => Math.abs(r.diff))) * 1.08;
  const X = p => pad.l + p * W, Y = v => pad.t + H / 2 - (v / ymax) * (H / 2);
  const svg = s("svg", { class: "svgchart", style: `max-width:${width}px`, viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": "Mechanic prevalence vs outcome difference" });
  for (const t of niceTicks(-ymax, ymax, 6)) svg.append(s("line", { class: "gridline", x1: pad.l, x2: pad.l + W, y1: Y(t), y2: Y(t) }), s("text", { x: pad.l - 6, y: Y(t) + 4, "text-anchor": "end" }, fmt.d1(t)));
  svg.append(s("line", { class: "axisline", x1: pad.l, x2: pad.l + W, y1: Y(0), y2: Y(0) }));
  for (const t of [0, .2, .4, .6, .8, 1]) svg.append(s("text", { x: X(t), y: height - 14, "text-anchor": "middle" }, Math.round(t * 100) + "%"));
  svg.append(s("text", { x: pad.l + W, y: height - 2, "text-anchor": "end" }, "share of games with mechanic →"));
  svg.append(s("text", { x: pad.l + 4, y: pad.t + 10 }, `↑ higher ${OUT_LABEL[state.out]} with mechanic`));
  const labeled = new Set([...pts].sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).slice(0, 8).map(r => r.mid));
  for (const r of pts) {
    const cx = X(r.prev), cy = Y(r.diff);
    const g = s("g", { class: "hov", style: "cursor:pointer" });
    g.append(s("circle", { class: "mark", cx, cy, r: 5, fill: divFill(r.diff, ymax * 0.7), stroke: "var(--surface-1)", "stroke-width": 2 }));
    if (labeled.has(r.mid)) g.append(s("text", { class: "lbl", x: cx + 8, y: cy + 4 }, mname(r.mid)));
    const hit = s("circle", { class: "hit", cx, cy, r: 12 });
    hover(hit, () => [fmt.d1(r.diff) + " pts", mname(r.mid), [`${fmt.pct(r.prev)} of games · n=${r.n1}`, r.verdict]]);
    hit.addEventListener("click", () => onclick && onclick(r.mid));
    g.append(hit); svg.append(g);
  }
  return svg;
}

function designScatter(rows, { width = 900, height = 400 } = {}) {
  const pad = { l: 44, r: 16, t: 12, b: 36 }, W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const X = v => pad.l + (v / 100) * W, Y = v => pad.t + H - (v / 100) * H;
  const svg = s("svg", { class: "svgchart", style: `max-width:${width}px`, viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": "Design score vs actual" });
  for (const t of [0, 25, 50, 75, 100]) {
    svg.append(s("line", { class: "gridline", x1: pad.l, x2: pad.l + W, y1: Y(t), y2: Y(t) }), s("text", { x: pad.l - 6, y: Y(t) + 4, "text-anchor": "end" }, t));
    svg.append(s("text", { x: X(t), y: height - 16, "text-anchor": "middle" }, t));
  }
  svg.append(s("line", { x1: X(0), y1: Y(0), x2: X(100), y2: Y(100), stroke: "var(--axis)", "stroke-width": 1 }));
  svg.append(s("text", { x: pad.l + W, y: height - 2, "text-anchor": "end" }, "design score (predicted) →"));
  svg.append(s("text", { x: pad.l + 4, y: pad.t + 10 }, "↑ actual Success Index"));
  const lab = new Set([...rows].sort((a, b) => Math.abs(b.g.gsi - b.g.ds) - Math.abs(a.g.gsi - a.g.ds)).slice(0, 6).map(r => r.g.id));
  for (const r of rows) {
    const cx = X(Math.max(0, Math.min(100, r.g.ds))), cy = Y(r.g.gsi), cur = r.g.src === "curated";
    svg.append(s("circle", { cx, cy, r: cur ? 4.5 : 3, fill: cur ? "var(--series-1)" : "var(--axis)", opacity: cur ? 0.95 : 0.6, stroke: "var(--surface-1)", "stroke-width": cur ? 1.5 : 0.5 }));
    if (lab.has(r.g.id) && cur) svg.append(s("text", { class: "lbl", x: cx + 7, y: cy + 4 }, r.g.n));
    const hit = s("circle", { class: "hit", cx, cy, r: 9 });
    hover(hit, () => [r.g.n, `actual ${fmt.f1(r.g.gsi)} · design ${fmt.f1(r.g.ds)}`, [`${fmt.d1(r.g.gsi - r.g.ds)} vs design`, cur ? "curated" : "auto-tagged"]]);
    hit.addEventListener("click", () => openGame(r.g.id)); svg.append(hit);
  }
  return h("div", {}, h("div", { class: "legend" }, h("span", {}, h("i", { style: "background:var(--series-1);border-radius:50%" }), "curated"), h("span", {}, h("i", { style: "background:var(--axis);border-radius:50%" }), "auto-tagged")), svg);
}

function lineChart(points, { width = 560, height = 200, xlabel = "", ylabel = "" } = {}) {
  const pad = { l: 40, r: 16, t: 12, b: 32 }, W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const xs = points.map(p => p.x), ys = points.map(p => p.y);
  const xlo = Math.min(...xs), xhi = Math.max(...xs), ylo = Math.min(...ys) - 3, yhi = Math.max(...ys) + 3;
  const X = x => pad.l + ((x - xlo) / (xhi - xlo || 1)) * W, Y = y => pad.t + H - ((y - ylo) / (yhi - ylo || 1)) * H;
  const svg = s("svg", { class: "svgchart", style: `max-width:${width}px`, viewBox: `0 0 ${width} ${height}` });
  for (const t of niceTicks(ylo, yhi, 4)) svg.append(s("line", { class: "gridline", x1: pad.l, x2: pad.l + W, y1: Y(t), y2: Y(t) }), s("text", { x: pad.l - 6, y: Y(t) + 4, "text-anchor": "end" }, Math.round(t)));
  svg.append(s("path", { d: points.map((p, i) => `${i ? "L" : "M"}${X(p.x)},${Y(p.y)}`).join(""), fill: "none", stroke: "var(--series-1)", "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }));
  points.forEach(p => {
    svg.append(s("circle", { cx: X(p.x), cy: Y(p.y), r: 4, fill: "var(--series-1)", stroke: "var(--surface-1)", "stroke-width": 2 }));
    svg.append(s("text", { x: X(p.x), y: height - 12, "text-anchor": "middle" }, p.xl));
    const hit = s("rect", { class: "hit", x: X(p.x) - 18, y: pad.t, width: 36, height: H });
    hover(hit, () => [fmt.f1(p.y), `${xlabel} ${p.xl}`, [`n=${p.n}`]]); svg.append(hit);
  });
  svg.append(s("text", { x: pad.l + W, y: height - 0, "text-anchor": "end" }, xlabel));
  return svg;
}

/** with vs without box strip */
function boxCompare(a, b, { width = 600, height = 110, labels = ["With", "Without"] } = {}) {
  const pad = { l: 70, r: 16, t: 8, b: 26 }, W = width - pad.l - pad.r;
  const X = v => pad.l + (v / 100) * W;
  const svg = s("svg", { class: "svgchart", style: `max-width:${width}px`, viewBox: `0 0 ${width} ${height}` });
  for (const t of [0, 25, 50, 75, 100]) svg.append(s("line", { class: "gridline", x1: X(t), x2: X(t), y1: pad.t, y2: height - pad.b }), s("text", { x: X(t), y: height - 8, "text-anchor": "middle" }, t));
  [a, b].forEach((arr, i) => {
    if (!arr.length) return;
    const sr = [...arr].sort((x, y) => x - y), q = [0.1, 0.25, 0.5, 0.75, 0.9].map(p => quantile(sr, p));
    const y = pad.t + 10 + i * 36, col = i === 0 ? "var(--series-1)" : "var(--axis)";
    svg.append(s("text", { class: "lbl", x: pad.l - 8, y: y + 12, "text-anchor": "end" }, labels[i]));
    svg.append(s("line", { x1: X(q[0]), x2: X(q[4]), y1: y + 8, y2: y + 8, stroke: col, "stroke-width": 2 }));
    svg.append(s("rect", { x: X(q[1]), y, width: Math.max(2, X(q[3]) - X(q[1])), height: 16, rx: 4, fill: col, opacity: 0.9 }));
    svg.append(s("line", { x1: X(q[2]), x2: X(q[2]), y1: y - 2, y2: y + 18, stroke: "var(--text-primary)", "stroke-width": 2 }));
    const hit = s("rect", { class: "hit", x: pad.l, y: y - 4, width: W, height: 24 });
    hover(hit, () => [`median ${fmt.f1(q[2])}`, `${labels[i]} (n=${arr.length})`, [`IQR ${fmt.f1(q[1])}–${fmt.f1(q[3])}`, `10–90%: ${fmt.f1(q[0])}–${fmt.f1(q[4])}`]]);
    svg.append(hit);
  });
  return svg;
}

// ---------- sortable table ----------
function table(cols, rows, { onRow, initialSort, limit = 500 } = {}) {
  let sortKey = initialSort ? initialSort[0] : null, dir = initialSort ? initialSort[1] : -1;
  const wrap = h("div", { class: "table-wrap" });
  function render() {
    const sorted = sortKey ? [...rows].sort((a, b) => {
      const c = cols.find(c => c.key === sortKey), va = c.sort ? c.sort(a) : a[sortKey], vb = c.sort ? c.sort(b) : b[sortKey];
      if (va == null) return 1; if (vb == null) return -1;
      return (va > vb ? 1 : va < vb ? -1 : 0) * dir;
    }) : rows;
    const thead = h("thead", {}, h("tr", {}, cols.map(c => h("th", { class: c.num ? "num" : "", title: c.title || "",
      onclick: () => { dir = sortKey === c.key ? -dir : -1; sortKey = c.key; render(); } }, c.label + (sortKey === c.key ? (dir > 0 ? " ▲" : " ▼") : "")))));
    const tbody = h("tbody", {}, sorted.slice(0, limit).map(r => h("tr", { class: onRow ? "click" : "", onclick: onRow ? () => onRow(r) : null },
      cols.map(c => h("td", { class: c.num ? "num" : "" }, c.render ? c.render(r) : (r[c.key] ?? "–"))))));
    put(wrap, h("table", {}, thead, tbody), ...(sorted.length > limit ? [h("div", { class: "muted", style: "padding:8px" }, `showing ${limit} of ${sorted.length}`)] : []));
  }
  render();
  return wrap;
}
function effectCell(r, max = 20) {
  const W = 150, Hh = 18, x0 = W / 2, sc = (W / 2 - 4) / max;
  const svg = s("svg", { width: W, height: Hh, class: "svgchart" });
  svg.append(s("line", { class: "axisline", x1: x0, x2: x0, y1: 0, y2: Hh }));
  if (r.diff != null) {
    const cl = v => Math.max(-max, Math.min(max, v));
    svg.append(s("path", { d: hbarPath(x0, x0 + cl(r.diff) * sc, 5, 8), fill: r.diff >= 0 ? "var(--pos)" : "var(--neg)" }));
    svg.append(s("line", { x1: x0 + cl(r.lo) * sc, x2: x0 + cl(r.hi) * sc, y1: 9, y2: 9, stroke: "var(--text-secondary)", "stroke-width": 1.5 }));
  }
  return h("span", { style: "display:inline-flex;gap:6px;align-items:center;justify-content:flex-end;white-space:nowrap" }, svg, h("span", { style: "width:42px;text-align:right" }, fmt.d1(r.diff)));
}

// ---------- drawer ----------
const DRAWER = $("#drawer");
function openDrawer(...content) { put($("#drawer-body"), ...content); DRAWER.classList.add("open"); DRAWER.setAttribute("aria-hidden", "false"); DRAWER.scrollTop = 0; }
$("#drawer-close").addEventListener("click", () => { DRAWER.classList.remove("open"); DRAWER.setAttribute("aria-hidden", "true"); });
document.addEventListener("keydown", e => { if (e.key === "Escape") $("#drawer-close").click(); });

function openMechanic(mid) {
  const im = impact(), r = im.rows.find(x => x.mid === mid), m = MECH[mid];
  const withG = im.slice.filter(x => has(x.g, mid)).sort((a, b) => b.y - a.y);
  const without = im.slice.filter(x => !has(x.g, mid)).map(x => x.y);
  const subRows = HYBRIDS.map(hy => {
    const sl = im.slice.filter(x => x.g.sg === hy), w = sl.filter(x => has(x.g, mid)).map(x => x.y), wo = sl.filter(x => !has(x.g, mid)).map(x => x.y);
    return { hy, n: sl.length, prev: sl.length ? w.length / sl.length : 0, diff: w.length >= 5 && wo.length >= 5 ? mean(w) - mean(wo) : null, nw: w.length };
  }).filter(x => x.n >= 15);
  openDrawer(
    h("div", { class: "muted" }, `${famName(m.family)} › ${(FAMS.find(f => f.id === m.family).subfamilies.find(sf => sf.id === m.subfamily) || {}).name}`),
    h("h2", {}, m.name), h("p", { class: "sub" }, m.desc),
    h("div", { class: "grid g3" },
      tile("Prevalence", fmt.pct(r.prev), `${r.n1} of ${r.n1 + r.n0} games`),
      tile("Δ " + OUT_LABEL[state.out], fmt.d1(r.diff), r.lo != null ? `95% CI ${fmt.d1(r.lo)} to ${fmt.d1(r.hi)}` : ""),
      tile("Partial effect (ridge)", fmt.d1(r.ridge), r.rlo != null ? `CI ${fmt.d1(r.rlo)} to ${fmt.d1(r.rhi)}` : "not in model"),
      tile("Matched comparison", fmt.d1(r.matt), r.mlo != null ? `CI ${fmt.d1(r.mlo)} to ${fmt.d1(r.mhi)}${r.robust ? " · robust ✓" : ""}` : "insufficient matches"),
      tile("Verdict", chip(r.verdict), `hit lift ${fmt.f2(r.lift)} · flop ratio ${fmt.f2(r.flopR)}`)),
    (() => { const k = AN.irr && AN.irr.mechanics.find(x => x.mechanic === mid); return k && k.kappa != null ? h("div", { class: "muted", style: "margin-top:8px" }, `Tagging reliability κ = ${fmt.f2(k.kappa)} (blind re-tag of ${AN.irr.n_games} games)${k.kappa < 0.4 ? " — low: definition is fuzzy, interpret with caution" : ""}`) : null; })(),
    h("div", { class: "card", style: "margin-top:14px" }, h("h3", {}, `${OUT_LABEL[state.out]}: with vs without`), boxCompare(withG.map(x => x.y), without)),
    subRows.length ? h("div", { class: "card", style: "margin-top:14px" }, h("h3", {}, "By subgenre (Δ with − without)"),
      hbars(subRows.filter(x => x.diff != null).map(x => ({ label: mname(x.hy), value: x.diff, sub: `${fmt.pct(x.prev)} prevalence · n=${x.nw}/${x.n}` })), { diverging: true, fmtv: fmt.d1, width: 640 })) : null,
    h("div", { class: "card", style: "margin-top:14px" }, h("h3", {}, `Top games with ${m.name}`),
      table([{ key: "n", label: "Game", render: x => x.g.n }, { key: "i", label: "Intensity", render: x => intenDots(x.g.m[mid][0]) },
        { key: "src", label: "Source", render: x => x.g.m[mid][1] >= 10 ? "curated" : "auto" },
        { key: "y", label: OUT_LABEL[state.out], num: true, render: x => fmt.f1(x.y) }], withG.slice(0, 40).map(x => ({ ...x, n: x.g.n })),
        { onRow: x => openGame(x.g.id) })));
}
function intenDots(i) { return h("span", { class: "inten", title: ["", "present", "significant", "core pillar"][i] }, [1, 2, 3].map(k => h("b", { class: k <= i ? "on" : "" }))); }
function tile(label, value, note) { return h("div", { class: "card tight" }, h("div", { class: "tile-label" }, label), h("div", { class: "tile-value" }, value), note ? h("div", { class: "tile-note" }, note) : null); }

function similar(vec, { k = 12, exclude = null, pool = GAMES } = {}) {
  // weighted Jaccard on intensities (hybrid tags count double: genre matters for comps)
  const res = [];
  for (const g of pool) {
    if (g.id === exclude) continue;
    let mn = 0, mx = 0;
    const keys = new Set([...Object.keys(vec), ...Object.keys(g.m)]);
    for (const k2 of keys) {
      const a = vec[k2] || 0, b = g.m[k2] ? g.m[k2][0] * (g.m[k2][1] >= 7 ? 1 : 0.6) : 0, wgt = MECH[k2] && MECH[k2].subfamily === "hybrids" ? 2 : 1;
      mn += Math.min(a, b) * wgt; mx += Math.max(a, b) * wgt;
    }
    if (mx > 0) res.push({ g, sim: mn / mx });
  }
  return res.sort((a, b) => b.sim - a.sim).slice(0, k);
}

function openGame(id) {
  const g = BY_ID.get(id); if (!g) return;
  const im = impact(), eff = new Map(im.rows.map(r => [r.mid, r]));
  const vec = Object.fromEntries(Object.entries(g.m).map(([k, v]) => [k, v[0]]));
  const comps = similar(vec, { exclude: id });
  const fams = FAMS.map(f => {
    const ms = f.subfamilies.flatMap(sf => sf.mechanics).filter(mid => g.m[mid]);
    if (!ms.length) return null;
    return h("div", { class: "fam-block" }, h("div", { class: "fam-title" }, f.name),
      ms.sort((a, b) => g.m[b][0] - g.m[a][0]).map(mid => {
        const e = eff.get(mid), auto = g.m[mid][1] < 10;
        const pill = h("span", { class: "mech-pill" + (auto ? " src-auto" : ""), onclick: () => openMechanic(mid) }, intenDots(g.m[mid][0]), mname(mid),
          e && e.diff != null ? h("span", { class: "muted" }, fmt.d1(e.diff)) : null);
        hover(pill, () => [mname(mid), (g.ev && g.ev[mid]) || MECH[mid].desc, [auto ? `auto-tagged (confidence ${g.m[mid][1] / 10})` : "curated", e ? `slice Δ ${fmt.d1(e.diff)} · ${e.verdict}` : ""]]);
        return pill;
      }));
  }).filter(Boolean);
  openDrawer(
    h("div", { class: "game-head" }, g.img ? h("img", { src: g.img, alt: "" }) : null,
      h("div", {}, h("h2", {}, g.n), h("div", { class: "muted" }, [g.dev, g.y, mname(g.sg)].filter(Boolean).join(" · ")),
        h("div", { class: "row", style: "margin-top:6px" }, h("a", { href: `https://store.steampowered.com/app/${g.id}`, target: "_blank", rel: "noopener" }, "Steam"),
          h("a", { href: `https://steamdb.info/app/${g.id}/`, target: "_blank", rel: "noopener" }, "SteamDB"),
          h("a", { href: `https://gamalytic.com/game/${g.id}`, target: "_blank", rel: "noopener" }, "Gamalytic"),
          g.wiki ? h("a", { href: g.wiki, target: "_blank", rel: "noopener" }, "Wiki") : null,
          h("span", { class: "chip small" }, g.src === "curated" ? "curated profile" : "auto-tagged")))),
    h("div", { class: "grid g4" },
      tile("Success Index", fmt.f1(outcome(g)), `quality ${fmt.f1(g.q)} · commercial ${fmt.f1(g.c)} · critic ${fmt.f1(g.k)}`),
      tile("Steam reviews", fmt.pct(g.pr), `${fmt.n(g.rv)} reviews · ${g.rd || ""}`),
      tile("Est. gross revenue", fmt.usd(g.rev), g.rev ? `band ${fmt.usd(g.revlo)}–${fmt.usd(g.revhi)}` : (g.f ? "free-to-play" : "")),
      tile("Critic", g.mc ? `MC ${g.mc}` : g.ign ? `IGN ${g.ign}` : "–", [g.mc ? `Metacritic ${g.mc}` : "", g.ign ? `IGN ${g.ign}` : ""].filter(Boolean).join(" · "))),
    g.ds != null ? h("div", { class: "card tight", style: "margin-top:12px" }, h("div", { class: "row", style: "justify-content:space-between" },
      h("div", {}, h("div", { class: "tile-label" }, "Design score (predicted from mechanics alone)"), h("div", { class: "tile-value" }, fmt.f1(g.ds))),
      h("div", { style: "text-align:right" }, h("div", { class: "tile-label" }, "Actual vs design"), h("div", { class: "tile-value" }, fmt.d1(g.gsi - g.ds)),
        h("div", { class: "tile-note" }, g.gsi - g.ds > 15 ? "over-performer: execution/marketing beat the design baseline" : g.gsi - g.ds < -15 ? "under-performer: design promised more than it delivered" : "performed about as its design predicts")))) : null,
    g.wa ? h("div", { class: "card", style: "margin-top:14px" }, h("h3", {}, "Wiki footprint"),
      h("div", { class: "row" }, h("span", { class: "chip" }, `${fmt.n(g.wa)} articles`), h("span", { class: "chip" }, `${fmt.n(g.we)} edits`),
        h("span", { class: "chip" }, `community pct ${fmt.f1(g.e)}`), Object.entries(g.wc || {}).filter(([, v]) => v > 0).map(([k, v]) => h("span", { class: "chip" }, `wiki ${k.replace(/_/g, " ")}: ${v}`)))) : null,
    Object.keys(g.st || {}).length ? h("div", { class: "card", style: "margin-top:14px" }, h("h3", {}, "Design stats"),
      h("div", { class: "row" }, Object.entries(g.st).map(([k, v]) => h("span", { class: "chip" }, `${k.replace(/_/g, " ")}: ${v}`)))) : null,
    (() => { const peers = GAMES.filter(x => x.sg === g.sg && x.src === "curated" && x.id !== g.id), hits = peers.filter(x => x.gsi >= 75);
      const avg = list => { const acc = famProfile({}).map(() => 0); list.forEach(x => famProfile(Object.fromEntries(Object.entries(x.m).map(([k, v]) => [k, v[0]]))).forEach((v, i) => acc[i] += v / list.length)); return acc; };
      return h("div", { class: "card", style: "margin-top:14px" }, h("h3", {}, "Design shape vs genre hits"),
        h("div", { class: "muted" }, `How much of each mechanic family ${g.n} uses, against the average curated ${mname(g.sg)} hit (GSI ≥ 75, n=${hits.length}).`),
        radar([{ label: g.n, color: "var(--series-1)", vals: famProfile(vec) }].concat(hits.length >= 3 ? [{ label: `${mname(g.sg)} hits`, color: "var(--series-2)", vals: avg(hits) }] : []))); })(),
    h("div", { class: "card", style: "margin-top:14px" }, h("h3", {}, `Mechanic fingerprint (${Object.keys(g.m).length})`),
      h("div", { class: "muted", style: "margin-bottom:6px" }, "● ● ● = present / significant / core pillar. Number = slice Δ for that mechanic. Italic = auto-tagged."), fams),
    h("div", { class: "card", style: "margin-top:14px" }, h("h3", {}, "Closest design comps"),
      table([{ key: "n", label: "Game", render: x => x.g.n }, { key: "sim", label: "Similarity", num: true, render: x => fmt.pct(x.sim) },
        { key: "gsi", label: OUT_LABEL[state.out], num: true, render: x => fmt.f1(outcome(x.g)) }, { key: "rv", label: "Reviews", num: true, render: x => fmt.n(x.g.rv) }],
        comps.map(x => ({ ...x, n: x.g.n })), { onRow: x => openGame(x.g.id) })),
    h("div", { class: "row", style: "margin-top:14px" }, h("button", { class: "btn", onclick: () => { loadTemplate(g); switchView("lab"); $("#drawer-close").click(); } }, "Open in Design Lab"),
      h("select", { class: "search", onchange: e => e.target.value && openCompare(g.id, +e.target.value) }, h("option", { value: "" }, "Compare with…"),
        comps.map(c => h("option", { value: c.g.id }, `${c.g.n} (${fmt.pct(c.sim)} similar)`)))));
}

function openCompare(aId, bId) {
  const A = BY_ID.get(aId), B = BY_ID.get(bId); if (!A || !B) return;
  const eff = new Map(impact().rows.map(r => [r.mid, r]));
  const onlyA = Object.keys(A.m).filter(m => !B.m[m]), onlyB = Object.keys(B.m).filter(m => !A.m[m]), both = Object.keys(A.m).filter(m => B.m[m]);
  const list = (ms, g) => h("div", {}, ms.sort((x, y) => ((eff.get(y) || {}).diff ?? -99) - ((eff.get(x) || {}).diff ?? -99)).map(mid => {
    const e = eff.get(mid); return h("span", { class: "mech-pill", onclick: () => openMechanic(mid) }, g ? intenDots(g.m[mid][0]) : null, mname(mid), e && e.diff != null ? h("span", { class: "muted" }, fmt.d1(e.diff)) : null); }));
  const row = (label, f) => h("tr", {}, h("td", {}, label), h("td", { class: "num" }, f(A)), h("td", { class: "num" }, f(B)));
  openDrawer(h("h2", {}, `${A.n} vs ${B.n}`),
    h("div", { class: "card" }, h("table", {}, h("thead", {}, h("tr", {}, h("th", {}, ""), h("th", { class: "num" }, A.n), h("th", { class: "num" }, B.n))),
      h("tbody", {}, row("Success Index", g => fmt.f1(outcome(g))), row("Positive reviews", g => fmt.pct(g.pr)), row("Reviews", g => fmt.n(g.rv)),
        row("Est. revenue", g => fmt.usd(g.rev)), row("Critic", g => g.mc || (g.ign ? g.ign * 10 : "–")), row("Price", g => g.p ? "$" + g.p : g.f ? "F2P" : "–"),
        row("Release", g => g.y || "–"), row("Subgenre", g => mname(g.sg)), row("# mechanics", g => Object.keys(g.m).length)))),
    h("div", { class: "card", style: "margin-top:14px" }, h("h3", {}, `Only in ${A.n} (${onlyA.length})`), list(onlyA, A)),
    h("div", { class: "card", style: "margin-top:14px" }, h("h3", {}, `Only in ${B.n} (${onlyB.length})`), list(onlyB, B)),
    h("div", { class: "card", style: "margin-top:14px" }, h("h3", {}, `Shared (${both.length})`), list(both, A)),
    h("div", { class: "muted", style: "margin-top:8px" }, "Pills sorted by slice Δ (number). The design difference that best explains an outcome gap is usually among the highest-Δ mechanics only one game has."));
}

// ---------- views ----------
function viewOverview() {
  const im = impact(), ys = im.slice.map(r => r.y);
  const el = $("#view-overview");
  const curated = im.slice.filter(r => r.g.src === "curated").length;
  const rev = im.slice.reduce((a, r) => a + (r.g.rev || 0), 0);
  const ok = im.rows.filter(r => r.verdict !== "insufficient data");
  const top = [...ok.filter(r => !r.mid.startsWith("hybrid_"))].sort((a, b) => b.diff - a.diff);
  const subs = HYBRIDS.map(hy => { const v = im.slice.filter(r => r.g.sg === hy).map(r => r.y).sort((a, b) => a - b); return { hy, n: v.length, med: quantile(v, 0.5) }; }).filter(x => x.n > 0).sort((a, b) => b.n - a.n);
  const comp = (im.scope && im.scope.complexity) || [];
  const counts = {}; for (const r of ok) counts[r.verdict] = (counts[r.verdict] || 0) + 1;
  put(el, 
    h("h2", {}, "The roguelike design landscape"),
    h("p", { class: "sub" }, `Every game is broken into ${Object.keys(MECH).length} mechanics across ${FAMS.length} families, then linked to player reception, estimated revenue and critic scores. Filters above scope every view.`),
    h("div", { class: "grid g4" },
      h("div", { class: "card" }, h("div", { class: "tile-label" }, "Games in slice"), h("div", { class: "hero" }, h("span", { class: "hero-value" }, fmt.n(im.n))), h("div", { class: "tile-note" }, `${curated} expert-curated · ${im.n - curated} auto-tagged`)),
      tile("Estimated gross revenue covered", fmt.usd(rev), "Boxleiter review-multiplier method"),
      tile("Hit threshold (top 25%)", fmt.f1(im.hitT), `${OUT_LABEL[state.out]} ≥ this = hit · flop ≤ ${fmt.f1(im.flopT)}`),
      tile("Mechanic verdicts", `${counts["table stakes"] || 0} · ${counts["differentiator"] || 0} · ${counts["red flag"] || 0}`, "table stakes · differentiators · red flags")),
    (() => {
      const pick = v => ok.filter(r => r.verdict === v && !r.mid.startsWith("hybrid_")).sort((a, b) => (b.diff ?? 0) - (a.diff ?? 0));
      const col = (title, v, cls, ico, blurb, lim = 8) => { const L = v === "red flag" ? pick(v).reverse() : pick(v);
        return h("div", {}, h("div", { style: "margin-bottom:6px;font-weight:600" }, chip(v), " ", title), h("div", { class: "muted", style: "font-size:12px;margin-bottom:6px" }, blurb),
          L.length ? h("ul", { class: "list-tight" }, L.slice(0, lim).map(r => h("li", {}, h("a", { href: "#", onclick: e => { e.preventDefault(); openMechanic(r.mid); } }, mname(r.mid)),
            h("span", { class: "muted" }, ` ${fmt.d1(r.diff)} · in ${fmt.pct(r.prevHits)} of hits`)))) : h("div", { class: "muted" }, "none at this sample size")); };
      return h("div", { class: "card", style: "margin-top:16px" }, h("h3", {}, `What ${state.sub ? mname(state.sub) : "a roguelike"} needs — evidence from ${im.n} games`),
        h("div", { class: "grid g3" },
          col("Must have (table stakes)", "table stakes", "good", "●", "Most hits have these; lacking them raises flop risk."),
          col("Differentiators", "differentiator", "warning", "◆", "Uncommon, but strongly associated with success."),
          col("Red flags", "red flag", "critical", "▲", "Associated with weaker outcomes here.")),
        h("div", { class: "muted", style: "margin-top:8px;font-size:12px" }, "Δ = Success Index points vs games without, stratified by tag source. Associations, not guarantees — see Method."));
    })(),
    h("div", { class: "grid g21", style: "margin-top:16px" },
      h("div", { class: "card" }, h("h3", {}, "Which mechanics move the needle"),
        h("div", { class: "muted", style: "margin-bottom:8px" }, `Δ ${OUT_LABEL[state.out]} (points) for games with vs without the mechanic, compared within the same tag source${state.adjust ? " and documentation depth" : ""}. Bar = estimate, whisker = 95% CI. Click for the multivariate (ridge) estimate and detail.`),
        hbars([...top.slice(0, 12), ...top.slice(-6)].map(r => ({ label: mname(r.mid), value: r.diff, lo: r.lo, hi: r.hi, sub: `${r.verdict} · prevalence ${fmt.pct(r.prev)}`, onclick: () => openMechanic(r.mid) })),
          { diverging: true, fmtv: fmt.d1, width: 760, labelW: 210 })),
      h("div", { class: "grid", style: "align-content:start" },
        h("div", { class: "card" }, h("h3", {}, `${OUT_LABEL[state.out]} distribution`), histogram(ys, { xlabel: OUT_LABEL[state.out], width: 460, height: 190 })),
        comp.length > 2 ? h("div", { class: "card" }, h("h3", {}, "Complexity curve"), h("div", { class: "muted" }, "Mean Success Index by number of mechanics tagged (precomputed scope)"),
          lineChart(comp.map(c => ({ x: c.lo, xl: `${c.lo}–${c.hi === 200 ? "+" : c.hi - 1}`, y: c.mean, n: c.n })), { width: 460, height: 190, xlabel: "# mechanics" })) : null)),
    h("div", { class: "card", style: "margin-top:16px" }, h("h3", {}, `${OUT_LABEL[state.out]} of every game, by subgenre`),
      h("div", { class: "muted" }, "Each dot is a game (solid = curated, hover/click those); black bar = median. Shows the spread a publisher actually faces in each genre, not just the average."),
      stripPlot(HYBRIDS.map((hy, i) => ({ label: mname(hy), color: SUB_COLOR(hy), rows: im.slice.filter(r => r.g.sg === hy) })).filter(g => g.rows.length >= 5).sort((a, b) => quantile(b.rows.map(r => r.y).sort((x, y) => x - y), .5) - quantile(a.rows.map(r => r.y).sort((x, y) => x - y), .5)))),
    h("div", { class: "card", style: "margin-top:16px" }, h("h3", {}, "Design score vs actual outcome"),
      h("div", { class: "muted" }, "Each dot is a game. x = Success Index predicted from its mechanics alone (model never saw the game), y = actual. Above the diagonal = beat its design; below = under-delivered. Click a dot."),
      designScatter(im.slice.filter(r => r.g.ds != null), { width: 1100, height: 420 })),
    h("div", { class: "grid g2", style: "margin-top:16px" },
      h("div", { class: "card" }, h("h3", {}, "Games per subgenre"), hbars(subs.map(x => ({ label: mname(x.hy), value: x.n, onclick: () => { $("#f-sub").value = x.hy; $("#f-sub").dispatchEvent(new Event("change")); } })), { fmtv: fmt.n, width: 600 })),
      h("div", { class: "card" }, h("h3", {}, `Median ${OUT_LABEL[state.out]} per subgenre`), hbars(subs.filter(x => x.n >= 5).map(x => ({ label: mname(x.hy), value: x.med, sub: `n=${x.n}` })), { fmtv: fmt.f1, width: 600, max: 100 }))));
}

function viewMechanics() {
  const im = impact(), el = $("#view-mechanics");
  let fam = el.dataset.fam || "", q = el.dataset.q || "";
  const rows = im.rows.filter(r => (!fam || MECH[r.mid].family === fam) && (!q || mname(r.mid).toLowerCase().includes(q.toLowerCase())));
  const famSel = h("select", { onchange: e => { el.dataset.fam = e.target.value; viewMechanics(); } }, h("option", { value: "" }, "All families"), FAMS.map(f => h("option", { value: f.id, selected: f.id === fam }, f.name)));
  const search = h("input", { class: "search", placeholder: "Search mechanics…", value: q, oninput: e => { el.dataset.q = e.target.value; clearTimeout(el._t); el._t = setTimeout(() => { viewMechanics(); const s2 = el.querySelector(".search"); s2.focus(); s2.setSelectionRange(s2.value.length, s2.value.length); }, 200); } });
  put(el, 
    h("h2", {}, "Mechanic impact table"),
    h("p", { class: "sub" }, `Live with/without comparison on the current slice (n=${im.n}). Δ = mean ${OUT_LABEL[state.out]} of games with the mechanic minus games without (95% Welch CI). Ridge = partial effect controlling for every other mechanic + covariates (precomputed${state.sub && AN.subgenres[state.sub] ? " for this subgenre" : ""}). Hit lift = P(top-25% | has) ÷ P(top-25% | lacks); flop ratio < 1 means lower downside risk.`),
    h("div", { class: "card" }, h("div", { class: "row", style: "margin-bottom:10px" }, famSel, search, h("span", { class: "legend" }, VERDICT_ORDER.map(v => chip(v, true)))),
      table([
        { key: "name", label: "Mechanic", render: r => h("span", {}, mname(r.mid), h("div", { class: "muted", style: "font-size:11px" }, famName(MECH[r.mid].family))), sort: r => mname(r.mid) },
        { key: "prev", label: "Prevalence", num: true, render: r => fmt.pct(r.prev) },
        { key: "m1", label: "Mean with", num: true, render: r => fmt.f1(r.m1) },
        { key: "diff", label: "Δ vs without (95% CI)", num: true, render: r => effectCell(r), title: "Difference stratified by tag source (curated vs auto)", sort: r => r.verdict === "insufficient data" ? null : r.diff },
        { key: "ridge", label: "Ridge Δ", num: true, render: r => fmt.d1(r.ridge), title: "Partial effect, other factors held constant" },
        { key: "matt", label: "Matched Δ", num: true, render: r => r.matt == null ? "–" : h("span", {}, fmt.d1(r.matt), r.robust ? h("span", { title: "robust: matched comparison agrees and excludes 0", style: "margin-left:4px" }, "✓") : null), title: "vs 5 most similar games without it (precomputed scope)" },
        { key: "lift", label: "Hit lift", num: true, render: r => fmt.f2(r.lift) },
        { key: "flopR", label: "Flop ratio", num: true, render: r => fmt.f2(r.flopR) },
        { key: "verdict", label: "Verdict", render: r => chip(r.verdict, true), sort: r => VERDICT_ORDER.indexOf(r.verdict) },
      ], rows.map(r => ({ ...r, name: mname(r.mid) })), { onRow: r => openMechanic(r.mid), initialSort: ["diff", -1] })),
    (() => { const q = fieldDeltas("q"), c = fieldDeltas("c"); const pts = Object.keys(q).filter(m => c[m]).map(m => ({ mid: m, dq: q[m].d, dc: c[m].d, n: q[m].n }));
      return h("div", { class: "card", style: "margin-top:16px" }, h("h3", {}, "Do players love it, or does it sell? (quality vs revenue)"),
        h("div", { class: "muted" }, "Each mechanic's stratified effect on review-quality percentile (x) and revenue percentile (y). Size = games; color = family. Top-right is the sweet spot; top-left sells despite players; bottom-right are cult favourites."),
        legendSw(FAMS.slice(0, 7).map(f => [f.name, FAM_COLOR(f.id)]).concat([["Other families", OTHER]])), quadrantScatter(pts)); })(),
    h("div", { class: "card", style: "margin-top:16px" }, h("h3", {}, "Prevalence vs impact"), h("div", { class: "muted" }, "Top-left: rare and strong (differentiators). Top-right: common and strong (table stakes). Bottom: associated with weaker outcomes."),
      effectScatter(rows, { width: 1100, height: 420, onclick: openMechanic })));
}

function viewFamilies() {
  const im = impact(), eff = new Map(im.rows.map(r => [r.mid, r])), el = $("#view-families");
  const famStats = (im.scope && im.scope.families) || [];
  put(el, 
    h("h2", {}, "Mechanic families — the textbook"),
    h("p", { class: "sub" }, "Family → subfamily → mechanic. Cell color = Δ outcome (blue better, red worse, gray ≈ no difference / insufficient data). Click any mechanic."),
    h("div", { class: "scale" }, "worse", h("span", { class: "bar", style: "background:linear-gradient(90deg,var(--neg),var(--mid),var(--pos))" }), "better", h("span", { class: "muted" }, "(±12 pts saturates)")),
    famStats.length ? h("div", { class: "card", style: "margin-bottom:16px" }, h("h3", {}, "Family depth vs success"),
      h("div", { class: "muted" }, "Partial Spearman correlation between a game's number of significant mechanics in each family and its Success Index, controlling for its total tag count (curated games, precomputed scope). Positive = investing in this family beyond the game's overall depth goes with success."),
      hbars(famStats.filter(f => f.spearman != null).sort((a, b) => b.spearman - a.spearman).map(f => ({ label: f.name, value: f.spearman, sub: `mean depth ${fmt.f1(f.mean_depth)} of ${f.n_mechanics}` })), { diverging: true, fmtv: fmt.f2, width: 760, max: 0.5 })) : null,
    AN.heatmap ? h("div", { class: "card", style: "margin-bottom:16px" }, h("h3", {}, "Genre DNA: mechanic prevalence by subgenre"),
      h("div", { class: "muted", style: "margin-bottom:8px" }, "Share of curated games in each subgenre that use each of the 30 most common mechanics. Darker = more universal in that genre. Numbers shown at ≥50%."),
      h("div", { style: "overflow-x:auto" }, heatmapChart(AN.heatmap))) : null,
    AN.archetypes ? h("div", { class: "card", style: "margin-bottom:16px" }, h("h3", {}, "Emergent design archetypes (data-driven)"),
      h("div", { class: "muted", style: "margin-bottom:10px" }, `Non-negative matrix factorisation of ${AN.archetypes.n_games} curated games × mechanics finds ${AN.archetypes.k} bundles of mechanics that travel together. Each game is a mix; "dominant" = its largest share. ρ = correlation between a game's share of the archetype and its Success Index.`),
      h("div", { class: "fam-grid" }, AN.archetypes.archetypes.map(a => h("div", { class: "card tight" },
        h("div", { class: "row", style: "justify-content:space-between" }, h("b", {}, a.mechanics.slice(0, 2).map(m => mname(m.id)).join(" + ")),
          h("span", { class: "muted" }, `n=${a.n_dominant}`)),
        h("div", { class: "row", style: "margin:6px 0" }, h("span", { class: "chip small" }, `median GSI ${fmt.f1(a.median_gsi)}`), h("span", { class: "chip small" }, `ρ ${fmt.f2(a.corr_with_gsi)}`),
          a.subgenres.slice(0, 2).map(([sg, n]) => h("span", { class: "chip small" }, `${mname(sg)} ${n}`))),
        h("div", { class: "cells" }, a.mechanics.map(m => { const c = h("span", { class: "cell", style: `background:color-mix(in oklab, var(--accent) ${Math.round(m.w * 70)}%, var(--surface-2))`, onclick: () => openMechanic(m.id) }, mname(m.id)); return c; })),
        h("div", { class: "muted", style: "font-size:12px;margin-top:6px" }, "e.g. " + a.games.slice(0, 4).join(", ")))))) : null,
    h("div", { class: "fam-grid" }, FAMS.map(f => h("div", { class: "card fam-card" },
      h("h3", {}, f.name, h("span", { class: "muted", style: "font-weight:400;font-size:12px" }, `${f.subfamilies.reduce((a, sf) => a + sf.mechanics.length, 0)} mechanics`)),
      h("div", { class: "muted", style: "font-size:12px" }, f.desc),
      f.subfamilies.map(sf => h("div", { class: "sf" }, h("div", { class: "sf-name" }, sf.name),
        h("div", { class: "cells" }, sf.mechanics.map(mid => {
          const r = eff.get(mid), ok = r && r.verdict !== "insufficient data", d = ok ? r.diff : null;
          const c = h("span", { class: "cell " + divText(d), style: `background:${divFill(d)}`, onclick: () => openMechanic(mid) }, mname(mid));
          hover(c, () => [ok ? fmt.d1(d) + " pts" : "insufficient data", mname(mid), [MECH[mid].desc, r ? `${fmt.pct(r.prev)} of games · ${r.verdict}` : ""]]);
          return c;
        }))))))));
}

function viewGames() {
  const im = impact(), el = $("#view-games");
  const q = (el.dataset.q || "").toLowerCase();
  const rows = im.slice.filter(r => !q || r.g.n.toLowerCase().includes(q) || (r.g.dev || "").toLowerCase().includes(q))
    .map(r => ({ id: r.g.id, n: r.g.n, dev: r.g.dev, y: r.g.y, sg: mname(r.g.sg), rv: r.g.rv, pr: r.g.pr, rev: r.g.rev, crit: r.g.mc || (r.g.ign ? r.g.ign * 10 : null), out: r.y, ds: r.g.ds, gap: r.g.ds != null && r.g.gsi != null ? r.g.gsi - r.g.ds : null, nm: Object.keys(r.g.m).length, src: r.g.src }));
  const search = h("input", { class: "search", placeholder: "Search games or developers…", value: el.dataset.q || "", style: "width:320px",
    oninput: e => { el.dataset.q = e.target.value; clearTimeout(el._t); el._t = setTimeout(() => { viewGames(); const s2 = el.querySelector(".search"); s2.focus(); s2.setSelectionRange(s2.value.length, s2.value.length); }, 200); } });
  put(el, h("h2", {}, "Game explorer"), h("p", { class: "sub" }, "Every game in the slice with its outcomes. Click a game for its mechanic fingerprint, design comps, and to load it into the Design Lab."),
    h("div", { class: "card" }, h("div", { class: "row", style: "margin-bottom:10px" }, search, h("span", { class: "muted" }, `${rows.length} games`)),
      table([
        { key: "n", label: "Game" }, { key: "dev", label: "Developer", render: r => (r.dev || "").slice(0, 28) }, { key: "y", label: "Year", num: true },
        { key: "sg", label: "Subgenre" }, { key: "rv", label: "Reviews", num: true, render: r => fmt.n(r.rv) },
        { key: "pr", label: "Positive", num: true, render: r => fmt.pct(r.pr) }, { key: "rev", label: "Est. revenue", num: true, render: r => fmt.usd(r.rev) },
        { key: "crit", label: "Critic", num: true, render: r => r.crit ? Math.round(r.crit) : "–" },
        { key: "out", label: OUT_LABEL[state.out], num: true, render: r => fmt.f1(r.out) },
        { key: "ds", label: "Design score", num: true, render: r => fmt.f1(r.ds), title: "Success Index predicted from mechanics alone (out-of-fold)" },
        { key: "gap", label: "Over/under", num: true, render: r => r.gap == null ? "–" : fmt.d1(r.gap), title: "Actual − design score: execution, marketing, timing" },
        { key: "nm", label: "# mech", num: true }, { key: "src", label: "Tags", render: r => r.src === "curated" ? "curated" : "auto" },
      ], rows, { onRow: r => openGame(r.id), initialSort: ["out", -1], limit: 400 })));
}

// ---------- Design Lab ----------
const lab = { vec: {}, sub: "hybrid_action_roguelite", price: 19.99, year: 2026, ea: false, free: false, from: null };
function loadTemplate(g) {
  lab.vec = Object.fromEntries(Object.entries(g.m).filter(([k]) => !k.startsWith("hybrid_")).map(([k, v]) => [k, v[0]]));
  lab.sub = g.sg; lab.price = g.p || 0; lab.free = !!g.f; lab.ea = !!g.ea; lab.year = g.y || 2026; lab.from = g.n;
}
function labToHash() {
  const m = Object.entries(lab.vec).map(([k, v]) => `${k}:${v}`).join(",");
  return `#lab?s=${lab.sub}&p=${lab.price}&y=${lab.year}&ea=${+lab.ea}&f=${+lab.free}&m=${m}`;
}
function labFromHash() {
  const q = location.hash.split("?")[1]; if (!q) return false;
  const P = new URLSearchParams(q);
  if (P.get("s") && MECH[P.get("s")]) lab.sub = P.get("s");
  lab.price = +(P.get("p") || lab.price); lab.year = +(P.get("y") || lab.year); lab.ea = P.get("ea") === "1"; lab.free = P.get("f") === "1";
  lab.vec = {}; (P.get("m") || "").split(",").filter(Boolean).forEach(kv => { const [k, v] = kv.split(":"); if (MECH[k]) lab.vec[k] = Math.max(1, Math.min(3, +v || 1)); });
  lab.from = "shared link"; return true;
}
// Scoring uses the pooled all-roguelike model (subgenre as covariate): per-subgenre samples are too small for
// stable mechanic coefficients. Verdict lists (table stakes / red flags) use the subgenre scope when it exists.
function labScope() { return AN.scopes.all; }
function labVerdictScope() { return AN.subgenres[lab.sub] || AN.scopes.all; }
function predict(vec, scopeOverride) {
  const sc = scopeOverride || labScope(), r = sc && sc.ridge; if (!r) return null;
  let y = r.intercept;
  r.features.forEach((f, i) => {
    const c = r.coefs[i].coef; let x = 0;
    if (MECH[f]) x = vec[f] ? 1 : 0;
    else if (f.startsWith("subgenre=")) x = f === "subgenre=" + lab.sub ? 1 : 0;
    else if (f === "year-2020") x = lab.year - 2020;
    else if (f === "log10_price") x = lab.price > 0 && !lab.free ? Math.log10(lab.price) : 0;
    else if (f === "free_to_play") x = lab.free ? 1 : 0;
    else if (f === "early_access") x = lab.ea ? 1 : 0;
    else if (f === "curated_profile") x = 1; // a Lab design is fully hand-tagged, like a curated profile
    else if (f === "tag_depth_z") x = 0;     // assume average documentation depth
    else if (f === "dev_prior_titles_log") x = Math.log1p(lab.priorTitles || 0);
    else if (f === "dev_prior_hit") x = lab.priorHit ? 1 : 0;
    y += c * x;
  });
  return { y: Math.max(0, Math.min(100, y)), rmse: r.cv_rmse, base: r.baseline_rmse, scopeN: sc.n };
}
function ncdf(z) { const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }

function viewLab() {
  const el = $("#view-lab");
  const sc = labScope(), vs = labVerdictScope();
  const coef = new Map(((sc.ridge || {}).coefs || []).map(c => [c.feature, c]));
  const subEff = new Map((vs.mechanics || []).map(r => [r.mechanic, r]));
  const allGsi = GAMES.filter(g => g.sg === lab.sub && g.gsi != null).map(g => g.gsi).sort((a, b) => a - b);
  const pr = predict(lab.vec);
  const vecFull = { ...lab.vec, [lab.sub]: 3 };
  const comps = similar(vecFull, { k: 25 });
  const compG = comps.map(c => c.g.gsi).filter(v => v != null);
  const hitT = vs.hit_threshold, flopT = vs.flop_threshold;
  const wsum = comps.reduce((a, c) => a + c.sim, 0) || 1;
  const compHit = comps.reduce((a, c) => a + (c.g.gsi >= hitT ? c.sim : 0), 0) / wsum;
  const compFlop = comps.reduce((a, c) => a + (c.g.gsi != null && c.g.gsi <= flopT ? c.sim : 0), 0) / wsum;
  const pctile = pr ? 100 * allGsi.filter(v => v <= pr.y).length / Math.max(1, allGsi.length) : null;
  const pFlop = pr ? ncdf((flopT - pr.y) / pr.rmse) : null, pHit = pr ? 1 - ncdf((hitT - pr.y) / pr.rmse) : null;
  const stakes = (vs.mechanics || []).filter(r => r.verdict === "table stakes" && !r.mechanic.startsWith("hybrid_"));
  const missing = stakes.filter(r => !lab.vec[r.mechanic]);
  const flags = (vs.mechanics || []).filter(r => r.verdict === "red flag" && lab.vec[r.mechanic]);
  const subGames = GAMES.filter(g => g.sg === lab.sub);
  const genrePrev = m => subGames.length ? subGames.filter(g => g.m[m]).length / subGames.length : 0;
  const adds = [...coef.values()].filter(c => c.is_mechanic && !lab.vec[c.feature] && c.coef > 0 && genrePrev(c.feature) >= 0.1).sort((a, b) => (b.ci_lo > 0) - (a.ci_lo > 0) || b.coef - a.coef).slice(0, 8);
  const hitComps = comps.filter(c => c.g.gsi >= hitT);
  const hitCommon = Object.keys(MECH).filter(m => !m.startsWith("hybrid_") && !lab.vec[m] && hitComps.length >= 3 && hitComps.filter(c => c.g.m[m]).length / hitComps.length >= 0.6);
  const risk = pFlop == null ? null : pFlop >= 0.4 ? ["critical", "▲", "High risk"] : pFlop >= 0.25 ? ["serious", "▲", "Elevated risk"] : pHit >= 0.35 ? ["good", "●", "Strong design"] : ["warning", "◆", "Moderate"];

  const templateSel = h("select", { onchange: e => { const g = BY_ID.get(+e.target.value); if (g) { loadTemplate(g); viewLab(); } } },
    h("option", { value: "" }, lab.from ? `Template: ${lab.from}` : "Load a game as template…"),
    [...GAMES].filter(g => g.src === "curated").sort((a, b) => a.n.localeCompare(b.n)).map(g => h("option", { value: g.id }, g.n)));
  const controls = h("div", { class: "lab-controls" },
    h("label", {}, "Subgenre", h("select", { onchange: e => { lab.sub = e.target.value; viewLab(); } }, HYBRIDS.map(hy => h("option", { value: hy, selected: hy === lab.sub }, mname(hy))))),
    h("label", {}, "Price (USD)", h("input", { type: "number", min: 0, step: 1, value: lab.price, style: "width:90px", onchange: e => { lab.price = +e.target.value; viewLab(); } })),
    h("label", {}, "Release year", h("input", { type: "number", min: 2010, max: 2030, value: lab.year, style: "width:90px", onchange: e => { lab.year = +e.target.value; viewLab(); } })),
    h("label", { style: "flex-direction:row;align-items:center;gap:6px" }, h("input", { type: "checkbox", checked: lab.ea, onchange: e => { lab.ea = e.target.checked; viewLab(); } }), "Early Access"),
    h("label", { style: "flex-direction:row;align-items:center;gap:6px" }, h("input", { type: "checkbox", checked: lab.free, onchange: e => { lab.free = e.target.checked; viewLab(); } }), "Free-to-play"),
    h("label", {}, "Team's prior roguelikes", h("input", { type: "number", min: 0, max: 20, value: lab.priorTitles || 0, style: "width:70px", onchange: e => { lab.priorTitles = +e.target.value; viewLab(); } })),
    h("label", { style: "flex-direction:row;align-items:center;gap:6px" }, h("input", { type: "checkbox", checked: !!lab.priorHit, onchange: e => { lab.priorHit = e.target.checked; viewLab(); } }), "Team had a prior hit"),
    h("label", {}, "Template", templateSel),
    h("button", { class: "btn secondary", onclick: () => { lab.vec = {}; lab.from = null; viewLab(); } }, "Clear"),
    h("button", { class: "btn", onclick: openDocTagger }, "Paste design doc…"));
  const picker = FAMS.filter(f => f.id !== "structure_hybrid").map(f => {
    const ms = f.subfamilies.flatMap(sf => sf.mechanics), on = ms.filter(m => lab.vec[m]).length;
    const det = h("details", { class: "lab-fam", open: el.dataset["open_" + f.id] !== "0" ? true : null, ontoggle: e => { el.dataset["open_" + f.id] = e.target.open ? "1" : "0"; } },
      h("summary", {}, f.name, h("span", { class: "cnt" }, `${on}/${ms.length}`)),
      ms.map(mid => {
        const i = lab.vec[mid] || 0, c = coef.get(mid), se = subEff.get(mid);
        const b = h("span", { class: `lab-mech i${i}`, onclick: () => { const n = ((lab.vec[mid] || 0) + 1) % 4; if (n) lab.vec[mid] = n; else delete lab.vec[mid]; viewLab(); } },
          i ? intenDots(i) : null, mname(mid), c ? h("span", { class: "eff" }, fmt.d1(c.coef)) : null);
        hover(b, () => [mname(mid), MECH[mid].desc, [c ? `partial effect ${fmt.d1(c.coef)} (CI ${fmt.d1(c.ci_lo)}…${fmt.d1(c.ci_hi)})` : "not in model (too rare/common)", se && se.verdict ? `verdict in ${AN.subgenres[lab.sub] ? mname(lab.sub) : "all roguelikes"}: ${se.verdict}${se.diff != null ? ` (Δ ${fmt.d1(se.diff)})` : ""}` : "", "click to cycle: off → present → significant → core"]]);
        return b;
      }));
    return det;
  });
  const out = h("div", { class: "card lab-out" },
    h("div", { class: "tile-label" }, `Predicted Success Index · pooled model (n=${sc.n}, subgenre as covariate) · verdicts from ${AN.subgenres[lab.sub] ? mname(lab.sub) + ` (n=${vs.n})` : "all roguelikes"}`),
    h("div", { class: "hero" }, h("span", { class: "hero-value" }, pr ? fmt.f1(pr.y) : "–"), pr ? h("span", { class: "muted" }, `± ${fmt.f1(pr.rmse)} (CV RMSE)`) : null),
    pr ? h("div", { class: "meter", title: `percentile ${Math.round(pctile)}` }, h("div", { style: `width:${pctile}%` })) : null,
    pr ? h("div", { class: "tile-note" }, `${Math.round(pctile)}th percentile of ${allGsi.length} ${mname(lab.sub)} games`) : null,
    revenueBlock(comps),
    (() => { const pq = predict(lab.vec, AN.scopes["all:quality_pct"]), pc = predict(lab.vec, AN.scopes["all:commercial_pct"]);
      return pq && pc ? h("div", { class: "grid g2", style: "margin-top:10px" },
        tile("Will players love it?", fmt.f1(pq.y), `predicted review-quality percentile ± ${fmt.f1(pq.rmse)}`),
        tile("Will it sell?", fmt.f1(pc.y), `predicted revenue percentile ± ${fmt.f1(pc.rmse)}`)) : null; })(),
    risk ? h("div", { class: `status ${risk[0]}`, style: "margin-top:10px" }, h("span", { class: "ico" }, risk[1]), risk[2], h("span", { class: "muted", style: "font-weight:400" }, `P(hit) ${fmt.pct(pHit)} · P(flop) ${fmt.pct(pFlop)} (model)`)) : null,
    h("div", { class: "grid g2", style: "margin-top:12px" },
      tile("Comps hit rate", fmt.pct(compHit), `25 nearest designs, similarity-weighted`),
      tile("Comps flop rate", fmt.pct(compFlop), compG.length ? `comp median ${fmt.f1(quantile([...compG].sort((a, b) => a - b), 0.5))}` : "")),
    (() => { const hitsC = comps.filter(c => c.g.gsi >= hitT).map(c => c.g); if (hitsC.length < 2) return null;
      const acc = famProfile({}).map(() => 0); hitsC.forEach(x => famProfile(Object.fromEntries(Object.entries(x.m).map(([k, v]) => [k, v[0]]))).forEach((v, i) => acc[i] += v / hitsC.length));
      return h("div", { style: "margin-top:12px" }, h("h3", {}, "Design shape vs your hit comps"), radar([{ label: "Your design", color: "var(--series-1)", vals: famProfile(lab.vec) }, { label: `Hit comps (n=${hitsC.length})`, color: "var(--series-3)", vals: acc }], { size: 300 })); })(),
    h("h3", { style: "margin-top:16px" }, `Missing table stakes (${missing.length})`),
    missing.length ? h("ul", { class: "list-tight" }, missing.map(r => h("li", {}, h("a", { href: "#", onclick: e => { e.preventDefault(); lab.vec[r.mechanic] = 2; viewLab(); } }, mname(r.mechanic)),
      h("span", { class: "muted" }, ` — in ${fmt.pct(r.prev_in_hits)} of hits, flop ratio ${fmt.f2(r.flop_ratio)}`)))) : h("div", { class: "muted" }, "None — genre fundamentals covered."),
    h("h3", { style: "margin-top:14px" }, `Red flags present (${flags.length})`),
    flags.length ? h("ul", { class: "list-tight" }, flags.map(r => h("li", {}, mname(r.mechanic), h("span", { class: "muted" }, ` — Δ ${fmt.d1(r.diff)} (CI ${fmt.d1(r.ci_lo)}…${fmt.d1(r.ci_hi)})`)))) : h("div", { class: "muted" }, "None."),
    h("h3", { style: "margin-top:14px" }, "Highest-leverage additions"), h("div", { class: "muted", style: "font-size:12px" }, `mechanics used by ≥10% of ${mname(lab.sub)} games, ranked by partial effect`),
    h("ul", { class: "list-tight" }, adds.map(c => h("li", {}, h("a", { href: "#", onclick: e => { e.preventDefault(); lab.vec[c.feature] = 2; viewLab(); } }, mname(c.feature)),
      h("span", { class: "muted" }, ` +${fmt.f1(c.coef)} pts${c.ci_lo > 0 ? " (CI > 0)" : ""}`)))),
    hitCommon.length ? h("div", {}, h("h3", { style: "margin-top:14px" }, "Common in your hit comps, missing here"), h("div", { class: "muted" }, hitCommon.map(mname).join(" · "))) : null,
    h("h3", { style: "margin-top:14px" }, "Closest comps"),
    table([{ key: "n", label: "Game", render: x => x.g.n }, { key: "sim", label: "Sim", num: true, render: x => fmt.pct(x.sim) },
      { key: "gsi", label: "GSI", num: true, render: x => fmt.f1(x.g.gsi) }, { key: "rev", label: "Est. rev", num: true, render: x => fmt.usd(x.g.rev) }],
      comps.slice(0, 10).map(x => ({ ...x, n: x.g.n })), { onRow: x => openGame(x.g.id) }),
    h("div", { class: "row", style: "margin-top:12px" }, h("button", { class: "btn secondary", onclick: () => { const url = location.href.split("#")[0] + labToHash(); navigator.clipboard.writeText(url).then(() => alert("Shareable link copied."), () => prompt("Copy this link:", url)); } }, "Copy share link"),
      h("button", { class: "btn secondary", onclick: () => window.print() }, "Print / PDF"),
      h("button", { class: "btn", onclick: () => copyReport({ pr, pctile, pHit, pFlop, compHit, compFlop, missing, flags, adds, comps }) }, "Copy pitch report (Markdown)")));
  put(el, h("h2", {}, "Design Lab — score a game design"),
    h("p", { class: "sub" }, "Tag a design (yours, a pitch, or a template), get a predicted Success Index from the subgenre's ridge model, risk from nearest comps, and the gaps vs what hits in this genre have. Click a mechanic to cycle intensity. Small numbers = partial effect in points."),
    controls, h("div", { class: "lab" }, h("div", { class: "card" }, picker), out));
}
/** Tag free text (a design doc / pitch) with the taxonomy's keyword rules, client-side. */
function tagText(text) {
  const t = " " + text.toLowerCase().replace(/[^a-z0-9+\-/' ]+/g, " ") + " ";
  const out = {};
  for (const [mid, m] of Object.entries(MECH)) {
    if (mid.startsWith("hybrid_")) continue;
    let hits = 0;
    for (const kw of m.kw || []) {
      const k = kw.toLowerCase().replace(/[^a-z0-9+\-/' ]+/g, " ").trim();
      if (k.length < 3) continue;
      const re = new RegExp(`(^|[^a-z])${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`);
      if (re.test(t)) hits++;
    }
    if (hits) out[mid] = hits >= 2 ? 2 : 1;
  }
  return out;
}
function openDocTagger() {
  const ta = h("textarea", { style: "width:100%;height:260px;background:var(--surface-2);color:var(--text-primary);border:1px solid var(--border);border-radius:8px;padding:10px;font:13px/1.5 system-ui", placeholder: "Paste a game design doc, pitch deck text, or Steam page description…" });
  const res = h("div", { style: "margin-top:10px" });
  const run = merge => {
    const tags = tagText(ta.value);
    if (!merge) lab.vec = {};
    for (const [k, v] of Object.entries(tags)) lab.vec[k] = Math.max(lab.vec[k] || 0, v);
    lab.from = "design doc"; $("#drawer-close").click(); viewLab();
  };
  ta.addEventListener("input", () => { const tags = tagText(ta.value); put(res, h("div", { class: "muted" }, `${Object.keys(tags).length} mechanics detected:`), h("div", {}, Object.keys(tags).map(m => h("span", { class: "chip small", style: "margin:2px" }, mname(m))))); });
  openDrawer(h("h2", {}, "Score a design doc"), h("p", { class: "sub" }, "Keyword detection uses the same rules as the auto-tagger, so treat it as a first pass: review the chips in the Lab afterwards and set intensities by hand. Nothing leaves your browser."),
    ta, res, h("div", { class: "row", style: "margin-top:12px" }, h("button", { class: "btn", onclick: () => run(false) }, "Replace Lab design"), h("button", { class: "btn secondary", onclick: () => run(true) }, "Merge into Lab design")));
}
/** Revenue projection: map predicted commercial percentile onto the actual revenue distribution; ROI from comps. */
function revenueBlock(comps) {
  const pc = predict(lab.vec, AN.scopes["all:commercial_pct"]); if (!pc) return null;
  const revs = GAMES.filter(g => g.rev && g.c != null).sort((a, b) => a.c - b.c);
  const at = pct => { const i = revs.findIndex(g => g.c >= pct); return (revs[i < 0 ? revs.length - 1 : i] || {}).rev || 0; };
  const mid = at(pc.y);
  const compRev = comps.map(c => c.g.rev).filter(Boolean).sort((a, b) => a - b);
  const lo = compRev.length >= 4 ? quantile(compRev, 0.25) : at(Math.max(0, pc.y - pc.rmse / 2)), hi = compRev.length >= 4 ? quantile(compRev, 0.75) : at(Math.min(100, pc.y + pc.rmse / 2));
  const budget = lab.budget || 0, net = 0.7;
  const cr = comps.filter(c => c.g.rev).map(c => ({ w: c.sim, v: c.g.rev * net }));
  const W = cr.reduce((a, c) => a + c.w, 0) || 1;
  const pBreak = budget > 0 ? cr.reduce((a, c) => a + (c.v >= budget ? c.w : 0), 0) / W : null;
  const exp = cr.reduce((a, c) => a + c.w * c.v, 0) / W;
  const sorted = [...cr].sort((a, b) => a.v - b.v); let acc = 0; const medComp = (sorted.find(c => (acc += c.w) >= W / 2) || {}).v;
  const tiersDef = [[0, 1e5, "<$100K", "var(--series-8)"], [1e5, 1e6, "$100K–1M", "var(--series-4)"], [1e6, 1e7, "$1M–10M", "var(--series-3)"], [1e7, 1e13, "$10M+", "var(--series-1)"]];
  const cw = comps.filter(c => c.g.rev), CW = cw.reduce((a, c) => a + c.sim, 0) || 1;
  const tierP = tiersDef.map(([a, b]) => cw.reduce((acc, c) => acc + (c.g.rev >= a && c.g.rev < b ? c.sim : 0), 0) / CW);
  const bar = h("div", { style: "display:flex;height:22px;border-radius:6px;overflow:hidden;gap:2px;margin:6px 0 4px" },
    tiersDef.map(([, , label, col], i) => tierP[i] > 0 ? (() => { const seg = h("div", { style: `flex:${tierP[i]};background:${col};color:#fff;font-size:11px;display:flex;align-items:center;justify-content:center;min-width:2px` }, tierP[i] >= 0.12 ? fmt.pct(tierP[i]) : ""); hover(seg, () => [fmt.pct(tierP[i]), `comps grossing ${label}`]); return seg; })() : null));
  return h("div", { class: "card tight", style: "margin-top:10px" },
    h("div", { class: "tile-label" }, "Revenue tier odds (similarity-weighted comps)"), bar,
    legendSw(tiersDef.map(([, , l, c]) => [l, c])),
    h("div", { class: "row", style: "justify-content:space-between;align-items:flex-start;margin-top:8px" },
      h("div", {}, h("div", { class: "tile-label" }, "Projected gross revenue (model)"), h("div", { class: "tile-value" }, fmt.usd(mid)), h("div", { class: "tile-note" }, `comps' middle 50%: ${fmt.usd(lo)} – ${fmt.usd(hi)}`)),
      h("div", {}, h("div", { class: "tile-label" }, "Comps: net to developer"), h("div", { class: "tile-value" }, fmt.usd(medComp)), h("div", { class: "tile-note" }, `median of 25 comps · mean ${fmt.usd(exp)} (hits skew it)`))),
    h("div", { class: "row", style: "margin-top:10px;align-items:center" },
      h("label", { style: "flex-direction:row;display:flex;gap:6px;align-items:center;font-size:12px;color:var(--text-secondary)" }, "Budget $",
        h("input", { type: "number", min: 0, step: 50000, value: budget, style: "width:120px", class: "search", onchange: e => { lab.budget = +e.target.value; viewLab(); } })),
      budget > 0 ? h("span", { class: `status ${pBreak >= 0.5 ? "good" : pBreak >= 0.25 ? "warning" : "critical"}` }, h("span", { class: "ico" }, pBreak >= 0.5 ? "●" : pBreak >= 0.25 ? "◆" : "▲"),
        `${fmt.pct(pBreak)} of comps recouped this budget`, h("span", { class: "muted", style: "font-weight:400" }, ` · median-comp ROI ${medComp ? ((medComp / budget - 1) * 100).toFixed(0) + "%" : "–"}`)) : h("span", { class: "muted" }, "enter a budget to see break-even odds")));
}
function copyReport(x) {
  const lines = [`# GameCred design assessment`, ``, `**Subgenre:** ${mname(lab.sub)} · **Price:** $${lab.price} · **Release:** ${lab.year}${lab.ea ? " · Early Access" : ""}`,
    `**Mechanics (${Object.keys(lab.vec).length}):** ${Object.entries(lab.vec).map(([k, v]) => `${mname(k)}${"·".repeat(v)}`).join(", ")}`, ``,
    `## Score`, `- Predicted Success Index: **${fmt.f1(x.pr && x.pr.y)}** ± ${fmt.f1(x.pr && x.pr.rmse)} (${Math.round(x.pctile)}th percentile in subgenre)`,
    `- Model P(hit): ${fmt.pct(x.pHit)} · P(flop): ${fmt.pct(x.pFlop)}`,
    `- Quality percentile (players): ${fmt.f1((predict(lab.vec, AN.scopes["all:quality_pct"]) || {}).y)} · Commercial percentile (sales): ${fmt.f1((predict(lab.vec, AN.scopes["all:commercial_pct"]) || {}).y)}`, `- Nearest-25 comps: hit rate ${fmt.pct(x.compHit)}, flop rate ${fmt.pct(x.compFlop)}`, ``,
    `## Missing table stakes`, ...(x.missing.length ? x.missing.map(r => `- ${mname(r.mechanic)} (in ${fmt.pct(r.prev_in_hits)} of hits)`) : ["- none"]), ``,
    `## Red flags`, ...(x.flags.length ? x.flags.map(r => `- ${mname(r.mechanic)} (Δ ${fmt.d1(r.diff)})`) : ["- none"]), ``,
    `## Highest-leverage additions`, ...x.adds.map(c => `- ${mname(c.feature)} (+${fmt.f1(c.coef)} pts)`), ``,
    `## Closest comps`, ...x.comps.slice(0, 10).map(c => `- ${c.g.n} — similarity ${fmt.pct(c.sim)}, GSI ${fmt.f1(c.g.gsi)}, est. revenue ${fmt.usd(c.g.rev)}`), ``,
    `_Generated by GameCred (${D.generated}). Associations, not causal guarantees; see Method._`];
  navigator.clipboard.writeText(lines.join("\n")).then(() => alert("Report copied to clipboard."), () => alert("Copy failed — clipboard unavailable."));
}

function viewSynergy() {
  const el = $("#view-synergy"), sc = ridgeScope() && ridgeScope().synergies && ridgeScope().synergies.length ? ridgeScope() : AN.scopes.all;
  const syn = sc.synergies || [];
  const pos = syn.filter(x => x.interaction > 0).slice(0, 25), neg = syn.filter(x => x.interaction < 0).slice(0, 25);
  const mk = list => table([{ key: "a", label: "Mechanic A", render: r => mname(r.a) }, { key: "b", label: "Mechanic B", render: r => mname(r.b) },
    { key: "interaction", label: "Interaction", num: true, render: r => fmt.d1(r.interaction) }, { key: "z", label: "z", num: true, render: r => fmt.f1(r.z) },
    { key: "n_both", label: "n both", num: true }, { key: "mean_both", label: "Mean (both)", num: true, render: r => fmt.f1(r.mean_both) }], list, { initialSort: ["z", list === neg ? 1 : -1] });
  put(el, h("h2", {}, "Mechanic synergies"),
    h("p", { class: "sub" }, `Interaction = (effect of A when B present) − (effect of A when B absent), in Success Index points. Positive = the pair is worth more than the sum of its parts. Exploratory: ranked by |z|, no multiple-comparison correction (scope n=${sc.n}).`),
    h("div", { class: "card", style: "margin-bottom:16px" }, h("h3", {}, "Mechanic co-occurrence network"),
      h("div", { class: "muted" }, "The 48 most common mechanics around the circle, grouped by family. A curve joins two mechanics that appear together ≥1.6× more often than chance (≥10 curated games); thicker = stronger. Hover a node to isolate its partners."),
      h("div", { style: "display:flex;justify-content:center" }, coNetwork())),
    h("div", { class: "grid g2" }, h("div", { class: "card" }, h("h3", {}, "Super-additive pairs"), mk(pos)), h("div", { class: "card" }, h("h3", {}, "Clashing pairs"), mk(neg))));
}

function viewMethod() {
  const el = $("#view-method"), r = AN.scopes.all.ridge || {};
  const P = t => h("p", {}, t), LI = t => h("li", {}, t);
  put(el, h("div", { class: "method" },
    h("h2", {}, "Method & caveats"),
    P("GameCred turns design evidence into numbers in four steps: (1) a taxonomy of mechanics; (2) per-game mechanic profiles; (3) outcome metrics from public storefront data; (4) statistics linking the two."),
    h("h3", {}, "1 · Mechanics"),
    P(`${Object.keys(MECH).length} mechanics in ${FAMS.length} families. Each game gets an intensity per mechanic: 1 present, 2 significant, 3 core pillar. Curated profiles are expert-tagged from wikis/guides (confidence 1.0). The long tail is auto-tagged from Steam user tags (≈0.7) and store-description keywords (≈0.4); those confidences are re-calibrated against curated ground truth by the self-healing doctor, and unreliable rules are suppressed.`),
    h("h3", {}, "2 · Outcomes"),
    h("ul", {}, LI("Quality = percentile of the SteamDB rating (positive share shrunk toward 50% for small samples)."),
      LI("Commercial = percentile of estimated gross revenue: reviews × owners-per-review multiplier (55 pre-2017 → 30 for 2022+) × launch price × 0.55 realized-price factor. Band shown is 0.6×–1.6×. Gamalytic numbers replace this when an API key is configured."),
      LI("Critic = percentile of Metacritic (from Steam) or IGN ×10 where curated."),
      LI("Success Index (GSI) = weighted mean of available percentiles (default 40/45/15; adjustable above).")),
    h("h3", {}, "3 · Statistics"),
    h("ul", {}, LI("Δ: mean outcome with − without, 95% CI (Welch live; bootstrap 1,000× in the precomputed scopes, with Benjamini-Hochberg q-values)."),
      LI(`Ridge: outcome ~ all mechanics + subgenre + log price + year + EA + F2P; λ by 5-fold CV (λ=${r.lambda}, CV RMSE ${fmt.f1(r.cv_rmse)} vs ${fmt.f1(r.baseline_rmse)} baseline SD). Coefficients = partial effect in points; 200× bootstrap CIs.`),
      LI("Hits/flops = top/bottom quartile of the slice. Hit lift and flop ratio express risk in publisher terms."),
      LI("Verdicts: red flag (effect CI < 0) · table stakes (≥50% of hits have it, Δ ≥ 0, flop ratio ≤ 0.7) · differentiator (≤35% prevalence, CI > 0) · positive · risk reducer · neutral.")),
    AN.irr ? h("div", {}, h("h3", {}, "Tagging reliability (blind second rater)"),
      P(`${AN.irr.n_games} curated games were re-tagged blind by an independent rater. Overall Cohen's κ = ${fmt.f2(AN.irr.overall_kappa)}, mean per-game Jaccard = ${fmt.f2(AN.irr.mean_jaccard)}. Mechanics with low κ have fuzzier definitions; treat their effects with extra caution.`),
      h("div", { class: "card", style: "max-width:760px" }, hbars(AN.irr.mechanics.filter(m => m.kappa != null && m.n_curated + m.n_rater2 >= 6).sort((a, b) => a.kappa - b.kappa).slice(0, 15)
        .map(m => ({ label: mname(m.mechanic), value: m.kappa, sub: `curated ${m.n_curated} · rater 2 ${m.n_rater2}` })), { width: 720, max: 1, fmtv: fmt.f2 }))) : null,
    h("h3", {}, "Caveats — read before quoting a number"),
    h("ul", {}, LI("Correlation, not causation. Mechanics co-occur with budget, team experience and marketing, which we cannot observe."),
      LI("Survivorship: the universe is games with ≥50 reviews; true flops are under-represented, so downside risk is understated."),
      LI("Auto-tags are noisy; prefer the High-confidence / Curated scopes for decisions, the full set for breadth."),
      LI("Revenue is a model estimate (±~2×); use relative rankings, not absolute dollars, unless Gamalytic data is enabled.")),
    h("p", { class: "muted" }, `Data generated ${D.generated}. ${D.counts.games} games, ${D.counts.curated} curated.`)));
}


function sparkline(series, years, { width = 220, height = 54 } = {}) {
  const pts = series.map((v, i) => [years[i], v]).filter(([, v]) => v != null);
  const svg = s("svg", { class: "svgchart", style: `max-width:${width}px`, viewBox: `0 0 ${width} ${height}` });
  if (pts.length < 2) return svg;
  const ymax = Math.max(0.05, ...pts.map(p => p[1])), x0 = years[0], x1 = years[years.length - 1];
  const X = x => 4 + ((x - x0) / (x1 - x0 || 1)) * (width - 8), Y = v => height - 14 - (v / ymax) * (height - 22);
  svg.append(s("line", { class: "axisline", x1: 4, x2: width - 4, y1: height - 14, y2: height - 14 }));
  svg.append(s("path", { d: pts.map((p, i) => `${i ? "L" : "M"}${X(p[0])},${Y(p[1])}`).join(""), fill: "none", stroke: "var(--series-1)", "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }));
  const last = pts[pts.length - 1];
  svg.append(s("circle", { cx: X(last[0]), cy: Y(last[1]), r: 4, fill: "var(--series-1)", stroke: "var(--surface-1)", "stroke-width": 2 }));
  svg.append(s("text", { x: 4, y: height - 2 }, x0), s("text", { x: width - 4, y: height - 2, "text-anchor": "end" }, x1));
  pts.forEach(p => { const hit = s("rect", { class: "hit", x: X(p[0]) - 8, y: 0, width: 16, height: height - 14 }); hover(hit, () => [fmt.pct(p[1]), `released ${p[0]}`]); svg.append(hit); });
  return svg;
}

function viewTrends() {
  const el = $("#view-trends"), T = AN.trends;
  if (!T) { put(el, h("div", { class: "empty" }, "No trend data — re-run export.")); return; }
  const rows = Object.entries(T.mechanics).filter(([m, v]) => v.slope != null && !m.startsWith("hybrid_")).map(([m, v]) => ({ m, ...v }));
  rows.sort((a, b) => b.slope - a.slope);
  const rising = rows.slice(0, 12), falling = rows.slice(-8).reverse();
  const card = r => h("div", { class: "card tight", style: "cursor:pointer", onclick: () => openMechanic(r.m) },
    h("div", { class: "tile-label" }, mname(r.m)), h("div", { class: "row", style: "justify-content:space-between" },
      h("span", { class: "tile-value", style: "font-size:20px" }, fmt.pct(r.series.filter(v => v != null).slice(-1)[0])),
      h("span", { class: "muted" }, `${r.slope >= 0 ? "+" : ""}${(r.slope * 100).toFixed(1)} pp/yr`)), sparkline(r.series, T.years));
  const ho = AN.holdout;
  put(el, h("h2", {}, "Design trends"),
    h("p", { class: "sub" }, `Share of roguelikes released each year that have each mechanic (high-confidence tags; years with ≥15 releases fit the slope). Releases per year: ${T.years.map((y, i) => `${y}: ${T.n_by_year[i]}`).join(" · ")}.`),
    ho ? h("div", { class: "card", style: "margin-bottom:16px" }, h("h3", {}, "Does the model predict the future? (temporal holdout)"),
      h("div", { class: "grid g4" }, tile("Trained on", `≤ ${ho.split_year - 1}`, `${ho.n_train} games`), tile("Tested on", `${ho.split_year}+`, `${ho.n_test} games, unseen`),
        tile("Rank correlation", fmt.f2(ho.spearman), "predicted vs actual Success Index"),
        tile("Top-quartile precision", fmt.pct(ho.top_quartile_precision), `of games predicted top 25%, share that were hits (chance = 25%)`))) : null,
    (() => { const ys = (AN.money || {}).year_series || []; const years = T.years.filter(y => y >= 2014);
      const rows = years.map(y => { const r = { year: y, n: 0 }; GAMES.filter(g => g.y === y).forEach(g => { const k = ys.includes(g.sg) ? g.sg : "other"; r[k] = (r[k] || 0) + 1; r.n++; }); return r; });
      const shares = rows.map(r => { const o = { year: r.year, n: r.n }; ys.forEach(k => o[k] = (r[k] || 0) / (r.n || 1)); return o; });
      return h("div", { class: "grid g2", style: "margin-bottom:16px" },
        h("div", { class: "card" }, h("h3", {}, "Roguelike releases per year"), legendSw(ys.map(k => [k === "other" ? "Other" : mname(k), SUB_COLOR(k)])), stackedColumns(rows, ys, { width: 560, height: 300, fmtv: fmt.n, colorOf: SUB_COLOR })),
        h("div", { class: "card" }, h("h3", {}, "Subgenre mix per year (share of releases)"), legendSw(ys.map(k => [k === "other" ? "Other" : mname(k), SUB_COLOR(k)])), stackedColumns(shares, ys, { width: 560, height: 300, fmtv: v => Math.round(v * 100) + "%", colorOf: SUB_COLOR }))); })(),
    h("h3", {}, "Rising mechanics"), h("div", { class: "grid g4" }, rising.map(card)),
    h("h3", { style: "margin-top:18px" }, "Declining mechanics"), h("div", { class: "grid g4" }, falling.map(card)),
    h("div", { class: "card", style: "margin-top:18px" }, h("h3", {}, "All mechanics — prevalence change per year"),
      hbars(rows.map(r => ({ label: mname(r.m), value: r.slope * 100, sub: `now ${fmt.pct(r.series.filter(v => v != null).slice(-1)[0])}`, onclick: () => openMechanic(r.m) })), { diverging: true, fmtv: v => (v >= 0 ? "+" : "") + v.toFixed(1) + "pp", width: 900, rowH: 22, labelW: 230 })));
}



function heatmapChart(H, { cell = 30, labelW = 210 } = {}) {
  const rows = H.mechanics, cols = H.subgenres, top = 110, width = labelW + cols.length * cell + 10, height = top + rows.length * (cell * 0.72) + 10, rh = cell * 0.72;
  const svg = s("svg", { class: "svgchart", style: `max-width:${width}px`, viewBox: `0 0 ${width} ${height}` });
  cols.forEach((c, j) => svg.append(s("text", { class: "lbl", transform: `translate(${labelW + j * cell + cell / 2},${top - 8}) rotate(-50)` }, `${mname(c)} (${H.n[j]})`)));
  rows.forEach((m, i) => {
    svg.append(s("text", { class: "lbl", x: labelW - 8, y: top + i * rh + rh / 2 + 4, "text-anchor": "end" }, mname(m)));
    cols.forEach((c, j) => {
      const v = H.values[i][j], g = s("g", { class: "hov", style: "cursor:pointer" });
      g.append(s("rect", { class: "mark", x: labelW + j * cell + 1, y: top + i * rh + 1, width: cell - 2, height: rh - 2, rx: 3,
        fill: `color-mix(in oklab, var(--seq-6) ${Math.round(v * 100)}%, var(--surface-2))` }));
      if (v >= 0.5) g.append(s("text", { x: labelW + j * cell + cell / 2, y: top + i * rh + rh / 2 + 4, "text-anchor": "middle", style: `fill:${v > 0.7 ? "var(--surface-1)" : "var(--text-primary)"};font-size:9px` }, Math.round(v * 100)));
      hover(g, () => [`${Math.round(v * 100)}% of ${mname(c)} games`, mname(m)]);
      g.addEventListener("click", () => openMechanic(m)); svg.append(g);
    });
  });
  return svg;
}


/** Radar of family depth (share of each family's mechanics present, intensity-weighted). series: [{label, color, vec}] */
function famProfile(vec) {
  return FAMS.filter(f => f.id !== "structure_hybrid").map(f => { const ms = f.subfamilies.flatMap(sf => sf.mechanics); return ms.reduce((a, m) => a + (vec[m] || 0), 0) / (ms.length * 3); });
}
function radar(series, { size = 340 } = {}) {
  const fams = FAMS.filter(f => f.id !== "structure_hybrid"), n = fams.length, cx = size / 2, cy = size / 2 + 6, R = size / 2 - 70;
  const mx = Math.max(0.15, ...series.flatMap(sr => sr.vals)) * 1.1;
  const pt = (i, v) => [cx + Math.sin(2 * Math.PI * i / n) * R * v / mx, cy - Math.cos(2 * Math.PI * i / n) * R * v / mx];
  const svg = s("svg", { class: "svgchart", style: `max-width:${size + 120}px`, viewBox: `-60 0 ${size + 120} ${size + 10}` });
  for (const r of [0.25, 0.5, 0.75, 1]) svg.append(s("polygon", { points: fams.map((_, i) => pt(i, mx * r).join(",")).join(" "), fill: "none", stroke: "var(--grid)" }));
  fams.forEach((f, i) => { const [x, y] = pt(i, mx * 1.13); svg.append(s("line", { x1: cx, y1: cy, x2: pt(i, mx)[0], y2: pt(i, mx)[1], stroke: "var(--grid)" }), s("text", { class: "lbl", x, y: y + 4, "text-anchor": Math.abs(x - cx) < 10 ? "middle" : x > cx ? "start" : "end", style: "font-size:10.5px" }, f.name.replace(" & ", " & ").split(" ").slice(0, 3).join(" "))); });
  for (const sr of series) {
    const pts = sr.vals.map((v, i) => pt(i, v));
    svg.append(s("polygon", { points: pts.map(p => p.join(",")).join(" "), fill: sr.color, "fill-opacity": 0.14, stroke: sr.color, "stroke-width": 2, "stroke-linejoin": "round" }));
    pts.forEach((p, i) => { svg.append(s("circle", { cx: p[0], cy: p[1], r: 4, fill: sr.color, stroke: "var(--surface-1)", "stroke-width": 2 }));
      const hit = s("circle", { class: "hit", cx: p[0], cy: p[1], r: 10 }); hover(hit, () => [fmt.pct(sr.vals[i]), `${sr.label} · ${fams[i].name}`, ["share of family's mechanics (intensity-weighted)"]]); svg.append(hit); });
  }
  return h("div", {}, legendSw(series.map(sr => [sr.label, sr.color, true])), svg);
}


function multiLine(series, { width = 900, height = 340, xlog = false, xfmt = v => v, yfmt = v => fmt.pct(v), xl = "", yl = "", ymax = 1 } = {}) {
  const pad = { l: 48, r: 16, t: 26, b: 36 }, W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const xs = series.flatMap(sr => sr.pts.map(p => p[0])), x0 = Math.min(...xs), x1 = Math.max(...xs);
  const tx = v => xlog ? Math.log10(v) : v, X = v => pad.l + (tx(v) - tx(x0)) / (tx(x1) - tx(x0) || 1) * W, Y = v => pad.t + H - v / ymax * H;
  const svg = s("svg", { class: "svgchart", style: `max-width:${width}px`, viewBox: `0 0 ${width} ${height}` });
  for (const t of [0, .25, .5, .75, 1].map(f => f * ymax)) svg.append(s("line", { class: "gridline", x1: pad.l, x2: pad.l + W, y1: Y(t), y2: Y(t) }), s("text", { x: pad.l - 6, y: Y(t) + 4, "text-anchor": "end" }, yfmt(t)));
  const ticks = xlog ? [1e4, 1e5, 1e6, 1e7, 1e8].filter(t => t >= x0 && t <= x1) : niceTicks(x0, x1, 8);
  for (const t of ticks) svg.append(s("text", { x: X(t), y: height - 16, "text-anchor": "middle" }, xfmt(t)));
  svg.append(s("text", { x: pad.l + W, y: height - 2, "text-anchor": "end" }, xl), s("text", { x: pad.l - 40, y: 12 }, yl));
  const ends = [];
  for (const sr of series) {
    svg.append(s("path", { d: sr.pts.map((p, i) => `${i ? "L" : "M"}${X(p[0])},${Y(p[1])}`).join(""), fill: "none", stroke: sr.color, "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }));
    const last = sr.pts[sr.pts.length - 1]; ends.push({ y: Y(last[1]), sr, last });
  }
  for (const e of ends) svg.append(s("circle", { cx: X(e.last[0]), cy: e.y, r: 4, fill: e.sr.color, stroke: "var(--surface-1)", "stroke-width": 2 }));
  // crosshair
  const cross = s("line", { x1: 0, x2: 0, y1: pad.t, y2: pad.t + H, stroke: "var(--axis)", opacity: 0 }); svg.append(cross);
  const hit = s("rect", { class: "hit", x: pad.l, y: pad.t, width: W, height: H });
  hit.addEventListener("pointermove", ev => {
    const r = svg.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width * width;
    const near = series[0].pts.reduce((b, p) => Math.abs(X(p[0]) - px) < Math.abs(X(b[0]) - px) ? p : b, series[0].pts[0]);
    cross.setAttribute("x1", X(near[0])); cross.setAttribute("x2", X(near[0])); cross.setAttribute("opacity", 1);
    tip(ev, xfmt(near[0]), "", series.map(sr => { const p = sr.pts.find(q => q[0] === near[0]); return `${sr.label}: ${p ? yfmt(p[1]) : "–"}`; }));
  });
  hit.addEventListener("pointerleave", () => { untip(); cross.setAttribute("opacity", 0); });
  svg.append(hit);
  return h("div", {}, legendSw(series.map(sr => [sr.label, sr.color, true])), svg);
}
function quadrantScatter(rows, { width = 1100, height = 460 } = {}) {
  const pad = { l: 50, r: 20, t: 20, b: 40 }, W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const mx = Math.max(6, ...rows.flatMap(r => [Math.abs(r.dq), Math.abs(r.dc)])) * 1.1;
  const X = v => pad.l + (v + mx) / (2 * mx) * W, Y = v => pad.t + H - (v + mx) / (2 * mx) * H;
  const svg = s("svg", { class: "svgchart", style: `max-width:${width}px`, viewBox: `0 0 ${width} ${height}` });
  [["Loved & lucrative", 1, 1], ["Lucrative, not loved", -1, 1], ["Loved, not lucrative", 1, -1], ["Neither", -1, -1]].forEach(([t, sx, sy]) =>
    svg.append(s("text", { x: sx > 0 ? pad.l + W - 6 : pad.l + 6, y: sy > 0 ? pad.t + 14 : pad.t + H - 6, "text-anchor": sx > 0 ? "end" : "start", style: "font-size:12px;font-weight:600;fill:var(--text-muted)" }, t)));
  svg.append(s("line", { class: "axisline", x1: X(0), x2: X(0), y1: pad.t, y2: pad.t + H }), s("line", { class: "axisline", x1: pad.l, x2: pad.l + W, y1: Y(0), y2: Y(0) }));
  for (const t of niceTicks(-mx, mx, 6)) svg.append(s("text", { x: X(t), y: height - 18, "text-anchor": "middle" }, fmt.d1(t)), s("text", { x: pad.l - 6, y: Y(t) + 4, "text-anchor": "end" }, fmt.d1(t)));
  svg.append(s("text", { x: pad.l + W, y: height - 2, "text-anchor": "end" }, "Δ player-quality percentile →"), s("text", { x: pad.l + 4, y: pad.t - 6 }, "↑ Δ commercial (revenue) percentile"));
  const lab = new Set([...rows].sort((a, b) => (Math.abs(b.dq) + Math.abs(b.dc)) - (Math.abs(a.dq) + Math.abs(a.dc))).slice(0, 12).map(r => r.mid));
  for (const r of rows) {
    const cx = X(r.dq), cy = Y(r.dc), fam = MECH[r.mid].family, g = s("g", { class: "hov", style: "cursor:pointer" });
    g.append(s("circle", { class: "mark", cx, cy, r: 4 + Math.sqrt(r.n) / 3, fill: FAM_COLOR(fam), opacity: 0.75, stroke: "var(--surface-1)", "stroke-width": 1.5 }));
    if (lab.has(r.mid)) g.append(s("text", { class: "lbl", x: cx + 8, y: cy + 4 }, mname(r.mid)));
    hover(g, () => [mname(r.mid), famName(fam), [`quality Δ ${fmt.d1(r.dq)} · revenue Δ ${fmt.d1(r.dc)}`, `n=${r.n}`]]);
    g.addEventListener("click", () => openMechanic(r.mid)); svg.append(g);
  }
  return svg;
}
/** Stratified Δ of an arbitrary game field for every mechanic over the current slice (reuses impact() strata logic loosely). */
function fieldDeltas(field) {
  const rows = slice().filter(r => r.g[field] != null), out = {};
  const strat = r => `${r.g.src}${Math.min(2, Math.floor(Object.keys(r.g.m).length / 15))}`;
  for (const mid of Object.keys(MECH)) {
    if (mid.startsWith("hybrid_")) continue;
    const cells = {};
    for (const r of rows) { const k = strat(r); (cells[k] = cells[k] || [[], []])[has(r.g, mid) ? 0 : 1].push(r.g[field]); }
    let W = 0, D = 0, n = 0;
    for (const [a, b] of Object.values(cells)) if (a.length >= 2 && b.length >= 2) { const w = a.length * b.length / (a.length + b.length); W += w; D += w * (mean(a) - mean(b)); n += a.length; }
    if (W && n >= 15) out[mid] = { d: D / W, n };
  }
  return out;
}


function coNetwork({ size = 760, topN = 48 } = {}) {
  const cur = GAMES.filter(g => g.src === "curated"), N = cur.length;
  const prev = {}; for (const m of Object.keys(MECH)) if (!m.startsWith("hybrid_")) prev[m] = cur.filter(g => g.m[m]).length / N;
  const order = FAMS.flatMap(f => f.subfamilies.flatMap(sf => sf.mechanics));
  const nodes = Object.keys(prev).filter(m => prev[m] >= 0.08).sort((a, b) => prev[b] - prev[a]).slice(0, topN).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const cx = size / 2, cy = size / 2, R = size / 2 - 150, pos = {};
  nodes.forEach((m, i) => { const a = 2 * Math.PI * i / nodes.length - Math.PI / 2; pos[m] = [cx + Math.cos(a) * R, cy + Math.sin(a) * R, a]; });
  const edges = [];
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j], both = cur.filter(g => g.m[a] && g.m[b]).length;
    const lift = both / N / (prev[a] * prev[b]); if (both >= 10 && lift >= 1.6) edges.push({ a, b, lift, both });
  }
  edges.sort((x, y) => x.lift - y.lift);
  const svg = s("svg", { class: "svgchart", style: `max-width:${size}px`, viewBox: `0 0 ${size} ${size}` });
  const eg = s("g"); svg.append(eg);
  const lines = edges.map(e => { const [x1, y1] = pos[e.a], [x2, y2] = pos[e.b];
    const p = s("path", { d: `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, fill: "none", stroke: FAM_COLOR(MECH[e.a].family), "stroke-width": Math.min(4, 0.6 + (e.lift - 1.5)), opacity: Math.min(0.55, 0.12 + (e.lift - 1.5) * 0.12) });
    eg.append(p); return { e, p }; });
  nodes.forEach(m => {
    const [x, y, a] = pos[m], fam = MECH[m].family, g = s("g", { class: "hov", style: "cursor:pointer" });
    g.append(s("circle", { cx: x, cy: y, r: 4 + prev[m] * 14, fill: FAM_COLOR(fam), stroke: "var(--surface-1)", "stroke-width": 2 }));
    const deg = a * 180 / Math.PI, flip = Math.cos(a) < 0;
    g.append(s("text", { class: "lbl", transform: `translate(${x + Math.cos(a) * 14},${y + Math.sin(a) * 14}) rotate(${flip ? deg + 180 : deg})`, "text-anchor": flip ? "end" : "start", style: "font-size:10.5px", "dominant-baseline": "middle" }, mname(m)));
    g.addEventListener("pointerenter", () => lines.forEach(({ e, p }) => p.setAttribute("opacity", e.a === m || e.b === m ? 0.9 : 0.03)));
    g.addEventListener("pointerleave", () => lines.forEach(({ e, p }) => p.setAttribute("opacity", Math.min(0.55, 0.12 + (e.lift - 1.5) * 0.12))));
    hover(g, () => [mname(m), famName(fam), [`in ${fmt.pct(prev[m])} of curated games`, `strongest partners: ${edges.filter(e => e.a === m || e.b === m).sort((x, y) => y.lift - x.lift).slice(0, 4).map(e => mname(e.a === m ? e.b : e.a) + ` ×${e.lift.toFixed(1)}`).join(", ") || "—"}`]]);
    g.addEventListener("click", () => openMechanic(m)); svg.append(g);
  });
  return h("div", {}, legendSw(FAMS.slice(0, 7).map(f => [f.name, FAM_COLOR(f.id)]).concat([["Other families", OTHER]])), svg);
}


function stripPlot(groups, { width = 1100, rowH = 34, labelW = 190 } = {}) {
  const pad = { t: 6, b: 26 }, height = pad.t + pad.b + groups.length * rowH, W = width - labelW - 20;
  const X = v => labelW + v / 100 * W;
  const svg = s("svg", { class: "svgchart", style: `max-width:${width}px`, viewBox: `0 0 ${width} ${height}` });
  for (const t of [0, 25, 50, 75, 100]) svg.append(s("line", { class: "gridline", x1: X(t), x2: X(t), y1: pad.t, y2: height - pad.b }), s("text", { x: X(t), y: height - 8, "text-anchor": "middle" }, t));
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  groups.forEach((gr, i) => {
    const yc = pad.t + i * rowH + rowH / 2;
    svg.append(s("text", { class: "lbl", x: labelW - 10, y: yc + 4, "text-anchor": "end" }, `${gr.label} (${gr.rows.length})`));
    for (const r of gr.rows) {
      const cx = X(r.y), cy = yc + (rnd() - 0.5) * (rowH - 12), cur = r.g.src === "curated";
      svg.append(s("circle", { cx, cy, r: cur ? 3.4 : 2.2, fill: gr.color, opacity: cur ? 0.9 : 0.35 }));
      if (cur) { const hit = s("circle", { class: "hit", cx, cy, r: 6 }); hover(hit, () => [fmt.f1(r.y), r.g.n, [gr.label]]); hit.addEventListener("click", () => openGame(r.g.id)); svg.append(hit); }
    }
    const v = gr.rows.map(r => r.y).sort((a, b) => a - b), med = quantile(v, 0.5);
    svg.append(s("line", { x1: X(med), x2: X(med), y1: yc - rowH / 2 + 3, y2: yc + rowH / 2 - 3, stroke: "var(--text-primary)", "stroke-width": 2.5 }));
  });
  return svg;
}

// ---------- Money ----------
const CAT = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)", "var(--series-5)", "var(--series-6)", "var(--series-7)"];
const OTHER = "var(--axis)";
const SUB_COLOR = (() => { const m = {}; ((AN.money || {}).year_series || []).forEach((sg, i) => { m[sg] = sg === "other" ? OTHER : CAT[i] || OTHER; }); return sg => m[sg] || OTHER; })();
const FAM_COLOR = (() => { const m = {}; FAMS.forEach((f, i) => { m[f.id] = i < 7 ? CAT[i] : OTHER; }); return id => m[id] || OTHER; })();
const legendSw = items => h("div", { class: "legend" }, items.map(([label, color, line]) => h("span", {}, h("i", { class: line ? "line" : "", style: `background:${color}` }), label)));

function squarify(items, x, y, w, hgt) {
  // items: [{value,...}] sorted desc -> rects
  const total = items.reduce((a, b) => a + b.value, 0), out = [];
  let rest = items.map(i => ({ ...i, area: i.value / total * w * hgt }));
  while (rest.length) {
    const short = Math.min(w, hgt); let row = [], best = Infinity;
    for (const it of rest) {
      const r = [...row, it], s2 = r.reduce((a, b) => a + b.area, 0), mx = Math.max(...r.map(z => z.area)), mn = Math.min(...r.map(z => z.area));
      const worst = Math.max(short * short * mx / (s2 * s2), (s2 * s2) / (short * short * mn));
      if (worst > best) break; best = worst; row = r;
    }
    const s2 = row.reduce((a, b) => a + b.area, 0), thick = s2 / short; let off = 0;
    for (const it of row) {
      const len = it.area / thick;
      out.push(w >= hgt ? { ...it, x, y: y + off, w: thick, h: len } : { ...it, x: x + off, y, w: len, h: thick });
      off += len;
    }
    if (w >= hgt) { x += thick; w -= thick; } else { y += thick; hgt -= thick; }
    rest = rest.slice(row.length);
  }
  return out;
}
function treemap(items, { width = 700, height = 340 } = {}) {
  const svg = s("svg", { class: "svgchart", style: `max-width:${width}px`, viewBox: `0 0 ${width} ${height}` });
  for (const r of squarify(items.filter(i => i.value > 0).sort((a, b) => b.value - a.value), 0, 0, width, height)) {
    const g = s("g", { class: "hov", style: "cursor:pointer" });
    g.append(s("rect", { class: "mark", x: r.x + 1, y: r.y + 1, width: Math.max(0, r.w - 2), height: Math.max(0, r.h - 2), rx: 4, fill: r.color }));
    if (r.w > 70 && r.h > 34) {
      g.append(s("text", { x: r.x + 8, y: r.y + 18, style: "fill:#fff;font-size:12px;font-weight:600" }, r.label.length * 7 > r.w ? r.label.slice(0, Math.floor(r.w / 7)) + "…" : r.label));
      g.append(s("text", { x: r.x + 8, y: r.y + 33, style: "fill:#fff;font-size:11px;opacity:.9" }, r.sub));
    }
    hover(g, () => [r.sub, r.label, r.extra || []]);
    if (r.onclick) g.addEventListener("click", r.onclick);
    svg.append(g);
  }
  return svg;
}
function stackedColumns(rows, series, { width = 900, height = 300, fmtv = fmt.usd, colorOf } = {}) {
  const pad = { l: 56, r: 10, t: 10, b: 30 }, W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const totals = rows.map(r => series.reduce((a, k) => a + (r[k] || 0), 0)), mx = Math.max(1, ...totals);
  const ticks = niceTicks(0, mx, 4); if (ticks[ticks.length - 1] < mx) ticks.push(ticks[ticks.length - 1] + (ticks[1] - ticks[0]));
  const top = ticks[ticks.length - 1], Y = v => pad.t + H - v / top * H, bw = Math.min(28, W / rows.length - 6);
  const svg = s("svg", { class: "svgchart", style: `max-width:${width}px`, viewBox: `0 0 ${width} ${height}` });
  for (const t of ticks) svg.append(s("line", { class: "gridline", x1: pad.l, x2: pad.l + W, y1: Y(t), y2: Y(t) }), s("text", { x: pad.l - 6, y: Y(t) + 4, "text-anchor": "end" }, fmtv(t)));
  rows.forEach((r, i) => {
    const cx = pad.l + (i + 0.5) * W / rows.length; let acc = 0;
    series.forEach((k, si) => {
      const v = r[k] || 0; if (!v) return;
      const y0 = Y(acc), y1 = Y(acc + v), isTop = series.slice(si + 1).every(k2 => !(r[k2] > 0));
      const hh = y0 - y1 - (isTop ? 0 : 2);
      if (hh > 0.5) svg.append(isTop ? s("path", { d: colPath(cx - bw / 2, y1, bw, hh), fill: colorOf(k) }) : s("rect", { x: cx - bw / 2, y: y1 + 2, width: bw, height: hh, fill: colorOf(k) }));
      acc += v;
    });
    svg.append(s("text", { x: cx, y: height - 12, "text-anchor": "middle" }, String(r.year).slice(2)));
    const hit = s("rect", { class: "hit", x: cx - W / rows.length / 2, y: pad.t, width: W / rows.length, height: H });
    hover(hit, () => [fmtv(totals[i]), `${r.year} · ${r.n} games`, series.filter(k => r[k]).map(k => `${k === "other" ? "Other" : mname(k)}: ${fmtv(r[k])}`)]);
    svg.append(hit);
  });
  return svg;
}
function lorenzChart(pts, { width = 420, height = 320 } = {}) {
  const pad = { l: 40, r: 12, t: 12, b: 34 }, W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const X = v => pad.l + v * W, Y = v => pad.t + H - v * H;
  const svg = s("svg", { class: "svgchart", style: `max-width:${width}px`, viewBox: `0 0 ${width} ${height}` });
  for (const t of [0, .25, .5, .75, 1]) { svg.append(s("line", { class: "gridline", x1: pad.l, x2: pad.l + W, y1: Y(t), y2: Y(t) }), s("text", { x: pad.l - 6, y: Y(t) + 4, "text-anchor": "end" }, Math.round(t * 100) + "%"), s("text", { x: X(t), y: height - 16, "text-anchor": "middle" }, Math.round(t * 100) + "%")); }
  svg.append(s("line", { x1: X(0), y1: Y(0), x2: X(1), y2: Y(1), stroke: "var(--axis)", "stroke-width": 1 }));
  const d = pts.map((p, i) => `${i ? "L" : "M"}${X(p[0])},${Y(p[1])}`).join("");
  svg.append(s("path", { d: d + `L${X(1)},${Y(0)}Z`, fill: "var(--series-2)", opacity: 0.12 }));
  svg.append(s("path", { d, fill: "none", stroke: "var(--series-2)", "stroke-width": 2 }));
  svg.append(s("text", { x: pad.l + W, y: height - 2, "text-anchor": "end" }, "share of games (poorest → richest) →"));
  pts.forEach(p => { const hit = s("rect", { class: "hit", x: X(p[0]) - 5, y: pad.t, width: 10, height: H }); hover(hit, () => [`${Math.round(p[1] * 100)}% of revenue`, `bottom ${Math.round(p[0] * 100)}% of games`, [`top ${Math.round((1 - p[0]) * 100)}% earn ${Math.round((1 - p[1]) * 100)}%`]]); svg.append(hit); });
  return svg;
}
function logScatter(rows, { width = 900, height = 380, x, y, xl, yl, colorOf, label } = {}) {
  const pad = { l: 56, r: 14, t: 12, b: 36 }, W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const xs = rows.map(x), ys = rows.map(y).filter(v => v > 0);
  const xmin = 0, xmax = Math.max(...xs) * 1.05, ylo = Math.floor(Math.log10(Math.min(...ys))), yhi = Math.ceil(Math.log10(Math.max(...ys)));
  const X = v => pad.l + (v - xmin) / (xmax - xmin) * W, Y = v => pad.t + H - (Math.log10(v) - ylo) / (yhi - ylo) * H;
  const svg = s("svg", { class: "svgchart", style: `max-width:${width}px`, viewBox: `0 0 ${width} ${height}` });
  for (let e = ylo; e <= yhi; e++) svg.append(s("line", { class: "gridline", x1: pad.l, x2: pad.l + W, y1: Y(10 ** e), y2: Y(10 ** e) }), s("text", { x: pad.l - 6, y: Y(10 ** e) + 4, "text-anchor": "end" }, fmt.usd(10 ** e)));
  for (const t of niceTicks(xmin, xmax, 6)) svg.append(s("text", { x: X(t), y: height - 16, "text-anchor": "middle" }, "$" + t));
  svg.append(s("text", { x: pad.l + W, y: height - 2, "text-anchor": "end" }, xl), s("text", { x: pad.l + 4, y: pad.t + 10 }, yl));
  const ordered = [...rows].sort((a, b) => (colorOf(a) === OTHER ? 0 : 1) - (colorOf(b) === OTHER ? 0 : 1));
  for (const r of ordered) {
    const yv = y(r); if (!(yv > 0)) continue;
    const cx = X(x(r)), cy = Y(yv), col = colorOf(r);
    svg.append(s("circle", { cx, cy, r: col === OTHER ? 2.6 : 3.6, fill: col, opacity: col === OTHER ? 0.45 : 0.85 }));
    const hit = s("circle", { class: "hit", cx, cy, r: 7 }); hover(hit, () => label(r)); hit.addEventListener("click", () => openGame(r.id)); svg.append(hit);
  }
  return svg;
}
function upliftBubbles(rows, { width = 1100, height = 440 } = {}) {
  const pad = { l: 56, r: 20, t: 16, b: 38 }, W = width - pad.l - pad.r, H = height - pad.t - pad.b;
  const xmax = Math.max(...rows.map(r => r.n)) * 1.05, lx = v => Math.log10(v);
  const ymin = Math.min(...rows.map(r => r.uplift_x)), ymax = Math.max(...rows.map(r => r.uplift_x));
  const ylo = Math.min(-0.5, lx(ymin) - 0.05), yhi = Math.max(0.5, lx(ymax) + 0.05);
  const X = v => pad.l + Math.log10(v) / Math.log10(xmax) * W, Y = v => pad.t + H - (lx(v) - ylo) / (yhi - ylo) * H;
  const mmax = Math.max(...rows.map(r => r.market)), R = m => 4 + 22 * Math.sqrt(m / mmax);
  const svg = s("svg", { class: "svgchart", style: `max-width:${width}px`, viewBox: `0 0 ${width} ${height}` });
  for (const t of [0.33, 0.5, 1, 2, 3, 5].filter(t => lx(t) >= ylo && lx(t) <= yhi)) svg.append(s("line", { class: t === 1 ? "axisline" : "gridline", x1: pad.l, x2: pad.l + W, y1: Y(t), y2: Y(t) }), s("text", { x: pad.l - 6, y: Y(t) + 4, "text-anchor": "end" }, t + "×"));
  for (const t of [10, 30, 100, 300, 1000].filter(t => t < xmax)) svg.append(s("text", { x: X(t), y: height - 18, "text-anchor": "middle" }, t));
  svg.append(s("text", { x: pad.l + W, y: height - 2, "text-anchor": "end" }, "games with mechanic (log) →"), s("text", { x: pad.l + 4, y: pad.t + 10 }, "↑ median revenue multiple vs comparable games without it"));
  const lab = new Set([...rows].sort((a, b) => b.market - a.market).slice(0, 6).concat([...rows].sort((a, b) => b.uplift_x - a.uplift_x).slice(0, 4)).map(r => r.mechanic));
  for (const r of [...rows].sort((a, b) => b.market - a.market)) {
    const cx = X(r.n), cy = Y(r.uplift_x), rr = R(r.market), fam = MECH[r.mechanic].family;
    const g = s("g", { class: "hov", style: "cursor:pointer" });
    g.append(s("circle", { class: "mark", cx, cy, r: rr, fill: FAM_COLOR(fam), opacity: 0.55, stroke: "var(--surface-1)", "stroke-width": 1.5 }));
    if (lab.has(r.mechanic)) g.append(s("text", { class: "lbl", x: cx + rr + 4, y: cy + 4 }, mname(r.mechanic)));
    hover(g, () => [`${r.uplift_x.toFixed(2)}× median revenue`, mname(r.mechanic), [`${famName(fam)}`, `market ${fmt.usd(r.market)} (${fmt.pct(r.market_share)}) · n=${r.n}`, `median ${fmt.usd(r.median_with)} with vs ${fmt.usd(r.median_without)} without`, `$1M+ rate ${fmt.pct(r.million_rate_with)} vs ${fmt.pct(r.million_rate_without)}`]]);
    g.addEventListener("click", () => openMechanic(r.mechanic)); svg.append(g);
  }
  return svg;
}

function viewMoney() {
  const el = $("#view-money"), M = AN.money;
  if (!M) { put(el, h("div", { class: "empty" }, "No money data — re-run export.")); return; }
  const tiers = M.tiers, totalN = tiers.reduce((a, t) => a + t.n, 0);
  const tierLabel = t => t.hi >= 1e12 ? `${fmt.usd(t.lo)}+` : `${fmt.usd(t.lo)}–${fmt.usd(t.hi)}`;
  const million = tiers.filter(t => t.lo >= 1e6).reduce((a, t) => a + t.n, 0);
  const top1 = M.top1_share;
  const subItems = M.subgenres.map(sg => ({ value: sg.total, label: mname(sg.subgenre), sub: fmt.usd(sg.total), color: SUB_COLOR(sg.subgenre),
    extra: [`${sg.n} paid games · median ${fmt.usd(sg.median)}`, `$1M+ rate ${fmt.pct(sg.million_rate)} · $10M+ ${fmt.pct(sg.ten_million_rate)}`, `top 10% of games earn ${fmt.pct(sg.top10_share)}`],
    onclick: () => { $("#f-sub").value = sg.subgenre; $("#f-sub").dispatchEvent(new Event("change")); switchView("overview"); } }));
  const mm = M.mechanics.filter(r => !r.mechanic.startsWith("hybrid_"));
  const paidGames = GAMES.filter(g => g.rev && g.p);
  const scatterSubs = (M.year_series || []).slice(0, 3);
  put(el, h("h2", {}, "The money: where roguelike revenue goes"),
    h("p", { class: "sub" }, `Estimated gross Steam revenue for ${fmt.n(M.n_paid)} paid roguelikes (review-multiplier model; developer net ≈ ${Math.round(M.net_share * 100)}% of gross). Rankings are reliable; individual dollar figures are ±~2×.`),
    h("div", { class: "grid g4" },
      h("div", { class: "card" }, h("div", { class: "tile-label" }, "Total gross revenue"), h("div", { class: "hero" }, h("span", { class: "hero-value" }, fmt.usd(M.total))), h("div", { class: "tile-note" }, `≈ ${fmt.usd(M.total * M.net_share)} to developers after Steam's cut`)),
      tile("Median game earns", fmt.usd(M.median), "half of all paid roguelikes gross less than this"),
      tile("Games grossing $1M+", fmt.pct(million / totalN), `${million} of ${totalN} games`),
      tile("Winner-take-most", `Gini ${fmt.f2(M.gini)}`, `top 1% of games take ${fmt.pct(top1)} · top 10% take ${fmt.pct(M.top10_share)}`)),
    h("div", { class: "grid g21", style: "margin-top:16px" },
      h("div", { class: "card" }, h("h3", {}, "Revenue by subgenre"), h("div", { class: "muted", style: "margin-bottom:8px" }, "Area = total estimated gross. Click to filter the dashboard to that subgenre."), treemap(subItems, { width: 820, height: 360 })),
      h("div", { class: "card" }, h("h3", {}, "Concentration (Lorenz curve)"), h("div", { class: "muted" }, "How unequal is roguelike revenue? The further the curve bows from the diagonal, the more a few hits take everything."), lorenzChart(M.lorenz))),
    (() => { const thr = [1e4, 2e4, 5e4, 1e5, 2e5, 5e5, 1e6, 2e6, 5e6, 1e7, 2e7, 5e7, 1e8];
      const ser = M.year_series.filter(k => k !== "other").map(k => { const r = GAMES.filter(g => g.sg === k && g.rev && g.p).map(g => g.rev); return { label: mname(k), color: SUB_COLOR(k), pts: thr.map(t => [t, r.filter(v => v >= t).length / (r.length || 1)]) }; });
      return h("div", { class: "card", style: "margin-top:16px" }, h("h3", {}, "Odds of earning at least $X, by subgenre"),
        h("div", { class: "muted" }, "Share of paid games in each subgenre whose estimated gross reaches each threshold. Hover for exact odds. This is the risk curve a publisher underwrites."),
        multiLine(ser, { width: 1100, height: 360, xlog: true, xfmt: fmt.usd, xl: "gross revenue threshold (log) →", yl: "↑ share of games reaching it" })); })(),
    h("div", { class: "card", style: "margin-top:16px" }, h("h3", {}, "Revenue by release year"), h("div", { class: "muted" }, "Estimated lifetime gross of each year's releases, stacked by subgenre (top 7 + other)."),
      legendSw(M.year_series.map(k => [k === "other" ? "Other" : mname(k), SUB_COLOR(k)])), stackedColumns(M.by_year, M.year_series, { width: 1100, height: 320, colorOf: SUB_COLOR })),
    h("div", { class: "grid g2", style: "margin-top:16px" },
      h("div", { class: "card" }, h("h3", {}, "How many games reach each revenue tier"), hbars(tiers.map(t => ({ label: tierLabel(t), value: t.n, sub: `${fmt.pct(t.n / totalN)} of games`, color: "var(--series-3)" })), { fmtv: fmt.n, width: 560, labelW: 130 })),
      h("div", { class: "card" }, h("h3", {}, "…and how much of the money each tier takes"), hbars(tiers.map(t => ({ label: tierLabel(t), value: t.total, sub: `${fmt.pct(t.total / M.total)} of all revenue`, color: "var(--series-2)" })), { fmtv: fmt.usd, width: 560, labelW: 130 }))),
    h("div", { class: "grid g2", style: "margin-top:16px" },
      h("div", { class: "card" }, h("h3", {}, "Median revenue by launch price"), hbars(M.price_bands.map(b => ({ label: b.hi >= 1000 ? `$${b.lo}+` : `$${b.lo}–${b.hi}`, value: b.median, sub: `n=${b.n} · $1M+ rate ${fmt.pct(b.million_rate)}`, color: "var(--series-7)" })), { fmtv: fmt.usd, width: 560, labelW: 100 })),
      h("div", { class: "card" }, h("h3", {}, "Odds of a $1M+ game, by launch price"), hbars(M.price_bands.map(b => ({ label: b.hi >= 1000 ? `$${b.lo}+` : `$${b.lo}–${b.hi}`, value: b.million_rate * 100, sub: `n=${b.n}`, color: "var(--series-4)" })), { fmtv: v => v.toFixed(0) + "%", width: 560, labelW: 100 }))),
    h("div", { class: "card", style: "margin-top:16px" }, h("h3", {}, "Which mechanics come with more money?"),
      h("div", { class: "muted" }, "Each bubble is a mechanic. y = median revenue of games with it ÷ comparable games without it (matched on tag source and documentation depth); size = total market of games using it; color = mechanic family. Associations, not causes."),
      legendSw(FAMS.slice(0, 7).map(f => [f.name, FAM_COLOR(f.id)]).concat([["Other families", OTHER]])), upliftBubbles(mm)),
    h("div", { class: "card", style: "margin-top:16px" }, h("h3", {}, "Market touched by each mechanic"),
      h("div", { class: "muted", style: "margin-bottom:8px" }, "Area = total estimated gross of paid games using the mechanic; color = family. Games use many mechanics, so areas overlap in reality. Read this as where the money flows through, not as a split."),
      legendSw(FAMS.slice(0, 7).map(f => [f.name, FAM_COLOR(f.id)]).concat([["Other families", OTHER]])),
      treemap(mm.slice().sort((a, b) => b.market - a.market).slice(0, 60).map(r => ({ value: r.market, label: mname(r.mechanic), sub: fmt.usd(r.market), color: FAM_COLOR(MECH[r.mechanic].family),
        extra: [famName(MECH[r.mechanic].family), `${r.n} games · ${r.uplift_x.toFixed(2)}× median revenue`], onclick: () => openMechanic(r.mechanic) })), { width: 1100, height: 460 })),
    h("div", { class: "card", style: "margin-top:16px" }, h("h3", {}, "Mechanic revenue table"),
      table([{ key: "name", label: "Mechanic", render: r => h("span", {}, h("i", { style: `display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:6px;background:${FAM_COLOR(MECH[r.mechanic].family)}` }), mname(r.mechanic)), sort: r => mname(r.mechanic) },
        { key: "uplift_x", label: "Revenue multiple", num: true, render: r => r.uplift_x.toFixed(2) + "×" },
        { key: "uplift_usd", label: "$ uplift (median game)", num: true, render: r => (r.uplift_usd >= 0 ? "+" : "−") + fmt.usd(Math.abs(r.uplift_usd)) },
        { key: "median_with", label: "Median with", num: true, render: r => fmt.usd(r.median_with) },
        { key: "million_rate_with", label: "$1M+ rate with", num: true, render: r => fmt.pct(r.million_rate_with) },
        { key: "million_rate_without", label: "…comparable without", num: true, render: r => fmt.pct(r.million_rate_without) },
        { key: "market", label: "Market size", num: true, render: r => fmt.usd(r.market) }, { key: "n", label: "Games", num: true }],
        mm.map(r => ({ ...r, name: mname(r.mechanic) })), { onRow: r => openMechanic(r.mechanic), initialSort: ["uplift_x", -1] })),
    h("div", { class: "card", style: "margin-top:16px" }, h("h3", {}, "Price vs revenue, every paid game"),
      legendSw(scatterSubs.map(k => [mname(k), SUB_COLOR(k)]).concat([["Other subgenres", OTHER]])),
      logScatter(paidGames.map(g => ({ id: g.id, n: g.n, p: g.p, rev: g.rev, sg: g.sg })), { width: 1100, height: 400, x: r => r.p, y: r => r.rev, xl: "launch price →", yl: "↑ estimated gross revenue (log)",
        colorOf: r => scatterSubs.includes(r.sg) ? SUB_COLOR(r.sg) : OTHER, label: r => [fmt.usd(r.rev), r.n, [`$${r.p} · ${mname(r.sg)}`]] })),
    h("div", { class: "card", style: "margin-top:16px" }, h("h3", {}, "White space: high revenue multiple, few competitors"),
      h("div", { class: "muted", style: "margin-bottom:8px" }, "Mechanics whose games earn ≥1.8× the median of comparable games, but that fewer than 40 games use. A full design brief for each (proven by, pair it with, price) is generated in docs/briefs/."),
      hbars(mm.filter(r => r.uplift_x >= 1.8 && r.n < 40).sort((a, b) => b.uplift_x - a.uplift_x).slice(0, 12).map(r => ({ label: mname(r.mechanic), value: r.uplift_x, sub: `${r.n} games · median ${fmt.usd(r.median_with)} · $1M+ ${fmt.pct(r.million_rate_with)}`, color: FAM_COLOR(MECH[r.mechanic].family), onclick: () => openMechanic(r.mechanic) })), { fmtv: v => v.toFixed(1) + "×", width: 900, labelW: 240 })),
    h("div", { class: "card", style: "margin-top:16px" }, h("h3", {}, "Top-grossing roguelikes (estimated)"),
      hbars(M.top_games.map(g => ({ label: g.n, value: g.rev, color: SUB_COLOR(g.sg), sub: mname(g.sg), onclick: () => openGame(g.id) })), { fmtv: fmt.usd, width: 1000, labelW: 260, rowH: 24 })));
}


function viewIdeas() {
  const el = $("#view-ideas"), I = AN.auto_ideas || [];
  const KIND = { opportunity: "var(--series-3)", data: "var(--series-1)", taxonomy: "var(--series-7)", tagging: "var(--series-4)", research: "var(--series-2)" };
  const kinds = [...new Set(I.map(i => i.kind))];
  const md = t => { const out = []; t.split(/(\*\*[^*]+\*\*|`[^`]+`)/).forEach(p => out.push(p.startsWith("**") ? h("b", {}, p.slice(2, -2)) : p.startsWith("`") ? h("code", {}, p.slice(1, -1)) : p)); return out; };
  put(el, h("h2", {}, "What to do next — generated from the data"),
    h("p", { class: "sub" }, `${I.length} ideas mined from the current dataset on every export (gaps in evidence, fuzzy definitions, auto-tagger blind spots, thin subgenres, market white space, trend bets, outlier case studies). Ranked by value ÷ effort. This is the self-directing half of the workflow: the top ideas become the next loop's work.`),
    legendSw(kinds.map(k => [k, KIND[k] || OTHER])),
    h("div", { class: "grid g2" }, I.map((i, n) => h("div", { class: "card tight", style: `border-left:4px solid ${KIND[i.kind] || OTHER}` },
      h("div", { class: "row", style: "justify-content:space-between" }, h("span", { class: "chip small" }, `A${n + 1} · ${i.kind}`), h("span", { class: "muted" }, `value ${i.value} · effort ${i.effort}`)),
      h("div", { style: "margin-top:6px" }, md(i.text)), h("div", { class: "muted", style: "font-size:12px;margin-top:4px" }, i.why)))));
}

function viewAbout() {
  const el = $("#view-about"), c = D.counts;
  put(el, h("div", { class: "about" },
    h("div", { class: "card about-hero" },
      h("img", { class: "founder-photo", src: "assets/founder.jpeg", alt: "William Spangler, founder of GameCred" }),
      h("div", {},
        h("div", { class: "about-brand" }, h("img", { src: "assets/logo.jpeg", alt: "" }), h("span", {}, "GameCred")),
        h("h2", {}, "William Spangler"), h("div", { class: "muted", style: "margin-bottom:14px" }, "Founder"),
        h("p", {}, "Game funding is broken because it runs on vibes. GameCred breaks games down mechanically and ties every mechanic to measurable outcomes: player reception, revenue and critical scores. Publishers and studios can then back designs with evidence instead of gut feel."),
        h("p", {}, "It started with roguelikes, a genre with deep wikis, passionate communities and thousands of comparable releases, and it is built as a living database: every week it re-fetches market data, re-tests its own tagging, and generates its own next questions."))),
    h("div", { class: "pillars" },
      h("div", { class: "card pillar" }, h("h3", {}, "The textbook"), h("p", {}, `${c.mechanics} mechanics in ${c.families} families. A shared vocabulary for game design, from permadeath to proc chains.`)),
      h("div", { class: "card pillar", style: "border-top-color:var(--series-2)" }, h("h3", {}, "The evidence"), h("p", {}, `${fmt.n(c.games)} roguelikes, ${c.curated} expert-curated profiles, and revenue, reviews and critic scores, with confounders controlled and results validated on unseen releases.`)),
      h("div", { class: "card pillar", style: "border-top-color:var(--series-3)" }, h("h3", {}, "The rubric"), h("p", {}, "For publishers, what a genre must have, what sets hits apart, and how risky a design is. For studios, including AI-assisted ones, a design loop backed by data."))),
    h("div", { class: "card", style: "margin-top:16px" }, h("h3", {}, "Work with GameCred"),
      h("p", {}, "Studios pitching a roguelike, and publishers evaluating one, can use the Design Lab to score a design against thousands of comparable games and export a pitch report."),
      h("div", { class: "row" }, h("button", { class: "btn", onclick: () => switchView("lab") }, "Open the Design Lab"),
        h("a", { class: "btn secondary", href: "https://github.com/lachlanspangler/GameCred", target: "_blank", rel: "noopener", style: "text-decoration:none" }, "GitHub")))));
}
// ---------- wiring ----------
const VIEWS = { about: viewAbout, ideas: viewIdeas, money: viewMoney, overview: viewOverview, mechanics: viewMechanics, families: viewFamilies, games: viewGames, lab: viewLab, trends: viewTrends, synergy: viewSynergy, method: viewMethod };
function switchView(v) {
  state.view = v;
  document.querySelectorAll(".tabs button").forEach(b => b.classList.toggle("active", b.dataset.view === v));
  document.querySelectorAll(".view").forEach(s2 => s2.classList.toggle("active", s2.id === "view-" + v));
  $("#filters").style.display = ["lab", "method", "trends", "money", "ideas", "about"].includes(v) ? "none" : "";
  render(); if (hashView() !== v) history.replaceState(null, "", "#" + v);
}
function render() {
  const im = impact();
  $("#slice-count").textContent = `${im.n} games in slice`;
  VIEWS[state.view]();
}
document.querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => switchView(b.dataset.view)));
const subSel = $("#f-sub");
subSel.append(h("option", { value: "" }, "All subgenres"), ...HYBRIDS.map(hy => h("option", { value: hy }, `${mname(hy)} (${GAMES.filter(g => g.sg === hy).length})`)));
const bind = (id, key, num) => $(id).addEventListener("change", e => { state[key] = num ? +e.target.value : e.target.value; render(); });
$("#f-adj").addEventListener("change", e => { state.adjust = e.target.checked; render(); });
bind("#f-sub", "sub"); bind("#f-year", "year", 1); bind("#f-rev", "rev", 1); bind("#f-conf", "conf", 1); bind("#f-out", "out");
for (const k of ["q", "c", "k", "e"]) {
  const inp = $("#w-" + k), lab2 = inp.nextElementSibling; lab2.textContent = inp.value;
  inp.addEventListener("input", () => { state.w[k] = +inp.value; lab2.textContent = inp.value; clearTimeout(inp._t); inp._t = setTimeout(render, 120); });
}
$("#theme-toggle").addEventListener("click", () => { const r = document.documentElement; r.dataset.theme = r.dataset.theme === "dark" ? "light" : "dark"; localStorage.setItem("gc-theme", r.dataset.theme); });
document.documentElement.dataset.theme = localStorage.getItem("gc-theme") || "dark";
$("#foot").textContent = `GameCred · data generated ${D.generated} · ${D.counts.games} games · ${D.counts.curated} curated profiles · ${D.counts.mechanics} mechanics. Sources: Steam storefront & reviews, SteamSpy, curated wiki research.`;
const sts = GAMES.find(g => g.n === "Slay the Spire"); if (sts) loadTemplate(sts);
const hashView = () => location.hash.slice(1).split("?")[0];
addEventListener("hashchange", () => { const v = hashView(); if (VIEWS[v] && v !== state.view) switchView(v); });
if (hashView() === "lab") labFromHash();
switchView(VIEWS[hashView()] ? hashView() : "overview");
})();
