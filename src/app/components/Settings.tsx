import { useState } from "react";
import { Shield, Users, Cpu, Cloud, Database, Globe, Lock, Key, Bell, Check, Eye, EyeOff } from "lucide-react";

const users = [
  { name: "Nguyễn Thị Ngọc Ngân", email: "ngan.nguyen@lenovo.com", role: "Super Admin", region: "APAC", status: "Hoạt động", lastLogin: "11/06/2026 13:45" },
  { name: "Sarah Johnson", email: "s.johnson@lenovo.com", role: "Regional Manager", region: "Bắc Mỹ", status: "Hoạt động", lastLogin: "11/06/2026 08:20" },
  { name: "Marco Bianchi", email: "m.bianchi@lenovo.com", role: "Analyst", region: "Châu Âu", status: "Hoạt động", lastLogin: "10/06/2026 17:30" },
  { name: "Li Wei", email: "li.wei@lenovo.com", role: "Warehouse Manager", region: "APAC", status: "Không hoạt động", lastLogin: "08/06/2026 09:15" },
  { name: "Aisha Rahman", email: "a.rahman@lenovo.com", role: "Analyst", region: "MEA", status: "Hoạt động", lastLogin: "11/06/2026 11:00" },
];

const configs = [
  { category: "AI Engine", icon: Cpu, items: [
    { label: "Mô hình tối ưu tuyến đường", value: "LenovoRoute-v3.2", active: true },
    { label: "AI dự báo nhu cầu", value: "LSTM + XGBoost Ensemble", active: true },
    { label: "3D Loading AI", value: "BinPack-Neural-v2.1", active: true },
    { label: "Phát hiện rủi ro", value: "AnomalyDetect-RF", active: false },
  ]},
  { category: "Cloud & Tích hợp", icon: Cloud, items: [
    { label: "Cloud Provider", value: "AWS + Alibaba Cloud (Hybrid)", active: true },
    { label: "Đồng bộ WMS", value: "SAP WM / Manhattan", active: true },
    { label: "API Gateway", value: "Kong Enterprise v3.4", active: true },
    { label: "Message Queue", value: "Apache Kafka 3.6", active: true },
  ]},
  { category: "IoT & Big Data", icon: Database, items: [
    { label: "IoT Protocol", value: "MQTT v5 / AMQP", active: true },
    { label: "Data Lake", value: "AWS S3 + Delta Lake", active: true },
    { label: "Stream Processing", value: "Apache Flink 1.18", active: true },
    { label: "GPS Refresh Rate", value: "30 giây / lần", active: true },
  ]},
];

const securityPolicies = [
  { label: "Xác thực đa yếu tố (MFA)", enabled: true },
  { label: "Mã hóa dữ liệu AES-256", enabled: true },
  { label: "VPN bắt buộc", enabled: true },
  { label: "Audit Log 365 ngày", enabled: true },
  { label: "IP Whitelist", enabled: false },
  { label: "Auto Logout sau 30 phút", enabled: true },
];

const roleColors: Record<string, string> = {
  "Super Admin": "bg-[#E2001A]/15 text-[#E2001A]",
  "Regional Manager": "bg-[#6B7FE3]/15 text-[#6B7FE3]",
  "Warehouse Manager": "bg-[#FFB347]/15 text-[#FFB347]",
  "Analyst": "bg-[#4ECDC4]/15 text-[#4ECDC4]",
};

