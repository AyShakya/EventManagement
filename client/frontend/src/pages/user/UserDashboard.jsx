import { useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import api from "../../api/axiosClient";
import { AuthContext } from "../../context/AuthContext";

function ProfileCard({ user }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow card-coffee flex gap-4 items-center">
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

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-coffee-dark">
              {user?.userName || user?.name || "Unnamed User"}
            </div>
            <div className="text-sm text-gray-500">
              {user?.email || "no-email@example.com"}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {user?.userType ? user.userType.toUpperCase() : "USER"}
            </div>
          </div>
          <div className="text-right">
            <Link to="/user/edit" className="text-sm px-3 py-1 rounded border">
              Edit profile
            </Link>
          </div>
        </div>

        {user?.bio && (
          <div className="mt-3 text-sm text-gray-600">{user.bio}</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow card-coffee">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value ?? 0}</div>
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
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="font-medium text-yellow-800">Email not verified</div>
          <div className="text-sm text-yellow-700 mt-1">
            Your account email <strong>{user?.email}</strong> is not verified
            yet. Verify to unlock full functionality (notifications, feedback
            confirmations).
          </div>

          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onResend}
              disabled={resendLoading}
              className="bg-yellow-600 text-white px-3 py-1 rounded disabled:opacity-60"
            >
              {resendLoading ? "Sending..." : "Resend verification email"}
            </button>

            <div className="flex items-center gap-2">
              <input
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste verification code"
                className="px-2 py-1 rounded border"
              />
              <button
                onClick={() => onVerifyToken(token)}
                disabled={verifyLoading || token.trim().length === 0}
                className="bg-coffee-mid text-white px-3 py-1 rounded disabled:opacity-60"
              >
                {verifyLoading ? "Verifying..." : "Verify code"}
              </button>
            </div>
          </div>

          {message && <div className="mt-2 text-sm">{message}</div>}
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

        // stats endpoint (implement later in backend)
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

      // refresh user from server (so emailVerified flag updates)
      const me = await api.get("/api/user/me").catch(() => ({ data: {} }));
      const updatedUser = me.data?.user || { ...user, emailVerified: true };

      // update both local and global auth context user
      setUser(updatedUser);
      try {
        dispatch?.({ type: "SET_USER", payload: updatedUser });
      } catch (e) {
        // ignore if dispatch not available
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-coffee-dark">
              Welcome back{user?.userName ? `, ${user.userName}` : ""}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Overview of your account and activity
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/events")}
              className="bg-coffee-dark text-coffee-cream px-4 py-2 rounded"
            >
              Browse Events
            </button>
            <Link
              to="/user/settings"
              className="text-sm text-gray-700 underline"
            >
              Account settings
            </Link>
          </div>
        </div>

        {/* Verification banner: shows when user exists & emailVerified !== true */}
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

        {/* top row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-1">
            <ProfileCard user={user || {}} />
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Total likes" value={stats.likes} />
            <StatCard label="Queries" value={stats.queries} />
            <StatCard label="Attended" value={stats.attended} />
          </div>
        </div>

        {/* main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg p-4 shadow card-coffee">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Recent queries</h3>
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
              <div className="text-gray-500">
                No queries yet. Use the feedback form on an event to create one.
              </div>
            ) : (
              <ul className="space-y-3">
                {recentQueries.map((q) => (
                  <li
                    key={q._id}
                    className="p-3 border rounded hover:shadow flex flex-col"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{q.subject}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </div>
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

          <div className="bg-white rounded-lg p-4 shadow card-coffee">
            <h3 className="text-lg font-semibold mb-3">Quick actions</h3>
            <div className="flex flex-col gap-3">
              <Link
                to="/events"
                className="block bg-coffee-mid text-white px-3 py-2 rounded text-center"
              >
                Browse events
              </Link>
              <Link
                to="/user/liked"
                className="block px-3 py-2 rounded border text-center"
              >
                Liked events
              </Link>
              <Link
                to="/user/queries"
                className="block px-3 py-2 rounded border text-center"
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
                <div className="text-gray-500">
                  You haven't attended any events yet.
                </div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {recentAttended.map((ev) => (
                    <li
                      key={ev._id}
                      className="flex items-center justify-between"
                    >
                      <div>{ev.title}</div>
                      <div className="text-xs text-gray-400">
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
