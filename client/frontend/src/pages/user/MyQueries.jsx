// src/pages/user/MyQueries.jsx
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
    <div className="min-h-[60vh] py-10">
      <div className="app-container mx-auto">
        <h1 className="text-2xl font-semibold mb-4">My queries & feedback</h1>

        {err && <div className="text-red-600 mb-3">{err}</div>}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white rounded shadow animate-pulse" />
            ))}
          </div>
        ) : queries.length === 0 ? (
          <div className="bg-white rounded p-4 shadow">
            <p className="text-gray-600">
              You haven&apos;t sent any queries or feedback yet.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Use the &quot;Send feedback&quot; or &quot;Ask a question&quot; section
              on an event to create one.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded p-4 shadow">
            <ul className="space-y-3">
              {queries.map((q) => (
                <li key={q._id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">
                      {q.subject || "Query"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(q.sentAt || q.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Status:{" "}
                    <span className="font-medium">
                      {q.status === "resolved" ? "Resolved" : "Pending"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                    {q.message}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
