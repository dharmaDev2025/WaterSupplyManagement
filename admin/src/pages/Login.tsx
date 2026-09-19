import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Droplets,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Truck,
} from "lucide-react";

type LoginRole = "admin" | "delivery";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState<LoginRole>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (role === "admin") {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/auth/login`,
          {
            email,
            password,
          }
        );

        if (response.data.success) {
          sessionStorage.setItem(
            "adminEmail",
            email.toLowerCase().trim()
          );

          navigate("/admin/verify-otp");
        }
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/delivery/auth/login`,
          {
            email,
            password,
          }
        );

        if (response.data.success && response.data.token) {
          localStorage.setItem(
            "deliveryToken",
            response.data.token
          );

          localStorage.setItem(
            "deliveryBoy",
            JSON.stringify(response.data.deliveryBoy)
          );

          navigate("/delivery/dashboard");
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Unable to login. Please try again."
        );
      } else {
        setError("Unable to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (selectedRole: LoginRole) => {
    setRole(selectedRole);
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
            <Droplets className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            AquaFlow
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Water Supply Management System
          </p>
        </div>

        <div className="rounded-3xl bg-white p-7 shadow-xl shadow-blue-100/60">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome Back
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Sign in to continue to your account
            </p>
          </div>

          <div className="mb-7 grid grid-cols-2 rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleRoleChange("admin")}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                role === "admin"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ShieldCheck className="h-5 w-5" />
              Admin
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleRoleChange("delivery")}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                role === "delivery"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Truck className="h-5 w-5" />
              Delivery Boy
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your email"
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-50"
                />

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            >
              {loading
                ? "Signing in..."
                : role === "admin"
                  ? "Login as Admin"
                  : "Login as Delivery Boy"}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-5 text-center">
            <p className="text-xs text-gray-400">
              Authorized personnel only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;