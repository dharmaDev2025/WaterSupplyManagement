import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Boxes,
  ChevronRight,
  ClipboardList,
  PackageCheck,
  ShoppingCart,
  Truck,
  Users,
  IndianRupee,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import Dashboard from "../components/Dashboard";

interface Product {
  _id: string;
  name: string;
  stock: number;
  isActive: boolean;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
}

interface DeliveryBoy {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  activeOrders?: number;
  deliveredOrders?: number;
  totalOrders?: number;
}

interface OrderCustomer {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface OrderDeliveryBoy {
  _id: string;
  name: string;
  phone: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: OrderCustomer | null;
  deliveryBoy: OrderDeliveryBoy | null;
  totalAmount: number;
  paymentStatus: string;
  status:
    | "confirmed"
    | "packed"
    | "out-for-delivery"
    | "delivered";
  createdAt: string;
}

function AdminDashboard() {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deliveryBoys, setDeliveryBoys] =
    useState<DeliveryBoy[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
    return localStorage.getItem("adminToken");
  };

  const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    sessionStorage.removeItem("adminEmail");

    navigate("/");
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        logoutAdmin();
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [
        productsResponse,
        ordersResponse,
        customersResponse,
        deliveryBoysResponse,
      ] = await Promise.all([
        axios.get(
          `${API_URL}/admin/products`,
          config
        ),
        axios.get(
          `${API_URL}/admin/orders`,
          config
        ),
        axios.get(
          `${API_URL}/admin/customers`,
          config
        ),
        axios.get(
          `${API_URL}/admin/delivery-boys`,
          config
        ),
      ]);

      setProducts(
        productsResponse.data.products || []
      );

      setOrders(
        ordersResponse.data.orders || []
      );

      setCustomers(
        customersResponse.data.customers || []
      );

      setDeliveryBoys(
        deliveryBoysResponse.data.deliveryBoys || []
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (
          error.response?.status === 401 ||
          error.response?.status === 403
        ) {
          logoutAdmin();
          return;
        }

        setError(
          error.response?.data?.message ||
            "Unable to load dashboard"
        );

        return;
      }

      setError("Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalProducts = products.length;

  const activeProducts = products.filter(
    (product) => product.isActive
  ).length;

  const totalStock = products.reduce(
    (total, product) =>
      total + (Number(product.stock) || 0),
    0
  );

  const totalOrders = orders.length;

  const activeOrders = orders.filter(
    (order) => order.status !== "delivered"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.isActive
  ).length;

  const totalDeliveryBoys = deliveryBoys.length;

  const activeDeliveryBoys = deliveryBoys.filter(
    (deliveryBoy) => deliveryBoy.isActive
  ).length;

  const totalRevenue = orders
    .filter(
      (order) => order.paymentStatus === "paid"
    )
    .reduce(
      (total, order) =>
        total + (Number(order.totalAmount) || 0),
      0
    );

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const formatStatus = (status: string) => {
    return status
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusStyle = (status: string) => {
    if (status === "confirmed") {
      return "bg-blue-50 text-blue-700";
    }

    if (status === "packed") {
      return "bg-orange-50 text-orange-700";
    }

    if (status === "out-for-delivery") {
      return "bg-purple-50 text-purple-700";
    }

    if (status === "delivered") {
      return "bg-green-50 text-green-700";
    }

    return "bg-gray-100 text-gray-600";
  };

  if (loading) {
    return (
      <Dashboard
        title="Dashboard"
        subtitle="Welcome back to AquaFlow Admin"
      >
        <div className="flex min-h-[400px] items-center justify-center sm:min-h-[500px]">
          <div className="text-center">
            <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="mt-4 text-sm font-medium text-gray-500">
              Loading dashboard...
            </p>
          </div>
        </div>
      </Dashboard>
    );
  }

  return (
    <Dashboard
      title="Dashboard"
      subtitle="Welcome back to AquaFlow Admin"
    >
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 sm:mb-6">
          {error}
        </div>
      )}

      <div className="mb-6 sm:mb-8">
        <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Overview
        </h3>

        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Monitor and manage your water supply operations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 min-[500px]:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        <button
          type="button"
          onClick={() =>
            navigate("/admin/products")
          }
          className="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
        >
          <div className="mb-4 flex items-center justify-between sm:mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 sm:h-12 sm:w-12">
              <Boxes className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
            </div>

            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
              Products
            </span>
          </div>

          <p className="text-xs font-medium text-gray-500 sm:text-sm">
            Total Products
          </p>

          <h3 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            {totalProducts}
          </h3>

          <p className="mt-3 text-xs text-gray-400">
            {activeProducts} active • {totalStock} stock
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/orders")
          }
          className="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
        >
          <div className="mb-4 flex items-center justify-between sm:mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 sm:h-12 sm:w-12">
              <ClipboardList className="h-5 w-5 text-orange-500 sm:h-6 sm:w-6" />
            </div>

            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-500">
              Orders
            </span>
          </div>

