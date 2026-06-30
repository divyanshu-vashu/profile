import { ArchivedProject, BlogItem, ProfileDetails, Project, RecommendationItem } from "@/types";

export const profile: ProfileDetails = {
  displayName: "Divyanshu Vashu",
  username: "@divyanshu-vashu",
  email: "vashusingh2004.jan@gmail.com",
  phone: "+917295004615",
  bio: "I am an architect of digital experiences, bridging the gap between raw computational capability and intuitive human interface. My work centers on designing systems that are robust, scalable, and inherently beautiful.",
  avatarBg: "#2f2f2f",
  socials: {
    github: "https://github.com/divyanshu-vashu",
    linkedin: "https://linkedin.com/in/divyanshu-vashu",
    website: "https://sarugeek.com",
  },
};

export let projects: Project[] = [
  {
    id: "p1",
    title: "DevEnv Automator",
    description: "A CLI tool that instantly provisions containerized development environments using Docker and Go.",
    category: "CLI Tools",
    tags: ["Go", "Docker"],
    icon: "terminal",
  },
  {
    id: "p2",
    title: "Neural Sentiment Analysis",
    description: "Fine-tuned BERT model for real-time sentiment classification of financial news streams.",
    category: "Machine Learning",
    tags: ["Python", "PyTorch"],
    icon: "hub",
  },
  {
    id: "p3",
    title: "Portfolio Command",
    description: "The very site you are viewing. A modern, chat-like interface built with Tailwind CSS and plain HTML/JS.",
    category: "Web Apps",
    tags: ["HTML", "Tailwind"],
    icon: "grid_view",
  },
];

export const archivedProjects: ArchivedProject[] = [
  { id: "a1", title: "Legacy React Dashboard", type: "file" },
  { id: "a2", title: "Old SQL Scripts", type: "table" },
];

export let blogs: BlogItem[] = [
  {
    id: "b1",
    title: "The Architecture of Next-Gen AI Apps",
    description: "A deep dive into the patterns, state management, and edge computing paradigms defining the modern web.",
    category: "Playlists",
    updatedText: "Playlist Updated 2 days ago",
    featured: true,
    tag: "Playlist",
  },
  {
    id: "b2",
    title: "CSS Grid techniques for modern web applications.",
    description: "Advanced CSS Grid layout tricks, container queries, and micro-interactions for polished UI dashboards.",
    category: "Tech",
    updatedText: "Updated 1 week ago",
    featured: false,
    icon: "code",
  },
  {
    id: "b3",
    title: "Bridging the gap between Figma and React.",
    description: "A systematized workflow detailing token translation, automated asset exports, and developer handoff precision.",
    category: "Design",
    updatedText: "Updated 2 weeks ago",
    featured: false,
    icon: "palette",
  },
  {
    id: "b4",
    title: "Managing complex UI states predictably.",
    description: "Practical state machine patterns and event-driven architecture to keep frontend codebases clean and scalable.",
    category: "Tech",
    updatedText: "Updated 3 days ago",
    featured: false,
    isNew: true,
    icon: "layers",
  },
];

export let recommendations: RecommendationItem[] = [
  {
    id: "r1",
    title: "A deep dive into transformer architectures.",
    category: "Research Paper",
    description: "Analyzing self-attention mechanisms, positional encodings, and scaling limitations in current LLM foundations.",
  },
  {
    id: "r2",
    title: "Exploring fundamental design principles.",
    category: "Book",
    description: "A masterclass in spacing rhythm, typographic scale, and structural layout hierarchy.",
  },
  {
    id: "r3",
    title: "Building Scalable Vector Search — A guide to HNSW and FAISS.",
    category: "Blog",
    description: "Implementing nearest neighbor search indexing structures for efficient high-dimensional embedding retrieval.",
    isNew: true,
  },
];

export function updateProfile(nextProfile: ProfileDetails) {
  Object.assign(profile, nextProfile);
  return profile;
}

export function addProject(project: Project) {
  projects = [...projects, project];
  return project;
}

export function addBlog(blog: BlogItem) {
  if (blog.featured) {
    blogs = blogs.map((item) => (item.featured ? { ...item, featured: false } : item));
  }
  blogs = [...blogs, blog];
  return blog;
}

export function addRecommendation(item: RecommendationItem) {
  recommendations = [...recommendations, item];
  return item;
}
