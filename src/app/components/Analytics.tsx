import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { TrendingUp, TrendingDown, Download, Calendar, Filter } from "lucide-react";

const monthlyData = [
  { month: "T1", orders: 3820, cost: 3.84, onTime: 92.1, damage: 2.8 },
  { month: "T2", orders: 3940, cost: 3.91, onTime: 93.4, damage: 2.5 },
  { month: "T3", orders: 4120, cost: 4.08, onTime: 91.8, damage: 2.9 },
  { month: "T4", orders: 3750, cost: 3.72, onTime: 94.2, damage: 2.1 },
  { month: "T5", orders: 4280, cost: 3.58, onTime: 95.1, damage: 1.9 },
  { month: "T6", orders: 4510, cost: 3.41, onTime: 95.7, damage: 1.7 },
  { month: "T7", orders: 4390, cost: 3.35, onTime: 94.9, damage: 1.8 },
  { month: "T8", orders: 4680, cost: 3.24, onTime: 96.1, damage: 1.6 },
  { month: "T9", orders: 4290, cost: 3.18, onTime: 95.2, damage: 1.5 },
  { month: "T10", orders: 4820, cost: 3.12, onTime: 95.8, damage: 1.4 },
  { month: "T11", orders: 4560, cost: 3.08, onTime: 94.5, damage: 1.3 },
  { month: "T12", orders: 4940, cost: 3.01, onTime: 95.2, damage: 1.2 },
];

const forecastData = [
  { month: "T1 2027", orders: 5200, lower: 4900, upper: 5500 },
  { month: "T2 2027", orders: 5380, lower: 5050, upper: 5710 },
  { month: "T3 2027", orders: 5540, lower: 5180, upper: 5900 },
  { month: "T4 2027", orders: 5290, lower: 4920, upper: 5660 },
  { month: "T5 2027", orders: 5610, lower: 5220, upper: 6000 },
  { month: "T6 2027", orders: 5820, lower: 5380, upper: 6260 },
];

const regionData = [
  { region: "APAC", q1: 4280, q2: 4820, q3: 5100, q4: 5480 },
  { region: "Bắc Mỹ", q1: 3120, q2: 3580, q3: 3840, q4: 4100 },
  { region: "Châu Âu", q1: 2440, q2: 2680, q3: 2920, q4: 3180 },
  { region: "MEA", q1: 980, q2: 1140, q3: 1280, q4: 1420 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1A1A1D] border border-white/10 rounded p-3 text-xs">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color || p.fill }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

const kpis = [
  { label: "Tổng đơn hàng 2026", value: "51,100", sub: "vs 2025: +13.8%", up: true, color: "#E2001A" },
  { label: "Tỷ lệ giao hàng đúng hạn TB", value: "94.7%", sub: "+2.6pp vs 2025", up: true, color: "#4ECDC4" },
  { label: "Chi phí vận tải giảm", value: "15.4%", sub: "Tiết kiệm $8.2M", up: true, color: "#FFB347" },
  { label: "Tỷ lệ hư hỏng hàng hóa", value: "1.8%", sub: "−30% vs 2025: 2.6%", up: false, color: "#6B7FE3" },
  { label: "Thời gian xử lý đơn", value: "−25%", sub: "Tự động hóa AI", up: true, color: "#E2001A" },
  { label: "Độ chính xác dự báo AI", value: "96.8%", sub: "Big Data analytics", up: true, color: "#4ECDC4" },
];

export function Analytics() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Báo cáo & Phân tích</h1>
          <p className="text-muted-foreground mt-0.5">Big Data · AI dự báo · Thống kê toàn cầu 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-border rounded text-muted-foreground hover:text-foreground text-xs transition-colors">
            <Calendar size={12} />
            2026
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-border rounded text-muted-foreground hover:text-foreground text-xs transition-colors">
            <Download size={12} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground text-xs">{k.label}</p>
              {k.up
                ? <TrendingUp size={12} className="text-emerald-400" />
                : <TrendingDown size={12} className="text-[#4ECDC4]" />}
            </div>
            <p style={{ color: k.color, fontFamily: "'JetBrains Mono', monospace" }} className="text-xl">{k.value}</p>
            <p className="text-muted-foreground text-xs mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">Tổng đơn hàng & Chi phí</h3>
            <span className="text-muted-foreground text-xs">theo tháng 2026</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E2001A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E2001A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B7FE3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6B7FE3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#6B6B78", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: "#6B6B78", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#6B6B78", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area key="area-orders-main" yAxisId="left" type="monotone" dataKey="orders" stroke="#E2001A" strokeWidth={2} fill="url(#gradOrders)" name="Đơn hàng" />
              <Area key="area-cost-main" yAxisId="right" type="monotone" dataKey="cost" stroke="#6B7FE3" strokeWidth={1.5} fill="url(#gradCost)" name="Chi phí ($M)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">Tỷ lệ giao hàng đúng hạn & Hư hỏng</h3>
            <span className="text-muted-foreground text-xs">2026</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#6B6B78", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B6B78", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line key="line-ontime" type="monotone" dataKey="onTime" stroke="#4ECDC4" strokeWidth={2} dot={false} name="Đúng hạn %" />
              <Line key="line-damage" type="monotone" dataKey="damage" stroke="#E2001A" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Hư hỏng %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">Phân tích theo khu vực</h3>
            <span className="text-muted-foreground text-xs">Số lượng đơn theo Quý</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="region" tick={{ fill: "#6B6B78", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B6B78", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar key="bar-q1" dataKey="q1" fill="#E2001A" name="Q1" radius={[2, 2, 0, 0]} opacity={0.6} />
              <Bar key="bar-q2" dataKey="q2" fill="#E2001A" name="Q2" radius={[2, 2, 0, 0]} opacity={0.75} />
              <Bar key="bar-q3" dataKey="q3" fill="#E2001A" name="Q3" radius={[2, 2, 0, 0]} opacity={0.9} />
              <Bar key="bar-q4" dataKey="q4" fill="#E2001A" name="Q4" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">AI Dự báo Q1–Q2 2027</h3>
            <span className="text-muted-foreground text-xs">Big Data · Accuracy 96.8%</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B7FE3" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6B7FE3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#6B6B78", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#6B6B78", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area key="area-upper" type="monotone" dataKey="upper" stroke="none" fill="#6B7FE3" fillOpacity={0.08} name="Khoảng tin cậy trên" />
              <Area key="area-lower" type="monotone" dataKey="lower" stroke="none" fill="#0A0A0B" fillOpacity={1} name="Khoảng tin cậy dưới" />
              <Area key="area-orders" type="monotone" dataKey="orders" stroke="#6B7FE3" strokeWidth={2} fill="url(#gradForecast)" name="Dự báo đơn hàng" strokeDasharray="6 3" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-muted-foreground text-xs mt-2">* Dự báo dựa trên mô hình LSTM + XGBoost với 48 tháng dữ liệu lịch sử</p>
        </div>
      </div>
    </div>
  );
}
