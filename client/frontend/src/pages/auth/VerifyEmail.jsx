/* ---------------- VerifyEmail.jsx ---------------- */
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/axiosClient";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token =
    searchParams.get("token") || searchParams.get("t") || "";

  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await api.get("/api/auth/verify-email", {
          params: { token },
        });

        if (!mounted) return;

        const data = res?.data;
        const msg =
          typeof data === "string"
            ? data
            : data?.message || "Email verified successfully.";

        setSuccess(msg);

        // short redirect to login after success
        setTimeout(() => navigate("/login"), 1200);
      } catch (err) {
        console.error(err);
        if (!mounted) return;

        const data = err?.response?.data;
        const msg =
          typeof data === "string"
            ? data
            : data?.message || "Verification failed or token expired.";
        setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token, navigate]);

  // Kept in case you want to wire a "resend" UI later
  async function resend(email) {
    try {
      await api.post("/api/auth/resend-verify", { email });
      setSuccess("Verification link sent. Check your email.");
      setError("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to resend verification"
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-cream to-coffee-mid text-gray-900 py-14">
      <div className="app-container max-w-md mx-auto">
        <div className="bg-white rounded-xl p-6 md:p-7 shadow card-coffee text-center">
          <h2 className="text-2xl font-semibold text-coffee-dark mb-2">
            Email verification
          </h2>

          {loading ? (
            <div className="mt-2 text-sm text-gray-600">
              Verifying your email, please wait…
            </div>
          ) : (
            <>
              {success && (
                <div className="mt-3 mb-4 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">
                  {success}
                </div>
              )}

              {error && (
                <div className="mt-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
                  {error}
                </div>
              )}

              {!success && !error && (
                <p className="mt-2 mb-5 text-sm text-gray-600">
                  No verification token found in the URL. If you recently
                  registered, check your email for the verification link,
                  or request a new one from your account page.
                </p>
              )}

              <div className="flex gap-3 justify-center mt-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded border text-sm text-gray-700 hover:bg-gray-50"
                >
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
