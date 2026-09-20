import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Package,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import type { DeliveryOrder } from "../types/delivery";

export default function DeliveryDeliveredOrders() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const logout = () => {
    localStorage.removeItem("deliveryToken");
    localStorage.removeItem("deliveryBoy");
    navigate("/");
  };

  const fetchDeliveredOrders = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const token = localStorage.getItem("deliveryToken");
      if (!token) {
        logout();
        return;
      }

      const response = await axios.get(`${API_URL}/delivery/orders/delivered`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data?.orders || []);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          return;
        }
        setError(err.response?.data?.message || "Failed to fetch delivered orders.");
        return;
      }
      setError("An unexpected error occurred while fetching delivered orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeliveredOrders();
  }, []);

  // Filtered orders based on search
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;

    const q = searchQuery.toLowerCase().trim();
    return orders.filter((order) => {
      const orderNum = order.orderNumber?.toLowerCase() || "";
      const customerName = order.customer?.name?.toLowerCase() || "";
      const customerPhone = order.customer?.phone?.toLowerCase() || "";
      const houseNo = order.deliveryAddress?.houseNo?.toLowerCase() || "";
      const street = order.deliveryAddress?.street?.toLowerCase() || "";
      const city = order.deliveryAddress?.city?.toLowerCase() || "";

      return (
        orderNum.includes(q) ||
        customerName.includes(q) ||
        customerPhone.includes(q) ||
        houseNo.includes(q) ||
        street.includes(q) ||
        city.includes(q)
      );
    });
  }, [orders, searchQuery]);

  // Metric calculations
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  }, [orders]);

  const deliveredTodayCount = useMemo(() => {
    const today = new Date();
    return orders.filter((order) => {
      const dateStr = order.deliveredAt || order.createdAt;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }).length;
  }, [orders]);

  // SKELETON LOADING
  if (loading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-7 w-48 rounded-lg bg-slate-200" />
            <div className="h-4 w-64 rounded-md bg-slate-200" />
          </div>
          <div className="h-10 w-28 rounded-xl bg-slate-200" />
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-200" />
          ))}
        </div>

        <div className="h-12 w-full rounded-2xl bg-slate-200" />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* ERROR BANNER */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchDeliveredOrders(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:bg-red-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Delivered Orders
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200/60">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              {orders.length} Fulfilled
            </span>
          </div>
          <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
            Complete history of successfully delivered water orders
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchDeliveredOrders(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-60 sm:self-auto focus:outline-hidden"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh List"}
        </button>
      </div>

      {/* SUMMARY METRIC STRIP */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Delivered
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">
                {orders.length}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">All-time fulfilled orders</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Delivered Today
              </p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                {deliveredTodayCount}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Orders completed today</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Value Delivered
              </p>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">
                ₹{Number(totalRevenue).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Fulfilled revenue amount</p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search delivered orders by order number, customer name, phone, or address..."
          className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-xs focus:border-blue-500 focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ORDERS LIST CONTAINER */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        {filteredOrders.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              {orders.length === 0
                ? "No Delivered Orders Yet"
                : "No Matching Delivered Orders"}
            </h3>
            <p className="mt-1 max-w-sm text-xs font-medium text-slate-500 leading-relaxed">
              {orders.length === 0
                ? "You haven't confirmed any deliveries yet. As soon as you verify delivery OTPs for active orders, they will appear here in your fulfilled records."
                : "No delivered orders match your search term. Clear your search to view all completed deliveries."}
            </p>
            {orders.length > 0 && searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="h-3.5 w-3.5" />
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* MOBILE VIEW (< md): Card List */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredOrders.map((order) => {
                const addressStr = [
                  order.deliveryAddress?.houseNo,
                  order.deliveryAddress?.street,
                  order.deliveryAddress?.city,
                ]
                  .filter(Boolean)
                  .join(", ");

                const deliveredDateStr = order.deliveredAt || order.createdAt;

                return (
                  <div key={order._id} className="p-4 space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Order Number
                        </span>
                        <p className="text-sm font-bold text-slate-900 break-all">
                          #{order.orderNumber}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Delivered
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-400">Customer</span>
                        <span className="font-bold text-slate-800">
                          {order.customer?.name || "N/A"}
                        </span>
                      </div>
                      {order.customer?.phone && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-400">Phone</span>
                          <span className="font-mono text-slate-700">
                            {order.customer.phone}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="font-medium text-slate-500">Delivered On</span>
                        <span className="font-semibold text-slate-700">
                          {deliveredDateStr
                            ? new Date(deliveredDateStr).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="font-medium text-slate-500">Amount Paid</span>
                        <span className="text-sm font-bold text-slate-900">
                          ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {addressStr && (
                      <p className="text-xs text-slate-500 truncate">
                        <span className="font-medium text-slate-700">Delivered to: </span>
                        {addressStr}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate(`/delivery/orders/${order._id}`)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-slate-200"
                    >
                      <span>View Order Summary</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW (>= md): High-Density Table */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Order ID</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Delivery Address</th>
                    <th className="py-3.5 px-6">Delivered Date & Time</th>
                    <th className="py-3.5 px-6 text-right">Amount</th>
                    <th className="py-3.5 px-6 text-center">Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredOrders.map((order) => {
                    const addressStr = [
                      order.deliveryAddress?.houseNo,
                      order.deliveryAddress?.street,
                      order.deliveryAddress?.city,
                    ]
                      .filter(Boolean)
                      .join(", ");

                    const deliveredDateStr = order.deliveredAt || order.createdAt;

                    return (
                      <tr
                        key={order._id}
                        className="transition hover:bg-slate-50/60"
                      >
                        <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                          #{order.orderNumber}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-900 truncate max-w-[160px]">
                            {order.customer?.name || "N/A"}
                          </p>
                          <p className="text-xs font-mono text-slate-500">
                            {order.customer?.phone || "N/A"}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600 max-w-[220px] truncate">
                          {addressStr || "Address not recorded"}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600 whitespace-nowrap">
                          {deliveredDateStr
                            ? new Date(deliveredDateStr).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-slate-900 whitespace-nowrap">
                          ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            Delivered
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => navigate(`/delivery/orders/${order._id}`)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                          >
                            <span>Details</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}