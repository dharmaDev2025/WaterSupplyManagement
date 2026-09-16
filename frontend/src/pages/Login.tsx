import { useState } from "react";
import axios from "axios";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  // ============================
  // STATE
  // ============================

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  // Get login function from AuthContext
  const { login } = useAuth();

  // ============================
  // LOGIN
  // ============================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      // Login request
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("Login Response:", response.data);

      // Get JWT token returned by backend
      const token = response.data.token;

      if (!token) {
        setError("Token not received from server.");
        return;
      }

      // AuthContext will:
      // 1. save token in localStorage
      // 2. fetch customer profile
      // 3. set logged-in user
      await login(token);

      alert("Login successful");

      // Redirect after successful login
      navigate("/dashboard");

    } catch (err: unknown) {
      console.log("Login Error:", err);

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Invalid email or password"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 p-4 md:p-8">

      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-6xl items-center justify-center">

        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

          {/* ================================================= */}
          {/* LEFT SIDE - DESKTOP ONLY */}
          {/* ================================================= */}

          <div className="relative hidden min-h-[650px] overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">

            {/* Decorative Circles */}

            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

            <div className="absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-white/10" />

            <div className="absolute right-16 top-24 h-32 w-32 rounded-full bg-cyan-300/20 blur-xl" />

            {/* Logo + Heading */}

            <div className="relative z-10">

              <div className="mb-8 flex items-center gap-3">

                {/* Water Drop Logo */}

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">

                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7"
                    fill="none"
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

                delivered to your

                <br />

                doorstep.

              </h1>

              <p className="mt-6 max-w-md text-lg text-blue-100">

                Book safe and fresh drinking water anytime and
                get it delivered directly to your home, office,
                shop or hotel.

              </p>

            </div>

            {/* ================================================= */}
            {/* WATER BOTTLE DESIGN */}
            {/* ================================================= */}

            <div className="relative z-10 flex items-end justify-center">

              <div className="relative">

                {/* Decorative Bubble */}

                <div className="absolute -left-32 top-32 h-20 w-20 rounded-full bg-cyan-300/30 blur-md" />

                <div className="absolute -right-28 top-8 h-24 w-24 rounded-full bg-white/10" />

                {/* Bottle */}

                <div className="relative mx-auto h-72 w-40 rounded-[60px_60px_35px_35px] border-4 border-white/60 bg-white/20 shadow-2xl backdrop-blur-md">

                  {/* Bottle Neck */}

                  <div className="absolute left-1/2 top-[-35px] h-14 w-16 -translate-x-1/2 rounded-t-xl bg-white/70" />

                  {/* Bottle Cap */}

                  <div className="absolute left-1/2 top-[-47px] h-5 w-20 -translate-x-1/2 rounded-md bg-cyan-200" />

                  {/* Bottle Label */}

                  <div className="absolute bottom-12 left-1/2 flex h-28 w-32 -translate-x-1/2 items-center justify-center rounded-3xl bg-white/90">

                    <div className="text-center">

                      <div className="mx-auto mb-2 h-8 w-6">

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 2C12 2 6 8.5 6 13C6 16.8 8.7 20 12 20C15.3 20 18 16.8 18 13C18 8.5 12 2 12 2Z"
                            fill="#2563eb"
                          />
                        </svg>

                      </div>

                      <p className="font-bold text-blue-600">
                        PURE
                      </p>

                      <p className="text-xs text-gray-500">
                        Drinking Water
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            <p className="relative z-10 text-sm text-blue-100">
              Pure water • Easy booking • Fast delivery
            </p>

          </div>

          {/* ================================================= */}
          {/* RIGHT SIDE - LOGIN FORM */}
          {/* ================================================= */}

          <div className="flex min-h-[620px] items-center justify-center p-6 sm:p-10 md:p-14 lg:min-h-[650px]">

            <div className="w-full max-w-md">

              {/* MOBILE LOGO */}

              <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">

                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
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

              {/* HEADING */}

              <div className="mb-8 text-center lg:text-left">

                <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
                  Customer Login
                </p>

                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  Welcome back
                </h1>

                <p className="mt-3 text-sm text-gray-500 sm:text-base">
                  Enter your account details to continue booking water.
                </p>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* EMAIL */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Email Address
                  </label>

                  <div className="relative">

                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">

                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>

                    </div>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="example@gmail.com"
                      autoComplete="email"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:text-base"
                    />

                  </div>

                </div>

                {/* PASSWORD */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 sm:text-sm"
                    >
                      Forgot password?
                    </button>

                  </div>

                  <div className="relative">

                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">

                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>

                    </div>

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-20 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 sm:text-base"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-semibold text-gray-400 transition hover:text-blue-600 sm:text-sm"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>

                  </div>

                </div>

                {/* ERROR */}

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* SIGN IN */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Signing in..."
                    : "Sign In"}
                </button>

              </form>

              {/* DIVIDER */}

              <div className="my-7 flex items-center gap-3 sm:gap-4">

                <div className="h-px flex-1 bg-gray-200" />

                <span className="whitespace-nowrap text-xs text-gray-400 sm:text-sm">
                  or continue with
                </span>

                <div className="h-px flex-1 bg-gray-200" />

              </div>

              {/* GOOGLE LOGIN */}

              <button
                type="button"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md sm:text-base"
              >

                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 01-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.38z"
                  />

                  <path
                    fill="#34A853"
                    d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.24-2.51c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.59A10 10 0 0012 22z"
                  />

                  <path
                    fill="#FBBC05"
                    d="M6.39 13.89A6 6 0 016.08 12c0-.66.11-1.3.31-1.89V7.52H3.04A10 10 0 002 12c0 1.61.38 3.14 1.04 4.48l3.35-2.59z"
                  />

                  <path
                    fill="#EA4335"
                    d="M12 5.98c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.96 2.99 14.7 2 12 2a10 10 0 00-8.96 5.52l3.35 2.59C7.18 7.74 9.39 5.98 12 5.98z"
                  />

                </svg>

                Sign in with Google

              </button>

              {/* CREATE ACCOUNT */}

              <p className="mt-8 text-center text-sm text-gray-500">

                Don't have an account?{" "}

                <button
                  type="button"
                  className="font-semibold text-blue-600 transition hover:text-blue-700"
                  onClick={() =>
                    navigate("/register")
                  }
                >
                  Create Account
                </button>

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;