import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Package, Zap, Download, ArrowRight, RotateCcw,
  CheckCircle2, SlidersHorizontal, X, Plus, Minus,
  Eye, Layers, EyeOff, ZoomIn, ZoomOut, Maximize2, Minimize2,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type ContainerType = "20ft" | "40ft" | "40ft HC";
type SimPhase = "idle" | "door-open" | "exit" | "resize" | "loading" | "door-close" | "done";
type ViewMode = "normal" | "xray" | "cutaway";

interface CargoSpec {
  id: string; name: string; color: string; darkColor: string;
  l: number; w: number; h: number; wt: number; defaultQty: number;
}
interface Box3D {
  idx: number; x: number; y: number; z: number;
  bw: number; bh: number; bd: number;
  color: string; darkColor: string; label: string;
}

/* ─── Data ───────────────────────────────────────────────────────────────── */
const CARGO_DEFS: CargoSpec[] = [
  { id:"c1", name:"ThinkPad X1",   color:"#E2001A", darkColor:"#880012", l:60,  w:40, h:20,  wt:8,  defaultQty:120 },
  { id:"c2", name:"ThinkCentre M", color:"#FF6B35", darkColor:"#B03010", l:50,  w:50, h:45,  wt:15, defaultQty:80  },
  { id:"c3", name:"Legion 5",      color:"#3B6FE8", darkColor:"#2040A8", l:55,  w:38, h:22,  wt:10, defaultQty:60  },
  { id:"c4", name:"ThinkStation",  color:"#22C55E", darkColor:"#128038", l:120, w:80, h:100, wt:45, defaultQty:20  },
  { id:"c5", name:"Accessories",   color:"#4ECDC4", darkColor:"#288880", l:40,  w:30, h:25,  wt:5,  defaultQty:200 },
];

const SPECS = {
  "20ft":    { vol:33.2, maxWt:21700, dims:"5.9 × 2.4 × 2.4 m", sx:0.64, sy:1.00 },
  "40ft":    { vol:67.7, maxWt:26580, dims:"12.0 × 2.4 × 2.4 m", sx:1.00, sy:1.00 },
  "40ft HC": { vol:76.3, maxWt:26330, dims:"12.0 × 2.4 × 2.7 m", sx:1.00, sy:1.14 },
} as const;

// Base scene dimensions (px)
const BW = 320, BH = 162, BD = 144;

