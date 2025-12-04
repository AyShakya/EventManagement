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
    <div className="min-h-[60vh] py-10">
      <div className="app-container mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Liked events</h1>

        {err && <div className="text-red-600 mb-3">{err}</div>}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white rounded shadow animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded p-4 shadow">
            <p className="text-gray-600">
              You haven&apos;t liked any events yet.
            </p>
            <Link
              to="/events"
              className="inline-block mt-3 text-sm text-coffee-mid underline"
            >
              Browse events
            </Link>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {events.map((ev) => (
                <li
                  key={ev._id}
                  className="bg-white rounded p-4 shadow flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"
                >
                  <div>
                    <h3 className="font-semibold">
                      <Link to={`/events/${ev._id}`} className="hover:underline">
                        {ev.title}
                      </Link>
                    </h3>
                    <div className="text-xs text-gray-500">
                      {ev.location} •{" "}
                      {new Date(ev.postedAt).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {ev.description?.slice(0, 160)}
                      {ev.description?.length > 160 ? "…" : ""}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 flex flex-col items-end gap-1">
                    <span>
                      ❤️ {ev.likes || 0} likes • 👁 {ev.views || 0} views
                    </span>
                    <Link
                      to={`/events/${ev._id}`}
                      className="px-3 py-1 rounded border text-xs"
                    >
                      View event
                    </Link>
                  </div>
                </li>
              ))}
            </ul>

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-4 text-sm">
                <button
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={!meta.hasPrevPage}
                  className="px-3 py-1 rounded border disabled:opacity-40"
                >
                  Prev
                </button>
                <span>
                  Page {meta.currentPage} / {meta.totalPages}
                </span>
                <button
                  onClick={() => goToPage(Math.min(meta.totalPages, page + 1))}
                  disabled={!meta.hasNextPage}
                  className="px-3 py-1 rounded border disabled:opacity-40"
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
