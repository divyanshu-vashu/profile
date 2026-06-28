import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, Paperclip, Send, Sparkles, Smile, MessageSquare, Terminal, RefreshCw, Layers, Copy, ThumbsUp, ThumbsDown, Share, RotateCw, MoreHorizontal, BookOpen } from "lucide-react";
import { ChatMessage, ProfileDetails } from "../types";
import Markdown from "./Markdown";

interface HomeViewProps {
  profile: ProfileDetails | null;
  onNavigate: (tab: string) => void;
}

export default function HomeView({ profile, onNavigate }: HomeViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages to the bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = async (forcedPrompt?: string) => {
    const textToSend = forcedPrompt ? forcedPrompt.trim() : input.trim();
    if (!textToSend && !attachedFile) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: "user",
      content: attachedFile ? `[Attached: ${attachedFile}] \n\n${textToSend}` : textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!forcedPrompt) setInput("");
    setAttachedFile(null);
    setSending(true);

    try {
      const chatHistory = [...messages, userMsg].map((msg) => ({
        role: msg.role,
        content: msg.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (!res.ok) throw new Error("Could not connect with portfolio assistant.");
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `m-${Date.now() + 1}`,
        role: "assistant",
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `m-${Date.now() + 2}`,
        role: "assistant",
        content: "### System Warning\n\nI encountered a network issue communicating with the AI backend. Please verify your internet connection or check your API coordinates.\n\n*In-memory fallback info*: Divyanshu Singh is a full-stack developer with skills in React, Go, Node.js and AWS.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };

  const triggerSearchQuery = (query: string) => {
    handleSend(query);
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setAttachedFile(files[0].name);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto h-full flex flex-col justify-between py-8">
      {/* Scrollable messages or welcome greeting */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8 scrollbar-thin">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              key="greeting"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="h-full flex flex-col justify-center items-center py-12 md:py-24 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200/80 flex items-center justify-center mb-8 shadow-sm hover:scale-105 transition-all">
                <Terminal className="w-8 h-8 text-neutral-600" />
              </div>

              <h2 className="font-headline-xl text-headline-xl text-neutral-800 mb-3">
                Ask anything about Vashu
              </h2>
              <p className="text-neutral-500 max-w-md font-body-md text-base leading-relaxed mb-10">
                I'm active as a full-stack engineer and interface architect. Ask me anything about my codebase, tech stack, or professional philosophies.
              </p>

              {/* Suggestions Cards Grid */}
              <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
                <button
                  onClick={() => triggerSearchQuery("Describe your core technical stack and database preferences.")}
                  className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200/60 hover:border-neutral-300 hover:bg-neutral-100/60 text-left transition-all group"
                >
                  <Sparkles className="w-5 h-5 text-neutral-500 group-hover:text-neutral-900 shrink-0 transition-colors" />
                  <div>
                    <div className="text-body-sm font-semibold text-neutral-800">Core stack competencies</div>
                    <div className="text-xs text-neutral-500 mt-1">Review languages & frame preferences</div>
                  </div>
                </button>

                <button
                  onClick={() => triggerSearchQuery("What are your primary achievements and container metrics?")}
                  className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200/60 hover:border-neutral-300 hover:bg-neutral-100/60 text-left transition-all group"
                >
                  <Layers className="w-5 h-5 text-neutral-500 group-hover:text-neutral-900 shrink-0 transition-colors" />
                  <div>
                    <div className="text-body-sm font-semibold text-neutral-800">Explore professional achievements</div>
                    <div className="text-xs text-neutral-500 mt-1">Look at speed indexes & uptime</div>
                  </div>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat-messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Header inside chat box for control */}
              <div className="flex justify-between items-center bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 px-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="live-dot w-2.5 h-2.5 rounded-full animate-pulse"></span>
                  <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300">
                    Live Assistant Session (DeepSeek v4-flash)
                  </span>
                </div>
                <button
                  onClick={clearChat}
                  className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-black/5 dark:hover:bg-white/5 px-2.5 py-1.5 rounded-lg transition-colors border border-black/5 dark:border-white/5"
                  title="Clear conversation log"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Chat
                </button>
              </div>

              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className="flex flex-col gap-1 w-full"
                >
                  <div className={`flex gap-3 w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div
                        style={{ backgroundColor: profile?.avatarBg || "#201f1f" }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 font-bold text-xs select-none shadow-sm mt-1"
                      >
                        DS
                      </div>
                    )}

                    <div
                      style={
                        msg.role === "user"
                          ? { backgroundColor: "var(--accent-color-light, rgba(34, 197, 94, 0.12))" }
                          : undefined
                      }
                      className={`max-w-[85%] rounded-[1.25rem] px-5 py-3.5 border ${
                        msg.role === "user"
                          ? "text-neutral-900 border-emerald-500/10 dark:text-neutral-100 dark:bg-neutral-800 dark:border-neutral-700"
                          : "bg-transparent border-transparent text-neutral-950 dark:text-neutral-100"
                      }`}
                    >
                      {/* Render message content */}
                      <div className={`text-body-sm font-body-sm leading-relaxed select-text markdown-body !text-neutral-900 dark:!text-neutral-100 ${msg.role === 'user' ? 'whitespace-pre-wrap' : ''}`}>
                        {msg.role === "assistant" ? <Markdown text={msg.content} /> : msg.content}
                      </div>
                      <div className="text-[10px] text-right text-neutral-400 mt-2 font-mono">
                        {msg.timestamp}
                      </div>
                    </div>

                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400 shrink-0 font-bold text-xs select-none mt-1">
                        U
                      </div>
                    )}
                  </div>

                  {/* Actions Row for Assistant response */}
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-3 pl-11 mt-1 text-neutral-400 dark:text-neutral-500">
                      <button
                        onClick={() => navigator.clipboard.writeText(msg.content)}
                        className="p-1 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                        title="Like response"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                        title="Dislike response"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                        title="Share chat"
                      >
                        <Share className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const prevUserMsg = messages.slice(0, index).reverse().find(m => m.role === "user");
                          if (prevUserMsg) triggerSearchQuery(prevUserMsg.content);
                        }}
                        className="p-1 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                        title="Regenerate last response"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="p-1 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
                        title="More options"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onNavigate("Projects")}
                        className="flex items-center gap-1 ml-2 px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 text-[11px] font-mono hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition cursor-pointer"
                      >
                        <BookOpen className="w-3 h-3" />
                        Sources
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {sending && (
                <div className="flex gap-4 justify-start">
                  <div
                    style={{ backgroundColor: profile?.avatarBg || "#2f2f2f" }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 font-bold text-xs animate-pulse select-none"
                  >
                    DS
                  </div>
                  <div className="max-w-[80%] rounded-[1.25rem] px-5 py-4 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" />
                    <span className="text-xs font-mono text-neutral-550 dark:text-neutral-400 ml-1">Analyzing workspace...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main chat entry controller container */}
      <div className="px-4">
        <div className="relative w-full max-w-3xl mx-auto mb-6">
          <input
            type="file"
            onChange={handleFileAttach}
            ref={fileInputRef}
            className="hidden"
            accept=".txt,.js,.json,.ts,.tsx,.css,.html,.md,.png,.jpg"
          />

          {/* Render simulation notification of attached file metadata */}
          <AnimatePresence>
            {attachedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-[-44px] left-2 bg-neutral-100 border border-neutral-200 rounded-full px-4 py-1 flex items-center gap-2 shadow-sm mb-2 z-10"
              >
                <Paperclip className="w-3.5 h-3.5 text-neutral-500" />
                <span className="font-mono text-xs text-neutral-700">{attachedFile}</span>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="text-neutral-400 hover:text-neutral-800 font-bold text-xs ml-1"
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="bg-[#f4f4f3] dark:bg-neutral-800 rounded-full p-1.5 pr-3 flex items-center border border-neutral-200/80 dark:border-neutral-700 shadow-sm focus-within:border-neutral-300 dark:focus-within:border-neutral-600 focus-within:bg-white dark:focus-within:bg-neutral-900 transition-all duration-300"
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 rounded-full cursor-pointer"
              title="Attach config, requirements or image file"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent border-none text-neutral-800 dark:text-neutral-100 font-body-md text-body-md focus:ring-0 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 px-3 h-12 focus:outline-none"
              placeholder="Ask anything about Vashu..."
            />

            <button
              type="submit"
              disabled={sending || (!input.trim() && !attachedFile)}
              style={{ backgroundColor: "var(--accent-color, #06b6d4)" }}
              className="accent-btn w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all ml-2 disabled:opacity-30 disabled:scale-100 cursor-pointer"
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </button>
          </form>
        </div>

        {/* Quick horizontal action row (only shows up initially or as options) */}
        {messages.length === 0 && (
          <div className="flex flex-wrap justify-center gap-3 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <button
              onClick={() => triggerSearchQuery("Outline your primary professional achievements and metrics.")}
              className="bg-neutral-50 border border-neutral-200 text-neutral-700 px-4 py-2 rounded-lg font-label-md text-[13px] hover:bg-neutral-100 hover:border-neutral-300 hover:text-neutral-900 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-neutral-400" />
              View Achievements
            </button>

            <button
              onClick={() => onNavigate("Projects")}
              className="bg-neutral-50 border border-neutral-200 text-neutral-700 px-4 py-2 rounded-lg font-label-md text-[13px] hover:bg-neutral-100 hover:border-neutral-300 hover:text-neutral-900 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-neutral-400" />
              Explore Projects
            </button>

            <button
              onClick={() => onNavigate("Blog")}
              className="bg-neutral-50 border border-neutral-200 text-neutral-700 px-4 py-2 rounded-lg font-label-md text-[13px] hover:bg-neutral-100 hover:border-neutral-300 hover:text-neutral-900 transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-neutral-400" />
              Read my Blog
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
