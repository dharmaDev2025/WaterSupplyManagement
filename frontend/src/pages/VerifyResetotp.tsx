import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import api from "../services/api";

function VerifyResetOtp() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState<string[]>(
    Array(6).fill("")
  );

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const inputRefs = useRef<
    Array<HTMLInputElement | null>
  >([]);

  const email =
    sessionStorage.getItem("resetEmail") || "";

  // ==========================================
  // PROTECT PAGE
  // ==========================================

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", {
        replace: true,
      });
    }
  }, [email, navigate]);

  // ==========================================
  // HANDLE OTP INPUT
  // ==========================================

  const handleOtpChange = (
    index: number,
    value: string
  ) => {
    // Only allow numbers
    const digit = value.replace(/\D/g, "");

    if (!digit) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];

    newOtp[index] = digit.slice(-1);

    setOtp(newOtp);

    // Automatically move to next box
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ==========================================
  // BACKSPACE
  // ==========================================

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ==========================================
  // PASTE OTP
  // ==========================================

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const pastedValue = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedValue) {
      return;
    }

    const newOtp = Array(6).fill("");

    pastedValue
      .split("")
      .forEach((digit, index) => {
        newOtp[index] = digit;
      });

    setOtp(newOtp);

    const focusIndex = Math.min(
      pastedValue.length,
      5
    );

    inputRefs.current[focusIndex]?.focus();
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerifyOtp = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      const otpValue = otp.join("");

      if (otpValue.length !== 6) {
        setError(
          "Please enter the complete 6-digit verification code."
        );
        return;
      }

      if (!email) {
        navigate("/forgot-password");
        return;
      }

      setLoading(true);

      const response = await api.post(
        "/auth/verify-reset-otp",
        {
          email,
          otp: otpValue,
        }
      );

      console.log(
        "Verify OTP Response:",
        response.data
      );

      const resetToken =
        response.data.resetToken;

      if (!resetToken) {
        setError(
          "Reset token was not received."
        );
        return;
      }

      // Store reset token temporarily
      sessionStorage.setItem(
        "resetToken",
        resetToken
      );

      navigate("/reset-password");
    } catch (err: unknown) {
      console.log(
        "Verify OTP Error:",
        err
      );

      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Unable to verify OTP."
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
  // RESEND OTP
  // ==========================================

  const handleResendOtp = async () => {
    try {
      setError("");
      setMessage("");
      setResending(true);

      const response = await api.post(
        "/auth/forgot-password",
        {
          email,
        }
      );

      setOtp(Array(6).fill(""));

      inputRefs.current[0]?.focus();

      setMessage(
        response.data.message ||
          "A new verification code has been sent."
      );
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Unable to resend OTP."
        );
      } else {
        setError(
          "Unable to resend OTP."
        );
      }
    } finally {
      setResending(false);
    }
  };

  // ==========================================
  // MASK EMAIL
  // ==========================================

  const maskEmail = (value: string) => {
    const [username, domain] =
      value.split("@");

    if (!username || !domain) {
      return value;
    }

    if (username.length <= 2) {
      return `${username[0] || ""}***@${domain}`;
    }

    return `${username.slice(
      0,
      2
    )}${"*".repeat(
      Math.min(username.length - 2, 5)
    )}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-2">
      {/* ================================= */}
      {/* LEFT DESIGN */}
      {/* ================================= */}

      <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-14 text-white lg:flex lg:flex-col">
        {/* BACKGROUND CIRCLES */}

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
          {/* OTP ICON */}

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
                d="M9 12l2 2 4-4m5-3.5A9 9 0 1112 3a9 9 0 018 8.5z"
              />
            </svg>
          </div>

          <h2 className="text-5xl font-bold leading-tight">
            Verify your
            <br />
            identity.
          </h2>

          <p className="mt-6 max-w-md text-lg leading-8 text-blue-50">
            We've sent a secure 6-digit
            verification code to your registered
            email address.
          </p>
        </div>

        <p className="relative z-10 text-sm text-blue-100">
          Secure verification • Protected account • AquaFlow
        </p>
      </section>

      {/* ================================= */}
      {/* RIGHT CONTENT */}
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
            onClick={() =>
              navigate("/forgot-password")
            }
            className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            <span>←</span>
            Change email
          </button>

          {/* HEADING */}

          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
            Email Verification
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            Enter verification code
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-500">
            We sent a 6-digit verification code
            to{" "}
            <span className="font-semibold text-slate-800">
              {maskEmail(email)}
            </span>
          </p>

          {/* SUCCESS MESSAGE */}

          {message && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              ✓ {message}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ================================= */}
          {/* OTP FORM */}
          {/* ================================= */}

          <form
            onSubmit={handleVerifyOtp}
            className="mt-8"
          >
            <label className="mb-3 block text-sm font-semibold text-slate-800">
              Verification Code
            </label>

            {/* OTP BOXES */}

            <div className="grid grid-cols-6 gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] =
                      element;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  autoFocus={index === 0}
                  onChange={(e) =>
                    handleOtpChange(
                      index,
                      e.target.value
                    )
                  }
                  onKeyDown={(e) =>
                    handleKeyDown(index, e)
                  }
                  onPaste={handlePaste}
                  className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 text-center text-xl font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 sm:h-16 sm:text-2xl"
                />
              ))}
            </div>

            {/* VERIFY */}

            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Verifying..."
                : "Verify Code"}
            </button>
          </form>

          {/* ================================= */}
          {/* RESEND */}
          {/* ================================= */}

          <div className="mt-7 text-center">
            <p className="text-sm text-slate-500">
              Didn't receive the code?
            </p>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resending}
              className="mt-2 text-sm font-bold text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              {resending
                ? "Sending..."
                : "Resend verification code"}
            </button>
          </div>

          {/* INFORMATION */}

          <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-600">
                i
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Code expires in 10 minutes
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  For your security, don't share
                  this verification code with
                  anyone.
                </p>
              </div>
            </div>
          </div>

          {/* LOGIN */}

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

export default VerifyResetOtp;