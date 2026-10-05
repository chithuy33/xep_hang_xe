import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, Plus, ChevronRight, MapPin, Clock, Truck, CheckCircle2, Circle, AlertCircle, ArrowRight, Zap, Navigation } from "lucide-react";

const orders = [
  { id: "ORD-2024-08841", customer: "Lenovo APAC Distribution", origin: "Thành Đô, CN", dest: "Singapore", weight: "24.8T", vol: "142 CBM", status: "Đang vận chuyển", eta: "14/06/2026", priority: "Cao", carrier: "COSCO Shipping", value: "$284,500" },
  { id: "ORD-2024-08756", customer: "Lenovo NA Warehouse", origin: "Thẩm Quyến, CN", dest: "Los Angeles, US", weight: "18.2T", vol: "98 CBM", status: "Tối ưu tuyến", eta: "18/06/2026", priority: "Trung bình", carrier: "Evergreen", value: "$196,200" },
  { id: "ORD-2024-08701", customer: "Lenovo Europe Hub", origin: "Hồng Kông", dest: "Rotterdam, NL", weight: "32.5T", vol: "210 CBM", status: "Hoàn tất", eta: "09/06/2026", priority: "Thấp", carrier: "MSC", value: "$412,800" },
  { id: "ORD-2024-08690", customer: "Lenovo Japan Office", origin: "Lenovo Park BJ", dest: "Tokyo, JP", weight: "6.1T", vol: "38 CBM", status: "Nhập đơn", eta: "20/06/2026", priority: "Cao", carrier: "Nippon Yusen", value: "$87,300" },
  { id: "ORD-2024-08645", customer: "Lenovo MEA Region", origin: "Thượng Hải, CN", dest: "Dubai, UAE", weight: "15.9T", vol: "88 CBM", status: "Phân tích", eta: "22/06/2026", priority: "Trung bình", carrier: "PIL", value: "$178,900" },
  { id: "ORD-2024-08612", customer: "Lenovo India Supply", origin: "Thẩm Quyến, CN", dest: "Mumbai, IN", weight: "11.3T", vol: "62 CBM", status: "Đang vận chuyển", eta: "16/06/2026", priority: "Cao", carrier: "OOCL", value: "$134,600" },
];

const timeline = [
  { step: "Nhập đơn", icon: Circle, done: true },
  { step: "Phân tích", icon: Circle, done: true },
  { step: "Tối ưu tuyến", icon: Circle, done: true },
  { step: "Vận chuyển", icon: Circle, done: false },
  { step: "Hoàn tất", icon: Circle, done: false },
];

const routeCompare = {
  traditional: { cost: "$4,280", time: "18 ngày", fuel: "2,840L", distance: "21,400 km", risk: "Trung bình" },
  optimized: { cost: "$3,820", time: "16 ngày", fuel: "2,510L", distance: "19,800 km", risk: "Thấp" },
  saving: { cost: "-10.7%", time: "-2 ngày", fuel: "-11.6%", distance: "-7.5%", risk: "Giảm" },
};

const statusColors: Record<string, string> = {
  "Nhập đơn": "bg-[#2E2E35] text-[#A8A8B3]",
  "Phân tích": "bg-[#FFB347]/10 text-[#FFB347]",
  "Tối ưu tuyến": "bg-[#6B7FE3]/10 text-[#6B7FE3]",
  "Đang vận chuyển": "bg-[#4ECDC4]/10 text-[#4ECDC4]",
  "Hoàn tất": "bg-emerald-500/10 text-emerald-400",
};

const priorityColors: Record<string, string> = {
  "Cao": "text-[#E2001A]",
  "Trung bình": "text-[#FFB347]",
  "Thấp": "text-[#A8A8B3]",
};

/* ─── SVG Route Map ─────────────────────────────────────────────────────── */

// City coordinates in the SVG viewport (560 × 310)
const CITIES = {
  chengdu:   { x: 148, y:  98, label: "Thành Đô" },
  shanghai:  { x: 340, y: 112, label: "Thượng Hải" },
  singapore: { x: 320, y: 272, label: "Singapore" },
};

