import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, BookOpen, Globe, Plus, Scroll, Search, X } from "lucide-react";
import { RecommendationItem } from "../types";

export default function RecommendationsView() {
  const [items, setItems] = useState<RecommendationItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<RecommendationItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Research Paper");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/recommendations")
      .then((res) => res.json())
      .then((data) => {
        setItems(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, description, isNew: true }),
      });

      if (res.ok) {
        const created = await res.json();
        setItems((prev) => [...prev, created]);
        setTitle("");
        setDescription("");
        setCategory("Research Paper");
        setIsOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ["All", "Research Paper", "Book", "Blog"];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Book":
        return <BookOpen className="h-5 w-5 text-neutral-700" />;
      case "Research Paper":
        return <Scroll className="h-5 w-5 text-neutral-700" />;
      default:
        return <Globe className="h-5 w-5 text-neutral-700" />;
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-6 py-10 md:px-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-5xl font-semibold tracking-tight text-neutral-950">Library</h1>
        </div>

        <div className="flex w-full max-w-xl items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-full border border-black/10 bg-white pl-12 pr-4 text-base text-neutral-900 outline-none transition focus:border-black/20"
            />
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-black px-6 text-base font-medium text-white transition hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            New
          </button>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-5 py-3 text-lg transition ${
              activeCategory === cat
                ? "border border-black/10 bg-white font-medium text-black shadow-sm"
                : "text-neutral-500 hover:text-black"
            }`}
          >
            {cat === "Research Paper" ? "Papers" : cat}
          </button>
        ))}
      </div>

      <div className="mt-10 overflow-hidden rounded-[28px] border border-black/6 bg-white shadow-[0_12px_36px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-[minmax(0,1fr)_180px_120px] border-b border-black/6 px-8 py-4 text-sm font-medium text-neutral-500">
          <div>Name</div>
          <div>Modified</div>
          <div>Type</div>
        </div>

        {loading ? (
          <div className="px-8 py-14 text-neutral-500">Loading recommendations...</div>
        ) : filteredItems.length === 0 ? (
          <div className="px-8 py-14 text-neutral-500">No recommendation matched your search.</div>
        ) : (
          filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="grid w-full grid-cols-[minmax(0,1fr)_180px_120px] items-center gap-4 border-b border-black/6 px-8 py-5 text-left transition hover:bg-neutral-50"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-black/8 bg-[#f7f7f5]">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[30px] text-lg font-medium text-neutral-950 md:text-xl">
                    {item.title}
                  </div>
                  <div className="mt-1 truncate text-sm text-neutral-500">{item.description}</div>
                </div>
              </div>
              <div className="text-sm text-neutral-500">{item.isNew ? "Today" : "Earlier"}</div>
              <div className="flex items-center justify-between text-sm text-neutral-500">
                <span>{item.category}</span>
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </button>
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-white/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="relative z-10 w-full max-w-2xl rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.12)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="rounded-full border border-black/10 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
                    {selectedItem.category}
                  </div>
                  <h3 className="mt-4 text-3xl font-semibold text-neutral-950">{selectedItem.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="rounded-full p-2 text-neutral-500 transition hover:bg-black/5 hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-6 text-base leading-8 text-neutral-700">{selectedItem.description}</p>
              {selectedItem.url && (
                <div className="mt-8 flex justify-end">
                  <a
                    href={selectedItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    <span>
                      {selectedItem.category === "Research Paper"
                        ? "Read Paper"
                        : selectedItem.category === "Book"
                        ? "Read Book"
                        : "Read Article"}
                    </span>
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-white/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="relative z-10 w-full max-w-xl rounded-[32px] border border-black/10 bg-white p-8 shadow-[0_24px_60px_rgba(0,0,0,0.12)]"
            >
              <h3 className="text-2xl font-semibold text-neutral-950">Add recommendation</h3>
              <form onSubmit={handleSuggest} className="mt-6 space-y-4">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="h-14 w-full rounded-2xl border border-black/10 px-4 text-base outline-none focus:border-black/20"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-black/10 px-4 text-base outline-none focus:border-black/20"
                >
                  <option value="Research Paper">Research Paper</option>
                  <option value="Book">Book</option>
                  <option value="Blog">Blog</option>
                </select>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary"
                  className="w-full rounded-2xl border border-black/10 px-4 py-4 text-base outline-none focus:border-black/20"
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full border border-black/10 px-5 py-3 text-base text-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-black px-6 py-3 text-base font-medium text-white disabled:opacity-60"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
