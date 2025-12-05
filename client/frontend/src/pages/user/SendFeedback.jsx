import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api, {csrfPost} from "../../api/axiosClient";

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

  useEffect(() => {
    if (user) {
      setSenderName(user.userName || user.organizerName || "");
      setSenderEmail(user.email || "");
    }
  }, [user]);

  function validate() {
    if (!subject || subject.trim().length < 3) {
      return "Subject must be at least 3 characters long";
    }
    if (!message || message.trim().length < 10) {
      return "Message must be at least 10 characters long";
    }
    if (senderEmail && !/^\S+@\S+\.\S+$/.test(senderEmail)) {
      return "Invalid email address";
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

      const res = await csrfPost(`/api/query/event/${eventId}/feedback`, payload);
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
    <div className="min-h-[60vh] flex items-center">
      <div className="app-container mx-auto w-full max-w-3xl bg-white rounded-lg p-6 card-coffee">
        <h2 className="text-2xl font-semibold mb-2">Send Feedback for Event</h2>
        <p className="text-sm mb-3">
          {eventId ? (
            <>Sending feedback for event <strong>{eventId}</strong>.</>
          ) : (
            "No event selected"
          )}
        </p>

        {error && <div className="text-red-600 mb-3">{error}</div>}
        {success && <div className="text-green-600 mb-3">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-semibold text-sm">Your name (optional)</label>
            <input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Your name" className="w-full px-3 py-2 rounded border" />
          </div>

          <div>
            <label className="block font-semibold text-sm">Your email (optional)</label>
            <input value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="you@example.com" type="email" className="w-full px-3 py-2 rounded border" />
          </div>

          <div>
            <label className="block font-semibold text-sm">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short subject" required className="w-full px-3 py-2 rounded border" />
          </div>

          <div>
            <label className="block font-semibold text-sm">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your feedback..." rows={8} required className="w-full px-3 py-2 rounded border resize-vertical" />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="bg-coffee-mid text-white px-4 py-2 rounded">
              {loading ? "Sending..." : "Send Feedback"}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="px-3 py-2 rounded border">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};
