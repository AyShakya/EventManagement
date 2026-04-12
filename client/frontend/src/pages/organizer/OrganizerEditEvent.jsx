import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { fetchCsrfToken } from "../../api/axiosClient";
import PageSkeleton from "../../components/PageSkeleton";
import { uploadEventImage } from "../../api/uploadImage";

function toLocalDateTimeInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
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
  const [registrationFormURL, setRegistrationFormURL] = useState("");

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
    if (
      registrationFormURL &&
      !/^https?:\/\/.+/i.test(registrationFormURL.trim())
    ) {
      return "Registration form URL must be a valid http(s) url";
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

      if (registrationFormURL.trim()) {
        payload.registrationFormURL = registrationFormURL.trim();
      } else {
        payload.registrationFormURL = ""; 
      }

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
    return <PageSkeleton title="Loading event editor" cards={2} />;
  }

  return (
    <div className="min-h-screen bg-[#fbfbe2] text-[#2a1a14] py-10 page-content">
      <div className="app-container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-5xl md:text-7xl font-semibold text-[#1f0f0d] leading-tight">
              Refine Event
            </h1>
            <p className="text-xl text-[#4f433e] mt-2">
              Update the information for this event. Changes are visible
              immediately.
            </p>
          </div>
        </div>

        <div className="bg-[#fbfbe2] rounded-[2rem]">
          {error && (
            <div className="mb-4 rounded-2xl bg-red-100/80 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-2xl bg-emerald-100/80 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid lg:grid-cols-[1.5fr_0.72fr] gap-6">
              <div className="bg-[#f7f7f9] rounded-[2rem] p-6 md:p-7">
                <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-[#2d2623]/90 mb-2">
                  Event Title
                </label>
                <input
                  className="w-full px-4 py-3 rounded-full bg-[#e8e7d0] text-lg placeholder:text-[#c6baa7] focus:outline-none focus:ring-2 focus:ring-[#9f402d]/65 border-0"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <div className="mt-6">
                  <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-[#2d2623]/90 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-4 py-4 rounded-[1.8rem] bg-[#e8e7d0] text-lg placeholder:text-[#c6baa7] min-h-[210px] resize-vertical focus:outline-none focus:ring-2 focus:ring-[#9f402d]/65 border-0"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                  <p className="mt-2 text-xs text-[#726560]">
                    Minimum 20 characters so users understand the event.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-[#ececd8] rounded-[2rem] p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] mb-3">
                    Schedule
                  </h3>
                  <label className="block text-xs uppercase tracking-[0.14em] text-[#514642] mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2.5 rounded-full bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#9f402d]/65 border-0"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                  />
                </div>
                <div className="bg-[#ececd8] rounded-[2rem] p-5">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] mb-3">
                    Destination
                  </h3>
                  <label className="block text-xs uppercase tracking-[0.14em] text-[#514642] mb-1">
                    Venue Name
                  </label>
                  <input
                    className="w-full px-4 py-2.5 rounded-full bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#9f402d]/65 border-0"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                  <p className="mt-3 text-xs text-[#726560]">
                    Registration form URL
                  </p>
                  <input
                    className="mt-1 w-full px-4 py-2.5 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9f402d]/65 border-0"
                    value={registrationFormURL}
                    onChange={(e) => setRegistrationFormURL(e.target.value)}
                    placeholder="https://your-form.com/register"
                  />
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1.35fr_0.85fr] gap-6">
              <div className="bg-[#f7f7f9] rounded-[2rem] p-4">
                <label className="block">
                  <div className="rounded-[1.75rem] border-2 border-dashed border-[#d9ccc8] min-h-[250px] flex items-center justify-center text-center px-6 cursor-pointer bg-[#bfa284]/40 hover:bg-[#bfa284]/50">
                    <div>
                      <p className="text-2xl font-medium mb-1">
                        Update Cover Image
                      </p>
                      <p className="text-sm text-[#5f524d]">
                        Recommended: 1920x1080px (Max 5MB)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                </label>
                {uploadingImage && (
                  <div className="text-xs text-[#6d625d] mt-2">Uploading...</div>
                )}
                {imageURL && (
                  <div className="mt-4 rounded-2xl overflow-hidden bg-[#ececd8] h-40">
                    <img
                      src={imageURL}
                      alt="Event"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="bg-[#ececd8] rounded-[2rem] p-6">
                <h3 className="text-4xl leading-tight font-semibold mb-4">
                  Curator&apos;s Notes
                </h3>
                <p className="text-sm text-[#5f534c] mb-4">
                  Keep descriptions evocative and specific to boost attendance.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Workshops", "Live Music", "Tasting", "Networking"].map(
                    (tag, idx) => (
                      <span
                        key={tag}
                        className={`px-4 py-1.5 rounded-full text-sm ${
                          idx === 0
                            ? "bg-[#fd876f] text-[#732010]"
                            : "bg-white/80 text-[#5b4f48]"
                        }`}
                      >
                        {tag}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/organizer/events")}
                className="px-8 py-3 rounded-full text-lg bg-transparent border border-[#d3c3c0] text-[#9f402d] hover:bg-[#f3eed9]"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-10 py-3 rounded-full bg-[#271310] text-white text-lg font-medium disabled:opacity-60 shadow-[0_14px_24px_rgba(39,19,16,0.2)]"
              >
                {saving ? "Saving..." : "Publish Update"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
