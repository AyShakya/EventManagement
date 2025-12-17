import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/axiosClient";

export default function RequestResetOTP() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return setError("Please enter a valid email");
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/reset-pass-otp", { email });
      setSuccess(
        res?.data?.message ||
          "If that email exists, we’ve sent a reset code."
      );

      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 800);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to request reset";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-cream to-coffee-mid text-gray-900 py-14">
      <div className="app-container mx-auto w-full max-w-md">
        <div className="bg-white rounded-xl p-6 md:p-7 shadow card-coffee">
          <h2 className="text-2xl font-semibold mb-2 text-coffee-dark">
            Reset your password
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Enter your account email and we’ll send a one-time code to reset
            your password.
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

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm mb-1 font-medium">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="w-full px-3 py-2 rounded border"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-coffee-mid text-white px-4 py-2 rounded text-sm disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send reset code"}
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
