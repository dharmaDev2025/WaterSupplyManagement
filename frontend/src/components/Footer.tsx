import { useNavigate } from "react-router-dom";

function Footer() {
  const navigate = useNavigate();

  const goTo = (path: string) => {
    navigate(path);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div
              onClick={() => goTo("/dashboard")}
              className="group flex cursor-pointer items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-sm transition duration-300 group-hover:scale-105">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                >
                  <path
                    d="M12 2C12 2 5 9.2 5 14.3C5 18.6 8.1 22 12 22C15.9 22 19 18.6 19 14.3C19 9.2 12 2 12 2Z"
                    fill="white"
                  />
                </svg>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 transition group-hover:text-blue-600">
                  AquaFlow
                </h2>

                <p className="text-[11px] text-slate-400">
                  Pure Water Delivery
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-xs text-xs leading-5 text-slate-500">
              Fresh and reliable drinking water
              delivered to your home, office,
              shop or hotel.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-600">
                ✓ Doorstep Delivery
              </span>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold text-emerald-600">
                ✓ Secure Payment
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Quick Links
            </h3>

            <div className="mt-4 flex flex-col items-start gap-2.5">
              {[
                ["Home", "/dashboard"],
                ["Products", "/products"],
                ["My Cart", "/cart"],
                ["My Orders", "/my-orders"],
                ["My Profile", "/profile"],
              ].map(([label, path]) => (
                <button
                  key={path}
                  type="button"
                  onClick={() => goTo(path)}
                  className="group flex items-center gap-1.5 text-xs text-slate-500 transition hover:translate-x-1 hover:text-blue-600"
                >
                  <span className="text-blue-500 opacity-0 transition group-hover:opacity-100">
                    →
                  </span>

                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Services
            </h3>

            <div className="mt-4 space-y-3">
              <div className="group flex items-center gap-3 rounded-lg p-1.5 transition hover:bg-blue-50">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-sm transition group-hover:bg-blue-100">
                  💧
                </span>

                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Water Jars
                  </p>

                  <p className="text-[10px] text-slate-400">
                    New jar & refill
                  </p>
                </div>
              </div>

              <div className="group flex items-center gap-3 rounded-lg p-1.5 transition hover:bg-cyan-50">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 text-sm transition group-hover:bg-cyan-100">
                  🧴
                </span>

                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Water Bottles
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Multiple sizes
                  </p>
                </div>
              </div>

              <div className="group flex items-center gap-3 rounded-lg p-1.5 transition hover:bg-emerald-50">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-sm transition group-hover:bg-emerald-100">
                  🚚
                </span>

                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Order Delivery
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Track order status
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Need Help?
            </h3>

            <div className="mt-4 space-y-3">
              <div className="group flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-blue-50/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:scale-105">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3l2 5-2 2a16 16 0 008 8l2-2 5 2v3a2 2 0 01-2 2C10 23 3 16 3 7V5z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400">
                    Customer Support
                  </p>

                  <p className="text-xs font-semibold text-slate-700">
                    We're here to help
                  </p>
                </div>
              </div>

              <div className="group flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-cyan-200 hover:bg-cyan-50/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 transition group-hover:scale-105">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l8 5a2 2 0 002 0l8-5M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-[10px] text-slate-400">
                    Email Support
                  </p>

                  <p className="text-xs font-semibold text-slate-700">
                    AquaFlow Support
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-slate-400">
                🕐 Mon – Sat · 8:00 AM – 8:00 PM
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-4 sm:flex-row sm:px-8 lg:px-10">
          <p className="text-[11px] text-slate-400">
            © 2026 AquaFlow. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-[11px] text-slate-400 transition hover:text-blue-600"
            >
              Privacy
            </button>

            <button
              type="button"
              className="text-[11px] text-slate-400 transition hover:text-blue-600"
            >
              Terms
            </button>

            <span className="hidden h-3 w-px bg-slate-300 sm:block" />

            <p className="text-[11px] font-medium text-slate-400">
              🔒 Payments secured by Stripe
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;