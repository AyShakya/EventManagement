import React, { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const { register } = useContext(AuthContext);

  const [userName, setUserName] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("user");

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await register(userName.trim(), email.trim(), password, userType);
      setLoading(false);

      alert(res?.message || "Registered successfully. Please check your email or login.");
      navigate("/login");
    } catch (err) {
      setLoading(false);
      const data = err?.response?.data;
      if (data?.type === "validation" && Array.isArray(data.errors)) {
        const msg = data.errors
          .map(e => e.message || e.msg || "Invalid input")
          .join("\n");
        setError(msg);
        return;
      }
      const msg =
        (typeof data === "string" && data) ||
        data?.message ||
        data?.error ||
        err.message ||
        "Registration failed";

      setError(msg);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-cream to-coffee-mid text-gray-900 py-14">
      <div className="app-container max-w-md mx-auto">
        <div className="bg-white rounded-xl p-6 md:p-7 shadow card-coffee">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-coffee-dark">Create an account</h2>
            <p className="text-sm text-gray-600 mt-1">
              Join our platform to explore and interact with events.
            </p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
              {error}
            </div>
          )}

          {/* user type */}
          <div className="mb-4">
            <span className="block text-xs font-medium text-gray-600 mb-1">
              Register as
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

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-coffee-mid/70"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-coffee-mid/70"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-coffee-mid/70"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-coffee-mid text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 hover:bg-coffee-dark transition"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <div className="mt-5 text-sm text-center text-gray-700">
            Already have an account?{" "}
            <Link to="/login" className="text-coffee-mid font-medium hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
