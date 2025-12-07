import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axiosClient";

export default function EventsList() {
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
        const res = await api.get(`/api/event?page=${page}&limit=${limit}`);
        setEvents(res.data?.events || []);
        setMeta(res.data?.meta || null);
      } catch (error) {
        console.error(error);
        setErr(error?.response?.data?.message || "Failed to fetch events");
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  function goToPage(p) {
    setSearchParams({ page: p });
  }

  if (loading)
    return (
      <div className="app-container py-14 text-center text-gray-600">
        Loading events…
      </div>
    );

  if (err)
    return (
      <div className="app-container py-14 text-center text-red-600">
        {err}
      </div>
    );

  return (
    <div className="app-container py-10">
      <h1 className="text-3xl font-semibold mb-6 text-coffee-dark">
        All Events
      </h1>

      {events.length === 0 ? (
        <div className="text-gray-500">No events found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(ev => (
            <div
              key={ev._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-coffee-cream"
            >
              {/* Image */}
              <div className="h-40 bg-gray-100 overflow-hidden">
                <img
                  src={ev.imageURL || "/placeholder.jpg"}
                  alt={ev.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-coffee-dark line-clamp-2">
                  <Link to={`/events/${ev._id}`}>
                    {ev.title}
                  </Link>
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  {ev.location}
                </p>

                <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                  {ev.description}
                </p>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {new Date(ev.postedAt).toLocaleDateString()}
                  </span>

                  <span>
                    ❤️ {ev.likes || 0} · 👁️ {ev.views || 0}
                  </span>
                </div>

                <div className="mt-4">
                  <Link
                    to={`/events/${ev._id}`}
                    className="block text-center bg-coffee-mid text-white py-2 rounded-lg text-sm hover:bg-coffee-dark transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={() => goToPage(Math.max(1, page - 1))}
            disabled={!meta.hasPrevPage}
            className="px-4 py-2 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm text-gray-600">
            Page <strong>{meta.currentPage}</strong> of{" "}
            <strong>{meta.totalPages}</strong>
          </span>

          <button
            onClick={() =>
              goToPage(Math.min(meta.totalPages, page + 1))
            }
            disabled={!meta.hasNextPage}
            className="px-4 py-2 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
