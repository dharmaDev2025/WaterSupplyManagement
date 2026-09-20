import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  Droplets,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import type { DeliveryBoyProfile } from "../types/delivery";

export default function DeliveryDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const deliveryBoy: DeliveryBoyProfile | null = (() => {
    try {
      const stored = localStorage.getItem("deliveryBoy");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/delivery/dashboard",
      icon: LayoutDashboard,
      description: "Overview & summary",
    },
    {
      name: "Active Orders",
      path: "/delivery/orders",
      icon: Package,
      description: "Assigned active deliveries",
    },
    {
      name: "Delivered Orders",
      path: "/delivery/delivered",
      icon: CheckCircle2,
      description: "Delivered history",
    },
  ];

  const getPageHeader = () => {
    if (location.pathname === "/delivery/dashboard") {
      return {
        title: "Delivery Dashboard",
        subtitle: "Overview of your assigned deliveries and performance",
      };
    }
    if (location.pathname === "/delivery/orders") {
      return {
        title: "Active Orders",
        subtitle: "Manage and update your ongoing deliveries",
      };
    }
    if (location.pathname.startsWith("/delivery/orders/")) {
      return {
        title: "Order Details",
        subtitle: "Order verification and customer fulfillment",
      };
    }
    if (location.pathname === "/delivery/delivered") {
      return {
        title: "Delivered Orders",
        subtitle: "History of completed deliveries",
      };
    }
    return {
      title: "Delivery Panel",
      subtitle: "AquaFlow Logistics & Fulfillment",
    };
  };

  const isActive = (path: string) => {
    if (path === "/delivery/dashboard") {
      return location.pathname === "/delivery/dashboard";
    }
    if (path === "/delivery/orders") {
      return (
        location.pathname === "/delivery/orders" ||
        location.pathname.startsWith("/delivery/orders/")
      );
    }
    if (path === "/delivery/delivered") {
      return location.pathname === "/delivery/delivered";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("deliveryToken");
    localStorage.removeItem("deliveryBoy");
    navigate("/");
  };

  const { title, subtitle } = getPageHeader();

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex">
      {/* Mobile Drawer Backdrop Overlay */}
      {sidebarOpen && (
        <div
          role="presentation"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* LEFT SIDEBAR - Sticky on desktop */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-screen w-[264px] flex-col border-r border-slate-200/80 bg-white transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:shrink-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full shadow-none"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-100 px-6">
          <button
            type="button"
            onClick={() => {
              navigate("/delivery/dashboard");
              setSidebarOpen(false);
            }}
            className="group flex min-w-0 items-center gap-3 text-left focus:outline-hidden"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20 transition-transform group-hover:scale-105">
              <Droplets className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold tracking-tight text-slate-900">
                AquaFlow
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <p className="text-xs font-semibold text-slate-500">
                  Delivery Panel
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            aria-label="Close mobile sidebar"
            onClick={() => setSidebarOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6">
          <div className="mb-2 px-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </span>
          </div>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition-all ${
                    active
                      ? "bg-blue-50/90 text-blue-600 shadow-xs shadow-blue-500/5 font-semibold"
                      : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      active
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="truncate">{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Staff Badge Card */}
          <div className="mt-8 px-1">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <p className="text-xs font-bold text-slate-900">
                      On Active Shift
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    Fulfill orders securely with OTP verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Profile & Logout */}
        <div className="shrink-0 border-t border-slate-100 p-4 bg-white/80">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-sm">
              {deliveryBoy?.name ? deliveryBoy.name.charAt(0).toUpperCase() : "D"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">
                {deliveryBoy?.name || "Delivery Boy"}
              </p>
              <p className="truncate text-xs font-medium text-slate-500">
                {deliveryBoy?.email || "Delivery Staff"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50/70 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 hover:text-red-700 focus:outline-hidden"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE: Flexible container using all remaining width */}
      <div className="flex-1 min-w-0 w-full flex flex-col">
        {/* STICKY TOP HEADER */}
        <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md shadow-xs">
          <div className="flex min-w-0 items-center gap-3.5">
            {/* Mobile Hamburger Menu */}
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-0.5 hidden truncate text-xs font-medium text-slate-500 sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Header Right Utilities */}
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
            {/* Notification Icon */}
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-xs hover:bg-slate-50 hover:text-slate-800 transition focus:outline-hidden"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
              </span>
            </button>

            {/* Profile Pill */}
            <div className="flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-4">
              <div className="hidden sm:block text-right">
                <p className="max-w-[160px] truncate text-sm font-bold text-slate-900">
                  {deliveryBoy?.name || "Delivery Boy"}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  Delivery Staff
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-sm shadow-xs">
                {deliveryBoy?.name ? (
                  deliveryBoy.name.charAt(0).toUpperCase()
                ) : (
                  <UserRound className="h-5 w-5 text-blue-600" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN PAGE CONTENT via <Outlet /> */}
        <main className="flex-1 w-full min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full min-w-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}