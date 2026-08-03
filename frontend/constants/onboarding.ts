import "dotenv/config";

export const USERNAME_STATUS = {
  IDLE: "idle",
  CHECKING: "checking",
  AVAILABLE: "available",
  TAKEN: "taken",
  INVALID: "invalid",
} as const;

export type UsernameStatus =
  (typeof USERNAME_STATUS)[keyof typeof USERNAME_STATUS];

// Dicebear base URL
export const DICEBEAR_BASE = "https://api.dicebear.com/10.x";

// Avatar styles
export const AVATAR_STYLES = [
  { id: "toon-head", label: "Toon Head" },
  { id: "notionists", label: "Notionists" },
  { id: "personas", label: "Personas" },
  { id: "avataaars", label: "Avataaars" },
  { id: "micah", label: "Micah" },
] as const;

// Background color state
export const DEFAULT_COLOR = "#007AFF";

// location 
export const LOCATION_STATUS = {
  IDLE: "idle",
  REQUESTING: "requesting",
  GRANTED: "granted",
  DENIED: "denied",
} as const;

export type LocationStatus =
  (typeof LOCATION_STATUS)[keyof typeof LOCATION_STATUS];

export const DRAFT_STORAGE_KEY = "anonchat_onboarding_draft"

// permission state

export const LOCATION_QUERY_NAME = "geolocation"

export const PERMISSION_STATE = {
  GRANTED: "granted",
  DENIED: "denied",
  UNDEFINED: "undefined",
  REQUESTING: "requesting"
} as const;
