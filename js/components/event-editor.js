import { HOUSES, STATUSES, formatDate } from "../config.js";
import { eventsByStatus } from "../events-util.js";

const EDITOR_STATUSES = ["ongoing", "upcoming", "completed"];

export function renderEventEditor(container, events, handlers) {
  container.innerHTML = "";

  const list = document.createElement("div");
  container.appendChild(list);

  const groups = eventsByStatus(events, EDITOR_STATUSES);
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  if (total === 0) {
    list.appendChild(emptyMessage());
  } else {
    for (const group of groups) {
      if (group.items.length === 0) continue;

      const heading = document.createElement("h3");
      heading.className = "group-title mt-5";
      heading.textContent = group.label;
      list.appendChild(heading);

      for (const event of group.items) {
        list.appendChild(createEventCard(event.id, event, handlers, false));
      }
    }
  }

  const addButton = document.createElement("button");
  addButton.className = "button is-link mt-4";
  addButton.textContent = "Add Event";
  addButton.addEventListener("click", () => {
    const empty = list.querySelector(".empty-message");
    if (empty) empty.remove();
    const created = handlers.onCreate();
    list.appendChild(createEventCard(created.id, created.event, handlers, true));
  });
  container.appendChild(addButton);
}

function emptyMessage() {
  const empty = document.createElement("p");
  empty.className = "muted mb-4 empty-message";
  empty.textContent = "No events yet. Add one below.";
  return empty;
}

export function createEventCard(id, event, handlers, open) {
  const details = document.createElement("details");
  details.className = "box event-entry";
  details.open = open;

  const summary = document.createElement("summary");
  summary.className = "event-summary";
  summary.textContent = event.title || "Untitled event";
  if (event.date) {
    const date = document.createElement("span");
    date.className = "muted ml-2";
    date.textContent = formatDate(event.date);
    summary.appendChild(date);
  }
  details.appendChild(summary);

  details.appendChild(
    field("Title", textInput(event.title || "", (value) => {
      summary.firstChild.textContent = value || "Untitled event";
      handlers.onChange(id, { title: value });
    }))
  );
  details.appendChild(
    field("Description", textArea(event.description || "", (value) => handlers.onChange(id, { description: value })))
  );

  const row = document.createElement("div");
  row.className = "columns";
  row.appendChild(column(field("Status", statusSelect(event.status, (value) => handlers.onChange(id, { status: value })))));
  row.appendChild(column(field("Date", dateInput(event.date, (value) => handlers.onChange(id, { date: value })))));
  details.appendChild(row);

  const pointsLabel = document.createElement("label");
  pointsLabel.className = "label";
  pointsLabel.textContent = "Points";
  details.appendChild(pointsLabel);
  details.appendChild(pointsGrid(event.points, (house, value) => handlers.onChange(id, { [`points/${house}`]: value })));

  const remove = document.createElement("button");
  remove.className = "button is-danger is-small mt-4";
  remove.textContent = "Delete Event";
  remove.addEventListener("click", () => {
    if (confirm(`Delete "${event.title || "this event"}"? This takes effect when you publish.`)) {
      handlers.onDelete(id);
      details.remove();
    }
  });
  details.appendChild(remove);

  return details;
}

export function pointsGrid(points, onChange) {
  const grid = document.createElement("div");
  grid.className = "columns is-multiline";

  for (const house of HOUSES) {
    const col = document.createElement("div");
    col.className = "column is-one-fifth";
    col.appendChild(field(house.label, pointsInput(house, (points || {})[house.key], onChange)));
    grid.appendChild(col);
  }

  return grid;
}

function pointsInput(house, value, onChange) {
  const input = document.createElement("input");
  input.className = "input";
  input.type = "number";
  input.value = Number(value) || 0;
  input.addEventListener("input", () => onChange(house.key, Number(input.value) || 0));
  return input;
}

function field(labelText, control) {
  const wrapper = document.createElement("div");
  wrapper.className = "field";
  const label = document.createElement("label");
  label.className = "label";
  label.textContent = labelText;
  const controlWrap = document.createElement("div");
  controlWrap.className = "control";
  controlWrap.appendChild(control);
  wrapper.append(label, controlWrap);
  return wrapper;
}

function column(child) {
  const col = document.createElement("div");
  col.className = "column";
  col.appendChild(child);
  return col;
}

function textInput(value, onChange) {
  const input = document.createElement("input");
  input.className = "input";
  input.type = "text";
  input.value = value;
  input.addEventListener("input", () => onChange(input.value));
  return input;
}

function textArea(value, onChange) {
  const area = document.createElement("textarea");
  area.className = "textarea";
  area.rows = 2;
  area.value = value;
  area.addEventListener("input", () => onChange(area.value));
  return area;
}

function statusSelect(value, onChange) {
  const wrapper = document.createElement("div");
  wrapper.className = "select is-fullwidth";
  const select = document.createElement("select");
  for (const status of STATUSES) {
    const option = document.createElement("option");
    option.value = status.key;
    option.textContent = status.label;
    if (status.key === value) option.selected = true;
    select.appendChild(option);
  }
  select.addEventListener("change", () => onChange(select.value));
  wrapper.appendChild(select);
  return wrapper;
}

function dateInput(ms, onChange) {
  const input = document.createElement("input");
  input.className = "input";
  input.type = "date";
  input.value = msToDateValue(ms);
  input.addEventListener("change", () => {
    onChange(input.value ? new Date(input.value).getTime() : null);
  });
  return input;
}

function msToDateValue(ms) {
  if (!ms) return "";
  const d = new Date(Number(ms));
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}
