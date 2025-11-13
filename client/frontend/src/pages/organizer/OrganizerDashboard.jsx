import React, { useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axiosClient";

function ProfileCard({ user }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow card-coffee flex gap-4 items-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
        {user?.avatarURL ? <img src={user.avatarURL} alt={user.userName || user.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl text-gray-400">{ (user?.userName || user?.name || "O").slice(0,1).toUpperCase() }</div>}
      </div>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-coffee-dark">{user?.userName || user?.name || "Unnamed Organizer"}</div>
            <div className="text-sm text-gray-500">{user?.email || "no-email@example.com"}</div>
            <div className="text-xs text-gray-400 mt-1">ORGANIZER</div>
          </div>
          <div className="text-right">
            <Link to="/organizer/settings" className="text-sm px-3 py-1 rounded border">Edit profile</Link>
          </div>
        </div>

        {user?.bio && <div className="mt-3 text-sm text-gray-600">{user.bio}</div>}
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

        const s = await api.get("/api/organizer/me/stats").catch(() => ({ data: {} }));
        const ev = await api.get("/api/organizer/me/events?limit=8").catch(() => ({ data: { events: [] } }));

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

    return () => { mounted = false; };
  }, [authUser]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-cream to-coffee-mid text-gray-900 py-10">
      <div className="app-container">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-coffee-dark">Organizer dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your events, attendees and feedback</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/organizer/events/create")} className="bg-coffee-dark text-coffee-cream px-4 py-2 rounded">Create event</button>
            <Link to="/organizer/events" className="text-sm text-gray-700 underline">Manage events</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-1">
            <ProfileCard user={user || {}} />
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Events" value={stats.events} />
            <StatCard label="Attendees" value={stats.attendees} />
            <StatCard label="Queries" value={stats.queries} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg p-4 shadow card-coffee">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Recent events</h3>
              <Link to="/organizer/events" className="text-sm text-coffee-mid">See all</Link>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : events.length === 0 ? (
              <div className="text-gray-500">No events yet. Create an event to get started.</div>
            ) : (
              <ul className="space-y-3">
                {events.map(ev => (
                  <li key={ev._id} className="p-3 border rounded hover:shadow flex items-start justify-between">
                    <div>
                      <div className="font-medium">{ev.title}</div>
                      <div className="text-xs text-gray-500">{ev.location} • {new Date(ev.postedAt).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-600 mt-1">{ev.description?.slice(0, 160)}{ev.description?.length > 160 ? "…" : ""}</div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <Link to={`/organizer/events/${ev._id}/edit`} className="text-sm px-3 py-1 rounded border">Edit</Link>
                      <Link to={`/organizer/events/${ev._id}/queries`} className="text-sm px-3 py-1 rounded bg-coffee-mid text-white">Queries</Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-lg p-4 shadow card-coffee">
            <h3 className="text-lg font-semibold mb-3">Tips</h3>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-2">
              <li>Use clear titles and compelling images — events with images convert better.</li>
              <li>Respond to queries quickly to build trust with attendees.</li>
              <li>Share your event link on social platforms for more attendees.</li>
            </ul>
          </div>
        </div>

        <div className="mt-8"><Outlet /></div>
      </div>
    </div>
  );
}