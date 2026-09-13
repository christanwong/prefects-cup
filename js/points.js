import { HOUSES } from "./config.js";

export function computeTotals(events, miscPoints) {
  const totals = {};
  for (const house of HOUSES) {
    totals[house.key] = 0;
  }

  for (const event of Object.values(events || {})) {
    const points = event?.points || {};
    for (const house of HOUSES) {
      totals[house.key] += Number(points[house.key]) || 0;
    }
  }

  for (const house of HOUSES) {
    totals[house.key] += Number((miscPoints || {})[house.key]) || 0;
  }

  return totals;
}
