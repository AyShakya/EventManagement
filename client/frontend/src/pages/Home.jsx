import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosClient";
import { getEventStage } from "../utils/eventStage";

/* ---------- Shared event card (used in Featured section) ---------- */
function EventCard({ ev }) {
  const cover =
    ev.imageURL ||
    (Array.isArray(ev.images) && ev.images.length > 0 && ev.images[0]) ||
    "";

  const stageInfo = getEventStage(ev.startAt);

  return (
    <Link
      to={`/events/${ev._id}`}
      className="group block bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden border border-coffee-cream/60"
    >
      {/* Image */}
      <div className="relative h-40 w-full bg-gray-100 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={ev.title}
            className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-xs text-gray-600">
            <span className="font-medium">No image</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

        {/* Stage chip */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[11px]">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium
              ${
                stageInfo.stage === "completed"
                  ? "bg-green-100/90 text-green-800"
                  : stageInfo.stage === "upcoming"
                  ? "bg-blue-100/90 text-blue-800"
                  : "bg-gray-100/90 text-gray-800"
              }`}
          >
            {stageInfo.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-base font-semibold text-coffee-dark line-clamp-2 group-hover:text-coffee-mid">
          {ev.title}
        </h3>

        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span>📍</span>
            <span className="truncate max-w-[140px]">{ev.location}</span>
          </span>
          <span>
            {ev.startAt
              ? new Date(ev.startAt).toLocaleDateString()
              : new Date(ev.postedAt).toLocaleDateString()}
          </span>
        </div>

        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {ev.description}
        </p>

        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span>❤️</span>
            <span>{ev.likes || 0}</span>
            <span className="mx-1">·</span>
            <span>👁️ {ev.views || 0}</span>
          </span>
          <span className="text-coffee-mid font-medium text-[11px]">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ------------------------- Home page ------------------------- */
const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // just first page (8) is fine for home
        const res = await api.get("/api/event?page=1&limit=8");
        const all = (res.data && res.data.events) || [];
        setEvents(all);

        const sortedByLikes = [...all].sort(
          (a, b) => (b.likes || 0) - (a.likes || 0)
        );
        setFeatured(sortedByLikes.slice(0, 4));
      } catch (e) {
        console.error(e);
        setError(e?.response?.data?.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function onSearchSubmit(e) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) {
      window.location.href = "/events";
      return;
    }
    window.location.href = `/events?q=${encodeURIComponent(trimmed)}`;
  }

  // quick stats for “overview” section
  const totalEvents = events.length;
  const upcomingCount = events.filter(
    (ev) => getEventStage(ev.startAt).stage === "upcoming"
  ).length;
  const completedCount = events.filter(
    (ev) => getEventStage(ev.startAt).stage === "completed"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-cream via-[#f5ece0] to-coffee-mid text-gray-900 flex flex-col">
      {/* Hero */}
      <section className="py-14 px-4 md:px-6 bg-coffee-hero text-coffee-cream">
        <div className="app-container mx-auto flex flex-col lg:flex-row items-center gap-10">
          {/* Left text side */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/15 text-xs mb-4 border border-white/10">
              <span className="text-[10px] uppercase tracking-[0.16em]">
                CoffeeEvents
              </span>
              <span className="h-1 w-1 rounded-full bg-coffee-cream" />
              <span className="text-[10px] opacity-80">
                Discover · Attend · Organize
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-coffee-cream drop-shadow-sm">
              Discover events that{" "}
              <span className="text-[#F5CBA7]">match your vibe</span>.
            </h1>

            <p className="mt-4 text-sm md:text-base text-coffee-cream/90 max-w-xl">
              From tech fests to open mics — explore what&apos;s happening
              around you, save your favorites, and get post-event insights from
              organizers.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/events"
                className="inline-flex items-center justify-center bg-coffee-cream text-coffee-dark px-4 py-2.5 rounded-full shadow font-medium text-sm hover:bg-[#f8e7d1] transition"
              >
                Browse events
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center border border-coffee-cream/70 text-coffee-cream px-4 py-2.5 rounded-full text-sm hover:bg-black/10 transition"
              >
                Create organizer account
              </Link>
            </div>

            {/* Tiny stats row */}
            <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-coffee-cream/80">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                Live and upcoming events handled in real-time.
              </div>
              <div>Track likes, views & post-event stats.</div>
            </div>
          </div>

          {/* Right search card */}
          <div className="w-full max-w-md">
            <div className="bg-white/95 rounded-2xl shadow-xl p-5 border border-coffee-cream/50 backdrop-blur-sm">
              <h2 className="text-base font-semibold text-coffee-dark mb-2">
                Search events
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                Search by title or location — for example,{" "}
                <span className="italic">Hackathon</span> or{" "}
                <span className="italic">Delhi</span>.
              </p>

              <form onSubmit={onSearchSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Try: Hackathon, Music, Workshop..."
                    className="flex-1 px-3 py-2 text-coffee-mid rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-coffee-mid focus:border-coffee-mid"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-coffee-mid text-white text-sm font-medium hover:bg-coffee-dark transition"
                  >
                    Search
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] text-gray-500">
                  <span className="font-medium">Popular:</span>
                  <button
                    type="button"
                    onClick={() => setQ("Workshop")}
                    className="px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    Workshop
                  </button>
                  <button
                    type="button"
                    onClick={() => setQ("Hackathon")}
                    className="px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    Hackathon
                  </button>
                  <button
                    type="button"
                    onClick={() => setQ("Music")}
                    className="px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    Music
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="app-container mx-auto px-4 py-10 flex-1 w-full">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Quick overview stats */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-coffee-cream/60">
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Total events
              </div>
              <div className="mt-1 text-2xl font-semibold text-coffee-dark">
                {totalEvents}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Across all stages on the platform.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-coffee-cream/60">
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Upcoming
              </div>
              <div className="mt-1 text-2xl font-semibold text-coffee-dark">
                {upcomingCount}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Events that haven&apos;t started yet.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-coffee-cream/60">
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Completed
              </div>
              <div className="mt-1 text-2xl font-semibold text-coffee-dark">
                {completedCount}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                With potential post-event stats & highlights.
              </p>
            </div>
          </div>
        </section>

        {/* Featured events */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-coffee-dark">
                Featured events
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Most loved events based on likes and activity.
              </p>
            </div>
            <Link
              to="/events"
              className="text-xs md:text-sm text-coffee-mid hover:underline"
            >
              See all events
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-56 bg-white rounded-2xl shadow-sm animate-pulse"
                />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="text-gray-500 text-sm bg-white rounded-2xl p-6 shadow-sm">
              No featured events yet. Check back soon, or browse all events.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map((ev) => (
                <EventCard key={ev._id} ev={ev} />
              ))}
            </div>
          )}
        </section>

        {/* How it helps / value proposition */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-coffee-cream/60">
            <h3 className="text-lg font-semibold text-coffee-dark mb-2">
              For attendees
            </h3>
            <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
              <li>Browse events by stage: upcoming, completed, unscheduled.</li>
              <li>Like events to save them in your personal list.</li>
              <li>Send feedback or questions directly to organizers.</li>
              <li>
                See post-event stats (attendance, ratings, highlights) when
                organizers publish them.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-coffee-cream/60">
            <h3 className="text-lg font-semibold text-coffee-dark mb-2">
              For organizers
            </h3>
            <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
              <li>Create and manage events from a dedicated dashboard.</li>
              <li>Track views, likes, queries, and attendee interest.</li>
              <li>
                After the event, record stats like attendance, revenue, and
                highlights.
              </li>
              <li>
                Optionally publish a recap so your event page becomes a
                showcase.
              </li>
            </ul>
          </div>
        </section>

        {/* CTA strip */}
        <section className="mt-4 bg-white rounded-2xl p-6 md:p-7 shadow-sm border border-coffee-cream/60">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-coffee-dark">
                Organize your next event with CoffeeEvents
              </h3>
              <p className="text-sm text-gray-600 mt-1 max-w-md">
                Create events, collect feedback, and publish post-event stats
                like attendance, ratings, and highlights — all in one place.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="bg-coffee-mid text-white px-4 py-2 rounded-full text-sm hover:bg-coffee-dark transition"
              >
                Start as organizer
              </Link>
              <Link
                to="/login"
                className="px-4 py-2 rounded-full border text-sm hover:bg-gray-50 transition"
              >
                I already have an account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with better contrast */}
      <footer className="mt-12 bg-gradient-to-r from-[#1a0605] to-[#2b0d0f] text-coffee-cream/80 text-sm border-t-4 border-coffee-mid">
        <div className="app-container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-semibold">
            © {new Date().getFullYear()} CoffeeEvents · Built with MERN Stack
          </span>
          <span className="text-xs text-coffee-cream/60">
            For campus events, fests, tech talks & community meetups ☕
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
