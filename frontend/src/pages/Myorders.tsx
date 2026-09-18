import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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

interface TrackingOrder {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  orderDate: string;
  deliveredAt?: string | null;
}

interface ReorderItem {
  productId: string;
  purchaseType: string;
  quantity: number;
}

const MyOrders = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedOrder, setSelectedOrder] =
    useState<TrackingOrder | null>(null);
  const [trackingLoading, setTrackingLoading] =
    useState<string | null>(null);
  const [reorderLoading, setReorderLoading] =
    useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/orders/my-orders"
      );

      setOrders(response.data.orders || []);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Unable to fetch your orders"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = async (
    orderId: string
  ) => {
    try {
      setTrackingLoading(orderId);
      setError("");

      const response = await api.get(
        `/orders/${orderId}/status`
      );

      setSelectedOrder(response.data.order);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Unable to track order"
      );
    } finally {
      setTrackingLoading(null);
    }
  };

  const handleReorder = async (orderId: string) => {
  try {
    setReorderLoading(orderId);
    setError("");

    const response = await api.post(
      `/orders/${orderId}/reorder`
    );

    const reorderItems = response.data.items || [];

    if (reorderItems.length === 0) {
      setError("No products found in this order");
      return;
    }

    sessionStorage.setItem(
      "reorderItems",
      JSON.stringify(reorderItems)
    );

    sessionStorage.setItem(
      "checkoutOrderType",
      "reorder"
    );

    navigate("/checkout", {
      state: {
        orderType: "reorder",
      },
    });
  } catch (error: any) {
    setError(
      error.response?.data?.message ||
        "Unable to reorder"
    );
  } finally {
    setReorderLoading(null);
  }
};

  const formatStatus = (
    status: string
  ) => {
    if (!status) return "";

    return status
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString(
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

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold text-blue-600 mb-1">
              YOUR PURCHASES
            </p>

            <h1 className="text-3xl font-bold text-gray-900">
              My Orders
            </h1>

            <p className="text-gray-500 mt-2">
              View, track and reorder your previous water orders.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <div className="w-9 h-9 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

              <p className="text-gray-500">
                Loading your orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
              <div className="text-5xl mb-4">
                📦
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                No orders yet
              </h2>

              <p className="text-gray-500 mb-6">
                You haven't placed any orders yet.
              </p>

              <button
                onClick={() =>
                  navigate("/products")
                }
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Order Number
                        </p>

                        <h2 className="font-bold text-gray-900 mt-1">
                          {order.orderNumber}
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(
                            order.createdAt
                          )}
                        </p>
                      </div>

                      <span
                        className={`self-start sm:self-auto px-3 py-1.5 rounded-full border text-sm font-semibold ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {formatStatus(
                          order.status
                        )}
                      </span>
                    </div>

                    <div className="py-5 space-y-3">
                      {order.items.map(
                        (item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-4"
                          >
                            <div>
                              <p className="font-semibold text-gray-800">
                                {item.name}
                              </p>

                              <p className="text-sm text-gray-500 mt-1">
                                {formatStatus(
                                  item.purchaseType
                                )}{" "}
                                × {item.quantity}
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

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-100 pt-5">
                      <div>
                        <p className="text-xs text-gray-500">
                          Total Amount
                        </p>

                        <p className="text-xl font-bold text-gray-900">
                          ₹{order.totalAmount}
                        </p>

                        <p className="text-xs text-green-600 font-semibold mt-1">
                          Payment{" "}
                          {formatStatus(
                            order.paymentStatus
                          )}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
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
                          className="px-5 py-2.5 border border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">
                  Track Order
                </p>

                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  {selectedOrder.orderNumber}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              >
                ✕
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-sm text-gray-500 mb-2">
                Current Order Status
              </p>

              <span
                className={`inline-block px-3 py-1.5 rounded-full border text-sm font-semibold ${getStatusStyle(
                  selectedOrder.status
                )}`}
              >
                {formatStatus(
                  selectedOrder.status
                )}
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-100 pb-3">
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

                <span className="font-medium text-gray-800 text-right">
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

                  <span className="font-medium text-gray-800 text-right">
                    {formatDate(
                      selectedOrder.deliveredAt
                    )}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={() =>
                setSelectedOrder(null)
              }
              className="w-full mt-6 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-black transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default MyOrders;