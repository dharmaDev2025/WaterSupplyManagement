import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LocationPicker from "../components/LocationPicker";

import api from "../services/api";

import {
  useCart,
  type CartItem,
} from "../context/CartContext";

interface Customer {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;

  address?: {
    houseNo?: string;
    street?: string;
    city?: string;
  };

  location?: {
    latitude?: number | null;
    longitude?: number | null;
  };
}

interface ReorderItem {
  productId: string;
  name: string;
  productType: "jar" | "bottle";
  purchaseType:
    | "new-jar"
    | "refill"
    | "bottle";
  quantity: number;
  price: number;
  size: number;
  unit: "ml" | "liter";
  stock: number;
}

function Checkout() {
  const navigate = useNavigate();

  const routerLocation =
    useLocation();

  const {
    cartItems,
    totalAmount,
    clearCart,
  } = useCart();

  const paymentVerificationStarted =
    useRef(false);

  const [
    customer,
    setCustomer,
  ] = useState<Customer | null>(
    null
  );

  const [
    houseNo,
    setHouseNo,
  ] = useState("");

  const [
    street,
    setStreet,
  ] = useState("");

  const [
    city,
    setCity,
  ] = useState("");

  const [
    latitude,
    setLatitude,
  ] = useState<number | null>(
    null
  );

  const [
    longitude,
    setLongitude,
  ] = useState<number | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    paymentLoading,
    setPaymentLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    addressConfirmed,
    setAddressConfirmed,
  ] = useState(false);

  const [
    showLocationPicker,
    setShowLocationPicker,
  ] = useState(false);

  const orderType =
    routerLocation.state
      ?.orderType ||
    sessionStorage.getItem(
      "checkoutOrderType"
    ) ||
    "cart";

  let buyNowItem:
    | CartItem
    | null = null;

  try {
    const savedItem =
      sessionStorage.getItem(
        "buyNowItem"
      );

    if (savedItem) {
      buyNowItem =
        JSON.parse(savedItem);
    }
  } catch {
    buyNowItem = null;
  }

  let reorderItems:
    ReorderItem[] = [];

  try {
    const savedReorderItems =
      sessionStorage.getItem(
        "reorderItems"
      );

    if (savedReorderItems) {
      reorderItems =
        JSON.parse(
          savedReorderItems
        );
    }
  } catch {
    reorderItems = [];
  }

  const checkoutItems:
    CartItem[] =
    orderType === "buy-now" &&
    buyNowItem
      ? [buyNowItem]
      : orderType === "reorder"
      ? (reorderItems as CartItem[])
      : cartItems;

  const checkoutTotal =
    orderType === "cart"
      ? totalAmount
      : checkoutItems.reduce(
          (total, item) =>
            total +
            item.price *
              item.quantity,
          0
        );

  useEffect(() => {
    const fetchCustomer =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await api.get(
              "/customers/profile"
            );

          const profile =
            response.data.customer ||
            response.data.user ||
            response.data.data;

          setCustomer(profile);

          setHouseNo(
            profile?.address
              ?.houseNo || ""
          );

          setStreet(
            profile?.address
              ?.street || ""
          );

          setCity(
            profile?.address
              ?.city || ""
          );

          setLatitude(
            profile?.location
              ?.latitude ?? null
          );

          setLongitude(
            profile?.location
              ?.longitude ?? null
          );
        } catch (err: unknown) {
          console.log(
            "Checkout profile error:",
            err
          );

          if (
            axios.isAxiosError(
              err
            )
          ) {
            setError(
              err.response?.data
                ?.message ||
                "Unable to load customer details."
            );
          } else {
            setError(
              "Unable to load customer details."
            );
          }
        } finally {
          setLoading(false);
        }
      };

    fetchCustomer();
  }, []);

  useEffect(() => {
    const verifyPayment =
      async () => {
        const params =
          new URLSearchParams(
            window.location.search
          );

        const payment =
          params.get("payment");

        const sessionId =
          params.get(
            "session_id"
          );

        if (
          payment ===
          "cancelled"
        ) {
          setError(
            "Payment was cancelled."
          );

          window.history.replaceState(
            {},
            "",
            "/checkout"
          );

          return;
        }

        if (
          payment !==
            "success" ||
          !sessionId
        ) {
          return;
        }

        if (
          paymentVerificationStarted
            .current
        ) {
          return;
        }

        paymentVerificationStarted.current =
          true;

        try {
          setPaymentLoading(
            true
          );

          setError("");

          const response =
            await api.post(
              "/orders/verify-payment",
              {
                sessionId,
              }
            );

          if (
            response.data.success
          ) {
            const savedOrderType =
              sessionStorage.getItem(
                "checkoutOrderType"
              ) || "cart";

            if (
              savedOrderType ===
              "cart"
            ) {
              clearCart();
            }

            if (
              savedOrderType ===
              "buy-now"
            ) {
              sessionStorage.removeItem(
                "buyNowItem"
              );
            }

            if (
              savedOrderType ===
              "reorder"
            ) {
              sessionStorage.removeItem(
                "reorderItems"
              );
            }

            sessionStorage.removeItem(
              "checkoutOrderType"
            );

            alert(
              "Payment successful! Your order has been placed."
            );

            navigate(
              "/dashboard",
              {
                replace: true,

                state: {
                  orderSuccess:
                    true,

                  order:
                    response.data
                      .order,
                },
              }
            );
          }
        } catch (
          err: unknown
        ) {
          console.log(
            "Stripe verification error:",
            err
          );

          if (
            axios.isAxiosError(
              err
            )
          ) {
            setError(
              err.response?.data
                ?.message ||
                "Payment verification failed."
            );
          } else {
            setError(
              "Payment verification failed."
            );
          }

          window.history.replaceState(
            {},
            "",
            "/checkout"
          );
        } finally {
          setPaymentLoading(
            false
          );
        }
      };

    verifyPayment();
  }, [clearCart, navigate]);

  const handleAddressChange =
    () => {
      setAddressConfirmed(
        false
      );

      setError("");
    };

  const handleLocationConfirm =
    (
      lat: number,
      lng: number
    ) => {
      setLatitude(lat);
      setLongitude(lng);

      setShowLocationPicker(
        false
      );

      setAddressConfirmed(
        false
      );

      setError("");
    };

  const handleConfirmAddress =
    () => {
      setError("");

      if (!houseNo.trim()) {
        setError(
          "Please enter house or flat number."
        );

        return;
      }

      if (!street.trim()) {
        setError(
          "Please enter street or area."
        );

        return;
      }

      if (!city.trim()) {
        setError(
          "Please enter city."
        );

        return;
      }

      if (
        latitude === null ||
        longitude === null
      ) {
        setError(
          "Please select the exact delivery location from the map."
        );

        return;
      }

      setAddressConfirmed(
        true
      );
    };

  const handleProceedPayment =
    async () => {
      try {
        setError("");

        if (
          !addressConfirmed
        ) {
          setError(
            "Please confirm your delivery details first."
          );

          return;
        }

        if (
          checkoutItems.length ===
          0
        ) {
          setError(
            "Your order does not contain any products."
          );

          return;
        }

        if (
          latitude === null ||
          longitude === null
        ) {
          setError(
            "Please select your exact delivery location."
          );

          return;
        }

        setPaymentLoading(
          true
        );

        const items =
          checkoutItems.map(
            (item) => ({
              productId:
                item.productId,

              purchaseType:
                item.purchaseType,

              quantity:
                item.quantity,
            })
          );

        const deliveryAddress = {
          houseNo:
            houseNo.trim(),

          street:
            street.trim(),

          city:
            city.trim(),
        };

        const deliveryLocation = {
          latitude,
          longitude,
        };

        sessionStorage.setItem(
          "checkoutOrderType",
          orderType
        );

        const paymentResponse =
          await api.post(
            "/orders/create-payment",
            {
              items,
              deliveryAddress,
              deliveryLocation,
            }
          );

        const paymentData =
          paymentResponse.data;

        if (
          !paymentData.success ||
          !paymentData.url
        ) {
          setError(
            paymentData.message ||
              "Unable to start payment."
          );

          setPaymentLoading(
            false
          );

          return;
        }

        window.location.href =
          paymentData.url;
      } catch (
        err: unknown
      ) {
        console.log(
          "Create payment error:",
          err
        );

        if (
          axios.isAxiosError(
            err
          )
        ) {
          setError(
            err.response?.data
              ?.message ||
              "Unable to start payment."
          );
        } else {
          setError(
            "Unable to start payment."
          );
        }

        setPaymentLoading(
          false
        );
      }
    };

  const getProductSize = (
    item: CartItem
  ) => {
    if (
      item.unit === "liter"
    ) {
      return `${item.size}L`;
    }

    return `${item.size}ml`;
  };

  const getPurchaseType = (
    item: CartItem
  ) => {
    if (
      item.purchaseType ===
      "new-jar"
    ) {
      return "New Jar";
    }

    if (
      item.purchaseType ===
      "refill"
    ) {
      return "Refill";
    }

    return "Bottle";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />

        <main className="flex flex-1 items-center justify-center pt-20">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Preparing checkout...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (
    checkoutItems.length === 0
  ) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />

        <main className="flex flex-1 items-center justify-center px-5 pt-20">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="text-4xl">
              🛒
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Nothing to checkout
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Add a water product before continuing.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/products"
                )
              }
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Browse Products
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 pt-20">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Secure Checkout
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Delivery Details
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Confirm where you want this order delivered.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <div className="grid gap-7 lg:grid-cols-[1fr_370px]">
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-lg font-bold text-blue-600">
                    {customer?.name
                      ?.charAt(0)
                      .toUpperCase() ||
                      "C"}
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">
                      {customer?.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {customer?.phone}
                    </p>

                    <p className="text-xs text-slate-400">
                      {customer?.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      Delivery Address
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      Confirm your address
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Your default address is shown below. Changes apply only to this order.
                    </p>
                  </div>

                  {addressConfirmed && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-600">
                      ✓ Confirmed
                    </span>
                  )}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700">
                      House / Flat No.
                    </label>

                    <input
                      type="text"
                      value={houseNo}
                      onChange={(e) => {
                        setHouseNo(
                          e.target.value
                        );

                        handleAddressChange();
                      }}
                      placeholder="Example: House 12"
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700">
                      Street / Area
                    </label>

                    <input
                      type="text"
                      value={street}
                      onChange={(e) => {
                        setStreet(
                          e.target.value
                        );

                        handleAddressChange();
                      }}
                      placeholder="Street / Area"
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">
                      City
                    </label>

                    <input
                      type="text"
                      value={city}
                      onChange={(e) => {
                        setCity(
                          e.target.value
                        );

                        handleAddressChange();
                      }}
                      placeholder="City"
                      className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span>
                          📍
                        </span>

                        <p className="text-sm font-bold text-slate-800">
                          Exact Delivery Location
                        </p>
                      </div>

                      {latitude !== null &&
                      longitude !== null ? (
                        <p className="mt-2 text-xs font-medium text-emerald-600">
                          ✓ Location selected
                        </p>
                      ) : (
                        <p className="mt-2 text-xs font-medium text-amber-600">
                          Select the exact delivery point on the map.
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowLocationPicker(
                          true
                        )
                      }
                      className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
                    >
                      {latitude !== null &&
                      longitude !== null
                        ? "Change Location"
                        : "Pick Location"}
                    </button>
                  </div>

                  {latitude !== null &&
                    longitude !==
                      null && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-lg border border-blue-100 bg-white p-3">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Latitude
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-700">
                            {latitude.toFixed(
                              6
                            )}
                          </p>
                        </div>

                        <div className="rounded-lg border border-blue-100 bg-white p-3">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Longitude
                          </p>

                          <p className="mt-1 text-xs font-semibold text-slate-700">
                            {longitude.toFixed(
                              6
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                </div>

                {error && (
                  <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={
                    handleConfirmAddress
                  }
                  disabled={
                    paymentLoading
                  }
                  className={`mt-5 w-full rounded-lg px-5 py-3 text-sm font-bold transition ${
                    addressConfirmed
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {addressConfirmed
                    ? "Delivery Details Confirmed ✓"
                    : "Confirm Delivery Details"}
                </button>
              </div>
            </div>

            <aside>
              <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Order Summary
                    </h2>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {checkoutItems.length}{" "}
                      product
                      {checkoutItems.length !==
                      1
                        ? "s"
                        : ""}
                    </p>
                  </div>

                  {orderType ===
                    "reorder" && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-600">
                      Reorder
                    </span>
                  )}
                </div>

                <div className="mt-5 space-y-4">
                  {checkoutItems.map(
                    (item) => (
                      <div
                        key={`${item.productId}-${item.purchaseType}`}
                        className="border-b border-slate-100 pb-4 last:border-0"
                      >
                        <div className="flex justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-800">
                              {item.name}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              {getProductSize(
                                item
                              )}
                              {" • "}
                              {getPurchaseType(
                                item
                              )}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-500">
                              ₹{item.price} ×{" "}
                              {item.quantity}
                            </p>
                          </div>

                          <p className="whitespace-nowrap text-sm font-bold text-slate-900">
                            ₹
                            {item.price *
                              item.quantity}
                          </p>
                        </div>

                        {item.purchaseType ===
                          "refill" && (
                          <div className="mt-2 rounded-md bg-cyan-50 px-2 py-1.5">
                            <p className="text-[9px] font-medium text-cyan-700">
                              Return{" "}
                              {
                                item.quantity
                              }{" "}
                              empty jar
                              {item.quantity >
                              1
                                ? "s"
                                : ""}{" "}
                              during delivery.
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>

                <div className="mt-5 border-t border-slate-200 pt-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        Estimated Total
                      </p>

                      <p className="mt-1 text-[9px] text-slate-400">
                        Final amount is calculated securely by the server.
                      </p>
                    </div>

                    <p className="text-2xl font-bold text-slate-900">
                      ₹{checkoutTotal}
                    </p>
                  </div>
                </div>

                <div
                  className={`mt-5 rounded-xl border p-3 ${
                    addressConfirmed
                      ? "border-emerald-100 bg-emerald-50"
                      : "border-amber-100 bg-amber-50"
                  }`}
                >
                  <p
                    className={`text-[10px] font-medium leading-5 ${
                      addressConfirmed
                        ? "text-emerald-700"
                        : "text-amber-700"
                    }`}
                  >
                    {addressConfirmed
                      ? "✓ Delivery details confirmed. You can proceed to payment."
                      : "Confirm your address and exact map location before payment."}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    !addressConfirmed ||
                    paymentLoading
                  }
                  onClick={
                    handleProceedPayment
                  }
                  className={`mt-5 w-full rounded-lg px-4 py-3 text-sm font-bold transition ${
                    addressConfirmed &&
                    !paymentLoading
                      ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                      : "cursor-not-allowed bg-slate-100 text-slate-400"
                  }`}
                >
                  {paymentLoading
                    ? "Processing..."
                    : `Pay ₹${checkoutTotal}`}
                </button>

                <button
                  type="button"
                  disabled={
                    paymentLoading
                  }
                  onClick={() => {
                    if (
                      orderType ===
                      "buy-now"
                    ) {
                      navigate(
                        "/products"
                      );
                    } else if (
                      orderType ===
                      "reorder"
                    ) {
                      navigate(
                        "/my-orders"
                      );
                    } else {
                      navigate(
                        "/cart"
                      );
                    }
                  }}
                  className="mt-3 w-full rounded-lg border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {orderType ===
                  "buy-now"
                    ? "Back to Products"
                    : orderType ===
                      "reorder"
                    ? "Back to My Orders"
                    : "Back to Cart"}
                </button>

                <div className="mt-5 border-t border-slate-100 pt-4 text-center">
                  <p className="text-[10px] font-medium text-slate-400">
                    🔒 Secure payment powered by Stripe
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />

      {showLocationPicker && (
        <LocationPicker
          initialLatitude={
            latitude
          }
          initialLongitude={
            longitude
          }
          onConfirm={
            handleLocationConfirm
          }
          onClose={() =>
            setShowLocationPicker(
              false
            )
          }
        />
      )}
    </div>
  );
}

export default Checkout;