// Land masses as simplified polygon paths (rough outlines for context)
const LAND_PATHS = [
  // Mainland China + Indochina rough silhouette
  "M 60 20 L 200 20 L 260 40 L 300 30 L 380 50 L 420 80 L 400 120 L 370 140 L 360 160 L 320 180 L 290 210 L 270 240 L 250 260 L 230 290 L 210 305 L 190 295 L 170 280 L 155 260 L 140 230 L 120 210 L 100 190 L 80 160 L 60 120 Z",
  // Malay peninsula
  "M 255 235 L 270 240 L 275 260 L 268 278 L 255 285 L 245 275 L 248 260 Z",
  // Sumatra hint
  "M 180 275 L 240 265 L 245 278 L 200 288 L 175 282 Z",
  // Taiwan
  "M 375 130 L 385 138 L 380 150 L 370 145 Z",
  // Japan hint (far right)
  "M 430 60 L 445 68 L 440 82 L 428 76 Z",
  "M 448 50 L 460 55 L 455 68 L 443 62 Z",
  // Korean peninsula
  "M 400 75 L 415 80 L 410 100 L 398 94 Z",
];

function RouteMapSVG() {
  const [progress, setProgress] = useState(0);
  const [showOptimized, setShowOptimized] = useState(false);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate the ship position on the optimized route
  useEffect(() => {
    const timer = setTimeout(() => setShowOptimized(true), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showOptimized) return;
    setProgress(0);
    animRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(animRef.current!); return 100; }
        return p + 0.6;
      });
    }, 30);
    return () => clearInterval(animRef.current!);
  }, [showOptimized]);

  const { chengdu, shanghai, singapore } = CITIES;

  // Traditional route: Chengdu → Shanghai → Singapore (curve via sea)
  const tradPath = `M ${chengdu.x} ${chengdu.y}
    L ${shanghai.x} ${shanghai.y}
    Q ${shanghai.x + 40} ${(shanghai.y + singapore.y) / 2} ${singapore.x} ${singapore.y}`;

  // AI Optimized: Chengdu → Singapore (direct arc, bypass Shanghai)
  const optPath = `M ${chengdu.x} ${chengdu.y}
    Q ${chengdu.x + 60} ${(chengdu.y + singapore.y) / 2 + 20} ${singapore.x} ${singapore.y}`;

  // Compute ship position along optimized bezier at progress%
  const t = progress / 100;
  // Bezier: P = (1-t)²P0 + 2t(1-t)P1 + t²P2
  const cp = { x: chengdu.x + 60, y: (chengdu.y + singapore.y) / 2 + 20 };
  const shipX = (1-t)*(1-t)*chengdu.x + 2*t*(1-t)*cp.x + t*t*singapore.x;
  const shipY = (1-t)*(1-t)*chengdu.y + 2*t*(1-t)*cp.y + t*t*singapore.y;

  return (
    <svg
      viewBox="0 0 560 310"
      width="100%"
      style={{ display: "block", background: "transparent" }}
    >
      <defs>
        {/* Ocean gradient */}
        <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#0D2744" />
          <stop offset="100%" stopColor="#071525" />
        </radialGradient>

        {/* Red glow for AI route */}
        <filter id="redGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        {/* Ship pulse */}
        <filter id="pulse">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        {/* Clipping mask for animated dashes on optimized route */}
        <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2001A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FF6B35" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Ocean background */}
      <rect x="0" y="0" width="560" height="310" fill="url(#oceanGrad)" rx="8" />

      {/* Latitude grid lines */}
      {[80, 140, 200, 260].map(y => (
        <line key={y} x1="0" y1={y} x2="560" y2={y} stroke="rgba(100,160,255,0.06)" strokeWidth="1" />
      ))}
      {[100, 200, 300, 400, 500].map(x => (
        <line key={x} x1={x} y1="0" x2={x} y2="310" stroke="rgba(100,160,255,0.06)" strokeWidth="1" />
      ))}

      {/* Land masses */}
      {LAND_PATHS.map((d, i) => (
        <path key={i} d={d} fill="#0E3050" stroke="#1A4A70" strokeWidth="0.8" opacity="0.9" />
      ))}

      {/* Ocean depth dots pattern */}
      {Array.from({ length: 18 }).map((_, i) => (
        <circle key={i}
          cx={30 + (i % 6) * 90}
          cy={180 + Math.floor(i / 6) * 45}
          r="1"
          fill="rgba(100,180,255,0.08)"
        />
      ))}

      {/* ── Traditional route ── */}
      <path
        d={tradPath}
        fill="none"
        stroke="rgba(160,160,170,0.35)"
        strokeWidth="2"
        strokeDasharray="7 5"
      />
      {/* Arrow along traditional */}
      <circle cx={(chengdu.x + shanghai.x) / 2} cy={(chengdu.y + shanghai.y) / 2 - 3} r="2.5" fill="rgba(160,160,170,0.4)" />
      <circle cx={shanghai.x + 18} cy={(shanghai.y + singapore.y) / 2 - 8} r="2.5" fill="rgba(160,160,170,0.4)" />

      {/* Shanghai waypoint marker */}
      <circle cx={shanghai.x} cy={shanghai.y} r="5" fill="rgba(100,100,110,0.25)" stroke="rgba(160,160,170,0.5)" strokeWidth="1.2" />
      <circle cx={shanghai.x} cy={shanghai.y} r="2" fill="#909098" />

      {/* ── AI Optimized route ── */}
      {showOptimized && (
        <>
          {/* Glow layer */}
          <path
            d={optPath}
            fill="none"
            stroke="#E2001A"
            strokeWidth="5"
            strokeOpacity="0.18"
            filter="url(#redGlow)"
          />
          {/* Main line */}
          <path
            d={optPath}
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            style={{ opacity: 1 }}
          />
          {/* Animated ship dot */}
          {progress < 100 && (
            <>
              <circle cx={shipX} cy={shipY} r="7" fill="#E2001A" fillOpacity="0.2" filter="url(#pulse)" />
              <circle cx={shipX} cy={shipY} r="4" fill="#E2001A" />
              {/* Wake trail */}
              <circle cx={shipX - 4} cy={shipY + 2} r="2.5" fill="#FF6B35" fillOpacity="0.5" />
              <circle cx={shipX - 9} cy={shipY + 4} r="1.5" fill="#FF6B35" fillOpacity="0.25" />
            </>
          )}
          {/* Arrival pulse at Singapore */}
          {progress === 100 && (
            <>
              <circle cx={singapore.x} cy={singapore.y} r="12" fill="none" stroke="#E2001A" strokeWidth="1.5" strokeOpacity="0.4" />
              <circle cx={singapore.x} cy={singapore.y} r="7" fill="#E2001A" fillOpacity="0.25" />
            </>
          )}
        </>
      )}

      {/* ── City markers ── */}
      {/* Chengdu */}
      <circle cx={chengdu.x} cy={chengdu.y} r="6" fill="#E2001A" fillOpacity="0.2" stroke="#E2001A" strokeWidth="1.5" />
      <circle cx={chengdu.x} cy={chengdu.y} r="3" fill="#E2001A" />
      <rect x={chengdu.x + 8} y={chengdu.y - 12} width={62} height={16} rx="3" fill="rgba(10,10,15,0.75)" />
      <text x={chengdu.x + 39} y={chengdu.y - 1} textAnchor="middle" fill="#F2F2F3" fontSize="9.5" fontFamily="Inter, sans-serif" fontWeight="500">{chengdu.label}</text>

      {/* Shanghai */}
      <circle cx={shanghai.x} cy={shanghai.y} r="6" fill="#6B6B78" fillOpacity="0.2" stroke="#909098" strokeWidth="1.2" />
      <circle cx={shanghai.x} cy={shanghai.y} r="2.5" fill="#909098" />
      <rect x={shanghai.x + 9} y={shanghai.y - 12} width={72} height={16} rx="3" fill="rgba(10,10,15,0.75)" />
      <text x={shanghai.x + 45} y={shanghai.y - 1} textAnchor="middle" fill="#A8A8B3" fontSize="9.5" fontFamily="Inter, sans-serif">{shanghai.label}</text>

      {/* Singapore */}
      <circle cx={singapore.x} cy={singapore.y} r="6" fill="#E2001A" fillOpacity="0.2" stroke="#E2001A" strokeWidth="1.5" />
      <circle cx={singapore.x} cy={singapore.y} r="3" fill="#E2001A" />
      <rect x={singapore.x + 9} y={singapore.y - 12} width={58} height={16} rx="3" fill="rgba(10,10,15,0.75)" />
      <text x={singapore.x + 38} y={singapore.y - 1} textAnchor="middle" fill="#F2F2F3" fontSize="9.5" fontFamily="Inter, sans-serif" fontWeight="500">{singapore.label}</text>

      {/* ── Legend ── */}
      <rect x="12" y="270" width="150" height="34" rx="5" fill="rgba(10,10,15,0.82)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8" />
      {/* Traditional legend */}
      <line x1="22" y1="281" x2="46" y2="281" stroke="rgba(160,160,170,0.55)" strokeWidth="1.8" strokeDasharray="5 3" />
      <text x="50" y="284.5" fill="#FFB347" fontSize="9" fontFamily="Inter, sans-serif" fontWeight="600">Truyền thống</text>
      {/* Optimized legend */}
      <line x1="22" y1="296" x2="46" y2="296" stroke="#E2001A" strokeWidth="2" />
      <text x="50" y="299.5" fill="#4ECDC4" fontSize="9" fontFamily="Inter, sans-serif" fontWeight="600">AI Tối ưu</text>

      {/* ── Saving badge ── */}
      <rect x="450" y="14" width="96" height="36" rx="5" fill="rgba(226,0,26,0.12)" stroke="rgba(226,0,26,0.3)" strokeWidth="0.8" />
      <text x="498" y="28" textAnchor="middle" fill="#E2001A" fontSize="8.5" fontFamily="Inter, sans-serif" fontWeight="600">TIẾT KIỆM AI</text>
      <text x="498" y="43" textAnchor="middle" fill="#FF6B35" fontSize="11" fontFamily="'JetBrains Mono', monospace" fontWeight="700">-10.7%</text>
    </svg>
  );
}

