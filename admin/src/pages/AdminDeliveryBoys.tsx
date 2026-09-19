import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Eye,
  Pencil,
  Plus,
  Search,
  Truck,
  UserCheck,
  UserX,
  X,
  KeyRound,
  Mail,
  Phone,
  Package,
  CheckCircle2,
} from "lucide-react";
import Dashboard from "../components/Dashboard";

interface DeliveryBoy {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  isActive: boolean;
  totalOrders?: number;
  activeOrders?: number;
  deliveredOrders?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface DeliveryBoyForm {
  name: string;
  email: string;
  phone: string;
  age: string;
  password: string;
}

interface PasswordForm {
  newPassword: string;
  confirmPassword: string;
}

type StatusFilter = "all" | "active" | "inactive";

const emptyForm: DeliveryBoyForm = {
  name: "",
  email: "",
  phone: "",
  age: "",
  password: "",
};

const emptyPasswordForm: PasswordForm = {
  newPassword: "",
  confirmPassword: "",
};

function AdminDeliveryBoys() {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [editingDeliveryBoy, setEditingDeliveryBoy] =
    useState<DeliveryBoy | null>(null);

  const [selectedDeliveryBoy, setSelectedDeliveryBoy] =
    useState<DeliveryBoy | null>(null);

  const [form, setForm] = useState<DeliveryBoyForm>(emptyForm);

  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>(emptyPasswordForm);

  const getToken = () => {
    return localStorage.getItem("adminToken");
  };

  const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    sessionStorage.removeItem("adminEmail");
    navigate("/");
  };

  const handleApiError = (
    error: unknown,
    defaultMessage: string
  ) => {
    if (axios.isAxiosError(error)) {
      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        logoutAdmin();
        return;
      }

      setError(
        error.response?.data?.message || defaultMessage
      );

      return;
    }

