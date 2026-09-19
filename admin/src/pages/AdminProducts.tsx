import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Boxes,
  Edit,
  Package,
  Plus,
  Search,
  X,
} from "lucide-react";
import Dashboard from "../components/Dashboard";

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
  createdAt?: string;
}

interface ProductForm {
  name: string;
  productType: "jar" | "bottle";
  size: string;
  unit: "ml" | "liter";
  newJarPrice: string;
  refillPrice: string;
  bottlePrice: string;
  stock: string;
}

const emptyForm: ProductForm = {
  name: "",
  productType: "jar",
  size: "",
  unit: "liter",
  newJarPrice: "",
  refillPrice: "",
  bottlePrice: "",
  stock: "",
};

function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [
    editingProduct,
    setEditingProduct,
  ] = useState<Product | null>(null);

  const [form, setForm] =
    useState<ProductForm>(emptyForm);

  const API_URL =
    import.meta.env.VITE_API_URL;

  const getToken = () => {
    return localStorage.getItem(
      "adminToken"
    );
  };

  const logoutAdmin = () => {
    localStorage.removeItem(
      "adminToken"
    );

    localStorage.removeItem("admin");

    sessionStorage.removeItem(
      "adminEmail"
    );

    navigate("/");
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        logoutAdmin();
        return;
      }

      const response =
        await axios.get(
          `${API_URL}/admin/products`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      setProducts(
        response.data.products || []
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (
          error.response?.status ===
            401 ||
          error.response?.status === 403
        ) {
          logoutAdmin();
          return;
        }

        setError(
          error.response?.data
            ?.message ||
            "Unable to fetch products"
        );
      } else {
        setError(
          "Unable to fetch products"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
        HTMLSelectElement
    >
  ) => {
    const { name, value } =
      e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (
    product: Product
  ) => {
    setEditingProduct(product);

    setForm({
      name: product.name,
      productType:
        product.productType,
      size: String(product.size),
      unit: product.unit,
      newJarPrice:
        product.newJarPrice !== null
          ? String(
              product.newJarPrice
            )
          : "",
      refillPrice:
        product.refillPrice !== null
          ? String(
              product.refillPrice
            )
          : "",
      bottlePrice:
        product.bottlePrice !== null
          ? String(
              product.bottlePrice
            )
          : "",
      stock: String(product.stock),
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.name.trim() ||
      !form.size ||
      !form.unit
    ) {
      setError(
        "Name, size and unit are required"
      );
      return;
    }

    if (
      Number(form.size) <= 0 ||
      Number.isNaN(
        Number(form.size)
      )
    ) {
      setError(
        "Size must be greater than 0"
      );
      return;
    }

    if (
      Number(form.stock || 0) < 0 ||
      Number.isNaN(
        Number(form.stock || 0)
      )
    ) {
      setError(
        "Stock cannot be negative"
      );
      return;
    }

    if (
      form.productType === "jar"
    ) {
      if (
        form.newJarPrice === "" ||
        form.refillPrice === ""
      ) {
        setError(
          "New jar price and refill price are required"
        );
        return;
      }

      if (
        Number(
          form.newJarPrice
        ) < 0 ||
        Number(
          form.refillPrice
        ) < 0
      ) {
        setError(
          "Product prices cannot be negative"
        );
        return;
      }
    }

    if (
      form.productType ===
      "bottle"
    ) {
      if (
        form.bottlePrice === ""
      ) {
        setError(
          "Bottle price is required"
        );
        return;
      }

      if (
        Number(
          form.bottlePrice
        ) < 0
      ) {
        setError(
          "Bottle price cannot be negative"
        );
        return;
      }
    }

    const body =
      form.productType === "jar"
        ? {
            name: form.name.trim(),
            productType: "jar",
            size: Number(
              form.size
            ),
            unit: form.unit,
            newJarPrice: Number(
              form.newJarPrice
            ),
            refillPrice: Number(
              form.refillPrice
            ),
            stock: Number(
              form.stock || 0
            ),
          }
        : {
            name: form.name.trim(),
            productType: "bottle",
            size: Number(
              form.size
            ),
            unit: form.unit,
            bottlePrice: Number(
              form.bottlePrice
            ),
            stock: Number(
              form.stock || 0
            ),
          };

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        logoutAdmin();
        return;
      }

      if (editingProduct) {
        const response =
          await axios.put(
            `${API_URL}/admin/products/${editingProduct._id}`,
            body,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        setProducts(
          (previous) =>
            previous.map(
              (product) =>
                product._id ===
                editingProduct._id
                  ? response.data
                      .product
                  : product
            )
        );

        setSuccess(
          response.data.message ||
            "Product updated successfully"
        );
      } else {
        const response =
          await axios.post(
            `${API_URL}/admin/products`,
            body,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        setProducts(
          (previous) => [
            response.data.product,
            ...previous,
          ]
        );

        setSuccess(
          response.data.message ||
            "Product added successfully"
        );
      }

      setShowModal(false);
      setEditingProduct(null);
      setForm(emptyForm);
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
          logoutAdmin();
          return;
        }

        setError(
          error.response?.data
            ?.message ||
            "Unable to save product"
        );
      } else {
        setError(
          "Unable to save product"
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate =
    async (product: Product) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to deactivate ${product.name}?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          product._id
        );

        setError("");
        setSuccess("");

        const token = getToken();

        if (!token) {
          logoutAdmin();
          return;
        }

        const response =
          await axios.delete(
            `${API_URL}/admin/products/${product._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (
          response.data.success
        ) {
          setProducts(
            (previous) =>
              previous.map(
                (item) =>
                  item._id ===
                  product._id
                    ? response.data
                        .product
                    : item
              )
          );

          setSuccess(
            response.data
              .message ||
              "Product deactivated successfully"
          );
        }
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
            return;
          }

          setError(
            error.response?.data
              ?.message ||
              "Unable to deactivate product"
          );
        } else {
          setError(
            "Unable to deactivate product"
          );
        }
      } finally {
        setActionLoading("");
      }
    };

  const handleActivate =
    async (product: Product) => {
      try {
        setActionLoading(
          product._id
        );

        setError("");
        setSuccess("");

        const token = getToken();

        if (!token) {
          logoutAdmin();
          return;
        }

        const response =
          await axios.put(
            `${API_URL}/admin/products/${product._id}`,
            {
              isActive: true,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        if (
          response.data.success
        ) {
          setProducts(
            (previous) =>
              previous.map(
                (item) =>
                  item._id ===
                  product._id
                    ? response.data
                        .product
                    : item
              )
          );

          setSuccess(
            response.data
              .message ||
              "Product activated successfully"
          );
        }
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
            return;
          }

          setError(
            error.response?.data
              ?.message ||
              "Unable to activate product"
          );
        } else {
          setError(
            "Unable to activate product"
          );
        }
      } finally {
        setActionLoading("");
      }
    };

  const filteredProducts =
    products.filter((product) => {
      const value =
        search
          .toLowerCase()
          .trim();

      return (
        product.name
          .toLowerCase()
          .includes(value) ||
        product.productType
          .toLowerCase()
          .includes(value) ||
        `${product.size} ${product.unit}`
          .toLowerCase()
          .includes(value)
      );
    });

  const totalStock =
    products.reduce(
      (total, product) =>
        total + product.stock,
      0
    );

  const activeProducts =
    products.filter(
      (product) =>
        product.isActive
    ).length;

  const inactiveProducts =
    products.filter(
      (product) =>
        !product.isActive
    ).length;

  const getPriceText = (
    product: Product
  ) => {
    if (
      product.productType ===
      "jar"
    ) {
      return `₹${product.newJarPrice} new / ₹${product.refillPrice} refill`;
    }

    return `₹${product.bottlePrice}`;
  };

  return (
    <Dashboard
      title="Products"
      subtitle="Manage products, pricing and inventory"
    >
      <div className="mb-5 flex w-full sm:mb-6 sm:justify-end">
        <button
          type="button"
          onClick={openAddModal}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 sm:w-auto sm:py-2.5"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {success && (
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

      {!showModal && error && (
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
                Total Products
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {products.length}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                All registered products
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-11 sm:w-11">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Active Products
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {activeProducts}
              </p>

              <p className="mt-2 text-xs text-emerald-600">
                Available to customers
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:h-11 sm:w-11">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Inactive Products
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {inactiveProducts}
              </p>

              <p className="mt-2 text-xs text-red-500">
                Hidden from customers
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 sm:h-11 sm:w-11">
              <X className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Total Stock
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {totalStock}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Units in inventory
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 sm:h-11 sm:w-11">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:px-5 sm:py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              Product Inventory
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              View, update and manage all AquaFlow products
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search product, type or size..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center sm:min-h-[350px]">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading products...
              </p>
            </div>
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-4 py-8 text-center sm:min-h-[350px]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Boxes className="h-8 w-8 text-slate-400" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              No products found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {search
                ? "No products match your current search."
                : "Add your first product to start managing your inventory."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={
                  openAddModal
                }
                className="mt-5 flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3 p-3 sm:p-4 lg:hidden">
              {filteredProducts.map(
                (product) => (
                  <div
                    key={
                      product._id
                    }
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600">
                        <Boxes className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="break-words font-semibold text-slate-800">
                              {
                                product.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              ID:{" "}
                              {product._id.slice(
                                -6
                              )}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              product.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {product.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Type
                        </p>

                        <p className="mt-1 text-sm font-semibold capitalize text-slate-700">
                          {
                            product.productType
                          }
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Size
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {
                            product.size
                          }{" "}
                          {
                            product.unit
                          }
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Stock
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              product.stock ===
                              0
                                ? "bg-red-500"
                                : product.stock <=
                                    10
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                          />

                          <p
                            className={`text-sm font-semibold ${
                              product.stock ===
                              0
                                ? "text-red-600"
                                : product.stock <=
                                    10
                                  ? "text-amber-600"
                                  : "text-slate-700"
                            }`}
                          >
                            {
                              product.stock
                            }
                          </p>
                        </div>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Pricing
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold text-slate-700">
                          {getPriceText(
                            product
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 min-[430px]:flex-row">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(
                            product
                          )
                        }
                        disabled={
                          actionLoading ===
                          product._id
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>

                      {product.isActive ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeactivate(
                              product
                            )
                          }
                          disabled={
                            actionLoading ===
                            product._id
                          }
                          className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionLoading ===
                          product._id
                            ? "Processing..."
                            : "Deactivate"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleActivate(
                              product
                            )
                          }
                          disabled={
                            actionLoading ===
                            product._id
                          }
                          className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {actionLoading ===
                          product._id
                            ? "Processing..."
                            : "Activate"}
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Product
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Type
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Size
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Pricing
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Stock
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map(
                    (product) => (
                      <tr
                        key={
                          product._id
                        }
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600">
                              <Boxes className="h-5 w-5" />
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {
                                  product.name
                                }
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                ID:{" "}
                                {product._id.slice(
                                  -6
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${
                              product.productType ===
                              "jar"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-cyan-50 text-cyan-700"
                            }`}
                          >
                            {
                              product.productType
                            }
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-700">
                            {
                              product.size
                            }{" "}
                            {
                              product.unit
                            }
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          {product.productType ===
                          "jar" ? (
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-slate-800">
                                ₹
                                {
                                  product.newJarPrice
                                }

                                <span className="ml-1 text-xs font-normal text-slate-400">
                                  new
                                </span>
                              </p>

                              <p className="text-xs font-medium text-slate-500">
                                ₹
                                {
                                  product.refillPrice
                                }{" "}
                                refill
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm font-semibold text-slate-800">
                              ₹
                              {
                                product.bottlePrice
                              }
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                product.stock ===
                                0
                                  ? "bg-red-500"
                                  : product.stock <=
                                      10
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                              }`}
                            />

                            <span
                              className={`text-sm font-semibold ${
                                product.stock ===
                                0
                                  ? "text-red-600"
                                  : product.stock <=
                                      10
                                    ? "text-amber-600"
                                    : "text-slate-700"
                              }`}
                            >
                              {
                                product.stock
                              }
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-400">
                            {product.stock ===
                            0
                              ? "Out of stock"
                              : product.stock <=
                                  10
                                ? "Low stock"
                                : "In stock"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              product.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                product.isActive
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                            />

                            {product.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  product
                                )
                              }
                              disabled={
                                actionLoading ===
                                product._id
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            {product.isActive ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeactivate(
                                    product
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  product._id
                                }
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {actionLoading ===
                                product._id
                                  ? "Processing..."
                                  : "Deactivate"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleActivate(
                                    product
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  product._id
                                }
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {actionLoading ===
                                product._id
                                  ? "Processing..."
                                  : "Activate"}
                              </button>
                            )}
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
          filteredProducts.length >
            0 && (
            <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-4 sm:px-6">
              <p className="text-xs text-slate-500 sm:text-sm">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {
                    filteredProducts.length
                  }
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {products.length}
                </span>{" "}
                products
              </p>
            </div>
          )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
          <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[92vh] sm:max-w-xl sm:rounded-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  {editingProduct
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                  {editingProduct
                    ? "Update product information, pricing and stock."
                    : "Enter the information for the new product."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Product Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={
                      handleChange
                    }
                    placeholder="Example: AquaFlow 20L Jar"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Product Type
                    </label>

                    <select
                      name="productType"
                      value={
                        form.productType
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    >
                      <option value="jar">
                        Jar
                      </option>

                      <option value="bottle">
                        Bottle
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Stock
                    </label>

                    <input
                      type="number"
                      name="stock"
                      value={
                        form.stock
                      }
                      onChange={
                        handleChange
                      }
                      min="0"
                      placeholder="Enter stock"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Size
                    </label>

                    <input
                      type="number"
                      name="size"
                      value={
                        form.size
                      }
                      onChange={
                        handleChange
                      }
                      min="0"
                      step="any"
                      placeholder="Example: 20"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Unit
                    </label>

                    <select
                      name="unit"
                      value={
                        form.unit
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    >
                      <option value="liter">
                        Liter
                      </option>

                      <option value="ml">
                        ML
                      </option>
                    </select>
                  </div>
                </div>

                {form.productType ===
                  "jar" && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                    <p className="mb-4 text-sm font-semibold text-slate-700">
                      Jar Pricing
                    </p>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-600">
                          New Jar Price
                        </label>

                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                            ₹
                          </span>

                          <input
                            type="number"
                            name="newJarPrice"
                            value={
                              form.newJarPrice
                            }
                            onChange={
                              handleChange
                            }
                            min="0"
                            step="any"
                            placeholder="0"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-8 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-semibold text-slate-600">
                          Refill Price
                        </label>

                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                            ₹
                          </span>

                          <input
                            type="number"
                            name="refillPrice"
                            value={
                              form.refillPrice
                            }
                            onChange={
                              handleChange
                            }
                            min="0"
                            step="any"
                            placeholder="0"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-8 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {form.productType ===
                  "bottle" && (
                  <div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Bottle Price
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                        ₹
                      </span>

                      <input
                        type="number"
                        name="bottlePrice"
                        value={
                          form.bottlePrice
                        }
                        onChange={
                          handleChange
                        }
                        min="0"
                        step="any"
                        placeholder="0"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-8 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={
                      closeModal
                    }
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2.5"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:w-auto sm:py-2.5"
                  >
                    {saving
                      ? "Saving..."
                      : editingProduct
                        ? "Update Product"
                        : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Dashboard>
  );
}

export default AdminProducts;