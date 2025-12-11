// src/pages/organizer/OrganizerEventStats.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api, { fetchCsrfToken } from "../../api/axiosClient";

function computeStage(startAt) {
  if (!startAt) return { stage: "unscheduled", label: "Unscheduled" };
  const now = new Date();
  const s = new Date(startAt);
  if (s > now) return { stage: "upcoming", label: "Upcoming" };
  return { stage: "completed", label: "Completed" };
}

export default function OrganizerEventStats() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // form fields for stats
  const [expectedAttendees, setExpectedAttendees] = useState("");
  const [totalAttendees, setTotalAttendees] = useState("");
  const [averageRating, setAverageRating] = useState("");
  const [revenue, setRevenue] = useState("");
  const [cost, setCost] = useState("");
  const [highlights, setHighlights] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/api/event/${eventId}`);
        const ev = res.data?.event || res.data;
        if (!mounted) return;
        if (!ev) throw new Error("Event not found");

        setEvent(ev);

        const stats = ev.stats || {};

        setExpectedAttendees(
          stats.expectedAttendees !== undefined ? String(stats.expectedAttendees) : ""
        );
        setTotalAttendees(
          stats.totalAttendees !== undefined ? String(stats.totalAttendees) : ""
        );
        setAverageRating(
          stats.averageRating !== undefined ? String(stats.averageRating) : ""
        );
        setRevenue(stats.revenue !== undefined ? String(stats.revenue) : "");
        setCost(stats.cost !== undefined ? String(stats.cost) : "");
        setHighlights(stats.highlights || "");
        setIsPublished(Boolean(stats.isPublished));
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.response?.data?.error ||
              err.message ||
              "Failed to load event stats"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center">
        <div className="app-container mx-auto">Loading event stats…</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[60vh] flex items-center">
        <div className="app-container mx-auto text-center">
          <p className="mb-3">Event not found.</p>
          <Link to="/organizer/events" className="text-coffee-mid underline">
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  const stageInfo = computeStage(event.startAt);
  const isCompleted = stageInfo.stage === "completed";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isCompleted) {
      setError("You can only submit stats after the event is completed.");
      return;
    }

    setSaving(true);
    try {
      const statsPayload = {};

      if (expectedAttendees.trim() !== "") {
        statsPayload.expectedAttendees = Number(expectedAttendees);
      }
      if (totalAttendees.trim() !== "") {
        statsPayload.totalAttendees = Number(totalAttendees);
      }
      if (averageRating.trim() !== "") {
        statsPayload.averageRating = Number(averageRating);
      }
      if (revenue.trim() !== "") {
        statsPayload.revenue = revenue.trim();
      }
      if (cost.trim() !== "") {
        statsPayload.cost = cost.trim();
      }
      if (highlights.trim() !== "") {
        statsPayload.highlights = highlights.trim();
      }
      statsPayload.isPublished = Boolean(isPublished);

      const csrf = await fetchCsrfToken();
      const res = await api.patch(
        `/api/event/${eventId}/stats`,
        { stats: statsPayload },
        { headers: { "X-CSRF-Token": csrf } }
      );

      setSuccess(res?.data?.message || "Event stats saved.");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to save stats"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[60vh] py-10">
      <div className="app-container mx-auto max-w-3xl bg-white rounded-lg p-6 card-coffee">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">Event recap & stats</h2>
            <p className="text-sm text-gray-600">
              {event.title} •{" "}
              {event.startAt
                ? new Date(event.startAt).toLocaleString()
                : "No date set"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Status:{" "}
              <span className="font-medium">{stageInfo.label}</span>
            </p>
          </div>
          <Link
            to="/organizer/events"
            className="text-sm text-coffee-mid underline"
          >
            Back to events
          </Link>
        </div>

        {!isCompleted && (
          <div className="mb-4 text-xs text-yellow-800 bg-yellow-50 border-l-4 border-yellow-400 px-3 py-2 rounded">
            You can fill this form anytime, but stats are meant for{" "}
            <strong>completed events</strong>. Once the event date is in the
            past, this recap is visible (if you choose to publish it).
          </div>
        )}

        {error && <div className="text-red-600 mb-3">{error}</div>}
        {success && <div className="text-green-600 mb-3">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Attendance block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Expected attendees
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 rounded border"
                value={expectedAttendees}
                onChange={(e) => setExpectedAttendees(e.target.value)}
                placeholder="e.g. 120"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Actual attendees
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 rounded border"
                value={totalAttendees}
                onChange={(e) => setTotalAttendees(e.target.value)}
                placeholder="e.g. 105"
              />
            </div>
          </div>

          {/* Rating / satisfaction */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Average rating (0–5)
            </label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              className="w-full px-3 py-2 rounded border"
              value={averageRating}
              onChange={(e) => setAverageRating(e.target.value)}
              placeholder="e.g. 4.5"
            />
            <p className="text-xs text-gray-400 mt-1">
              Optional — your own estimate or from feedback.
            </p>
          </div>

          {/* Money block */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Revenue (optional)
              </label>
              <input
                className="w-full px-3 py-2 rounded border"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="e.g. ₹15,000 or $300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Cost (optional)
              </label>
              <input
                className="w-full px-3 py-2 rounded border"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g. ₹8,000"
              />
            </div>
          </div>

          {/* Highlights / notes */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Highlights / notes
            </label>
            <textarea
              className="w-full px-3 py-2 rounded border min-h-[120px] resize-vertical"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              placeholder="Key moments, learnings, feedback summary, or anything you want visitors to see."
            />
          </div>

          {/* Publish toggle */}
          <div className="flex items-center gap-2 mt-2">
            <input
              id="publish-stats"
              type="checkbox"
              className="h-4 w-4"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
            <label htmlFor="publish-stats" className="text-sm text-gray-700">
              Show this recap on the public event page
            </label>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-coffee-mid text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save stats"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/organizer/events")}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
