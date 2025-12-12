import React, { useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axiosClient";

function ProfileCard({ user }) {
  const initial =
    (user?.userName || user?.name || "O").slice(0, 1).toUpperCase();

  return (
    <div className="bg-white rounded-xl p-5 shadow card-coffee flex gap-4 items-start border border-coffee-cream/60">
      <div className="shrink-0">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
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
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="min-w-0">
            <div className="text-lg font-semibold text-coffee-dark truncate">
              {user?.userName || user?.name || "Unnamed Organizer"}
            </div>
            <div className="text-sm text-gray-600 truncate">
              {user?.email || "no-email@example.com"}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              ORGANIZER
              {user?.createdAt && (
                <>
                  {" "}
                  • since{" "}
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </>
              )}
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

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow card-coffee border border-coffee-cream/60">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-coffee-dark">
        {value ?? 0}
      </div>
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
    <div className="min-h-screen bg-gradient-to-b from-coffee-cream to-coffee-mid text-gray-900 py-10">
      <div className="app-container">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-coffee-dark">
              Organizer dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your events, attendees and feedback
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/organizer/events/create")}
              className="bg-coffee-dark text-coffee-cream px-4 py-2 rounded-full text-sm"
            >
              Create event
            </button>
            <Link
              to="/organizer/events"
              className="text-sm text-gray-800 underline underline-offset-4"
            >
              Manage events
            </Link>
          </div>
        </div>

        {/* Top row: profile + stats (structure preserved, no overlap) */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="lg:w-[320px] w-full">
            <ProfileCard user={user || {}} />
          </div>

          <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Events" value={stats.events} />
            <StatCard label="Attendees" value={stats.attendees} />
            <StatCard label="Queries" value={stats.queries} />
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent events */}
          <div className="lg:col-span-2 bg-white rounded-xl p-4 shadow card-coffee border border-coffee-cream/60">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-coffee-dark">
                Recent events
              </h3>
              <Link
                to="/organizer/events"
                className="text-sm text-coffee-mid"
              >
                See all
              </Link>
            </div>

            {err && (
              <div className="mb-2 text-xs text-red-600">
                {err}
              </div>
            )}

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-100 rounded animate-pulse"
                  />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-gray-500 text-sm">
                No events yet. Create an event to get started.
              </div>
            ) : (
              <ul className="space-y-3">
                {events.map((ev) => (
                  <li
                    key={ev._id}
                    className="p-3 border rounded-lg hover:shadow-sm transition flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-coffee-dark truncate">
                        {ev.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ev.location} •{" "}
                        {new Date(ev.postedAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {ev.description}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end shrink-0">
                      <Link
                        to={`/organizer/events/${ev._id}/edit`}
                        className="text-xs px-3 py-1 rounded-full border border-coffee-mid/60 hover:bg-coffee-mid hover:text-white transition"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/organizer/events/${ev._id}/queries`}
                        className="text-xs px-3 py-1 rounded-full bg-coffee-mid text-white hover:bg-coffee-dark transition"
                      >
                        Queries
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Tips card with bullets & highlight */}
          <div className="bg-white rounded-xl p-4 shadow card-coffee border border-coffee-cream/60">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-6 rounded-full bg-coffee-mid" />
              <h3 className="text-lg font-semibold text-coffee-dark">
                Tips to grow your events
              </h3>
            </div>
            <ul className="text-sm text-gray-700 list-disc list-inside space-y-2 mt-2">
              <li>
                Use clear, specific titles and add a strong cover image — events
                with images get more clicks.
              </li>
              <li>
                Reply to queries quickly to build trust and reduce drop-offs.
              </li>
              <li>
                Share your event link on WhatsApp groups, college channels and
                social media for more attendees.
              </li>
              <li>
                After the event, fill in stats so you can compare performance
                across events over time.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
