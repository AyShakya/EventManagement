import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { fetchCsrfToken } from "../../api/axiosClient";
import { uploadEventImage } from "../../api/uploadImage";

function toLocalDateTimeInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  // yyyy-MM-ddTHH:mm (datetime-local format)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default function OrganizerEditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [imageURL, setImageURL] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/api/event/${id}`);
        const ev = res.data?.event || res.data;
        if (!ev) throw new Error("Event not found");

        if (!mounted) return;
        setTitle(ev.title || "");
        setLocation(ev.location || "");
        setDescription(ev.description || "");
        setImageURL(ev.imageURL || "");
        setStartAt(ev.startAt ? toLocalDateTimeInput(ev.startAt) : "");
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load event"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

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

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        location: location.trim(),
        description: description.trim(),
        imageURL: imageURL.trim() || undefined,
        startAt: startAt ? new Date(startAt).toISOString() : undefined,
      };

      const csrf = await fetchCsrfToken();
      const res = await api.patch(`/api/event/${id}`, payload, {
        headers: { "X-CSRF-Token": csrf },
      });

      setSuccess(res?.data?.message || "Event updated successfully.");

      setTimeout(() => {
        navigate("/organizer/events");
      }, 800);
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to update event";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center">
        <div className="app-container mx-auto">Loading event...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] py-10">
      <div className="app-container mx-auto max-w-3xl bg-white rounded-lg p-6 card-coffee">
        <h2 className="text-2xl font-semibold mb-2">Edit event</h2>
        <p className="text-sm text-gray-600 mb-4">
          Update details for this event. Changes are visible immediately.
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
              onChange={e => setTitle(e.target.value)}
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
              onChange={e => setLocation(e.target.value)}
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
              onChange={e => setDescription(e.target.value)}
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Minimum 20 characters so users understand the event.
            </p>
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Event image
            </label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {uploadingImage && (
              <div className="text-xs text-gray-500 mt-1">Uploading...</div>
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

          {/* Event date/time */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Event date / time
            </label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 rounded border"
              value={startAt}
              onChange={e => setStartAt(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">
              This is when the event actually happens (not when you posted it).
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-coffee-mid text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
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
