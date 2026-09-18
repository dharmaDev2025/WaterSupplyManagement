import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
  useCart,
  type CartItem,
} from "../context/CartContext";

// ==========================================
// COMPONENT
// ==========================================

function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    cartCount,
    totalAmount,
    removeFromCart,
    updateQuantity,
  } = useCart();

  // ==========================================
  // PRODUCT SIZE
  // ==========================================

  const getProductSize = (item: CartItem) => {
    if (item.unit === "liter") {
      return `${item.size}L`;
    }

    return `${item.size}ml`;
  };

  // ==========================================
  // PURCHASE TYPE LABEL
  // ==========================================

  const getPurchaseType = (item: CartItem) => {
    if (item.purchaseType === "new-jar") {
      return "New Jar";
    }

    if (item.purchaseType === "refill") {
      return "Refill";
    }

    return "Bottle";
  };

  // ==========================================
  // INCREASE QUANTITY
  // ==========================================

  const increaseQuantity = (item: CartItem) => {
    if (item.quantity >= item.stock) {
      return;
    }

    updateQuantity(
      item.productId,
      item.purchaseType,
      item.quantity + 1
    );
  };

  // ==========================================
  // DECREASE QUANTITY
  // ==========================================

  const decreaseQuantity = (item: CartItem) => {
    if (item.quantity <= 1) {
      return;
    }

    updateQuantity(
      item.productId,
      item.purchaseType,
      item.quantity - 1
    );
  };

  // ==========================================
  // REMOVE PRODUCT
  // ==========================================

  const handleRemove = (item: CartItem) => {
    removeFromCart(
      item.productId,
      item.purchaseType
    );
  };

  // ==========================================
  // PLACE ORDER
  // ==========================================

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      return;
    }

    // Remove any previous Buy Now product
    sessionStorage.removeItem("buyNowItem");

    navigate("/checkout", {
      state: {
        orderType: "cart",
      },
    });
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* ================================= */}
        {/* PAGE HEADER */}
        {/* ================================= */}

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-600" />

                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  AquaFlow Cart
                </p>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Your Cart
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Review your selected water products
                before placing your order.
              </p>
            </div>
          </div>
        </section>

        {/* ================================= */}
        {/* EMPTY CART */}
        {/* ================================= */}

        {cartItems.length === 0 && (
          <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              {/* CART ICON */}

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 2h13m-10 4a1 1 0 110 2 1 1 0 010-2zm9 0a1 1 0 110 2 1 1 0 010-2z"
                  />
                </svg>
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Your cart is empty
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You haven't selected any water
                products yet.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/products")
                }
                className="mt-6 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Browse Products
              </button>
            </div>
          </section>
        )}

        {/* ================================= */}
        {/* CART CONTENT */}
        {/* ================================= */}

        {cartItems.length > 0 && (
          <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
            <div className="grid gap-7 lg:grid-cols-[1fr_350px]">
              {/* ================================= */}
              {/* LEFT - PRODUCTS */}
              {/* ================================= */}

              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Selected Products
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {cartCount}{" "}
                      {cartCount === 1
                        ? "item"
                        : "items"}{" "}
                      in your cart
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/products")
                    }
                    className="text-xs font-bold text-blue-600 transition hover:text-blue-700"
                  >
                    + Add More Products
                  </button>
                </div>

                {/* ============================= */}
                {/* PRODUCTS */}
                {/* ============================= */}

                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <article
                      key={`${item.productId}-${item.purchaseType}`}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        {/* ============================= */}
                        {/* PRODUCT IMAGE */}
                        {/* ============================= */}

                        <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 sm:w-28">
                          {item.productType ===
                          "jar" ? (
                            <div>
                              <div className="mx-auto h-3 w-8 rounded-t bg-blue-500" />

                              <div className="flex h-16 w-13 items-center justify-center rounded-xl rounded-t-md border-2 border-blue-200 bg-gradient-to-b from-cyan-100 to-blue-300 shadow-sm">
                                <div className="rounded bg-white/90 px-2 py-1">
                                  <p className="text-xs font-black text-blue-600">
                                    {getProductSize(
                                      item
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="mx-auto h-3 w-4 rounded-t bg-blue-600" />

                              <div className="flex h-20 w-8 items-center justify-center rounded-lg rounded-t-sm border-2 border-blue-200 bg-gradient-to-b from-cyan-100 to-blue-300 shadow-sm">
                                <div className="rounded bg-white/90 px-1 py-1">
                                  <p className="text-[8px] font-black text-blue-600">
                                    {getProductSize(
                                      item
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* ============================= */}
                        {/* PRODUCT DETAILS */}
                        {/* ============================= */}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col justify-between gap-3 sm:flex-row">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600">
                                {getProductSize(
                                  item
                                )}
                              </p>

                              <h3 className="mt-1 font-bold text-slate-900">
                                {item.name}
                              </h3>

                              {/* PURCHASE TYPE */}

                              <div className="mt-2">
                                <span
                                  className={`inline-flex rounded-md px-2.5 py-1 text-[10px] font-bold ${
                                    item.purchaseType ===
                                    "refill"
                                      ? "bg-blue-50 text-blue-600"
                                      : item.purchaseType ===
                                          "new-jar"
                                        ? "bg-violet-50 text-violet-600"
                                        : "bg-slate-100 text-slate-600"
                                  }`}
                                >
                                  {getPurchaseType(
                                    item
                                  )}
                                </span>
                              </div>
                            </div>

                            {/* PRICE */}

                            <div className="sm:text-right">
                              <p className="text-[10px] font-semibold uppercase text-slate-400">
                                Price
                              </p>

                              <p className="mt-1 text-lg font-bold text-slate-900">
                                ₹{item.price}
                              </p>

                              <p className="text-[10px] text-slate-400">
                                per item
                              </p>
                            </div>
                          </div>

                          {/* ============================= */}
                          {/* QUANTITY + SUBTOTAL */}
                          {/* ============================= */}

                          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
                            {/* QUANTITY */}

                            <div className="flex items-center gap-2">
                              <p className="mr-2 text-xs font-medium text-slate-500">
                                Quantity
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(
                                    item
                                  )
                                }
                                disabled={
                                  item.quantity <= 1
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                −
                              </button>

                              <div className="flex h-8 min-w-10 items-center justify-center rounded-md bg-slate-50 px-3 text-xs font-bold text-slate-900">
                                {item.quantity}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  increaseQuantity(
                                    item
                                  )
                                }
                                disabled={
                                  item.quantity >=
                                  item.stock
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                +
                              </button>
                            </div>

                            <div className="flex items-center gap-5">
                              {/* SUBTOTAL */}

                              <div className="text-right">
                                <p className="text-[10px] font-semibold uppercase text-slate-400">
                                  Subtotal
                                </p>

                                <p className="mt-0.5 text-base font-bold text-slate-900">
                                  ₹
                                  {item.price *
                                    item.quantity}
                                </p>
                              </div>

                              {/* REMOVE */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemove(item)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                                title="Remove product"
                              >
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={
                                      2
                                    }
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* REFILL MESSAGE */}

                          {item.purchaseType ===
                            "refill" && (
                            <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                              <p className="text-[11px] leading-5 text-amber-700">
                                Return{" "}
                                <strong>
                                  {item.quantity}
                                </strong>{" "}
                                empty{" "}
                                {item.quantity === 1
                                  ? "jar"
                                  : "jars"}{" "}
                                during delivery.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* ================================= */}
              {/* RIGHT - ORDER SUMMARY */}
              {/* ================================= */}

              <aside>
                <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">
                    Order Summary
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Review your order total.
                  </p>

                  {/* ITEMS */}

                  <div className="mt-5 space-y-3 border-b border-slate-100 pb-5">
                    {cartItems.map((item) => (
                      <div
                        key={`summary-${item.productId}-${item.purchaseType}`}
                        className="flex items-start justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-700">
                            {item.name}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {getPurchaseType(
                              item
                            )}{" "}
                            × {item.quantity}
                          </p>
                        </div>

                        <p className="shrink-0 text-xs font-bold text-slate-900">
                          ₹
                          {item.price *
                            item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* TOTAL */}

                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500">
                        Total Amount
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {cartCount}{" "}
                        {cartCount === 1
                          ? "item"
                          : "items"}
                      </p>
                    </div>

                    <p className="text-2xl font-bold text-slate-900">
                      ₹{totalAmount}
                    </p>
                  </div>

                  {/* INFO */}

                  <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-3">
                    <p className="text-[11px] leading-5 text-blue-700">
                      Final product prices and stock
                      will be verified securely by
                      AquaFlow before payment.
                    </p>
                  </div>

                  {/* PLACE ORDER */}

                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Place Order

                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>

                  {/* CONTINUE SHOPPING */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/products")
                    }
                    className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    Continue Shopping
                  </button>

                  {/* PAYMENT */}

                  <div className="mt-5 flex items-center justify-center gap-2 border-t border-slate-100 pt-4">
                    <span className="text-xs">
                      🔒
                    </span>

                    <p className="text-[10px] font-medium text-slate-400">
                      Secure payment with Razorpay
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Cart;