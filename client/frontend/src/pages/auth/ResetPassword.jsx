import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../../api/axiosClient";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const otpFromQuery =
    searchParams.get("otp") || searchParams.get("token") || "";
  const emailFromQuery = searchParams.get("email") || "";

  const [otp, setOtp] = useState(otpFromQuery);
  const [email, setEmail] = useState(emailFromQuery);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (otpFromQuery) setOtp(otpFromQuery);
  }, [otpFromQuery]);

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const payload = { email, otp, newPassword: password };
      const res = await api.post("/api/auth/reset-password", payload);
      setSuccess(
        res?.data?.message ||
          "Password reset successful. You can log in now."
      );
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error(err);
      const data = err?.response?.data;

      if (data?.type === "validation" && Array.isArray(data.errors)) {
        const msg = data.errors
          .map(e => e.message || e.msg || "Invalid input")
          .join("\n");
        setError(msg);
      } else {
        const msg =
          (typeof data === "string" && data) ||
          data?.message ||
          data?.error ||
          err.message ||
          "Failed to reset password";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fbfbe2] text-[#2c1b16] py-10 md:py-14">
      <div className="app-container max-w-6xl w-full mx-auto">
        <div className="grid lg:grid-cols-2 overflow-hidden rounded-[2rem] bg-[#f9f9ef] shadow-[0_30px_50px_rgba(39,29,19,0.12)]">
          <div className="hidden lg:block relative min-h-[700px]">
            <img
              src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80"
              alt="Classic coffee shop"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f0f0f]/85 via-[#1f0f0f]/35 to-transparent p-10 flex items-end">
              <div className="text-[#fff8f0]">
                <p className="text-5xl leading-tight italic font-semibold font-serif max-w-md">
                  Fresh beginnings, one cup at a time.
                </p>
                <p className="mt-5 text-sm tracking-[0.2em] uppercase text-[#f0e7da]/90">
                  Secure Access
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-9 lg:p-11 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-5xl font-semibold italic text-[#1f100d]">
                Set New Password
              </h2>
              <p className="text-xl text-[#54443d] mt-2">
                Enter your details and the reset code received in your email.
              </p>
            </div>

            {error && (
              <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-xl">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-sm font-semibold uppercase tracking-[0.18em] text-[#342420]/85 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3 rounded-full bg-[#e8e7cc] border-0 text-xl placeholder:text-[#a5a08c] focus:outline-none focus:ring-2 focus:ring-[#9f402d]/65"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="reset-otp"
                  className="block text-sm font-semibold uppercase tracking-[0.18em] text-[#342420]/85 mb-2"
                >
                  Reset Code
                </label>
                <input
                  id="reset-otp"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-5 py-3 rounded-full bg-[#e8e7cc] border-0 text-xl placeholder:text-[#a5a08c] focus:outline-none focus:ring-2 focus:ring-[#9f402d]/65"
                  placeholder="Paste code from email"
                />
              </div>

              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-semibold uppercase tracking-[0.18em] text-[#342420]/85 mb-2"
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 rounded-full bg-[#e8e7cc] border-0 text-xl placeholder:text-[#a5a08c] focus:outline-none focus:ring-2 focus:ring-[#9f402d]/65"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-semibold uppercase tracking-[0.18em] text-[#342420]/85 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-5 py-3 rounded-full bg-[#e8e7cc] border-0 text-xl placeholder:text-[#a5a08c] focus:outline-none focus:ring-2 focus:ring-[#9f402d]/65"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center items-center bg-[#33110e] text-white px-8 py-3 rounded-full text-base font-medium disabled:opacity-60 hover:bg-[#4b1a15] transition shadow-[0_10px_24px_rgba(39,19,16,0.18)]"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
                <Link
                  to="/login"
                  className="text-[#9f402d] hover:underline text-sm uppercase tracking-[0.13em] font-semibold"
                >
                  Back to login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
