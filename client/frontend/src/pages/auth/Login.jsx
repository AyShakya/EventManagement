import React, { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(email.trim(), password, userType);
      setLoading(false);

      if (res && res.user) {
        if (res.user.userType === "organizer") navigate("/organizer");
        else navigate("/user");
        return;
      }
      navigate("/");
    } catch (err) {
      setLoading(false);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed. Please try again.";

      if (/verify/i.test(msg) && !/reset/i.test(msg)) {
        setError(`${msg} — check your inbox or click “Verify email” below.`);
      } else {
        setError(msg);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-cream to-coffee-mid text-gray-900 py-14">
      <div className="app-container max-w-md w-full">
        <div className="bg-white rounded-xl p-6 md:p-7 shadow card-coffee">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-coffee-dark">
              Welcome back
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Sign in to continue discovering and managing events.
            </p>
          </div>

          {error && (
            <div
              id="login-error"
              role="alert"
              className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md"
            >
              {error}
            </div>
          )}

          {/* user type toggle */}
          <div className="mb-4">
            <span className="block text-xs font-medium text-gray-600 mb-1">
              Sign in as
            </span>
            <div className="inline-flex rounded-full bg-gray-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => setUserType("user")}
                className={`px-3 py-1 rounded-full transition ${
                  userType === "user"
                    ? "bg-coffee-mid text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => setUserType("organizer")}
                className={`px-3 py-1 rounded-full transition ${
                  userType === "organizer"
                    ? "bg-coffee-mid text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Organizer
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-3"
            aria-describedby={error ? "login-error" : undefined}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                ref={emailRef}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-coffee-mid/70 focus:border-coffee-mid"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-coffee-mid/70 focus:border-coffee-mid"
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center items-center bg-coffee-mid text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 hover:bg-coffee-dark transition"
              >
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="text-xs sm:text-sm flex flex-wrap gap-3 items-center">
                <Link
                  to="/reset-pass-otp"
                  className="text-gray-600 hover:text-coffee-dark hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </form>

          <div className="mt-5 text-sm text-center text-gray-700">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-coffee-mid font-medium hover:underline"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
