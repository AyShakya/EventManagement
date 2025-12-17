import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axiosClient";
import { getEventStage } from "../utils/eventStage";

function EventCard({ ev }) {
  const cover = (Array.isArray(ev.images) && ev.images[0]) || ev.imageURL || "";
  const stageInfo = getEventStage(ev.startAt);
  const hasCover = Boolean(cover);

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden border border-coffee-cream/60 flex flex-col">
      {/* Image / placeholder */}
      <Link
        to={`/events/${ev._id}`}
        className="relative block h-40 bg-gray-100 overflow-hidden"
      >
        {hasCover ? (
          <>
            <img
              src={cover}
              alt={ev.title}
              className="w-full h-full object-cover transition-transform duration-200 hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-xs text-gray-600 bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="font-medium">No image</span>
          </div>
        )}

        {/* Stage chip */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-[11px]">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium shadow-sm
              ${
                stageInfo.stage === "completed"
                  ? "bg-green-100/95 text-green-800"
                  : stageInfo.stage === "upcoming"
                  ? "bg-blue-100/95 text-blue-800"
                  : "bg-gray-100/95 text-gray-800"
              }`}
          >
            {stageInfo.label}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="text-base font-semibold text-coffee-dark line-clamp-2">
          <Link
            to={`/events/${ev._id}`}
            className="hover:text-coffee-mid transition-colors"
          >
            {ev.title}
          </Link>
        </h3>

        <div className="flex items-center justify-between text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1 max-w-[160px]">
            <span>📍</span>
            <span className="truncate">{ev.location}</span>
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

        <div className="mt-auto pt-2 flex items-center justify-between text-[11px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span>❤️ {ev.likes || 0}</span>
            <span className="mx-1">·</span>
            <span>👁️ {ev.views || 0}</span>
          </span>
          <Link
            to={`/events/${ev._id}`}
            className="text-coffee-mid font-medium text-[11px] hover:underline"
          >
            View details →
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-cream via-[#f5ece0] to-coffee-mid">
      <div className="app-container py-10">
        {/* Header / hero strip */}
        <header className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-coffee-dark">
                Browse events
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Filter by stage, sort by popularity, and find what interests
                you.
              </p>
              {q && (
                <p className="mt-1 text-xs text-gray-500">
                  Showing results for{" "}
                  <span className="font-medium">&quot;{q}&quot;</span>.
                </p>
              )}
              {meta?.totalDocs !== undefined && (
                <p className="mt-1 text-xs text-gray-500">
                  Total events found:{" "}
                  <span className="font-semibold">{meta.totalDocs}</span>
                </p>
              )}
            </div>

            {/* Search form */}
            <form
              onSubmit={handleSearchSubmit}
              className="w-full sm:w-auto sm:min-w-[260px]"
            >
              <div className="flex gap-2">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or location..."
                  className="flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1 focus:ring-coffee-mid focus:border-coffee-mid bg-white"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-coffee-mid text-white text-sm font-medium hover:bg-coffee-dark transition"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Filters row */}
          <div className="mt-4 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-gray-500 mr-1">Stage:</span>
              {[
                { id: "all", label: "All" },
                { id: "upcoming", label: "Upcoming" },
                { id: "completed", label: "Completed" },
                { id: "unscheduled", label: "Unscheduled" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStageFilter(opt.id)}
                  className={`px-2.5 py-1 rounded-full border text-[11px] transition-all ${
                    stageFilter === opt.id
                      ? "bg-coffee-mid text-white border-coffee-mid shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1 rounded-lg border text-xs bg-white focus:outline-none focus:ring-1 focus:ring-coffee-mid"
              >
                <option value="latest">Latest</option>
                <option value="popular">Most liked</option>
                <option value="upcoming">Upcoming first</option>
              </select>
            </div>
          </div>
        </header>

        {/* Content */}
        {loading ? (
          <div className="py-14 text-center text-gray-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-52 bg-white rounded-2xl shadow-sm animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : err ? (
          <div className="py-14 text-center text-red-600 bg-white/80 rounded-2xl">
            {err}
          </div>
        ) : pageEvents.length === 0 ? (
          <div className="py-14 text-center bg-white rounded-2xl shadow-sm">
            <p className="text-gray-600 text-sm">
              No events match your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setStageFilter("all");
                setSortBy("latest");
                setSearchParams({ page: "1" });
                setSearchTerm("");
              }}
              className="mt-3 inline-flex items-center px-3 py-1.5 rounded-full border text-xs hover:bg-gray-50"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageEvents.map((ev) => (
                <EventCard key={ev._id} ev={ev} />
              ))}
            </div>

            {/* Pagination */}
            {meta && (
              <div className="flex items-center justify-center gap-4 mt-10 text-xs">
                <button
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={!meta.hasPrevPage}
                  className="px-4 py-2 rounded-full border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
                >
                  Prev
                </button>

                <span className="text-coffee-cream ">
                  Page <strong>{meta.currentPage}</strong> of{" "}
                  <strong>{meta.totalPages}</strong>
                </span>

                <button
                  onClick={() => goToPage(Math.min(meta.totalPages, page + 1))}
                  disabled={!meta.hasNextPage}
                  className="px-4 py-2 rounded-full border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
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
