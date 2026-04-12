import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../api/axiosClient";

export default function LikedEvents() {
  const [events, setEvents] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = 8;

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await api.get(
          `/api/user/me/liked?page=${page}&limit=${limit}`
        );
        setEvents(res.data?.likedEvents || []);
        setMeta(res.data?.meta || null);
      } catch (e) {
        console.error(e);
        setErr(
          e?.response?.data?.message || "Failed to load your liked events"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  function goToPage(p) {
    setSearchParams({ page: p });
  }

  return (
    <div className="min-h-[70vh] py-10 bg-[#fbfbe2]">
      <div className="app-container mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-5xl md:text-6xl font-semibold italic text-[#1f100d] font-serif">
              Liked events
            </h1>
            <p className="text-lg text-[#5a4d46] mt-2">
              All the events you&apos;ve saved with ❤️ in one place.
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center justify-center text-sm font-semibold uppercase tracking-widest px-6 py-3 rounded-full bg-[#eceac8] text-[#271310] hover:bg-[#33110e] hover:text-white transition shadow-sm"
          >
            Browse more
          </Link>
        </div>

        {err && (
          <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
            {err}
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-48 bg-[#f9f9ef] rounded-[2rem] shadow-sm animate-pulse border border-[#eceac8]"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-[#f9f9ef] rounded-[2.5rem] p-10 md:p-16 shadow-[0_20px_40px_rgba(39,29,19,0.08)] text-center border border-[#eceac8]">
            <h2 className="text-3xl font-semibold text-[#1f100d] italic font-serif mb-2">
              No liked events yet
            </h2>
            <p className="text-lg text-[#54443d]">
              Tap the ❤️ icon on any event to save it here for later.
            </p>
            <Link
              to="/events"
              className="inline-flex mt-8 text-base font-medium px-8 py-3 rounded-full bg-[#33110e] text-white hover:bg-[#4b1a15] transition shadow-lg"
            >
              Discover events
            </Link>
          </div>
        ) : (
          <>
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((ev) => (
                <div
                  key={ev._id}
                  className="bg-[#f9f9ef] rounded-[2rem] overflow-hidden shadow-[0_15px_35px_rgba(39,29,19,0.06)] border border-[#eceac8] flex flex-col sm:flex-row h-full transition hover:shadow-[0_20px_45px_rgba(39,29,19,0.12)]"
                >
                  {/* Thumbnail */}
                  <Link
                    to={`/events/${ev._id}`}
                    className="w-full sm:w-48 h-48 sm:h-full overflow-hidden bg-[#e8e7cc] flex-shrink-0"
                  >
                    {ev.imageURL || ev.images?.[0] ? (
                      <img
                        src={ev.imageURL || ev.images[0]}
                        alt={ev.title}
                        className="w-full h-full object-cover transition duration-500 hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs uppercase tracking-widest text-[#a5a08c]">
                        No image
                      </div>
                    )}
                  </Link>

                  {/* Main content */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-[10px] uppercase tracking-widest font-bold text-[#9f402d] bg-[#fdf2f0] px-2 py-0.5 rounded-full">
                          {ev.location}
                        </span>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#5c5048]">
                          {new Date(ev.postedAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-[#1f100d] line-clamp-1">
                        <Link
                          to={`/events/${ev._id}`}
                          className="hover:text-[#9f402d] transition"
                        >
                          {ev.title}
                        </Link>
                      </h3>

                      <p className="text-sm text-[#54443d] mt-2 line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs font-semibold text-[#5c5048]">
                        <span className="flex items-center gap-1.5">
                          <span className="text-[#9f402d]">❤️</span> {ev.likes ?? 0}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span>👁</span> {ev.views ?? 0}
                        </span>
                      </div>
                      <Link
                        to={`/events/${ev._id}`}
                        className="text-xs font-bold uppercase tracking-widest text-[#1f100d] hover:text-[#9f402d] transition"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={!meta.hasPrevPage}
                  className="w-12 h-12 rounded-full border border-[#eceac8] flex items-center justify-center bg-white text-[#1f100d] disabled:opacity-30 hover:bg-[#eceac8] transition"
                >
                  ←
                </button>
                <div className="text-sm font-semibold text-[#1f100d] bg-[#eceac8] px-5 py-2 rounded-full shadow-sm">
                  Page {meta.currentPage} of {meta.totalPages}
                </div>
                <button
                  onClick={() => goToPage(Math.min(meta.totalPages, page + 1))}
                  disabled={!meta.hasNextPage}
                  className="w-12 h-12 rounded-full border border-[#eceac8] flex items-center justify-center bg-white text-[#1f100d] disabled:opacity-30 hover:bg-[#eceac8] transition"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
