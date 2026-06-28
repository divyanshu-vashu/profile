import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Archive, ExternalLink, Code2, Tag, Layers, Check, FolderOpen, Table, Monitor } from "lucide-react";
import { Project, ArchivedProject } from "../types";

export default function ProjectsView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [archived, setArchived] = useState<ArchivedProject[]>([]);
  const [categories, setCategories] = useState<string[]>(["All", "Web Apps", "Machine Learning", "CLI Tools"]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // New Project Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("Web Apps");
  const [newTagsStr, setNewTagsStr] = useState("");
  const [newIcon, setNewIcon] = useState("grid_view");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    setLoading(true);
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.projects || []);
        setArchived(data.archivedProjects || []);
        if (data.categories) {
          setCategories(data.categories);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch projects", err);
        setLoading(false);
      });
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    setCreating(true);
    const tagsArray = newTagsStr
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          category: newCategory,
          tags: tagsArray.length > 0 ? tagsArray : ["React", "TypeScript"],
          icon: newIcon,
        }),
      });

      if (res.ok) {
        // Clear Form & Close
        setNewTitle("");
        setNewDesc("");
        setNewTagsStr("");
        setNewCategory(categories.find(cat => cat !== "All") || "Web Apps");
        setIsModalOpen(false);
        fetchProjects(); // Reload projects
      }
    } catch (err) {
      console.error("Failed to create project", err);
    } finally {
      setCreating(false);
    }
  };

  // Categories are loaded dynamically from storage/content/project-page.config.json via API

  const filteredProjects = projects.filter((proj) => {
    const matchesSearch =
      proj.title.toLowerCase().includes(search.toLowerCase()) ||
      proj.description.toLowerCase().includes(search.toLowerCase()) ||
      proj.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = activeCategory === "All" || proj.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const getIconElement = (iconName: string) => {
    switch (iconName) {
      case "terminal":
        return <Code2 className="w-5 h-5 text-neutral-600" />;
      case "hub":
        return <Layers className="w-5 h-5 text-neutral-600" />;
      default:
        return <Monitor className="w-5 h-5 text-neutral-600" />;
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 space-y-12 pb-24">
      {/* Header Container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-[28px] text-neutral-800 tracking-tight">Projects</h2>
          <p className="text-neutral-500 text-sm mt-1">Explore Divyanshu's containerized architectures and AI tools</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-neutral-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-neutral-900 active:scale-95 transition-all shadow-md self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          New Project
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 pt-1">
        {/* Categories toggles representing mockup filters */}
        <div className="flex flex-wrap gap-2">
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

        {/* Search */}
        <div className="relative max-w-sm w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#f4f4f3] border border-neutral-200 rounded-full pl-10 pr-4 py-2 text-xs text-neutral-800 focus:outline-none focus:bg-white focus:border-neutral-300 transition-all placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="py-24 text-center text-sm text-neutral-500 font-mono">
          <span className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-neutral-800 mb-3"></span>
          <p>Mounting Docker registry...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((proj) => (
              <motion.div
                key={proj.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-[1.5rem] border border-neutral-200/80 p-6 flex flex-col justify-between hover:border-neutral-300 transition-all group relative overflow-hidden shadow-sm"
              >
                <div>
                  {/* Category logo element */}
                  <div className="w-10 h-10 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center justify-center mb-5 shrink-0">
                    {getIconElement(proj.icon)}
                  </div>
                  <h3 className="font-headline-lg text-neutral-800 text-[19px] mb-2 font-semibold group-hover:text-black transition-colors">
                    {proj.title}
                  </h3>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-6 font-body-sm">
                    {proj.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 items-center mt-auto">
                  {proj.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-md text-[11px] font-mono border border-neutral-200 uppercase tracking-wider"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Simulated create project card matches wireframe Dotted item */}
            {activeCategory === "All" && !search && (
              <motion.div
                layout
                onClick={() => setIsModalOpen(true)}
                className="bg-transparent rounded-[1.5rem] border-2 border-dashed border-neutral-200 hover:border-neutral-300 cursor-pointer p-6 flex flex-col justify-center items-center min-h-[220px] transition-all duration-300 hover:bg-neutral-50 text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-neutral-50 border border-neutral-200/60 flex items-center justify-center text-neutral-500 group-hover:text-neutral-800 group-hover:scale-105 transition-all mb-4">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="text-neutral-800 font-semibold text-[17px] mb-1">Start New Project</h3>
                <p className="text-xs text-neutral-400">Initialize an empty workspace or git repository</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Archived Section matching wireframe bottom */}
      {!search && archived.length > 0 && (
        <div className="pt-8 border-t border-neutral-200">
          <div className="flex items-center gap-2 text-neutral-500 font-mono text-xs mb-6 uppercase tracking-wider">
            <Archive className="w-4 h-4 text-neutral-400" />
            <span>Archived Repositories</span>
          </div>

          <div className="space-y-3">
            {archived.map((arch) => (
              <div
                key={arch.id}
                className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200/60 rounded-xl hover:border-neutral-300/80 transition-all font-mono"
              >
                <div className="flex items-center gap-3">
                  {arch.type === "file" ? (
                    <FolderOpen className="w-4 h-4 text-neutral-500 shrink-0" />
                  ) : (
                    <Table className="w-4 h-4 text-neutral-500 shrink-0" />
                  )}
                  <span className="text-sm text-neutral-700">{arch.title}</span>
                </div>
                <button
                  className="p-1 px-2.5 rounded text-[10px] text-neutral-500 hover:text-white bg-neutral-100 hover:bg-neutral-200/60 transition-all"
                  onClick={() => alert(`Pulling '${arch.title}' code logs from server database...`)}
                >
                  Pull Logs
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start New Project Modal UI */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

             {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[1.5rem] border border-neutral-200 p-6 overflow-hidden shadow-2xl z-10"
            >
              <h3 className="font-headline-lg text-neutral-800 text-[20px] mb-4">Initialize New Project</h3>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-mono">Project Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apollo Engine"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-[#f4f4f3] border border-neutral-200 rounded-lg p-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-300"
                  />
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-mono">Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Brief description of structural features..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-[#f4f4f3] border border-neutral-200 rounded-lg p-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-neutral-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1 font-mono">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-[#f4f4f3] border border-neutral-200 rounded-lg p-2.5 text-xs text-neutral-600 focus:outline-none focus:bg-white focus:border-neutral-300"
                    >
                      {categories.filter(cat => cat !== "All").map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-400 mb-1 font-mono">Launcher Icon</label>
                    <select
                      value={newIcon}
                      onChange={(e) => setNewIcon(e.target.value)}
                      className="w-full bg-[#f4f4f3] border border-neutral-200 rounded-lg p-2.5 text-xs text-neutral-600 focus:outline-none focus:bg-white focus:border-neutral-300"
                    >
                      <option value="grid_view">Grid View Icon</option>
                      <option value="terminal">Terminal Icon</option>
                      <option value="hub">Hub Network Icon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-neutral-400 mb-1 font-mono">Tech Stack (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Go, Kubernetes, WASM"
                    value={newTagsStr}
                    onChange={(e) => setNewTagsStr(e.target.value)}
                    className="w-full bg-[#f4f4f3] border border-neutral-200 rounded-lg p-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none text-neutral-800 focus:bg-white focus:border-neutral-300"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-2.5 text-xs text-neutral-400 hover:text-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="p-2.5 px-5 rounded-lg bg-neutral-800 text-white text-xs font-semibold hover:bg-neutral-900 active:scale-95 transition-all"
                  >
                    {creating ? "Instantiating..." : "Instantiate Repository"}
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
