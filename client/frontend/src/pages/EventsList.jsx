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
        // backend returns { events: [...], meta: { ... } }
        if (res.data) {
          setEvents(res.data.events || []);
          setMeta(res.data.meta || null);
        }
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

  if (loading) return <div style={{ padding: 20 }}>Loading events...</div>;
  if (err) return <div style={{ padding: 20, color: "red" }}>{err}</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Events</h1>
      {events.length === 0 && <div>No events found.</div>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {events.map((ev) => (
          <li key={ev._id} style={{ marginBottom: 12, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
            <h3>
              <Link to={`/events/${ev._id}`}>{ev.title}</Link>
            </h3>
            <div>
              <small>{ev.location} • posted {new Date(ev.postedAt).toLocaleString()}</small>
            </div>
            <p style={{ marginTop: 6 }}>{ev.description?.slice(0, 160)}{ev.description?.length > 160 ? "…" : ""}</p>
            <div>
              <strong>{ev.likes || 0}</strong> likes • <strong>{ev.views || 0}</strong> views
            </div>
          </li>
        ))}
      </ul>

      {meta && (
        <div style={{ marginTop: 12 }}>
          <button onClick={() => goToPage(Math.max(1, page - 1))} disabled={!meta.hasPrevPage}>
            Prev
          </button>
          <span style={{ margin: "0 8px" }}>
            Page {meta.currentPage} / {meta.totalPages}
          </span>
          <button onClick={() => goToPage(Math.min(meta.totalPages, page + 1))} disabled={!meta.hasNextPage}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
