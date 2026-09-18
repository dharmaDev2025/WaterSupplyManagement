import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import api from "../services/api";


interface Location {
  latitude: number;
  longitude: number;
}


function Register() {

  const navigate = useNavigate();


  // ==========================================
  // FORM STATES
  // ==========================================

  const [name, setName] =
    useState<string>("");

  const [phone, setPhone] =
    useState<string>("");

  const [email, setEmail] =
    useState<string>("");

  const [customerType, setCustomerType] =
    useState<string>("home");

  const [houseNo, setHouseNo] =
    useState<string>("");

  const [street, setStreet] =
    useState<string>("");

  const [city, setCity] =
    useState<string>("");

  const [password, setPassword] =
    useState<string>("");

  const [confirmPassword, setConfirmPassword] =
    useState<string>("");

  const [showPassword, setShowPassword] =
    useState<boolean>(false);


  // ==========================================
  // LOCATION STATES
  // ==========================================

  const [location, setLocation] =
    useState<Location | null>(null);

  const [locationLoading, setLocationLoading] =
    useState<boolean>(false);

  const [locationError, setLocationError] =
    useState<string>("");


  // ==========================================
  // OTHER STATES
  // ==========================================

  const [loading, setLoading] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");


  // ==========================================
  // GET CURRENT LOCATION
  // ==========================================

  const getCurrentLocation = () => {

    setLocationError("");
    setLocationLoading(true);


    if (!navigator.geolocation) {

      setLocationError(
        "Geolocation is not supported by your browser."
      );

      setLocationLoading(false);

      return;
    }


    navigator.geolocation.getCurrentPosition(

      // SUCCESS
      (position) => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        setLocation({
          latitude,
          longitude,
        });


        setLocationLoading(false);
      },


      // ERROR
      (err) => {

        console.log(
          "Location Error:",
          err
        );


        if (err.code === 1) {

          setLocationError(
            "Location permission denied. Please allow location access."
          );

        } else if (err.code === 2) {

          setLocationError(
            "Unable to detect your current location."
          );

        } else if (err.code === 3) {

          setLocationError(
            "Location request timed out."
          );

        } else {

          setLocationError(
            "Something went wrong while getting your location."
          );
        }


        setLocationLoading(false);
      },


      // OPTIONS
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };


  // ==========================================
  // REGISTER
  // ==========================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    setError("");


    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (!name.trim()) {

      setError(
        "Please enter your full name."
      );

      return;
    }


    if (!phone.trim()) {

      setError(
        "Please enter your phone number."
      );

      return;
    }


    if (!email.trim()) {

      setError(
        "Please enter your email address."
      );

      return;
    }


    if (
      !houseNo.trim() ||
      !street.trim() ||
      !city.trim()
    ) {

      setError(
        "Please enter your complete address."
      );

      return;
    }


    // ==========================================
    // PASSWORD VALIDATION
    // ==========================================

    if (password.length < 6) {

      setError(
        "Password must contain at least 6 characters."
      );

      return;
    }


    if (password !== confirmPassword) {

      setError(
        "Password and confirm password do not match."
      );

      return;
    }


    // ==========================================
    // LOCATION VALIDATION
    // ==========================================

    if (!location) {

      setError(
        "Please select your current location."
      );

      return;
    }


    try {

      setLoading(true);


      // ==========================================
      // REGISTER API
      // ==========================================

      const response = await api.post(
        "/auth/register",
        {
          name: name.trim(),

          phone: phone.trim(),

          email: email
            .trim()
            .toLowerCase(),

          password,

          customerType,

          address: {
            houseNo: houseNo.trim(),
            street: street.trim(),
            city: city.trim(),
          },

          location: {
            latitude:
              location.latitude,

            longitude:
              location.longitude,
          },
        }
      );


      console.log(
        "Register Response:",
        response.data
      );


      alert(
        response.data.message ||
        "Registration successful"
      );


      // Registration successful
      // Customer now logs in
      navigate("/");


    } catch (err: unknown) {

      console.log(
        "Registration Error:",
        err
      );


      if (axios.isAxiosError(err)) {

        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Registration failed."
        );

      } else {

        setError(
          "Something went wrong. Please try again."
        );
      }

    } finally {

      setLoading(false);
    }
  };


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 p-4 md:p-8">


      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl items-center justify-center">


        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">


          {/* ================================= */}
          {/* LEFT SIDE */}
          {/* ================================= */}

          <div className="relative hidden min-h-[850px] overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">


            {/* Decorative Circles */}

            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

            <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-white/10" />


            {/* Brand */}

            <div className="relative z-10">


              <div className="mb-8 flex items-center gap-3">


                {/* Logo */}

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">

                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7"
                  >

                    <path
                      d="M12 2C12 2 5 9.2 5 14.3C5 18.6 8.1 22 12 22C15.9 22 19 18.6 19 14.3C19 9.2 12 2 12 2Z"
                      fill="white"
                    />

                  </svg>

                </div>


                <h2 className="text-2xl font-bold">
                  AquaFlow
                </h2>

              </div>


              <h1 className="max-w-md text-5xl font-bold leading-tight">

                Fresh water,

                <br />

                whenever you

                <br />

                need it.

              </h1>


              <p className="mt-6 max-w-md text-lg text-blue-100">

                Create your account and save your
                default location for faster water
                bookings.

              </p>

            </div>


            {/* ================================= */}
            {/* WATER VISUAL */}
            {/* ================================= */}

            <div className="relative z-10 flex justify-center">


              <div className="flex h-64 w-64 items-center justify-center rounded-full border border-white/20 bg-white/10">


                <svg
                  viewBox="0 0 24 24"
                  className="h-28 w-28"
                >

                  <path
                    d="M12 2C12 2 5 9.2 5 14.3C5 18.6 8.1 22 12 22C15.9 22 19 18.6 19 14.3C19 9.2 12 2 12 2Z"
                    fill="white"
                    fillOpacity="0.9"
                  />

                </svg>

              </div>

            </div>


            <p className="relative z-10 text-sm text-blue-100">

              Pure Water • Easy Booking • Fast Service

            </p>

          </div>


          {/* ================================= */}
          {/* RIGHT SIDE */}
          {/* ================================= */}

          <div className="flex items-center justify-center p-6 sm:p-10 md:p-14">


            <div className="w-full max-w-md">


              {/* ================================= */}
              {/* MOBILE LOGO */}
              {/* ================================= */}

              <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">


                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">

                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                  >

                    <path
                      d="M12 2C12 2 5 9.2 5 14.3C5 18.6 8.1 22 12 22C15.9 22 19 18.6 19 14.3C19 9.2 12 2 12 2Z"
                      fill="white"
                    />

                  </svg>

                </div>


                <h2 className="text-xl font-bold text-gray-900">
                  AquaFlow
                </h2>

              </div>


              {/* ================================= */}
              {/* HEADING */}
              {/* ================================= */}

              <div className="mb-7 text-center lg:text-left">


                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">

                  Customer Registration

                </p>


                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">

                  Create Account

                </h1>


                <p className="mt-3 text-sm text-gray-500 sm:text-base">

                  Enter your details to get started.

                </p>

              </div>


              {/* ================================= */}
              {/* FORM */}
              {/* ================================= */}

              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >


                {/* ================================= */}
                {/* NAME */}
                {/* ================================= */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">

                    Full Name

                  </label>


                  <input
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>


                {/* ================================= */}
                {/* PHONE */}
                {/* ================================= */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">

                    Phone Number

                  </label>


                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                      )
                    }
                    placeholder="Enter phone number"
                    autoComplete="tel"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>


                {/* ================================= */}
                {/* EMAIL */}
                {/* ================================= */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">

                    Email

                  </label>


                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="example@gmail.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>


                {/* ================================= */}
                {/* CUSTOMER TYPE */}
                {/* ================================= */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">

                    Customer Type

                  </label>


                  <select
                    value={customerType}
                    onChange={(e) =>
                      setCustomerType(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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


                {/* ================================= */}
                {/* ADDRESS */}
                {/* ================================= */}

                <div className="grid gap-4 sm:grid-cols-2">


                  {/* HOUSE NUMBER */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">

                      House No.

                    </label>


                    <input
                      type="text"
                      value={houseNo}
                      onChange={(e) =>
                        setHouseNo(
                          e.target.value
                        )
                      }
                      placeholder="12A"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                  </div>


                  {/* CITY */}

                  <div>

                    <label className="mb-2 block text-sm font-semibold text-gray-700">

                      City

                    </label>


                    <input
                      type="text"
                      value={city}
                      onChange={(e) =>
                        setCity(
                          e.target.value
                        )
                      }
                      placeholder="Enter city"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                </div>


                {/* ================================= */}
                {/* STREET */}
                {/* ================================= */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">

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
                    placeholder="Enter street or area"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>


                {/* ================================= */}
                {/* CURRENT LOCATION */}
                {/* ================================= */}

                <div>


                  <label className="mb-2 block text-sm font-semibold text-gray-700">

                    Default Location

                  </label>


                  {!location ? (

                    <button
                      type="button"
                      onClick={
                        getCurrentLocation
                      }
                      disabled={
                        locationLoading
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 px-4 py-4 font-semibold text-blue-600 transition hover:border-blue-400 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >


                      {/* LOCATION ICON */}

                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 21s6-5.686 6-11a6 6 0 10-12 0c0 5.314 6 11 6 11z"
                        />

                        <circle
                          cx="12"
                          cy="10"
                          r="2"
                        />

                      </svg>


                      {locationLoading
                        ? "Detecting Location..."
                        : "Use My Current Location"}

                    </button>

                  ) : (

                    <div className="rounded-xl border border-green-200 bg-green-50 p-4">


                      <div className="flex items-start justify-between gap-3">


                        <div>

                          <p className="font-semibold text-green-700">

                            ✓ Location Selected

                          </p>


                          <p className="mt-2 text-xs text-gray-600">

                            Latitude:{" "}

                            {location.latitude.toFixed(
                              6
                            )}

                          </p>


                          <p className="text-xs text-gray-600">

                            Longitude:{" "}

                            {location.longitude.toFixed(
                              6
                            )}

                          </p>

                        </div>


                        <button
                          type="button"
                          onClick={
                            getCurrentLocation
                          }
                          disabled={
                            locationLoading
                          }
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        >

                          {locationLoading
                            ? "Updating..."
                            : "Update"}

                        </button>

                      </div>

                    </div>

                  )}


                  {/* LOCATION ERROR */}

                  {locationError && (

                    <p className="mt-2 text-sm text-red-600">

                      {locationError}

                    </p>

                  )}


                  <p className="mt-2 text-xs text-gray-400">

                    This will be saved as your default location.
                    You can choose another delivery location
                    when placing an order.

                  </p>

                </div>


                {/* ================================= */}
                {/* PASSWORD */}
                {/* ================================= */}

                <div>


                  <label className="mb-2 block text-sm font-semibold text-gray-700">

                    Password

                  </label>


                  <div className="relative">


                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="Create password"
                      minLength={6}
                      autoComplete="new-password"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-20 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute inset-y-0 right-0 pr-4 text-sm font-semibold text-gray-400 hover:text-blue-600"
                    >

                      {showPassword
                        ? "Hide"
                        : "Show"}

                    </button>

                  </div>

                </div>


                {/* ================================= */}
                {/* CONFIRM PASSWORD */}
                {/* ================================= */}

                <div>


                  <label className="mb-2 block text-sm font-semibold text-gray-700">

                    Confirm Password

                  </label>


                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm password"
                    minLength={6}
                    autoComplete="new-password"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>


                {/* ================================= */}
                {/* ERROR */}
                {/* ================================= */}

                {error && (

                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">

                    {error}

                  </div>

                )}


                {/* ================================= */}
                {/* REGISTER BUTTON */}
                {/* ================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading
                    ? "Creating Account..."
                    : "Create Account"}

                </button>

              </form>


              {/* ================================= */}
              {/* LOGIN */}
              {/* ================================= */}

              <p className="mt-7 text-center text-sm text-gray-500">

                Already have an account?{" "}


                <button
                  type="button"
                  onClick={() =>
                    navigate("/")
                  }
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >

                  Sign In

                </button>

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


export default Register;