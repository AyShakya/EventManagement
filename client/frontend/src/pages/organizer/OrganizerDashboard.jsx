import React, { useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axiosClient";

function ProfileCard({ user }) {
  const initial =
    (user?.userName || user?.name || "O").slice(0, 1).toUpperCase();

  return (
    <div className="bg-white rounded-2xl p-5 shadow card-coffee flex gap-4 items-center border border-coffee-cream/60">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-coffee-cream to-coffee-mid flex items-center justify-center overflow-hidden flex-shrink-0 border border-coffee-mid/20">
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
        <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-coffee-dark text-coffee-cream shadow-sm">
          ORGANIZER
        </div>
      </div>

      <div className="flex-1">
        {/* ⬇ key fix: stack on small screens, row on sm+ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="text-lg font-semibold text-coffee-dark">
              {user?.userName || user?.name || "Unnamed Organizer"}
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <span>📧</span>
              <span>{user?.email || "no-email@example.com"}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Organizer since{" "}
              <span className="font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <Link
              to="/organizer/settings"
              className="inline-flex items-center justify-center text-xs px-3 py-1.5 rounded-full border border-coffee-mid/60 text-coffee-mid hover:bg-coffee-mid hover:text-white transition"
            >
              Edit profile
            </Link>
          </div>
        </div>

        {user?.bio && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-3">{user.bio}</p>
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

export default function OrganizerDashboard() {
  const { user: authUser } = useContext(AuthContext);
  const [user, setUser] = useState(authUser || null);
  const [stats, setStats] = useState({ events: 0, attendees: 0, queries: 0 });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        if (!authUser) {
          const me = await api.get("/api/organizer/me");
          if (!mounted) return;
          setUser(me.data?.user || null);
        }

        const s = await api
          .get("/api/organizer/me/stats")
          .catch(() => ({ data: {} }));
        const ev = await api
          .get("/api/organizer/me/events?limit=8")
          .catch(() => ({ data: { events: [] } }));

        if (!mounted) return;
        setStats({
          events: s.data?.events ?? 0,
          attendees: s.data?.attendees ?? 0,
          queries: s.data?.queries ?? 0,
        });
        setEvents(ev.data?.events ?? []);
      } catch (e) {
        console.error(e);
        setErr("Failed to load organizer data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [authUser]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-cream via-[#f5ece0] to-coffee-mid text-gray-900 py-10">
      <div className="app-container">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-coffee-dark">
              Organizer dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your events, track attendees, and respond to feedback.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/organizer/events/create")}
              className="bg-coffee-dark text-coffee-cream px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:bg-coffee-mid transition"
            >
              + Create event
            </button>
            <Link
              to="/organizer/events"
              className="text-sm text-gray-700 underline"
            >
              Manage events
            </Link>
          </div>
        </div>

        {/* Global error */}
        {err && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
            {err}
          </div>
        )}

        {/* Top row: profile + stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-1">
            <ProfileCard user={user || {}} />
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total events"
              value={stats.events}
              hint="Published events associated with your account."
            />
            <StatCard
              label="Total attendees"
              value={stats.attendees}
              hint="Based on reported attendance across completed events."
            />
            <StatCard
              label="Queries received"
              value={stats.queries}
              hint="Questions and feedback sent by users."
            />
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent events */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-4 shadow card-coffee border border-coffee-cream/60">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-coffee-dark">
                Recent events
              </h3>
              <Link
                to="/organizer/events"
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
            ) : events.length === 0 ? (
              <div className="text-gray-500 text-sm">
                You haven&apos;t created any events yet.{" "}
                <button
                  onClick={() => navigate("/organizer/events/create")}
                  className="text-coffee-mid underline"
                >
                  Create your first event.
                </button>
              </div>
            ) : (
              <ul className="space-y-3">
                {events.map((ev) => (
                  <li
                    key={ev._id}
                    className="p-3 border border-gray-100 rounded-xl hover:border-coffee-cream/90 hover:shadow-sm transition flex items-start justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-coffee-dark line-clamp-1">
                          {ev.title}
                        </div>
                        {ev.startAt && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-coffee-cream/60 text-coffee-dark font-medium">
                            {new Date(ev.startAt) > new Date()
                              ? "Upcoming"
                              : "Completed"}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {ev.location} •{" "}
                        {ev.postedAt
                          ? new Date(ev.postedAt).toLocaleDateString()
                          : "Unpublished"}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1 flex gap-3">
                        <span>❤️ {ev.likes ?? 0}</span>
                        <span>👁️ {ev.views ?? 0}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {ev.description?.slice(0, 160)}
                        {ev.description?.length > 160 ? "…" : ""}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      <Link
                        to={`/organizer/events/${ev._id}/edit`}
                        className="text-xs px-3 py-1.5 rounded-full border border-coffee-mid/60 text-coffee-mid hover:bg-coffee-mid hover:text-white transition"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/organizer/events/${ev._id}/queries`}
                        className="text-xs px-3 py-1.5 rounded-full bg-coffee-mid text-white hover:bg-coffee-dark transition"
                      >
                        Queries
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tips / side panel */}
          <div className="bg-white rounded-2xl p-4 shadow card-coffee border border-coffee-cream/60">
            <h3 className="text-lg font-semibold text-coffee-dark mb-3">
              Organizer tips
            </h3>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-2">
              <li>
                Use clear titles and compelling images — events with strong
                visuals attract more attendees.
              </li>
              <li>
                Respond to queries quickly to build trust and boost future
                attendance.
              </li>
              <li>
                Share your event link in college groups, social platforms, and
                WhatsApp communities for reach.
              </li>
              <li>
                After events, update stats so your dashboard reflects real
                performance over time.
              </li>
            </ul>

            <div className="mt-5 p-3 rounded-xl bg-coffee-cream/60 text-[13px] text-coffee-dark">
              Pro tip: Keep all important events & stats updated — this will
              make your organizer profile look stronger to students and admins.
            </div>
          </div>
        </div>

        {/* Nested content (like /events, /queries etc.) */}
        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
