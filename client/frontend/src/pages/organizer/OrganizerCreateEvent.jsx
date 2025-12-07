// src/pages/organizer/OrganizerCreateEvent.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { csrfPost } from "../../api/axiosClient";
import { uploadEventImage } from "../../api/uploadImage";

export default function OrganizerCreateEvent() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");

  const [imageURL, setImageURL] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

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

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploadingImage(true);

    try {
      const { imageURL: url } = await uploadEventImage(file);
      setImageURL(url);
    } catch (error) {
      console.error(error);
      setError(
        error?.response?.data?.message ||
          error.message ||
          "Failed to upload image"
      );
    } finally {
      setUploadingImage(false);
    }
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
        startAt: startAt ? new Date(startAt).toISOString() : undefined,
      };

      // if user picked a date/time, send it as postedAt
      if (startAt) {
        payload.postedAt = new Date(startAt).toISOString();
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
          {/* Title */}
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

          {/* Location */}
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

          {/* Description */}
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

          {/* Image upload */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Event image (optional)
          </label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
          {uploadingImage && (
            <div className="text-xs text-gray-500 mt-1">
              Uploading image...
            </div>
          )}
          {imageURL && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Preview:</div>
              <div className="w-48 h-32 rounded overflow-hidden bg-gray-100">
                <img
                  src={imageURL}
                  alt="Event"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

          {/* Event date & time */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Event date / time (optional)
            </label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 rounded border"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              This is when the event actually happens (not when you post it).
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