          <p className="text-xs font-medium text-gray-500 sm:text-sm">
            Active Orders
          </p>

          <h3 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            {activeOrders}
          </h3>

          <p className="mt-3 text-xs text-gray-400">
            {totalOrders} total •{" "}
            {deliveredOrders} delivered
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/customers")
          }
          className="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
        >
          <div className="mb-4 flex items-center justify-between sm:mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 sm:h-12 sm:w-12">
              <Users className="h-5 w-5 text-green-600 sm:h-6 sm:w-6" />
            </div>

            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600">
              Customers
            </span>
          </div>

          <p className="text-xs font-medium text-gray-500 sm:text-sm">
            Total Customers
          </p>

          <h3 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            {totalCustomers}
          </h3>

          <p className="mt-3 text-xs text-gray-400">
            {activeCustomers} active customers
          </p>
        </button>

        <button
          type="button"
          onClick={() =>
            navigate("/admin/delivery-boys")
          }
          className="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
        >
          <div className="mb-4 flex items-center justify-between sm:mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 sm:h-12 sm:w-12">
              <Truck className="h-5 w-5 text-purple-600 sm:h-6 sm:w-6" />
            </div>

            <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-600">
              Delivery
            </span>
          </div>

          <p className="text-xs font-medium text-gray-500 sm:text-sm">
            Delivery Boys
          </p>

          <h3 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
            {totalDeliveryBoys}
          </h3>

          <p className="mt-3 text-xs text-gray-400">
            {activeDeliveryBoys} active staff
          </p>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 min-[500px]:grid-cols-2 sm:mt-6 sm:gap-5 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 sm:h-11 sm:w-11">
              <IndianRupee className="h-5 w-5 text-green-600" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-gray-500 sm:text-sm">
                Total Revenue
              </p>

              <p className="mt-1 break-words text-lg font-bold text-gray-900 sm:text-xl">
                ₹
                {totalRevenue.toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 sm:h-11 sm:w-11">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <p className="text-xs text-gray-500 sm:text-sm">
                Total Orders
              </p>

              <p className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">
                {totalOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 sm:h-11 sm:w-11">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>

            <div>
              <p className="text-xs text-gray-500 sm:text-sm">
                Delivered Orders
              </p>

              <p className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">
                {deliveredOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 sm:h-11 sm:w-11">
              <UserCheck className="h-5 w-5 text-purple-600" />
            </div>

            <div>
              <p className="text-xs text-gray-500 sm:text-sm">
                Active Staff
              </p>

              <p className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">
                {activeDeliveryBoys}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:gap-6 xl:grid-cols-3">
        <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
            <div className="min-w-0">
              <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                Recent Orders
              </h3>

              <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                Latest customer orders
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/orders")
              }
              className="flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 sm:text-sm"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 text-center sm:min-h-56">
              <ShoppingCart className="mb-3 h-10 w-10 text-gray-300" />

              <p className="font-semibold text-gray-500">
                No orders to display
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Recent orders will appear here.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {recentOrders.map((order) => (
                  <button
                    type="button"
                    key={order._id}
                    onClick={() =>
                      navigate("/admin/orders")
                    }
                    className="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 text-left transition hover:border-blue-100 hover:bg-blue-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800">
                          #{order.orderNumber}
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-gray-600">
                          {order.customer?.name ||
                            "N/A"}
                        </p>

                        {order.customer?.phone && (
                          <p className="mt-0.5 text-xs text-gray-400">
                            {order.customer.phone}
                          </p>
                        )}
                      </div>

                      <span
                        className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        {formatStatus(
                          order.status
                        )}
                      </span>
                    </div>

                    <div className="mt-4 flex items-end justify-between gap-3 border-t border-gray-200 pt-3">
                      <div>
                        <p className="text-[11px] text-gray-400">
                          Amount
                        </p>

                        <p className="mt-0.5 text-sm font-bold text-gray-800">
                          ₹
                          {Number(
                            order.totalAmount
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] text-gray-400">
                          Date
                        </p>

                        <p className="mt-0.5 text-xs font-medium text-gray-600">
                          {formatDate(
                            order.createdAt
                          )}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[650px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                        Order
                      </th>

                      <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                        Customer
                      </th>

                      <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                        Amount
                      </th>

                      <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                        Status
                      </th>

                      <th className="pb-3 text-left text-xs font-semibold uppercase text-gray-400">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map(
                      (order) => (
                        <tr
                          key={order._id}
                          className="cursor-pointer transition hover:bg-gray-50"
                          onClick={() =>
                            navigate(
                              "/admin/orders"
                            )
                          }
                        >
                          <td className="py-4 pr-4">
                            <p className="text-sm font-semibold text-gray-800">
                              #
                              {
                                order.orderNumber
                              }
                            </p>
                          </td>

                          <td className="py-4 pr-4">
                            <p className="text-sm font-medium text-gray-700">
                              {order.customer
                                ?.name ||
                                "N/A"}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-400">
                              {order.customer
                                ?.phone || ""}
                            </p>
                          </td>

                          <td className="py-4 pr-4">
                            <p className="text-sm font-semibold text-gray-800">
                              ₹
                              {Number(
                                order.totalAmount
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          </td>

                          <td className="py-4 pr-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                                order.status
                              )}`}
                            >
                              {formatStatus(
                                order.status
                              )}
                            </span>
                          </td>

                          <td className="py-4 text-sm text-gray-500">
                            {formatDate(
                              order.createdAt
                            )}
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

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <h3 className="text-base font-bold text-gray-900 sm:text-lg">
            Quick Actions
          </h3>

          <p className="mt-1 text-xs text-gray-400 sm:text-sm">
            Common management actions
          </p>

          <div className="mt-5 space-y-3 sm:mt-6">
            <button
              type="button"
              onClick={() =>
                navigate("/admin/products")
              }
              className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-3 text-left transition hover:border-blue-100 hover:bg-blue-50 sm:gap-4 sm:p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <Boxes className="h-5 w-5 text-blue-600" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  Manage Products
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  Add or update products
                </p>
              </div>

              <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-gray-300" />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/orders")
              }
              className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-3 text-left transition hover:border-orange-100 hover:bg-orange-50 sm:gap-4 sm:p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100">
                <PackageCheck className="h-5 w-5 text-orange-600" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  Manage Orders
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  View and assign orders
                </p>
              </div>

              <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-gray-300" />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/customers")
              }
              className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-3 text-left transition hover:border-green-100 hover:bg-green-50 sm:gap-4 sm:p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100">
                <Users className="h-5 w-5 text-green-600" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  Customers
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  Manage customer accounts
                </p>
              </div>

              <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-gray-300" />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/delivery-boys"
                )
              }
              className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-3 text-left transition hover:border-purple-100 hover:bg-purple-50 sm:gap-4 sm:p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  Delivery Boys
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  Manage delivery staff
                </p>
              </div>

              <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </Dashboard>
  );
}

export default AdminDashboard;