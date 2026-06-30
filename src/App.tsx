"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  MessageSquare,
  FolderKanban,
  PanelLeft,
  Search,
  Menu,
  X,
  Plus,
  MoreHorizontal,
  ThumbsUp,
  FileText,
  Settings2,
} from "lucide-react";
import HomeView from "./components/HomeView";
import RecommendationsView from "./components/RecommendationsView";
import BlogView from "./components/BlogView";
import ProjectsView from "./components/ProjectsView";
import AboutView from "./components/AboutView";
import ProfileModal from "./components/ProfileModal";
import SettingsModal from "./components/SettingsModal";
import { ProfileDetails, ChatMessage } from "./types";

type TabName = "Home" | "Library" | "Projects" | "Blog" | "About";

const iconMap: Record<string, any> = {
  MessageSquare,
  BookOpen: FileText,
  FolderKanban,
  ThumbsUp,
};

/* ── Accent palette (mirrors SettingsModal) ─────────────────────── */
const ACCENT_HEX: Record<string, string> = {
  Green:  "#22c55e",
  Blue:   "#3b82f6",
  Grey:   "#71717a",
  Yellow: "#eab308",
  Pink:   "#ec4899",
  Orange: "#f97316",
  Purple: "#a855f7",
};
const ACCENT_LIGHT: Record<string, string> = {
  Green:  "rgba(34, 197,  94, 0.12)",
  Blue:   "rgba(59, 130, 246, 0.12)",
  Grey:   "rgba(113,113, 122, 0.12)",
  Yellow: "rgba(234, 179,  8, 0.12)",
  Pink:   "rgba(236,  72,153, 0.12)",
  Orange: "rgba(249, 115, 22, 0.12)",
  Purple: "rgba(168,  85,247, 0.12)",
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>("Home");
  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [navItems, setNavItems] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  /* ── On mount: restore preferences & fetch data ──────────────── */
  useEffect(() => {
    const getCookie = (name: string): string | null => {
      const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)"));
      return m ? decodeURIComponent(m[2]) : null;
    };

    const savedAppearance = localStorage.getItem("pref_appearance") || getCookie("appearance") || "System";
    const savedContrast   = localStorage.getItem("pref_contrast")   || getCookie("contrast")   || "Default";
    const rawAccent    = localStorage.getItem("pref_accent") || getCookie("accentColor") || "Green";
    // Migrate stale accent keys (e.g. old "Teal" → "Green")
    const savedAccent  = ACCENT_HEX[rawAccent] ? rawAccent : "Green";

    const root = document.documentElement;

    // Appearance
    root.classList.remove("dark", "light");
    if (savedAppearance === "Dark") {
      root.classList.add("dark");
    } else if (savedAppearance === "Light") {
      root.classList.add("light");
    } else {
      root.classList.add(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }

    // Contrast
    root.classList.toggle("high-contrast", savedContrast === "Increased");

    // Accent
    root.style.setProperty("--accent-color",       ACCENT_HEX[savedAccent]   || "#22c55e");
    root.style.setProperty("--accent-color-light", ACCENT_LIGHT[savedAccent] || "rgba(34,197,94,0.12)");
    Object.keys(ACCENT_HEX).forEach((k) => root.classList.remove(`accent-${k.toLowerCase()}`));
    // Clear any legacy stale classes
    ["teal"].forEach((old) => root.classList.remove(`accent-${old}`));
    root.classList.add(`accent-${savedAccent.toLowerCase()}`);


    // Sidebar state
    if (localStorage.getItem("sidebarCollapsed") === "true") setSidebarCollapsed(true);

    // Data
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => setProfile(d))
      .catch(() => {});

    fetch("/api/ui-config")
      .then((r) => r.json())
      .then((d) => { if (d.navigation) setNavItems(d.navigation); })
      .catch(() => {});
  }, []);

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem("sidebarCollapsed", String(next));
  };

  const getInitials = (name?: string) => {
    if (!name) return "DS";
    const p = name.trim().split(/\s+/);
    return p.length >= 2 ? `${p[0][0]}${p[1][0]}`.toUpperCase() : p[0].slice(0, 2).toUpperCase();
  };

  const clearChat = () => {
    setMessages([]);
  };



  /* ── Shared nav-item button ─────────────────────────────────── */
  const NavBtn = ({
    name,
    label,
    icon: Icon,
    collapsed = false,
  }: {
    name: TabName | "About";
    label: string;
    icon: any;
    collapsed?: boolean;
  }) => {
    const active = activeTab === name;
    return (
      <button
        onClick={() => { setActiveTab(name as TabName); setMobileSidebarOpen(false); }}
        title={collapsed ? label : undefined}
        className={`flex items-center gap-3 rounded-2xl transition-all duration-150 cursor-pointer
          ${collapsed
            ? "w-11 h-11 justify-center p-0"
            : "w-full px-4 py-3 text-left text-[15px]"}
          ${active
            ? "nav-active font-semibold"
            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-neutral-100"
          }`}
      >
        <Icon className={`shrink-0 ${collapsed ? "h-[22px] w-[22px]" : "h-5 w-5"}`} />
        {!collapsed && label}
      </button>
    );
  };

  /* ── Collapsed sidebar ─────────────────────────────────────── */
  const CollapsedSidebar = () => (
    <div className="flex h-full flex-col items-center bg-[#f4f4f2] dark:bg-[#141414] border-r border-neutral-200 dark:border-neutral-800 py-4 gap-3">
      {/* Logo */}
      <div className="w-9 h-9 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm mb-1">
        <span className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100">DS</span>
      </div>

      {/* Expand */}
      <button
        onClick={toggleSidebar}
        title="Expand sidebar"
        className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition cursor-pointer mb-2"
      >
        <PanelLeft className="h-5 w-5 rotate-180" />
      </button>

      {/* New chat */}
      <button
        onClick={() => { setActiveTab("Home"); clearChat(); setMobileSidebarOpen(false); }}
        title="New chat"
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 shadow-sm transition cursor-pointer mb-2"
      >
        <Plus className="h-5 w-5" />
      </button>

      {/* Nav icons */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || MessageSquare;
          return <NavBtn key={item.name} name={item.name} label={item.label} icon={Icon} collapsed />;
        })}
        <NavBtn name="About" label="More" icon={MoreHorizontal} collapsed />
      </nav>

      {/* Profile avatar */}
      <div className="mt-auto pt-3 border-t border-neutral-200 dark:border-neutral-800 w-full flex justify-center">
        <button
          onClick={() => setProfileOpen(true)}
          title={profile?.displayName || "Profile"}
          style={{ backgroundColor: profile?.avatarBg || "#f59e0b" }}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white shadow-sm cursor-pointer"
        >
          {getInitials(profile?.displayName)}
        </button>
      </div>
    </div>
  );

  /* ── Expanded sidebar ─────────────────────────────────────── */
  const ExpandedSidebar = () => (
    <div className="flex h-full flex-col bg-[#f4f4f2] dark:bg-[#141414]">
      {/* Top row */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center shadow-sm">
            <span className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100">DS</span>
          </div>
          <span className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">Sarugeek</span>
        </div>
        <button
          onClick={toggleSidebar}
          title="Collapse sidebar"
          className="rounded-xl p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-100 transition cursor-pointer"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Actions */}
      <div className="px-3 space-y-0.5">
        <button
          onClick={() => { setActiveTab("Home"); clearChat(); setMobileSidebarOpen(false); }}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-[15px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-neutral-100 transition cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          New chat
        </button>
        <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-[15px] text-neutral-500 dark:text-neutral-500 hover:bg-neutral-200/60 dark:hover:bg-white/5 hover:text-neutral-800 dark:hover:text-neutral-200 transition cursor-pointer">
          <Search className="h-5 w-5" />
          Search chats
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 my-3 h-px bg-neutral-200 dark:bg-neutral-800" />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || MessageSquare;
          return <NavBtn key={item.name} name={item.name} label={item.label} icon={Icon} />;
        })}
        <NavBtn name="About" label="More" icon={MoreHorizontal} />
      </nav>

      {/* Profile footer */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 p-3">
        <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-neutral-200/60 dark:hover:bg-white/5 transition group">
          <button
            onClick={() => setProfileOpen(true)}
            className="flex flex-1 items-center gap-3 text-left min-w-0 cursor-pointer"
          >
            <div
              style={{ backgroundColor: profile?.avatarBg || "#f59e0b" }}
              className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[13px] font-bold text-white shadow-sm"
            >
              {getInitials(profile?.displayName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-semibold text-neutral-900 dark:text-neutral-100">
                {profile?.displayName || "Divyanshu Vashu"}
              </div>
              <div className="truncate text-[12px] text-neutral-500 dark:text-neutral-500">
                {profile?.username || "vashusingh2004.jan"}
              </div>
            </div>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setSettingsOpen(true); }}
            title="Settings"
            className="p-2 rounded-xl text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition cursor-pointer"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  /* ─── Root layout ────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen bg-[#fcfcf9] dark:bg-[#0e0e0e] text-neutral-950 dark:text-neutral-50">

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex md:flex-col md:shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? "md:w-[64px]" : "md:w-[280px]"}`}
      >
        {sidebarCollapsed ? <CollapsedSidebar /> : <ExpandedSidebar />}
      </aside>

      {/* Main content area */}
      <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">

        {/* Top header bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between
          border-b border-neutral-200 dark:border-neutral-800
          bg-[#fcfcf9]/95 dark:bg-[#0e0e0e]/95
          backdrop-blur-md
          px-4 md:px-6">

          {/* Left: mobile hamburger + page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-xl p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition md:hidden cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <h1 className="text-[16px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
              {activeTab === "Home" ? "Sarugeek" : activeTab}
            </h1>
          </div>

          {/* Right: settings shortcut on mobile */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="rounded-xl p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition md:hidden cursor-pointer"
            title="Settings"
          >
            <Settings2 className="h-5 w-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto relative">
          <div className="absolute inset-0">
            <div className={activeTab === "Home" ? "h-full w-full block" : "hidden"}>
              <HomeView profile={profile} onNavigate={(t) => setActiveTab(t as TabName)} messages={messages} setMessages={setMessages} />
            </div>
            <div className={activeTab === "Library" ? "h-full w-full block" : "hidden"}>
              <RecommendationsView />
            </div>
            <div className={activeTab === "Projects" ? "h-full w-full block" : "hidden"}>
              <ProjectsView />
            </div>
            <div className={activeTab === "About" ? "h-full w-full block" : "hidden"}>
              <AboutView profile={profile} />
            </div>
            <div className={activeTab === "Blog" ? "h-full w-full block" : "hidden"}>
              <BlogView />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileSidebarOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="relative h-full w-[80%] max-w-[280px] shadow-2xl"
            >
              <ExpandedSidebar />
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute right-3 top-4 rounded-xl p-2 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        onSave={(updated) => setProfile(updated)}
      />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
