import { useState } from "react";
import { Thermometer, Droplets, Wifi, AlertCircle, CheckCircle2, Package, BarChart3, MapPin, RefreshCw } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const warehouses = [
  { id: "WH-BJ01", name: "Lenovo Park Beijing", location: "Bắc Kinh, CN", sku: 14280, capacity: 78, temp: 22.4, humidity: 45, status: "Bình thường", lastSync: "30s trước" },
  { id: "WH-SH02", name: "Shanghai Gateway", location: "Thượng Hải, CN", sku: 9420, capacity: 91, temp: 24.1, humidity: 52, status: "Cảnh báo", lastSync: "45s trước" },
  { id: "WH-LA03", name: "Los Angeles Hub", location: "California, US", sku: 7830, capacity: 65, temp: 21.8, humidity: 38, status: "Bình thường", lastSync: "1 phút trước" },
  { id: "WH-RT04", name: "Rotterdam Center", location: "Rotterdam, NL", sku: 6290, capacity: 72, temp: 20.5, humidity: 49, status: "Bình thường", lastSync: "2 phút trước" },
  { id: "WH-SG05", name: "Singapore APAC", location: "Singapore", sku: 5680, capacity: 83, temp: 25.2, humidity: 61, status: "Cảnh báo", lastSync: "55s trước" },
];

const containers = [
  { id: "TCKU-8841", type: "40ft HC", cargo: "ThinkPad X1", temp: 23.8, humidity: 47, gps: "21.2°N, 114.1°E", status: "Bình thường" },
  { id: "MSCU-4492", type: "20ft", cargo: "ThinkCentre M", temp: 28.3, humidity: 55, gps: "1.3°N, 103.8°E", status: "Cảnh báo nhiệt độ" },
  { id: "EVGU-7701", type: "40ft", cargo: "Legion Gaming", temp: 22.1, humidity: 43, gps: "51.9°N, 4.5°E", status: "Bình thường" },
  { id: "OOLU-3318", type: "40ft HC", cargo: "ThinkStation P", temp: 21.9, humidity: 41, gps: "33.7°N, 118.2°W", status: "Bình thường" },
];

const partners = [
  { name: "COSCO Shipping", type: "Hàng hải", orders: 284, onTime: 96.2, cost: 4.2, accuracy: 98.1, color: "#E2001A" },
  { name: "Evergreen Marine", type: "Hàng hải", orders: 196, onTime: 94.8, cost: 3.9, accuracy: 97.4, color: "#FF6B35" },
  { name: "DHL Logistics", type: "Hàng không", orders: 142, onTime: 97.5, cost: 8.1, accuracy: 99.2, color: "#FFB347" },
  { name: "FedEx Supply", type: "Tổng hợp", orders: 98, onTime: 95.1, cost: 7.4, accuracy: 98.7, color: "#6B7FE3" },
  { name: "Nippon Yusen", type: "Hàng hải", orders: 87, onTime: 93.6, cost: 4.5, accuracy: 96.8, color: "#4ECDC4" },
];

const radarData = partners.map(p => ({
  partner: p.name.split(" ")[0],
  "Đúng hạn": p.onTime,
  "Độ chính xác": p.accuracy,
  "Hiệu quả chi phí": 100 - p.cost * 5,
}));

