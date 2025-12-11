// Helper: normalize images/imageURL for frontend
function normalizeEventImages(ev) {
  const images =
    Array.isArray(ev.images) && ev.images.length
      ? ev.images
      : ev.imageURL
      ? [ev.imageURL]
      : [];

  const imageURL = images[0] || null;
  return { ...ev, images, imageURL };
}

function computeStage(startAt) {
  if (!startAt) {
    return { stage: "unscheduled", hasStarted: false };
  }

  const now = new Date();
  const startDate = new Date(startAt);

  if (startDate > now) {
    return { stage: "upcoming", hasStarted: false };
  }

  return { stage: "completed", hasStarted: true };
}

// Main mapper: everything the frontend should see for an Event
function mapEventForClient(ev) {
  const normalized = normalizeEventImages(ev);
  const stageInfo = computeStage(normalized.startAt);
  return { ...normalized, ...stageInfo };
}

module.exports = {
  mapEventForClient,
  normalizeEventImages,
  computeStage,
};