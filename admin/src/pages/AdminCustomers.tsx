import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Eye,
  Mail,
  MapPin,
  Phone,
  Search,
  UserCheck,
  UserRound,
  Users,
  UserX,
  X,
} from "lucide-react";
import Dashboard from "../components/Dashboard";

interface CustomerAddress {
  houseNo?: string;
  street?: string;
  city?: string;
}

interface CustomerLocation {
  latitude?: number;
  longitude?: number;
}

interface Customer {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  customerType?: string;
  address?: CustomerAddress;
  location?: CustomerLocation;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type CustomerFilter =
  | "all"
  | "active"
  | "inactive";

function AdminCustomers() {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const [customers, setCustomers] = useState<
    Customer[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<CustomerFilter>("all");

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [showDetails, setShowDetails] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getToken = () => {
    return localStorage.getItem(
      "adminToken"
    );
  };

  const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
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
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        logoutAdmin();
        return;
      }

      setError(
        error.response?.data?.message ||
          message
      );

      return;
    }

    setError(message);
  };

  const fetchCustomers = async (
    status: CustomerFilter = "all"
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
        `${API_URL}/admin/customers`;

      if (status !== "all") {
        url =
          `${API_URL}/admin/customers?status=${status}`;
      }

      const response = await axios.get(
        url,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCustomers(
        response.data.customers || []
      );
    } catch (error: unknown) {
      handleApiError(
        error,
        "Unable to fetch customers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers("all");
  }, []);

  const handleFilterChange = (
    value: CustomerFilter
  ) => {
    setStatusFilter(value);
    setSearch("");
    setError("");
    setSuccess("");

    fetchCustomers(value);
  };

  const openCustomerDetails = async (
    customerId: string
  ) => {
    try {
      setDetailsLoading(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        logoutAdmin();
        return;
      }

      const response = await axios.get(
        `${API_URL}/admin/customers/${customerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedCustomer(
        response.data.customer
      );

      setShowDetails(true);
    } catch (error: unknown) {
      handleApiError(
        error,
        "Unable to fetch customer"
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeCustomerDetails = () => {
    if (actionLoading) {
      return;
    }

    setShowDetails(false);
    setSelectedCustomer(null);
    setError("");
    setSuccess("");
  };

  const handleCustomerStatus = async (
    customer: Customer,
    isActive: boolean
  ) => {
    const message = isActive
      ? `Are you sure you want to activate ${customer.name}?`
      : `Are you sure you want to deactivate ${customer.name}?`;

    const confirmed =
      window.confirm(message);

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(customer._id);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        logoutAdmin();
        return;
      }

      const response = await axios.patch(
        `${API_URL}/admin/customers/${customer._id}/status`,
        {
          isActive,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCustomers((previous) => {
        if (
          statusFilter === "active" &&
          !isActive
        ) {
          return previous.filter(
            (item) =>
              item._id !== customer._id
          );
        }

        if (
          statusFilter === "inactive" &&
          isActive
        ) {
          return previous.filter(
            (item) =>
              item._id !== customer._id
          );
        }

        return previous.map((item) =>
          item._id === customer._id
            ? {
                ...item,
                isActive,
              }
            : item
        );
      });

      setSelectedCustomer(
        (previous) =>
          previous &&
          previous._id === customer._id
            ? {
                ...previous,
                isActive,
              }
            : previous
      );

      setSuccess(
        response.data.message ||
          (isActive
            ? "Customer activated successfully"
            : "Customer deactivated successfully")
      );
    } catch (error: unknown) {
      handleApiError(
        error,
        "Unable to update customer status"
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

    return new Date(date).toLocaleString(
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

  const filteredCustomers =
    customers.filter((customer) => {
      const value =
        search.toLowerCase().trim();

      if (!value) {
        return true;
      }

      return (
        customer.name
          ?.toLowerCase()
          .includes(value) ||
        customer.email
          ?.toLowerCase()
          .includes(value) ||
        customer.phone
          ?.toLowerCase()
          .includes(value) ||
        customer.customerType
          ?.toLowerCase()
          .includes(value)
      );
    });

  const activeCustomers =
    customers.filter(
      (customer) =>
        customer.isActive
    ).length;

  const inactiveCustomers =
    customers.filter(
      (customer) =>
        !customer.isActive
    ).length;

  return (
    <Dashboard
      title="Customers"
      subtitle="View and manage AquaFlow customers"
    >
      {success && !showDetails && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 sm:mb-6">
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

      {error && !showDetails && (
        <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 sm:mb-6">
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

      <div className="mb-5 grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 sm:mb-7 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Total Customers
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {customers.length}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Customers in current view
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 sm:h-11 sm:w-11">
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Active Customers
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {activeCustomers}
              </p>

              <p className="mt-2 text-xs text-emerald-600">
                Accounts currently active
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:h-11 sm:w-11">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm min-[520px]:col-span-2 sm:p-5 lg:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                Inactive Customers
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                {inactiveCustomers}
              </p>

              <p className="mt-2 text-xs text-red-500">
                Accounts currently disabled
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500 sm:h-11 sm:w-11">
              <UserX className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                Customer Management
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                View customer information and manage account status
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <div className="relative w-full sm:flex-1 xl:w-auto">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search customers..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50 sm:min-w-0 xl:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) =>
                  handleFilterChange(
                    e.target
                      .value as CustomerFilter
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 sm:w-auto"
              >
                <option value="all">
                  All Customers
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

              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading customers...
              </p>
            </div>
          </div>
        ) : filteredCustomers.length ===
          0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-4 text-center sm:min-h-[350px]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Users className="h-8 w-8 text-slate-400" />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              No customers found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              No customers match your search or selected filter.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredCustomers.map(
                (customer) => (
                  <div
                    key={customer._id}
                    className="p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <UserRound className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {customer.name}
                            </p>

                            <p className="mt-0.5 break-all text-xs text-slate-400">
                              {customer.email}
                            </p>
                          </div>

                          <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              customer.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                customer.isActive
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                            />

                            {customer.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] font-medium text-slate-400">
                          Phone
                        </p>

                        <p className="mt-1 break-all text-xs font-semibold text-slate-700">
                          {customer.phone}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] font-medium text-slate-400">
                          Customer Type
                        </p>

                        <p className="mt-1 text-xs font-semibold capitalize text-slate-700">
                          {customer.customerType ||
                            "Customer"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-medium text-slate-400">
                        Joined
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-600">
                        {formatDate(
                          customer.createdAt
                        )}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 min-[420px]:flex-row">
                      <button
                        type="button"
                        onClick={() =>
                          openCustomerDetails(
                            customer._id
                          )
                        }
                        disabled={
                          detailsLoading
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </button>

                      {customer.isActive ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleCustomerStatus(
                              customer,
                              false
                            )
                          }
                          disabled={
                            actionLoading ===
                            customer._id
                          }
                          className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          {actionLoading ===
                          customer._id
                            ? "Processing..."
                            : "Deactivate"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleCustomerStatus(
                              customer,
                              true
                            )
                          }
                          disabled={
                            actionLoading ===
                            customer._id
                          }
                          className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                        >
                          {actionLoading ===
                          customer._id
                            ? "Processing..."
                            : "Activate"}
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[950px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Customer
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Phone
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Type
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Joined
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map(
                    (customer) => (
                      <tr
                        key={customer._id}
                        className="transition hover:bg-slate-50/80"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              <UserRound className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800">
                                {customer.name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                {customer.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                          {customer.phone}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
                            {customer.customerType ||
                              "Customer"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              customer.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                customer.isActive
                                  ? "bg-emerald-500"
                                  : "bg-red-500"
                              }`}
                            />

                            {customer.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-500">
                          {formatDate(
                            customer.createdAt
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openCustomerDetails(
                                  customer._id
                                )
                              }
                              disabled={
                                detailsLoading
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {customer.isActive ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCustomerStatus(
                                    customer,
                                    false
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  customer._id
                                }
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                              >
                                {actionLoading ===
                                customer._id
                                  ? "Processing..."
                                  : "Deactivate"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCustomerStatus(
                                    customer,
                                    true
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  customer._id
                                }
                                className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                              >
                                {actionLoading ===
                                customer._id
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
          filteredCustomers.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-4 sm:px-6">
              <p className="text-xs text-slate-500 sm:text-sm">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredCustomers.length}
                </span>{" "}
                customer
                {filteredCustomers.length !==
                1
                  ? "s"
                  : ""}
              </p>
            </div>
          )}
      </div>

      {showDetails &&
        selectedCustomer && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6">
            <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-h-[92vh] sm:max-w-2xl sm:rounded-2xl">
              <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    Customer Details
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    View customer account information
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeCustomerDetails
                  }
                  className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
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

                <div className="flex flex-col items-center rounded-2xl bg-slate-50 p-5 text-center sm:p-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 sm:h-20 sm:w-20">
                    <UserRound className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>

                  <h3 className="mt-4 break-words text-lg font-bold text-slate-900 sm:text-xl">
                    {selectedCustomer.name}
                  </h3>

                  <span
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      selectedCustomer.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        selectedCustomer.isActive
                          ? "bg-emerald-500"
                          : "bg-red-500"
                      }`}
                    />

                    {selectedCustomer.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="min-w-0 rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="h-4 w-4 shrink-0" />

                      <p className="text-xs font-medium">
                        Email
                      </p>
                    </div>

                    <p className="mt-2 break-all text-sm font-semibold text-slate-700">
                      {selectedCustomer.email}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="h-4 w-4 shrink-0" />

                      <p className="text-xs font-medium">
                        Phone
                      </p>
                    </div>

                    <p className="mt-2 break-all text-sm font-semibold text-slate-700">
                      {selectedCustomer.phone}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Customer Type
                    </p>

                    <p className="mt-2 text-sm font-semibold capitalize text-slate-700">
                      {selectedCustomer.customerType ||
                        "Customer"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Joined
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {formatDate(
                        selectedCustomer.createdAt
                      )}
                    </p>
                  </div>
                </div>

                {selectedCustomer.address && (
                  <div className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5 shrink-0 text-red-500" />

                      <h3 className="font-bold text-slate-800">
                        Address
                      </h3>
                    </div>

                    <p className="break-words text-sm leading-6 text-slate-600">
                      {selectedCustomer
                        .address.houseNo ||
                        ""}
                      {selectedCustomer.address
                        .street
                        ? `, ${selectedCustomer.address.street}`
                        : ""}
                      {selectedCustomer.address
                        .city
                        ? `, ${selectedCustomer.address.city}`
                        : ""}
                    </p>

                    {selectedCustomer
                      .location
                      ?.latitude !==
                      undefined &&
                      selectedCustomer
                        .location
                        ?.longitude !==
                        undefined && (
                        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                          <p className="break-all">
                            Latitude:{" "}
                            {
                              selectedCustomer
                                .location
                                .latitude
                            }
                          </p>

                          <p className="mt-1 break-all">
                            Longitude:{" "}
                            {
                              selectedCustomer
                                .location
                                .longitude
                            }
                          </p>
                        </div>
                      )}
                  </div>
                )}

                <div className="border-t border-slate-200 pt-5">
                  {selectedCustomer.isActive ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleCustomerStatus(
                          selectedCustomer,
                          false
                        )
                      }
                      disabled={
                        actionLoading ===
                        selectedCustomer._id
                      }
                      className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      {actionLoading ===
                      selectedCustomer._id
                        ? "Processing..."
                        : "Deactivate Customer"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleCustomerStatus(
                          selectedCustomer,
                          true
                        )
                      }
                      disabled={
                        actionLoading ===
                        selectedCustomer._id
                      }
                      className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {actionLoading ===
                      selectedCustomer._id
                        ? "Processing..."
                        : "Activate Customer"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
    </Dashboard>
  );
}

export default AdminCustomers;