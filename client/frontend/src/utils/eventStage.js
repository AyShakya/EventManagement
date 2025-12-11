export function getEventStage(startAt) {
  if (!startAt) {
    return { stage: "no-date", label: "Unscheduled" };
  }

  const now = new Date();
  const s = new Date(startAt);

  if (s > now) {
    return { stage: "upcoming", label: "Upcoming" };
  }

  return { stage: "completed", label: "Completed" };
}