const inventoryData = [
  { category: "ThinkPad", qty: 8420, reserve: 1200 },
  { category: "ThinkCentre", qty: 5280, reserve: 800 },
  { category: "Legion", qty: 3950, reserve: 600 },
  { category: "IdeaPad", qty: 4710, reserve: 900 },
  { category: "ThinkStation", qty: 2100, reserve: 400 },
  { category: "Accessories", qty: 12840, reserve: 2000 },
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

export function Warehouse() {
  const [selectedWH, setSelectedWH] = useState(warehouses[0]);
  const [activeTab, setActiveTab] = useState<"warehouses" | "containers" | "partners">("warehouses");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Quản lý kho & Đối tác vận tải</h1>
          <p className="text-muted-foreground mt-0.5">Giám sát IoT thời gian thực — Tỷ lệ hư hỏng giảm 30%</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-border rounded text-muted-foreground hover:text-foreground text-xs transition-colors">
          <RefreshCw size={12} />
          Đồng bộ Cloud
        </button>
      </div>

      {/* Summary IoT cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng kho hoạt động", value: "5", icon: Package, color: "#E2001A" },
          { label: "Container giám sát", value: "48", icon: Wifi, color: "#6B7FE3" },
          { label: "Cảnh báo IoT", value: "3", icon: AlertCircle, color: "#FFB347" },
          { label: "Đồng bộ thành công", value: "99.8%", icon: CheckCircle2, color: "#4ECDC4" },
        ].map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded" style={{ background: `${c.color}15` }}>
                  <Icon size={16} style={{ color: c.color }} />
                </div>
                <div>
                  <p className="text-xl text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{c.value}</p>
                  <p className="text-muted-foreground text-xs">{c.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-0">
        {(["warehouses", "containers", "partners"] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-xs transition-colors border-b-2 -mb-px ${
              activeTab === t
                ? "border-[#E2001A] text-[#E2001A]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "warehouses" ? "Kho hàng" : t === "containers" ? "Container IoT" : "Đối tác vận tải"}
          </button>
        ))}
      </div>

      {activeTab === "warehouses" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 space-y-2">
            {warehouses.map(wh => (
              <div
                key={wh.id}
                onClick={() => setSelectedWH(wh)}
                className={`bg-card border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedWH.id === wh.id
                    ? "border-[#E2001A]/40 shadow-[0_0_0_1px_rgba(226,0,26,0.2)]"
                    : "border-border hover:border-border/80"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-foreground text-sm">{wh.name}</p>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-muted-foreground text-xs">{wh.id}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                      <MapPin size={10} />
                      {wh.location}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${wh.status === "Bình thường" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                    {wh.status}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3 mt-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Công suất</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 h-1 bg-[#1E1E22] rounded">
                        <div className="h-full rounded bg-[#E2001A]" style={{ width: `${wh.capacity}%` }} />
                      </div>
                      <span className="text-foreground">{wh.capacity}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nhiệt độ</p>
                    <p className="text-foreground mt-1">{wh.temp}°C</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Độ ẩm</p>
                    <p className="text-foreground mt-1">{wh.humidity}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Đồng bộ</p>
                    <p className="text-foreground mt-1">{wh.lastSync}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-foreground mb-3">Tồn kho theo SKU — {selectedWH.name}</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="category" tick={{ fill: "#6B6B78", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6B6B78", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar key="bar-qty" dataKey="qty" fill="#E2001A" name="Tồn kho" radius={[2, 2, 0, 0]} />
                  <Bar key="bar-reserve" dataKey="reserve" fill="#2E2E35" name="Dự trữ" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-foreground mb-2">SKU & Thông số kho</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><p className="text-muted-foreground">Tổng SKU</p><p className="text-foreground mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{selectedWH.sku.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Công suất lấp đầy</p><p className="text-foreground mt-1">{selectedWH.capacity}%</p></div>
                <div><p className="text-muted-foreground">Nhiệt độ kho</p><p className="text-foreground mt-1">{selectedWH.temp}°C</p></div>
                <div><p className="text-muted-foreground">Độ ẩm</p><p className="text-foreground mt-1">{selectedWH.humidity}%</p></div>
                <div><p className="text-muted-foreground">Trạng thái IoT</p><p className="text-emerald-400 mt-1">● Kết nối</p></div>
                <div><p className="text-muted-foreground">Đồng bộ gần nhất</p><p className="text-foreground mt-1">{selectedWH.lastSync}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "containers" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {containers.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{c.id}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{c.type} — {c.cargo}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${c.status === "Bình thường" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                  {c.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2 bg-[#1A1A1D] rounded p-2">
                  <Thermometer size={12} className={c.temp > 26 ? "text-[#E2001A]" : "text-[#4ECDC4]"} />
                  <div>
                    <p className="text-muted-foreground">Nhiệt độ</p>
                    <p className={c.temp > 26 ? "text-[#E2001A]" : "text-foreground"}>{c.temp}°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#1A1A1D] rounded p-2">
                  <Droplets size={12} className="text-[#6B7FE3]" />
                  <div>
                    <p className="text-muted-foreground">Độ ẩm</p>
                    <p className="text-foreground">{c.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#1A1A1D] rounded p-2">
                  <Wifi size={12} className="text-[#4ECDC4]" />
                  <div>
                    <p className="text-muted-foreground">GPS</p>
                    <p className="text-foreground text-xs">{c.gps.split(",")[0]}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "partners" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-foreground">Hiệu suất đối tác vận tải</h3>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Đối tác", "Loại hình", "Đơn hàng", "Đúng hạn", "Chi phí/CBM", "Độ chính xác"].map(h => (
                    <th key={h} className="text-left text-muted-foreground px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partners.map(p => (
                  <tr key={p.name} className="border-b border-border/50 hover:bg-[#1A1A1D] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                        <span className="text-foreground">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.type}</td>
                    <td className="px-4 py-3 text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.orders}</td>
                    <td className="px-4 py-3">
                      <span className={p.onTime >= 96 ? "text-emerald-400" : "text-[#FFB347]"}>{p.onTime}%</span>
                    </td>
                    <td className="px-4 py-3 text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>${p.cost}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-[#1E1E22] rounded">
                          <div className="h-full rounded bg-[#E2001A]" style={{ width: `${p.accuracy}%` }} />
                        </div>
                        <span className="text-foreground">{p.accuracy}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-foreground mb-4">Đánh giá đa chiều</h3>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="partner" tick={{ fill: "#6B6B78", fontSize: 10 }} />
                <Radar key="radar-ontime" name="Đúng hạn" dataKey="Đúng hạn" stroke="#E2001A" fill="#E2001A" fillOpacity={0.15} />
                <Radar key="radar-accuracy" name="Độ chính xác" dataKey="Độ chính xác" stroke="#6B7FE3" fill="#6B7FE3" fillOpacity={0.1} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
