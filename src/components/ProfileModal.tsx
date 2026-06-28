import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Camera, X } from "lucide-react";
import { ProfileDetails } from "../types";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ProfileDetails) => void;
}

export default function ProfileModal({ isOpen, onClose, onSave }: ProfileModalProps) {
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isOpen]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  const getRandomBg = () => {
    if (!profile) return;
    const list = ["#f59e0b", "#0ea5e9", "#22c55e", "#8b5cf6", "#ef4444"];
    const currentIdx = list.indexOf(profile.avatarBg);
    const nextIdx = (currentIdx + 1) % list.length;
    setProfile({ ...profile, avatarBg: list[nextIdx] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const updated = await res.json();
      onSave(updated);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-white/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          className="relative z-10 w-full max-w-[580px] rounded-[32px] border border-black/10 bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.14)]"
        >
          <div className="flex items-center justify-between px-2 pb-4">
            <h3 className="text-[18px] font-semibold text-neutral-950">Edit profile</h3>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-neutral-500 transition hover:bg-black/5 hover:text-black"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {loading && !profile ? (
            <div className="p-10 text-center text-neutral-500">Loading profile...</div>
          ) : (
            profile && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-center pt-2">
                  <div className="relative">
                    <div
                      style={{ backgroundColor: profile.avatarBg }}
                      className="flex h-[168px] w-[168px] items-center justify-center rounded-full text-[62px] font-medium text-white"
                    >
                      {getInitials(profile.displayName)}
                    </div>
                    <button
                      type="button"
                      onClick={getRandomBg}
                      className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-neutral-700 shadow-sm"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 px-4 py-3">
                  <label className="block text-sm text-neutral-500">Display name</label>
                  <input
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    className="mt-1 w-full bg-transparent text-[18px] text-neutral-950 outline-none"
                  />
                </div>

                <div className="rounded-2xl border border-black/10 px-4 py-3">
                  <label className="block text-sm text-neutral-500">Username</label>
                  <input
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    className="mt-1 w-full bg-transparent text-[18px] text-neutral-950 outline-none"
                  />
                </div>

                <p className="pt-2 text-center text-sm text-neutral-500">
                  Your profile helps people recognize you in group chats.
                </p>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-black/10 px-5 py-3 text-base text-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-black px-6 py-3 text-base font-medium text-white disabled:opacity-60"
                  >
                    Save
                  </button>
                </div>
              </form>
            )
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
