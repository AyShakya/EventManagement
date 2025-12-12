// src/pages/organizer/OrganizerEditEvent.jsx
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
  const [imagePublicId, setImagePublicId] = useState("");

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
        setImageURL(ev.images?.[0] || ev.imageURL || "");
        setImagePublicId(ev.publicId);
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
      <div className="min-h-screen bg-gradient-to-b from-coffee-cream to-coffee-mid flex items-center">
        <div className="app-container mx-auto text-gray-700">
          Loading event...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-cream to-coffee-mid text-gray-900 py-10">
      <div className="app-container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-coffee-dark">
              Edit event
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Update the information for this event. Changes are visible
              immediately.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 md:p-8 shadow card-coffee">
          {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic info */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-coffee-dark">
                  Basic information
                </h2>
                <span className="text-[11px] uppercase tracking-wide text-gray-400">
                  * Required fields
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-mid/60 focus:border-coffee-mid"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-mid/60 focus:border-coffee-mid"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm min-h-[130px] resize-vertical focus:outline-none focus:ring-2 focus:ring-coffee-mid/60 focus:border-coffee-mid"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Minimum 20 characters so users understand the event.
                </p>
              </div>
            </div>

            {/* Layout split: image + schedule */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image */}
              <div>
                <h2 className="text-sm font-semibold text-coffee-dark mb-2">
                  Event image
                </h2>
                <p className="text-xs text-gray-500 mb-2">
                  Update the banner image for this event.
                </p>

                <label className="block">
                  <div className="border border-dashed border-gray-300 rounded-lg px-3 py-3 text-xs text-gray-600 cursor-pointer hover:border-coffee-mid/70">
                    <div className="flex items-center justify-between gap-3">
                      <span>Choose a new image (optional)</span>
                      <span className="px-2 py-1 rounded bg-coffee-mid text-white text-[11px]">
                        Upload
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </label>

                {uploadingImage && (
                  <div className="text-xs text-gray-500 mt-2">
                    Uploading...
                  </div>
                )}

                {imageURL && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-1">Preview</div>
                    <div className="w-full max-w-xs h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                        src={imageURL}
                        alt="Event"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Date/time */}
              <div>
                <h2 className="text-sm font-semibold text-coffee-dark mb-2">
                  Schedule
                </h2>
                <p className="text-xs text-gray-500 mb-2">
                  Adjust the event&apos;s start date &amp; time if needed.
                </p>

                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Event date / time
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-mid/60 focus:border-coffee-mid"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  This is when the event actually happens (not when you posted it).
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/organizer/events")}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-coffee-mid text-white text-sm font-medium disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
