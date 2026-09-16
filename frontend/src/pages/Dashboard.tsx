import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface Order {
  _id: string;
  orderNumber?: string;
  totalAmount?: number;
  status?: string;
  createdAt?: string;
}

function Dashboard() {
  const navigate = useNavigate();

  // Get authentication data from AuthContext
  const { user, logout, loading } = useAuth();

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] =
    useState<boolean>(true);

  // ==========================================
  // FETCH USER ORDERS
  // ==========================================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);

        // No need to manually send token.
        // api.ts automatically sends:
        // Authorization: Bearer <token>

        const response = await api.get("/my-orders");

        console.log("Orders Response:", response.data);

        const orderData =
          response.data.orders ||
          response.data.data ||
          [];

        setOrders(orderData);
      } catch (error) {
        console.log("Fetch Orders Error:", error);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();

    navigate("/");
  };

  // ==========================================
  // AUTH LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-lg font-semibold text-gray-600">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ======================================= */}
      {/* NAVBAR */}
      {/* ======================================= */}

      <nav className="border-b border-gray-200 bg-white shadow-sm">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo */}

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">

              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
              >
                <path
                  d="M12 2C12 2 5 9.2 5 14.3C5 18.6 8.1 22 12 22C15.9 22 19 18.6 19 14.3C19 9.2 12 2 12 2Z"
                  fill="white"
                />
              </svg>

            </div>

            <h2 className="text-xl font-bold text-gray-900">
              AquaFlow
            </h2>

          </div>

          {/* Right Side */}

          <div className="flex items-center gap-4">

            <button
              onClick={() => navigate("/profile")}
              className="hidden text-sm font-semibold text-gray-600 transition hover:text-blue-600 sm:block"
            >
              Profile
            </button>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              Logout
            </button>

          </div>

        </div>

      </nav>

      {/* ======================================= */}
      {/* MAIN CONTENT */}
      {/* ======================================= */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Welcome Section */}

        <div className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Customer Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Welcome, {user?.name || "Customer"}
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your water orders and account details.
          </p>

        </div>

        {/* ======================================= */}
        {/* CUSTOMER DETAILS */}
        {/* ======================================= */}

        <div className="mb-8 grid gap-6 md:grid-cols-3">

          {/* Customer */}

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

            <p className="text-sm text-gray-500">
              Customer
            </p>

            <h3 className="mt-2 text-lg font-bold text-gray-900">
              {user?.name || "-"}
            </h3>

          </div>

          {/* Email */}

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

            <p className="text-sm text-gray-500">
              Email
            </p>

            <h3 className="mt-2 break-all text-lg font-bold text-gray-900">
              {user?.email || "-"}
            </h3>

          </div>

          {/* Customer Type */}

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

            <p className="text-sm text-gray-500">
              Customer Type
            </p>

            <h3 className="mt-2 text-lg font-bold capitalize text-gray-900">
              {user?.customerType || "-"}
            </h3>

          </div>

        </div>

        {/* ======================================= */}
        {/* QUICK ACTIONS */}
        {/* ======================================= */}

        <div className="mb-8">

          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Quick Actions
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {/* Products */}

            <button
              onClick={() => navigate("/products")}
              className="rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">

                <span className="text-xl">💧</span>

              </div>

              <h3 className="font-bold text-gray-900">
                Order Water
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Browse available water products.
              </p>

            </button>

            {/* Orders */}

            <button
              onClick={() => navigate("/orders")}
              className="rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">

                <span className="text-xl">📦</span>

              </div>

              <h3 className="font-bold text-gray-900">
                My Orders
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Check your previous and current orders.
              </p>

            </button>

            {/* Profile */}

            <button
              onClick={() => navigate("/profile")}
              className="rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">

                <span className="text-xl">👤</span>

              </div>

              <h3 className="font-bold text-gray-900">
                Profile
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                View and update your account details.
              </p>

            </button>

            {/* Location */}

            <button
              onClick={() => navigate("/profile")}
              className="rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >

              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">

                <span className="text-xl">📍</span>

              </div>

              <h3 className="font-bold text-gray-900">
                Location
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Manage your delivery location.
              </p>

            </button>

          </div>

        </div>

        {/* ======================================= */}
        {/* RECENT ORDERS */}
        {/* ======================================= */}

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold text-gray-900">
                Recent Orders
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your latest water orders.
              </p>

            </div>

            <button
              onClick={() => navigate("/orders")}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              View All
            </button>

          </div>

          {/* Loading */}

          {ordersLoading && (
            <p className="py-8 text-center text-gray-500">
              Loading orders...
            </p>
          )}

          {/* No Orders */}

          {!ordersLoading && orders.length === 0 && (

            <div className="py-12 text-center">

              <div className="mb-3 text-4xl">
                📦
              </div>

              <h3 className="font-bold text-gray-900">
                No orders yet
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Place your first water order.
              </p>

              <button
                onClick={() => navigate("/products")}
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Order Water
              </button>

            </div>

          )}

          {/* Order List */}

          {!ordersLoading && orders.length > 0 && (

            <div className="space-y-4">

              {orders.slice(0, 5).map((order) => (

                <div
                  key={order._id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center"
                >

                  <div>

                    <p className="font-semibold text-gray-900">
                      Order #
                      {order.orderNumber ||
                        order._id.slice(-6)}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString()
                        : ""}
                    </p>

                  </div>

                  <div className="flex items-center gap-6">

                    <div>

                      <p className="text-xs text-gray-400">
                        Amount
                      </p>

                      <p className="font-semibold text-gray-900">
                        ₹{order.totalAmount || 0}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-gray-400">
                        Status
                      </p>

                      <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                        {order.status || "pending"}
                      </span>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

export default Dashboard;