import { useEffect, useState } from "react";

import {
  useCart,
  type PurchaseType,
} from "../context/CartContext";

// ==========================================
// PRODUCT TYPE
// ==========================================

interface Product {
  _id: string;

  name: string;

  productType: "jar" | "bottle";

  size: number;

  unit: "ml" | "liter";

  newJarPrice: number | null;

  refillPrice: number | null;

  bottlePrice: number | null;

  stock: number;

  isActive: boolean;
}

// ==========================================
// PROPS
// ==========================================

interface ProductSelectModalProps {
  product: Product;

  onClose: () => void;

  onBuyNow: (
    productId: string,
    purchaseType: PurchaseType,
    quantity: number
  ) => void;
}

// ==========================================
// COMPONENT
// ==========================================

function ProductSelectModal({
  product,
  onClose,
  onBuyNow,
}: ProductSelectModalProps) {
  const { addToCart } = useCart();

  // ==========================================
  // PURCHASE TYPE
  // ==========================================

  const [purchaseType, setPurchaseType] =
    useState<PurchaseType>(
      product.productType === "jar"
        ? "new-jar"
        : "bottle"
    );

  // ==========================================
  // QUANTITY
  // ==========================================

  const [quantity, setQuantity] =
    useState(1);

  const [message, setMessage] =
    useState("");

  // ==========================================
  // RESET WHEN PRODUCT CHANGES
  // ==========================================

  useEffect(() => {
    setQuantity(1);
    setMessage("");

    if (product.productType === "jar") {
      setPurchaseType("new-jar");
    } else {
      setPurchaseType("bottle");
    }
  }, [product]);

  // ==========================================
  // GET PRICE
  // ==========================================

  const getPrice = () => {
    if (purchaseType === "new-jar") {
      return product.newJarPrice ?? 0;
    }

    if (purchaseType === "refill") {
      return product.refillPrice ?? 0;
    }

    return product.bottlePrice ?? 0;
  };

  const price = getPrice();

  const total = price * quantity;

  // ==========================================
  // PRODUCT SIZE
  // ==========================================

  const productSize =
    product.unit === "liter"
      ? `${product.size}L`
      : `${product.size}ml`;

  // ==========================================
  // INCREASE QUANTITY
  // ==========================================

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((current) => current + 1);
    }
  };

  // ==========================================
  // DECREASE QUANTITY
  // ==========================================

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((current) => current - 1);
    }
  };

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = () => {
    addToCart({
      productId: product._id,

      name: product.name,

      productType: product.productType,

      purchaseType,

      quantity,

      price,

      size: product.size,

      unit: product.unit,

      stock: product.stock,
    });

    setMessage("Product added to cart.");

    // Close modal after short delay
    setTimeout(() => {
      onClose();
    }, 500);
  };

  // ==========================================
  // BUY NOW
  // ==========================================

  const handleBuyNow = () => {
    onBuyNow(
      product._id,
      purchaseType,
      quantity
    );
  };

  // ==========================================
  // CLOSE ON BACKDROP CLICK
  // ==========================================

  const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      onMouseDown={handleBackdropClick}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* ================================= */}
        {/* HEADER */}
        {/* ================================= */}

        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
              AquaFlow Product
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {product.name}
            </h2>

            <p className="mt-1 text-xs font-medium text-slate-500">
              {productSize}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 transition hover:bg-slate-200"
          >
            ×
          </button>
        </div>

        {/* ================================= */}
        {/* CONTENT */}
        {/* ================================= */}

        <div className="p-6">
          {/* ================================= */}
          {/* JAR OPTIONS */}
          {/* ================================= */}

          {product.productType === "jar" && (
            <div>
              <p className="text-xs font-bold text-slate-700">
                Select Purchase Type
              </p>

              <div className="mt-3 grid grid-cols-2 gap-3">
                {/* NEW JAR */}

                <button
                  type="button"
                  onClick={() =>
                    setPurchaseType("new-jar")
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    purchaseType === "new-jar"
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 bg-white hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      New Jar
                    </span>

                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        purchaseType === "new-jar"
                          ? "border-blue-600"
                          : "border-slate-300"
                      }`}
                    >
                      {purchaseType ===
                        "new-jar" && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </span>
                  </div>

                  <p className="mt-2 text-xl font-bold text-slate-900">
                    ₹{product.newJarPrice ?? 0}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Container + water
                  </p>
                </button>

                {/* REFILL */}

                <button
                  type="button"
                  onClick={() =>
                    setPurchaseType("refill")
                  }
                  className={`rounded-xl border p-4 text-left transition ${
                    purchaseType === "refill"
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 bg-white hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">
                      Refill
                    </span>

                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        purchaseType === "refill"
                          ? "border-blue-600"
                          : "border-slate-300"
                      }`}
                    >
                      {purchaseType ===
                        "refill" && (
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </span>
                  </div>

                  <p className="mt-2 text-xl font-bold text-slate-900">
                    ₹{product.refillPrice ?? 0}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Water refill only
                  </p>
                </button>
              </div>

              {/* REFILL NOTE */}

              {purchaseType === "refill" && (
                <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5">
                  <p className="text-xs leading-5 text-amber-700">
                    For a refill order, you need to
                    return the same number of empty
                    jars during delivery.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ================================= */}
          {/* BOTTLE PRICE */}
          {/* ================================= */}

          {product.productType ===
            "bottle" && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold text-blue-500">
                Bottle Price
              </p>

              <div className="mt-1 flex items-end gap-1">
                <p className="text-2xl font-bold text-slate-900">
                  ₹{product.bottlePrice ?? 0}
                </p>

                <p className="pb-1 text-xs text-slate-500">
                  / bottle
                </p>
              </div>
            </div>
          )}

          {/* ================================= */}
          {/* QUANTITY */}
          {/* ================================= */}

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-700">
                Quantity
              </p>

              <p className="text-[10px] font-medium text-slate-400">
                {product.stock} available
              </p>
            </div>

            <div className="mt-3 flex items-center gap-3">
              {/* MINUS */}

              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                −
              </button>

              {/* QUANTITY */}

              <div className="flex h-10 min-w-16 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-5 text-sm font-bold text-slate-900">
                {quantity}
              </div>

              {/* PLUS */}

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={
                  quantity >= product.stock
                }
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* ================================= */}
          {/* TOTAL */}
          {/* ================================= */}

          <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Order Total
              </p>

              <p className="mt-1 text-xs text-slate-500">
                ₹{price} × {quantity}
              </p>
            </div>

            <p className="text-2xl font-bold text-slate-900">
              ₹{total}
            </p>
          </div>

          {/* SUCCESS */}

          {message && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
              ✓ {message}
            </div>
          )}

          {/* ================================= */}
          {/* BUTTONS */}
          {/* ================================= */}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-100"
            >
              Add to Cart
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductSelectModal;