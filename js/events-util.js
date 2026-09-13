import { STATUSES } from "./config.js";

export function eventsByStatus(events, statusKeys) {
  const all = Object.entries(events || {}).map(([id, event]) => ({ id, ...event }));

  return statusKeys.map((key) => ({
    key,
    label: STATUSES.find((status) => status.key === key)?.label || key,
    items: all
      .filter((event) => event.status === key)
      .sort((a, b) => (Number(a.date) || Infinity) - (Number(b.date) || Infinity)),
  }));
}
