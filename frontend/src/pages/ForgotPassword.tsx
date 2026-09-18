import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import api from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        "/auth/forgot-password",
        {
          email: email.trim().toLowerCase(),
        }
      );

      console.log(
        "Forgot Password Response:",
        response.data
      );

      // Save email temporarily because OTP page needs it
      sessionStorage.setItem(
        "resetEmail",
        email.trim().toLowerCase()
      );

      navigate("/verify-reset-otp");
    } catch (err: unknown) {
      console.log(
        "Forgot Password Error:",
        err
      );

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Unable to send reset code."
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

        {/* TEXT */}

        <div className="relative z-10 my-auto max-w-lg">
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
                d="M15 7a4 4 0 11-7.75 1.4M11 11l9 9m-5-5 2-2m-5 0 2-2"
              />
            </svg>
          </div>

          <h2 className="text-5xl font-bold leading-tight">
            Forgot your
            <br />
            password?
          </h2>

          <p className="mt-6 max-w-md text-lg leading-8 text-blue-50">
            No problem. We'll send a secure
            verification code to your registered
            email address.
          </p>
        </div>

        <p className="relative z-10 text-sm text-blue-100">
          Secure verification • Quick recovery • AquaFlow
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

          {/* BACK */}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            <span>←</span>
            Back to login
          </button>

          {/* HEADING */}

          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Password Recovery
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            Reset your password
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-500">
            Enter the email address associated
            with your AquaFlow account. We'll
            send you a 6-digit verification code.
          </p>

          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="mt-8"
          >
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-800"
            >
              Email Address
            </label>

            <div className="relative">
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8V6a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                placeholder="example@gmail.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Sending code..."
                : "Send Verification Code"}
            </button>
          </form>

          {/* INFORMATION */}

          <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                i
              </div>

              <p className="text-xs leading-5 text-slate-500">
                The verification code will expire
                after 10 minutes. Check your spam
                folder if you don't see the email
                in your inbox.
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => navigate("/")}
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

export default ForgotPassword;