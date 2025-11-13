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
    // focus email for better UX
    emailRef.current?.focus();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(email.trim(), password, userType);
      setLoading(false);

      // res shape: { user: { ... } } expected
      if (res && res.user) {
        // If the backend returns userType reliably, navigate accordingly
        if (res.user.userType === "organizer") navigate("/organizer");
        else navigate("/user");
        return;
      }

      // fallback
      navigate("/");
    } catch (err) {
      setLoading(false);

      // prefer structured messages from backend
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed. Please try again.";

      // common server hints: unverified email, locked, incorrect credentials
      if (/verify/i.test(msg) && !/reset/i.test(msg)) {
        // show message plus a button/link to verify email
        setError(`${msg} — check your inbox or click Verify below.`);
      } else {
        setError(msg);
      }
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center">
      <div className="app-container mx-auto w-full max-w-md bg-white rounded-lg p-6 card-coffee">
        <h2 className="text-2xl font-semibold mb-3">Login</h2>

        {error && <div className="text-red-600 mb-3" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3" aria-describedby={error ? "login-error" : undefined}>
          <div>
            <label htmlFor="email" className="block text-sm mb-1">Email</label>
            <input
              id="email"
              ref={emailRef}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded border"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm mb-1">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded border"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label htmlFor="userType" className="block text-sm mb-1">User type</label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full px-3 py-2 rounded border"
            >
              <option value="user">User</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-coffee-mid text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="text-sm flex gap-3 items-center">
              <Link to="/reset-pass-otp" className="text-gray-600 hover:underline">Forgot password?</Link>
              <Link to="/verify-email" className="text-gray-600 hover:underline">Verify email</Link>
            </div>
          </div>
        </form>

        <div className="mt-4 text-sm text-center">
          Don't have an account? <Link to="/register" className="text-coffee-mid underline">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
