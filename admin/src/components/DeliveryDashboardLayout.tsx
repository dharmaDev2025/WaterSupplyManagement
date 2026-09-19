import { useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

interface DeliveryDashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

function DeliveryDashboardLayout({
  children,
  title,
  subtitle,
}: DeliveryDashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const deliveryBoy = (() => {
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
    },
    {
      name: "Active Orders",
      path: "/delivery/orders",
      icon: Package,
    },
    {
      name: "Delivered Orders",
      path: "/delivery/delivered",
      icon: CheckCircle2,
    },
  ];

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

    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("deliveryToken");
    localStorage.removeItem("deliveryBoy");
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 lg:flex lg:items-start">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col border-r border-gray-100 bg-white shadow-sm transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:shrink-0 lg:translate-x-0`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-gray-100 px-5">
          <button
            type="button"
            onClick={() => handleNavigate("/delivery/dashboard")}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
              <Droplets className="h-6 w-6 text-white" />
            </div>

            <div className="min-w-0 text-left">
              <h1 className="truncate text-xl font-bold text-gray-900">
                AquaFlow
              </h1>

              <p className="text-xs font-medium text-gray-400">
                Delivery Panel
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Menu
          </p>

          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      active ? "text-blue-600" : "text-gray-400"
                    }`}
                  />

                  <span className="truncate">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Delivery
            </p>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                  <Truck className="h-5 w-5 text-white" />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900">
                    Delivery Staff
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Manage assigned orders
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-gray-100 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <UserRound className="h-5 w-5 text-blue-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {deliveryBoy?.name || "Delivery Boy"}
              </p>

              <p className="truncate text-xs text-gray-400">
                {deliveryBoy?.email || "Delivery Staff"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="min-h-screen min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-gray-100 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-gray-900 sm:text-xl">
                {title}
              </h2>

              {subtitle && (
                <p className="mt-0.5 hidden truncate text-xs text-gray-400 sm:block sm:text-sm">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
            >
              <Bell className="h-5 w-5" />
            </button>

            <div className="hidden items-center gap-3 border-l border-gray-200 pl-3 md:flex">
              <div className="text-right">
                <p className="max-w-[160px] truncate text-sm font-semibold text-gray-900">
                  {deliveryBoy?.name || "Delivery Boy"}
                </p>

                <p className="text-xs text-gray-400">
                  Delivery Staff
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <UserRound className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-80px)] w-full min-w-0 overflow-x-hidden px-4 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
          <div className="w-full min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DeliveryDashboardLayout;