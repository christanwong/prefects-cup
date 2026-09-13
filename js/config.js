export const HOUSES = [
  { key: "bremners",  label: "Bremner's",  color: "rgba(255, 0, 0, 0.6)" },
  { key: "howards",   label: "Howard's",   color: "rgba(255, 127, 80, 0.6)" },
  { key: "jacksons",  label: "Jackson's",  color: "rgba(230, 200, 0, 0.6)" },
  { key: "martlands", label: "Martland's", color: "rgba(153, 102, 255, 0.6)" },
  { key: "mchughs",   label: "McHugh's",   color: "rgba(165, 42, 42, 0.6)" },
  { key: "mowbrays",  label: "Mowbray's",  color: "rgba(100, 100, 100, 0.6)" },
  { key: "orrs",      label: "Orr's",      color: "rgba(0, 160, 220, 0.6)" },
  { key: "scaddings", label: "Scadding's", color: "rgba(75, 192, 192, 0.6)" },
  { key: "seatons",   label: "Seaton's",   color: "rgba(0, 190, 60, 0.6)" },
  { key: "wedds",     label: "Wedd's",     color: "rgba(40, 40, 40, 0.6)" },
];

export const STATUSES = [
  { key: "upcoming",  label: "Upcoming" },
  { key: "ongoing",   label: "Ongoing" },
  { key: "completed", label: "Completed" },
];

export function emptyPoints() {
  const points = {};
  for (const house of HOUSES) {
    points[house.key] = 0;
  }
  return points;
}

export function formatDate(ms) {
  if (!ms) return "";
  return new Date(Number(ms)).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
}
