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
      }, 1500);
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
    <div className="min-h-screen bg-[#fbfbe2] text-[#2c1b16] py-10 md:py-14">
      <div className="app-container max-w-6xl w-full mx-auto">
        <div className="grid lg:grid-cols-2 overflow-hidden rounded-[2rem] bg-[#f9f9ef] shadow-[0_30px_50px_rgba(39,29,19,0.12)]">
          <div className="hidden lg:block relative min-h-[600px]">
            <img
              src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80"
              alt="Coffee beans"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f0f0f]/85 via-[#1f0f0f]/35 to-transparent p-10 flex items-end">
              <div className="text-[#fff8f0]">
                <p className="text-5xl leading-tight italic font-semibold font-serif max-w-md">
                  A small pause, a fresh start.
                </p>
                <p className="mt-5 text-sm tracking-[0.2em] uppercase text-[#f0e7da]/90">
                  Secure Recovery
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6 md:p-9 lg:p-11 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-5xl font-semibold italic text-[#1f100d]">
                Reset Password
              </h2>
              <p className="text-xl text-[#54443d] mt-2">
                Enter your account email and we’ll send a one-time code to reset your password.
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-[#342420]/85 mb-2">
                  Email Address
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="w-full px-5 py-3 rounded-full bg-[#e8e7cc] border-0 text-xl placeholder:text-[#a5a08c] focus:outline-none focus:ring-2 focus:ring-[#9f402d]/65"
                  placeholder="your@email.com"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center items-center bg-[#33110e] text-white px-8 py-3 rounded-full text-base font-medium disabled:opacity-60 hover:bg-[#4b1a15] transition shadow-[0_10px_24px_rgba(39,19,16,0.18)]"
                >
                  {loading ? "Sending..." : "Send Reset Code"}
                </button>
                <Link
                  to="/login"
                  className="text-[#9f402d] hover:underline text-sm uppercase tracking-[0.13em] font-semibold"
                >
                  Back to login
                </Link>
              </div>
            </form>

            <div className="mt-10 text-sm text-[#54443d]">
              Remembered your password?{" "}
              <Link to="/login" className="text-[#9f402d] font-bold hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
