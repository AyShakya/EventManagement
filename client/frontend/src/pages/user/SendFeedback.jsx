// src/pages/user/SendFeedback.jsx
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api, { csrfPost } from "../../api/axiosClient";

export const SendFeedback = () => {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [eventTitle, setEventTitle] = useState("");

  useEffect(() => {
    if (user) {
      setSenderName(user.userName || user.organizerName || "");
      setSenderEmail(user.email || "");
    }
  }, [user]);

  // optional: try to show event title (safe fallback to id only)
  useEffect(() => {
    let mounted = true;
    if (!eventId) return;

    (async () => {
      try {
        const res = await api
          .get(`/api/event/${eventId}`)
          .catch(() => ({ data: {} }));
        if (!mounted) return;
        const ev = res.data?.event || res.data;
        if (ev?.title) setEventTitle(ev.title);
      } catch {
        // ignore, we just won't show title
      }
    })();

    return () => {
      mounted = false;
    };
  }, [eventId]);

  function validate() {
    if (!subject || subject.trim().length < 3) {
      return "Subject must be at least 3 characters long.";
    }
    if (!message || message.trim().length < 10) {
      return "Message must be at least 10 characters long.";
    }
    if (senderEmail && !/^\S+@\S+\.\S+$/.test(senderEmail)) {
      return "Invalid email address.";
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
        subject: subject.trim(),
        message: message.trim(),
        senderName: senderName.trim() || undefined,
        senderEmail: senderEmail.trim() || undefined,
      };

      const res = await csrfPost(
        `/api/query/event/${eventId}/feedback`,
        payload
      );
      setLoading(false);

      if (res && (res.status === 201 || res.data)) {
        setSuccess("Feedback submitted. Thank you!");
        setTimeout(() => {
          navigate("/user/queries");
        }, 900);
      } else {
        setError("Failed to submit feedback. Please try again.");
      }
    } catch (err) {
      setLoading(false);
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Failed to submit feedback";
      setError(msg);
    }
  }

  return (
    <div className="min-h-screen py-10 bg-gradient-to-b from-coffee-cream to-coffee-mid">
      <div className="app-container mx-auto w-full max-w-3xl">
        <div className="bg-white rounded-xl p-6 md:p-7 shadow card-coffee">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-coffee-dark">
                Send feedback
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Share your thoughts with the organizer. Be as specific and
                helpful as you can.
              </p>
            </div>

            {eventId && (
              <div className="hidden sm:flex flex-col items-end text-right text-xs text-gray-500">
                <span className="uppercase tracking-wide">Event</span>
                <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full bg-coffee-cream/70 text-[11px] font-medium text-gray-700 max-w-[180px] truncate">
                  {eventTitle || `ID: ${eventId}`}
                </span>
              </div>
            )}
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-3 text-sm rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 text-sm rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name + Email row on bigger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-xs uppercase tracking-wide text-gray-600 mb-1.5">
                  Your name (optional)
                </label>
                <input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coffee-mid/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-xs uppercase tracking-wide text-gray-600 mb-1.5">
                  Your email (optional)
                </label>
                <input
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coffee-mid/50"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Used only so the organizer can follow up if needed.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-xs uppercase tracking-wide text-gray-600 mb-1.5">
                Subject
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Short summary of your feedback"
                required
                className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coffee-mid/50"
              />
            </div>

            <div>
              <label className="block font-semibold text-xs uppercase tracking-wide text-gray-600 mb-1.5">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your feedback, suggestions, or issues..."
                rows={8}
                required
                className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coffee-mid/50 resize-vertical"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Minimum 10 characters. Be respectful and constructive.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-coffee-mid text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed hover:bg-coffee-dark transition"
              >
                {loading ? "Sending..." : "Send feedback"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-3 py-2 rounded-md border text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
