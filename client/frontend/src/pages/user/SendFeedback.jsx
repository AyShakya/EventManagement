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
    await csrfPost(
      `/api/query/event/${eventId}/feedback`,
      payload
    );
    setSuccess("Feedback submitted. Thank you!");
    setTimeout(() => {
      navigate("/user/queries");
    }, 900);

  } catch (err) {
    console.error(err);
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err.message ||
      "Failed to submit feedback";
    setError(msg);
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen bg-[#fbfbe2] text-[#281915] py-14">
      <div className="app-container mx-auto w-full max-w-5xl">
        <div className="text-center mb-8">
          <span className="inline-flex px-4 py-1 rounded-full bg-[#fd876f] text-xs font-semibold uppercase tracking-[0.2em] text-[#5d1d12]">
            Attendee Feedback
          </span>
          <h1 className="mt-4 text-6xl italic font-semibold text-[#1f0f0d]">
            How was your brew?
          </h1>
          <p className="text-xl text-[#4d423d] mt-3">
            Your thoughts help us refine the Artisan experience.
          </p>
        </div>
        <div className="bg-[#f7f7f9] rounded-[2.2rem] p-6 md:p-8 shadow-[0_24px_44px_rgba(39,29,19,0.1)]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-2xl font-semibold text-[#22110f]">
                Send feedback
              </h2>
              <p className="text-base text-[#4d423d] mt-1">
                Share your thoughts with the organizer. Be as specific and
                helpful as you can.
              </p>
            </div>

            {eventId && (
              <div className="flex flex-col items-start sm:items-end text-xs text-gray-500">
                <span className="uppercase tracking-[0.2em]">Event</span>
                <span className="mt-1 inline-flex items-center px-3 py-1 rounded-full bg-[#ececd8] text-[11px] font-medium text-[#4b403b] max-w-[220px] truncate">
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
            {/* Name + Email row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
              <label className="block font-semibold text-xs uppercase tracking-[0.18em] text-[#342420]/85 mb-1.5">
                Your name (optional)
              </label>
              <input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-full bg-[#e8e7d0] focus:outline-none focus:ring-2 focus:ring-[#9f402d]/60 border-0"
                />
              </div>

              <div>
                <label className="block font-semibold text-xs uppercase tracking-[0.18em] text-[#342420]/85 mb-1.5">
                  Your email (optional)
                </label>
                <input
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="you@example.com"
                  type="email"
                  className="w-full px-4 py-3 rounded-full bg-[#e8e7d0] focus:outline-none focus:ring-2 focus:ring-[#9f402d]/60 border-0"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Only used so the organizer can follow up if needed.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-xs uppercase tracking-[0.18em] text-[#342420]/85 mb-1.5">
                Subject
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Short summary of your feedback"
                required
                className="w-full px-4 py-3 rounded-full bg-[#e8e7d0] focus:outline-none focus:ring-2 focus:ring-[#9f402d]/60 border-0"
              />
            </div>

            <div>
              <label className="block font-semibold text-xs uppercase tracking-[0.18em] text-[#342420]/85 mb-1.5">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your feedback, suggestions, or issues..."
                rows={8}
                required
                className="w-full px-4 py-4 rounded-[1.8rem] bg-[#e8e7d0] focus:outline-none focus:ring-2 focus:ring-[#9f402d]/60 resize-vertical border-0"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Minimum 10 characters. Be respectful and constructive.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#271310] text-white px-8 py-3 rounded-full text-base font-medium disabled:opacity-70 disabled:cursor-not-allowed hover:bg-[#3e1d18] transition"
              >
                {loading ? "Sending..." : "Submit Feedback"}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-full border border-[#d3c3c0] text-sm text-[#5f514a] hover:bg-[#f2efdd] transition"
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
