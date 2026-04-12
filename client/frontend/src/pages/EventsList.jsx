import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axiosClient";
import { getEventStage } from "../utils/eventStage";

function EventCard({ ev, compact = false }) {
  const cover = (Array.isArray(ev.images) && ev.images[0]) || ev.imageURL || "";
  const stageInfo = getEventStage(ev.startAt);
  const hasCover = Boolean(cover);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[30px] bg-[#ffffff] shadow-[0_18px_26px_rgba(27,29,14,0.08)]">
      <Link
        to={`/events/${ev._id}`}
        className={`relative block overflow-hidden bg-[#eaead1] ${compact ? "h-48" : "h-[390px]"}`}
      >
        {hasCover ? (
          <img
            src={cover}
            alt={ev.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[#6a675d]">
            No image
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-full bg-[#fd876f] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.06em] text-[#732010]">
          {stageInfo.label}
        </span>
      </Link>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h3 className={`text-[#1f0f0d] ${compact ? "text-[2.1rem] leading-[1.03]" : "text-[3.4rem] leading-[0.95]"}`}>
          <Link to={`/events/${ev._id}`} className="hover:text-[#9f402d]">
            {ev.title}
          </Link>
        </h3>

        <p className="mt-3 line-clamp-2 text-sm text-[#5f5a51]">{ev.description}</p>

        <div className="mt-5 flex items-center justify-between text-xs text-[#6c665d]">
          <span>
            {ev.startAt
              ? new Date(ev.startAt).toLocaleDateString()
              : new Date(ev.postedAt).toLocaleDateString()}
          </span>
          <span className="truncate pl-4 text-right">{ev.location}</span>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-[#8b7d73]">❤️ {ev.likes || 0} · 👁️ {ev.views || 0}</span>
          <Link to={`/events/${ev._id}`} className="font-semibold text-[#9f402d] underline underline-offset-4">
            View details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const q = searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(q);
  const [sortBy, setSortBy] = useState("latest");
  const [stageFilter, setStageFilter] = useState("all");

  const limit = 8;

  useEffect(() => {
    setSearchTerm(q);
  }, [q]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const queryString = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          ...(q ? { q } : {}),
        }).toString();

        const res = await api.get(`/api/event?${queryString}`);
        setEvents(res.data?.events || []);
        setMeta(res.data?.meta || null);
      } catch (error) {
        console.error(error);
        setErr(error?.response?.data?.message || "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    })();
  }, [page, q]);

  function goToPage(p) {
    const next = { page: String(p) };
    if (q) next.q = q;
    setSearchParams(next);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    const next = { page: "1" };
    if (trimmed) next.q = trimmed;
    setSearchParams(next);
  }

  const processedEvents = useMemo(() => {
    let list = [...events];

    if (stageFilter !== "all") {
      list = list.filter((ev) => {
        const s = getEventStage(ev.startAt);
        return s.stage === stageFilter;
      });
    }

    if (sortBy === "latest") {
      list.sort(
        (a, b) =>
          new Date(b.postedAt || b.startAt || 0) -
          new Date(a.postedAt || a.startAt || 0)
      );
    } else if (sortBy === "popular") {
      list.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (sortBy === "upcoming") {
      const priority = { upcoming: 0, completed: 1, unscheduled: 2 };

      list.sort((a, b) => {
        const sa = getEventStage(a.startAt).stage;
        const sb = getEventStage(b.startAt).stage;

        const pa = priority[sa] ?? 3;
        const pb = priority[sb] ?? 3;

        if (pa !== pb) return pa - pb;

        const da = new Date(a.startAt || a.postedAt || 0).getTime();
        const db = new Date(b.startAt || b.postedAt || 0).getTime();

        if (sa === "completed") {
          return db - da;
        }
        return da - db;
      });
    }

    return list;
  }, [events, sortBy, stageFilter]);

  const pageEvents = processedEvents.slice(0, limit);
  const [featuredEvent, ...remainingEvents] = pageEvents;
  const sideEvents = remainingEvents.slice(0, 2);
  const lowerEvents = remainingEvents.slice(2);

  return (
    <div className="min-h-screen bg-[#fbfbe2] text-[#1b1d0e] page-content">
      <div className="app-container py-10">
        <header className="mb-9">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <h1 className="text-[4.6rem] leading-[0.9] text-[#1f0f0d] md:text-[6rem]">
                Discover the pulse of
                <br />
                your community
              </h1>
              <p className="mt-6 max-w-3xl text-[1.9rem] leading-snug text-[#4f4c43]">
                Thoughtfully curated gatherings, from intimate morning workshops
                to vibrant evening melodies. Find your next meaningful moment.
              </p>
              {q && (
                <p className="mt-3 text-sm text-[#6f6a5f]">
                  Showing results for <span className="font-semibold">&quot;{q}&quot;</span>.
                </p>
              )}
              {meta?.totalDocs !== undefined && (
                <p className="mt-1 text-sm text-[#6f6a5f]">
                  Total events found: <span className="font-semibold">{meta.totalDocs}</span>
                </p>
              )}
            </div>

            <form onSubmit={handleSearchSubmit} className="w-full max-w-md">
              <div className="flex items-center gap-2 rounded-full bg-[#f3f2dd] px-4 py-2.5 shadow-[inset_0_0_0_1px_rgba(211,195,192,0.2)]">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search experiences..."
                  className="h-9 flex-1 bg-transparent text-sm text-[#2e2b22] placeholder:text-[#8e887d] focus:outline-none"
                />
                <button type="submit" className="rounded-full bg-[#271310] px-4 py-2 text-xs font-semibold text-white">
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-full bg-[#f3f2dd] px-2 py-2">
            <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.08em]">
              {[
                { id: "all", label: "All events" },
                { id: "upcoming", label: "Workshops" },
                { id: "completed", label: "Hackathons" },
                { id: "unscheduled", label: "Music" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStageFilter(opt.id)}
                  className={`rounded-full px-5 py-2.5 transition ${
                    stageFilter === opt.id
                      ? "bg-[#a9442f] text-white"
                      : "text-[#6a665c] hover:bg-[#ebe8d0]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pr-3 text-xs uppercase tracking-[0.08em] text-[#6d685d]">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full bg-transparent px-2 py-1 text-sm text-[#1f0f0d] focus:outline-none"
              >
                <option value="latest">Latest</option>
                <option value="popular">Most liked</option>
                <option value="upcoming">Upcoming first</option>
              </select>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="py-10">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-72 rounded-[30px] skeleton-block" />
              ))}
            </div>
          </div>
        ) : err ? (
          <div className="rounded-[24px] bg-[#f5c1b7] py-14 text-center text-[#63251b]">{err}</div>
        ) : pageEvents.length === 0 ? (
          <div className="rounded-[24px] bg-[#f5f5dc] py-14 text-center">
            <p className="text-sm text-[#59564c]">No events match your filters.</p>
            <button
              type="button"
              onClick={() => {
                setStageFilter("all");
                setSortBy("latest");
                setSearchParams({ page: "1" });
                setSearchTerm("");
              }}
              className="mt-4 inline-flex items-center rounded-full bg-[#ffffff] px-4 py-2 text-xs text-[#352f24]"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[2.1fr_1fr]">
              <EventCard ev={featuredEvent} />

              <div className="flex flex-col gap-6">
                {sideEvents.map((ev) => (
                  <EventCard key={ev._id} ev={ev} compact />
                ))}
              </div>
            </section>

            <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {lowerEvents.map((ev) => (
                <EventCard key={ev._id} ev={ev} compact />
              ))}

              <div className="flex min-h-[290px] flex-col justify-between rounded-[36px] bg-[#a9442f] p-8 text-[#fff6e8] shadow-[0_16px_30px_rgba(27,29,14,0.08)]">
                <div>
                  <h3 className="text-[2.4rem] leading-[1.04]">Host your own?</h3>
                  <p className="mt-4 text-sm leading-relaxed text-[#f5d4c8]">
                    Bring your community together. Share your passion and grow your audience.
                  </p>
                </div>
                <Link
                  to="/register"
                  className="inline-flex w-fit items-center rounded-full bg-[#f5f5dc] px-6 py-3 text-sm font-semibold text-[#2d140f]"
                >
                  Create Event
                </Link>
              </div>
            </section>

            {meta && (
              <div className="mt-10 flex items-center justify-center gap-4 text-xs">
                <button
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={!meta.hasPrevPage}
                  className="rounded-full bg-[#ffffff] px-5 py-2 hover:bg-[#f2f0e0] disabled:opacity-50 disabled:hover:bg-[#ffffff]"
                >
                  Prev
                </button>

                <span className="text-[#5f5c54]">
                  Page <strong>{meta.currentPage}</strong> of <strong>{meta.totalPages}</strong>
                </span>

                <button
                  onClick={() => goToPage(Math.min(meta.totalPages, page + 1))}
                  disabled={!meta.hasNextPage}
                  className="rounded-full bg-[#ffffff] px-5 py-2 hover:bg-[#f2f0e0] disabled:opacity-50 disabled:hover:bg-[#ffffff]"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
