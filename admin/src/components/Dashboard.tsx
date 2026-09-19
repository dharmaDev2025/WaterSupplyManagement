import { useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Boxes,
  Droplets,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingCart,
  Truck,
  UserRound,
  Users,
  X,
} from "lucide-react";

interface DashboardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

function Dashboard({
  children,
  title,
  subtitle,
}: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const storedAdmin =
    localStorage.getItem("admin");

  let admin = null;

  if (storedAdmin) {
    try {
      admin = JSON.parse(storedAdmin);
    } catch {
      admin = null;
    }
  }

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      name: "Products",
      icon: Boxes,
      path: "/admin/products",
    },
    {
      name: "Orders",
      icon: ShoppingCart,
      path: "/admin/orders",
    },
    {
      name: "Customers",
      icon: Users,
      path: "/admin/customers",
    },
    {
      name: "Delivery Boys",
      icon: Truck,
      path: "/admin/delivery-boys",
    },
  ];

  const handleNavigation = (
    path: string
  ) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "admin"
    );

    sessionStorage.removeItem(
      "adminEmail"
    );

    navigate("/");
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gray-50">
      {sidebarOpen && (
        <div
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[270px] flex-col border-r border-gray-100 bg-white shadow-sm transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-gray-100 px-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600">
              <Droplets className="h-6 w-6 text-white" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-gray-900">
                AquaFlow
              </h1>

              <p className="text-xs text-gray-400">
                Admin Panel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Management
          </p>

          <nav className="space-y-2">
            {menuItems.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  location.pathname ===
                    item.path ||
                  (item.path !==
                    "/admin/dashboard" &&
                    location.pathname.startsWith(
                      `${item.path}/`
                    ));

                return (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() =>
                      handleNavigation(
                        item.path
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      active
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />

                    <span className="truncate">
                      {item.name}
                    </span>
                  </button>
                );
              }
            )}
          </nav>
        </div>

        <div className="shrink-0 border-t border-gray-100 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <UserRound className="h-5 w-5 text-blue-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-800">
                {admin?.name ||
                  "AquaFlow Admin"}
              </p>

              <p className="truncate text-xs text-gray-400">
                {admin?.email ||
                  "Administrator"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 shrink-0" />

            Logout
          </button>
        </div>
      </aside>

      <div className="min-h-screen min-w-0 bg-gray-50 lg:ml-[270px] lg:w-[calc(100%-270px)]">
        <header className="fixed left-0 right-0 top-0 z-30 flex h-20 items-center justify-between border-b border-gray-100 bg-white px-4 shadow-sm sm:px-6 lg:left-[270px] lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-gray-600 transition hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-gray-900 sm:text-2xl">
                {title}
              </h2>

              {subtitle && (
                <p className="mt-0.5 hidden truncate text-sm text-gray-400 sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="ml-3 flex shrink-0 items-center gap-2">
            <div className="hidden text-right md:block">
              <p className="max-w-[180px] truncate text-sm font-semibold text-gray-800">
                {admin?.name ||
                  "AquaFlow Admin"}
              </p>

              <p className="max-w-[180px] truncate text-xs text-gray-400">
                Administrator
              </p>
            </div>

            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 sm:h-11 sm:w-11"
            >
              <Bell className="h-5 w-5" />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>
          </div>
        </header>

        <main className="min-h-screen min-w-0 w-full overflow-x-hidden px-4 pb-4 pt-24 sm:px-6 sm:pb-6 sm:pt-26 lg:px-8 lg:pb-8">
          <div className="min-w-0 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;