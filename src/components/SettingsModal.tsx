import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Check } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AppearanceOption = "Light" | "Dark" | "System";
type ContrastOption = "Default" | "Increased";
type AccentOption = "Green" | "Blue" | "Grey" | "Yellow" | "Pink" | "Orange" | "Purple";

// 7 distinct colors — Green default, Grey replaces Teal
const ACCENT_PALETTE: Record<AccentOption, { hex: string; light: string; label: string }> = {
  Green:  { hex: "#22c55e", light: "rgba(34, 197,  94, 0.12)", label: "Green"  },
  Blue:   { hex: "#3b82f6", light: "rgba(59, 130, 246, 0.12)", label: "Blue"   },
  Grey:   { hex: "#71717a", light: "rgba(113,113, 122, 0.12)", label: "Grey"   },
  Yellow: { hex: "#eab308", light: "rgba(234,179,   8, 0.12)", label: "Yellow" },
  Pink:   { hex: "#ec4899", light: "rgba(236, 72, 153, 0.12)", label: "Pink"   },
  Orange: { hex: "#f97316", light: "rgba(249,115,  22, 0.12)", label: "Orange" },
  Purple: { hex: "#a855f7", light: "rgba(168, 85, 247, 0.12)", label: "Purple" },
};

const ACCENT_KEYS: AccentOption[] = ["Green", "Blue", "Grey", "Yellow", "Pink", "Orange", "Purple"];

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

/** Apply all three settings instantly to document root */
function applyToDOM(
  appearance: AppearanceOption,
  contrast: ContrastOption,
  accent: AccentOption
) {
  const root = document.documentElement;

  // ── Appearance ──────────────────────────────────────────────────
  root.classList.remove("dark", "light");
  if (appearance === "Dark") {
    root.classList.add("dark");
  } else if (appearance === "Light") {
    root.classList.add("light");
  } else {
    // System: follow OS preference
    root.classList.add(
      window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    );
  }

  // ── Contrast ─────────────────────────────────────────────────────
  root.classList.toggle("high-contrast", contrast === "Increased");

  // ── Accent colour ────────────────────────────────────────────────
  // Fallback to Green if accent key is stale (e.g. old "Teal" from localStorage)
  const paletteEntry = ACCENT_PALETTE[accent] ?? ACCENT_PALETTE["Green"];
  const safeAccent   = ACCENT_PALETTE[accent] ? accent : "Green";
  root.style.setProperty("--accent-color",       paletteEntry.hex);
  root.style.setProperty("--accent-color-light", paletteEntry.light);

  // Remove old accent classes, set new one
  ACCENT_KEYS.forEach((k) => root.classList.remove(`accent-${k.toLowerCase()}`));
  // Also clear any stale accent classes not in current palette
  ["teal"].forEach((old) => root.classList.remove(`accent-${old}`));
  root.classList.add(`accent-${safeAccent.toLowerCase()}`);
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [appearance, setAppearance] = useState<AppearanceOption>("System");
  const [contrast,   setContrast]   = useState<ContrastOption>("Default");
  const [accent,     setAccent]     = useState<AccentOption>("Green");

  // ── Load saved prefs when modal opens ───────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const savedAppearance =
      (localStorage.getItem("pref_appearance") || getCookie("appearance") || "System") as AppearanceOption;
    const savedContrast =
      (localStorage.getItem("pref_contrast")   || getCookie("contrast")   || "Default") as ContrastOption;
    const rawAccent = localStorage.getItem("pref_accent") || getCookie("accentColor") || "Green";
    // Migrate stale keys (e.g. "Teal" → "Green")
    const savedAccent = (ACCENT_PALETTE[rawAccent as AccentOption] ? rawAccent : "Green") as AccentOption;

    setAppearance(savedAppearance);
    setContrast(savedContrast);
    setAccent(savedAccent);
  }, [isOpen]);

  // ── Save handler ─────────────────────────────────────────────────
  const handleSave = () => {
    // Persist
    localStorage.setItem("pref_appearance", appearance);
    localStorage.setItem("pref_contrast",   contrast);
    localStorage.setItem("pref_accent",     accent);
    setCookie("appearance",  appearance);
    setCookie("contrast",    contrast);
    setCookie("accentColor", accent);

    // Apply immediately
    applyToDOM(appearance, contrast, accent);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,  scale: 1     }}
          exit={{    opacity: 0, y: 16, scale: 0.97  }}
          className="relative z-10 w-full max-w-[460px] rounded-[20px] border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              General Settings
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 dark:text-neutral-500 dark:hover:text-neutral-200 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-5 space-y-6">
            {/* ── Appearance ─────────────────────────────────────── */}
            <SegmentRow label="Appearance">
              {(["Light", "Dark", "System"] as AppearanceOption[]).map((opt) => (
                <SegmentBtn
                  key={opt}
                  active={appearance === opt}
                  onClick={() => setAppearance(opt)}
                >
                  {opt}
                </SegmentBtn>
              ))}
            </SegmentRow>

            {/* ── Contrast ───────────────────────────────────────── */}
            <SegmentRow label="Contrast">
              {(["Default", "Increased"] as ContrastOption[]).map((opt) => (
                <SegmentBtn
                  key={opt}
                  active={contrast === opt}
                  onClick={() => setContrast(opt)}
                >
                  {opt}
                </SegmentBtn>
              ))}
            </SegmentRow>

            {/* ── Accent colour ───────────────────────────────────── */}
            <div>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                Accent color
              </p>
              <div className="flex items-center gap-2.5 flex-wrap">
                {ACCENT_KEYS.map((key) => {
                  const { hex, label } = ACCENT_PALETTE[key];
                  const isActive = accent === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setAccent(key)}
                      title={label}
                      style={{ backgroundColor: hex }}
                      className={`relative w-8 h-8 rounded-full cursor-pointer transition-all
                        hover:scale-110 active:scale-95
                        ${isActive
                          ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 scale-110"
                          : "opacity-70 hover:opacity-100"
                        }`}
                      // ring color matches the dot itself
                      aria-label={label}
                      aria-pressed={isActive}
                    >
                      {isActive && (
                        <Check
                          className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-md"
                          strokeWidth={3}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={onClose}
              className="rounded-xl border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-xl px-5 py-2 text-xs font-semibold text-white transition cursor-pointer"
              style={{ backgroundColor: "var(--accent-color, #06b6d4)" }}
            >
              Save Settings
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ── Small helper components ───────────────────────────────────────── */
function SegmentRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">{label}</p>
      <div className="flex gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
        {children}
      </div>
    </div>
  );
}

function SegmentBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
        active
          ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200"
      }`}
    >
      {children}
    </button>
  );
}
