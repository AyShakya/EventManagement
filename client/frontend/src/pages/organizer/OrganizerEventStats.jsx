import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api, { fetchCsrfToken } from "../../api/axiosClient";
import { getEventStage } from "../../utils/eventStage"; 

export default function OrganizerEventStats() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
          stats.expectedAttendees !== undefined
            ? String(stats.expectedAttendees)
            : ""
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
        <div className="app-container mx-auto text-sm text-gray-600">
          Loading event stats…
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[60vh] flex items-center">
        <div className="app-container mx-auto text-center">
          <p className="mb-3 text-gray-700">Event not found.</p>
          <Link
            to="/organizer/events"
            className="inline-flex items-center text-sm text-coffee-mid underline"
          >
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  const stageInfo = getEventStage(event.startAt);
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
        statsPayload.revenue = Number(revenue);
      }
      if (cost.trim() !== "") {
        statsPayload.cost = Number(cost);
      }
      if (highlights.trim() !== "") {
        statsPayload.highlights = highlights.trim();
      }
      statsPayload.isPublished = Boolean(isPublished);

      const csrf = await fetchCsrfToken();
      const res = await api.patch(`/api/event/${eventId}/stats`, statsPayload, {
        headers: { "X-CSRF-Token": csrf },
      });

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
    <div className="min-h-[60vh] py-10 bg-gradient-to-b from-coffee-cream/60 to-coffee-mid/10">
      <div className="app-container mx-auto max-w-4xl">
        {/* Header card */}
        <div className="bg-white rounded-xl p-5 shadow card-coffee mb-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-coffee-dark">
                Event recap & stats
              </h2>
              <p className="text-sm text-gray-700 mt-1">
                {event.title}
                {event.location && (
                  <span className="text-gray-500"> • {event.location}</span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {event.startAt ? (
                  <>
                    Event date:{" "}
                    <span className="font-medium">
                      {new Date(event.startAt).toLocaleString()}
                    </span>
                  </>
                ) : (
                  "No date set"
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Status:{" "}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                    stageInfo.stage === "completed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : stageInfo.stage === "upcoming"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {stageInfo.label}
                </span>
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Link
                to={`/events/${event._id}`}
                className="text-xs text-coffee-mid underline"
              >
                View public page
              </Link>
              <Link
                to="/organizer/events"
                className="text-xs text-gray-600 underline"
              >
                Back to events
              </Link>
            </div>
          </div>
        </div>

        {/* Main form card */}
        <div className="bg-white rounded-xl p-6 shadow card-coffee">
          {!isCompleted && (
            <div className="mb-4 text-xs text-yellow-800 bg-yellow-50 border border-yellow-200 px-3 py-2 rounded-md">
              You can draft stats anytime, but{" "}
              <strong>
                they can only be saved once the event is completed
              </strong>
              . When the event date is in the past and you publish, a recap
              section appears on the public event page.
            </div>
          )}

          {error && (
            <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Attendance block */}
            <section>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Attendance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Expected attendees
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 rounded border text-sm"
                    value={expectedAttendees}
                    onChange={(e) => setExpectedAttendees(e.target.value)}
                    placeholder="e.g. 120"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Actual attendees
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 rounded border text-sm"
                    value={totalAttendees}
                    onChange={(e) => setTotalAttendees(e.target.value)}
                    placeholder="e.g. 105"
                  />
                </div>
              </div>
            </section>

            {/* Rating / satisfaction */}
            <section className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Satisfaction
              </h3>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-600">
                  Average rating (0–5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full px-3 py-2 rounded border text-sm"
                  value={averageRating}
                  onChange={(e) => setAverageRating(e.target.value)}
                  placeholder="e.g. 4.5"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Optional — your own estimate or based on feedback forms.
                </p>
              </div>
            </section>

            {/* Money block */}
            <section className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Financial overview (optional)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Revenue
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded border text-sm"
                    value={revenue}
                    onChange={(e) => setRevenue(e.target.value)}
                    placeholder="e.g. ₹15,000 or $300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-gray-600">
                    Cost
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded border text-sm"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="e.g. ₹8,000"
                  />
                </div>
              </div>
            </section>

            {/* Highlights / notes */}
            <section className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Highlights & notes
              </h3>
              <textarea
                className="w-full px-3 py-2 rounded border min-h-[120px] resize-vertical text-sm"
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder="Key moments, learnings, feedback summary, standout speakers, issues to improve next time..."
              />
            </section>

            {/* Publish toggle */}
            <section className="border-t pt-4">
              <div className="flex items-start gap-2">
                <input
                  id="publish-stats"
                  type="checkbox"
                  className="h-4 w-4 mt-0.5"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <div>
                  <label
                    htmlFor="publish-stats"
                    className="text-sm text-gray-800 font-medium"
                  >
                    Show this recap on the public event page
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    When enabled and the event is completed, a recap block
                    appears on the event details page so attendees and future
                    visitors can see how it went.
                  </p>
                </div>
              </div>
            </section>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-coffee-mid text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 hover:bg-coffee-dark"
              >
                {saving ? "Saving..." : "Save stats"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/organizer/events")}
                className="px-4 py-2 rounded-lg border text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
