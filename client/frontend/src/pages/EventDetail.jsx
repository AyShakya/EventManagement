import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api, {csrfPost} from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";

/*
  EventDetail.jsx
  - Shows full details for a single event
  - Actions: like/unlike, register/attend, send feedback (link), post a query
  - Uses Tailwind classes consistent with the Coffee theme

  Expected backend endpoints (implement later):
    GET  /api/event/:id                    -> { event: { ... } }
    POST /api/event/:id/like               -> { liked: true/false, likes: number }
    POST /api/event/:id/attend             -> { success: true }
    GET  /api/event/:id/queries            -> { queries: [...] }
    POST /api/query/event/:id              -> { created: { ... } }

  Save this file as: src/pages/EventDetail.jsx
*/

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
  const [queryText, setQueryText] = useState("");
  const [qLoading, setQLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/event/${id}`);
        if (!mounted) return;
        const ev = res.data?.event || res.data; // tolerate both shapes
        setEvent(ev);
        setLikes(ev?.likes || 0);
        setLiked(Boolean(ev?.liked));
        setAttending(Boolean(ev?.isAttending));

        // load queries/comments (safe fallback)
        const qres = await api.get(`/api/event/${id}/queries`).catch(() => ({ data: { queries: [] } }));
        if (!mounted) return;
        setQueries(qres.data?.queries || []);
      } catch (e) {
        console.error(e);
        if (mounted) setErr(e?.response?.data?.message || "Failed to load event");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [id]);

  async function toggleLike() {
    if (!user) return navigate('/login');
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
    if (!user) return navigate('/login');
    try {
      const res = await api.post(`/api/event/${id}/attend`);
      if (res.data && res.data.success) setAttending(true);
    } catch (e) {
      console.error(e);
    }
  }

  async function postQuery(e) {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (!queryText || queryText.trim().length < 5) return;
    setQLoading(true);
    try {
      const res = await api.post(`/api/query/event/${id}`, { message: queryText.trim(), subject: `Query about ${event?.title || ''}` });
      const created = res.data?.created || res.data;
      if (created) {
        setQueries(prev => [created, ...prev]);
        setQueryText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Loading event...</div>;
  if (err) return <div className="p-8 text-center text-red-600">{err}</div>;
  if (!event) return <div className="p-8 text-center">Event not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-cream to-coffee-mid text-gray-900 py-10">
      <div className="app-container">
        <div className="bg-white rounded-lg p-6 shadow card-coffee">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: main content */}
            <div className="lg:col-span-2">
              <h1 className="text-2xl font-bold text-coffee-dark">{event.title}</h1>
              <div className="text-sm text-gray-500 mt-1">{event.location} • {new Date(event.postedAt).toLocaleDateString()}</div>

              {/* images */}
              {event.images && event.images.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {event.images.map((src, idx) => (
                    <div key={idx} className="h-56 bg-gray-100 rounded overflow-hidden">
                      <img src={src} alt={`${event.title}-${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 h-56 bg-gray-100 rounded flex items-center justify-center text-gray-500">No images</div>
              )}

              <div className="mt-6 prose prose-sm max-w-none text-gray-700">
                {/* description (safe simple render) */}
                <p>{event.description}</p>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button onClick={toggleLike} className="px-3 py-2 rounded shadow bg-coffee-dark text-coffee-cream">
                  {liked ? 'Unlike' : 'Like'} • {likes}
                </button>

                <button onClick={handleAttend} disabled={attending} className={`px-3 py-2 rounded ${attending ? 'bg-gray-300 text-gray-700' : 'bg-coffee-mid text-white'}`}>
                  {attending ? 'Registered' : 'Attend / Register'}
                </button>

                <Link to={`/events/${id}/feedback`} className="px-3 py-2 rounded border">Send feedback</Link>

                <button onClick={() => { navigator.clipboard?.writeText(window.location.href); }} className="px-3 py-2 rounded border">Share</button>
              </div>

              {/* organizer */}
              <div className="mt-6 p-4 border rounded flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden">
                  {event.organizer?.avatarURL ? <img src={event.organizer.avatarURL} alt={event.organizer.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">O</div>}
                </div>
                <div>
                  <div className="font-medium">{event.organizer?.name || event.organizer?.userName || 'Organizer'}</div>
                  <div className="text-xs text-gray-500">{event.organizer?.email}</div>
                  {event.organizer?._id && <Link to={`/organizer/${event.organizer._id}`} className="text-xs text-coffee-mid">View profile</Link>}
                </div>
              </div>

            </div>

            {/* Right: side panel */}
            <aside className="space-y-4">
              <div className="bg-white p-4 rounded shadow card-coffee">
                <div className="text-sm text-gray-500">When</div>
                <div className="mt-1 font-medium">{event.startAt ? new Date(event.startAt).toLocaleString() : 'TBA'}</div>

                <div className="text-sm text-gray-500 mt-3">Capacity</div>
                <div className="mt-1">{event.capacity ? `${event.capacity} seats` : 'Open'}</div>

                <div className="text-sm text-gray-500 mt-3">Views</div>
                <div className="mt-1 font-medium">{event.views || 0}</div>
              </div>

              <div className="bg-white p-4 rounded shadow card-coffee">
                <h4 className="font-semibold mb-2">Questions & comments</h4>

                {queries.length === 0 ? (
                  <div className="text-gray-500 text-sm">No questions yet — be the first to ask.</div>
                ) : (
                  <ul className="space-y-2 max-h-48 overflow-auto">
                    {queries.map(q => (
                      <li key={q._id} className="p-2 border rounded">
                        <div className="text-sm font-medium">{q.subject || 'Question'}</div>
                        <div className="text-xs text-gray-400">{new Date(q.createdAt).toLocaleString()}</div>
                        <div className="text-sm text-gray-700 mt-1">{q.message}</div>
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={postQuery} className="mt-3">
                  <textarea value={queryText} onChange={e => setQueryText(e.target.value)} rows={3} placeholder="Ask a question or leave a comment" className="w-full px-3 py-2 border rounded" />
                  <div className="mt-2 flex gap-2">
                    <button type="submit" disabled={qLoading} className="bg-coffee-mid text-white px-3 py-1 rounded">Post</button>
                    <button type="button" onClick={() => setQueryText('')} className="px-3 py-1 rounded border">Clear</button>
                  </div>
                </form>

              </div>

            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
