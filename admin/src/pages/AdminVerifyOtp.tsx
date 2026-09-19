import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Droplets,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react";

function AdminVerifyOtp() {
  const navigate = useNavigate();

  const [otp, setOtp] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    resendLoading,
    setResendLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState(
      "OTP has been sent to your admin email"
    );

  const email =
    sessionStorage.getItem(
      "adminEmail"
    );

  const handleVerifyOtp = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!email) {
      setError(
        "Admin email not found. Please login again."
      );
      return;
    }

    if (otp.length !== 6) {
      setError(
        "Please enter a valid 6-digit OTP."
      );
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response =
        await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/auth/verify-login-otp`,
          {
            email,
            otp,
          }
        );

      if (
        response.data.success &&
        response.data.token
      ) {
        localStorage.setItem(
          "adminToken",
          response.data.token
        );

        localStorage.setItem(
          "admin",
          JSON.stringify(
            response.data.admin
          )
        );

        sessionStorage.removeItem(
          "adminEmail"
        );

        navigate(
          "/admin/dashboard"
        );
      }
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error)
      ) {
        setError(
          error.response?.data
            ?.message ||
            "OTP verification failed."
        );
      } else {
        setError(
          "OTP verification failed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp =
    async () => {
      if (!email) {
        setError(
          "Admin email not found. Please login again."
        );
        return;
      }

      setResendLoading(true);
      setError("");
      setMessage("");

      try {
        const response =
          await axios.post(
            `${import.meta.env.VITE_API_URL}/admin/auth/resend-login-otp`,
            {
              email,
            }
          );

        if (
          response.data.success
        ) {
          setMessage(
            response.data.message
          );

          setOtp("");
        }
      } catch (error: unknown) {
        if (
          axios.isAxiosError(error)
        ) {
          setError(
            error.response?.data
              ?.message ||
              "Unable to resend OTP."
          );
        } else {
          setError(
            "Unable to resend OTP."
          );
        }
      } finally {
        setResendLoading(false);
      }
    };

  const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value =
      e.target.value
        .replace(/\D/g, "")
        .slice(0, 6);

    setOtp(value);
    setError("");
  };

  const handleBackToLogin =
    () => {
      sessionStorage.removeItem(
        "adminEmail"
      );

      navigate("/");
    };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100">
      <div className="flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center sm:mb-7">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 sm:mb-4 sm:h-14 sm:w-14">
              <Droplets className="h-7 w-7 text-white sm:h-8 sm:w-8" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              AquaFlow
            </h1>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Water Supply Management
              System
            </p>
          </div>

          <div className="w-full rounded-2xl bg-white p-5 shadow-xl shadow-blue-100/60 sm:rounded-3xl sm:p-7">
            <div className="mb-5 text-center sm:mb-6">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 sm:mb-4 sm:h-14 sm:w-14">
                <ShieldCheck className="h-6 w-6 text-blue-600 sm:h-7 sm:w-7" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Verify Admin OTP
              </h2>

              <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-gray-500 sm:text-sm sm:leading-6">
                Enter the 6-digit OTP
                sent to your admin email
              </p>

              {email && (
                <div className="mx-auto mt-3 flex max-w-full items-center justify-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-xs font-medium text-gray-600 sm:text-sm">
                  <Mail className="h-4 w-4 shrink-0 text-blue-500" />

                  <span className="min-w-0 break-all">
                    {email}
                  </span>
                </div>
              )}
            </div>

            {message && (
              <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-center text-xs font-medium leading-5 text-green-700 sm:px-4 sm:text-sm">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-center text-xs font-medium leading-5 text-red-600 sm:px-4 sm:text-sm">
                {error}
              </div>
            )}

            <form
              onSubmit={
                handleVerifyOtp
              }
            >
              <div className="mb-5 sm:mb-6">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Enter OTP
                </label>

                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 sm:left-4" />

                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={
                      handleOtpChange
                    }
                    placeholder="6-digit OTP"
                    maxLength={6}
                    disabled={loading}
                    autoFocus
                    className="w-full rounded-xl border border-gray-200 py-3.5 pl-10 pr-3 text-center text-lg font-bold tracking-[0.2em] text-gray-900 outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 sm:pl-12 sm:pr-4 sm:text-xl sm:tracking-[0.35em]"
                  />
                </div>

                <p className="mt-2 text-center text-xs text-gray-400">
                  OTP is valid for 5
                  minutes
                </p>
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  resendLoading ||
                  otp.length !== 6
                }
                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 sm:text-base"
              >
                {loading
                  ? "Verifying OTP..."
                  : "Verify OTP"}
              </button>
            </form>

            <div className="mt-5 text-center">
              <p className="text-xs text-gray-500 sm:text-sm">
                Didn't receive the
                OTP?
              </p>

              <button
                type="button"
                onClick={
                  handleResendOtp
                }
                disabled={
                  resendLoading ||
                  loading
                }
                className="mt-1 min-h-10 px-3 text-sm font-semibold text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                {resendLoading
                  ? "Sending OTP..."
                  : "Resend OTP"}
              </button>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-5 sm:mt-6">
              <button
                type="button"
                onClick={
                  handleBackToLogin
                }
                className="mx-auto flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-gray-500 transition hover:bg-gray-50 hover:text-blue-600"
              >
                <ArrowLeft className="h-4 w-4" />

                Back to Login
              </button>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-gray-400">
            AquaFlow Admin Security
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminVerifyOtp;