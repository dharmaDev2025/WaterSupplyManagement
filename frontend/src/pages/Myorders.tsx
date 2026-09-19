import {
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface IconProps {
  className?: string;
}

const createIcon = (content: ReactNode) =>
  ({ className }: IconProps) => (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {content}
    </svg>
  );

const CheckCircle2 = createIcon(
  <>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </>
);
const Clock = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>
);
const Package = createIcon(
  <>
    <path d="m16.5 9.4-9-5.19" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </>
);
const Phone = createIcon(
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z" />
);
const Truck = createIcon(
  <>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </>
);
const User = createIcon(
  <>
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </>
);
const X = createIcon(
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>
);

interface OrderItem {
  product:
    | string
    | {
        _id: string;
        name: string;
        productType: string;
        size: number;
        unit: string;
      };

  name: string;
  purchaseType: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  deliveredAt?: string | null;
}

interface DeliveryBoy {
  name: string;
  phone: string;
}

interface TrackingOrder {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  orderDate: string;
  deliveredAt?: string | null;
  deliveryBoy?: DeliveryBoy | null;
}

interface ReorderItem {
  productId: string;
  purchaseType: string;
  quantity: number;
}

const MyOrders = () => {
  const navigate =
    useNavigate();

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string>("");

  const [
    selectedOrder,
    setSelectedOrder,
  ] =
    useState<TrackingOrder | null>(
      null
    );

  const [
    trackingLoading,
    setTrackingLoading,
  ] =
    useState<string | null>(
      null
    );

  const [
    reorderLoading,
    setReorderLoading,
  ] =
    useState<string | null>(
      null
    );

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            "/orders/my-orders"
          );

        setOrders(
          response.data.orders ||
            []
        );
      } catch (error: any) {
        setError(
          error.response?.data
            ?.message ||
            "Unable to fetch your orders"
        );
      } finally {
        setLoading(false);
      }
    };

  const handleTrackOrder =
    async (
      orderId: string
    ) => {
      try {
        setTrackingLoading(
          orderId
        );

        setError("");

        const response =
          await api.get(
            `/orders/${orderId}/status`
          );

        setSelectedOrder(
          response.data.order
        );
      } catch (error: any) {
        setError(
          error.response?.data
            ?.message ||
            "Unable to track order"
        );
      } finally {
        setTrackingLoading(
          null
        );
      }
    };

  const handleReorder =
    async (
      orderId: string
    ) => {
      try {
        setReorderLoading(
          orderId
        );

        setError("");

        const response =
          await api.post(
            `/orders/${orderId}/reorder`
          );

        const reorderItems:
          ReorderItem[] =
          response.data.items ||
          [];

        if (
          reorderItems.length ===
          0
        ) {
          setError(
            "No products found in this order"
          );

          return;
        }

        sessionStorage.setItem(
          "reorderItems",
          JSON.stringify(
            reorderItems
          )
        );

        sessionStorage.setItem(
          "checkoutOrderType",
          "reorder"
        );

        navigate(
          "/checkout",
          {
            state: {
              orderType:
                "reorder",
            },
          }
        );
      } catch (error: any) {
        setError(
          error.response?.data
            ?.message ||
            "Unable to reorder"
        );
      } finally {
        setReorderLoading(
          null
        );
      }
    };

  const formatStatus = (
    status: string
  ) => {
    if (!status) {
      return "";
    }

    return status
      .split("-")
      .map(
        (word) =>
          word
            .charAt(0)
            .toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) {
      return "N/A";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusStyle = (
    status: string
  ) => {
    switch (status) {
      case "pending":
        return "bg-gray-50 text-gray-700 border-gray-200";

      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "assigned":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";

      case "packed":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "out-for-delivery":
        return "bg-purple-50 text-purple-700 border-purple-200";

      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";

      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (
    status: string
  ) => {
    if (
      status === "delivered"
    ) {
      return (
        <CheckCircle2 className="h-5 w-5 text-green-600" />
      );
    }

    if (
      status ===
      "out-for-delivery"
    ) {
      return (
        <Truck className="h-5 w-5 text-purple-600" />
      );
    }

    if (
      status === "packed"
    ) {
      return (
        <Package className="h-5 w-5 text-yellow-600" />
      );
    }

    return (
      <Clock className="h-5 w-5 text-blue-600" />
    );
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 pb-16 pt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="mb-1 text-sm font-semibold text-blue-600">
              YOUR PURCHASES
            </p>

            <h1 className="text-3xl font-bold text-gray-900">
              My Orders
            </h1>

            <p className="mt-2 text-gray-500">
              View, track and
              reorder your previous
              water orders.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
              <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

              <p className="text-gray-500">
                Loading your
                orders...
              </p>
            </div>
          ) : orders.length ===
            0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <div className="mb-4 text-5xl">
                📦
              </div>

              <h2 className="mb-2 text-xl font-bold text-gray-900">
                No orders yet
              </h2>

              <p className="mb-6 text-gray-500">
                You haven't placed
                any orders yet.
              </p>

              <button
                onClick={() =>
                  navigate(
                    "/products"
                  )
                }
                className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map(
                (order) => (
                  <div
                    key={
                      order._id
                    }
                    className="rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Order
                            Number
                          </p>

                          <h2 className="mt-1 font-bold text-gray-900">
                            {
                              order.orderNumber
                            }
                          </h2>

                          <p className="mt-1 text-sm text-gray-500">
                            {formatDate(
                              order.createdAt
                            )}
                          </p>
                        </div>

                        <span
                          className={`self-start rounded-full border px-3 py-1.5 text-sm font-semibold sm:self-auto ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {formatStatus(
                            order.status
                          )}
                        </span>
                      </div>

                      <div className="space-y-3 py-5">
                        {order.items.map(
                          (
                            item,
                            index
                          ) => (
                            <div
                              key={
                                index
                              }
                              className="flex items-center justify-between gap-4"
                            >
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {
                                    item.name
                                  }
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                  {formatStatus(
                                    item.purchaseType
                                  )}{" "}
                                  ×{" "}
                                  {
                                    item.quantity
                                  }
                                </p>
                              </div>

                              <p className="font-semibold text-gray-800">
                                ₹
                                {item.subtotal ??
                                  item.price *
                                    item.quantity}
                              </p>
                            </div>
                          )
                        )}
                      </div>

                      <div className="flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs text-gray-500">
                            Total
                            Amount
                          </p>

                          <p className="text-xl font-bold text-gray-900">
                            ₹
                            {
                              order.totalAmount
                            }
                          </p>

                          <p className="mt-1 text-xs font-semibold text-green-600">
                            Payment{" "}
                            {formatStatus(
                              order.paymentStatus
                            )}
                          </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button
                            onClick={() =>
                              handleTrackOrder(
                                order._id
                              )
                            }
                            disabled={
                              trackingLoading ===
                              order._id
                            }
                            className="rounded-xl border border-blue-600 px-5 py-2.5 font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {trackingLoading ===
                            order._id
                              ? "Checking..."
                              : "Track Order"}
                          </button>

                          <button
                            onClick={() =>
                              handleReorder(
                                order._id
                              )
                            }
                            disabled={
                              reorderLoading ===
                              order._id
                            }
                            className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {reorderLoading ===
                            order._id
                              ? "Preparing..."
                              : "Reorder"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-gray-100 p-6">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Track Order
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {
                    selectedOrder.orderNumber
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(
                    null
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-5 flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                  {getStatusIcon(
                    selectedOrder.status
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Current Order
                    Status
                  </p>

                  <span
                    className={`mt-1 inline-block rounded-full border px-3 py-1 text-sm font-semibold ${getStatusStyle(
                      selectedOrder.status
                    )}`}
                  >
                    {formatStatus(
                      selectedOrder.status
                    )}
                  </span>
                </div>
              </div>

              {selectedOrder.deliveryBoy ? (
                <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />

                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                      Your Delivery
                      Partner
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />

                        <p className="font-bold text-gray-900">
                          {
                            selectedOrder
                              .deliveryBoy
                              .name
                          }
                        </p>
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />

                        <p className="text-sm font-medium text-gray-600">
                          {
                            selectedOrder
                              .deliveryBoy
                              .phone
                          }
                        </p>
                      </div>
                    </div>

                    <a
                      href={`tel:${selectedOrder.deliveryBoy.phone}`}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Phone className="h-4 w-4" />

                      Call
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <Truck className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />

                    <div>
                      <p className="font-semibold text-gray-700">
                        Delivery
                        Partner
                      </p>

                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        A delivery
                        partner has not
                        been assigned
                        to this order
                        yet.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                  <span className="text-gray-500">
                    Payment Status
                  </span>

                  <span className="font-semibold text-green-600">
                    {formatStatus(
                      selectedOrder.paymentStatus
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                  <span className="text-gray-500">
                    Order Date
                  </span>

                  <span className="text-right font-medium text-gray-800">
                    {formatDate(
                      selectedOrder.orderDate
                    )}
                  </span>
                </div>

                {selectedOrder.deliveredAt && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      Delivered At
                    </span>

                    <span className="text-right font-medium text-gray-800">
                      {formatDate(
                        selectedOrder.deliveredAt
                      )}
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedOrder(
                    null
                  )
                }
                className="mt-6 w-full rounded-xl bg-gray-900 py-3 font-semibold text-white transition hover:bg-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default MyOrders;