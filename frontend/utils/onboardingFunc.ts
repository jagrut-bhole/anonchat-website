import { DICEBEAR_BASE } from "@/constants/onboarding"

export default function buildPreviewUrl(style: string, seed: string, bgColor?: string) {
  const base = `${DICEBEAR_BASE}/${style}/svg?seed=${encodeURIComponent(seed)}`;
  if (bgColor) {
    return `${base}&backgroundColor=${bgColor.replace(/^#/, "")}`;
  }
  return base;
}