import { useState } from "react";
import {
  LayoutDashboard, Package, Warehouse, Box, BarChart3, Settings, ChevronRight,
  Menu, X, Truck, Bell, Search, User
} from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { OrderManagement } from "./components/OrderManagement";
import { Warehouse as WarehousePage } from "./components/Warehouse";
import { Loading3D } from "./components/Loading3D";
import { Analytics } from "./components/Analytics";
import { Settings as SettingsPage } from "./components/Settings";

{/* MARKER-MAKE-KIT-INVOKED */}

type Page = "dashboard" | "orders" | "warehouse" | "loading3d" | "analytics" | "settings";

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
  { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { id: "orders", label: "Quản lý đơn hàng", icon: Package, badge: "48.3K" },
  { id: "warehouse", label: "Kho & Đối tác", icon: Warehouse },
  { id: "loading3d", label: "3D Loading AI", icon: Box },
  { id: "analytics", label: "Báo cáo & Phân tích", icon: BarChart3 },
  { id: "settings", label: "Bảo mật & Cài đặt", icon: Settings },
];

const pageComponents: Record<Page, React.ComponentType> = {
  dashboard: Dashboard,
  orders: OrderManagement,
  warehouse: WarehousePage,
  loading3d: Loading3D,
  analytics: Analytics,
  settings: SettingsPage,
};

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const PageComponent = pageComponents[page];

  return (
    <div className="min-h-screen bg-background flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: 240, background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="flex items-center justify-center w-8 h-8 rounded">
            <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
              <rect width="32" height="32" rx="4" fill="#E2001A" />
              <text x="3" y="22" style={{ fontFamily: "'Roboto Slab', serif", fontSize: 18, fontWeight: 700, fill: "white" }}>L</text>
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: "'Roboto Slab', serif", fontWeight: 700, fontSize: 13, color: "var(--sidebar-accent-foreground)" }}>
              Smart TMS
            </p>
            <p style={{ fontSize: 10, color: "var(--sidebar-foreground)" }}>Lenovo Logistics 4.0</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={16} style={{ color: "var(--sidebar-foreground)" }} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p style={{ fontSize: 10, color: "var(--sidebar-foreground)", padding: "4px 8px 8px", letterSpacing: "0.08em" }}>
            ĐIỀU HƯỚNG
          </p>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded transition-all group"
                style={{
                  background: active ? "rgba(226, 0, 26, 0.12)" : "transparent",
                  borderLeft: active ? "2px solid #E2001A" : "2px solid transparent",
                }}
              >
                <Icon
                  size={15}
                  style={{ color: active ? "#E2001A" : "var(--sidebar-foreground)", flexShrink: 0 }}
                />
                <span
                  className="flex-1 text-left truncate text-xs"
                  style={{ color: active ? "var(--sidebar-accent-foreground)" : "var(--sidebar-foreground)" }}
                >
                  {item.label}
                </span>
                {item.badge && (
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(226,0,26,0.15)", color: "#E2001A", fontFamily: "'JetBrains Mono', monospace" }}>
                    {item.badge}
                  </span>
                )}
                {active && <ChevronRight size={11} style={{ color: "#E2001A" }} />}
              </button>
            );
          })}
        </nav>

        {/* User info */}
        <div className="px-4 py-4 border-t" style={{ borderColor: "var(--sidebar-border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E2001A]/20 flex items-center justify-center text-[#E2001A] text-sm font-medium">N</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate" style={{ color: "var(--sidebar-accent-foreground)" }}>Nguyễn Thị Ngọc Ngân</p>
              <p className="text-xs" style={{ color: "var(--sidebar-foreground)" }}>Super Admin · APAC</p>

            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 py-3 border-b border-border bg-card shrink-0">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} className="text-muted-foreground" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Lenovo Smart TMS</span>
            <ChevronRight size={11} className="text-muted-foreground" />
            <span className="text-foreground">{navItems.find(n => n.id === page)?.label}</span>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="hidden md:flex items-center gap-2 bg-[#1A1A1D] rounded px-3 py-1.5 w-56">
            <Search size={12} className="text-muted-foreground" />
            <input
              placeholder="Tìm kiếm toàn hệ thống..."
              className="bg-transparent text-foreground placeholder-muted-foreground outline-none flex-1 text-xs"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(v => !v)}
              className="relative p-2 rounded hover:bg-[#1A1A1D] transition-colors"
            >
              <Bell size={16} className="text-muted-foreground" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#E2001A] rounded-full" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-popover border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <p className="text-foreground text-xs font-medium">Thông báo</p>
                  <span className="text-[#E2001A] text-xs">3 mới</span>
                </div>
                {[
                  { msg: "SH-4821 bị trễ 2h tại Shanghai", time: "5 phút trước", red: true },
                  { msg: "AI đề xuất tuyến thay thế HK-5519", time: "28 phút trước", red: false },
                  { msg: "Container TCKU-8841 nhiệt độ vượt ngưỡng", time: "41 phút trước", red: true },
                ].map((n, i) => (
                  <div key={i} className="px-4 py-3 border-b border-border/50 hover:bg-[#1A1A1D] transition-colors cursor-pointer">
                    <div className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${n.red ? "bg-[#E2001A]" : "bg-[#6B7FE3]"}`} />
                      <div>
                        <p className="text-foreground text-xs">{n.msg}</p>
                        <p className="text-muted-foreground text-xs mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="w-full py-3 text-[#E2001A] text-xs hover:bg-[#1A1A1D] transition-colors">
                  Xem tất cả thông báo
                </button>
              </div>
            )}
          </div>

          <div className="w-7 h-7 rounded-full bg-[#E2001A]/20 flex items-center justify-center text-[#E2001A] text-sm font-medium">N</div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <PageComponent />
        </main>
      </div>
    </div>
  );
}
