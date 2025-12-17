import { useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import api from "../../api/axiosClient";
import { AuthContext } from "../../context/AuthContext";

function ProfileCard({ user }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow card-coffee flex gap-4 items-start border border-coffee-cream/60">
      <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden shrink-0">
        {user?.avatarURL ? (
          <img
            src={user.avatarURL}
            alt={user.userName || user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl text-gray-400">
            {(user?.userName || user?.name || "U").slice(0, 1).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="min-w-0">
            <div className="text-lg font-semibold text-coffee-dark truncate">
              {user?.userName || user?.name || "Unnamed User"}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {user?.email || "no-email@example.com"}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {user?.userType ? user.userType.toUpperCase() : "USER"}
            </div>
          </div>

          {/* <div className="text-left sm:text-right">
            <Link
              to="/user/edit"
              className="inline-flex items-center justify-center text-xs px-3 py-1.5 rounded-full border border-coffee-mid/60 text-coffee-mid hover:bg-coffee-mid hover:text-white transition"
            >
              Edit profile
            </Link>
          </div> */}
        </div>

        {user?.bio && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-3">
            {user.bio}
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow card-coffee border border-coffee-cream/60">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-coffee-dark">
        {value ?? 0}
      </div>
    </div>
  );
}

function VerificationBanner({
  user,
  onResend,
  resendLoading,
  onVerifyToken,
  verifyLoading,
  message,
}) {
  const [token, setToken] = useState("");
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 shadow-sm">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="mt-0.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-sm">
            !
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="font-medium text-amber-900">
                Verify your email
              </div>
              <div className="text-xs sm:text-sm text-amber-800 mt-0.5">
                We haven&apos;t verified{" "}
                <strong>{user?.email || "your email"}</strong> yet. This helps
                with notifications and feedback updates.
              </div>
              {message && (
                <div className="mt-1 text-xs text-amber-900">{message}</div>
              )}
            </div>

            {/* Dismiss button on the right (desktop) */}
            <button
              type="button"
              onClick={() => setHidden(true)}
              className="hidden sm:inline-flex ml-4 text-xs text-amber-700 hover:text-amber-900"
            >
              Dismiss
            </button>
          </div>

          {/* Actions */}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: resend */}
            <button
              onClick={onResend}
              disabled={resendLoading}
              className="inline-flex items-center justify-center bg-amber-600 text-white px-3 py-1.5 rounded-full text-xs font-medium disabled:opacity-60"
            >
              {resendLoading ? "Sending..." : "Resend verification email"}
            </button>

            {/* Right: token + verify */}
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Verification code"
                className="px-2 py-1.5 rounded border border-amber-200 text-xs sm:text-sm w-full sm:w-44 bg-white/70 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <button
                onClick={() => onVerifyToken(token)}
                disabled={verifyLoading || token.trim().length === 0}
                className="inline-flex items-center justify-center bg-coffee-mid text-white px-3 py-1.5 rounded-full text-xs font-medium disabled:opacity-60"
              >
                {verifyLoading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dismiss (top-right) */}
        <button
          type="button"
          onClick={() => setHidden(true)}
          className="sm:hidden ml-2 mt-0.5 text-xs text-amber-500 hover:text-amber-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}



export default function UserDashboard() {
  const { user: authUser, dispatch } = useContext(AuthContext);
  const [user, setUser] = useState(authUser || null);
  const [stats, setStats] = useState({ likes: 0, queries: 0, attended: 0 });
  const [recentQueries, setRecentQueries] = useState([]);
  const [recentAttended, setRecentAttended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const [resendLoading, setResendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifMessage, setVerifMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        if (!authUser) {
          const me = await api.get("/api/user/me").catch(() => ({ data: {} }));
          if (!mounted) return;
          setUser(me.data?.user || null);
        }

        const s = await api
          .get("/api/user/me/stats")
          .catch(() => ({ data: {} }));
        const q = await api
          .get("/api/user/me/queries?limit=6")
          .catch(() => ({ data: { queries: [] } }));
        const a = await api
          .get("/api/user/me/attended?limit=6")
          .catch(() => ({ data: { events: [] } }));

        if (!mounted) return;
        setStats({
          likes: s.data?.likes ?? 0,
          queries: s.data?.queries ?? 0,
          attended: s.data?.attended ?? 0,
        });
        setRecentQueries(q.data?.queries ?? []);
        setRecentAttended(a.data?.events ?? []);
      } catch (e) {
        console.error(e);
        setErr("Failed to load dashboard data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authUser]);

  async function handleResendVerify() {
    if (!user?.email) {
      setVerifMessage("No email available to resend verification.");
      return;
    }
    setResendLoading(true);
    setVerifMessage("");
    try {
      const res = await api.post("/api/auth/send-verification");
      setVerifMessage(
        res?.data?.message || "Verification email sent. Check your inbox."
      );
    } catch (err) {
      console.error(err);
      setVerifMessage(
        err?.response?.data?.message || "Failed to resend verification email."
      );
    } finally {
      setResendLoading(false);
    }
  }

  async function handleVerifyToken(token) {
    const t = (token || "").trim();
    if (!t) {
      setVerifMessage("Please paste the verification code/token.");
      return;
    }
    setVerifyLoading(true);
    setVerifMessage("");
    try {
      const res = await api.get("/api/auth/verify-email", {
        params: { token: t },
      });
      const data = res?.data;
      const msg =
        typeof data === "string"
          ? data
          : data?.message || "Email verified — thank you!";

      const me = await api.get("/api/user/me").catch(() => ({ data: {} }));
      const updatedUser = me.data?.user || { ...user, emailVerified: true };

      setUser(updatedUser);
      try {
        dispatch?.({ type: "SET_USER", payload: updatedUser });
      } catch {
      }

      setVerifMessage(msg);
    } catch (err) {
      console.error(err);
      setVerifMessage(
        err?.response?.data?.message || "Verification failed or token expired."
      );
    } finally {
      setVerifyLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-cream to-coffee-mid text-gray-900 py-10">
      <div className="app-container">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-coffee-dark">
              Welcome back{user?.userName ? `, ${user.userName}` : ""}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Overview of your account and activity
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/events")}
              className="bg-coffee-dark text-coffee-cream px-4 py-2 rounded-full text-sm"
            >
              Browse Events
            </button>
          </div>
        </div>

        {user && !user.emailVerified && (
          <VerificationBanner
            user={user}
            onResend={handleResendVerify}
            resendLoading={resendLoading}
            onVerifyToken={handleVerifyToken}
            verifyLoading={verifyLoading}
            message={verifMessage}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="lg:w-[320px] w-full">
            <ProfileCard user={user || {}} />
          </div>

          <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total likes" value={stats.likes} />
            <StatCard label="Queries" value={stats.queries} />
            <StatCard label="Attended" value={stats.attended} />
          </div>
        </div>

        {/* main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-4 shadow card-coffee border border-coffee-cream/60">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-coffee-dark">
                Recent queries
              </h3>
              <Link to="/user/queries" className="text-sm text-coffee-mid">
                See all
              </Link>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-100 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : recentQueries.length === 0 ? (
              <div className="text-gray-500 text-sm">
                No queries yet. Use the feedback form on an event to create one.
              </div>
            ) : (
              <ul className="space-y-3">
                {recentQueries.map((q) => (
                  <li
                    key={q._id}
                    className="p-3 border rounded-xl hover:shadow-sm transition flex flex-col"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-coffee-dark truncate">
                        {q.subject}
                      </div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {q.message}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-2xl p-4 shadow card-coffee border border-coffee-cream/60">
            <h3 className="text-lg font-semibold mb-3 text-coffee-dark">
              Quick actions
            </h3>
            <div className="flex flex-col gap-3">
              <Link
                to="/events"
                className="block bg-coffee-mid text-white px-3 py-2 rounded-full text-center text-sm"
              >
                Browse events
              </Link>
              <Link
                to="/user/liked"
                className="block px-3 py-2 rounded-full border text-center text-sm"
              >
                Liked events
              </Link>
              <Link
                to="/user/queries"
                className="block px-3 py-2 rounded-full border text-center text-sm"
              >
                My queries
              </Link>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Recently attended
              </h4>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-10 bg-gray-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : recentAttended.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  You haven&apos;t attended any events yet.
                </div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {recentAttended.map((ev) => (
                    <li
                      key={ev._id}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="truncate">{ev.title}</div>
                      <div className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(
                          ev.attendedAt || ev.postedAt
                        ).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
