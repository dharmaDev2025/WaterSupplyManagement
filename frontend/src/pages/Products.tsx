import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductSelectModal from "../components/ProductSelectModal";

import api from "../services/api";

import type { PurchaseType } from "../context/CartContext";

// ==========================================
// TYPES
// ==========================================

type ProductType = "jar" | "bottle";
type UnitType = "ml" | "liter";
type FilterType = "all" | "jar" | "bottle";

interface Product {
  _id: string;
  name: string;
  productType: ProductType;
  size: number;
  unit: UnitType;

  newJarPrice: number | null;
  refillPrice: number | null;
  bottlePrice: number | null;

  stock: number;
  isActive: boolean;

  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// COMPONENT
// ==========================================

function Products() {
  const navigate = useNavigate();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [filter, setFilter] =
    useState<FilterType>("all");

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string>("");

  // ==========================================
  // SELECTED PRODUCT
  // ==========================================

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<Product | null>(null);

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get("/products/all");

        console.log(
          "Products Response:",
          response.data
        );

        const productData =
          response.data.products ||
          response.data.data ||
          response.data;

        if (Array.isArray(productData)) {
          setProducts(productData);
        } else {
          setProducts([]);
        }
      } catch (err: unknown) {
        console.log(
          "Product Fetch Error:",
          err
        );

        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message ||
              err.response?.data?.error ||
              "Unable to load products."
          );
        } else {
          setError(
            "Something went wrong while loading products."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ==========================================
  // FILTER PRODUCTS
  // ==========================================

  const filteredProducts =
    products.filter((product) => {
      if (filter === "all") {
        return true;
      }

      return product.productType === filter;
    });

  // ==========================================
  // PRODUCT SIZE
  // ==========================================

  const getProductSize = (
    product: Product
  ) => {
    if (product.unit === "liter") {
      return `${product.size}L`;
    }

    return `${product.size}ml`;
  };

  // ==========================================
  // OPEN PRODUCT MODAL
  // ==========================================

  const handleSelectProduct = (
    product: Product
  ) => {
    if (product.stock <= 0) {
      return;
    }

    setSelectedProduct(product);
  };

  // ==========================================
  // CLOSE PRODUCT MODAL
  // ==========================================

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  // ==========================================
  // BUY NOW
  // ==========================================

  const handleBuyNow = (
    productId: string,
    purchaseType: PurchaseType,
    quantity: number
  ) => {
    const product = products.find(
      (item) => item._id === productId
    );

    if (!product) {
      return;
    }

    // ------------------------------------------
    // Determine display price
    // ------------------------------------------

    let price = 0;

    if (purchaseType === "new-jar") {
      price = product.newJarPrice ?? 0;
    } else if (
      purchaseType === "refill"
    ) {
      price = product.refillPrice ?? 0;
    } else {
      price = product.bottlePrice ?? 0;
    }

    // ------------------------------------------
    // Prepare Buy Now item
    // ------------------------------------------

    const buyNowItem = {
      productId: product._id,
      name: product.name,
      productType: product.productType,
      purchaseType,
      quantity,
      price,
      size: product.size,
      unit: product.unit,
      stock: product.stock,
    };

    // Temporary storage for Checkout
    sessionStorage.setItem(
      "buyNowItem",
      JSON.stringify(buyNowItem)
    );

    setSelectedProduct(null);

    // Checkout page will be created later.
    navigate("/checkout", {
      state: {
        orderType: "buy-now",
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
          <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 lg:px-10">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                    AquaFlow Products
                  </p>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Choose Your Water
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                  Fresh drinking water for your
                  home, office, shop or hotel.
                  Choose a new jar, refill your
                  existing jar, or order water
                  bottles.
                </p>
              </div>

              {/* HEADER INFORMATION */}

              <div className="flex flex-wrap gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                  ✓ Safe Water
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                  ✓ Doorstep Delivery
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                  ✓ Secure Payment
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================= */}
        {/* PRODUCTS */}
        {/* ================================= */}

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          {/* TOP BAR */}

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Available Products
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {filteredProducts.length}{" "}
                product
                {filteredProducts.length !==
                1
                  ? "s"
                  : ""}{" "}
                available
              </p>
            </div>

            {/* FILTER */}

            <div className="flex w-fit rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() =>
                  setFilter("all")
                }
                className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
                  filter === "all"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                All
              </button>

              <button
                type="button"
                onClick={() =>
                  setFilter("jar")
                }
                className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
                  filter === "jar"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Jars
              </button>

              <button
                type="button"
                onClick={() =>
                  setFilter("bottle")
                }
                className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
                  filter === "bottle"
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                Bottles
              </button>
            </div>
          </div>

          {/* ================================= */}
          {/* LOADING */}
          {/* ================================= */}

          {loading && (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Loading products...
                </p>
              </div>
            </div>
          )}

          {/* ================================= */}
          {/* ERROR */}
          {/* ================================= */}

          {!loading && error && (
            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3L13.74 4a2 2 0 00-3.48 0L3.33 16a2 2 0 001.74 3z"
                  />
                </svg>
              </div>

              <h3 className="mt-3 font-bold text-slate-900">
                Unable to load products
              </h3>

              <p className="mt-2 text-sm text-red-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          )}

          {/* ================================= */}
          {/* EMPTY */}
          {/* ================================= */}

          {!loading &&
            !error &&
            filteredProducts.length ===
              0 && (
              <div className="mt-8 rounded-xl border border-slate-200 bg-white p-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                  >
                    <path
                      d="M12 2C12 2 5 9.2 5 14.3C5 18.6 8.1 22 12 22C15.9 22 19 18.6 19 14.3C19 9.2 12 2 12 2Z"
                      fill="#2563eb"
                    />
                  </svg>
                </div>

                <h3 className="mt-4 font-bold text-slate-900">
                  No products available
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  There are no products
                  available in this category.
                </p>
              </div>
            )}

          {/* ================================= */}
          {/* PRODUCT GRID */}
          {/* ================================= */}

          {!loading &&
            !error &&
            filteredProducts.length > 0 && (
              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map(
                  (product) => (
                    <article
                      key={product._id}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                    >
                      {/* ============================= */}
                      {/* PRODUCT VISUAL */}
                      {/* ============================= */}

                      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
                        {/* TYPE */}

                        <span className="absolute left-3 top-3 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 shadow-sm">
                          {product.productType ===
                          "jar"
                            ? "Water Jar"
                            : "Bottle"}
                        </span>

                        {/* STOCK */}

                        <span
                          className={`absolute right-3 top-3 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold ${
                            product.stock > 0
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              product.stock >
                              0
                                ? "bg-emerald-500"
                                : "bg-red-500"
                            }`}
                          />

                          {product.stock > 0
                            ? "In Stock"
                            : "Out of Stock"}
                        </span>

                        {/* PRODUCT ICON */}

                        {product.productType ===
                        "jar" ? (
                          <div className="relative mt-4">
                            <div className="mx-auto h-4 w-9 rounded-t-md bg-blue-500" />

                            <div className="relative flex h-20 w-16 items-center justify-center rounded-2xl rounded-t-lg border-2 border-blue-200 bg-gradient-to-b from-cyan-100 to-blue-300 shadow-md">
                              <div className="absolute left-2 top-2 h-10 w-1.5 rounded-full bg-white/50" />

                              <div className="rounded-md bg-white/90 px-2 py-1 text-center shadow-sm">
                                <p className="text-sm font-black text-blue-600">
                                  {getProductSize(
                                    product
                                  )}
                                </p>

                                <p className="text-[6px] font-bold uppercase tracking-wide text-slate-400">
                                  AquaFlow
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="relative mt-4">
                            <div className="mx-auto h-4 w-5 rounded-t bg-blue-600" />

                            <div className="relative flex h-24 w-10 items-center justify-center rounded-xl rounded-t-md border-2 border-blue-200 bg-gradient-to-b from-cyan-100 to-blue-300 shadow-md">
                              <div className="absolute left-1.5 top-2 h-12 w-1 rounded-full bg-white/50" />

                              <div className="rounded bg-white/90 px-1.5 py-1 text-center">
                                <p className="text-[10px] font-black text-blue-600">
                                  {getProductSize(
                                    product
                                  )}
                                </p>

                                <p className="text-[5px] font-bold uppercase text-slate-400">
                                  AquaFlow
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ============================= */}
                      {/* PRODUCT DETAILS */}
                      {/* ============================= */}

                      <div className="p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600">
                          {getProductSize(
                            product
                          )}
                        </p>

                        <h3 className="mt-1 line-clamp-2 min-h-[40px] text-base font-bold leading-5 text-slate-900">
                          {product.name}
                        </h3>

                        {/* JAR PRICES */}

                        {product.productType ===
                          "jar" && (
                          <div className="mt-4 grid grid-cols-2 gap-2">
                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                              <p className="text-[10px] font-semibold uppercase text-slate-400">
                                New Jar
                              </p>

                              <p className="mt-0.5 text-base font-bold text-slate-900">
                                ₹
                                {product.newJarPrice ??
                                  0}
                              </p>
                            </div>

                            <div className="rounded-lg border border-blue-100 bg-blue-50 p-2.5">
                              <p className="text-[10px] font-semibold uppercase text-blue-500">
                                Refill
                              </p>

                              <p className="mt-0.5 text-base font-bold text-slate-900">
                                ₹
                                {product.refillPrice ??
                                  0}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* BOTTLE PRICE */}

                        {product.productType ===
                          "bottle" && (
                          <div className="mt-4 flex items-end justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div>
                              <p className="text-[10px] font-semibold uppercase text-slate-400">
                                Price
                              </p>

                              <p className="mt-0.5 text-xl font-bold text-slate-900">
                                ₹
                                {product.bottlePrice ??
                                  0}
                              </p>
                            </div>

                            <p className="pb-1 text-[10px] text-slate-400">
                              / bottle
                            </p>
                          </div>
                        )}

                        {/* STOCK */}

                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs text-slate-500">
                            Stock
                          </p>

                          <p
                            className={`text-xs font-semibold ${
                              product.stock > 0
                                ? "text-emerald-600"
                                : "text-red-500"
                            }`}
                          >
                            {product.stock > 0
                              ? `${product.stock} available`
                              : "Unavailable"}
                          </p>
                        </div>

                        {/* ============================= */}
                        {/* ACTION BUTTON */}
                        {/* ============================= */}

                        <button
                          type="button"
                          onClick={() =>
                            handleSelectProduct(
                              product
                            )
                          }
                          disabled={
                            product.stock <= 0
                          }
                          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
                            product.stock > 0
                              ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                              : "cursor-not-allowed bg-slate-100 text-slate-400"
                          }`}
                        >
                          {product.stock > 0
                            ? product.productType ===
                              "jar"
                              ? "Choose Option"
                              : "Select Product"
                            : "Out of Stock"}

                          {product.stock > 0 && (
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
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
        </section>

        {/* ================================= */}
        {/* JAR INFORMATION */}
        {/* ================================= */}

        <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-8 lg:px-10">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 sm:p-7">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-xl">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Water Jar Options
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  New Jar or Refill?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Buy a new jar when you need
                  the container and water
                  together. Choose refill when
                  you already have an empty
                  jar.
                </p>
              </div>

              <div className="grid min-w-full grid-cols-2 gap-3 md:min-w-[350px]">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
                    N
                  </div>

                  <p className="mt-3 text-sm font-bold text-slate-900">
                    New Jar
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Container + fresh water
                  </p>
                </div>

                <div className="rounded-xl border border-blue-200 bg-white p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-600">
                    R
                  </div>

                  <p className="mt-3 text-sm font-bold text-slate-900">
                    Refill
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Fresh water refill only
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* ========================================== */}
      {/* PRODUCT SELECTION MODAL */}
      {/* ========================================== */}

      {selectedProduct && (
        <ProductSelectModal
          product={selectedProduct}
          onClose={handleCloseModal}
          onBuyNow={handleBuyNow}
        />
      )}
    </div>
  );
}

export default Products;