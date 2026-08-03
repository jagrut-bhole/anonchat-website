export enum AvatarStyle {
  TOON_HEAD = "toon-head",
  NOTIONISTS = "notionists",
  PERSONAS = "personas",
  AVATAAARS = "avataaars",
  MICAH = "micah",
}

export const VALID_AVATAR_STYLES = [
  AvatarStyle.TOON_HEAD,
  AvatarStyle.NOTIONISTS,
  AvatarStyle.PERSONAS,
  AvatarStyle.AVATAAARS,
  AvatarStyle.MICAH,
] as const;

export const DICEBEAR_VERSION = "10.x";
export const DICEBEAR_BASE_URL = `https://api.dicebear.com/${DICEBEAR_VERSION}`;

export function buildAvatarUrl(
  style: string,
  seed: string,
  backgroundColor?: string,
): string {
  const base = `${DICEBEAR_BASE_URL}/${style}/svg?seed=${encodeURIComponent(seed)}`;
  if (backgroundColor) {
    // Strip leading '#' if present
    const bg = backgroundColor.replace(/^#/, "");
    return `${base}&backgroundColor=${bg}`;
  }
  return base;
}