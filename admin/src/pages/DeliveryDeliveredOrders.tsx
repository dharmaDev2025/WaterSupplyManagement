import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";
import axios from "axios";
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Package,
  Truck,
} from "lucide-react";
import DeliveryDashboardLayout from "../components/DeliveryDashboardLayout";

interface Customer {
  name: string;
  phone: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: Customer | null;
  totalAmount: number;
  status: string;
  createdAt: string;
}

function DeliveryDashboard() {
  const navigate = useNavigate();

  const API_URL =
    import.meta.env.VITE_API_URL;

  const [activeOrders, setActiveOrders] =
    useState<Order[]>([]);

  const [
    deliveredOrders,
    setDeliveredOrders,
  ] = useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const logout = () => {
    localStorage.removeItem(
      "deliveryToken"
    );

    localStorage.removeItem(
      "deliveryBoy"
    );

    navigate("/");
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem(
          "deliveryToken"
        );

      if (!token) {
        logout();
        return;
      }

      const config = {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      };

      const [
        activeResponse,
        deliveredResponse,
      ] = await Promise.all([
        axios.get(
          `${API_URL}/delivery/orders/active`,
          config
        ),
        axios.get(
          `${API_URL}/delivery/orders/delivered`,
          config
        ),
      ]);

      setActiveOrders(
        activeResponse.data.orders || []
      );

      setDeliveredOrders(
        deliveredResponse.data.orders ||
          []
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (
          error.response?.status ===
            401 ||
          error.response?.status ===
            403
        ) {
          logout();
          return;
        }

        setError(
          error.response?.data
            ?.message ||
            "Unable to load dashboard"
        );

        return;
      }

      setError(
        "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const confirmedOrders =
    activeOrders.filter(
      (order) =>
        order.status === "confirmed"
    ).length;

  const packedOrders =
    activeOrders.filter(
      (order) =>
        order.status === "packed"
    ).length;

  const outForDeliveryOrders =
    activeOrders.filter(
      (order) =>
        order.status ===
        "out-for-delivery"
    ).length;

  const recentOrders =
    activeOrders.slice(0, 5);

  const formatStatus = (
    status: string
  ) => {
    return status
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const statusStyle = (
    status: string
  ) => {
    if (status === "confirmed") {
      return "bg-blue-50 text-blue-700";
    }

    if (status === "packed") {
      return "bg-orange-50 text-orange-700";
    }

    if (
      status === "out-for-delivery"
    ) {
      return "bg-purple-50 text-purple-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  if (loading) {
    return (
      <DeliveryDashboardLayout
        title="Dashboard"
        subtitle="Manage your assigned deliveries"
      >
        <div className="flex min-h-[500px] w-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading dashboard...
            </p>
          </div>
        </div>
      </DeliveryDashboardLayout>
    );
  }

  return (
    <DeliveryDashboardLayout
      title="Dashboard"
      subtitle="Manage your assigned deliveries"
    >
      <div className="w-full min-w-0">
        {error && (
          <div className="mb-6 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mb-7 w-full">
          <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Delivery Overview
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Track your assigned and completed
            deliveries.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                  Active Orders
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {activeOrders.length}
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                  Confirmed
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {confirmedOrders}
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50">
                <Clock3 className="h-6 w-6 text-cyan-600" />
              </div>
            </div>
          </div>

          <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                  Packed
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {packedOrders}
                </p>

                <p className="mt-2 text-xs text-purple-500">
                  {outForDeliveryOrders} out for
                  delivery
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50">
                <Truck className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                  Delivered
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {deliveredOrders.length}
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 lg:p-6">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-slate-900">
                Active Deliveries
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Recently assigned orders
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/delivery/orders"
                )
              }
              className="flex shrink-0 items-center gap-1 self-start text-sm font-semibold text-blue-600 transition hover:text-blue-700 sm:self-auto"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex min-h-[260px] w-full flex-col items-center justify-center px-4 text-center">
              <Truck className="h-10 w-10 text-slate-300" />

              <p className="mt-3 font-semibold text-slate-500">
                No active orders
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 p-4 md:hidden">
                {recentOrders.map(
                  (order) => (
                    <div
                      key={order._id}
                      className="w-full rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Order
                          </p>

                          <p className="mt-1 break-all text-sm font-bold text-slate-900">
                            #{order.orderNumber}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(
                            order.status
                          )}`}
                        >
                          {formatStatus(
                            order.status
                          )}
                        </span>
                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="break-words text-sm font-semibold text-slate-800">
                          {order.customer
                            ?.name ||
                            "N/A"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {order.customer
                            ?.phone ||
                            "N/A"}
                        </p>
                      </div>

                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-400">
                            Amount
                          </p>

                          <p className="mt-1 font-bold text-slate-900">
                            ₹
                            {Number(
                              order.totalAmount
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/delivery/orders/${order._id}`
                            )
                          }
                          className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                        >
                          View Order
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="hidden w-full min-w-0 md:block">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="w-[18%] px-3 py-4 text-left text-xs font-semibold uppercase text-slate-500 lg:px-5 xl:px-6">
                        Order
                      </th>

                      <th className="w-[32%] px-3 py-4 text-left text-xs font-semibold uppercase text-slate-500 lg:px-5 xl:px-6">
                        Customer
                      </th>

                      <th className="w-[18%] px-3 py-4 text-left text-xs font-semibold uppercase text-slate-500 lg:px-5 xl:px-6">
                        Amount
                      </th>

                      <th className="w-[18%] px-3 py-4 text-left text-xs font-semibold uppercase text-slate-500 lg:px-5 xl:px-6">
                        Status
                      </th>

                      <th className="w-[14%] px-3 py-4 text-right text-xs font-semibold uppercase text-slate-500 lg:px-5 xl:px-6">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.map(
                      (order) => (
                        <tr
                          key={order._id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-3 py-4 align-middle lg:px-5 xl:px-6">
                            <p className="break-words text-sm font-semibold text-slate-800">
                              #{order.orderNumber}
                            </p>
                          </td>

                          <td className="px-3 py-4 align-middle lg:px-5 xl:px-6">
                            <div className="min-w-0">
                              <p className="break-words text-sm font-semibold text-slate-700">
                                {order.customer
                                  ?.name ||
                                  "N/A"}
                              </p>

                              <p className="mt-1 break-words text-xs text-slate-400">
                                {order.customer
                                  ?.phone ||
                                  "N/A"}
                              </p>
                            </div>
                          </td>

                          <td className="px-3 py-4 align-middle lg:px-5 xl:px-6">
                            <p className="text-sm font-semibold text-slate-700">
                              ₹
                              {Number(
                                order.totalAmount
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          </td>

                          <td className="px-3 py-4 align-middle lg:px-5 xl:px-6">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(
                                order.status
                              )}`}
                            >
                              {formatStatus(
                                order.status
                              )}
                            </span>
                          </td>

                          <td className="px-3 py-4 text-right align-middle lg:px-5 xl:px-6">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/delivery/orders/${order._id}`
                                )
                              }
                              className="inline-flex rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                            >
                              View Order
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </DeliveryDashboardLayout>
  );
}

export default DeliveryDashboard;