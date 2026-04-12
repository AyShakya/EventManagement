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
    <div className="min-h-screen bg-[#fbfbe2] text-[#2c1b16] py-10 md:py-14">
      <div className="app-container max-w-6xl w-full">
        <div className="grid lg:grid-cols-2 overflow-hidden rounded-[2rem] bg-[#f9f9ef] shadow-[0_30px_50px_rgba(39,29,19,0.12)]">
          <div className="hidden lg:block relative min-h-[780px]">
            <img
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80"
              alt="Coffee lounge"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f0f0f]/85 via-[#1f0f0f]/35 to-transparent p-10 flex items-end">
              <div className="text-[#fff8f0]">
                <p className="text-5xl leading-tight italic font-semibold font-serif max-w-md">
                  Curating moments that linger long after the last drop.
                </p>
                <p className="mt-5 text-sm tracking-[0.2em] uppercase text-[#f0e7da]/90">
                  EventEase Heritage
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-9 lg:p-11">
          <div className="mb-5">
            <h2 className="text-5xl font-semibold italic text-[#1f100d]">
              EventEase
            </h2>
            <p className="text-xl text-[#54443d] mt-2">
              Welcome back to your curated world.
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
          <div className="mb-7">
            <span className="block text-xs uppercase tracking-[0.18em] font-semibold text-[#342420]/80 mb-2">
              Sign in as
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

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            aria-describedby={error ? "login-error" : undefined}
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold uppercase tracking-[0.18em] text-[#342420]/85 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                ref={emailRef}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 rounded-full bg-[#e8e7cc] border-0 text-xl placeholder:text-[#a5a08c] focus:outline-none focus:ring-2 focus:ring-[#9f402d]/65"
                autoComplete="email"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold uppercase tracking-[0.18em] text-[#342420]/85 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 rounded-full bg-[#e8e7cc] border-0 text-xl placeholder:text-[#a5a08c] focus:outline-none focus:ring-2 focus:ring-[#9f402d]/65"
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center items-center bg-[#33110e] text-white px-4 py-3 rounded-full text-base font-medium disabled:opacity-60 hover:bg-[#4b1a15] transition shadow-[0_10px_24px_rgba(39,19,16,0.18)]"
              >
                {loading ? "Logging in..." : "Enter the Experience"}
              </button>

              <div className="text-xs sm:text-sm flex flex-wrap gap-3 items-center">
                <Link
                  to="/reset-pass-otp"
                  className="text-[#9f402d] hover:underline text-sm uppercase tracking-[0.13em]"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </form>

          <div className="mt-6 text-sm text-center text-gray-700">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-[#9f402d] font-medium hover:underline"
            >
              Create one
            </Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