    setError(defaultMessage);
  };

  const fetchDeliveryBoys = async (
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

      let url = `${API_URL}/admin/delivery-boys`;

      if (status !== "all") {
        url = `${API_URL}/admin/delivery-boys?status=${status}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDeliveryBoys(
        response.data.deliveryBoys || []
      );
    } catch (error: unknown) {
      handleApiError(
        error,
        "Unable to fetch delivery boys"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryBoys("all");
  }, []);

  const handleFilterChange = (
    value: StatusFilter
  ) => {
    setStatusFilter(value);
    setSearch("");
    setError("");
    setSuccess("");
    fetchDeliveryBoys(value);
  };

  const openAddModal = () => {
    setEditingDeliveryBoy(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowFormModal(true);
  };

  const openEditModal = (
    deliveryBoy: DeliveryBoy
  ) => {
    setEditingDeliveryBoy(deliveryBoy);

    setForm({
      name: deliveryBoy.name,
      email: deliveryBoy.email,
      phone: deliveryBoy.phone,
      age: String(deliveryBoy.age),
      password: "",
    });

    setError("");
    setSuccess("");
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    if (actionLoading) {
      return;
    }

    setShowFormModal(false);
    setEditingDeliveryBoy(null);
    setForm(emptyForm);
    setError("");
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.age
    ) {
      setError(
        "Name, email, phone and age are required"
      );
      return;
    }

    if (Number(form.age) < 18) {
      setError(
        "Delivery boy must be at least 18 years old"
      );
      return;
    }

    if (
      !editingDeliveryBoy &&
      form.password.length < 6
    ) {
      setError(
        "Password must be at least 6 characters"
      );
      return;
    }

    try {
      setActionLoading("form");

      const token = getToken();

      if (!token) {
        logoutAdmin();
        return;
      }

      if (editingDeliveryBoy) {
        const response = await axios.put(
          `${API_URL}/admin/delivery-boys/${editingDeliveryBoy._id}`,
          {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            age: Number(form.age),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const updated =
          response.data.deliveryBoy;

        setDeliveryBoys((previous) =>
          previous.map((deliveryBoy) =>
            deliveryBoy._id ===
            editingDeliveryBoy._id
              ? {
                  ...deliveryBoy,
                  name: updated.name,
                  email: updated.email,
                  phone: updated.phone,
                  age: updated.age,
                  isActive:
                    updated.isActive,
                }
              : deliveryBoy
          )
        );

        setSuccess(
          response.data.message ||
            "Delivery boy updated successfully"
        );
      } else {
        const response = await axios.post(
          `${API_URL}/admin/delivery-boys`,
          {
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            password: form.password,
            age: Number(form.age),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSuccess(
          response.data.message ||
            "Delivery boy added successfully"
        );

        await fetchDeliveryBoys(
          statusFilter
        );
      }

      setShowFormModal(false);
      setEditingDeliveryBoy(null);
      setForm(emptyForm);
    } catch (error: unknown) {
      handleApiError(
        error,
        editingDeliveryBoy
          ? "Unable to update delivery boy"
          : "Unable to add delivery boy"
      );
    } finally {
      setActionLoading("");
    }
  };

  const openDetails = async (
    id: string
  ) => {
    try {
      setActionLoading(`view-${id}`);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        logoutAdmin();
        return;
      }

      const response = await axios.get(
        `${API_URL}/admin/delivery-boys/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedDeliveryBoy(
        response.data.deliveryBoy
      );

      setShowDetailsModal(true);
    } catch (error: unknown) {
      handleApiError(
        error,
        "Unable to fetch delivery boy"
      );
    } finally {
      setActionLoading("");
    }
  };

  const openPasswordModal = (
    deliveryBoy: DeliveryBoy
  ) => {
    setSelectedDeliveryBoy(deliveryBoy);
    setPasswordForm(emptyPasswordForm);
    setError("");
    setSuccess("");
    setShowPasswordModal(true);
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!selectedDeliveryBoy) {
      return;
    }

    setError("");
    setSuccess("");

    if (
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setError(
        "Enter new password and confirm password"
      );
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setError(
        "Passwords do not match"
      );
      return;
    }

    if (
      passwordForm.newPassword.length < 6
    ) {
      setError(
        "Password must be at least 6 characters"
      );
      return;
    }

    try {
      setActionLoading("password");

      const token = getToken();

      if (!token) {
        logoutAdmin();
        return;
      }

      const response = await axios.patch(
        `${API_URL}/admin/delivery-boys/${selectedDeliveryBoy._id}/password`,
        {
          newPassword:
            passwordForm.newPassword,
          confirmPassword:
            passwordForm.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(
        response.data.message ||
          "Delivery boy password updated successfully"
      );

      setShowPasswordModal(false);
      setPasswordForm(
        emptyPasswordForm
      );
    } catch (error: unknown) {
      handleApiError(
        error,
        "Unable to update delivery boy password"
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleStatusChange = async (
    deliveryBoy: DeliveryBoy,
    isActive: boolean
  ) => {
    const confirmed =
      window.confirm(
        isActive
          ? `Activate ${deliveryBoy.name}?`
          : `Deactivate ${deliveryBoy.name}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(
        `status-${deliveryBoy._id}`
      );

      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        logoutAdmin();
        return;
      }

      const response = await axios.patch(
        `${API_URL}/admin/delivery-boys/${deliveryBoy._id}/status`,
        {
          isActive,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDeliveryBoys((previous) => {
        if (
          statusFilter === "active" &&
          !isActive
        ) {
          return previous.filter(
            (item) =>
              item._id !==
              deliveryBoy._id
          );
        }

        if (
          statusFilter === "inactive" &&
          isActive
        ) {
          return previous.filter(
            (item) =>
              item._id !==
              deliveryBoy._id
          );
        }

        return previous.map((item) =>
          item._id === deliveryBoy._id
            ? {
                ...item,
                isActive,
              }
            : item
        );
      });

      setSelectedDeliveryBoy(
        (previous) =>
          previous &&
          previous._id ===
            deliveryBoy._id
            ? {
                ...previous,
                isActive,
              }
            : previous
      );

      setSuccess(
        response.data.message ||
          "Delivery boy status updated successfully"
      );
    } catch (error: unknown) {
      handleApiError(
        error,
        "Unable to update delivery boy status"
      );
    } finally {
      setActionLoading("");
    }
  };

  const formatDate = (
    date?: string
  ) => {
    if (!date) {
      return "N/A";
    }

    return new Date(
      date
    ).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredDeliveryBoys =
    deliveryBoys.filter(
      (deliveryBoy) => {
        const value =
          search
            .toLowerCase()
            .trim();

        if (!value) {
          return true;
        }

        return (
          deliveryBoy.name
            ?.toLowerCase()
            .includes(value) ||
          deliveryBoy.email
            ?.toLowerCase()
            .includes(value) ||
          deliveryBoy.phone
            ?.toLowerCase()
            .includes(value)
        );
      }
    );

  const activeDeliveryBoys =
    deliveryBoys.filter(
      (deliveryBoy) =>
        deliveryBoy.isActive
    ).length;

  const inactiveDeliveryBoys =
    deliveryBoys.filter(
      (deliveryBoy) =>
        !deliveryBoy.isActive
    ).length;

  const totalActiveOrders =
    deliveryBoys.reduce(
      (total, deliveryBoy) =>
        total +
        (deliveryBoy.activeOrders || 0),
      0
    );

  return (
    <Dashboard
      title="Delivery Boys"
      subtitle="Manage delivery staff and their workloads"
    >
      <div className="mb-5 sm:mb-6 flex">
        <button
          type="button"
          onClick={openAddModal}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:ml-auto sm:w-auto sm:py-2.5"
        >
          <Plus className="h-4 w-4" />
          Add Delivery Boy
        </button>
      </div>

      {success &&
        !showFormModal &&
        !showDetailsModal &&
        !showPasswordModal && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 sm:mb-6">
            <span className="min-w-0 break-words">
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
        !showFormModal &&
        !showDetailsModal &&
        !showPasswordModal && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 sm:mb-6">
            <span className="min-w-0 break-words">
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
                Total Delivery Boys
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {deliveryBoys.length}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-11 sm:w-11">
              <Truck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Active
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {activeDeliveryBoys}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:h-11 sm:w-11">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Inactive
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {inactiveDeliveryBoys}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 sm:h-11 sm:w-11">
              <UserX className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Active Deliveries
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {totalActiveOrders}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 sm:h-11 sm:w-11">
              <Package className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                Delivery Staff
              </h3>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                View, edit and manage delivery staff
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <div className="relative w-full sm:flex-1 xl:w-64">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search delivery boy..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 sm:w-auto"
              >
                <option value="all">
                  All Staff
                </option>

                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center sm:min-h-[350px]">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm text-slate-500">
                Loading delivery boys...
              </p>
            </div>
          </div>
        ) : filteredDeliveryBoys.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-4 text-center sm:min-h-[350px]">
            <Truck className="h-12 w-12 text-slate-300" />

            <h3 className="mt-4 font-semibold text-slate-800">
              No delivery boys found
            </h3>
          </div>
        ) : (
          <>
            <div className="space-y-3 p-3 sm:p-4 lg:hidden">
              {filteredDeliveryBoys.map(
                (deliveryBoy) => (
                  <div
                    key={deliveryBoy._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Truck className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-800 sm:text-base">
                            {deliveryBoy.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {deliveryBoy.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          deliveryBoy.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            deliveryBoy.isActive
                              ? "bg-emerald-500"
                              : "bg-red-500"
                          }`}
                        />

                        {deliveryBoy.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-400">
                          Phone
                        </p>

                        <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                          {deliveryBoy.phone}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-400">
                          Age
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {deliveryBoy.age} years
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-blue-50 p-3 text-center">
                        <p className="text-lg font-bold text-slate-800">
                          {deliveryBoy.totalOrders ||
                            0}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-500">
                          Total
                        </p>
                      </div>

                      <div className="rounded-xl bg-violet-50 p-3 text-center">
                        <p className="text-lg font-bold text-slate-800">
                          {deliveryBoy.activeOrders ||
                            0}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-500">
                          Active
                        </p>
                      </div>

                      <div className="rounded-xl bg-emerald-50 p-3 text-center">
                        <p className="text-lg font-bold text-slate-800">
                          {deliveryBoy.deliveredOrders ||
                            0}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-500">
                          Delivered
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openDetails(
                            deliveryBoy._id
                          )
                        }
                        disabled={
                          actionLoading ===
                          `view-${deliveryBoy._id}`
                        }
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-2 py-2.5 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(
                            deliveryBoy
                          )
                        }
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-2 py-2.5 text-xs font-semibold text-slate-600 hover:bg-amber-50 hover:text-amber-600"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openPasswordModal(
                            deliveryBoy
                          )
                        }
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-2 py-2.5 text-xs font-semibold text-slate-600 hover:bg-violet-50 hover:text-violet-600"
                      >
                        <KeyRound className="h-4 w-4" />
                        Password
                      </button>
                    </div>

                    {deliveryBoy.isActive ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(
                            deliveryBoy,
                            false
                          )
                        }
                        disabled={
                          actionLoading ===
                          `status-${deliveryBoy._id}`
                        }
                        className="mt-2 w-full rounded-xl bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        {actionLoading ===
                        `status-${deliveryBoy._id}`
                          ? "Processing..."
                          : "Deactivate"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleStatusChange(
                            deliveryBoy,
                            true
                          )
                        }
                        disabled={
                          actionLoading ===
                          `status-${deliveryBoy._id}`
                        }
                        className="mt-2 w-full rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                      >
                        {actionLoading ===
                        `status-${deliveryBoy._id}`
                          ? "Processing..."
                          : "Activate"}
                      </button>
                    )}
                  </div>
                )
              )}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Delivery Boy
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-slate-500">
                      Age
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-slate-500">
                      Active Orders
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-slate-500">
                      Delivered
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredDeliveryBoys.map(
                    (deliveryBoy) => (
                      <tr
                        key={deliveryBoy._id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-800">
                            {deliveryBoy.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {deliveryBoy.email}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {deliveryBoy.phone}
                        </td>

                        <td className="px-6 py-4 text-center text-sm text-slate-600">
                          {deliveryBoy.age}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className="rounded-lg bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                            {deliveryBoy.activeOrders ||
                              0}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {deliveryBoy.deliveredOrders ||
                              0}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              deliveryBoy.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                deliveryBoy.isActive
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                            />

                            {deliveryBoy.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openDetails(
                                  deliveryBoy._id
                                )
                              }
                              disabled={
                                actionLoading ===
                                `view-${deliveryBoy._id}`
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  deliveryBoy
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-amber-50 hover:text-amber-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openPasswordModal(
                                  deliveryBoy
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-violet-50 hover:text-violet-600"
                            >
                              <KeyRound className="h-4 w-4" />
                            </button>

                            {deliveryBoy.isActive ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(
                                    deliveryBoy,
                                    false
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  `status-${deliveryBoy._id}`
                                }
                                className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                              >
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleStatusChange(
                                    deliveryBoy,
                                    true
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  `status-${deliveryBoy._id}`
                                }
                                className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                              >
                                Activate
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
      </div>

      {showFormModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
          <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  {editingDeliveryBoy
                    ? "Edit Delivery Boy"
                    : "Add Delivery Boy"}
                </h2>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  {editingDeliveryBoy
                    ? "Update delivery staff information"
                    : "Create a new delivery staff account"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-4 sm:p-6"
            >
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Age
                  </label>

                  <input
                    type="number"
                    min="18"
                    name="age"
                    value={form.age}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />
                </div>
              </div>

              {!editingDeliveryBoy && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Minimum 6 characters
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  actionLoading === "form"
                }
                className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading === "form"
                  ? "Processing..."
                  : editingDeliveryBoy
                    ? "Update Delivery Boy"
                    : "Add Delivery Boy"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal &&
        selectedDeliveryBoy && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
            <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl">
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-900">
                    Change Password
                  </h2>

                  <p className="mt-1 truncate text-sm text-slate-500">
                    {selectedDeliveryBoy.name}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(
                      false
                    );
                    setError("");
                  }}
                  className="shrink-0 rounded-lg p-2 hover:bg-slate-100"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <form
                onSubmit={
                  handlePasswordSubmit
                }
                className="space-y-4 p-4 sm:p-6"
              >
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    New Password
                  </label>

                  <input
                    type="password"
                    name="newPassword"
                    value={
                      passwordForm.newPassword
                    }
                    onChange={
                      handlePasswordChange
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={
                      passwordForm.confirmPassword
                    }
                    onChange={
                      handlePasswordChange
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    actionLoading ===
                    "password"
                  }
                  className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {actionLoading ===
                  "password"
                    ? "Updating..."
                    : "Update Password"}
                </button>
              </form>
            </div>
          </div>
        )}

      {showDetailsModal &&
        selectedDeliveryBoy && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
            <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
              <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    Delivery Boy Details
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Account and delivery information
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowDetailsModal(
                      false
                    );
                    setError("");
                  }}
                  className="shrink-0 rounded-lg p-2 hover:bg-slate-100"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
                <div className="rounded-2xl bg-slate-50 p-4 text-center sm:p-6">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 sm:h-16 sm:w-16">
                    <Truck className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>

                  <h3 className="mt-3 break-words text-lg font-bold text-slate-900 sm:text-xl">
                    {selectedDeliveryBoy.name}
                  </h3>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedDeliveryBoy.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {selectedDeliveryBoy.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="min-w-0 rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Mail className="h-4 w-4 shrink-0" />
                      Email
                    </div>

                    <p className="mt-2 break-all text-sm font-semibold text-slate-700">
                      {selectedDeliveryBoy.email}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Phone className="h-4 w-4 shrink-0" />
                      Phone
                    </div>

                    <p className="mt-2 break-all text-sm font-semibold text-slate-700">
                      {selectedDeliveryBoy.phone}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="rounded-xl bg-blue-50 p-3 text-center sm:p-4">
                    <Package className="mx-auto h-5 w-5 text-blue-600" />

                    <p className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                      {selectedDeliveryBoy.totalOrders ||
                        0}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                      Total
                    </p>
                  </div>

                  <div className="rounded-xl bg-violet-50 p-3 text-center sm:p-4">
                    <Truck className="mx-auto h-5 w-5 text-violet-600" />

                    <p className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                      {selectedDeliveryBoy.activeOrders ||
                        0}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                      Active
                    </p>
                  </div>

                  <div className="rounded-xl bg-emerald-50 p-3 text-center sm:p-4">
                    <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" />

                    <p className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                      {selectedDeliveryBoy.deliveredOrders ||
                        0}
                    </p>

                    <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">
                      Delivered
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-400">
                      Age
                    </p>

                    <p className="mt-1 font-semibold text-slate-700">
                      {selectedDeliveryBoy.age}{" "}
                      years
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Joined
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {formatDate(
                        selectedDeliveryBoy.createdAt
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </Dashboard>
  );
}

export default AdminDeliveryBoys;