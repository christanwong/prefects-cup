import { db, ref, onValue } from "../firebase.js";
import { computeTotals } from "../points.js";
import { createPointsChart } from "../components/points-chart.js";
import { renderLeaderboard } from "../components/leaderboard.js";
import { renderEventsList } from "../components/events-list.js";
import { createCountdown } from "../components/countdown.js";
import { seasonYears } from "../season.js";

const chart = createPointsChart(document.getElementById("graph"));
const countdown = createCountdown(document.getElementById("info-block"));
const leaderboardContainer = document.getElementById("leaderboard");
const eventsContainer = document.getElementById("events");

document.getElementById("year").textContent = seasonYears();

let events = {};
let miscPoints = {};
let deadline = null;

function refresh() {
  const totals = computeTotals(events, miscPoints);
  chart.update(totals);
  renderLeaderboard(leaderboardContainer, totals);
  renderEventsList(eventsContainer, events);
  countdown.render(deadline, totals);
}

onValue(ref(db, "public/events"), (snapshot) => {
  events = snapshot.val() || {};
  refresh();
});

onValue(ref(db, "public/miscPoints"), (snapshot) => {
  miscPoints = snapshot.val() || {};
  refresh();
});

onValue(ref(db, "public/countdown"), (snapshot) => {
  deadline = Number(snapshot.val()) || null;
  refresh();
});
