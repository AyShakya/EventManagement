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
    <div className="min-h-screen bg-[#fbfbe2] text-[#2c1b16] py-10 md:py-14">
      <div className="app-container max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 overflow-hidden rounded-[2rem] bg-[#f9f9ef] shadow-[0_30px_50px_rgba(39,29,19,0.12)]">
          <div className="hidden lg:block relative min-h-[780px]">
            <img
              src="https://images.unsplash.com/photo-1497935586047-939d4b47f047?auto=format&fit=crop&w=1200&q=80"
              alt="Coffee setting"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f0f0f]/85 via-[#1f0f0f]/35 to-transparent p-10 flex items-end">
              <div className="text-[#fff8f0]">
                <p className="text-5xl leading-tight italic font-semibold font-serif max-w-md">
                  Gather your people. Pour the first note of something
                  unforgettable.
                </p>
                <p className="mt-5 text-sm tracking-[0.2em] uppercase text-[#f0e7da]/90">
                  Curator Edition
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-9 lg:p-11">
          <div className="mb-5">
            <h2 className="text-5xl font-semibold italic text-[#1f100d]">
              Join EventEase
            </h2>
            <p className="text-xl text-[#54443d] mt-2">
              Create your account and enter the curated world.
            </p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
              {error}
            </div>
          )}

          {/* user type */}
          <div className="mb-7">
            <span className="block text-xs uppercase tracking-[0.18em] font-semibold text-[#342420]/80 mb-2">
              Register as
            </span>
            <div className="inline-flex rounded-full bg-[#eceac8] p-1.5 text-base">
              <button
                type="button"
                onClick={() => setUserType("user")}
                className={`px-8 py-2 rounded-full transition ${
                  userType === "user"
                    ? "bg-[#f6f5e8] text-[#271310] shadow-sm"
                    : "text-[#5c5048] hover:text-[#271310]"
                }`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => setUserType("organizer")}
                className={`px-8 py-2 rounded-full transition ${
                  userType === "organizer"
                    ? "bg-[#f6f5e8] text-[#271310] shadow-sm"
                    : "text-[#5c5048] hover:text-[#271310]"
                }`}
              >
                Organizer
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-[#342420]/85 mb-2">
                Name
              </label>
              <input
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-5 py-3 rounded-full bg-[#e8e7cc] border-0 text-xl placeholder:text-[#a5a08c] focus:outline-none focus:ring-2 focus:ring-[#9f402d]/65"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-[#342420]/85 mb-2">
                Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-5 py-3 rounded-full bg-[#e8e7cc] border-0 text-xl placeholder:text-[#a5a08c] focus:outline-none focus:ring-2 focus:ring-[#9f402d]/65"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-[#342420]/85 mb-2">
                Password
              </label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-3 rounded-full bg-[#e8e7cc] border-0 text-xl placeholder:text-[#a5a08c] focus:outline-none focus:ring-2 focus:ring-[#9f402d]/65"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-[#33110e] text-white px-4 py-3 rounded-full text-base font-medium disabled:opacity-60 hover:bg-[#4b1a15] transition shadow-[0_10px_24px_rgba(39,19,16,0.18)]"
            >
              {loading ? "Creating account..." : "Start Curating"}
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-gray-700">
            Already have an account?{" "}
            <Link to="/login" className="text-[#9f402d] font-medium hover:underline">
              Login
            </Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
