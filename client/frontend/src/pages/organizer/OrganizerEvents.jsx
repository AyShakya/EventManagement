// src/pages/organizer/OrganizerEvents.jsx
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api, { csrfDelete } from "../../api/axiosClient";
import { getEventStage } from "../../utils/eventStage";

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
        const res = await api.get(
          `/api/organizer/me/events?page=${page}&limit=${limit}`
        );
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
      setEvents((prev) => prev.filter((ev) => ev._id !== id));
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

  function renderStageBadge(startAt) {
    const { stage, label } = getEventStage(startAt); // <— IMPORTANT

    const map = {
      upcoming: {
        className: "bg-blue-50 text-blue-700 border-blue-200",
      },
      completed: {
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      },
      unscheduled: {
        className: "bg-gray-50 text-gray-600 border-gray-200",
      },
    };

    const cfg = map[stage] || map.unscheduled;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${cfg.className}`}
      >
        {label}
      </span>
    );
  }

  return (
    <div className="mt-8">
      <div className="bg-white rounded-xl p-5 shadow card-coffee">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-coffee-dark">
              Your events
            </h2>
            <p className="text-xs text-gray-500">
              Manage dates, see stats, and review queries for each event.
            </p>
          </div>
          <Link
            to="/organizer/events/create"
            className="inline-flex items-center justify-center bg-coffee-mid text-white px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-coffee-dark"
          >
            + Create new
          </Link>
        </div>

        {err && (
          <div className="text-red-600 mb-3 text-sm border border-red-200 bg-red-50 rounded px-3 py-2">
            {err}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-gray-500 text-sm">
            You have not created any events yet.{" "}
            <Link
              to="/organizer/events/create"
              className="text-coffee-mid underline"
            >
              Create your first event.
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto mt-1">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500 uppercase">
                    <th className="py-2 pr-4 font-semibold">Title</th>
                    <th className="py-2 pr-4 font-semibold">Location</th>
                    <th className="py-2 pr-4 font-semibold">Stage</th>
                    <th className="py-2 pr-4 font-semibold">Event date</th>
                    <th className="py-2 pr-4 font-semibold">
                      Reported attendees
                    </th>
                    <th className="py-2 pr-4 font-semibold">Likes</th>
                    <th className="py-2 pr-4 font-semibold">Views</th>
                    <th className="py-2 pr-3 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {events.map((ev) => {
                    const { stage } = getEventStage(ev.startAt);
                    const reportedAttendees =
                      ev.stats?.totalAttendees ?? "—";
                    const statsDisabled = stage !== "completed"; // only completed can edit stats

                    return (
                      <tr key={ev._id} className="border-b last:border-0">
                        <td className="py-2 pr-4 align-top">
                          <div className="flex flex-col">
                            <Link
                              to={`/events/${ev._id}`}
                              className="text-coffee-dark font-medium hover:underline line-clamp-2"
                            >
                              {ev.title}
                            </Link>
                            <span className="text-[11px] text-gray-400 mt-0.5">
                              Posted{" "}
                              {ev.postedAt
                                ? new Date(
                                    ev.postedAt
                                  ).toLocaleDateString()
                                : "-"}
                            </span>
                          </div>
                        </td>

                        <td className="py-2 pr-4 align-top text-gray-700">
                          {ev.location}
                        </td>

                        <td className="py-2 pr-4 align-top">
                          {renderStageBadge(ev.startAt)}
                        </td>

                        <td className="py-2 pr-4 align-top text-xs text-gray-600">
                          {ev.startAt
                            ? new Date(ev.startAt).toLocaleString()
                            : "Not set"}
                        </td>

                        <td className="py-2 pr-4 align-top text-center text-sm text-gray-700">
                          {reportedAttendees}
                        </td>

                        <td className="py-2 pr-4 align-top text-sm">
                          {ev.likes ?? 0}
                        </td>

                        <td className="py-2 pr-4 align-top text-sm">
                          {ev.views ?? 0}
                        </td>

                        <td className="py-2 pr-3 align-top">
                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/organizer/events/${ev._id}/edit`}
                              className="px-2.5 py-1 rounded border text-xs hover:bg-gray-50"
                            >
                              Edit
                            </Link>
                            <Link
                              to={`/organizer/events/${ev._id}/queries`}
                              className="px-2.5 py-1 rounded text-xs bg-coffee-mid text-white hover:bg-coffee-dark"
                            >
                              Queries
                            </Link>

                            <Link
                              to={
                                statsDisabled
                                  ? "#"
                                  : `/organizer/events/${ev._id}/stats`
                              }
                              onClick={(e) => {
                                if (statsDisabled) e.preventDefault();
                              }}
                              className={`px-2.5 py-1 rounded text-xs border ${
                                statsDisabled
                                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                                  : "border-coffee-mid text-coffee-mid hover:bg-coffee-cream/40"
                              }`}
                            >
                              Stats
                            </Link>

                            <button
                              onClick={() => handleDelete(ev._id)}
                              disabled={deletingId === ev._id}
                              className="px-2.5 py-1 rounded text-xs border border-red-500 text-red-600 hover:bg-red-50 disabled:opacity-60"
                            >
                              {deletingId === ev._id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {meta && (
              <div className="mt-4 flex items-center justify-end gap-3 text-xs">
                <button
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={!meta.hasPrevPage}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 bg-white hover:bg-gray-50"
                >
                  Prev
                </button>
                <span className="text-gray-600">
                  Page{" "}
                  <span className="font-semibold">{meta.currentPage}</span> of{" "}
                  <span className="font-semibold">{meta.totalPages}</span>
                </span>
                <button
                  onClick={() => goToPage(Math.min(meta.totalPages, page + 1))}
                  disabled={!meta.hasNextPage}
                  className="px-3 py-1 border rounded-lg disabled:opacity-50 bg-white hover:bg-gray-50"
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
