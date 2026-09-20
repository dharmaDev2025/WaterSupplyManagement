import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  ArrowUpRight,
  Package,
  Phone,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import type { DeliveryOrder } from "../types/delivery";

type StatusFilter = "all" | "confirmed" | "packed" | "out-for-delivery";

export default function DeliveryActiveOrders() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");

  const logout = () => {
    localStorage.removeItem("deliveryToken");
    localStorage.removeItem("deliveryBoy");
    navigate("/");
  };

  const fetchOrders = async (isManualRefresh = false) => {
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

      const response = await axios.get(`${API_URL}/delivery/orders/active`, {
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
        setError(err.response?.data?.message || "Failed to fetch active orders.");
        return;
      }
      setError("An unexpected error occurred while fetching orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filtered orders based on search and status tabs
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (selectedStatus !== "all" && order.status !== selectedStatus) {
        return false;
      }

      // Search query filter (client-side)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
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
      }

      return true;
    });
  }, [orders, selectedStatus, searchQuery]);

  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      packed: orders.filter((o) => o.status === "packed").length,
      "out-for-delivery": orders.filter((o) => o.status === "out-for-delivery").length,
    };
  }, [orders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 border border-sky-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Confirmed
          </span>
        );
      case "packed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Packed
          </span>
        );
      case "out-for-delivery":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
            Out for Delivery
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {status}
          </span>
        );
    }
  };

  // LOADING SKELETON
  if (loading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-7 w-40 rounded-lg bg-slate-200" />
            <div className="h-4 w-60 rounded-md bg-slate-200" />
          </div>
          <div className="h-10 w-28 rounded-xl bg-slate-200" />
        </div>

        {/* Filter skeleton */}
        <div className="h-12 w-full rounded-2xl bg-slate-200" />

        {/* Table skeleton */}
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
      {/* ERROR ALERT */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchOrders(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:bg-red-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* TOP BAR: Heading, Count, and Refresh */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Active Orders
            </h1>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200/60">
              {orders.length} Active
            </span>
          </div>
          <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
            Deliveries assigned to you that are pending completion
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-60 sm:self-auto focus:outline-hidden"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Orders"}
        </button>
      </div>

      {/* SEARCH & STATUS FILTER STRIP */}
      <div className="space-y-3.5">
        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number, customer name, phone, or area..."
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

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: "all", label: "All Orders", count: statusCounts.all },
              { id: "confirmed", label: "Confirmed", count: statusCounts.confirmed },
              { id: "packed", label: "Packed", count: statusCounts.packed },
              { id: "out-for-delivery", label: "Out for Delivery", count: statusCounts["out-for-delivery"] },
            ] as const
          ).map((tab) => {
            const active = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white border border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ORDERS LIST CONTAINER */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        {filteredOrders.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-xs">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              {orders.length === 0 ? "No Active Orders" : "No Matching Orders Found"}
            </h3>
            <p className="mt-1 max-w-sm text-xs font-medium text-slate-500 leading-relaxed">
              {orders.length === 0
                ? "You currently have no active deliveries assigned. When new orders are allocated to you, they will display right here."
                : "No orders match your current search query or status filter. Try clearing the filter to see all active orders."}
            </p>
            {orders.length > 0 && (searchQuery || selectedStatus !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("all");
                }}
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
              >
                <X className="h-3.5 w-3.5" />
                Clear All Filters
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

                return (
                  <div key={order._id} className="p-4 space-y-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Order
                        </span>
                        <p className="text-sm font-bold text-slate-900 break-all">
                          #{order.orderNumber}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    {/* Customer & Amount Box */}
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
                          <a
                            href={`tel:${order.customer.phone}`}
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                          >
                            <Phone className="h-3 w-3" />
                            {order.customer.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="font-medium text-slate-500">Order Amount</span>
                        <span className="text-sm font-bold text-slate-900">
                          ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {addressStr && (
                      <p className="text-xs text-slate-600">
                        <span className="font-medium text-slate-400">Destination: </span>
                        {addressStr}
                      </p>
                    )}

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => navigate(`/delivery/orders/${order._id}`)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.99]"
                    >
                      <span>View Order & Deliver</span>
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

                    return (
                      <tr
                        key={order._id}
                        className="transition hover:bg-slate-50/60"
                      >
                        <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                          #{order.orderNumber}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-slate-900 truncate max-w-[180px]">
                            {order.customer?.name || "N/A"}
                          </p>
                          {order.customer?.phone && (
                            <a
                              href={`tel:${order.customer.phone}`}
                              className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 hover:underline"
                            >
                              <Phone className="h-3 w-3" />
                              {order.customer.phone}
                            </a>
                          )}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600 max-w-[240px] truncate">
                          {addressStr || "Address not specified"}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-slate-900 whitespace-nowrap">
                          ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => navigate(`/delivery/orders/${order._id}`)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                          >
                            <span>View Details</span>
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