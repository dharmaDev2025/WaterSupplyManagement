
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import api from "../services/api";

function ResetPassword() {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // GET RESET TOKEN
  // ==========================================

  const resetToken =
    sessionStorage.getItem("resetToken");

  // ==========================================
  // PROTECT PAGE
  // ==========================================

  useEffect(() => {
    // User should not directly open this page
    // without first verifying OTP.

    if (!resetToken) {
      navigate("/forgot-password", {
        replace: true,
      });
    }
  }, [resetToken, navigate]);

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  const handleResetPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setError("");

      // ------------------------------
      // VALIDATION
      // ------------------------------

      if (!newPassword || !confirmPassword) {
        setError(
          "Please enter and confirm your new password."
        );
        return;
      }

      if (newPassword.length < 8) {
        setError(
          "Password must contain at least 8 characters."
        );
        return;
      }

      if (newPassword !== confirmPassword) {
        setError(
          "Passwords do not match."
        );
        return;
      }

      if (!resetToken) {
        setError(
          "Password reset session has expired."
        );

        return;
      }

      setLoading(true);

      // ------------------------------
      // BACKEND API
      // ------------------------------

      const response = await api.post(
        "/auth/reset-password",
        {
          resetToken,
          newPassword,
        }
      );

      console.log(
        "Reset Password Response:",
        response.data
      );

      // ------------------------------
      // CLEAN TEMPORARY DATA
      // ------------------------------

      sessionStorage.removeItem(
        "resetToken"
      );

      sessionStorage.removeItem(
        "resetEmail"
      );

      // ------------------------------
      // GO TO LOGIN
      // ------------------------------

      navigate("/", {
        replace: true,
        state: {
          message:
            response.data.message ||
            "Password reset successfully. Please login.",
        },
      });
    } catch (err: unknown) {
      console.log(
        "Reset Password Error:",
        err
      );

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Unable to reset password."
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
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-2">
      {/* ================================= */}
      {/* LEFT SIDE */}
      {/* ================================= */}

      <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-14 text-white lg:flex lg:flex-col">

        {/* DECORATION */}

        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/30" />

        <div className="absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-indigo-300/20" />

        {/* LOGO */}

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">

            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
            >
              <path
                d="M12 2C12 2 5 9.2 5 14.3C5 18.6 8.1 22 12 22C15.9 22 19 18.6 19 14.3C19 9.2 12 2 12 2Z"
                fill="white"
              />
            </svg>

          </div>

          <h1 className="text-3xl font-bold">
            AquaFlow
          </h1>
        </div>

        {/* CENTER CONTENT */}

        <div className="relative z-10 my-auto max-w-lg">

          {/* LOCK ICON */}

          <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">

            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm2-10V7a4 4 0 00-8 0v4"
              />
            </svg>

          </div>

          <h2 className="text-5xl font-bold leading-tight">
            Create a new
            <br />
            password.
          </h2>

          <p className="mt-6 max-w-md text-lg leading-8 text-blue-50">
            Choose a strong password to protect
            your AquaFlow account and continue
            ordering fresh water securely.
          </p>

        </div>

        <p className="relative z-10 text-sm text-blue-100">
          Secure account • Protected access • AquaFlow
        </p>
      </section>

      {/* ================================= */}
      {/* RIGHT SIDE */}
      {/* ================================= */}

      <section className="flex min-h-screen items-center justify-center bg-white px-6 py-12 sm:px-12">

        <div className="w-full max-w-lg">

          {/* MOBILE LOGO */}

          <div className="mb-10 flex items-center gap-3 lg:hidden">

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

            <p className="text-xl font-bold text-slate-900">
              AquaFlow
            </p>

          </div>

          {/* HEADING */}

          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Password Recovery
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            Set new password
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-500">
            Your identity has been verified.
            Create a new password for your
            AquaFlow account.
          </p>

          {/* ================================= */}
          {/* ERROR */}
          {/* ================================= */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* ================================= */}
          {/* FORM */}
          {/* ================================= */}

          <form
            onSubmit={handleResetPassword}
            className="mt-8"
          >

            {/* ================================= */}
            {/* NEW PASSWORD */}
            {/* ================================= */}

            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                New Password
              </label>

              <div className="relative">

                {/* LOCK */}

                <svg
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm2-10V7a4 4 0 00-8 0v4"
                  />
                </svg>

                <input
                  id="newPassword"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter new password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />

                {/* SHOW/HIDE */}

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 transition hover:text-blue-600"
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

              <p className="mt-2 text-xs text-slate-400">
                Password must contain at least
                8 characters.
              </p>
            </div>

            {/* ================================= */}
            {/* CONFIRM PASSWORD */}
            {/* ================================= */}

            <div className="mt-5">

              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-semibold text-slate-800"
              >
                Confirm New Password
              </label>

              <div className="relative">

                {/* LOCK */}

                <svg
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm2-10V7a4 4 0 00-8 0v4"
                  />
                </svg>

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  placeholder="Confirm new password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                />

                {/* SHOW/HIDE */}

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 transition hover:text-blue-600"
                >
                  {showConfirmPassword
                    ? "Hide"
                    : "Show"}
                </button>

              </div>

              {/* MATCH STATUS */}

              {confirmPassword &&
                newPassword ===
                  confirmPassword && (
                  <p className="mt-2 text-xs font-medium text-emerald-600">
                    ✓ Passwords match
                  </p>
                )}

              {confirmPassword &&
                newPassword !==
                  confirmPassword && (
                  <p className="mt-2 text-xs font-medium text-red-500">
                    Passwords do not match
                  </p>
                )}

            </div>

            {/* ================================= */}
            {/* RESET BUTTON */}
            {/* ================================= */}

            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Updating Password..."
                : "Reset Password"}
            </button>

          </form>

          {/* SECURITY INFO */}

          <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50/60 p-4">

            <div className="flex gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-600">
                ✓
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Your account is protected
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  After changing your password,
                  you'll need to sign in again
                  using your new password.
                </p>
              </div>

            </div>

          </div>

          {/* BACK TO LOGIN */}

          <p className="mt-8 text-center text-sm text-slate-500">
            Back to{" "}
            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="font-bold text-blue-600 hover:text-blue-700"
            >
              Sign In
            </button>
          </p>

        </div>

      </section>
    </div>
  );
}

export default ResetPassword;