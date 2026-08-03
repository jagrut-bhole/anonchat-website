"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Loader2,
  RefreshCw,
  Check,
  X,
  ChevronDown,
  ArrowRight,
  Palette,
  User,
  CircleCheckBig,
  MapPin,
  Navigation,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ColorPicker } from "@/components/ui/color-picker";
import {
  generateAvatarSeeds,
  checkUsernameAvailability,
  completeOnboardingFull,
  type AvatarOption,
} from "@/lib/auth-api";
import { PAGE_ROUTES } from "@/lib/route";
import Image from "next/image";
import {
  USERNAME_STATUS,
  type UsernameStatus,
  AVATAR_STYLES,
  DEFAULT_COLOR,
  LOCATION_STATUS,
  type LocationStatus,
  DRAFT_STORAGE_KEY,
  PERMISSION_STATE,
  LOCATION_QUERY_NAME,
} from "@/constants/onboarding";
import { toastMessage } from "@/constants/toast";

// Function
import buildPreviewUrl from "@/utils/onboardingFunc";

function getInitialDraft() {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// ─── Component ──────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();

  // Avatar selection state
  const [activeStyleIndex, setActiveStyleIndex] = useState(0);
  const [avatarsMap, setAvatarsMap] = useState<Record<string, AvatarOption[]>>(
    {},
  );
  const [loadingStyle, setLoadingStyle] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const [selectedAvatar, setSelectedAvatar] = useState<{
    style: string;
    seed: string;
  } | null>(() => {
    const draft = getInitialDraft();
    return draft?.selectedAvatar?.style && draft?.selectedAvatar?.seed
      ? draft.selectedAvatar
      : null;
  });

  // Background color state
  const [bgColor, setBgColor] = useState<string>(() => {
    const draft = getInitialDraft();
    return draft?.bgColor || DEFAULT_COLOR;
  });

  // Username state
  const [username, setUsername] = useState<string>(() => {
    const draft = getInitialDraft();
    return draft?.username ? draft.username.toLowerCase() : "";
  });
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>(
    USERNAME_STATUS.IDLE,
  );

  // Distance slider state
  const [discoveryRadius, setDiscoveryRadius] = useState<number>(() => {
    const draft = getInitialDraft();
    return typeof draft?.discoveryRadius === "number"
      ? draft.discoveryRadius
      : 25;
  });

  // Location state
  const [locationStatus, setLocationStatus] = useState<LocationStatus>(
    LOCATION_STATUS.IDLE,
  );
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);

  const activeStyle = AVATAR_STYLES[activeStyleIndex];

  // ─── Save draft to localStorage on change ─────────────

  useEffect(() => {
    try {
      const draft = {
        selectedAvatar,
        bgColor,
        username,
        discoveryRadius,
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch (err) {
      console.error("Failed to save onboarding draft:", err);
    }
  }, [selectedAvatar, bgColor, username, discoveryRadius]);

  // ─── Username validation & availability check ──────────

  useEffect(() => {
    if (!username) {
      setUsernameStatus(USERNAME_STATUS.IDLE);
      return;
    }

    const lowered = username.toLowerCase();
    if (lowered.length < 3) {
      setUsernameStatus(USERNAME_STATUS.INVALID);
      return;
    }

    if (!/^[a-z0-9_]+$/.test(lowered)) {
      setUsernameStatus(USERNAME_STATUS.INVALID);
      return;
    }

    // Set to IDLE while typing so spinner doesn't flicker on every keystroke
    setUsernameStatus(USERNAME_STATUS.IDLE);

    const timer = setTimeout(async () => {
      setUsernameStatus(USERNAME_STATUS.CHECKING);
      const result = await checkUsernameAvailability(lowered);
      if (result.error) {
        setUsernameStatus(USERNAME_STATUS.TAKEN);
      } else {
        setUsernameStatus(USERNAME_STATUS.AVAILABLE);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleUsernameChange = (value: string) => {
    setUsername(value.toLowerCase());
  };

  // ─── Load avatars for the active style ──────────────────

  const loadAvatarsForStyle = useCallback(async (styleId: string) => {
    setLoadingStyle(styleId);
    const result = await generateAvatarSeeds(styleId);
    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      setAvatarsMap((prev) => ({
        ...prev,
        [styleId]: result.data!.avatars,
      }));
    }
    setLoadingStyle(null);
    setInitialLoading(false);
  }, []);

  const loadedStylesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const styleId = activeStyle.id;
    if (!avatarsMap[styleId] && !loadedStylesRef.current.has(styleId)) {
      loadedStylesRef.current.add(styleId);
      void loadAvatarsForStyle(styleId);
    }
  }, [activeStyleIndex, activeStyle.id, avatarsMap, loadAvatarsForStyle]);

  // ─── Regenerate seeds for current style ─────────────────

  const handleRegenerate = () => {
    loadAvatarsForStyle(activeStyle.id);
  };

  // ─── Select / Deselect avatar ───────────────────────────

  const handleSelectAvatar = (style: string, seed: string) => {
    setSelectedAvatar({ style, seed });
  };

  const handleDeselectAvatar = () => {
    setSelectedAvatar(null);
  };

  // ─── Submit ────────────────────────────────────────────

  const canSubmit =
    selectedAvatar !== null &&
    usernameStatus === USERNAME_STATUS.AVAILABLE &&
    username.length >= 3 &&
    !submitting;

  // ─── Location handler ──────────────────────────────────

  const handleRequestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setLocationStatus(PERMISSION_STATE.DENIED);
      return;
    }

    setLocationStatus(PERMISSION_STATE.REQUESTING);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus(PERMISSION_STATE.GRANTED);
      },
      () => {
        setLocationStatus(PERMISSION_STATE.DENIED);
      },
    );
  }, []);

  // ─── Auto-detect location permission status ───────────

  useEffect(() => {
    if (typeof window !== "undefined" && "permissions" in navigator) {
      navigator.permissions
        .query({ name: LOCATION_QUERY_NAME })
        .then((permissionStatus) => {
          if (permissionStatus.state === PERMISSION_STATE.GRANTED) {
            handleRequestLocation();
          } else if (permissionStatus.state === PERMISSION_STATE.DENIED) {
            setLocationStatus(PERMISSION_STATE.DENIED);
          }

          permissionStatus.onchange = () => {
            if (permissionStatus.state === PERMISSION_STATE.GRANTED) {
              handleRequestLocation();
            } else if (permissionStatus.state === PERMISSION_STATE.DENIED) {
              setLocationStatus(PERMISSION_STATE.DENIED);
            }
          };
        })
        .catch(() => {});
    }
  }, [handleRequestLocation]);

  const handleSubmit = async () => {
    if (!canSubmit || !selectedAvatar) return;

    setSubmitting(true);
    const result = await completeOnboardingFull({
      username,
      avatarStyle: selectedAvatar.style,
      avatarSeed: selectedAvatar.seed,
      avatarBackgroundColor: bgColor,
      selectedDistance: discoveryRadius,
      ...(userLocation
        ? { latitude: userLocation.lat, longitude: userLocation.lng }
        : {}),
    });

    if (result.error) {
      toast.error(result.error);
      setSubmitting(false);
      return;
    }

    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear onboarding draft:", err);
    }

    toast.success(toastMessage.WELCOME);
    router.push(PAGE_ROUTES.DASHBOARD);
    router.refresh();
  };

  // ─── Current avatars ───────────────────────────────────

  const currentAvatars = avatarsMap[activeStyle.id] || [];
  const isLoadingCurrent = initialLoading || loadingStyle === activeStyle.id;

  return (
    <main className="min-h-screen bg-zinc-950 text-white selection:bg-white selection:text-zinc-950">
      {/* Top Bar */}
      <header className="border-b border-white/10 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-white">
              AnonChat Profile Setup
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <AnimatePresence mode="wait">
          {!selectedAvatar ? (
            /* ─────────── STEP 1: Avatar Selection ─────────── */
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Choose your avatar
                </h1>
                <p className="mt-1.5 text-sm text-zinc-400">
                  Pick a style, then choose an avatar that represents you.
                </p>
              </div>

              {/* Style Tabs */}
              <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {AVATAR_STYLES.map((style, index) => (
                  <button
                    key={style.id}
                    onClick={() => setActiveStyleIndex(index)}
                    className={`shrink-0 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
                      index === activeStyleIndex
                        ? "bg-white text-zinc-950 shadow-md shadow-white/10"
                        : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>

              {/* Avatar Cards Grid */}
              <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-sm min-h-70">
                {isLoadingCurrent ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={`skeleton-${i}`}
                          className="aspect-square rounded-xl bg-zinc-800/60 animate-pulse border border-white/5 flex items-center justify-center"
                        >
                          <Loader2 className="size-5 animate-spin text-zinc-600" />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center pt-2">
                      <span className="text-xs text-zinc-500 font-medium">
                        Generating unique avatars...
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                      {currentAvatars.map((avatar, i) => (
                        <motion.button
                          key={`${activeStyle.id}-${avatar.seed}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.2,
                            delay: i * 0.05,
                          }}
                          onClick={() =>
                            handleSelectAvatar(activeStyle.id, avatar.seed)
                          }
                          className="group relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900 p-3 transition-all duration-200 hover:border-white/30 hover:bg-zinc-800 hover:shadow-xl cursor-pointer"
                        >
                          <div className="aspect-square w-full rounded-lg bg-zinc-950/50 flex items-center justify-center overflow-hidden">
                            <Image
                              src={avatar.url}
                              alt={`Avatar option ${i + 1}`}
                              className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                              width={200}
                              height={200}
                              unoptimized
                            />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60 opacity-0 transition-opacity group-hover:opacity-100 rounded-xl">
                            <div className="flex size-9 items-center justify-center rounded-full bg-white text-zinc-950 shadow-md">
                              <Check className="size-5" />
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    <div className="mt-6 flex justify-center">
                      <Button
                        variant="ghost"
                        onClick={handleRegenerate}
                        disabled={isLoadingCurrent}
                        className="text-zinc-400 hover:bg-zinc-800 hover:text-white border border-white/5"
                      >
                        <RefreshCw
                          className={`size-4 mr-2 ${isLoadingCurrent ? "animate-spin" : ""}`}
                        />
                        Generate More Avatars
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            /* ─────────── STEP 2: Customization + Username ─────────── */
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Back button */}
              <button
                onClick={handleDeselectAvatar}
                className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white cursor-pointer"
              >
                ← Choose a different avatar
              </button>

              {/* Selected Avatar Display */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 250,
                    damping: 22,
                  }}
                  className="relative mb-6"
                >
                  <div
                    className="rounded-3xl p-1.5 shadow-2xl transition-colors duration-300 border border-white/10"
                    style={{
                      background: `linear-gradient(135deg, ${bgColor}40, ${bgColor}15)`,
                      boxShadow: `0 0 50px ${bgColor}25`,
                    }}
                  >
                    <div
                      className="overflow-hidden rounded-2xl transition-colors duration-300 size-44 sm:size-52 flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: bgColor }}
                    >
                      <Image
                        src={buildPreviewUrl(
                          selectedAvatar.style,
                          selectedAvatar.seed,
                        )}
                        alt="Selected avatar preview"
                        className="size-full object-contain"
                        width={200}
                        height={200}
                        unoptimized
                      />
                    </div>
                  </div>

                  {/* Style badge */}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 px-3.5 py-1 text-xs font-semibold text-zinc-300 border border-white/10 shadow-md">
                    {
                      AVATAR_STYLES.find((s) => s.id === selectedAvatar.style)
                        ?.label
                    }
                  </div>
                </motion.div>

                {/* Background Color Picker Integration */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="w-full max-w-sm"
                >
                  <ColorPicker
                    value={bgColor as `#${string}`}
                    onValueChange={(val) => setBgColor(val.hex.toUpperCase())}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm transition-colors hover:bg-zinc-850 hover:border-white/20 cursor-pointer shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Palette className="size-4 text-zinc-400" />
                        <span className="text-zinc-200 font-medium">
                          Background Color
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="size-5 rounded-md border border-white/20 shadow-inner transition-colors duration-200"
                          style={{ backgroundColor: bgColor }}
                        />
                        <span className="font-mono text-xs text-zinc-400 uppercase font-semibold">
                          {bgColor}
                        </span>
                        <ChevronDown className="size-4 text-zinc-500" />
                      </div>
                    </button>
                  </ColorPicker>
                </motion.div>
              </div>

              {/* Username Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mx-auto max-w-sm space-y-3"
              >
                <Label
                  htmlFor="username"
                  className="flex items-center gap-2 text-zinc-200 font-medium"
                >
                  <User className="size-4 text-zinc-400" />
                  Username
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="Choose a username..."
                    maxLength={20}
                    autoComplete="off"
                    className="h-11 border-white/10 bg-zinc-900 pr-10 text-white placeholder:text-zinc-500 rounded-xl font-medium focus-visible:ring-white/20"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus === USERNAME_STATUS.CHECKING && (
                      <Loader2 className="size-4 animate-spin text-zinc-500" />
                    )}
                    {usernameStatus === USERNAME_STATUS.AVAILABLE && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <CircleCheckBig className="size-4 text-emerald-400" />
                      </motion.div>
                    )}
                    {usernameStatus === USERNAME_STATUS.TAKEN && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <X className="size-4 text-red-400" />
                      </motion.div>
                    )}
                    {usernameStatus === USERNAME_STATUS.INVALID && username.length > 0 && (
                      <X className="size-4 text-amber-400" />
                    )}
                  </div>
                </div>

                {/* Status messages */}
                <AnimatePresence mode="wait">
                  {usernameStatus === USERNAME_STATUS.AVAILABLE && (
                    <motion.p
                      key="available"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-emerald-400 font-medium"
                    >
                      Username is available!
                    </motion.p>
                  )}
                  {usernameStatus === USERNAME_STATUS.TAKEN && (
                    <motion.p
                      key="taken"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-red-400 font-medium"
                    >
                      Username is already taken
                    </motion.p>
                  )}
                  {usernameStatus === USERNAME_STATUS.INVALID && username.length > 0 && (
                    <motion.p
                      key="invalid"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-amber-400 font-medium"
                    >
                      {username.length < 3
                        ? "Must be at least 3 characters"
                        : "Only lowercase letters, numbers, and underscores"}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Distance Slider */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mx-auto max-w-sm space-y-4"
              >
                <div className="rounded-xl border border-white/20 bg-zinc-900 p-5 space-y-4 shadow-md">
                  <div className="flex items-center gap-2">
                    <Navigation className="size-4 text-zinc-400" />
                    <Label className="text-zinc-200 font-medium">
                      Group Discovery Radius
                    </Label>
                  </div>
                  <p className="text-sm text-zinc-400">
                    You will see groups under{" "}
                    <span className="font-semibold text-white">
                      {discoveryRadius} km
                    </span>
                  </p>
                  <Slider
                    min={5}
                    max={50}
                    step={1}
                    defaultValue={[25]}
                    value={[discoveryRadius]}
                    onValueChange={(val) => setDiscoveryRadius(val[0])}
                    aria-label="Group discovery radius"
                  />
                  <div className="flex justify-between text-xs text-zinc-400 font-medium">
                    <span>5 km</span>
                    <span>50 km</span>
                  </div>
                </div>
              </motion.div>

              {/* Location Permission */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mx-auto max-w-sm"
              >
                <div className="rounded-xl border border-white/20 bg-zinc-900 p-5 space-y-4 shadow-md">
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-zinc-400" />
                    <Label className="text-zinc-200 font-medium">
                      Location Access
                    </Label>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Allow us to get your current location so we could find
                    groups nearby you.
                  </p>

                  {locationStatus === LOCATION_STATUS.GRANTED ? (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                      <CircleCheckBig className="size-4 text-emerald-400" />
                      <span className="text-sm text-emerald-400 font-medium">
                        Location access granted
                      </span>
                    </div>
                  ) : (
                    <>
                      <Button
                        onClick={handleRequestLocation}
                        disabled={locationStatus === LOCATION_STATUS.REQUESTING}
                        className="w-full h-11 rounded-xl bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white border border-white/15 transition-all cursor-pointer font-medium"
                      >
                        {locationStatus === LOCATION_STATUS.REQUESTING ? (
                          <Loader2 className="size-4 animate-spin mr-2" />
                        ) : locationStatus === LOCATION_STATUS.DENIED ? (
                          <RefreshCw className="size-4 mr-2" />
                        ) : (
                          <MapPin className="size-4 mr-2" />
                        )}
                        {locationStatus === LOCATION_STATUS.REQUESTING
                          ? "Requesting..."
                          : locationStatus === LOCATION_STATUS.DENIED
                            ? "Try Again"
                            : "Allow Location Access"}
                      </Button>

                      {locationStatus === LOCATION_STATUS.DENIED && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 space-y-1 text-xs text-amber-300"
                        >
                          <p className="font-semibold text-amber-400">
                            Location access denied
                          </p>
                          <p className="text-zinc-300 leading-relaxed">
                            If blocked by your browser, click the site info /
                            lock icon in your browser address bar to allow
                            location permissions, then click{" "}
                            <strong className="text-white font-medium">
                              Try Again
                            </strong>
                            .
                          </p>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="mx-auto max-w-sm pt-2"
              >
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`h-12 w-full text-base font-semibold rounded-xl transition-all duration-300 ${
                    canSubmit
                      ? "bg-white text-zinc-950 hover:bg-zinc-100 shadow-lg shadow-white/10 cursor-pointer"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  {submitting ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <>
                      Go to Dashboard
                      <ArrowRight className="size-5 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
