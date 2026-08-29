export const NAME_RE = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
export const ID_RE = /^[A-Za-z0-9_-]+$/;
export const PHONE_RE = /^03\d{9}$/;

export function validateName(value, label = "Name") {
  const v = String(value ?? "").trim();
  if (!v) return `${label} is required.`;
  if (!NAME_RE.test(v)) return `${label} must contain alphabets only with single spaces between words.`;
  if (v.length < 2 || v.length > 50) return `${label} must be between 2 and 50 characters.`;
  return "";
}

export function validateEmail(value) {
  const v = String(value ?? "").trim().toLowerCase();
  if (!v) return "Email is required.";
  if (/\s/.test(v)) return "Email cannot contain spaces.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
  return "";
}

export function validatePassword(value) {
  const v = String(value ?? "");
  if (!v) return "Password is required.";
  if (v.length < 8 || v.length > 72) return "Password must be 8–72 characters.";
  if (/\s/.test(v)) return "Password cannot contain spaces.";
  if (!/[A-Z]/.test(v)) return "Password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(v)) return "Password must contain at least one lowercase letter.";
  if (!/\d/.test(v)) return "Password must contain at least one number.";
  if (!/[^A-Za-z0-9]/.test(v)) return "Password must contain at least one special character.";
  return "";
}

export function validateIdentifier(value, label = "ID") {
  const v = String(value ?? "").trim();
  if (!v) return `${label} is required.`;
  if (!ID_RE.test(v)) return `${label} may contain only letters, numbers, _ or -.`;
  if (v.length < 3 || v.length > 20) return `${label} must be between 3 and 20 characters.`;
  return "";
}

export function validatePhone(value) {
  const v = String(value ?? "").trim();
  if (!v) return "Phone is required.";
  if (!PHONE_RE.test(v)) return "Phone must be in 03XXXXXXXXX format.";
  return "";
}

export function validateRange(value, label, min, max) {
  if (value === "" || value === null || value === undefined) return `${label} is required.`;
  const n = Number(value);
  if (!Number.isFinite(n)) return `${label} must be a number.`;
  if (n < min || n > max) return `${label} must be between ${min} and ${max}.`;
  return "";
}

export function apiErrorMessage(error, fallback = "Something went wrong.") {
  const data = error?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length) {
    return data.errors.map((item) => {
      const loc = Array.isArray(item.loc) ? item.loc.filter((x) => x !== "body").join(" → ") : "";
      return loc ? `${loc}: ${item.msg}` : item.msg;
    }).join(" | ");
  }
  return data?.message || data?.detail || error?.message || fallback;
}