/* ─── Audio ──────────────────────────────────────────────────────────────── */
let _ac: AudioContext | null = null;
const ac = () => {
  if (!_ac) try { _ac = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch {}
  return _ac;
};
const snd = {
  thud() {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.frequency.setValueAtTime(185, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(50, c.currentTime + 0.13);
    g.gain.setValueAtTime(0.26, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
    o.start(c.currentTime); o.stop(c.currentTime + 0.22);
  },
  done() {
    const c = ac(); if (!c) return;
    [523, 659, 784, 1047].forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = "sine"; o.frequency.value = f;
      const t = c.currentTime + i * 0.1;
      g.gain.setValueAtTime(0.14, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      o.start(t); o.stop(t + 0.55);
    });
  },
  clank() {
    const c = ac(); if (!c) return;
    [310, 240, 170].forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.connect(g); g.connect(c.destination);
      o.type = "square"; o.frequency.value = f;
      const t = c.currentTime + i * 0.07;
      g.gain.setValueAtTime(0.07, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
      o.start(t); o.stop(t + 0.15);
    });
  },
};

/* ─── Box layout ─────────────────────────────────────────────────────────── */
function buildBoxes(ct: ContainerType, qtys: Record<string, number>): Box3D[] {
  const { sx, sy } = SPECS[ct];
  const W = BW * sx - 20, H = BH * sy - 16, D = BD - 16;
  const sc = 0.22;
  const maxPer = ct === "20ft" ? 12 : 24;
  const boxes: Box3D[] = [];
  let idx = 0, cx = 0, cy = 0, cz = 0;

  for (const c of CARGO_DEFS) {
    const qty = qtys[c.id] ?? c.defaultQty;
    const bw = Math.min(c.l * sc * sx, W * 0.40);
    const bh = Math.min(c.h * sc * sy, H * 0.52);
    const bd = Math.min(c.w * sc, D * 0.40);
    const cnt = Math.min(qty, maxPer);
    let rz = cz;
    for (let i = 0; i < cnt; i++) {
      if (cx + bw > W) { cx = 0; rz += bd + 3; }
      if (rz + bd > D) { rz = 0; cy += bh + 3; }
      if (cy + bh > H) break;
      boxes.push({
        idx: idx++,
        x: cx - W / 2 + bw / 2 + 9,
        y: H / 2 - cy - bh / 2 - 8,
        z: rz - D / 2 + bd / 2 + 8,
        bw, bh, bd,
        color: c.color, darkColor: c.darkColor,
        label: c.name.split(" ")[0],
      });
      cx += bw + 3;
    }
    cx = 0; cz = rz;
  }
  return boxes;
}

function calcResult(ct: ContainerType, qtys: Record<string, number>) {
  const s = SPECS[ct];
  const vol = CARGO_DEFS.reduce((a, c) => a + (c.l * c.w * c.h * (qtys[c.id] ?? c.defaultQty)) / 1e6, 0);
  const eff = Math.min(96, Math.round((vol / s.vol) * 100 * 1.21));
  const loadHr = +((ct === "20ft" ? 2.4 : ct === "40ft" ? 3.0 : 3.2) * (1 - (eff - 70) * 0.003)).toFixed(1);
  const base = ct === "20ft" ? 2100 : ct === "40ft" ? 3620 : 3835;
  const risk: "Thấp" | "Trung bình" | "Cao" = eff > 88 ? "Thấp" : eff > 74 ? "Trung bình" : "Cao";
  return { eff, loadHr, cost: Math.round(base * 0.893), risk };
}

/* ─── Single animated box ────────────────────────────────────────────────── */
function AnimBox({ b, placed, glowing, phase }: {
  b: Box3D; placed: boolean; glowing: boolean; phase: SimPhase;
}) {
  const isExit = phase === "exit";
  // Duration: 0.8–1.2s per spec (Motion.Duration)
  const dur = 0.8 + (b.idx % 5) * 0.1;

  const style: React.CSSProperties = {
    position: "absolute",
    transformStyle: "preserve-3d",
    width: b.bw, height: b.bh,
    transform: isExit
      ? `translate3d(${b.x - 280}px, ${b.y - 35}px, ${b.z}px) scale(0.2) rotateZ(-18deg)`
      : placed
        ? `translate3d(${b.x}px, ${b.y}px, ${b.z}px)`
        : `translate3d(${BW * 0.8}px, ${b.y - 60}px, ${b.z}px) scale(0.35)`,
    opacity: isExit ? 0 : placed ? 1 : 0,
    transition: isExit
      ? "transform 0.38s ease-in, opacity 0.28s ease-in"
      : placed
        ? `transform ${dur}s cubic-bezier(0.16,1.22,0.3,1), opacity 0.36s ease-out`
        : "none",
    filter: glowing
      ? `drop-shadow(0 0 8px ${b.color}) drop-shadow(0 0 18px ${b.color}aa)`
      : "none",
  };

  return (
    <div style={style}>
      {/* front */}
      <div style={{
        position:"absolute", width:b.bw, height:b.bh,
        transform:`translateZ(${b.bd / 2}px)`,
        background:`linear-gradient(140deg, ${b.color} 0%, ${b.darkColor} 100%)`,
        border:"0.5px solid rgba(255,255,255,0.28)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize: Math.max(6, b.bw / 9), color:"rgba(255,255,255,0.95)",
        fontWeight:600, overflow:"hidden", userSelect:"none",
      }}>{b.label}</div>
      {/* back */}
      <div style={{ position:"absolute", width:b.bw, height:b.bh, transform:`translateZ(${-b.bd/2}px)`, background:b.darkColor, opacity:0.5 }} />
      {/* right */}
      <div style={{ position:"absolute", width:b.bd, height:b.bh, transform:`rotateY(90deg) translateZ(${b.bw/2}px)`, background:`linear-gradient(180deg,${b.color}88,${b.darkColor})`, opacity:0.78 }} />
      {/* left */}
      <div style={{ position:"absolute", width:b.bd, height:b.bh, transform:`rotateY(90deg) translateZ(${-b.bw/2}px)`, background:b.darkColor, opacity:0.48 }} />
      {/* top */}
      <div style={{ position:"absolute", width:b.bw, height:b.bd, transform:`rotateX(90deg) translateZ(${-b.bh/2}px)`, background:`linear-gradient(135deg,${b.color}cc,${b.color})`, border:"0.5px solid rgba(255,255,255,0.32)" }} />
      {/* bottom */}
      <div style={{ position:"absolute", width:b.bw, height:b.bd, transform:`rotateX(90deg) translateZ(${b.bh/2}px)`, background:b.darkColor, opacity:0.28 }} />
    </div>
  );
}

/* ─── Container door ─────────────────────────────────────────────────────── */
function Door({ side, cH, cD, open }: { side: "L"|"R"; cH:number; cD:number; open:boolean }) {
  const half = cD / 2 - 1;
  const tz = side === "R" ? BW / 2 : -(BW / 2 - half);
  const angle = open ? (side === "R" ? 115 : -115) : 0;
  return (
    <div style={{
      position:"absolute", width:half, height:cH,
      transformOrigin: side === "R" ? "left center" : "right center",
      transform:`rotateY(90deg) translateZ(${tz}px) rotateY(${angle}deg)`,
      background:"rgba(20,20,24,0.92)",
      border:"1.5px solid rgba(255,255,255,0.55)",
      transition:"transform 0.95s cubic-bezier(0.34,1.08,0.64,1)",
      backfaceVisibility:"hidden",
    }}>
      {[0.25, 0.5, 0.75].map(p => (
        <div key={p} style={{ position:"absolute", left:4, right:4, top:`${p*100}%`, height:1, background:"rgba(255,255,255,0.18)" }} />
      ))}
      <div style={{ position:"absolute", width:4, height:26, top:"50%", marginTop:-13, [side==="R"?"left":"right"]:5, background:"rgba(255,255,255,0.5)", borderRadius:2 }} />
    </div>
  );
}

/* ─── Wireframe box container ────────────────────────────────────────────── */
// Each face: white border (creates the wireframe edges) + red tint (lets you see through)
function ContainerWireframe({ ct, phase, viewMode, children, fillPct, doorsOpen }: {
  ct: ContainerType; phase: SimPhase; viewMode: ViewMode;
  children: React.ReactNode; fillPct: number; doorsOpen: boolean;
}) {
  const { sx, sy } = SPECS[ct];
  const cW = BW, cH = BH, cD = BD;

  // Transparency: 0.65 per spec → face opacity = 1 - 0.65 = 0.35
  // xray: near-invisible (only wireframe edges show), cutaway: midpoint
  const faceAlpha = { normal: 0.35, xray: 0.04, cutaway: 0.15 }[viewMode];
  // Ambient fill tint: amber → green
  const ar = Math.round(200 * (1 - fillPct) * 0.7);
  const ag = Math.round(180 * fillPct * 0.6 + 10);
  const fillTint = phase === "done"
    ? `rgba(34,197,94,${faceAlpha + 0.03})`
    : `rgba(${ar},${ag},10,${faceAlpha})`;

  const border = "1.5px solid rgba(255,255,255,0.65)";
  const borderFaint = "1px solid rgba(255,255,255,0.22)";

  // Which faces to show
  const showTop    = viewMode !== "cutaway";
  const showRight  = viewMode !== "cutaway";
  const showFront  = viewMode !== "xray" && viewMode !== "cutaway";

  return (
    <div style={{
      transformStyle: "preserve-3d", width: cW, height: cH, position:"relative",
      transform:`rotateX(0deg) rotateY(0deg) scaleX(${sx}) scaleY(${sy})`,
      transition: phase === "resize" ? "transform 0.85s cubic-bezier(0.34,1.25,0.64,1)" : "none",
    }}>
      {/* ── Floor ── */}
      <div style={{
        position:"absolute", width:cW, height:cD,
        transform:`rotateX(90deg) translateZ(${cH/2}px)`,
        background: fillTint,
        backgroundImage:`repeating-linear-gradient(0deg,rgba(255,255,255,0.08) 0px,rgba(255,255,255,0.08) 1px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,rgba(255,255,255,0.08) 0px,rgba(255,255,255,0.08) 1px,transparent 1px,transparent 32px)`,
        border,
        transition:"background 0.8s ease",
      }} />

      {/* ── Ceiling ── */}
      {showTop && (
        <div style={{ position:"absolute", width:cW, height:cD, transform:`rotateX(90deg) translateZ(${-cH/2}px)`, background:`rgba(226,0,26,${faceAlpha * 0.5})`, border }} />
      )}

      {/* ── Back wall ── */}
      <div style={{ position:"absolute", width:cW, height:cH, transform:`translateZ(${-cD/2}px)`, background:`rgba(226,0,26,${faceAlpha * 1.2})`, border }} />

      {/* ── Left wall ── */}
      <div style={{ position:"absolute", width:cD, height:cH, transform:`rotateY(90deg) translateZ(${-cW/2}px)`, background:`rgba(226,0,26,${faceAlpha})`, border }} />

      {/* ── Right wall ── */}
      {showRight && (
        <div style={{ position:"absolute", width:cD, height:cH, transform:`rotateY(90deg) translateZ(${cW/2}px)`, background:`rgba(226,0,26,${faceAlpha * 0.4})`, border: borderFaint }} />
      )}

      {/* ── Front face ── */}
      {showFront && (
        <div style={{ position:"absolute", width:cW, height:cH, transform:`translateZ(${cD/2}px)`, background:`rgba(226,0,26,${faceAlpha * 0.3})`, border: borderFaint }} />
      )}

      {/* ── Doors ── */}
      <Door side="L" cH={cH} cD={cD} open={doorsOpen} />
      <Door side="R" cH={cH} cD={cD} open={doorsOpen} />

      {/* ── Cargo boxes ── */}
      {children}

      {/* ── Floor glow reflection ── */}
      <div style={{
        position:"absolute", width:cW, height:cD,
        transform:`rotateX(90deg) translateZ(${cH/2+1}px)`,
        background:`linear-gradient(180deg,transparent 0%,${fillTint} 100%)`,
        opacity:0.4, transition:"background 0.8s ease", pointerEvents:"none",
      }} />
    </div>
  );
}

/* ─── 3D Scene ───────────────────────────────────────────────────────────── */
function Scene({
  boxes, placed, glowIdx, ct, phase, viewMode, rotX, rotY, perspective,
  height, onDown, onMove, onUp, onWheel,
}: {
  boxes: Box3D[]; placed: number; glowIdx: number;
  ct: ContainerType; phase: SimPhase; viewMode: ViewMode;
  rotX: number; rotY: number; perspective: number; height: number;
  onDown: (e: React.MouseEvent) => void;
  onMove: (e: React.MouseEvent) => void;
  onUp: () => void;
  onWheel: (e: React.WheelEvent) => void;
}) {
  const doorsOpen = phase === "door-open" || phase === "exit" || phase === "resize" || phase === "loading";
  const fillPct = boxes.length > 0 ? Math.min(1, placed / boxes.length) : 0;

  return (
    <div
      style={{ height, perspective, display:"flex", alignItems:"center", justifyContent:"center",
        cursor:"grab", userSelect:"none", overflow:"hidden",
        background:"radial-gradient(ellipse at center, #0E1A2E 0%, #070B14 100%)",
        borderRadius:8,
      }}
      onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
      onWheel={onWheel}
    >
      {/* Outer group applies the user-controlled rotation */}
      <div style={{ transformStyle:"preserve-3d", transform:`rotateX(${rotX}deg) rotateY(${rotY}deg)` }}>
        <ContainerWireframe
          ct={ct} phase={phase} viewMode={viewMode}
          fillPct={fillPct} doorsOpen={doorsOpen}
        >
          {boxes.map((b, i) => (
            <AnimBox
              key={b.idx}
              b={b}
              placed={i < placed}
              glowing={i === glowIdx && phase === "loading"}
              phase={phase}
            />
          ))}
        </ContainerWireframe>
      </div>
    </div>
  );
}

/* ─── View mode toggle ───────────────────────────────────────────────────── */
function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  const opts = [
    { val:"normal"  as ViewMode, label:"Bình thường", icon:<Eye size={11}/> },
    { val:"xray"    as ViewMode, label:"X-Ray",        icon:<Layers size={11}/> },
    { val:"cutaway" as ViewMode, label:"Cắt mặt",      icon:<EyeOff size={11}/> },
  ];
  return (
    <div className="flex gap-0.5 rounded p-0.5 bg-[#1A1A1D]">
      {opts.map(o => (
        <button key={o.val} onClick={() => onChange(o.val)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs transition-all"
          style={{
            background: mode === o.val ? "rgba(226,0,26,0.2)" : "transparent",
            color:      mode === o.val ? "#E2001A" : "#6B6B78",
            border:     mode === o.val ? "1px solid rgba(226,0,26,0.4)" : "1px solid transparent",
          }}
        >{o.icon}{o.label}</button>
      ))}
    </div>
  );
}

/* ─── Quantity modal ─────────────────────────────────────────────────────── */
function QtyModal({ qtys, onChange, onApply }: {
  qtys: Record<string, number>;
  onChange: (id: string, v: number) => void;
  onApply: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65" onClick={onApply}>
      <div className="bg-[#141416] border border-border rounded-xl p-5 w-80 space-y-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-foreground">Điều chỉnh số lượng hàng</h3>
          <button onClick={onApply}><X size={14} className="text-muted-foreground hover:text-foreground" /></button>
        </div>
        {CARGO_DEFS.map(c => {
          const val = qtys[c.id] ?? c.defaultQty;
          return (
            <div key={c.id} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: c.color }} />
              <span className="flex-1 text-xs text-foreground">{c.name}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => onChange(c.id, Math.max(0, val - 10))}
                  className="w-6 h-6 rounded bg-[#1E1E22] hover:bg-[#2E2E35] flex items-center justify-center transition-colors">
                  <Minus size={10} className="text-muted-foreground" />
                </button>
                <span className="w-10 text-center text-xs text-foreground" style={{ fontFamily:"'JetBrains Mono',monospace" }}>{val}</span>
                <button onClick={() => onChange(c.id, Math.min(500, val + 10))}
                  className="w-6 h-6 rounded bg-[#1E1E22] hover:bg-[#2E2E35] flex items-center justify-center transition-colors">
                  <Plus size={10} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          );
        })}
        <button onClick={onApply}
          className="w-full py-2.5 bg-[#E2001A] text-white rounded text-xs hover:bg-[#C0001A] transition-colors flex items-center justify-center gap-2">
          <Zap size={12} />Áp dụng & Tính toán lại
        </button>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
