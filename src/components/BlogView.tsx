import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, Plus, ArrowRight, X, PlayCircle, Layers, Palette, GraduationCap, Code } from "lucide-react";
import { BlogItem } from "../types";

export default function BlogView() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Tech");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        setBlogs(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await fetch("/api/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        category: newCategory,
        updatedText: "Updated just now",
        featured: false,
        icon: newCategory === "Design" ? "palette" : newCategory === "Playlists" ? "layers" : "code",
      }),
    });

    if (res.ok) {
      const created = await res.json();
      setBlogs((prev) => [...prev, created]);
      setNewTitle("");
      setNewDesc("");
      setIsFormOpen(false);
    }
  };

  const categories = ["All", "Tech", "Design", "Career", "Playlists"];

  const filteredPosts = blogs.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Find a featured post for the banner (preferably playlist category or featured tag)
  const featuredPost = blogs.find(post => post.featured) || blogs[0];

  const getBlogIcon = (iconName?: string) => {
    switch (iconName) {
      case "palette":
        return <Palette className="h-5 w-5 text-indigo-500" />;
      case "layers":
        return <Layers className="h-5 w-5 text-emerald-500" />;
      case "career":
        return <GraduationCap className="h-5 w-5 text-amber-500" />;
      default:
        return <Code className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col px-4 py-8 pb-24 space-y-8">
      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-[28px] text-primary tracking-tight text-neutral-800">Blog</h2>
          <p className="text-neutral-500 text-sm mt-1">Explore design engineering tokens, series playlists, and systems architecture</p>
        </div>
        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative max-w-sm w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#f4f4f3] border border-neutral-200 rounded-full pl-10 pr-4 py-2 text-xs text-neutral-800 focus:outline-none focus:bg-white focus:border-neutral-300 transition-all placeholder:text-neutral-400"
            />
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-neutral-800 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-neutral-900 active:scale-95 transition-all shadow-md shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            New Post
          </button>
        </div>
      </div>

      {/* Playlist Hero Wallpaper Banner */}
      {featuredPost && (
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-lg gap-8">
          <div className="space-y-4 max-w-lg z-10">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-md text-xs font-mono px-3 py-1 rounded-full text-white uppercase tracking-wider">
                Featured {featuredPost.category}
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight">
              {featuredPost.title}
            </h3>
            <p className="text-white/80 text-sm md:text-base leading-relaxed">
              {featuredPost.description}
            </p>
            <button
              onClick={() => setSelectedPost(featuredPost)}
              className="bg-white text-neutral-900 font-semibold px-6 py-2.5 rounded-full text-xs hover:bg-white/90 active:scale-95 transition-all shadow-md inline-flex items-center gap-2"
            >
              Read Article &rarr;
            </button>
          </div>

          {/* Interactive Playlist Wallpaper Floating Box */}
          <div className="relative shrink-0 w-full md:w-[320px] h-[190px] rounded-[18px] bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-5 overflow-hidden flex flex-col justify-between group cursor-pointer hover:border-white/30 transition-all">
            <div className="absolute right-[-40px] bottom-[-40px] w-48 h-48 rounded-full bg-indigo-500/30 blur-2xl group-hover:scale-110 transition-transform duration-500" />
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
                <PlayCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-[10px] font-mono tracking-wider text-white/50 uppercase">PLAYLIST SERIES</span>
            </div>
            <div>
              <span className="text-xs text-white/60 font-medium">Curated Technical Logs</span>
              <h4 className="text-lg font-bold text-white leading-tight mt-1">System Design & Web Paradigms</h4>
            </div>
          </div>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-100">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 ${
              activeCategory === cat
                ? "bg-neutral-800 text-white"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog Cards Grid */}
      {loading ? (
        <div className="py-24 text-center text-sm text-neutral-500 font-mono">
          <span className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-neutral-800 mb-3"></span>
          <p>Index mapping repositories...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-16 text-center text-neutral-500 font-mono border border-dashed border-neutral-200 rounded-[20px] bg-neutral-50">
          No blog posts match the selected filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => (
            <button
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="flex items-center justify-between p-5 bg-white border border-neutral-200/80 rounded-[20px] hover:border-neutral-300 transition-all text-left group shadow-sm"
            >
              <div className="flex items-center gap-4 min-w-0 pr-4">
                <div className="w-11 h-11 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center shrink-0">
                  {getBlogIcon(post.icon)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-neutral-800 truncate text-[15px] group-hover:text-black">
                    {post.title}
                  </h4>
                  <p className="text-xs text-neutral-500 truncate mt-0.5">
                    {post.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-neutral-400 group-hover:text-neutral-700 shrink-0">
                <span className="text-[10px] font-mono text-neutral-400">{post.updatedText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Blog Modal Popup Details */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              className="relative z-10 w-full max-w-xl bg-white rounded-[24px] border border-neutral-200 p-6 overflow-hidden shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="bg-neutral-100 text-neutral-600 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {selectedPost.category}
                  </span>
                  <h3 className="font-bold text-neutral-800 text-[20px] mt-3 leading-snug">
                    {selectedPost.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 text-sm text-neutral-600 leading-relaxed font-body-sm space-y-3">
                <p>{selectedPost.description}</p>
                <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-100 text-xs text-neutral-500 mt-2">
                  This blog post has been generated dynamically from the Markdown storage workspace. Full compilation parses the contents statically at route:
                  <code className="block mt-1 font-mono text-[10px] text-indigo-600">/blog/{selectedPost.title.toLowerCase().replace(/\s+/g, '-')}</code>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Blog Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[24px] border border-neutral-200 p-6 shadow-2xl z-10"
            >
              <h3 className="font-bold text-neutral-800 text-[18px] mb-4">Create Blog Post</h3>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-mono">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-[#f4f4f3] border border-neutral-200 rounded-lg p-2.5 text-sm text-neutral-800 focus:outline-none focus:bg-white focus:border-neutral-300"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-mono">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#f4f4f3] border border-neutral-200 rounded-lg p-2.5 text-xs text-neutral-600 focus:outline-none focus:bg-white focus:border-neutral-300"
                  >
                    <option value="Tech">Tech</option>
                    <option value="Design">Design</option>
                    <option value="Career">Career</option>
                    <option value="Playlists">Playlists</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-mono">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Short description summary..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-[#f4f4f3] border border-neutral-200 rounded-lg p-2.5 text-sm text-neutral-800 focus:outline-none focus:bg-white focus:border-neutral-300"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="p-2 text-xs text-neutral-500 hover:text-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="p-2 px-4 rounded-lg bg-neutral-800 text-white text-xs font-semibold hover:bg-neutral-900 active:scale-95 transition-all"
                  >
                    Create Post
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