export function Settings() {
  const [activeTab, setActiveTab] = useState<"users" | "config" | "security">("users");
  const [policies, setPolicies] = useState(securityPolicies);
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Bảo mật & Cài đặt</h1>
          <p className="text-muted-foreground mt-0.5">Quản trị hệ thống · Chính sách bảo mật toàn cầu</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/20">
          <Shield size={12} className="text-emerald-400" />
          <span className="text-emerald-400 text-xs">Hệ thống an toàn</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["users", "config", "security"] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-xs transition-colors border-b-2 -mb-px ${
              activeTab === t
                ? "border-[#E2001A] text-[#E2001A]"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "users" ? "Quản lý người dùng" : t === "config" ? "Cấu hình hệ thống" : "Bảo mật"}
          </button>
        ))}
      </div>

      {activeTab === "users" && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-foreground">Danh sách người dùng ({users.length})</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#E2001A] text-white rounded hover:bg-[#C0001A] transition-colors text-xs">
              <Users size={12} />
              Thêm người dùng
            </button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {["Người dùng", "Vai trò", "Khu vực", "Trạng thái", "Đăng nhập gần nhất", ""].map(h => (
                  <th key={h} className="text-left text-muted-foreground px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.email} className="border-b border-border/50 hover:bg-[#1A1A1D] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[#E2001A]/20 flex items-center justify-center text-[#E2001A] font-medium text-sm">{u.name[0]}</div>
                      <div>
                        <p className="text-foreground">{u.name}</p>
                        <p className="text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded ${roleColors[u.role] || ""}`}>{u.role}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{u.region}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded ${u.status === "Hoạt động" ? "bg-emerald-500/10 text-emerald-400" : "bg-[#2E2E35] text-muted-foreground"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{u.lastLogin}</td>
                  <td className="px-4 py-3">
                    <button className="text-[#E2001A] hover:underline">Chỉnh sửa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {configs.map(cat => {
            const Icon = cat.icon;
            return (
              <div key={cat.category} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Icon size={14} className="text-[#E2001A]" />
                  <h3 className="text-foreground">{cat.category}</h3>
                </div>
                {cat.items.map(item => (
                  <div key={item.label} className="space-y-1 border-t border-border pt-2">
                    <p className="text-muted-foreground text-xs">{item.label}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-foreground text-xs">{item.value}</p>
                      <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${item.active ? "bg-emerald-500/10 text-emerald-400" : "bg-[#2E2E35] text-muted-foreground"}`}>
                        {item.active ? <Check size={10} /> : null}
                        {item.active ? "Hoạt động" : "Tắt"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          {/* API Key */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Key size={14} className="text-[#E2001A]" />
              <h3 className="text-foreground">API Keys</h3>
            </div>
            <div className="space-y-2">
              {[{ label: "Smart TMS API Key", key: "sk-ltms-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" }, { label: "IoT Integration Key", key: "iot-xxxx-xxxx-xxxx-xxxx" }].map(k => (
                <div key={k.label} className="border-t border-border pt-2">
                  <p className="text-muted-foreground text-xs mb-1">{k.label}</p>
                  <div className="flex items-center gap-2 bg-[#1A1A1D] rounded px-3 py-2">
                    <code className="text-foreground text-xs flex-1 overflow-hidden">
                      {showApiKey ? k.key : k.key.replace(/[a-z0-9]/g, "•")}
                    </code>
                    <button onClick={() => setShowApiKey(v => !v)} className="text-muted-foreground hover:text-foreground transition-colors">
                      {showApiKey ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={14} className="text-[#E2001A]" />
              <h3 className="text-foreground">Chính sách bảo mật</h3>
            </div>
            {policies.map((p, i) => (
              <div key={p.label} className="flex items-center justify-between py-2 border-b border-border/50">
                <p className="text-foreground text-xs">{p.label}</p>
                <button
                  onClick={() => setPolicies(prev => prev.map((pp, j) => j === i ? { ...pp, enabled: !pp.enabled } : pp))}
                  className={`relative w-10 h-5 rounded-full transition-all ${p.enabled ? "bg-[#E2001A]" : "bg-[#2E2E35]"}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${p.enabled ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe size={14} className="text-[#E2001A]" />
                <h3 className="text-foreground">Tuân thủ quốc tế</h3>
              </div>
              {[
                { name: "GDPR (EU)", status: "Tuân thủ", color: "emerald" },
                { name: "SOC 2 Type II", status: "Được chứng nhận", color: "emerald" },
                { name: "ISO 27001", status: "Được chứng nhận", color: "emerald" },
                { name: "CCPA (California)", status: "Tuân thủ", color: "emerald" },
                { name: "PIPL (China)", status: "Tuân thủ", color: "emerald" },
              ].map(c => (
                <div key={c.name} className="flex items-center justify-between py-2 border-b border-border/50 text-xs">
                  <span className="text-foreground">{c.name}</span>
                  <span className="text-emerald-400 flex items-center gap-1"><Check size={10} /> {c.status}</span>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bell size={14} className="text-[#E2001A]" />
                <h3 className="text-foreground">Audit Log gần nhất</h3>
              </div>
              {[
                { action: "Đăng nhập thành công", user: "ngan.nguyen@lenovo.com", time: "13:45:02" },
                { action: "Xuất báo cáo Q2", user: "s.johnson@lenovo.com", time: "08:22:18" },
                { action: "Thay đổi phân quyền", user: "ngan.nguyen@lenovo.com", time: "07:51:44" },
                { action: "Cập nhật cấu hình AI", user: "ngan.nguyen@lenovo.com", time: "Yesterday" },
              ].map(l => (
                <div key={l.action + l.time} className="flex items-center justify-between py-2 border-b border-border/50 text-xs">
                  <div>
                    <p className="text-foreground">{l.action}</p>
                    <p className="text-muted-foreground">{l.user}</p>
                  </div>
                  <p className="text-muted-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{l.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
