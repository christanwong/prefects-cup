import { HOUSES, formatDate } from "../config.js";
import { eventsByStatus } from "../events-util.js";

const HOME_STATUSES = ["ongoing", "upcoming"];

export function renderEventsList(container, events) {
  container.innerHTML = "";

  const groups = eventsByStatus(events, HOME_STATUSES).filter((group) => group.items.length);

  if (groups.length === 0) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No current or upcoming events.";
    container.appendChild(empty);
    return;
  }

  for (const group of groups) {
    const section = document.createElement("div");
    section.className = "events-group";

    const heading = document.createElement("h3");
    heading.className = "group-title";
    heading.textContent = group.label;
    section.appendChild(heading);

    const grid = document.createElement("div");
    grid.className = "events-grid";
    for (const event of group.items) {
      grid.appendChild(eventCard(event));
    }
    section.appendChild(grid);

    container.appendChild(section);
  }
}

function eventCard(event) {
  const card = document.createElement("div");
  card.className = "card event-card";

  const content = document.createElement("div");
  content.className = "card-content";

  const title = document.createElement("h4");
  title.className = "title is-5";
  title.textContent = event.title || "Untitled event";
  content.appendChild(title);

  if (event.date) {
    const date = document.createElement("p");
    date.className = "subtitle is-6 muted";
    date.textContent = formatDate(event.date);
    content.appendChild(date);
  }

  if (event.description) {
    const description = document.createElement("p");
    description.textContent = event.description;
    content.appendChild(description);
  }

  const leaders = topHouses(event.points);
  if (leaders) {
    const points = document.createElement("p");
    points.className = "muted mt-2";
    points.textContent = leaders;
    content.appendChild(points);
  }

  card.appendChild(content);
  return card;
}

function topHouses(points) {
  const scored = HOUSES
    .map((h) => ({ label: h.label, value: Number((points || {})[h.key]) || 0 }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value);

  if (scored.length === 0) return "";
  return scored.map((entry) => `${entry.label}: ${entry.value}`).join(" · ");
}
