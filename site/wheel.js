// The chamber's six signals drawn as a bhavacakra, one realm per signal, laid
// out as on the six-realm wheels: gods at the top between demigods and humans,
// animals and hungry ghosts below, the hells at the bottom (SVG 90° = down).
(function(){
const NS = "http://www.w3.org/2000/svg";

const REALMS = {
  pain:     {realm:"hell realm",         skt:"naraka",   deg:90,
             note:"the hells: suffering as the whole of experience"},
  fear:     {realm:"animal realm",       skt:"tiryak",   deg:150,
             note:"the animals: a life ruled by fear of being eaten"},
  none:     {realm:"human realm",        skt:"manuṣya",  deg:210,
             note:"the humans: no signal — the only realm you can leave the wheel from"},
  pleasure: {realm:"god realm",          skt:"deva",     deg:270,
             note:"the gods: bliss so complete it forgets it will end"},
  faith:    {realm:"demigod realm",      skt:"asura",    deg:330,
             note:"the demigods: devotion that strains toward a heaven always just above it"},
  sadness:  {realm:"hungry-ghost realm", skt:"preta",    deg:30,
             note:"the hungry ghosts: longing that nothing can fill"},
};
// each realm's wedge reaches halfway to its neighbours
const HALF = 180 / Object.keys(REALMS).length;

const NIDANAS = [
  ["ignorance",       "a blind woman feeling her way with a cane"],
  ["formations",      "a potter shaping pots"],
  ["consciousness",   "a monkey swinging from branch to branch"],
  ["name and form",   "people in a boat"],
  ["six senses",      "a house with six windows"],
  ["contact",         "a couple embracing"],
  ["feeling",         "an arrow in the eye"],
  ["craving",         "a person drinking"],
  ["grasping",        "picking fruit from a tree"],
  ["becoming",        "a pregnant woman"],
  ["birth",           "a child being born"],
  ["aging and death", "a corpse carried away"],
];

const GOLD = "#c9a227", RIM = "#3a1612", RIM2 = "#2a100d";

function mk(tag, attrs, parent){
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
function pol(cx, cy, r, deg){
  const t = deg * Math.PI / 180;
  return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
}
const f = n => n.toFixed(2);
function sector(cx, cy, r0, r1, a0, a1){
  const [x0, y0] = pol(cx, cy, r1, a0), [x1, y1] = pol(cx, cy, r1, a1);
  const [x2, y2] = pol(cx, cy, r0, a1), [x3, y3] = pol(cx, cy, r0, a0);
  const big = (a1 - a0) > 180 ? 1 : 0;
  return `M${f(x0)} ${f(y0)}A${r1} ${r1} 0 ${big} 1 ${f(x1)} ${f(y1)}`
       + `L${f(x2)} ${f(y2)}A${r0} ${r0} 0 ${big} 0 ${f(x3)} ${f(y3)}Z`;
}
// an arc to hang text on, reversed in the lower half so it reads upright
function textArc(cx, cy, r, a0, a1){
  const mid = ((a0 + a1) / 2 % 360 + 360) % 360;
  const lower = mid > 0 && mid < 180;
  const [sa, ea] = lower ? [a1, a0] : [a0, a1];
  const [x0, y0] = pol(cx, cy, r, sa), [x1, y1] = pol(cx, cy, r, ea);
  return `M${f(x0)} ${f(y0)}A${r} ${r} 0 0 ${lower ? 0 : 1} ${f(x1)} ${f(y1)}`;
}
function title(el, text){ mk("title", {}, el).textContent = text; return el; }
function arcText(parent, defs, id, d, text, attrs){
  mk("path", {id, d, fill:"none"}, defs);
  const t = mk("text", attrs, parent);
  const tp = mk("textPath", {href:"#" + id, startOffset:"50%", "text-anchor":"middle"}, t);
  tp.textContent = text;
  return t;
}

let uid = 0;

// opts: cx, cy, rHub, rBand, rRealm, rRimIn, rRimOut, colors{key:hex},
//       realmLabels, rimLabels, hub ("poisons" | an image href), href(key)
function draw(root, o){
  const id = "sw" + (++uid);
  const defs = mk("defs", {}, root);
  const g = mk("g", {class:"samsara"}, root);
  const {cx, cy} = o;
  const wedges = {};
  mk("circle", {cx, cy, r:o.rRimOut, fill:"#0b0907"}, g);

  // realms: one wedge per signal, centred on its mixer axis
  const realmG = mk("g", {class:"sw-realms"}, g);
  for (const k in REALMS){
    const r = REALMS[k], c = o.colors[k];
    const parent = o.href ? mk("a", {href:o.href(k), class:"sw-link"}, realmG) : realmG;
    const p = mk("path", {class:"sw-wedge", "data-k":k,
      d: sector(cx, cy, o.rBand, o.rRealm, r.deg - HALF, r.deg + HALF),
      fill:c, "fill-opacity":".06", stroke:"none"}, parent);
    title(p, `${k} → ${r.realm} (${r.skt}) — ${r.note}`);
    wedges[k] = p;
    if (o.realmLabels){
      const lab = mk("g", {class:"sw-rlab", "pointer-events":"none"}, parent);
      const rr = o.rRealm - (o.realmLabels.inset || 14);
      arcText(lab, defs, `${id}-r${k}`, textArc(cx, cy, rr, r.deg - HALF + 2, r.deg + HALF - 2),
        r.realm, {class:"sw-realm", fill:c});
      if (o.realmLabels.skt){
        const lower = r.deg > 0 && r.deg < 180;
        arcText(lab, defs, `${id}-s${k}`,
          textArc(cx, cy, rr + (lower ? 11 : -11), r.deg - HALF + 2, r.deg + HALF - 2),
          r.skt, {class:"sw-skt"});
      }
    }
  }
  // spokes between realms
  const spokeG = mk("g", {class:"sw-spokes"}, g);
  for (const k in REALMS){
    const a = REALMS[k].deg + HALF;
    const [x0, y0] = pol(cx, cy, o.rBand, a), [x1, y1] = pol(cx, cy, o.rRimIn, a);
    mk("line", {x1:f(x0), y1:f(y0), x2:f(x1), y2:f(y1),
      stroke:GOLD, "stroke-opacity":".35", "stroke-width":"1.2"}, spokeG);
  }
  mk("circle", {cx, cy, r:o.rRealm, fill:"none", stroke:GOLD,
    "stroke-opacity":".4", "stroke-width":"1"}, g);

  // rim: the twelve links of dependent origination; it is the part that turns
  const rim = mk("g", {class:"sw-rim" + (o.spin ? " sw-spin" : "")}, g);
  rim.style.transformOrigin = `${cx}px ${cy}px`;
  NIDANAS.forEach(([name, img], i)=>{
    const a0 = -90 + i * 30, a1 = a0 + 30;
    const seg = mk("path", {d: sector(cx, cy, o.rRimIn, o.rRimOut, a0, a1),
      fill: i % 2 ? RIM : RIM2, stroke:GOLD, "stroke-opacity":".45",
      "stroke-width":".8"}, rim);
    title(seg, `${i + 1} · ${name} — ${img}`);
    if (o.rimLabels){
      arcText(rim, defs, `${id}-n${i}`,
        textArc(cx, cy, (o.rRimIn + o.rRimOut) / 2 - 3, a0 + 1, a1 - 1),
        name, {class:"sw-nid", "pointer-events":"none"});
    }
  });

  // inner band: beings rising (light) and falling (dark)
  const band = mk("g", {class:"sw-band"}, g);
  title(mk("path", {d: sector(cx, cy, o.rHub, o.rBand, 90, 270),
    fill:"#c9d4e0", "fill-opacity":".13"}, band), "the light path: rising to higher rebirth");
  title(mk("path", {d: sector(cx, cy, o.rHub, o.rBand, -90, 90),
    fill:"#000", "fill-opacity":".55"}, band), "the dark path: falling to lower rebirth");
  mk("circle", {cx, cy, r:o.rBand, fill:"none", stroke:GOLD,
    "stroke-opacity":".4", "stroke-width":".8"}, band);

  // hub
  const hub = mk("g", {class:"sw-hub"}, g);
  mk("circle", {cx, cy, r:o.rHub, fill:"#07070e", stroke:GOLD,
    "stroke-opacity":".55", "stroke-width":"1"}, hub);
  if (o.hub && o.hub !== "poisons"){
    const s = o.rHub * 2.3;
    const clip = mk("clipPath", {id:`${id}-hub`}, defs);
    mk("circle", {cx, cy, r:o.rHub - 1}, clip);
    mk("image", {href:o.hub, x:f(cx - s / 2), y:f(cy - s / 2), width:f(s), height:f(s),
      "clip-path":`url(#${id}-hub)`}, hub);
    title(hub, "at the hub, where the three poisons usually chase each other: the Saw");
  } else {
    // three poisons chasing each other's tails: pig, rooster, snake
    const poisons = [["#8f9fb0", "the pig — delusion"],
                     ["#e04a3a", "the rooster — craving"],
                     ["#7fd4c8", "the snake — aversion"]];
    const pr = o.rHub * 0.58, sw = Math.max(1.6, o.rHub * 0.14);
    const spin = mk("g", {class: o.spin ? "sw-spin-rev" : ""}, hub);
    spin.style.transformOrigin = `${cx}px ${cy}px`;
    poisons.forEach(([c, t], i)=>{
      const a0 = i * 120 - 90 + 12, a1 = a0 + 96;
      const [x0, y0] = pol(cx, cy, pr, a0), [x1, y1] = pol(cx, cy, pr, a1);
      const p = mk("g", {}, spin);
      mk("path", {d:`M${f(x0)} ${f(y0)}A${pr} ${pr} 0 0 1 ${f(x1)} ${f(y1)}`,
        fill:"none", stroke:c, "stroke-width":f(sw), "stroke-linecap":"round"}, p);
      mk("circle", {cx:f(x1), cy:f(y1), r:f(sw * 1.05), fill:c}, p);
      title(p, t);
    });
  }

  return {
    wedges,
    // light each realm by how strongly the current mix sends the subject there
    setLit(weights){
      for (const k in wedges){
        const w = Math.max(0, Math.min(1, weights[k] || 0));
        wedges[k].setAttribute("fill-opacity", (0.05 + 0.32 * w).toFixed(3));
      }
    },
  };
}

window.SamsaraWheel = {REALMS, NIDANAS, draw, mk, pol, f};
})();
