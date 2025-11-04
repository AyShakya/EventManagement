import { useContext } from "react";
import { useNavigate } from "react-router-dom";

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
    setLoading(true);
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

      const res = await api.post(
        `/api/query/event/${eventId}/feedback`,
        payload
      );
      setLoading(false);

      if (res && (res.status === 201 || res.data)) {
        setSuccessMsg("Feedback submitted. Thank you!");
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
    <div style={{ padding: 20, maxWidth: 720, margin: "0 auto" }}>
      <h2>Send Feedback for Event</h2>
      <p>
        {eventId ? (
          <>
            Sending feedback for event <strong>{eventId}</strong>.
          </>
        ) : (
          "No event selected"
        )}
      </p>

      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
      {success && <div style={{ color: "green", marginBottom: 12 }}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", fontWeight: 600 }}>Your name (optional)</label>
          <input
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Your name"
            style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", fontWeight: 600 }}>Your email (optional)</label>
          <input
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", fontWeight: 600 }}>Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Short subject"
            required
            style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", fontWeight: 600 }}>Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your feedback..."
            rows={8}
            required
            style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #ccc", resize: "vertical" }}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading} style={{ padding: "8px 14px", borderRadius: 6 }}>
            {loading ? "Sending..." : "Send Feedback"}
          </button>{" "}
          <button type="button" onClick={() => navigate(-1)} style={{ marginLeft: 8 }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