const STEPS = ["Nhập hàng hóa", "Chọn container", "Hành trình", "AI tối ưu", "Mô phỏng 3D", "Thực thi"];
const BOX_MS = 200;

export function Loading3D() {
  const [ct, setCt]       = useState<ContainerType>("40ft HC");
  const [phase, setPhase] = useState<SimPhase>("idle");
  const [step, setStep]   = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("xray");
  const [qtys, setQtys]   = useState<Record<string, number>>(
    Object.fromEntries(CARGO_DEFS.map(c => [c.id, c.defaultQty]))
  );
  const [showQty, setShowQty] = useState(false);
  const [boxes, setBoxes]     = useState<Box3D[]>([]);
  const [placed, setPlaced]   = useState(0);
  const [glowIdx, setGlowIdx] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [result, setResult]   = useState<ReturnType<typeof calcResult> | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Camera — DefaultView: Front per spec (slight angle for 3D readability)
  const [rotY, setRotY] = useState(15);   // small Y tilt so depth is visible
  const [rotX, setRotX] = useState(-10);  // slight top-down, near-front
  const [pov, setPov]   = useState(900);  // perspective = zoom
  const [fullscreen, setFullscreen] = useState(false);
  const dragging  = useRef(false);
  const lastPos   = useRef({ x: 0, y: 0 });
  const placeRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasRun    = useRef(false);

  const onDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    setRotY(r => r + dx * 0.55);
    setRotX(r => Math.max(-50, Math.min(15, r + dy * 0.35)));
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => { dragging.current = false; };
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setPov(p => Math.max(400, Math.min(1600, p + e.deltaY * 0.9)));
  };

  const runSim = useCallback((containerType: ContainerType, quantities: Record<string, number>) => {
    if (placeRef.current) clearInterval(placeRef.current);
    setIsRunning(true);
    setResult(null);
    setProgress(0);
    setGlowIdx(-1);

    const doLoad = (nb: Box3D[]) => {
      setBoxes(nb);
      setPlaced(0);
      setPhase("loading");
      setStep(4);
      let cnt = 0;
      placeRef.current = setInterval(() => {
        cnt++;
        setPlaced(cnt);
        setGlowIdx(cnt - 1);
        setProgress(Math.round((cnt / nb.length) * 100));
        snd.thud();
        const fi = cnt - 1;
        setTimeout(() => setGlowIdx(g => g === fi ? -1 : g), 700);
        if (cnt >= nb.length) {
          clearInterval(placeRef.current!);
          setTimeout(() => {
            setPhase("door-close");
            snd.clank();
            setTimeout(() => {
              setPhase("done");
              setStep(5);
              setIsRunning(false);
              setProgress(100);
              setResult(calcResult(containerType, quantities));
              snd.done();
            }, 950);
          }, 450);
        }
      }, BOX_MS);
    };

    const nb = buildBoxes(containerType, quantities);

    if (hasRun.current) {
      setPhase("exit");
      setTimeout(() => {
        setPhase("resize");
        setBoxes([]); setPlaced(0);
        setTimeout(() => {
          setPhase("door-open");
          snd.clank();
          setTimeout(() => doLoad(nb), 950);
        }, 700);
      }, 480);
    } else {
      hasRun.current = true;
      setPhase("door-open");
      snd.clank();
      setTimeout(() => doLoad(nb), 950);
    }
  }, []);

  useEffect(() => {
    if (hasRun.current) runSim(ct, qtys);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ct]);

  const handleReset = () => {
    if (placeRef.current) clearInterval(placeRef.current);
    hasRun.current = false;
    setStep(0); setBoxes([]); setPlaced(0); setPhase("idle");
    setProgress(0); setIsRunning(false); setResult(null);
    setRotY(15); setRotX(-10); setPov(900); setFullscreen(false);
  };

  const totalVol = CARGO_DEFS.reduce((a, c) => a + (c.l * c.w * c.h * (qtys[c.id] ?? c.defaultQty)) / 1e6, 0);
  const totalWt  = CARGO_DEFS.reduce((a, c) => a + c.wt * (qtys[c.id] ?? c.defaultQty), 0);
  const r = result;

  return (
    <>
      {showQty && (
        <QtyModal
          qtys={qtys}
          onChange={(id, v) => setQtys(q => ({ ...q, [id]: v }))}
          onApply={() => { setShowQty(false); if (hasRun.current) runSim(ct, qtys); }}
        />
      )}

      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground">3D Intelligent Loading</h1>
            <p className="text-muted-foreground mt-0.5">
              Container wireframe · Kéo xoay · Cuộn zoom · Cửa động · Hàng từng kiện · Âm thanh
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded border"
            style={{ background:"rgba(107,127,227,0.08)", borderColor:"rgba(107,127,227,0.28)" }}>
            <Zap size={12} className="text-[#6B7FE3]" />
            <span className="text-[#6B7FE3] text-xs font-medium">AI POWERED</span>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-500 ${
                  i < step   ? "bg-[#E2001A] text-white" :
                  i === step ? "border-2 border-[#E2001A] text-[#E2001A]" :
                  "border border-border text-muted-foreground bg-muted"
                }`} style={{ background: i === step ? "rgba(226,0,26,0.1)" : undefined }}>
                  {i < step ? <CheckCircle2 size={12} /> : i + 1}
                </div>
                <p className={`text-xs mt-1 whitespace-nowrap hidden xl:block transition-colors ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-0.5 mb-4 transition-all duration-700 ${i < step ? "bg-[#E2001A]" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Config ── */}
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h3 className="text-foreground">Loại container</h3>
              <p className="text-muted-foreground text-xs -mt-1">Chọn → AI tự động tính lại</p>
              {(["20ft", "40ft", "40ft HC"] as ContainerType[]).map(t => {
                const sp = SPECS[t], on = ct === t;
                return (
                  <label key={t}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:border-[#E2001A]/30"
                    style={{ borderColor: on ? "rgba(226,0,26,0.45)" : "var(--border)", background: on ? "rgba(226,0,26,0.06)" : "transparent" }}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${on ? "border-[#E2001A]" : "border-border"}`}>
                      {on && <div className="w-2 h-2 rounded-full bg-[#E2001A]" />}
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex justify-between">
                        <span className={on ? "text-foreground font-medium" : "text-muted-foreground"}>{t}</span>
                        <span className="text-muted-foreground">{sp.vol} m³</span>
                      </div>
                      <p className="text-muted-foreground mt-0.5">{sp.dims} · {(sp.maxWt / 1000).toFixed(1)}T</p>
                    </div>
                    <input type="radio" className="hidden" checked={on} onChange={() => setCt(t)} />
                  </label>
                );
              })}
            </div>

            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground">Hàng hóa</h3>
                <button onClick={() => setShowQty(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 border border-border rounded text-muted-foreground hover:text-foreground text-xs transition-all hover:border-[#E2001A]/30">
                  <SlidersHorizontal size={11} />Điều chỉnh
                </button>
              </div>
              {CARGO_DEFS.map(c => (
                <div key={c.id} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: c.color }} />
                  <span className="flex-1 text-foreground truncate">{c.name}</span>
                  <span className="text-muted-foreground" style={{ fontFamily:"'JetBrains Mono',monospace" }}>{qtys[c.id] ?? c.defaultQty}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 grid grid-cols-2 gap-2 text-xs">
                <div><p className="text-muted-foreground">Trọng lượng</p><p className="text-foreground">{totalWt.toLocaleString()} kg</p></div>
                <div><p className="text-muted-foreground">Thể tích</p><p className="text-foreground">{totalVol.toFixed(1)} m³</p></div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h3 className="text-foreground">Hành trình</h3>
              {[
                { label:"Loại hình", opts:["Đường biển","Đường hàng không","Đường bộ"] },
                { label:"Đối tác",   opts:["COSCO Shipping","Evergreen","DHL","MSC","Nippon Yusen"] },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-muted-foreground text-xs block mb-1">{f.label}</label>
                  <select className="w-full bg-[#1A1A1D] border border-border rounded px-3 py-2 text-foreground text-xs outline-none focus:border-[#E2001A]/50">
                    {f.opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => { hasRun.current = false; runSim(ct, qtys); hasRun.current = true; }}
                disabled={isRunning}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded text-white text-sm transition-all"
                style={{
                  background: "#E2001A",
                  boxShadow: isRunning ? "0 0 26px rgba(226,0,26,0.65), 0 0 8px rgba(226,0,26,0.3)" : "0 0 10px rgba(226,0,26,0.18)",
                  opacity: isRunning ? 0.82 : 1,
                  filter: isRunning ? "brightness(1.22)" : "brightness(1)",
                  cursor: isRunning ? "not-allowed" : "pointer",
                }}
              >
                {isRunning
                  ? <><div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Đang tối ưu…</>
                  : <><Zap size={14} />{boxes.length === 0 ? "AI Tính toán & Mô phỏng 3D" : "Tính toán lại"}</>}
              </button>
              <button onClick={() => setShowQty(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border text-muted-foreground rounded hover:text-foreground hover:border-[#E2001A]/30 transition-all text-xs">
                <SlidersHorizontal size={12} />Thay đổi số lượng hàng
              </button>
              {boxes.length > 0 && (
                <button onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border text-muted-foreground rounded hover:text-foreground transition-colors text-xs">
                  <RotateCcw size={12} />Đặt lại
                </button>
              )}
            </div>
          </div>

          {/* ── 3D Viewer ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Fullscreen overlay */}
            {fullscreen && (
              <div className="fixed inset-0 z-50 flex flex-col bg-[#070B14]">
                {/* Fullscreen top bar */}
                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor:"rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-3">
                    <h3 className="text-foreground">Container 3D — {ct}</h3>
                    {isRunning && <span className="px-2 py-0.5 rounded text-xs animate-pulse" style={{ background:"rgba(226,0,26,0.15)", color:"#E2001A" }}>● Đang xếp hàng…</span>}
                    {phase === "done" && <span className="px-2 py-0.5 rounded text-xs" style={{ background:"rgba(34,197,94,0.12)", color:"#22C55E" }}>✓ Hoàn tất</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <ViewToggle mode={viewMode} onChange={setViewMode} />
                    <button onClick={() => setPov(p => Math.max(400, p - 120))} className="p-2 text-muted-foreground hover:text-foreground transition-colors"><ZoomIn size={15}/></button>
                    <button onClick={() => setPov(p => Math.min(1600, p + 120))} className="p-2 text-muted-foreground hover:text-foreground transition-colors"><ZoomOut size={15}/></button>
                    <button onClick={() => { setRotX(-10); setRotY(15); setPov(900); }} className="px-3 py-1.5 text-xs rounded border border-border text-muted-foreground hover:text-foreground hover:border-[#E2001A]/30 transition-all">Front</button>
                    <button onClick={() => setFullscreen(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-[#E2001A]/40 text-[#E2001A] hover:bg-[#E2001A]/10 transition-all">
                      <Minimize2 size={12}/>Thu nhỏ
                    </button>
                  </div>
                </div>
                {/* Fullscreen scene */}
                <div className="flex-1 min-h-0">
                  <Scene
                    boxes={boxes} placed={placed} glowIdx={glowIdx}
                    ct={ct} phase={phase} viewMode={viewMode}
                    rotX={rotX} rotY={rotY} perspective={pov}
                    height={window.innerHeight - 56}
                    onDown={onDown} onMove={onMove} onUp={onUp} onWheel={onWheel}
                  />
                </div>
                {/* Fullscreen progress */}
                {phase !== "idle" && (
                  <div className="px-5 py-3 border-t space-y-1.5" style={{ borderColor:"rgba(255,255,255,0.08)" }}>
                    <div className="flex items-center justify-between text-xs">
                      <span className={isRunning ? "text-[#E2001A] flex items-center gap-1.5" : "text-muted-foreground"}>
                        {isRunning && <div className="w-1.5 h-1.5 rounded-full bg-[#E2001A] animate-pulse" />}
                        {phase === "loading" ? "Đang tối ưu lại cấu hình container…" : "Hiệu suất lấp đầy"}
                      </span>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", color: phase === "done" ? "#22C55E" : "#E2001A" }}>{progress}%</span>
                    </div>
                    <div className="h-2 bg-[#1E1E22] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-150"
                        style={{ width:`${progress}%`, background: phase==="done" ? "linear-gradient(90deg,#22C55E,#4ECDC4)" : "linear-gradient(90deg,#E2001A 0%,#FF6B35 55%,#FFB347 100%)" }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-card border border-border rounded-lg p-4">
              {/* Header row */}
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-foreground">Container 3D — {ct}</h3>
                  {isRunning && <span className="px-2 py-0.5 rounded text-xs animate-pulse" style={{ background:"rgba(226,0,26,0.15)", color:"#E2001A" }}>● Đang xếp hàng…</span>}
                  {phase === "door-open"  && !isRunning && <span className="px-2 py-0.5 rounded text-xs" style={{ background:"rgba(255,179,71,0.12)", color:"#FFB347" }}>Cửa đang mở…</span>}
                  {phase === "door-close" && <span className="px-2 py-0.5 rounded text-xs" style={{ background:"rgba(107,127,227,0.12)", color:"#6B7FE3" }}>Đóng cửa…</span>}
                  {phase === "done"       && <span className="px-2 py-0.5 rounded text-xs" style={{ background:"rgba(34,197,94,0.12)", color:"#22C55E" }}>✓ Hoàn tất</span>}
                </div>
                <ViewToggle mode={viewMode} onChange={setViewMode} />
              </div>

              {/* Controls bar */}
              <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                <span>🖱 Kéo xoay</span>
                <span>⚙ Cuộn zoom</span>
                <div className="flex items-center gap-1 ml-auto">
                  <button onClick={() => setPov(p => Math.max(400, p - 100))} className="p-1 hover:text-foreground transition-colors"><ZoomIn size={13}/></button>
                  <button onClick={() => setPov(p => Math.min(1600, p + 100))} className="p-1 hover:text-foreground transition-colors"><ZoomOut size={13}/></button>
                  <button onClick={() => { setRotX(-10); setRotY(15); setPov(900); }}
                    className="px-2 py-0.5 text-xs rounded border border-border hover:text-foreground hover:border-[#E2001A]/30 transition-all ml-0.5">
                    Front
                  </button>
                  <button onClick={() => setFullscreen(true)}
                    className="flex items-center gap-1 px-2 py-0.5 text-xs rounded border border-border hover:text-foreground hover:border-[#E2001A]/30 transition-all ml-0.5">
                    <Maximize2 size={11}/>Phóng to
                  </button>
                </div>
              </div>

              {/* Scene */}
              {phase === "idle" ? (
                <div className="flex flex-col items-center justify-center rounded-lg"
                  style={{ height:370, background:"radial-gradient(ellipse at center, #0E1A2E 0%, #070B14 100%)" }}>
                  <div className="relative w-16 h-16 mb-4">
                    <Package size={64} style={{ color:"rgba(226,0,26,0.1)", position:"absolute" }} />
                    <Package size={42} style={{ color:"rgba(226,0,26,0.4)", position:"absolute", top:11, left:11 }} className="animate-pulse" />
                  </div>
                  <p className="text-sm text-muted-foreground">Nhấn "AI Tính toán & Mô phỏng 3D" để bắt đầu</p>
                  <p className="text-xs text-muted-foreground mt-1">Kéo để xoay · Cuộn để zoom · Phóng to toàn màn hình</p>
                </div>
              ) : (
                <Scene
                  boxes={boxes} placed={placed} glowIdx={glowIdx}
                  ct={ct} phase={phase} viewMode={viewMode}
                  rotX={rotX} rotY={rotY} perspective={pov}
                  height={370}
                  onDown={onDown} onMove={onMove} onUp={onUp} onWheel={onWheel}
                />
              )}

              {/* Progress bar */}
              {phase !== "idle" && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className={isRunning ? "text-[#E2001A] flex items-center gap-1.5" : "text-muted-foreground"}>
                      {isRunning && <div className="w-1.5 h-1.5 rounded-full bg-[#E2001A] animate-pulse" />}
                      {phase === "loading"    ? "Đang tối ưu lại cấu hình container…" :
                       phase === "door-open"  ? "Mở cửa container…" :
                       phase === "door-close" ? "Đóng và khoá container…" :
                       phase === "exit"       ? "Giải phóng hàng hoá cũ…" :
                       phase === "resize"     ? "Cấu hình container mới…" :
                       "Hiệu suất lấp đầy"}
                    </span>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", color: phase === "done" ? "#22C55E" : "#E2001A" }}>
                      {progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-[#1E1E22] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-150"
                      style={{
                        width:`${progress}%`,
                        background: phase === "done"
                          ? "linear-gradient(90deg,#22C55E,#4ECDC4)"
                          : "linear-gradient(90deg,#E2001A 0%,#FF6B35 55%,#FFB347 100%)"
                      }}
                    />
                  </div>
                  {phase === "loading" && boxes.length > 0 && (
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className={progress >= 15 ? "text-[#FF6B35]" : ""}>Giải phóng</span>
                      <span className={progress >= 50 ? "text-[#FFB347]" : ""}>Sắp xếp</span>
                      <span className={progress >= 85 ? "text-[#22C55E]" : ""}>Hoàn thiện</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Results */}
            {r && phase === "done" && (
              <div className="bg-card border rounded-lg p-5 space-y-4" style={{ borderColor:"rgba(34,197,94,0.22)" }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <h3 className="text-foreground">Kết quả AI — Container {ct}</h3>
                  <span className="ml-auto text-muted-foreground text-xs">Vừa cập nhật</span>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label:"Hiệu suất không gian", val:`${r.eff}%`,   delta:`+${Math.round(r.eff*0.23)}% vs thủ công`, c:"#E2001A" },
                    { label:"Thời gian chất tải",   val:`${r.loadHr}h`, delta:"−25% tiết kiệm",                         c:"#4ECDC4" },
                    { label:"Chi phí vận tải",       val:`$${r.cost.toLocaleString()}`, delta:"−10.7% tiết kiệm",        c:"#FFB347" },
                    { label:"Rủi ro hư hỏng",        val:r.risk,        delta:"−30% vs chuẩn",
                      c: r.risk==="Thấp"?"#22C55E":r.risk==="Trung bình"?"#FFB347":"#E2001A" },
                  ].map(k => (
                    <div key={k.label} className="bg-[#1A1A1D] rounded-lg p-3 space-y-1">
                      <p className="text-muted-foreground text-xs">{k.label}</p>
                      <p style={{ color:k.c, fontFamily:"'JetBrains Mono',monospace", fontSize:17, lineHeight:1.35 }}>{k.val}</p>
                      <p className="text-emerald-400 text-xs">{k.delta}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs border-t border-border pt-3">
                  {[
                    { label:"Thể tích container", val:`${SPECS[ct].vol} m³` },
                    { label:"Tải trọng tối đa",   val:`${(SPECS[ct].maxWt/1000).toFixed(1)} T` },
                    { label:"Kích thước",          val:SPECS[ct].dims },
                  ].map(s => (
                    <div key={s.label} className="bg-[#1A1A1D] rounded p-2.5">
                      <p className="text-muted-foreground">{s.label}</p>
                      <p className="text-foreground mt-0.5">{s.val}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-[#E2001A] text-white rounded hover:bg-[#C0001A] transition-colors text-xs">
                    <Download size={12} />Xuất sơ đồ xếp hàng
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 border text-[#E2001A] rounded hover:bg-[#E2001A]/10 transition-colors text-xs"
                    style={{ borderColor:"rgba(226,0,26,0.35)" }}>
                    <ArrowRight size={12} />Đồng bộ Smart TMS
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
