import React, { use, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axiosClient";

export default function OrganizerEvents() {
  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [page, setPage] = useState(1);
  const limit = 8;

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        // for now, just reuse /api/event and filter client-side if needed
        const res = await api.get(`/api/organizer/me/events?page=${page}&limit=${limit}`);
        setEvents(res.data?.events || []);
        setMeta(res.data?.meta || null);
      } catch (e) {
        console.error(e);
        setErr(e?.response?.data?.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  return (
    <div className="mt-6 bg-white rounded-lg p-4 shadow card-coffee">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Your events</h2>
        <Link
          to="/organizer/events/create"
          className="text-sm bg-coffee-mid text-white px-3 py-1 rounded"
        >
          + Create event
        </Link>
      </div>

      {err && <div className="text-red-600 mb-2">{err}</div>}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-gray-500">
          No events yet. Create your first one.
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {events.map((ev) => (
              <li
                key={ev._id}
                className="p-3 border rounded flex items-start justify-between hover:shadow-sm"
              >
                <div>
                  <div className="font-medium">{ev.title}</div>
                  <div className="text-xs text-gray-500">
                    {ev.location} •{" "}
                    {new Date(ev.postedAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {ev.description?.slice(0, 120)}
                    {ev.description?.length > 120 ? "…" : ""}
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Link
                    to={`/organizer/events/${ev._id}/edit`}
                    className="text-xs px-3 py-1 rounded border"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/events/${ev._id}`}
                    className="text-xs px-3 py-1 rounded bg-coffee-dark text-white"
                  >
                    View
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4 text-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!meta.hasPrevPage}
                className="px-3 py-1 rounded border disabled:opacity-40"
              >
                Prev
              </button>
              <span>
                Page {meta.currentPage} / {meta.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(meta.totalPages, p + 1))
                }
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
  );
}
