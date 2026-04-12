import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import { getEventStage } from "../utils/eventStage";

function EventCard({ ev }) {
  const cover =
    ev.imageURL ||
    (Array.isArray(ev.images) && ev.images.length > 0 && ev.images[0]) ||
    "";

  const stageInfo = getEventStage(ev.startAt);

  return (
    <Link
      to={`/events/${ev._id}`}
      className="group block rounded-[24px] bg-[#ffffff] p-2 shadow-[0_18px_30px_rgba(27,29,14,0.08)] transition-all duration-200 hover:-translate-y-1"
    >
      <div className="relative h-44 w-full overflow-hidden rounded-[18px] bg-[#eaead1]">
        {cover ? (
          <img
            src={cover}
            alt={ev.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[#5f604f]">
            No image
          </div>
        )}

        <span className="absolute right-3 top-3 rounded-full bg-[#fd876f] px-3 py-1 text-[10px] font-medium text-[#732010]">
          {stageInfo.label}
        </span>
      </div>

      <div className="px-2 pb-3 pt-4">
        <h3 className="line-clamp-2 text-[1.85rem] leading-[1.05] text-[#1f0f0d] group-hover:text-[#9f402d]">
          {ev.title}
        </h3>

        <div className="mt-3 flex items-center justify-between text-[12px] text-[#7a7468]">
          <span className="truncate max-w-[65%]">{ev.location}</span>
          <span>
            {ev.startAt
              ? new Date(ev.startAt).toLocaleDateString()
              : new Date(ev.postedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  );
}

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
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
      navigate("/events");
      return;
    }
    navigate(`/events?q=${encodeURIComponent(trimmed)}`);
  }

  const totalEvents = events.length;
  const upcomingCount = events.filter(
    (ev) => getEventStage(ev.startAt).stage === "upcoming"
  ).length;
  const completedCount = events.filter(
    (ev) => getEventStage(ev.startAt).stage === "completed"
  ).length;

  const heroImage =
    (featured[0] &&
      (featured[0].imageURL ||
        (Array.isArray(featured[0].images) && featured[0].images[0]))) ||
    (events[0] &&
      (events[0].imageURL ||
        (Array.isArray(events[0].images) && events[0].images[0]))) ||
    "";

  return (
    <div className="min-h-screen bg-[#fbfbe2] text-[#1b1d0e] page-content">
      <main className="app-container mx-auto px-4 pb-12 pt-8 md:pt-12">
        {error && (
          <div className="mb-6 rounded-[20px] bg-[#f5c1b7] px-4 py-3 text-sm text-[#63251b]">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-10 lg:grid-cols-[1.02fr_1fr] lg:items-center">
          <div>
            <h1 className="max-w-[620px] text-[3rem] leading-[0.92] text-[#1f0f0d] sm:text-[4.3rem] lg:text-[5.4rem]">
              Discover
              <br />
              events that
              <br />
              match your
              <br />
              <span className="italic text-[#9f402d]">vibe.</span>
            </h1>

            <form
              onSubmit={onSearchSubmit}
              className="mt-7 flex w-full max-w-2xl items-center gap-3 rounded-full bg-[#ffffff] p-2 shadow-[0_12px_24px_rgba(27,29,14,0.08)]"
            >
              <span className="pl-3 text-[#7a7468]">⌕</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Event title or location..."
                className="h-11 flex-1 bg-transparent px-1 text-sm text-[#2d2e1d] placeholder:text-[#9a9588] focus:outline-none"
              />
              <button
                type="submit"
                className="h-11 rounded-full bg-[#271310] px-8 text-sm font-semibold text-white hover:bg-[#3c201c]"
              >
                Search
              </button>
            </form>

            <div className="mt-8 flex flex-wrap gap-8 text-[#1f0f0d]">
              <div>
                <div className="text-4xl leading-none">{totalEvents}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-[#787467]">
                  Total
                </div>
              </div>
              <div>
                <div className="text-4xl leading-none text-[#9f402d]">{upcomingCount}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-[#787467]">
                  Upcoming
                </div>
              </div>
              <div>
                <div className="text-4xl leading-none">{completedCount}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.24em] text-[#787467]">
                  Completed
                </div>
              </div>
            </div>
          </div>

          <div className="relative lg:justify-self-end">
            <div className="overflow-hidden rounded-[40px] bg-[#eaead1] shadow-[0_28px_40px_rgba(27,29,14,0.18)]">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt="Featured event"
                  className="h-[500px] w-full object-cover md:h-[620px] lg:w-[560px]"
                />
              ) : (
                <div className="flex h-[500px] w-full items-center justify-center bg-[#e4e4ca] text-[#656652] md:h-[620px] lg:w-[560px]">
                  Featured experience
                </div>
              )}
            </div>

            <div className="absolute -bottom-6 left-[-10px] max-w-[230px] rotate-[-3deg] rounded-[22px] bg-[#f7dc44] px-5 py-4 text-xl italic leading-snug text-[#362804] shadow-[0_14px_20px_rgba(27,29,14,0.16)]">
              “The best stories start over a perfectly brewed cup.”
            </div>
          </div>
        </section>

        <section className="mt-24">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-[#9f402d]">
                Curated picks
              </p>
              <h2 className="mt-2 text-5xl leading-none text-[#1f0f0d]">
                Featured Experiences
              </h2>
            </div>
            <Link
              to="/events"
              className="text-sm text-[#9f402d] underline decoration-[#9f402d]/40 underline-offset-4"
            >
              See all events →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 rounded-[24px] skeleton-block" />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div className="rounded-[24px] bg-[#f5f5dc] px-6 py-8 text-sm text-[#625f53]">
              No featured events yet. Check back soon, or browse all events.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((ev) => (
                <EventCard key={ev._id} ev={ev} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-20 grid grid-cols-1 overflow-hidden rounded-[36px] bg-[#f5f5dc] md:grid-cols-2">
          <div className="p-10 md:p-12">
            <div className="mb-6 text-3xl text-[#9f402d]">☕</div>
            <h3 className="text-6xl leading-[0.95] text-[#1f0f0d]">For the Seekers</h3>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[#5d5a50]">
              Immerse yourself in curated gatherings that celebrate craft,
              conversation, and connection.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-[#2f301f]">
              <li>● Access exclusive local workshops</li>
              <li>● Connect with master artisans</li>
              <li>● Seamless booking & reminders</li>
            </ul>
          </div>

          <div className="bg-[#2c100d] p-10 text-[#fff5e8] md:p-12">
            <div className="mb-6 text-3xl text-[#fd876f]">✦</div>
            <h3 className="text-6xl leading-[0.95]">For the Curators</h3>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[#e6cdbd]">
              Turn your passion into a shared experience. Host events with tools
              designed for artisans.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-[#f8dcc9]">
              <li>● Simple dashboard for attendee management</li>
              <li>● Direct communication with your community</li>
              <li>● Automated waitlists & scheduling</li>
            </ul>
            <div className="mt-10">
              <Link
                to="/register"
                className="inline-flex items-center rounded-full bg-[#b54f37] px-8 py-3 text-sm font-semibold text-white hover:bg-[#c75f46]"
              >
                Start as organizer ↗
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-10 w-full max-w-[1400px] rounded-t-[30px] bg-[#ededee] px-8 py-9 text-[#6f7071]">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-4 text-xs md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl text-[#1f0f0d]">EventEase</div>
            <p className="mt-2">© {new Date().getFullYear()} EventEase. Crafted for curators.</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact Us</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
