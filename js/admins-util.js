export function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function emailKey(email) {
  return normalizeEmail(email).replace(/\./g, ",");
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}
