import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, Github, Linkedin, Globe, Cpu, Calendar, Target, Play, ShieldAlert } from "lucide-react";
import { ProfileDetails } from "../types";

interface AboutViewProps {
  profile: ProfileDetails | null;
}

export default function AboutView({ profile }: AboutViewProps) {
  const [terminalCategory, setTerminalCategory] = useState("All");
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [socialLabels, setSocialLabels] = useState<Record<string, string>>({
    github: "Github Coordinates",
    linkedin: "LinkedIn Footprint",
    website: "Personal Website"
  });
  const [metrics, setMetrics] = useState<any[]>([]);

  const [skillsData, setSkillsData] = useState<Record<string, string[]>>({});
  const [careerTimeline, setCareerTimeline] = useState<any[]>([]);
  const [localProfile, setLocalProfile] = useState<ProfileDetails | null>(null);

  const activeProfile = localProfile || profile;

  const intervalRef = useRef<any>(null);

  useEffect(() => {
    fetch("/api/about")
      .then((res) => res.json())
      .then((data) => {
        if (data.skillsData) setSkillsData(data.skillsData);
        if (data.careerTimeline) setCareerTimeline(data.careerTimeline);
        if (data.socialLabels) setSocialLabels(data.socialLabels);
        if (data.metrics) setMetrics(data.metrics);
        if (data.profile) setLocalProfile(data.profile);
      })
      .catch((err) => console.error("Failed to load about info", err));

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (Object.keys(skillsData).length > 0) {
      runTerminalDiagnostics("All");
    }
  }, [skillsData]);

  const runTerminalDiagnostics = (category: string) => {
    setTerminalCategory(category);
    setIsTyping(true);
    setTerminalLines([]);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const fullText = skillsData[category] || [];
    let lineIndex = 0;

    intervalRef.current = setInterval(() => {
      if (lineIndex < fullText.length) {
        const nextLine = fullText[lineIndex];
        setTerminalLines((prev) => [...prev, nextLine]);
        lineIndex++;
      } else {
        setIsTyping(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 70); // Typist speed rendering
  };

  // Timeline data loaded dynamically from storage/content/aboutview.config.json via API

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 space-y-12 pb-24">
      {/* Manifesto Bio Section */}
      <div id="about-manifesto" className="bg-white rounded-[1.5rem] border border-neutral-200/80 p-8 space-y-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-neutral-400 pointer-events-none select-none">
          <Terminal className="w-48 h-48 stroke-[1.5]" />
        </div>

        <div className="flex items-center gap-3">
          <div
            style={{ backgroundColor: activeProfile?.avatarBg || "#2f2f2f" }}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shadow-md select-none"
          >
            DS
          </div>
          <div>
            <h2 className="font-headline-lg text-[22px] text-neutral-800">{activeProfile?.displayName || "Divyanshu Singh"}</h2>
            <span className="font-mono text-xs text-neutral-400">{activeProfile?.username || "@divyanshu_dev"}</span>
          </div>
        </div>

        <p className="text-neutral-600 text-base leading-relaxed max-w-3xl font-body-sm">
          {activeProfile?.bio || "I am an architect of digital experiences, bridging the gap between raw computational capability and intuitive human interface. My work centers on designing systems that are robust, scalable, and inherently beautiful."}
        </p>

        {/* Footprint networks */}
        <div className="flex flex-wrap gap-3 pt-2">
          {activeProfile?.socials?.github && (
            <a
              href={activeProfile.socials.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg text-xs font-semibold transition-all border border-neutral-200/80 shadow-sm hover:scale-105"
            >
              <Github className="w-4 h-4 text-neutral-500" />
              {socialLabels.github}
            </a>
          )}
          {activeProfile?.socials?.linkedin && (
            <a
              href={activeProfile.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg text-xs font-semibold transition-all border border-neutral-200/80 shadow-sm hover:scale-105"
            >
              <Linkedin className="w-4 h-4 text-neutral-500" />
              {socialLabels.linkedin}
            </a>
          )}
          {activeProfile?.socials?.website && (
            <a
              href={activeProfile.socials.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg text-xs font-semibold transition-all border border-neutral-200/80 shadow-sm hover:scale-105"
            >
              <Globe className="w-4 h-4 text-neutral-500" />
              {socialLabels.website}
            </a>
          )}
        </div>
      </div>

      {/* SLA Metrics grid */}
      {metrics && metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metrics.map((metric, idx) => {
            const getIcon = (type: string) => {
              switch (type) {
                case "uptime": return <Cpu className="w-5 h-5 text-emerald-600" />;
                case "alignment": return <Target className="w-5 h-5 text-zinc-600" />;
                case "lcp": return <ShieldAlert className="w-5 h-5 text-cyan-600" />;
                default: return <Cpu className="w-5 h-5 text-neutral-600" />;
              }
            };
            const getIconBg = (type: string) => {
              switch (type) {
                case "uptime": return "bg-emerald-500/10 border border-emerald-500/20";
                case "alignment": return "bg-zinc-500/10 border border-zinc-500/20";
                case "lcp": return "bg-cyan-500/10 border border-cyan-500/20";
                default: return "bg-neutral-500/10 border border-neutral-500/20";
              }
            };
            const getValColor = (type: string) => {
              switch (type) {
                case "uptime": return "text-emerald-600";
                case "alignment": return "text-neutral-800";
                case "lcp": return "text-cyan-600";
                default: return "text-neutral-850";
              }
            };

            return (
              <div key={idx} className="bg-white border border-neutral-200/80 p-6 rounded-2xl flex items-start gap-4 shadow-sm">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getIconBg(metric.type)}`}>
                  {getIcon(metric.type)}
                </div>
                <div>
                  <div className="text-xs font-mono text-neutral-500 uppercase tracking-wider">{metric.label}</div>
                  <div className={`text-xl font-bold mt-1 ${getValColor(metric.type)}`}>{metric.value}</div>
                  <p className="text-[11px] text-neutral-500 mt-1 font-body-sm">{metric.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Terminal shell simulator skills matrix */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 font-mono text-xs text-neutral-500 uppercase tracking-wider">
          <Terminal className="w-4 h-4" />
          <span>Interactive Skills Diagnostics (skills.sh)</span>
        </div>

        <div className="bg-[#1c1b1b] rounded-[1.25rem] border border-neutral-300/80 overflow-hidden shadow-lg flex flex-col md:flex-row min-h-[300px]">
          {/* Terminal categories selector panel */}
          <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-neutral-800 bg-[#141414] p-4 space-y-2 flex flex-row md:flex-col items-center md:items-stretch overflow-x-auto gap-2 md:gap-0 font-mono">
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mb-0 md:mb-3">
              Commands
            </span>
            {["All", "Frontend", "Backend", "Systems"].map((cat) => (
              <button
                key={cat}
                onClick={() => runTerminalDiagnostics(cat)}
                className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                  terminalCategory === cat
                    ? "bg-white/10 text-emerald-400 font-semibold border-l-2 border-emerald-500"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Play className="w-3 h-3 opacity-60" />
                ./{cat.toLowerCase()}.sh
              </button>
            ))}
          </div>

          {/* Core Shell Console screen */}
          <div className="flex-1 p-6 font-mono text-xs text-emerald-500 whitespace-pre bg-[#141414] select-text overflow-x-auto space-y-1">
            <div className="text-neutral-500 select-none pb-2 border-b border-neutral-800 flex items-center justify-between">
              <span>PORTFOLIO SH - BASH EMULATOR</span>
              {isTyping && <span className="animate-pulse text-neutral-400">⚡ COMPILING TARGETS...</span>}
            </div>

            <div className="pt-2 text-neutral-400">
              guest@portfolio:~$ <span className="text-white">./skills.sh --{terminalCategory.toLowerCase()}</span>
            </div>

            <div className="space-y-1 pt-2">
              {terminalLines.map((line, idx) => {
                const safeLine = line || "";
                return (
                  <div
                    key={idx}
                    className={
                      safeLine.startsWith("---") || safeLine.startsWith("Diagnostics")
                        ? "text-neutral-400 italic"
                        : safeLine.includes("ERR")
                        ? "text-rose-500 font-bold"
                        : safeLine.includes("All") || safeLine.includes("Front") || safeLine.includes("Back") || safeLine.includes("Sys")
                        ? "text-cyan-400 font-semibold"
                        : "text-emerald-400"
                    }
                  >
                    {safeLine}
                  </div>
                );
              })}
              {isTyping && (
                <div className="inline-block w-2 h-4 bg-emerald-500 animate-pulse ml-1 align-middle" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Career progression chronology */}
      <div className="space-y-6 pt-4">
        <h3 className="font-headline-lg text-lg text-neutral-800 uppercase font-bold tracking-wider flex items-center gap-2">
          <Calendar className="w-5 h-5 text-neutral-500" /> Professional Timeline Record
        </h3>

        <div className="relative border-l border-neutral-200 ml-3 pl-6 space-y-8">
          {careerTimeline.map((item, idx) => (
            <div key={idx} className="relative">
              {/* Bullet node dot */}
              <div className="absolute top-1.5 left-[-31px] w-4.5 h-4.5 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center shadow-sm">
                <div className="w-2 h-2 rounded-full bg-neutral-600" />
              </div>

              <div className="space-y-1 bg-white border border-neutral-200/80 p-4 rounded-xl shadow-sm">
                <span className="font-mono text-xs text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-200/60">
                  {item.year}
                </span>
                <h4 className="font-semibold text-neutral-800 pt-2 text-[15px]">{item.role}</h4>
                <div className="text-xs text-neutral-500 font-mono">{item.company}</div>
                <p className="text-xs text-neutral-600 leading-relaxed pt-2 font-body-sm text-justify">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
