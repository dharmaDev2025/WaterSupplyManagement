import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
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
import DeliveryDashboardLayout from "../components/DeliveryDashboardLayout";

interface Customer {
  name?: string;
  phone?: string;
  email?: string;
}

interface DeliveryAddress {
  houseNo?: string;
  street?: string;
  area?: string;
  city?: string;
  pincode?: string;
}

interface DeliveryLocation {
  latitude?: number;
  longitude?: number;
}

interface Product {
  _id?: string;
  name?: string;
  productType?: string;
  size?: number;
  unit?: string;
}

interface OrderItem {
  _id?: string;
  product?: Product;
  name?: string;
  purchaseType?: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  customer: Customer;
  deliveryAddress: DeliveryAddress;
  deliveryLocation: DeliveryLocation;
  mapUrl?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  status: string;
  assignedAt?: string;
  createdAt?: string;
  deliveredAt?: string;
}

function DeliveryOrderDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const API_URL =
    import.meta.env.VITE_API_URL;

  const [order, setOrder] =
    useState<OrderDetails | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [otpSent, setOtpSent] =
    useState(false);

  const [otp, setOtp] =
    useState("");

  const [sendingOtp, setSendingOtp] =
    useState(false);

  const [verifyingOtp, setVerifyingOtp] =
    useState(false);

  const logout = () => {
    localStorage.removeItem(
      "deliveryToken"
    );

    localStorage.removeItem(
      "deliveryBoy"
    );

    navigate("/");
  };

  const getConfig = () => {
    const token =
      localStorage.getItem(
        "deliveryToken"
      );

    return {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    };
  };

  const fetchOrder = async () => {
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

      if (!id) {
        setError(
          "Order ID is missing"
        );
        return;
      }

      const response =
        await axios.get(
          `${API_URL}/delivery/orders/${id}`,
          getConfig()
        );

      setOrder(
        response.data.order
      );
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error)
      ) {
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
            "Unable to fetch order details"
        );

        return;
      }

      setError(
        "Unable to fetch order details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleSendOtp =
    async () => {
      try {
        setSendingOtp(true);
        setError("");
        setSuccess("");

        const response =
          await axios.post(
            `${API_URL}/delivery/orders/${id}/send-delivery-otp`,
            {},
            getConfig()
          );

        setOtpSent(true);

        setSuccess(
          response.data.message ||
            "OTP sent to customer email"
        );
      } catch (error: unknown) {
        if (
          axios.isAxiosError(error)
        ) {
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
              "Unable to send OTP"
          );

          return;
        }

        setError(
          "Unable to send OTP"
        );
      } finally {
        setSendingOtp(false);
      }
    };

  const handleVerifyOtp =
    async () => {
      try {
        if (
          otp.trim().length !== 6
        ) {
          setError(
            "Please enter the 6-digit OTP"
          );
          return;
        }

        setVerifyingOtp(true);
        setError("");
        setSuccess("");

        const response =
          await axios.post(
            `${API_URL}/delivery/orders/${id}/verify-delivery-otp`,
            {
              otp: otp.trim(),
            },
            getConfig()
          );

        setSuccess(
          response.data.message ||
            "Delivery completed successfully"
        );

        setOtp("");
        setOtpSent(false);

        await fetchOrder();
      } catch (error: unknown) {
        if (
          axios.isAxiosError(error)
        ) {
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
              "Invalid OTP"
          );

          return;
        }

        setError(
          "Unable to verify OTP"
        );
      } finally {
        setVerifyingOtp(false);
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

  const statusStyle = (
    status: string
  ) => {
    if (status === "confirmed") {
      return "bg-blue-50 text-blue-700";
    }

    if (status === "packed") {
      return "bg-amber-50 text-amber-700";
    }

    if (
      status === "out-for-delivery"
    ) {
      return "bg-violet-50 text-violet-700";
    }

    if (status === "delivered") {
      return "bg-emerald-50 text-emerald-700";
    }

    return "bg-gray-100 text-gray-600";
  };

  const getAddress = () => {
    if (!order) {
      return "N/A";
    }

    const value = [
      order.deliveryAddress
        ?.houseNo,
      order.deliveryAddress
        ?.street,
      order.deliveryAddress
        ?.area,
      order.deliveryAddress
        ?.city,
      order.deliveryAddress
        ?.pincode,
    ]
      .filter(Boolean)
      .join(", ");

    return value || "N/A";
  };

  const getMapUrl = () => {
    if (order?.mapUrl) {
      return order.mapUrl;
    }

    const latitude =
      order?.deliveryLocation
        ?.latitude;

    const longitude =
      order?.deliveryLocation
        ?.longitude;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return "";
    }

    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  };

  const getSubtotal = (
    item: OrderItem
  ) => {
    return (
      item.subtotal ??
      Number(item.price) *
        Number(item.quantity)
    );
  };

  if (loading) {
    return (
      <DeliveryDashboardLayout
        title="Order Details"
        subtitle="Delivery information"
      >
        <div className="flex min-h-[500px] w-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-gray-500">
              Loading order...
            </p>
          </div>
        </div>
      </DeliveryDashboardLayout>
    );
  }

  if (!order) {
    return (
      <DeliveryDashboardLayout
        title="Order Details"
        subtitle="Delivery information"
      >
        <div className="w-full rounded-2xl border border-red-100 bg-white p-6 text-center sm:p-10">
          <Package className="mx-auto h-10 w-10 text-red-300" />

          <h3 className="mt-4 font-bold text-gray-900">
            Order unavailable
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            {error ||
              "Unable to find this order."}
          </p>
        </div>
      </DeliveryDashboardLayout>
    );
  }

  const mapUrl = getMapUrl();

  return (
    <DeliveryDashboardLayout
      title="Order Details"
      subtitle={`Order #${order.orderNumber}`}
    >
      <div className="w-full min-w-0">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/delivery/orders"
            )
          }
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Active Orders
        </button>

        {error && (
          <div className="mb-5 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 flex w-full items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <span className="min-w-0 break-words">
              {success}
            </span>
          </div>
        )}

        <div className="mb-5 w-full rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 sm:h-12 sm:w-12">
                <Package className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <h2 className="break-all text-lg font-bold text-gray-900 sm:text-xl">
                    #{order.orderNumber}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(
                      order.status
                    )}`}
                  >
                    {formatStatus(
                      order.status
                    )}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 sm:gap-x-3">
                  <span>
                    {order.customer
                      ?.name ||
                      "Customer"}
                  </span>

                  <span className="text-gray-300">
                    •
                  </span>

                  <span>
                    ₹
                    {Number(
                      order.totalAmount
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  <span className="text-gray-300">
                    •
                  </span>

                  <span className="font-medium capitalize text-emerald-600">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {order.status ===
              "delivered" && (
              <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 sm:w-auto">
                <CheckCircle2 className="h-5 w-5" />
                Delivery Completed
              </div>
            )}
          </div>
        </div>

        <div className="grid w-full min-w-0 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="min-w-0 space-y-5">
            <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
                <h3 className="font-bold text-gray-900">
                  Delivery Information
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Customer and delivery
                  destination
                </p>
              </div>

              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex min-w-0 items-start gap-3 rounded-xl bg-gray-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Customer
                      </p>

                      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                        {order.customer
                          ?.name ||
                          "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-start gap-3 rounded-xl bg-gray-50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                      <Phone className="h-4 w-4 text-emerald-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Phone
                      </p>

                      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
                        {order.customer
                          ?.phone ||
                          "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-start gap-3 rounded-xl bg-gray-50 p-4 sm:col-span-2 lg:col-span-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100">
                      <Mail className="h-4 w-4 text-violet-600" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Email
                      </p>

                      <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                        {order.customer
                          ?.email ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-gray-200 p-4 sm:p-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50">
                      <MapPin className="h-5 w-5 text-red-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        Delivery Address
                      </p>

                      <p className="mt-2 break-words text-sm leading-6 text-gray-600">
                        {getAddress()}
                      </p>

                      <div className="mt-3 flex flex-col gap-1 text-xs text-gray-400 sm:flex-row sm:flex-wrap sm:gap-x-5 sm:gap-y-2">
                        <span className="break-all">
                          Lat:{" "}
                          {order
                            .deliveryLocation
                            ?.latitude ??
                            "N/A"}
                        </span>

                        <span className="break-all">
                          Lng:{" "}
                          {order
                            .deliveryLocation
                            ?.longitude ??
                            "N/A"}
                        </span>
                      </div>

                      {mapUrl && (
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 sm:inline-flex sm:w-auto"
                        >
                          <MapPin className="h-4 w-4" />
                          Open Google Maps
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-4 py-4 sm:px-5">
                <h3 className="font-bold text-gray-900">
                  Order Items
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Items to be delivered
                </p>
              </div>

              <div className="space-y-3 p-4 md:hidden">
                {order.items?.map(
                  (item, index) => (
                    <div
                      key={
                        item._id ||
                        index
                      }
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="break-words font-semibold text-gray-900">
                            {item.name ||
                              item.product
                                ?.name ||
                              "Product"}
                          </p>

                          {item.product
                            ?.size !==
                            undefined && (
                            <p className="mt-1 text-xs text-gray-400">
                              {
                                item.product
                                  .size
                              }{" "}
                              {item.product
                                .unit || ""}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400">
                            Type
                          </p>

                          <p className="mt-1 break-words text-sm font-medium capitalize text-gray-700">
                            {item.purchaseType
                              ?.replace(
                                /-/g,
                                " "
                              ) ||
                              "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Quantity
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-700">
                            {item.quantity}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Price
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-700">
                            ₹
                            {Number(
                              item.price
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Total
                          </p>

                          <p className="mt-1 text-sm font-bold text-gray-900">
                            ₹
                            {Number(
                              getSubtotal(
                                item
                              )
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="hidden w-full min-w-0 md:block">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="w-[38%] px-3 py-3 text-left text-xs font-semibold uppercase text-gray-400 lg:px-5">
                        Product
                      </th>

                      <th className="w-[22%] px-3 py-3 text-left text-xs font-semibold uppercase text-gray-400 lg:px-5">
                        Purchase Type
                      </th>

                      <th className="w-[10%] px-3 py-3 text-center text-xs font-semibold uppercase text-gray-400 lg:px-5">
                        Qty
                      </th>

                      <th className="w-[15%] px-3 py-3 text-right text-xs font-semibold uppercase text-gray-400 lg:px-5">
                        Price
                      </th>

                      <th className="w-[15%] px-3 py-3 text-right text-xs font-semibold uppercase text-gray-400 lg:px-5">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {order.items?.map(
                      (item, index) => (
                        <tr
                          key={
                            item._id ||
                            index
                          }
                          className="transition hover:bg-gray-50"
                        >
                          <td className="px-3 py-4 align-middle lg:px-5">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                                <Package className="h-5 w-5 text-blue-600" />
                              </div>

                              <div className="min-w-0">
                                <p className="break-words font-semibold text-gray-900">
                                  {item.name ||
                                    item
                                      .product
                                      ?.name ||
                                    "Product"}
                                </p>

                                {item
                                  .product
                                  ?.size !==
                                  undefined && (
                                  <p className="mt-1 text-xs text-gray-400">
                                    {
                                      item
                                        .product
                                        .size
                                    }{" "}
                                    {item
                                      .product
                                      .unit ||
                                      ""}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-4 text-sm capitalize text-gray-600 lg:px-5">
                            <span className="break-words">
                              {item.purchaseType
                                ?.replace(
                                  /-/g,
                                  " "
                                ) ||
                                "N/A"}
                            </span>
                          </td>

                          <td className="px-3 py-4 text-center font-semibold text-gray-700 lg:px-5">
                            {item.quantity}
                          </td>

                          <td className="px-3 py-4 text-right text-sm text-gray-600 lg:px-5">
                            ₹
                            {Number(
                              item.price
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td className="px-3 py-4 text-right font-bold text-gray-900 lg:px-5">
                            ₹
                            {Number(
                              getSubtotal(
                                item
                              )
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-4 py-4 sm:px-5">
                <div className="text-right">
                  <p className="text-xs font-medium uppercase text-gray-400">
                    Total Amount
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    ₹
                    {Number(
                      order.totalAmount
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm xl:sticky xl:top-24">
              <div className="border-b border-gray-100 p-4 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                    {order.status ===
                    "delivered" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <Truck className="h-5 w-5 text-blue-600" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900">
                      Delivery Action
                    </h3>

                    <p className="text-xs text-gray-500">
                      Secure delivery
                      confirmation
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {order.status ===
                "delivered" ? (
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>

                    <h4 className="mt-4 text-lg font-bold text-gray-900">
                      Delivery Completed
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      This order has been
                      successfully delivered
                      to the customer.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          "/delivery/delivered"
                        )
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                      Delivered Orders

                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : order.status !==
                  "out-for-delivery" ? (
                  <div className="rounded-xl bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-800">
                      Delivery confirmation
                      unavailable
                    </p>

                    <p className="mt-2 text-sm leading-6 text-amber-700">
                      This order must be
                      marked Out For
                      Delivery by the admin
                      before delivery can be
                      confirmed.
                    </p>
                  </div>
                ) : !otpSent ? (
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                      <ShieldCheck className="h-6 w-6 text-emerald-600" />
                    </div>

                    <h4 className="mt-4 text-lg font-bold text-gray-900">
                      Ready to deliver?
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Confirm that you are
                      with the customer. A
                      verification OTP will
                      be sent to their
                      registered email.
                    </p>

                    <div className="mt-4 rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-medium uppercase text-gray-400">
                        Customer Email
                      </p>

                      <p className="mt-1 break-all text-sm font-semibold text-gray-700">
                        {order.customer
                          ?.email ||
                          "Email unavailable"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleSendOtp
                      }
                      disabled={
                        sendingOtp
                      }
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sendingOtp ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Confirm Delivery
                        </>
                      )}
                    </button>

                    <p className="mt-3 text-center text-xs leading-5 text-gray-400">
                      Delivery is completed
                      only after successful
                      OTP verification.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>

                    <h4 className="mt-4 text-lg font-bold text-gray-900">
                      Verify Customer OTP
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      We sent a 6-digit OTP
                      to the customer's
                      registered email. Ask
                      the customer for the
                      OTP.
                    </p>

                    <label className="mt-5 block text-sm font-semibold text-gray-700">
                      Delivery OTP
                    </label>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(event) =>
                        setOtp(
                          event.target.value
                            .replace(
                              /\D/g,
                              ""
                            )
                            .slice(0, 6)
                        )
                      }
                      placeholder="Enter 6-digit OTP"
                      className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-center text-lg font-bold tracking-[0.2em] text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 sm:px-4 sm:text-xl sm:tracking-[0.35em]"
                    />

                    <button
                      type="button"
                      onClick={
                        handleVerifyOtp
                      }
                      disabled={
                        verifyingOtp ||
                        otp.length !== 6
                      }
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {verifyingOtp ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" />
                          Verify & Complete
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleSendOtp
                      }
                      disabled={
                        sendingOtp
                      }
                      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          sendingOtp
                            ? "animate-spin"
                            : ""
                        }`}
                      />

                      Resend OTP
                    </button>

                    <p className="mt-3 text-center text-xs text-gray-400">
                      OTP is valid for 5
                      minutes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DeliveryDashboardLayout>
  );
}

export default DeliveryOrderDetails;