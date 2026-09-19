import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CheckCircle2,
  Clock3,
  Eye,
  MapPin,
  Package,
  Search,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import Dashboard from "../components/Dashboard";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface DeliveryBoy {
  _id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  isActive: boolean;
}

interface Product {
  _id: string;
  name: string;
  productType: string;
  size: number;
  unit: string;
}

interface OrderItem {
  _id?: string;
  product: Product | string;
  name: string;
  purchaseType: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: Customer | null;
  items: OrderItem[];
  totalAmount: number;

  deliveryAddress: {
    houseNo: string;
    street: string;
    city: string;
  };

  deliveryLocation?: {
    latitude: number;
    longitude: number;
  };

  deliveryBoy: DeliveryBoy | null;

  deliveryBoyAssignedAt?: string | null;

  status:
    | "confirmed"
    | "packed"
    | "out-for-delivery"
    | "delivered";

  paymentStatus: string;

  paidAt?: string;
  deliveredAt?: string | null;

  createdAt: string;
}

type StatusFilter =
  | "all"
  | "confirmed"
  | "packed"
  | "out-for-delivery"
  | "delivered";

function AdminOrders() {
  const navigate = useNavigate();

  const API_URL =
    import.meta.env.VITE_API_URL;

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [deliveryBoys, setDeliveryBoys] =
    useState<DeliveryBoy[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    detailsLoading,
    setDetailsLoading,
  ] = useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>("all");

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState<Order | null>(null);

  const [
    showDetails,
    setShowDetails,
  ] = useState(false);

  const [
    selectedDeliveryBoy,
    setSelectedDeliveryBoy,
  ] = useState("");

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const getToken = () => {
    return localStorage.getItem(
      "adminToken"
    );
  };

  const logoutAdmin = () => {
    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem(
      "admin"
    );

    sessionStorage.removeItem(
      "adminEmail"
    );

    navigate("/");
  };

  const handleApiError = (
    error: unknown,
    message: string
  ) => {
    if (axios.isAxiosError(error)) {
      if (
        error.response?.status ===
          401 ||
        error.response?.status ===
          403
      ) {
        logoutAdmin();
        return;
      }

      setError(
        error.response?.data
          ?.message || message
      );

      return;
    }

    setError(message);
  };

  const fetchOrders = async (
    status: StatusFilter = "all"
  ) => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        logoutAdmin();
        return;
      }

      let url =
        `${API_URL}/admin/orders`;

      if (status !== "all") {
        url =
          `${API_URL}/admin/orders?status=${status}`;
      }

      const response =
        await axios.get(url, {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        });

      setOrders(
        response.data.orders || []
      );
    } catch (error: unknown) {
      handleApiError(
        error,
        "Unable to fetch orders"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryBoys =
    async () => {
      try {
        const token =
          getToken();

        if (!token) {
          logoutAdmin();
          return;
        }

        const response =
          await axios.get(
            `${API_URL}/admin/delivery-boys?status=active`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        setDeliveryBoys(
          response.data
            .deliveryBoys || []
        );
      } catch (error: unknown) {
        if (
          axios.isAxiosError(error)
        ) {
          if (
            error.response
              ?.status === 401 ||
            error.response
              ?.status === 403
          ) {
            logoutAdmin();
          }
        }
      }
    };

  useEffect(() => {
    fetchOrders("all");
    fetchDeliveryBoys();
  }, []);

  const handleFilterChange = (
    value: StatusFilter
  ) => {
    setStatusFilter(value);
    setSearch("");
    setError("");
    setSuccess("");

    fetchOrders(value);
  };

  const openOrderDetails =
    async (orderId: string) => {
      try {
        setDetailsLoading(true);
        setError("");
        setSuccess("");

        const token =
          getToken();

        if (!token) {
          logoutAdmin();
          return;
        }

        const response =
          await axios.get(
            `${API_URL}/admin/orders/${orderId}`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const order: Order =
          response.data.order;

        setSelectedOrder(order);

        setSelectedDeliveryBoy(
          order.deliveryBoy?._id ||
            ""
        );

        setSelectedStatus(
          order.status
        );

        setShowDetails(true);
      } catch (error: unknown) {
        handleApiError(
          error,
          "Unable to fetch order details"
        );
      } finally {
        setDetailsLoading(false);
      }
    };

  const closeOrderDetails = () => {
    if (actionLoading) {
      return;
    }

    setShowDetails(false);
    setSelectedOrder(null);
    setSelectedDeliveryBoy("");
    setSelectedStatus("");
    setError("");
    setSuccess("");
  };

  const updateOrderInList = (
    updatedOrder: Order
  ) => {
    setOrders((previous) => {
      if (
        statusFilter !== "all" &&
        updatedOrder.status !==
          statusFilter
      ) {
        return previous.filter(
          (order) =>
            order._id !==
            updatedOrder._id
        );
      }

      return previous.map(
        (order) =>
          order._id ===
          updatedOrder._id
            ? {
                ...order,
                ...updatedOrder,
              }
            : order
      );
    });
  };

  const handleAssignDeliveryBoy =
    async () => {
      if (!selectedOrder) {
        return;
      }

      if (
        !selectedDeliveryBoy
      ) {
        setError(
          "Please select a delivery boy"
        );
        return;
      }

      try {
        setActionLoading(true);
        setError("");
        setSuccess("");

        const token =
          getToken();

        if (!token) {
          logoutAdmin();
          return;
        }

        const response =
          await axios.patch(
            `${API_URL}/admin/orders/${selectedOrder._id}/assign-delivery`,
            {
              deliveryBoyId:
                selectedDeliveryBoy,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const updatedOrder: Order =
          response.data.order;

        setSelectedOrder(
          (previous) =>
            previous
              ? {
                  ...previous,
                  ...updatedOrder,
                }
              : updatedOrder
        );

        updateOrderInList(
          updatedOrder
        );

        setSuccess(
          response.data.message ||
            "Delivery boy assigned successfully"
        );
      } catch (error: unknown) {
        handleApiError(
          error,
          "Unable to assign delivery boy"
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleUpdateStatus =
    async () => {
      if (!selectedOrder) {
        return;
      }

      if (!selectedStatus) {
        setError(
          "Please select status"
        );
        return;
      }

      if (
        selectedStatus ===
        selectedOrder.status
      ) {
        setError(
          "Please select a different status"
        );
        return;
      }

      if (
        selectedStatus ===
        "delivered"
      ) {
        setError(
          "Admin cannot directly mark an order as delivered"
        );
        return;
      }

      try {
        setActionLoading(true);
        setError("");
        setSuccess("");

        const token =
          getToken();

        if (!token) {
          logoutAdmin();
          return;
        }

        const response =
          await axios.patch(
            `${API_URL}/admin/orders/${selectedOrder._id}/status`,
            {
              status:
                selectedStatus,
            },
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const updatedOrder: Order =
          response.data.order;

        setSelectedOrder(
          (previous) =>
            previous
              ? {
                  ...previous,
                  ...updatedOrder,
                }
              : updatedOrder
        );

        updateOrderInList(
          updatedOrder
        );

        setSuccess(
          response.data.message ||
            "Order status updated successfully"
        );
      } catch (error: unknown) {
        handleApiError(
          error,
          "Unable to update order status"
        );
      } finally {
        setActionLoading(false);
      }
    };

  const formatStatus = (
    status: string
  ) => {
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
    status: Order["status"]
  ) => {
    if (
      status === "confirmed"
    ) {
      return "bg-blue-50 text-blue-700";
    }

    if (
      status === "packed"
    ) {
      return "bg-amber-50 text-amber-700";
    }

    if (
      status ===
      "out-for-delivery"
    ) {
      return "bg-violet-50 text-violet-700";
    }

    return "bg-emerald-50 text-emerald-700";
  };

  const getStatusDot = (
    status: Order["status"]
  ) => {
    if (
      status === "confirmed"
    ) {
      return "bg-blue-500";
    }

    if (
      status === "packed"
    ) {
      return "bg-amber-500";
    }

    if (
      status ===
      "out-for-delivery"
    ) {
      return "bg-violet-500";
    }

    return "bg-emerald-500";
  };

  const filteredOrders =
    orders.filter((order) => {
      const value =
        search
          .toLowerCase()
          .trim();

      if (!value) {
        return true;
      }

      return (
        order.orderNumber
          ?.toLowerCase()
          .includes(value) ||
        order.customer?.name
          ?.toLowerCase()
          .includes(value) ||
        order.customer?.email
          ?.toLowerCase()
          .includes(value) ||
        order.customer?.phone
          ?.toLowerCase()
          .includes(value) ||
        order.deliveryBoy?.name
          ?.toLowerCase()
          .includes(value)
      );
    });

  const totalOrders =
    orders.length;

  const confirmedOrders =
    orders.filter(
      (order) =>
        order.status ===
        "confirmed"
    ).length;

  const outForDeliveryOrders =
    orders.filter(
      (order) =>
        order.status ===
        "out-for-delivery"
    ).length;

  const deliveredOrders =
    orders.filter(
      (order) =>
        order.status ===
        "delivered"
    ).length;

  return (
    <Dashboard
      title="Orders"
      subtitle="Manage customer orders and delivery assignments"
    >
      {success &&
        !showDetails && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 sm:mb-6">
            <span className="min-w-0">
              {success}
            </span>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              className="shrink-0 rounded-lg p-1 hover:bg-emerald-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

      {error &&
        !showDetails && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 sm:mb-6">
            <span className="min-w-0">
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="shrink-0 rounded-lg p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

      <div className="mb-6 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-4 xl:mb-7 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Total Orders
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {totalOrders}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Orders in current view
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-11 sm:w-11">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Confirmed
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {confirmedOrders}
              </p>

              <p className="mt-2 text-xs text-blue-600">
                Waiting for processing
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-11 sm:w-11">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Out For Delivery
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {outForDeliveryOrders}
              </p>

              <p className="mt-2 text-xs text-violet-600">
                Currently delivering
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 sm:h-11 sm:w-11">
              <Truck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Delivered
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {deliveredOrders}
              </p>

              <p className="mt-2 text-xs text-emerald-600">
                Completed orders
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:h-11 sm:w-11">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                Order Management
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                View, assign and manage customer orders
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <div className="relative w-full sm:flex-1 xl:w-64">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search order..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  handleFilterChange(
                    e.target
                      .value as StatusFilter
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 sm:w-auto"
              >
                <option value="all">
                  All Orders
                </option>

                <option value="confirmed">
                  Confirmed
                </option>

                <option value="packed">
                  Packed
                </option>

                <option value="out-for-delivery">
                  Out For Delivery
                </option>

                <option value="delivered">
                  Delivered
                </option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center sm:min-h-[350px]">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading orders...
              </p>
            </div>
          </div>
        ) : filteredOrders.length ===
          0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-4 py-8 text-center sm:min-h-[350px]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Package className="h-8 w-8 text-slate-400" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              No orders found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              No orders match the selected filter.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 p-3 sm:p-4 lg:hidden">
              {filteredOrders.map(
                (order) => (
                  <div
                    key={order._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-all text-sm font-bold text-slate-900 sm:text-base">
                          #
                          {
                            order.orderNumber
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {order.items
                            ?.length ||
                            0}{" "}
                          item
                          {order.items
                            ?.length !==
                          1
                            ? "s"
                            : ""}
                        </p>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(
                          order.status
                        )}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                            order.status
                          )}`}
                        />

                        {formatStatus(
                          order.status
                        )}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <UserRound className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {order
                            .customer
                            ?.name ||
                            "N/A"}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {order
                            .customer
                            ?.phone ||
                            "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Amount
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          ₹
                          {
                            order.totalAmount
                          }
                        </p>

                        <p className="mt-1 text-[11px] font-semibold capitalize text-emerald-600">
                          {
                            order.paymentStatus
                          }
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Delivery Boy
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                          {order
                            .deliveryBoy
                            ?.name ||
                            "Not Assigned"}
                        </p>

                        {order.deliveryBoy && (
                          <p className="mt-1 truncate text-[11px] text-slate-400">
                            {
                              order
                                .deliveryBoy
                                .phone
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">
                        Created
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-600">
                        {formatDate(
                          order.createdAt
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={
                        detailsLoading
                      }
                      onClick={() =>
                        openOrderDetails(
                          order._id
                        )
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                    >
                      <Eye className="h-4 w-4" />
                      View Order
                    </button>
                  </div>
                )
              )}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Order
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Delivery Boy
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Created
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map(
                    (order) => (
                      <tr
                        key={
                          order._id
                        }
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800">
                            #
                            {
                              order.orderNumber
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {order.items
                              ?.length ||
                              0}{" "}
                            item
                            {order.items
                              ?.length !==
                            1
                              ? "s"
                              : ""}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <UserRound className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800">
                                {order
                                  .customer
                                  ?.name ||
                                  "N/A"}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                {order
                                  .customer
                                  ?.phone ||
                                  "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800">
                            ₹
                            {
                              order.totalAmount
                            }
                          </p>

                          <p className="mt-1 text-xs font-medium capitalize text-emerald-600">
                            {
                              order.paymentStatus
                            }
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          {order.deliveryBoy ? (
                            <div>
                              <p className="text-sm font-semibold text-slate-700">
                                {
                                  order
                                    .deliveryBoy
                                    .name
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {
                                  order
                                    .deliveryBoy
                                    .phone
                                }
                              </p>
                            </div>
                          ) : (
                            <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              Not Assigned
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                              order.status
                            )}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                                order.status
                              )}`}
                            />

                            {formatStatus(
                              order.status
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDate(
                            order.createdAt
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              disabled={
                                detailsLoading
                              }
                              onClick={() =>
                                openOrderDetails(
                                  order._id
                                )
                              }
                              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading &&
          filteredOrders.length >
            0 && (
            <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-4 sm:px-6">
              <p className="text-xs text-slate-500 sm:text-sm">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {
                    filteredOrders.length
                  }
                </span>{" "}
                orders
              </p>
            </div>
          )}
      </div>

      {showDetails &&
        selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
            <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[94vh] sm:max-w-4xl sm:rounded-2xl">
              <div className="sticky top-0 z-20 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
                <div className="min-w-0">
                  <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                    <h2 className="break-all text-lg font-bold text-slate-900 sm:text-xl">
                      Order #
                      {
                        selectedOrder.orderNumber
                      }
                    </h2>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                        selectedOrder.status
                      )}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                          selectedOrder.status
                        )}`}
                      />

                      {formatStatus(
                        selectedOrder.status
                      )}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    {formatDate(
                      selectedOrder.createdAt
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeOrderDetails
                  }
                  disabled={
                    actionLoading
                  }
                  className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
                {success && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {success}
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                  <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <UserRound className="h-5 w-5 text-blue-600" />

                      <h3 className="font-bold text-slate-800">
                        Customer
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-400">
                          Name
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold text-slate-700">
                          {selectedOrder
                            .customer
                            ?.name ||
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Email
                        </p>

                        <p className="mt-1 break-all text-sm text-slate-700">
                          {selectedOrder
                            .customer
                            ?.email ||
                            "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">
                          Phone
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          {selectedOrder
                            .customer
                            ?.phone ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-red-500" />

                      <h3 className="font-bold text-slate-800">
                        Delivery Address
                      </h3>
                    </div>

                    <p className="break-words text-sm leading-6 text-slate-600">
                      {selectedOrder
                        .deliveryAddress
                        ?.houseNo || ""}

                      {selectedOrder
                        .deliveryAddress
                        ?.street
                        ? `, ${selectedOrder.deliveryAddress.street}`
                        : ""}

                      {selectedOrder
                        .deliveryAddress
                        ?.city
                        ? `, ${selectedOrder.deliveryAddress.city}`
                        : ""}
                    </p>

                    {selectedOrder.deliveryLocation && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                        <p className="break-all">
                          Latitude:{" "}
                          {
                            selectedOrder
                              .deliveryLocation
                              .latitude
                          }
                        </p>

                        <p className="mt-1 break-all">
                          Longitude:{" "}
                          {
                            selectedOrder
                              .deliveryLocation
                              .longitude
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
                    <h3 className="font-bold text-slate-800">
                      Order Items
                    </h3>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {selectedOrder.items?.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={
                            item._id ||
                            `${item.name}-${index}`
                          }
                          className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                        >
                          <div className="min-w-0">
                            <p className="break-words font-semibold text-slate-800">
                              {
                                item.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatStatus(
                                item.purchaseType
                              )}
                              {" • "}
                              Quantity:{" "}
                              {
                                item.quantity
                              }
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3 sm:bg-transparent sm:p-0 sm:text-right">
                            <p className="font-semibold text-slate-800">
                              ₹
                              {
                                item.subtotal
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              ₹
                              {
                                item.price
                              }{" "}
                              each
                            </p>
                          </div>
                        </div>
                      )
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
                    <span className="text-sm font-semibold text-slate-600 sm:text-base">
                      Total Amount
                    </span>

                    <span className="text-lg font-bold text-slate-900 sm:text-xl">
                      ₹
                      {
                        selectedOrder.totalAmount
                      }
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
                  <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Truck className="h-5 w-5 text-violet-600" />

                      <h3 className="font-bold text-slate-800">
                        Delivery Boy
                      </h3>
                    </div>

                    {selectedOrder.status ===
                    "delivered" ? (
                      <div className="rounded-xl bg-emerald-50 p-4">
                        <p className="text-sm font-semibold text-emerald-700">
                          Delivery completed
                        </p>

                        <p className="mt-1 text-sm text-emerald-600">
                          {selectedOrder
                            .deliveryBoy
                            ?.name ||
                            "Delivery Boy"}
                        </p>

                        {selectedOrder
                          .deliveryBoy
                          ?.phone && (
                          <p className="mt-1 text-xs text-emerald-600">
                            {
                              selectedOrder
                                .deliveryBoy
                                .phone
                            }
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        {selectedOrder.deliveryBoy && (
                          <div className="mb-4 rounded-xl bg-violet-50 p-3">
                            <p className="text-xs font-medium text-violet-500">
                              Currently assigned
                            </p>

                            <p className="mt-1 text-sm font-semibold text-violet-700">
                              {
                                selectedOrder
                                  .deliveryBoy
                                  .name
                              }
                            </p>

                            <p className="mt-1 text-xs text-violet-500">
                              {
                                selectedOrder
                                  .deliveryBoy
                                  .phone
                              }
                            </p>
                          </div>
                        )}

                        <select
                          value={
                            selectedDeliveryBoy
                          }
                          onChange={(
                            e
                          ) =>
                            setSelectedDeliveryBoy(
                              e.target
                                .value
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50"
                        >
                          <option value="">
                            Select Delivery Boy
                          </option>

                          {deliveryBoys.map(
                            (
                              deliveryBoy
                            ) => (
                              <option
                                key={
                                  deliveryBoy._id
                                }
                                value={
                                  deliveryBoy._id
                                }
                              >
                                {
                                  deliveryBoy.name
                                }{" "}
                                -{" "}
                                {
                                  deliveryBoy.phone
                                }
                              </option>
                            )
                          )}
                        </select>

                        <button
                          type="button"
                          onClick={
                            handleAssignDeliveryBoy
                          }
                          disabled={
                            actionLoading ||
                            !selectedDeliveryBoy
                          }
                          className="mt-3 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
                        >
                          {actionLoading
                            ? "Processing..."
                            : selectedOrder.deliveryBoy
                              ? "Change Delivery Boy"
                              : "Assign Delivery Boy"}
                        </button>
                      </>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />

                      <h3 className="font-bold text-slate-800">
                        Order Status
                      </h3>
                    </div>

                    {selectedOrder.status ===
                    "delivered" ? (
                      <div className="rounded-xl bg-emerald-50 p-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />

                          <p className="text-sm font-semibold text-emerald-700">
                            Delivered
                          </p>
                        </div>

                        {selectedOrder.deliveredAt && (
                          <p className="mt-2 text-xs text-emerald-600">
                            {formatDate(
                              selectedOrder.deliveredAt
                            )}
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <select
                          value={
                            selectedStatus
                          }
                          onChange={(
                            e
                          ) =>
                            setSelectedStatus(
                              e.target
                                .value
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                        >
                          <option value="confirmed">
                            Confirmed
                          </option>

                          <option value="packed">
                            Packed
                          </option>

                          <option value="out-for-delivery">
                            Out For Delivery
                          </option>
                        </select>

                        <button
                          type="button"
                          onClick={
                            handleUpdateStatus
                          }
                          disabled={
                            actionLoading
                          }
                          className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                        >
                          {actionLoading
                            ? "Processing..."
                            : "Update Status"}
                        </button>

                        <p className="mt-3 text-xs leading-5 text-slate-400">
                          A delivery boy
                          must be assigned
                          before changing
                          the status to Out
                          For Delivery.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </Dashboard>
  );
}

export default AdminOrders;