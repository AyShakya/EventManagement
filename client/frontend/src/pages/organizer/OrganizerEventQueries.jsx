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
        if (!mounted) {
          return;
        }
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
          prev.map((q) => (q._id === queryId ? { ...q, status: updated.status } : q))
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
    <div className="mt-10">
      <div className="bg-white rounded-lg p-4 shadow card-coffee">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-semibold">
              Event queries{event ? ` — ${event.title}` : ""}
            </h2>
            {event && (
              <p className="text-xs text-gray-500">
                {event.location} •{" "}
                {new Date(event.postedAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <Link
            to="/organizer/events"
            className="text-sm text-coffee-mid underline"
          >
            Back to events
          </Link>
        </div>

        {err && <div className="text-red-600 mb-3">{err}</div>}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 bg-gray-100 rounded animate-pulse"
              />
            ))}
          </div>
        ) : queries.length === 0 ? (
          <div className="text-gray-600">
            No queries or feedback for this event yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {queries.map((q) => (
              <li
                key={q._id}
                className="border rounded p-3 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">
                    {q.subject || "Query"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(q.sentAt || q.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  From:{" "}
                  <span className="font-medium">
                    {q.senderName || "Anonymous"}
                  </span>{" "}
                  {q.senderEmail && <span>({q.senderEmail})</span>}
                </div>

                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                  {q.message}
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Status:{" "}
                    <span className="font-semibold">
                      {q.status === "resolved" ? "Resolved" : "Pending"}
                    </span>
                  </span>

                  <div className="flex gap-2">
                    {q.status !== "resolved" ? (
                      <button
                        disabled={updatingId === q._id}
                        onClick={() => updateStatus(q._id, "resolved")}
                        className="px-3 py-1 rounded text-xs bg-coffee-mid text-white disabled:opacity-60"
                      >
                        {updatingId === q._id
                          ? "Updating..."
                          : "Mark as resolved"}
                      </button>
                    ) : (
                      <button
                        disabled={updatingId === q._id}
                        onClick={() => updateStatus(q._id, "pending")}
                        className="px-3 py-1 rounded text-xs border disabled:opacity-60"
                      >
                        {updatingId === q._id
                          ? "Updating..."
                          : "Mark as pending"}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
