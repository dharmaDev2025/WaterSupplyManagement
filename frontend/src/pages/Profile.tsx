import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LocationPicker from "../components/LocationPicker";

import api from "../services/api";

interface Address {
  houseNo: string;
  street: string;
  city: string;
}

interface Location {
  latitude: number | null;
  longitude: number | null;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  customerType: string;

  address: Address;
  location: Location;

  authProvider?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

function Profile() {
  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [customerType, setCustomerType] =
    useState("home");

  // ==========================================
  // ADDRESS
  // ==========================================

  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");

  // ==========================================
  // LOCATION
  // ==========================================

  const [latitude, setLatitude] =
    useState<number | null>(null);

  const [longitude, setLongitude] =
    useState<number | null>(null);

  const [
    showLocationPicker,
    setShowLocationPicker,
  ] = useState(false);

  // ==========================================
  // LOADING STATES
  // ==========================================

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    locationLoading,
    setLocationLoading,
  ] = useState(false);

  // ==========================================
  // MESSAGES
  // ==========================================

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================
  // FETCH PROFILE
  // ==========================================

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/customers/profile"
      );

      console.log(
        "Customer Profile:",
        response.data
      );

      const data = response.data.customer;

      setCustomer(data);

      setName(data.name || "");
      setPhone(data.phone || "");

      setCustomerType(
        data.customerType || "home"
      );

      setHouseNo(
        data.address?.houseNo || ""
      );

      setStreet(
        data.address?.street || ""
      );

      setCity(
        data.address?.city || ""
      );

      setLatitude(
        data.location?.latitude ?? null
      );

      setLongitude(
        data.location?.longitude ?? null
      );
    } catch (err: unknown) {
      console.log(
        "Profile Fetch Error:",
        err
      );

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Unable to load profile."
        );
      } else {
        setError(
          "Something went wrong."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {
    fetchProfile();
  }, []);

  // ==========================================
  // UPDATE PROFILE + ADDRESS
  // ==========================================

  const handleUpdateProfile = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await api.put(
        "/customers/profile",
        {
          name: name.trim(),
          phone: phone.trim(),
          customerType,

          address: {
            houseNo: houseNo.trim(),
            street: street.trim(),
            city: city.trim(),
          },
        }
      );

      console.log(
        "Profile Update:",
        response.data
      );

      setMessage(
        response.data.message ||
          "Profile updated successfully."
      );

      await fetchProfile();
    } catch (err: unknown) {
      console.log(
        "Profile Update Error:",
        err
      );

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Unable to update profile."
        );
      } else {
        setError(
          "Something went wrong."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // CONFIRM MAP LOCATION
  // ==========================================

  const handleConfirmLocation = async (
    newLatitude: number,
    newLongitude: number
  ) => {
    try {
      setLocationLoading(true);
      setMessage("");
      setError("");

      // Save coordinates to backend
      const response = await api.put(
        "/customers/location",
        {
          latitude: newLatitude,
          longitude: newLongitude,
        }
      );

      // Update frontend state
      setLatitude(newLatitude);
      setLongitude(newLongitude);

      // Close map
      setShowLocationPicker(false);

      setMessage(
        response.data.message ||
          "Delivery location updated successfully."
      );
    } catch (err: unknown) {
      console.log(
        "Location Update Error:",
        err
      );

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Unable to update delivery location."
        );
      } else {
        setError(
          "Unable to update delivery location."
        );
      }
    } finally {
      setLocationLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <Navbar />

        <main className="flex flex-1 items-center justify-center pt-20">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading your profile...
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ==========================================
  // PROFILE PAGE
  // ==========================================

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* ================================= */}
        {/* PAGE HEADER */}
        {/* ================================= */}

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              My Account
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              My Profile
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your personal information,
              delivery address and location.
            </p>
          </div>
        </section>

        {/* ================================= */}
        {/* CONTENT */}
        {/* ================================= */}

        <section className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
          {/* SUCCESS */}

          {message && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
              ✓ {message}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            {/* ================================= */}
            {/* LEFT PROFILE CARD */}
            {/* ================================= */}

            <aside>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {/* AVATAR */}

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-3xl font-bold uppercase text-white shadow-md">
                  {customer?.name
                    ?.charAt(0)
                    .toUpperCase() || "U"}
                </div>

                <h2 className="mt-5 text-xl font-bold text-slate-900">
                  {customer?.name}
                </h2>

                <p className="mt-1 break-all text-sm text-slate-500">
                  {customer?.email}
                </p>

                {/* CUSTOMER TYPE */}

                <div className="mt-4">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-600">
                    {customer?.customerType}
                  </span>
                </div>

                <div className="my-5 border-t border-slate-100" />

                {/* ACCOUNT INFORMATION */}

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Phone
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {customer?.phone ||
                        "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Login Method
                    </p>

                    <p className="mt-1 text-sm font-medium capitalize text-slate-700">
                      {customer?.authProvider ||
                        "local"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Account Status
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          customer?.isActive
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`}
                      />

                      <p className="text-sm font-medium text-slate-700">
                        {customer?.isActive
                          ? "Active"
                          : "Inactive"}
                      </p>
                    </div>
                  </div>

                  {customer?.createdAt && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Member Since
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {new Date(
                          customer.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </aside>

            {/* ================================= */}
            {/* RIGHT SIDE */}
            {/* ================================= */}

            <div className="space-y-6">
              <form
                onSubmit={handleUpdateProfile}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* FORM HEADER */}

                <div className="border-b border-slate-100 px-6 py-5">
                  <h2 className="text-lg font-bold text-slate-900">
                    Personal Information
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Update your basic account
                    information.
                  </p>
                </div>

                <div className="p-6">
                  {/* PERSONAL DETAILS */}

                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* NAME */}

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-700">
                        Full Name
                      </label>

                      <input
                        type="text"
                        value={name}
                        onChange={(e) =>
                          setName(e.target.value)
                        }
                        required
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* PHONE */}

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-700">
                        Phone Number
                      </label>

                      <input
                        type="text"
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* EMAIL */}

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-700">
                        Email Address
                      </label>

                      <input
                        type="email"
                        value={
                          customer?.email || ""
                        }
                        disabled
                        className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500"
                      />

                      <p className="mt-1.5 text-[10px] text-slate-400">
                        Email cannot be changed
                        from this page.
                      </p>
                    </div>

                    {/* CUSTOMER TYPE */}

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-700">
                        Customer Type
                      </label>

                      <select
                        value={customerType}
                        onChange={(e) =>
                          setCustomerType(
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="home">
                          Home
                        </option>

                        <option value="office">
                          Office
                        </option>

                        <option value="shop">
                          Shop
                        </option>

                        <option value="hotel">
                          Hotel
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* ================================= */}
                  {/* DELIVERY ADDRESS */}
                  {/* ================================= */}

                  <div className="my-6 border-t border-slate-100" />

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Delivery Address
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      This address and map location
                      will be used during water
                      delivery.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    {/* HOUSE NUMBER */}

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-700">
                        House / Building No.
                      </label>

                      <input
                        type="text"
                        value={houseNo}
                        onChange={(e) =>
                          setHouseNo(
                            e.target.value
                          )
                        }
                        placeholder="Example: H-101"
                        className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* STREET */}

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-700">
                        Street / Area
                      </label>

                      <input
                        type="text"
                        value={street}
                        onChange={(e) =>
                          setStreet(
                            e.target.value
                          )
                        }
                        placeholder="Street name"
                        className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* CITY */}

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-semibold text-slate-700">
                        City
                      </label>

                      <input
                        type="text"
                        value={city}
                        onChange={(e) =>
                          setCity(e.target.value)
                        }
                        placeholder="City"
                        className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* ================================= */}
                    {/* MAP LOCATION */}
                    {/* ================================= */}

                    <div className="sm:col-span-2">
                      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-lg">
                                📍
                              </div>

                              <div>
                                <p className="text-sm font-bold text-slate-800">
                                  Exact Delivery
                                  Location
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                  Select your
                                  location on the
                                  map.
                                </p>
                              </div>
                            </div>

                            {/* LOCATION STATUS */}

                            {latitude !== null &&
                            longitude !== null ? (
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-emerald-600">
                                  ✓ Delivery
                                  location selected
                                </p>

                                <p className="mt-1 text-[10px] text-slate-400">
                                  {latitude.toFixed(
                                    6
                                  )}
                                  ,{" "}
                                  {longitude.toFixed(
                                    6
                                  )}
                                </p>
                              </div>
                            ) : (
                              <p className="mt-3 text-xs font-medium text-amber-600">
                                No map location
                                selected yet.
                              </p>
                            )}
                          </div>

                          {/* MAP BUTTON */}

                          <button
                            type="button"
                            onClick={() => {
                              setMessage("");
                              setError("");

                              setShowLocationPicker(
                                true
                              );
                            }}
                            disabled={
                              locationLoading
                            }
                            className="shrink-0 rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-600 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {locationLoading
                              ? "Saving..."
                              : latitude !==
                                  null &&
                                longitude !==
                                  null
                              ? "📍 Change Location"
                              : "📍 Choose Location"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ================================= */}
                  {/* SAVE PROFILE */}
                  {/* ================================= */}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* ========================================== */}
      {/* LOCATION MAP MODAL */}
      {/* ========================================== */}

      {showLocationPicker && (
        <LocationPicker
          initialLatitude={latitude}
          initialLongitude={longitude}
          onConfirm={
            handleConfirmLocation
          }
          onClose={() =>
            setShowLocationPicker(false)
          }
        />
      )}
    </div>
  );
}

export default Profile;