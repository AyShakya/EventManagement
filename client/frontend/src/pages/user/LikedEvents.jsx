// src/pages/user/LikedEvents.jsx
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/axiosClient";

export default function LikedEvents() {
  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = 8;

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await api.get(
          `/api/user/me/liked?page=${page}&limit=${limit}`
        );
        setEvents(res.data?.likedEvents || []);
        setMeta(res.data?.meta || null);
      } catch (e) {
        console.error(e);
        setErr(
          e?.response?.data?.message || "Failed to load your liked events"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  function goToPage(p) {
    setSearchParams({ page: p });
  }

  return (
    <div className="min-h-[60vh] py-8">
      <div className="app-container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-coffee-dark">
              Liked events
            </h1>
            <p className="text-sm text-gray-600">
              Events you&apos;ve bookmarked with a like.
            </p>
          </div>
          <Link
            to="/events"
            className="hidden sm:inline-flex text-sm px-3 py-1.5 rounded border border-coffee-mid text-coffee-mid hover:bg-coffee-mid hover:text-white transition"
          >
            Browse more events
          </Link>
        </div>

        {err && (
          <div className="text-red-600 mb-3 text-sm bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {err}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-white rounded-lg shadow-sm animate-pulse"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          // Empty state
          <div className="bg-white rounded-lg p-6 shadow card-coffee text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              No liked events yet
            </h2>
            <p className="text-sm text-gray-600">
              Tap the ❤️ icon on any event to save it here.
            </p>
            <Link
              to="/events"
              className="inline-flex mt-4 text-sm px-4 py-2 rounded bg-coffee-mid text-white hover:bg-coffee-dark transition"
            >
              Discover events
            </Link>
          </div>
        ) : (
          <>
            {/* List */}
            <ul className="space-y-3">
              {events.map((ev) => (
                <li
                  key={ev._id}
                  className="bg-white rounded-lg p-4 shadow-sm card-coffee flex flex-col sm:flex-row sm:items-stretch gap-3"
                >
                  {/* Thumbnail */}
                  <Link
                    to={`/events/${ev._id}`}
                    className="w-full sm:w-40 h-28 rounded-md overflow-hidden bg-gray-100 flex-shrink-0"
                  >
                    <img
                      src={ev.imageURL || ev.images?.[0] || "/placeholder.jpg"}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Main content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-coffee-dark text-sm sm:text-base line-clamp-2">
                        <Link
                          to={`/events/${ev._id}`}
                          className="hover:underline"
                        >
                          {ev.title}
                        </Link>
                      </h3>
                      <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-coffee-cream/60 text-gray-700">
                          {ev.location}
                        </span>
                        <span className="text-gray-400">
                          {new Date(ev.postedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {ev.description}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        ❤️ {ev.likes ?? 0} &nbsp;·&nbsp; 👁 {ev.views ?? 0}
                      </span>
                      <Link
                        to={`/events/${ev._id}`}
                        className="px-3 py-1.5 rounded border text-xs font-medium hover:bg-coffee-mid hover:text-white hover:border-coffee-mid transition"
                      >
                        View event
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-5 text-xs sm:text-sm">
                <button
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={!meta.hasPrevPage}
                  className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50 disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-gray-600">
                  Page <strong>{meta.currentPage}</strong> of{" "}
                  <strong>{meta.totalPages}</strong>
                </span>
                <button
                  onClick={() => goToPage(Math.min(meta.totalPages, page + 1))}
                  disabled={!meta.hasNextPage}
                  className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50 disabled:opacity-40"
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
