import { useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import api from "../../api/axiosClient";
import { AuthContext } from "../../context/AuthContext";

function ProfileCard({ user }) {
  const initial =
    (user?.userName || user?.name || "U").slice(0, 1).toUpperCase();

  return (
    <div className="bg-white rounded-2xl p-5 shadow card-coffee flex gap-4 items-center border border-coffee-cream/60">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-coffee-cream to-coffee-mid flex items-center justify-center overflow-hidden shrink-0 border border-coffee-mid/20">
          {user?.avatarURL ? (
            <img
              src={user.avatarURL}
              alt={user.userName || user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-semibold text-coffee-dark">
              {initial}
            </span>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-coffee-dark text-coffee-cream shadow-sm">
          {user?.userType ? user.userType.toUpperCase() : "USER"}
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-lg font-semibold text-coffee-dark">
              {user?.userName || user?.name || "Unnamed User"}
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <span>📧</span>
              <span>{user?.email || "no-email@example.com"}</span>
            </div>
            <div className="mt-1 text-xs text-gray-400">
              Member since{" "}
              <span className="font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>

          <div className="text-right">
            <Link
              to="/user/edit"
              className="text-xs px-3 py-1.5 rounded-full border border-coffee-mid/50 text-coffee-mid hover:bg-coffee-mid hover:text-white transition"
            >
              Edit profile
            </Link>
          </div>
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

function StatCard({ label, value, hint }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow card-coffee border border-coffee-cream/60 flex flex-col justify-between">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-coffee-dark">
        {value ?? 0}
      </div>
      {hint && (
        <div className="mt-1 text-[11px] text-gray-400 leading-snug">
          {hint}
        </div>
      )}
    </div>
  );
}

/* Verification banner component */
function VerificationBanner({
  user,
  onResend,
  resendLoading,
  onVerifyToken,
  verifyLoading,
  message,
}) {
  const [token, setToken] = useState("");

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl px-4 py-3 mb-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-yellow-500 text-lg">⚠️</div>
        <div className="flex-1">
          <div className="font-semibold text-yellow-900">
            Email not verified
          </div>
          <p className="text-sm text-yellow-800 mt-1">
            Your email <strong>{user?.email}</strong> is not verified yet.
            Verify to unlock full functionality like notifications and feedback
            confirmations.
          </p>

          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center">
            <button
              onClick={onResend}
              disabled={resendLoading}
              className="inline-flex items-center justify-center bg-yellow-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm disabled:opacity-60"
            >
              {resendLoading ? "Sending..." : "Resend verification email"}
            </button>

            <div className="flex items-center gap-2">
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste verification code"
                className="px-3 py-1.5 rounded-full border text-xs bg-white outline-none focus:ring-1 focus:ring-yellow-500"
              />
              <button
                onClick={() => onVerifyToken(token)}
                disabled={verifyLoading || token.trim().length === 0}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-coffee-mid text-white disabled:opacity-60"
              >
                {verifyLoading ? "Verifying..." : "Verify code"}
              </button>
            </div>
          </div>

          {message && (
            <div className="mt-2 text-xs text-yellow-900">{message}</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* Main User dashboard */
export default function UserDashboard() {
  const { user: authUser, dispatch } = useContext(AuthContext);
  const [user, setUser] = useState(authUser || null);
  const [stats, setStats] = useState({ likes: 0, queries: 0, attended: 0 });
  const [recentQueries, setRecentQueries] = useState([]);
  const [recentAttended, setRecentAttended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  // verification UI state
  const [resendLoading, setResendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifMessage, setVerifMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        // fetch profile if not in context / refresh
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
        // ignore
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
    <div className="min-h-screen bg-gradient-to-b from-coffee-cream via-[#f5ece0] to-coffee-mid text-gray-900 py-10">
      <div className="app-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-coffee-dark">
              Welcome back{user?.userName ? `, ${user.userName}` : ""}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Overview of your account, events you&apos;ve engaged with, and
              your activity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/events")}
              className="bg-coffee-dark text-coffee-cream px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:bg-coffee-mid transition"
            >
              Browse events
            </button>
            <Link
              to="/user/settings"
              className="text-sm text-gray-700 underline"
            >
              Account settings
            </Link>
          </div>
        </div>

        {/* Global error (if any) */}
        {err && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
            {err}
          </div>
        )}

        {/* Verification banner */}
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

        {/* Top row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-1">
            <ProfileCard user={user || {}} />
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total likes"
              value={stats.likes}
              hint="Events you’ve shown love to."
            />
            <StatCard
              label="Queries sent"
              value={stats.queries}
              hint="Questions or feedback submitted."
            />
            <StatCard
              label="Events attended"
              value={stats.attended}
              hint="Based on events marked attended."
            />
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent queries */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-4 shadow card-coffee border border-coffee-cream/60">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-coffee-dark">
                Recent queries & feedback
              </h3>
              <Link
                to="/user/queries"
                className="text-sm text-coffee-mid hover:underline"
              >
                See all
              </Link>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : recentQueries.length === 0 ? (
              <div className="text-gray-500 text-sm">
                You haven&apos;t sent any queries or feedback yet. Use the
                &quot;Send feedback&quot; or &quot;Ask a question&quot; button
                on an event to create one.
              </div>
            ) : (
              <ul className="space-y-3">
                {recentQueries.map((q) => (
                  <li
                    key={q._id}
                    className="p-3 border border-gray-100 rounded-xl hover:shadow-sm hover:border-coffee-cream/90 transition flex flex-col"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium text-coffee-dark line-clamp-1">
                        {q.subject || "Query"}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {new Date(
                          q.createdAt || q.sentAt
                        ).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-1 text-[11px] text-gray-500">
                      Status:{" "}
                      <span className="font-medium">
                        {q.status === "resolved" ? "Resolved" : "Pending"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {q.message?.slice(0, 200)}
                      {q.message?.length > 200 ? "…" : ""}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Sidebar */}
          <div className="bg-white rounded-2xl p-4 shadow card-coffee border border-coffee-cream/60">
            <h3 className="text-lg font-semibold text-coffee-dark mb-3">
              Quick actions
            </h3>
            <div className="flex flex-col gap-3">
              <Link
                to="/events"
                className="block bg-coffee-mid text-white px-3 py-2 rounded-full text-center text-sm font-medium shadow-sm hover:bg-coffee-dark transition"
              >
                Browse events
              </Link>
              <Link
                to="/user/liked"
                className="block px-3 py-2 rounded-full border text-center text-sm hover:bg-gray-50"
              >
                Liked events
              </Link>
              <Link
                to="/user/queries"
                className="block px-3 py-2 rounded-full border text-center text-sm hover:bg-gray-50"
              >
                My queries
              </Link>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Recently attended
              </h4>
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-10 bg-gray-100 rounded-lg animate-pulse"
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
                      <div className="truncate max-w-[160px]">
                        {ev.title || "Event"}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {new Date(
                          ev.attendedAt || ev.startAt || ev.postedAt
                        ).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Nested routes (if any) */}
        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
