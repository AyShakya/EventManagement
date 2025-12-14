import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api, { csrfPost } from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import { getEventStage } from "../utils/eventStage";

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

        // organizer can see messages for this event
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

    // completed events are view-only
    if (stage.stage === "completed") return;

    if (!user) return navigate("/login");

    const url = (event.registrationFormURL || "").trim();

    // If organizer provided an external registration link -> open it
    if (url) {
      // optional: you can also ping /attend here before redirect for analytics
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    // fallback: internal "attend" toggle
    try {
      const res = await api.post(`/api/event/${id}/attend`);
      if (res.data && res.data.success) setAttending(true);
    } catch (e) {
      console.error(e);
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-coffee-cream via-[#f5ece0] to-coffee-mid">
        <div className="bg-white/80 rounded-lg px-6 py-4 shadow card-coffee text-sm text-gray-600">
          Loading event…
        </div>
      </div>
    );

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
    <div className="min-h-screen bg-gradient-to-b from-coffee-cream via-[#f5ece0] to-coffee-mid text-gray-900 py-10">
      <div className="app-container">
        {/* breadcrumb */}
        <div className="mb-4 text-xs text-gray-500 flex items-center gap-1">
          <Link to="/events" className="hover:text-coffee-mid">
            Events
          </Link>
          <span>/</span>
          <span className="truncate max-w-[60%]">{event.title}</span>
        </div>

        <div className="bg-white rounded-2xl p-5 md:p-7 shadow card-coffee">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: main content */}
            <div className="lg:col-span-2">
              {/* Title + meta row */}
              <div className="flex flex-col gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-coffee-dark leading-snug">
                  {event.title}
                </h1>

                <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-coffee-cream/60 text-coffee-dark border border-coffee-cream">
                    📍 {event.location}
                  </span>

                  {event.startAt && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200">
                      🕒 {formatDateTime(event.startAt)}
                    </span>
                  )}

                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium
                    ${
                      stageInfo.stage === "completed"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : stageInfo.stage === "upcoming"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-gray-50 text-gray-600 border border-gray-200"
                    }`}
                  >
                    {stageInfo.label}
                  </span>
                </div>

                <div className="text-xs text-gray-400">
                  Posted on{" "}
                  <span className="font-medium">
                    {new Date(event.postedAt).toLocaleDateString()}
                  </span>{" "}
                  · 👁 {event.views || 0} · ❤️ {likes}
                </div>
              </div>

              {/* Hero image */}
              <div className="mt-5 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                <div className="aspect-[16/9] w-full">
                  <img
                    src={heroImage}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-base font-semibold text-coffee-dark mb-2">
                  About this event
                </h2>
                <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {/* Public stats / recap */}
              {showPublicStats && (
                <div className="mt-6 border rounded-xl p-4 bg-coffee-cream/30">
                  <h3 className="text-sm font-semibold text-coffee-dark mb-3">
                    Event recap
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    {(stats.totalAttendees !== undefined ||
                      stats.expectedAttendees !== undefined) && (
                      <div>
                        <div className="text-[11px] uppercase text-gray-500 tracking-wide">
                          Attendance
                        </div>
                        <div className="mt-1 font-semibold text-gray-900">
                          {stats.totalAttendees !== undefined
                            ? `${stats.totalAttendees} attended`
                            : "Not reported"}
                        </div>
                        {stats.expectedAttendees !== undefined && (
                          <div className="text-xs text-gray-500">
                            Expected: {stats.expectedAttendees}
                          </div>
                        )}
                      </div>
                    )}

                    {stats.averageRating !== undefined && (
                      <div>
                        <div className="text-[11px] uppercase text-gray-500 tracking-wide">
                          Average rating
                        </div>
                        <div className="mt-1 font-semibold text-gray-900">
                          {stats.averageRating.toFixed
                            ? stats.averageRating.toFixed(1)
                            : stats.averageRating}{" "}
                          / 5
                        </div>
                      </div>
                    )}

                    {(stats.revenue !== undefined ||
                      stats.cost !== undefined) && (
                      <div>
                        <div className="text-[11px] uppercase text-gray-500 tracking-wide">
                          Overview
                        </div>
                        {stats.revenue !== undefined && (
                          <div className="mt-1 text-gray-900">
                            Revenue:{" "}
                            <span className="font-semibold">
                              {stats.revenue}
                            </span>
                          </div>
                        )}
                        {stats.cost !== undefined && (
                          <div className="text-gray-900">
                            Cost:{" "}
                            <span className="font-semibold">{stats.cost}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {stats.highlights && (
                    <div className="mt-4">
                      <div className="text-[11px] uppercase text-gray-500 tracking-wide mb-1">
                        Highlights
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {stats.highlights}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions row */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={toggleLike}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow bg-coffee-dark text-coffee-cream text-sm hover:bg-[#3b1418] transition"
                >
                  <span>{liked ? "Unlike" : "Like"}</span>
                  <span className="text-xs bg-coffee-cream/20 px-2 py-0.5 rounded-full">
                    {likes}
                  </span>
                </button>

                <button
                  onClick={handleAttend}
                  disabled={attendDisabled}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm border transition
                    ${
                      attendDisabled
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        : "bg-coffee-mid text-white border-coffee-mid hover:bg-coffee-dark"
                    }`}
                >
                  {attendButtonLabel}
                </button>

                <Link
                  to={`/events/${id}/feedback`}
                  className="inline-flex items-center px-4 py-2 rounded-full border text-sm hover:bg-gray-50 transition"
                >
                  Send feedback
                </Link>

                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1200);
                  }}
                  className="inline-flex items-center px-3 py-2 rounded-full border text-xs hover:bg-gray-50 transition"
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>

              {hasExternalRegistration && !isCompleted && (
                <p className="mt-2 text-[11px] text-gray-500">
                  Registration is handled on the organizer&apos;s external form.
                  Clicking “Register on form” will open it in a new tab.
                </p>
              )}

              {/* Organizer card */}
              <div className="mt-8 border-t pt-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                    {event.organizer?.avatarURL ? (
                      <img
                        src={event.organizer.avatarURL}
                        alt={event.organizer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                        {(
                          event.organizer?.name ||
                          event.organizer?.userName ||
                          "O"
                        )
                          .slice(0, 1)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">
                      {event.organizer?.name ||
                        event.organizer?.userName ||
                        "Organizer"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {event.organizer?.email}
                    </div>
                    {event.organizer?._id && (
                      <Link
                        to={`/organizer/${event.organizer._id}`}
                        className="text-xs text-coffee-mid hover:underline"
                      >
                        View profile
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: side panel */}
            <aside className="space-y-4 lg:pl-2 lg:border-l lg:border-gray-100 lg:ml-2 lg:py-1">
              {/* Quick info card */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h3 className="text-sm font-semibold text-coffee-dark mb-3">
                  Event details
                </h3>

                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-gray-500 uppercase">When</dt>
                    <dd className="mt-0.5 font-medium">
                      {formatDateTime(event.startAt)}
                    </dd>
                    <dd className="mt-0.5 text-[11px] text-gray-500">
                      Status:{" "}
                      <span className="font-medium">{stageInfo.label}</span>
                    </dd>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <dt className="text-xs text-gray-500 uppercase">
                      Capacity
                    </dt>
                    <dd className="mt-0.5">
                      {event.capacity ? `${event.capacity} seats` : "Open"}
                    </dd>
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                    <div>
                      <dt className="text-xs text-gray-500 uppercase">Likes</dt>
                      <dd className="mt-0.5 font-medium">{likes}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 uppercase">Views</dt>
                      <dd className="mt-0.5 font-medium">{event.views || 0}</dd>
                    </div>
                  </div>
                </dl>
              </div>

              {/* Organizer-only: attendee messages */}
              {isOrganizerView && (
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <h4 className="font-semibold mb-2 text-sm">
                    Attendee messages & feedback
                  </h4>

                  {queries.length === 0 ? (
                    <div className="text-gray-500 text-xs">
                      No messages yet. Attendees can use the “Send feedback”
                      form on this event.
                    </div>
                  ) : (
                    <ul className="space-y-2 max-h-52 overflow-auto pr-1 text-sm">
                      {queries.map((q) => (
                        <li
                          key={q._id}
                          className="p-2 border rounded bg-gray-50/60"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-xs font-semibold">
                              {q.subject || "Message"}
                            </div>
                            <div className="text-[10px] text-gray-400 whitespace-nowrap">
                              {new Date(q.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-xs text-gray-700 mt-1">
                            {q.message}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className="mt-2 text-[11px] text-gray-400">
                    Full list available in your organizer dashboard under
                    Queries for this event.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
