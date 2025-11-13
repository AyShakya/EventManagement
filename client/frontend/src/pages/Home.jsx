import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosClient";

function EventCard({ ev }) {
  return (
    <Link to={`/events/${ev._id}`} className="block bg-white rounded-xl shadow-sm hover:shadow-md transition p-4">
      <div className="h-40 w-full bg-gray-100 rounded overflow-hidden mb-3 flex items-center justify-center">
        {ev.imageURL ? (
          <img src={ev.imageURL} alt={ev.title} className="object-cover h-full w-full" />
        ) : (
          <div className="text-sm text-gray-500">No image</div>
        )}
      </div>
      <h3 className="text-lg font-semibold">{ev.title}</h3>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ev.description}</p>
      <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
        <span>{ev.location}</span>
        <span>{new Date(ev.postedAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/event?page=1&limit=8");
        const events = (res.data && res.data.events) || [];
        const sortedByLikes = [...events].sort((a, b) => (b.likes || 0) - (a.likes || 0));
        setFeatured(sortedByLikes.slice(0, 4));
        setLatest(events.slice(0, 8));
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
    window.location.href = `/events?q=${encodeURIComponent(q.trim())}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-cream to-coffee-mid text-gray-900">
      {/* Hero */}
      <div className="py-16 px-6">
        <div className="app-container mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-coffee-dark">Discover local events — connect, attend, create.</h1>
            <p className="mt-4 text-coffee-mid max-w-xl">Find events near you, like the ones you love, and create your own. Simple, fast, and community-first.</p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link to="/events" className="bg-coffee-dark text-coffee-cream px-4 py-2 rounded shadow font-medium">Browse Events</Link>
              <Link to="/register" className="border border-coffee-dark text-coffee-dark px-4 py-2 rounded">Create an account</Link>
            </div>
          </div>

          {/* Search */}
          <div className="w-full md:w-96">
            <form onSubmit={onSearchSubmit} className="bg-white p-4 rounded shadow">
              <label className="text-sm text-gray-600">Search events by title or location</label>
              <div className="mt-2 flex gap-2">
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. Hackathon, Paris" className="flex-1 px-3 py-2 border rounded focus:outline-none" />
                <button className="bg-coffee-mid text-white px-4 rounded">Search</button>
              </div>
              <small className="text-xs text-gray-400 mt-2 block">Tip: try "Workshop", "Music", or a city name.</small>
            </form>
          </div>
        </div>
      </div>

      <main className="app-container mx-auto px-4 py-10">
        {error && <div className="text-red-600 mb-4">{error}</div>}

        {/* Featured */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Featured events</h2>
            <Link to="/events" className="text-coffee-mid">See all</Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-56 bg-white rounded shadow animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map(ev => <EventCard key={ev._id} ev={ev} />)}
              {featured.length === 0 && <div className="text-gray-500">No featured events</div>}
            </div>
          )}
        </section>

        {/* Latest */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Latest events</h2>
            <Link to="/events" className="text-coffee-mid">View all</Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-28 bg-white rounded shadow animate-pulse" />)}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map(ev => <EventCard key={ev._id} ev={ev} />)}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="mt-10 bg-white p-6 rounded shadow">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Are you an organizer?</h3>
              <p className="text-gray-600">Create events, manage attendees, and get feedback directly from users.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/register" className="bg-coffee-mid text-white px-4 py-2 rounded">Create organizer account</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="text-center py-8 text-sm text-gray-700">
        © {new Date().getFullYear()} CoffeeEvents — Built with MERN
      </footer>
    </div>
  );
};

export default Home;