export function OrderManagement() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(orders[1]);
  const [showRoute, setShowRoute] = useState(false);

  const filtered = orders.filter(o =>
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.customer.toLowerCase().includes(search.toLowerCase()) ||
    o.dest.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground mt-0.5">Theo dõi và tối ưu tuyến đường vận chuyển</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#E2001A] text-white rounded hover:bg-[#C0001A] transition-colors">
          <Plus size={14} />
          <span className="text-sm">Nhập đơn mới</span>
        </button>
      </div>

      {/* Timeline */}
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-muted-foreground text-xs mb-3">Vòng đời đơn hàng</p>
        <div className="flex items-center gap-0">
          {timeline.map((t, i) => (
            <div key={t.step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 ${t.done ? "bg-[#E2001A] border-[#E2001A]" : "border-border bg-muted"}`}>
                  {t.done ? <CheckCircle2 size={13} className="text-white" /> : <Circle size={13} className="text-muted-foreground" />}
                </div>
                <p className={`text-xs mt-1 whitespace-nowrap ${t.done ? "text-foreground" : "text-muted-foreground"}`}>{t.step}</p>
              </div>
              {i < timeline.length - 1 && (
                <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < 3 ? "bg-[#E2001A]" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Order list */}
        <div className="lg:col-span-3 bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border flex gap-3">
            <div className="flex-1 flex items-center gap-2 bg-[#1A1A1D] rounded px-3 py-2">
              <Search size={13} className="text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm đơn hàng, khách hàng, điểm đến..."
                className="bg-transparent text-foreground placeholder-muted-foreground outline-none flex-1 text-xs"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-border rounded text-muted-foreground hover:text-foreground text-xs transition-colors">
              <Filter size={12} />
              Lọc
            </button>
          </div>
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Mã đơn", "Điểm đến", "Trạng thái", "Ưu tiên", "ETA"].map(h => (
                    <th key={h} className="text-left text-muted-foreground px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr
                    key={o.id}
                    onClick={() => setSelected(o)}
                    className={`border-b border-border/50 cursor-pointer transition-colors hover:bg-[#1A1A1D] ${selected.id === o.id ? "bg-[#1A1A1D] border-l-2 border-l-[#E2001A]" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{o.id}</p>
                      <p className="text-muted-foreground mt-0.5">{o.carrier}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin size={10} />
                        <span>{o.dest}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${statusColors[o.status] || ""}`}>{o.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${priorityColors[o.priority]}`}>{o.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{o.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-foreground">{selected.id}</h3>
              <span className={`px-2 py-0.5 rounded text-xs ${statusColors[selected.status] || ""}`}>{selected.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: "Khách hàng", value: selected.customer },
                { label: "Giá trị", value: selected.value },
                { label: "Xuất phát", value: selected.origin },
                { label: "Điểm đến", value: selected.dest },
                { label: "Trọng lượng", value: selected.weight },
                { label: "Thể tích", value: selected.vol },
                { label: "Hãng vận tải", value: selected.carrier },
                { label: "ETA", value: selected.eta },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-muted-foreground">{label}</p>
                  <p className="text-foreground mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowRoute(!showRoute)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E2001A]/10 border border-[#E2001A]/30 text-[#E2001A] rounded hover:bg-[#E2001A]/20 transition-colors text-xs"
            >
              <Zap size={12} />
              {showRoute ? "Ẩn so sánh tuyến đường" : "AI Tối ưu tuyến đường"}
            </button>
          </div>

          {showRoute && (
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              <h3 className="text-foreground">So sánh tuyến đường</h3>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="col-span-1" />
                <div className="text-center text-muted-foreground">Truyền thống</div>
                <div className="text-center text-[#E2001A]">AI Tối ưu</div>
                {[
                  { label: "Chi phí", trad: routeCompare.traditional.cost, opt: routeCompare.optimized.cost, saving: routeCompare.saving.cost },
                  { label: "Thời gian", trad: routeCompare.traditional.time, opt: routeCompare.optimized.time, saving: routeCompare.saving.time },
                  { label: "Nhiên liệu", trad: routeCompare.traditional.fuel, opt: routeCompare.optimized.fuel, saving: routeCompare.saving.fuel },
                  { label: "Cự ly", trad: routeCompare.traditional.distance, opt: routeCompare.optimized.distance, saving: routeCompare.saving.distance },
                ].map(row => (
                  <React.Fragment key={row.label}>
                    <div className="text-muted-foreground py-1.5 border-t border-border">{row.label}</div>
                    <div className="text-center text-foreground py-1.5 border-t border-border" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.trad}</div>
                    <div className="text-center py-1.5 border-t border-border">
                      <span className="text-[#4ECDC4]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.opt}</span>
                      <span className="text-emerald-400 ml-1 text-xs">({row.saving})</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#E2001A] text-white rounded hover:bg-[#C0001A] transition-colors text-xs">
                Áp dụng tuyến đường tối ưu
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Route Map Section ── */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Navigation size={14} className="text-[#E2001A]" />
            <h3 className="text-foreground">So sánh tuyến đường Truyền thống và đã tối ưu</h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6 h-0 border-t-2 border-dashed" style={{ borderColor: "rgba(160,160,170,0.55)" }} />
              <span className="text-[#FFB347] font-medium">Truyền thống</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-6 h-0 border-t-2" style={{ borderColor: "#E2001A" }} />
              <span className="text-[#4ECDC4] font-medium">AI Tối ưu</span>
            </span>
          </div>
        </div>

        {/* Map + info grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Map (takes 2/3 width) */}
          <div className="lg:col-span-2 p-1" style={{ background: "#071525" }}>
            <RouteMapSVG />
          </div>

          {/* Order info panel */}
          <div className="border-t lg:border-t-0 lg:border-l border-border p-5 space-y-5 flex flex-col justify-between">
            {/* Order card */}
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Mã đơn hàng</p>
                <p className="text-foreground text-sm" style={{ fontFamily: "'JetBrains Mono', monospace" }}>ORD-2024-08841</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Khách hàng</p>
                <p className="text-foreground text-xs">Lenovo APAC Distribution</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Xuất phát</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#E2001A]" />
                    <p className="text-foreground">Thành Đô, CN</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Điểm đến</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#E2001A]" />
                    <p className="text-foreground">Singapore</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Hãng vận tải</p>
                  <p className="text-foreground mt-0.5">COSCO Shipping</p>
                </div>
                <div>
                  <p className="text-muted-foreground">ETA</p>
                  <p className="text-foreground mt-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>14/06/2026</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Trọng lượng</p>
                  <p className="text-foreground mt-0.5">24.8T</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Giá trị</p>
                  <p className="text-foreground mt-0.5">$284,500</p>
                </div>
              </div>

              {/* Route comparison mini-table */}
              <div className="border-t border-border pt-4 space-y-2">
                <p className="text-muted-foreground text-xs mb-2">So sánh chi tiết</p>
                {[
                  { label: "Cự ly", trad: "21,400 km", opt: "19,800 km", delta: "-7.5%" },
                  { label: "Thời gian", trad: "18 ngày", opt: "16 ngày", delta: "-2 ngày" },
                  { label: "Chi phí", trad: "$4,280", opt: "$3,820", delta: "-10.7%" },
                  { label: "Nhiên liệu", trad: "2,840 L", opt: "2,510 L", delta: "-11.6%" },
                ].map(r => (
                  <div key={r.label} className="grid grid-cols-4 gap-1 text-xs items-center">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="text-[#909098] text-center" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>{r.trad}</span>
                    <span className="text-[#4ECDC4] text-center" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>{r.opt}</span>
                    <span className="text-emerald-400 text-right" style={{ fontSize: 10 }}>{r.delta}</span>
                  </div>
                ))}
                <div className="grid grid-cols-4 gap-1 text-xs mt-0.5">
                  <span />
                  <span className="text-center text-[#FFB347]" style={{ fontSize: 9 }}>Truyền thống</span>
                  <span className="text-center text-[#4ECDC4]" style={{ fontSize: 9 }}>AI Tối ưu</span>
                  <span />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E2001A] text-white rounded hover:bg-[#C0001A] transition-colors text-xs">
                <Zap size={12} />
                Áp dụng tuyến AI Tối ưu
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border text-muted-foreground rounded hover:text-foreground transition-colors text-xs">
                <MapPin size={12} />
                Theo dõi thời gian thực
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
