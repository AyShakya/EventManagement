import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { csrfDelete } from "../../api/axiosClient";

export default function OrganizerEvents() {
  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = 8;

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await api.get(`/api/organizer/me/events?page=${page}&limit=${limit}`);
        setEvents(res.data?.events || []);
        setMeta(res.data?.meta || null);
      } catch (error) {
        console.error(error);
        setErr(error?.response?.data?.message || "Failed to fetch your events");
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  function goToPage(p) {
    setSearchParams({ page: p });
  }

  async function handleDelete(id) {
    if (!id) return;
    const confirmDelete = window.confirm("Delete this event permanently?");
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await csrfDelete(`/api/event/${id}`);
      // remove from local state
      setEvents(prev => prev.filter(ev => ev._id !== id));
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to delete event"
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mt-8">
      <div className="bg-white rounded-lg p-4 shadow card-coffee">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Your events</h2>
          <Link
            to="/organizer/events/create"
            className="bg-coffee-mid text-white px-3 py-1 rounded text-sm"
          >
            + Create new
          </Link>
        </div>

        {err && <div className="text-red-600 mb-3">{err}</div>}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-gray-500">You have not created any events yet.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500 uppercase">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Location</th>
                    <th className="py-2 pr-4">Posted</th>
                    <th className="py-2 pr-4">Likes</th>
                    <th className="py-2 pr-4">Views</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev._id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">
                        <Link
                          to={`/events/${ev._id}`}
                          className="text-coffee-dark hover:underline"
                        >
                          {ev.title}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">{ev.location}</td>
                      <td className="py-2 pr-4 text-xs text-gray-500">
                        {ev.postedAt
                          ? new Date(ev.postedAt).toLocaleString()
                          : "-"}
                      </td>
                      <td className="py-2 pr-4">{ev.likes ?? 0}</td>
                      <td className="py-2 pr-4">{ev.views ?? 0}</td>
                      <td className="py-2 pr-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            to={`/organizer/events/${ev._id}/edit`}
                            className="px-2 py-1 border rounded text-xs"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/organizer/events/${ev._id}/queries`}
                            className="px-2 py-1 rounded text-xs bg-coffee-mid text-white"
                          >
                            Queries
                          </Link>
                          <button
                            onClick={() => handleDelete(ev._id)}
                            disabled={deletingId === ev._id}
                            className="px-2 py-1 rounded text-xs border border-red-500 text-red-600 disabled:opacity-60"
                          >
                            {deletingId === ev._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && (
              <div className="mt-3 flex items-center justify-end gap-3 text-xs">
                <button
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={!meta.hasPrevPage}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <span>
                  Page {meta.currentPage} / {meta.totalPages}
                </span>
                <button
                  onClick={() => goToPage(Math.min(meta.totalPages, page + 1))}
                  disabled={!meta.hasNextPage}
                  className="px-2 py-1 border rounded disabled:opacity-50"
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
