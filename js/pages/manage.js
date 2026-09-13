import {
  db, auth, ref, get, set,
  signInWithEmailAndPassword, signOut, onAuthStateChanged, push,
} from "../firebase.js";
import { emptyPoints } from "../config.js";
import { seasonYears } from "../season.js";
import { renderEventEditor, pointsGrid } from "../components/event-editor.js";

document.getElementById("year").textContent = seasonYears();

const sections = {
  login: document.getElementById("login-section"),
  user: document.getElementById("user-section"),
  editor: document.getElementById("editor-section"),
};

function showLoggedOut() {
  sections.login.style.display = "block";
  sections.user.style.display = "none";
  sections.editor.style.display = "none";
}

function showLoggedIn(user) {
  sections.login.style.display = "none";
  sections.user.style.display = "block";
  sections.editor.style.display = "block";
  document.getElementById("user-email").textContent = user.email;
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    showLoggedIn(user);
    startEditing();
  } else {
    showLoggedOut();
  }
});

document.getElementById("login").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password).catch((error) => alert(error.message));
});

document.getElementById("logout").addEventListener("click", () => signOut(auth));

const draft = { events: {}, miscPoints: {}, countdown: 0 };
let dirty = false;
let started = false;

const publishButton = document.getElementById("publish");
const discardButton = document.getElementById("discard");
const indicator = document.getElementById("dirty-indicator");
const countdownInput = document.getElementById("countdown");

function markDirty() {
  dirty = true;
  publishButton.disabled = false;
  discardButton.disabled = false;
  indicator.textContent = "Unsaved changes";
}

function markClean() {
  dirty = false;
  publishButton.disabled = true;
  discardButton.disabled = true;
  indicator.textContent = "All changes published";
}

async function startEditing() {
  if (started) return;
  started = true;

  await loadDraft();
  renderAll();

  publishButton.addEventListener("click", publish);
  discardButton.addEventListener("click", discard);
  countdownInput.addEventListener("change", () => {
    draft.countdown = countdownInput.value ? new Date(countdownInput.value).getTime() : 0;
    markDirty();
  });
  window.addEventListener("beforeunload", (event) => {
    if (dirty) event.preventDefault();
  });
}

async function loadDraft() {
  const [events, miscPoints, countdown] = await Promise.all([
    get(ref(db, "public/events")),
    get(ref(db, "public/miscPoints")),
    get(ref(db, "public/countdown")),
  ]);
  draft.events = events.val() || {};
  draft.miscPoints = miscPoints.val() || {};
  draft.countdown = Number(countdown.val()) || 0;
}

function renderAll() {
  renderEventEditor(document.getElementById("events-editor"), draft.events, eventHandlers);

  const misc = document.getElementById("misc-points");
  misc.innerHTML = "";
  misc.appendChild(pointsGrid(draft.miscPoints, (house, value) => {
    draft.miscPoints[house] = value;
    markDirty();
  }));

  countdownInput.value = draft.countdown ? msToDateTimeValue(draft.countdown) : "";
  markClean();
}

const eventHandlers = {
  onChange: (id, patch) => {
    const event = draft.events[id];
    for (const [key, value] of Object.entries(patch)) {
      if (key.startsWith("points/")) {
        event.points[key.slice("points/".length)] = value;
      } else {
        event[key] = value;
      }
    }
    markDirty();
  },
  onCreate: () => {
    const id = push(ref(db, "public/events")).key;
    const event = {
      title: "New Event",
      description: "",
      status: "upcoming",
      date: null,
      points: emptyPoints(),
    };
    draft.events[id] = event;
    markDirty();
    return { id, event };
  },
  onDelete: (id) => {
    delete draft.events[id];
    markDirty();
  },
};

async function publish() {
  if (!confirm("Publish all changes to the live site?")) return;
  publishButton.disabled = true;
  try {
    await Promise.all([
      set(ref(db, "public/events"), draft.events),
      set(ref(db, "public/miscPoints"), draft.miscPoints),
      set(ref(db, "public/countdown"), draft.countdown),
    ]);
    renderAll();
  } catch (error) {
    alert(`Could not publish: ${error.message}`);
    publishButton.disabled = false;
  }
}

async function discard() {
  if (!confirm("Discard all unpublished changes?")) return;
  await loadDraft();
  renderAll();
}

function msToDateTimeValue(ms) {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
