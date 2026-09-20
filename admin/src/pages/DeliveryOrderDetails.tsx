import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";
import type { DeliveryOrderDetailsData, OrderItem } from "../types/delivery";

export default function DeliveryOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [order, setOrder] = useState<DeliveryOrderDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Delivery OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const logout = () => {
    localStorage.removeItem("deliveryToken");
    localStorage.removeItem("deliveryBoy");
    navigate("/");
  };

  const getConfig = () => {
    const token = localStorage.getItem("deliveryToken");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("deliveryToken");
      if (!token) {
        logout();
        return;
      }

      if (!id) {
        setError("Order ID is missing.");
        return;
      }

      const response = await axios.get(
        `${API_URL}/delivery/orders/${id}`,
        getConfig()
      );

      setOrder(response.data?.order || null);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          return;
        }
        setError(err.response?.data?.message || "Failed to load order details.");
        return;
      }
      setError("An unexpected error occurred while fetching the order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleSendOtp = async () => {
    try {
      setSendingOtp(true);
      setError("");
      setSuccess("");

      const response = await axios.post(
        `${API_URL}/delivery/orders/${id}/send-delivery-otp`,
        {},
        getConfig()
      );

      setOtpSent(true);
      setSuccess(
        response.data?.message || "Delivery OTP sent to customer email."
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          return;
        }
        setError(err.response?.data?.message || "Failed to send delivery OTP.");
        return;
      }
      setError("Unable to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      if (otp.trim().length !== 6) {
        setError("Please enter the complete 6-digit OTP.");
        return;
      }

      setVerifyingOtp(true);
      setError("");
      setSuccess("");

      const response = await axios.post(
        `${API_URL}/delivery/orders/${id}/verify-delivery-otp`,
        {
          otp: otp.trim(),
        },
        getConfig()
      );

      setSuccess(
        response.data?.message || "Delivery confirmed successfully!"
      );
      setOtp("");
      setOtpSent(false);

      // Re-fetch order to update status to "delivered"
      await fetchOrder();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
          return;
        }
        setError(err.response?.data?.message || "Invalid or expired OTP.");
        return;
      }
      setError("Unable to verify OTP. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

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
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 border border-sky-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Confirmed
          </span>
        );
      case "packed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Packed
          </span>
        );
      case "out-for-delivery":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
            Out for Delivery
          </span>
        );
      case "delivered":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Delivered
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {formatStatus(status)}
          </span>
        );
    }
  };

  const getFullAddress = () => {
    if (!order) return "N/A";
    const parts = [
      order.deliveryAddress?.houseNo,
      order.deliveryAddress?.street,
      order.deliveryAddress?.area,
      order.deliveryAddress?.city,
      order.deliveryAddress?.pincode,
    ].filter(Boolean);
    return parts.join(", ") || "No address provided";
  };

  const getMapUrl = () => {
    if (order?.mapUrl) {
      return order.mapUrl;
    }
    const lat = order?.deliveryLocation?.latitude;
    const lng = order?.deliveryLocation?.longitude;
    if (lat !== undefined && lng !== undefined) {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    if (order?.deliveryAddress?.street || order?.deliveryAddress?.city) {
      const query = encodeURIComponent(getFullAddress());
      return `https://www.google.com/maps/search/?api=1&query=${query}`;
    }
    return "";
  };

  const getSubtotal = (item: OrderItem) => {
    return item.subtotal ?? Number(item.price || 0) * Number(item.quantity || 1);
  };

  // Stepper calculations
  const steps = [
    { id: "confirmed", label: "Confirmed" },
    { id: "packed", label: "Packed" },
    { id: "out-for-delivery", label: "Out for Delivery" },
    { id: "delivered", label: "Delivered" },
  ];

  const getStepStatus = (stepId: string) => {
    const currentStatus = order?.status || "confirmed";
    const statusOrder = ["confirmed", "packed", "out-for-delivery", "delivered"];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const stepIndex = statusOrder.indexOf(stepId);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  };

  // SKELETON LOADING
  if (loading) {
    return (
      <div className="w-full space-y-6 animate-pulse">
        <div className="h-6 w-32 rounded-lg bg-slate-200" />
        <div className="h-28 w-full rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 rounded-2xl bg-slate-200" />
            <div className="h-64 rounded-2xl bg-slate-200" />
          </div>
          <div className="h-96 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  // ORDER NOT FOUND
  if (!order) {
    return (
      <div className="w-full space-y-4">
        <button
          type="button"
          onClick={() => navigate("/delivery/orders")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Active Orders
        </button>

        <div className="rounded-2xl border border-red-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Package className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">
            Order Unavailable
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {error || "This order could not be retrieved. It may not be assigned to your account."}
          </p>
          <button
            type="button"
            onClick={() => navigate("/delivery/orders")}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            Return to Active Orders
          </button>
        </div>
      </div>
    );
  }

  const mapUrl = getMapUrl();

  return (
    <div className="w-full space-y-6">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <button
          type="button"
          onClick={fetchOrder}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Order
        </button>
      </div>

      {/* ERROR & SUCCESS BANNERS */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm font-medium text-red-700 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs sm:text-sm font-medium text-emerald-800 shadow-xs">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span className="flex-1">{success}</span>
        </div>
      )}

      {/* ORDER HERO CARD */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-xs">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  Order #{order.orderNumber}
                </h1>
                {getStatusBadge(order.status)}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>
                  Placed:{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                  <CreditCard className="h-3 w-3" />
                  Paid Online
                </span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Order Value
            </span>
            <p className="text-2xl font-extrabold text-slate-900">
              ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* DELIVERY PROGRESS STEPPER */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-4">
            Delivery Lifecycle
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
            {steps.map((step, idx) => {
              const state = getStepStatus(step.id);
              return (
                <div
                  key={step.id}
                  className={`relative flex items-center gap-2.5 rounded-xl p-3 border transition ${
                    state === "completed"
                      ? "bg-emerald-50/60 border-emerald-200/80 text-emerald-900"
                      : state === "current"
                      ? "bg-blue-50 border-blue-300 text-blue-900 ring-2 ring-blue-500/10"
                      : "bg-slate-50 border-slate-200/60 text-slate-400"
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      state === "completed"
                        ? "bg-emerald-600 text-white"
                        : state === "current"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {state === "completed" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{step.label}</p>
                    <p className="text-[10px] opacity-75 capitalize">
                      {state === "completed"
                        ? "Completed"
                        : state === "current"
                        ? "In Progress"
                        : "Pending"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TWO COLUMN CONTENT LAYOUT */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* LEFT COLUMN: Customer, Address & Items (2 spans on xl) */}
        <div className="xl:col-span-2 space-y-6">
          {/* CUSTOMER & DESTINATION */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <div className="border-b border-slate-100 p-5">
              <h2 className="text-sm font-bold text-slate-900">
                Customer & Delivery Information
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Recipient contact details and destination address
              </p>
            </div>

            <div className="p-5 space-y-4">
              {/* Customer Contact Badges */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase text-slate-400">
                      Customer
                    </span>
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {order.customer?.name || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase text-slate-400">
                      Phone Number
                    </span>
                    {order.customer?.phone ? (
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="block text-xs font-bold text-blue-600 hover:underline truncate"
                      >
                        {order.customer.phone}
                      </a>
                    ) : (
                      <p className="text-xs font-bold text-slate-900">N/A</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase text-slate-400">
                      Email Address
                    </span>
                    {order.customer?.email ? (
                      <a
                        href={`mailto:${order.customer.email}`}
                        className="block text-xs font-bold text-blue-600 hover:underline truncate"
                      >
                        {order.customer.email}
                      </a>
                    ) : (
                      <p className="text-xs font-bold text-slate-900">N/A</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Address Card */}
              <div className="rounded-xl border border-slate-200/80 p-4 bg-slate-50/50">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Delivery Address
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-slate-800 leading-relaxed">
                      {getFullAddress()}
                    </p>

                    {/* Coordinates */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>Lat: {order.deliveryLocation?.latitude ?? "N/A"}</span>
                      <span>•</span>
                      <span>Lng: {order.deliveryLocation?.longitude ?? "N/A"}</span>
                    </div>

                    {/* Google Maps Button */}
                    {mapUrl && (
                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3.5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-slate-800"
                      >
                        <MapPin className="h-3.5 w-3.5 text-red-400" />
                        <span>Navigate in Google Maps</span>
                        <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ORDER ITEMS LIST */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <div className="border-b border-slate-100 p-5">
              <h2 className="text-sm font-bold text-slate-900">Order Items</h2>
              <p className="text-xs font-medium text-slate-500">
                Products and package quantities to deliver
              </p>
            </div>

            {/* Mobile View (< md): Stacked Cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {order.items?.map((item, idx) => (
                <div key={item._id || idx} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {item.name || item.product?.name || "Water Product"}
                        </p>
                        {item.product?.size !== undefined && (
                          <p className="text-[11px] text-slate-500">
                            {item.product.size} {item.product.unit || "L"}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      ₹{Number(getSubtotal(item)).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="capitalize text-slate-500 font-medium">
                      {item.purchaseType?.replace(/-/g, " ") || "Standard"}
                    </span>
                    <span className="font-semibold text-slate-700">
                      Qty: {item.quantity} × ₹{Number(item.price || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View (>= md): Table */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-6">Product</th>
                    <th className="py-3 px-6">Type</th>
                    <th className="py-3 px-6 text-center">Qty</th>
                    <th className="py-3 px-6 text-right">Price</th>
                    <th className="py-3 px-6 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {order.items?.map((item, idx) => (
                    <tr key={item._id || idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-6">
                        <p className="font-bold text-slate-900">
                          {item.name || item.product?.name || "Water Product"}
                        </p>
                        {item.product?.size !== undefined && (
                          <p className="text-xs text-slate-500">
                            {item.product.size} {item.product.unit || "L"}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-xs capitalize text-slate-600">
                        {item.purchaseType?.replace(/-/g, " ") || "Standard"}
                      </td>
                      <td className="py-3.5 px-6 text-center font-bold text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-3.5 px-6 text-right text-xs text-slate-600">
                        ₹{Number(item.price || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-6 text-right font-bold text-slate-900">
                        ₹{Number(getSubtotal(item)).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/75 p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Grand Total Amount
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Delivery Action Card (Sticky on desktop) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs xl:sticky xl:top-24">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Fulfillment Action
                  </h2>
                  <p className="text-xs font-medium text-slate-500">
                    OTP Delivery Verification
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              {/* STATE 1: ALREADY DELIVERED */}
              {order.status === "delivered" ? (
                <div className="text-center py-4 space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Delivery Completed
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      This order has been verified and safely handed over to the customer.
                    </p>
                  </div>
                  {order.deliveredAt && (
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">Delivered On: </span>
                      {new Date(order.deliveredAt).toLocaleString("en-IN")}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate("/delivery/delivered")}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                  >
                    <span>View Delivered Orders</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : order.status !== "out-for-delivery" ? (
                /* STATE 2: NOT OUT FOR DELIVERY YET */
                <div className="space-y-3 py-2">
                  <div className="flex items-start gap-3 rounded-xl bg-amber-50 p-4 border border-amber-200/80">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">
                        Awaiting Route Dispatch
                      </p>
                      <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                        This order is currently{" "}
                        <span className="font-bold underline uppercase">
                          {order.status}
                        </span>
                        . It must be updated to{" "}
                        <span className="font-bold">Out for Delivery</span> by the admin before customer OTP verification can take place.
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    Once marked Out for Delivery, you can send the OTP to the customer upon arrival.
                  </p>
                </div>
              ) : !otpSent ? (
                /* STATE 3: OUT FOR DELIVERY & OTP NOT YET TRIGGERED */
                <div className="space-y-4 py-2">
                  <div className="flex items-center gap-3 rounded-xl bg-blue-50/70 p-3.5 border border-blue-100">
                    <ShieldCheck className="h-6 w-6 text-blue-600 shrink-0" />
                    <div className="min-w-0 text-xs">
                      <p className="font-bold text-slate-900">Ready to Deliver?</p>
                      <p className="text-slate-500">
                        Confirm you are at the customer's delivery destination.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs">
                    <span className="text-[11px] font-bold uppercase text-slate-400">
                      OTP will be sent to:
                    </span>
                    <p className="mt-0.5 font-bold text-slate-800 break-all">
                      {order.customer?.email || "No email on record"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || !order.customer?.email}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingOtp ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Sending Delivery OTP...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Send Customer OTP</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    A secure 6-digit OTP will be generated and emailed to the customer. Valid for 5 minutes.
                  </p>
                </div>
              ) : (
                /* STATE 4: OTP SENT - AWAITING VERIFICATION */
                <div className="space-y-4 py-2">
                  <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3 border border-emerald-200">
                    <Mail className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold text-emerald-900">OTP Sent Successfully!</p>
                      <p className="text-emerald-700 text-[11px]">
                        Ask customer for the code sent to {order.customer?.email}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="delivery-otp-input"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5"
                    >
                      Enter 6-Digit OTP
                    </label>
                    <input
                      id="delivery-otp-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="• • • • • •"
                      className="w-full text-center tracking-[0.35em] text-xl font-bold py-3 rounded-xl border border-slate-300 bg-slate-50/50 text-slate-900 shadow-xs focus:bg-white focus:border-blue-500 focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 transition"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp || otp.length !== 6}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyingOtp ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Verify & Complete Delivery</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    <RefreshCw className={`h-3 w-3 ${sendingOtp ? "animate-spin" : ""}`} />
                    <span>Resend OTP</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}