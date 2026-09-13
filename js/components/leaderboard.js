import { HOUSES } from "../config.js";

export function renderLeaderboard(container, totals) {
  const rows = HOUSES
    .map((house) => ({ label: house.label, value: Number(totals[house.key]) || 0 }))
    .sort((a, b) => b.value - a.value);

  const max = rows.length ? rows[0].value : 0;

  const list = document.createElement("ol");
  list.className = "leaderboard";

  rows.forEach((row, index) => {
    const item = document.createElement("li");
    item.className = "lb-row";
    if (max > 0 && row.value === max) item.classList.add("is-leader");

    item.appendChild(span("lb-rank", String(index + 1)));
    item.appendChild(span("lb-name", row.label));
    item.appendChild(span("lb-points", String(row.value)));
    list.appendChild(item);
  });

  const card = document.createElement("div");
  card.className = "card";
  const content = document.createElement("div");
  content.className = "card-content";
  content.appendChild(list);
  card.appendChild(content);

  container.innerHTML = "";
  container.appendChild(card);
}

function span(className, text) {
  const el = document.createElement("span");
  el.className = className;
  el.textContent = text;
  return el;
}
