// src/pages/organizer/OrganizerEventQueries.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { fetchCsrfToken } from "../../api/axiosClient";

export default function OrganizerEventQueries() {
  const { id: eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        // fetch event for header
        const evRes = await api.get(`/api/event/${eventId}`);
        const ev = evRes.data?.event || evRes.data;
        if (!mounted) return;
        setEvent(ev);

        // fetch queries for this event (organizer-only endpoint)
        const qRes = await api.get(`/api/query/event/${eventId}`);
        if (!mounted) return;
        setQueries(qRes.data?.queries || []);
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e.message ||
          "Failed to load queries";
        setErr(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  async function updateStatus(queryId, status) {
    try {
      setUpdatingId(queryId);
      const token = await fetchCsrfToken();
      const res = await api.patch(
        `/api/query/${queryId}/status`,
        { status },
        { headers: { "X-CSRF-Token": token } }
      );
      const updated = res.data?.query;

      if (updated) {
        setQueries((prev) =>
          prev.map((q) =>
            q._id === queryId ? { ...q, status: updated.status } : q
          )
        );
      }
    } catch (e) {
      console.error(e);
      alert(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to update query status"
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="mt-8">
      <div className="bg-white rounded-xl p-5 shadow card-coffee">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-coffee-dark">
              Event queries
              {event ? ` — ${event.title}` : ""}
            </h2>
            {event && (
              <p className="text-xs text-gray-500 mt-1">
                {event.location} •{" "}
                {new Date(event.postedAt).toLocaleDateString()}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              View and update attendee questions and feedback for this event.
            </p>
          </div>
          <Link
            to="/organizer/events"
            className="text-sm px-3 py-1.5 rounded border border-coffee-mid text-coffee-mid hover:bg-coffee-mid hover:text-white transition"
          >
            Back to events
          </Link>
        </div>

        {/* Error banner */}
        {err && (
          <div className="text-red-600 mb-3 text-sm bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {err}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 rounded animate-pulse"
              />
            ))}
          </div>
        ) : queries.length === 0 ? (
          <div className="text-gray-600 text-sm bg-gray-50 border border-dashed border-gray-200 rounded-md px-4 py-5">
            There are no queries or feedback for this event yet.
          </div>
        ) : (
          <div className="space-y-3">
            {queries.map((q) => {
              const isResolved = q.status === "resolved";
              return (
                <div
                  key={q._id}
                  className="border border-gray-100 rounded-lg p-3.5 hover:shadow-sm transition flex flex-col gap-1"
                >
                  {/* First row: subject + timestamp + status pill */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-gray-900">
                      {q.subject || "Query"}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400">
                        {new Date(
                          q.sentAt || q.createdAt
                        ).toLocaleString()}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          isResolved
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {isResolved ? "Resolved" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* From info */}
                  <div className="text-xs text-gray-500">
                    From:{" "}
                    <span className="font-medium">
                      {q.senderName || "Anonymous"}
                    </span>{" "}
                    {q.senderEmail && (
                      <span className="text-gray-400">
                        ({q.senderEmail})
                      </span>
                    )}
                  </div>

                  {/* Message */}
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                    {q.message}
                  </p>

                  {/* Actions */}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">
                      Status:{" "}
                      <span className="font-semibold">
                        {isResolved ? "Resolved" : "Pending"}
                      </span>
                    </span>

                    <div className="flex gap-2">
                      {isResolved ? (
                        <button
                          disabled={updatingId === q._id}
                          onClick={() => updateStatus(q._id, "pending")}
                          className="px-3 py-1 rounded text-xs border text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                        >
                          {updatingId === q._id
                            ? "Updating..."
                            : "Mark as pending"}
                        </button>
                      ) : (
                        <button
                          disabled={updatingId === q._id}
                          onClick={() => updateStatus(q._id, "resolved")}
                          className="px-3 py-1 rounded text-xs bg-coffee-mid text-white hover:bg-coffee-dark disabled:opacity-60"
                        >
                          {updatingId === q._id
                            ? "Updating..."
                            : "Mark as resolved"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
