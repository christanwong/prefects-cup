import {
  db, auth, ref, get, set, onValue, remove, push,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification,
  signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup,
} from "../firebase.js";
import { emptyPoints } from "../config.js";
import { seasonYears } from "../season.js";
import { renderEventEditor, pointsGrid } from "../components/event-editor.js";
import { renderAdmins } from "../components/admins.js";
import { normalizeEmail, emailKey, isValidEmail } from "../admins-util.js";

document.getElementById("year").textContent = seasonYears();

const sections = {
  login: document.getElementById("login-section"),
  verify: document.getElementById("verify-section"),
  notAdmin: document.getElementById("not-admin-section"),
  user: document.getElementById("user-section"),
  editor: document.getElementById("editor-section"),
};

function show(active) {
  for (const [name, element] of Object.entries(sections)) {
    element.style.display = name === active || (active === "admin" && (name === "user" || name === "editor")) ? "block" : "none";
  }
}

let currentEmail = "";
let activeUid = null;

onAuthStateChanged(auth, async (user) => {
  if (started && user && user.uid === activeUid) return;
  if (started && (!user || user.uid !== activeUid)) {
    window.location.reload();
    return;
  }

  if (!user) {
    show("login");
    return;
  }

  if (!user.emailVerified) {
    document.getElementById("verify-email").textContent = user.email;
    show("verify");
    return;
  }

  activeUid = user.uid;
  currentEmail = normalizeEmail(user.email);

  try {
    await get(ref(db, "admins"));
  } catch {
    document.getElementById("not-admin-email").textContent = user.email;
    show("notAdmin");
    return;
  }

  document.getElementById("user-email").textContent = user.email;
  show("admin");
  enterAdmin();
});

document.getElementById("login-google").addEventListener("click", () => {
  signInWithPopup(auth, new GoogleAuthProvider()).catch((error) => alert(error.message));
});

document.getElementById("login").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password).catch((error) => alert(error.message));
});

document.getElementById("signup").addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  createUserWithEmailAndPassword(auth, email, password)
    .then((credential) => sendEmailVerification(credential.user))
    .catch((error) => alert(error.message));
});

document.getElementById("resend-verification").addEventListener("click", () => {
  if (!auth.currentUser) return;
  sendEmailVerification(auth.currentUser)
    .then(() => alert("Verification email sent."))
    .catch((error) => alert(error.message));
});

document.getElementById("logout").addEventListener("click", () => signOut(auth));
document.getElementById("logout-not-admin").addEventListener("click", () => signOut(auth));
document.getElementById("logout-verify").addEventListener("click", () => signOut(auth));

let started = false;

function enterAdmin() {
  if (started) return;
  started = true;

  wireEditor();
  wireAdmins();
}

function wireAdmins() {
  const container = document.getElementById("admins");

  const handlers = {
    get currentEmail() { return currentEmail; },
    onAdd: (value) => {
      const email = normalizeEmail(value);
      if (!isValidEmail(email)) {
        alert("Enter a valid email address.");
        return false;
      }
      set(ref(db, `admins/${emailKey(email)}`), email);
      return true;
    },
    onRemove: (email) => {
      if (email === currentEmail) return;
      if (confirm(`Remove ${email} as an admin? They'll lose access immediately.`)) {
        remove(ref(db, `admins/${emailKey(email)}`));
      }
    },
  };

  onValue(ref(db, "admins"), (snapshot) => {
    renderAdmins(container, snapshot.val() || {}, handlers);
  });
}

const draft = { events: {}, miscPoints: {}, countdown: 0 };
let dirty = false;

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

async function wireEditor() {
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
