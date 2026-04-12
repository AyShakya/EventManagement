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
    const { stage, label } = getEventStage(startAt); 

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
      <div className="bg-[#f7f7f9] rounded-[2rem] p-5 md:p-6 shadow-[0_20px_34px_rgba(39,29,19,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-4xl font-semibold text-[#20100d]">
              Event Management
            </h2>
            <p className="text-sm text-[#60544e]">
              Manage dates, see stats, and review queries for each event.
            </p>
          </div>
          <Link
            to="/organizer/events/create"
            className="inline-flex items-center justify-center bg-[#271310] text-white px-6 py-3 rounded-full text-sm shadow-sm hover:bg-[#3b241b]"
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
            <div className="space-y-4 mt-1">
              {events.map((ev) => {
                const { stage } = getEventStage(ev.startAt);
                const reportedAttendees = ev.stats?.totalAttendees ?? "—";
                const statsDisabled = stage !== "completed";
                return (
                  <div
                    key={ev._id}
                    className="bg-[#f1f1df] rounded-[1.6rem] p-4 md:p-5 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {renderStageBadge(ev.startAt)}
                        <span className="text-xs text-[#7b6d66]">
                          Posted {ev.postedAt ? new Date(ev.postedAt).toLocaleDateString() : "-"}
                        </span>
                      </div>
                      <Link
                        to={`/events/${ev._id}`}
                        className="text-2xl md:text-3xl font-semibold text-[#23120f] hover:underline line-clamp-1"
                      >
                        {ev.title}
                      </Link>
                      <p className="text-[#584d47] mt-1">{ev.location}</p>
                      <div className="mt-2 text-xs text-[#6d625c]">
                        {ev.startAt ? new Date(ev.startAt).toLocaleString() : "Not set"}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#433833]">
                        <span>Attendees: <strong>{reportedAttendees}</strong></span>
                        <span>❤️ {ev.likes ?? 0}</span>
                        <span>👁 {ev.views ?? 0}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:w-[300px] lg:justify-end">
                      <Link
                        to={`/organizer/events/${ev._id}/edit`}
                        className="px-4 py-2 rounded-full text-xs bg-white text-[#2c211c] hover:bg-[#f7f1ea]"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/organizer/events/${ev._id}/queries`}
                        className="px-4 py-2 rounded-full text-xs bg-[#9f402d] text-white hover:bg-[#7f2f20]"
                      >
                        Queries
                      </Link>
                      <Link
                        to={statsDisabled ? "#" : `/organizer/events/${ev._id}/stats`}
                        onClick={(e) => {
                          if (statsDisabled) e.preventDefault();
                        }}
                        className={`px-4 py-2 rounded-full text-xs ${
                          statsDisabled
                            ? "bg-[#dddcd1] text-[#8f8782] cursor-not-allowed"
                            : "bg-[#baa900] text-[#2a2500]"
                        }`}
                      >
                        Stats
                      </Link>
                      <button
                        onClick={() => handleDelete(ev._id)}
                        disabled={deletingId === ev._id}
                        className="px-4 py-2 rounded-full text-xs bg-[#271310] text-white disabled:opacity-60"
                      >
                        {deletingId === ev._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })}
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
