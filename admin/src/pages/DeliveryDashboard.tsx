import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Package,
  RefreshCw,
  Truck,
} from "lucide-react";
import type { DeliveryOrder } from "../types/delivery";

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [activeOrders, setActiveOrders] = useState<DeliveryOrder[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const logout = () => {
    localStorage.removeItem("deliveryToken");
    localStorage.removeItem("deliveryBoy");
    navigate("/");
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("deliveryToken");
      if (!token) {
        logout();
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [activeResponse, deliveredResponse] = await Promise.all([
        axios.get(`${API_URL}/delivery/orders/active`, config),
        axios.get(`${API_URL}/delivery/orders/delivered`, config),
      ]);

      setActiveOrders(activeResponse.data?.orders || []);
      setDeliveredOrders(deliveredResponse.data?.orders || []);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          return;
        }
        setError(err.response?.data?.message || "Failed to load dashboard data.");
        return;
      }
      setError("An unexpected error occurred while loading dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const confirmedOrders = activeOrders.filter(
    (order) => order.status === "confirmed"
  ).length;

  const packedOrders = activeOrders.filter(
    (order) => order.status === "packed"
  ).length;

  const outForDeliveryOrders = activeOrders.filter(
    (order) => order.status === "out-for-delivery"
  ).length;

  const isToday = (dateString?: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const deliveredToday = deliveredOrders.filter((order) =>
    isToday(order.deliveredAt || order.createdAt)
  ).length;

  const recentOrders = activeOrders.slice(0, 5);

  const formatStatus = (status: string) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

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
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Delivered
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {formatStatus(status)}
          </span>
        );
    }
  };

  // SKELETON LOADING STATE
  if (loading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-2">
          <div className="h-7 w-48 rounded-lg bg-slate-200" />
          <div className="h-4 w-72 rounded-lg bg-slate-200" />
        </div>

        {/* 4 Stat Cards Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-3">
                  <div className="h-4 w-24 rounded-md bg-slate-200" />
                  <div className="h-8 w-16 rounded-md bg-slate-200" />
                </div>
                <div className="h-11 w-11 rounded-xl bg-slate-200" />
              </div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="h-6 w-36 rounded-md bg-slate-200" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchDashboard}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:bg-red-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Page Title & Refresh */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Delivery Overview
          </h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
            Monitor real-time delivery status and active route assignments
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDashboard}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 sm:self-auto focus:outline-hidden"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          Refresh Data
        </button>
      </div>

      {/* SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Active Orders */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Orders
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {activeOrders.length}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Currently assigned
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-xs">
              <Package className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Needs fulfillment</span>
            <button
              type="button"
              onClick={() => navigate("/delivery/orders")}
              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
            >
              View orders <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Out For Delivery */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Out for Delivery
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-blue-600">
                {outForDeliveryOrders}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                In transit to customer
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
              <Truck className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">OTP required</span>
            <span className="font-semibold text-indigo-600">Active transit</span>
          </div>
        </div>

        {/* Card 3: Delivered Today */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Delivered Today
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-emerald-600">
                {deliveredToday}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Completed today
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
              <Clock3 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Today's deliveries</span>
            <span className="font-semibold text-emerald-600">Verified</span>
          </div>
        </div>

        {/* Card 4: Total Delivered */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Delivered
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {deliveredOrders.length}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Lifetime fulfilled
              </p>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-xs">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Fulfilled history</span>
            <button
              type="button"
              onClick={() => navigate("/delivery/delivered")}
              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
            >
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* STATUS BREAKDOWN STRIP */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Active Pipeline Breakdown
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-sky-500" />
              <div>
                <p className="text-xs font-semibold text-slate-500">Confirmed Orders</p>
                <p className="text-lg font-bold text-slate-900">{confirmedOrders}</p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400">Awaiting packing</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <div>
                <p className="text-xs font-semibold text-slate-500">Packed Orders</p>
                <p className="text-lg font-bold text-slate-900">{packedOrders}</p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400">Ready for pickup</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
              <div>
                <p className="text-xs font-semibold text-slate-500">Out for Delivery</p>
                <p className="text-lg font-bold text-blue-600">{outForDeliveryOrders}</p>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-400">On the road</span>
          </div>
        </div>
      </div>

      {/* RECENT ASSIGNED DELIVERIES */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Active Deliveries
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Orders requiring attention and delivery execution
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/delivery/orders")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
          >
            <span>View All Active Orders ({activeOrders.length})</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-xs">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              No Active Orders Assigned
            </h3>
            <p className="mt-1 max-w-sm text-xs font-medium text-slate-500 leading-relaxed">
              You are all caught up! When the administrator assigns new orders to your route, they will show up here immediately.
            </p>
            <button
              type="button"
              onClick={fetchDashboard}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Check for Updates
            </button>
          </div>
        ) : (
          <>
            {/* MOBILE CARDS VIEW (< md) */}
            <div className="divide-y divide-slate-100 md:hidden">
              {recentOrders.map((order) => {
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
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Order Number
                        </span>
                        <p className="text-sm font-bold text-slate-900 break-all">
                          #{order.orderNumber}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 font-medium">Customer</span>
                        <p className="font-semibold text-slate-800 truncate">
                          {order.customer?.name || "N/A"}
                        </p>
                        <p className="text-slate-500 font-mono text-[11px] truncate">
                          {order.customer?.phone || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-medium">Total Amount</span>
                        <p className="text-sm font-bold text-slate-900">
                          ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {addressStr && (
                      <p className="text-xs text-slate-500 truncate">
                        <span className="font-medium text-slate-700">Address: </span>
                        {addressStr}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate(`/delivery/orders/${order._id}`)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 py-2.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                    >
                      <span>View Details & Confirm</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP TABLE VIEW (>= md) */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Order</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Delivery Address</th>
                    <th className="py-3.5 px-6 text-right">Amount</th>
                    <th className="py-3.5 px-6 text-center">Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {recentOrders.map((order) => {
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
                          <p className="text-xs font-mono text-slate-500">
                            {order.customer?.phone || "N/A"}
                          </p>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600 max-w-[220px] truncate">
                          {addressStr || "Address not provided"}
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