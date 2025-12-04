// src/pages/organizer/OrganizerCreateEvent.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { csrfPost } from "../../api/axiosClient";

export default function OrganizerCreateEvent() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [date, setDate] = useState(""); // postedAt (we'll treat as date/time)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function validate() {
    if (!title.trim()) return "Title is required";
    if (!location.trim()) return "Location is required";
    if (!description.trim() || description.trim().length < 20) {
      return "Description must be at least 20 characters";
    }
    if (imageURL && !/^https?:\/\/.+/i.test(imageURL.trim())) {
      return "Image URL must be a valid http(s) url";
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        location: location.trim(),
        description: description.trim(),
        imageURL: imageURL.trim() || undefined,
      };

      // if user picked a date/time, send it as postedAt
      if (date) {
        payload.postedAt = new Date(date).toISOString();
      }

      const res = await csrfPost("/api/event", payload);
      setSuccess(res?.data?.message || "Event created successfully.");

      // small delay so user sees success
      setTimeout(() => {
        navigate("/organizer/events");
      }, 800);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to create event";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] py-10">
      <div className="app-container mx-auto max-w-3xl bg-white rounded-lg p-6 card-coffee">
        <h2 className="text-2xl font-semibold mb-2">Create a new event</h2>
        <p className="text-sm text-gray-600 mb-4">
          Fill in the details for your event. You can edit it later from the
          events list.
        </p>

        {error && <div className="text-red-600 mb-3">{error}</div>}
        {success && <div className="text-green-600 mb-3">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-3 py-2 rounded border"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. College Tech Fest 2025"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-3 py-2 rounded border"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Auditorium, Block A"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full px-3 py-2 rounded border min-h-[120px] resize-vertical"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what's happening, audience, schedule, etc."
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Minimum 20 characters so users understand the event.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Image URL (optional)
            </label>
            <input
              className="w-full px-3 py-2 rounded border"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
              placeholder="https://example.com/event-image.jpg"
            />
            <p className="text-xs text-gray-400 mt-1">
              Used on the home page and event cards.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Event date / time (optional)
            </label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 rounded border"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              If not set, the backend will use current time as posted date.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-coffee-mid text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create event"}
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
