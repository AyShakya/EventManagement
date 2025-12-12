/* ---------------- ResetPassword.jsx ---------------- */
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
      setTimeout(() => navigate("/login"), 1200);
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
    <div className="min-h-screen bg-gradient-to-b from-coffee-cream to-coffee-mid text-gray-900 py-14">
      <div className="app-container max-w-md mx-auto">
        <div className="bg-white rounded-xl p-6 md:p-7 shadow card-coffee">
          <h2 className="text-2xl font-semibold mb-2 text-coffee-dark">
            Set a new password
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter the email you used for this account, the reset code you
            received, and choose a new password.
          </p>

          {error && (
            <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="reset-email"
                className="block text-sm mb-1 font-medium"
              >
                Email
              </label>
              <input
                id="reset-email"
                type="email"
                className="w-full px-3 py-2 rounded border"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            {/* OTP / code */}
            <div>
              <label
                htmlFor="reset-otp"
                className="block text-sm mb-1 font-medium"
              >
                Reset OTP / code
              </label>
              <input
                id="reset-otp"
                className="w-full px-3 py-2 rounded border"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Paste the code from your email"
              />
            </div>

            {/* New password */}
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm mb-1 font-medium"
              >
                New password
              </label>
              <input
                id="new-password"
                type="password"
                className="w-full px-3 py-2 rounded border"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm mb-1 font-medium"
              >
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="w-full px-3 py-2 rounded border"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-coffee-mid text-white px-4 py-2 rounded text-sm disabled:opacity-60"
              >
                {loading ? "Saving..." : "Set new password"}
              </button>
              <Link
                to="/login"
                className="text-sm text-gray-700 hover:underline text-center sm:text-right"
              >
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
