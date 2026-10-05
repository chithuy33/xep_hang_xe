import { useState } from "react";
import {
  ComposedChart, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  Package, TrendingUp, TrendingDown, Clock, Truck, Globe,
  AlertCircle, CheckCircle2, Activity, DollarSign, MapPin, Zap
} from "lucide-react";

const kpiData = [
  { label: "Đơn hàng toàn cầu", value: "48,291", change: "+8.3%", up: true, icon: Globe, color: "#E2001A" },
  { label: "Giao hàng đúng hạn", value: "95.2%", change: "+1.1%", up: true, icon: CheckCircle2, color: "#4ECDC4" },
  { label: "Chi phí vận tải", value: "$3.24M", change: "-15.2%", up: false, icon: DollarSign, color: "#FFB347" },
  { label: "Lead Time TB", value: "4.2 ngày", change: "-0.6 ngày", up: false, icon: Clock, color: "#6B7FE3" },
];

const deliveryTrend = [
  { month: "T1", actual: 92.1, target: 95 },
  { month: "T2", actual: 93.4, target: 95 },
  { month: "T3", actual: 91.8, target: 95 },
  { month: "T4", actual: 94.2, target: 95 },
  { month: "T5", actual: 95.1, target: 95 },
  { month: "T6", actual: 95.7, target: 95 },
  { month: "T7", actual: 94.9, target: 95 },
  { month: "T8", actual: 96.1, target: 95 },
  { month: "T9", actual: 95.2, target: 95 },
  { month: "T10", actual: 95.8, target: 95 },
  { month: "T11", actual: 94.5, target: 95 },
  { month: "T12", actual: 95.2, target: 95 },
];

const costData = [
  { month: "T1", cost: 3.8, optimized: 3.4 },
  { month: "T2", cost: 3.9, optimized: 3.3 },
  { month: "T3", cost: 4.1, optimized: 3.5 },
  { month: "T4", cost: 3.7, optimized: 3.2 },
  { month: "T5", cost: 3.6, optimized: 3.1 },
  { month: "T6", cost: 3.4, optimized: 2.9 },
];

const ordersByRegion = [
  { name: "Châu Á-TBD", value: 38, color: "#E2001A" },
  { name: "Bắc Mỹ", value: 28, color: "#FF6B35" },
  { name: "Châu Âu", value: 22, color: "#FFB347" },
  { name: "Khác", value: 12, color: "#6B7FE3" },
];

const recentAlerts = [
  { id: 1, type: "warning", msg: "Chuyến hàng SH-4821 bị trễ 2h tại cảng Shanghai", time: "5 phút trước" },
  { id: 2, type: "success", msg: "Lô hàng LA-7203 đã đến kho Los Angeles đúng hạn", time: "12 phút trước" },
  { id: 3, type: "info", msg: "AI đề xuất tuyến đường thay thế cho HK-5519", time: "28 phút trước" },
  { id: 4, type: "warning", msg: "Container TCKU-8841 nhiệt độ vượt ngưỡng 2°C", time: "41 phút trước" },
  { id: 5, type: "success", msg: "Tối ưu tải container tiết kiệm $12,400 lô hàng FX-9012", time: "1 giờ trước" },
];

const liveShipments = [
  { id: "SH-4821", origin: "Shanghai", dest: "Rotterdam", status: "Trễ", pct: 68 },
  { id: "LA-7203", origin: "Shenzhen", dest: "Los Angeles", status: "Đúng hạn", pct: 100 },
  { id: "HK-5519", origin: "Hong Kong", dest: "Frankfurt", status: "Đang vận chuyển", pct: 45 },
  { id: "FX-9012", origin: "Lenovo Park BJ", dest: "Tokyo", status: "Đang vận chuyển", pct: 82 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A1D] border border-white/10 rounded p-3 text-xs">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"delivery" | "cost">("delivery");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Tổng quan hệ thống</h1>
          <p className="text-muted-foreground mt-0.5">Dữ liệu thời gian thực — Cập nhật lúc 14:32 ICT</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#E2001A]/10 border border-[#E2001A]/20">
          <div className="w-1.5 h-1.5 rounded-full bg-[#E2001A] animate-pulse" />
          <span className="text-[#E2001A] text-xs font-medium">LIVE</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-card border border-border rounded-lg p-4 group hover:border-[#E2001A]/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded" style={{ background: `${kpi.color}15` }}>
                  <Icon size={16} style={{ color: kpi.color }} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? "text-emerald-400" : "text-[#4ECDC4]"}`}>
                  {kpi.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {kpi.change}
                </div>
              </div>
              <p className="text-2xl text-foreground mb-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{kpi.value}</p>
              <p className="text-muted-foreground text-xs">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">Hiệu suất vận chuyển</h3>
            <div className="flex gap-1">
              {(["delivery", "cost"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    activeTab === t
                      ? "bg-[#E2001A] text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "delivery" ? "Đúng hạn" : "Chi phí"}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            {activeTab === "delivery" ? (
              <ComposedChart key="chart-delivery" data={deliveryTrend}>
                <defs>
                  <linearGradient id="gradDelivery" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E2001A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E2001A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#6B6B78", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[88, 98]} tick={{ fill: "#6B6B78", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="actual" stroke="#E2001A" strokeWidth={2} fill="url(#gradDelivery)" name="Thực tế %" />
                <Line type="monotone" dataKey="target" stroke="#6B7FE3" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Mục tiêu %" />
              </ComposedChart>
            ) : (
              <BarChart key="chart-cost" data={costData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#6B6B78", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6B6B78", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar key="bar-cost" dataKey="cost" fill="#3A3A40" name="Truyền thống ($M)" radius={[2, 2, 0, 0]} />
                <Bar key="bar-optimized" dataKey="optimized" fill="#E2001A" name="Tối ưu AI ($M)" radius={[2, 2, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-foreground mb-4">Phân bổ đơn hàng</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={ordersByRegion} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                {ordersByRegion.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {ordersByRegion.map((r) => (
              <div key={r.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                  <span className="text-muted-foreground">{r.name}</span>
                </div>
                <span className="text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live shipments + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Live shipments */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={14} className="text-[#E2001A]" />
            <h3 className="text-foreground">Vận chuyển đang hoạt động</h3>
          </div>
          <div className="space-y-3">
            {liveShipments.map((s) => (
              <div key={s.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.id}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    s.status === "Trễ"
                      ? "bg-[#E2001A]/15 text-[#E2001A]"
                      : s.status === "Đúng hạn"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-[#6B7FE3]/15 text-[#6B7FE3]"
                  }`}>{s.status}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin size={10} />
                  <span>{s.origin}</span>
                  <span className="text-border">→</span>
                  <span>{s.dest}</span>
                </div>
                <div className="h-1 bg-[#1E1E22] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${s.pct}%`,
                      background: s.status === "Trễ" ? "#E2001A" : s.status === "Đúng hạn" ? "#4ECDC4" : "#6B7FE3",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-[#E2001A]" />
            <h3 className="text-foreground">Cảnh báo & Thông báo</h3>
          </div>
          <div className="space-y-2">
            {recentAlerts.map((a) => (
              <div key={a.id} className="flex gap-3 p-2.5 rounded bg-[#1A1A1D] hover:bg-[#1E1E22] transition-colors">
                <div className="mt-0.5 shrink-0">
                  {a.type === "warning" && <AlertCircle size={13} className="text-amber-400" />}
                  {a.type === "success" && <CheckCircle2 size={13} className="text-emerald-400" />}
                  {a.type === "info" && <Zap size={13} className="text-[#6B7FE3]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-xs leading-relaxed">{a.msg}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
