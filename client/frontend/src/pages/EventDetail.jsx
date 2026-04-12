import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api, { csrfPost } from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import { getEventStage } from "../utils/eventStage";
import PageSkeleton from "../components/PageSkeleton";

function formatDateTime(dt) {
  if (!dt) return "TBA";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return "TBA";
  }
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [attending, setAttending] = useState(false);
  const [queries, setQueries] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/event/${id}`);
        if (!mounted) return;

        const ev = res.data?.event || res.data;
        setEvent(ev);
        setLikes(ev?.likes || 0);
        setLiked(Boolean(ev?.liked));
        setAttending(Boolean(ev?.isAttending));

        if (user && user.userType === "organizer") {
          const qres = await api
            .get(`/api/query/event/${id}`)
            .catch(() => ({ data: { queries: [] } }));
          if (!mounted) return;
          setQueries(qres.data?.queries || []);
        } else {
          if (mounted) setQueries([]);
        }
      } catch (e) {
        console.error(e);
        if (mounted)
          setErr(e?.response?.data?.message || "Failed to load event");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, user]);

  async function toggleLike() {
    if (!user) return navigate("/login");
    try {
      const res = await csrfPost(`/api/event/${id}/like`);
      const data = res.data || {};

      setLiked(Boolean(data.liked ?? !liked));
      setLikes(
        typeof data.likes === "number"
          ? data.likes
          : liked
          ? Math.max(0, likes - 1)
          : likes + 1
      );
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAttend() {
    if (!event) return;
    const stage = getEventStage(event.startAt);

    if (stage.stage === "completed") return;

    if (!user) return navigate("/login");

    const url = (event.registrationFormURL || "").trim();

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      const res = await api.post(`/api/event/${id}/attend`);
      if (res.data && res.data.success) setAttending(true);
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) return <PageSkeleton title="Loading event" cards={2} />;

  if (err)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-coffee-cream via-[#f5ece0] to-coffee-mid">
        <div className="bg-white/90 rounded-lg px-6 py-4 shadow card-coffee text-red-600">
          {err}
        </div>
      </div>
    );

  if (!event)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-coffee-cream via-[#f5ece0] to-coffee-mid">
        <div className="bg-white/90 rounded-lg px-6 py-4 shadow card-coffee">
          Event not found
        </div>
      </div>
    );

  const stageInfo = getEventStage(event.startAt);
  const stats = event.stats || {};
  const showPublicStats = stageInfo.stage === "completed" && stats.isPublished;

  const heroImage =
    (Array.isArray(event.images) && event.images[0]) ||
    event.imageURL ||
    "/placeholder.jpg";

  const isCompleted = stageInfo.stage === "completed";
  const registrationURL = (event.registrationFormURL || "").trim();
  const hasExternalRegistration = Boolean(registrationURL);

  const attendButtonLabel = isCompleted
    ? "Event completed"
    : hasExternalRegistration
    ? "Register on form"
    : attending
    ? "Registered"
    : "Attend / Register";

  const attendDisabled = isCompleted || (!hasExternalRegistration && attending);

  const isOrganizerView = user?.userType === "organizer";

  return (
    <div className="min-h-screen bg-[#fbfbe2] text-[#2a1a15] py-10 page-content">
      <div className="app-container">
        <div className="mb-4 text-xs text-[#7a6f68] flex items-center gap-1">
          <Link to="/events" className="hover:text-[#9f402d]">Events</Link>
          <span>/</span>
          <span className="truncate max-w-[60%]">{event.title}</span>
        </div>

        <div className="rounded-[2.2rem] bg-[#f7f7f9] overflow-hidden shadow-[0_26px_44px_rgba(31,19,16,0.15)]">
          <div className="grid lg:grid-cols-[0.42fr_0.58fr]">
            <div className="bg-[#ececd8] p-6">
              <div className="rounded-[1.7rem] overflow-hidden">
                <img src={heroImage} alt={event.title} className="w-full h-[340px] md:h-[430px] object-cover" />
              </div>

              <div className="mt-5">
                <div className="text-xl font-semibold">{event.location || "Location TBA"}</div>
                <div className="text-sm text-[#5f544d] mt-1">{formatDateTime(event.startAt)}</div>
              </div>

              <div className="mt-4 rounded-[1.6rem] bg-[#c57b59] min-h-[240px] flex items-center justify-center text-[#fbe7dc]/90 text-sm">
                Venue map preview
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-4 py-1 rounded-full bg-[#fd876f] text-[#732010] text-xs font-semibold uppercase tracking-[0.18em]">
                  {stageInfo.label}
                </span>
                {event.capacity && (
                  <span className="px-4 py-1 rounded-full bg-[#baa900] text-[#2b2700] text-xs font-semibold uppercase tracking-[0.15em]">
                    {event.capacity} seats
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-5xl md:text-6xl leading-[0.95] font-semibold text-[#1f0f0d]">
                {event.title}
              </h1>

              <div className="mt-5 grid sm:grid-cols-2 gap-3 bg-[#ececd8] rounded-[1.5rem] p-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[#5d524b]">Date</div>
                  <div className="text-lg font-semibold mt-1">{event.startAt ? new Date(event.startAt).toLocaleDateString() : "TBA"}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[#5d524b]">Time</div>
                  <div className="text-lg font-semibold mt-1">{event.startAt ? new Date(event.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBA"}</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-xs uppercase tracking-[0.2em] text-[#5d524b] mb-2">About the event</div>
                <p className="text-[1.08rem] leading-relaxed text-[#3b2f2a] whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {showPublicStats && (
                <div className="mt-6 bg-[#efefdf] rounded-[1.5rem] p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#4f443d] mb-3">
                    Event recap
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.15em] text-[#70655e]">Attendance</div>
                      <div className="font-semibold mt-1">
                        {stats.totalAttendees !== undefined ? `${stats.totalAttendees} attended` : "Not reported"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.15em] text-[#70655e]">Rating</div>
                      <div className="font-semibold mt-1">
                        {stats.averageRating !== undefined
                          ? `${stats.averageRating.toFixed ? stats.averageRating.toFixed(1) : stats.averageRating} / 5`
                          : "Not reported"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.15em] text-[#70655e]">Overview</div>
                      <div className="font-semibold mt-1">❤️ {likes} · 👁 {event.views || 0}</div>
                    </div>
                  </div>
                  {stats.highlights && (
                    <p className="mt-3 text-sm text-[#3f322e] whitespace-pre-wrap">{stats.highlights}</p>
                  )}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-[#e7e0dc] flex flex-wrap items-center gap-3">
                <button
                  onClick={toggleLike}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#f5f5dc] text-[#2d211d] text-sm"
                >
                  {liked ? "Unlike" : "Like"} <span className="text-xs">{likes}</span>
                </button>

                <Link
                  to={`/events/${id}/feedback`}
                  className="inline-flex items-center px-5 py-3 rounded-full bg-[#f5f5dc] text-[#2d211d] text-sm"
                >
                  Send feedback
                </Link>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1200);
                  }}
                  className="inline-flex items-center px-4 py-3 rounded-full bg-[#f5f5dc] text-[#2d211d] text-xs"
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>

              {hasExternalRegistration && !isCompleted && (
                <p className="mt-3 text-xs text-[#6b5f58]">
                  Registration is handled on the organizer&apos;s external form.
                </p>
              )}

              <div className="mt-5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-[#6d625b]">Price</div>
                  <div className="text-5xl font-semibold text-[#22100f]">
                    {event.price ? `$${event.price}` : "$0.00"}
                  </div>
                </div>
                <button
                  onClick={handleAttend}
                  disabled={attendDisabled}
                  className={`px-10 py-4 rounded-full text-2xl sm:text-lg font-medium ${
                    attendDisabled
                      ? "bg-[#d9d7d3] text-[#8b847f] cursor-not-allowed"
                      : "bg-[#271310] text-white shadow-[0_12px_22px_rgba(39,19,16,0.2)]"
                  }`}
                >
                  {attendButtonLabel}
                </button>
              </div>

              <div className="mt-6 text-xs text-[#817670]">
                Posted on {new Date(event.postedAt).toLocaleDateString()} · 👁 {event.views || 0} · ❤️ {likes}
              </div>

              {event.organizer && (
                <div className="mt-4 text-sm text-[#4e423d]">
                  Curated by{" "}
                  <span className="font-semibold">
                    {event.organizer?.name || event.organizer?.userName || "Organizer"}
                  </span>
                  {event.organizer?._id && (
                    <Link to={`/organizer/${event.organizer._id}`} className="ml-2 text-[#9f402d] hover:underline">
                      View profile
                    </Link>
                  )}
                </div>
              )}

              {isOrganizerView && (
                <div className="mt-6 rounded-[1.4rem] bg-[#efefdf] p-4">
                  <h4 className="font-semibold mb-2 text-sm uppercase tracking-[0.15em]">Attendee messages</h4>
                  {queries.length === 0 ? (
                    <div className="text-[#6b6059] text-xs">No messages yet.</div>
                  ) : (
                    <ul className="space-y-2 max-h-52 overflow-auto pr-1 text-sm">
                      {queries.map((q) => (
                        <li key={q._id} className="p-2 rounded-xl bg-[#f7f7ed]">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-semibold">{q.subject || "Message"}</div>
                            <div className="text-[10px] text-[#8b7f78] whitespace-nowrap">
                              {new Date(q.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-xs text-[#4c403a] mt-1">{q.message}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
