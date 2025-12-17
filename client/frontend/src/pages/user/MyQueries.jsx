import React, { useEffect, useState } from "react";
import api from "../../api/axiosClient";

export default function MyQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await api.get("/api/user/me/queries?limit=50");
        setQueries(res.data?.queries || []);
      } catch (e) {
        console.error(e);
        setErr(
          e?.response?.data?.message || "Failed to load your queries/feedback"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-[70vh] py-10 bg-gradient-to-b from-coffee-cream/70 to-coffee-mid/20">
      <div className="app-container mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-coffee-dark">
              My queries & feedback
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Track questions you&apos;ve asked and feedback you&apos;ve shared
              with organizers.
            </p>
          </div>
        </div>

        {err && (
          <div className="text-red-700 mb-4 text-sm bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {err}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-white rounded-lg shadow-sm animate-pulse card-coffee"
              />
            ))}
          </div>
        ) : queries.length === 0 ? (
          <div className="bg-white rounded-xl p-6 sm:p-7 shadow card-coffee">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Nothing here yet
            </h2>
            <p className="text-sm text-gray-600">
              You haven&apos;t sent any queries or feedback yet.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Use the <strong>&quot;Send feedback&quot;</strong> or{" "}
              <strong>&quot;Ask a question&quot;</strong> section on an event
              to create one.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-4 sm:p-5 shadow card-coffee">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Last {queries.length} submissions
              </h2>
            </div>

            <ul className="space-y-3">
              {queries.map((q) => {
                const isResolved = q.status === "resolved";
                return (
                  <li
                    key={q._id}
                    className="border border-gray-100 rounded-lg p-3.5 hover:shadow-sm transition flex flex-col gap-1.5"
                  >
                    {/* Top row: subject + date + status pill */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-medium text-gray-900">
                        {q.subject || "Query"}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400">
                          {new Date(
                            q.sentAt || q.createdAt
                          ).toLocaleString()}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold
                            ${
                              isResolved
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                        >
                          {isResolved ? "Resolved" : "Pending"}
                        </span>
                      </div>
                    </div>

                    {/* Message */}
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                      {q.message}
                    </p>

                    {/* Future: event info, if you add it later
                    {q.event && (
                      <div className="mt-1 text-xs text-gray-500">
                        About event: {q.event.title}
                      </div>
                    )} */}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
