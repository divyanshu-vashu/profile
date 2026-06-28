export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  icon: string;
}

export interface ArchivedProject {
  id: string;
  title: string;
  type: "file" | "table";
}

export interface BlogItem {
  id: string;
  title: string;
  description: string;
  category: string;
  updatedText: string;
  featured: boolean;
  tag?: string;
  isNew?: boolean;
  icon?: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  category: "Research Paper" | "Book" | "Blog" | string;
  description: string;
  isNew?: boolean;
  url?: string;
}

export interface ProfileDetails {
  displayName: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  avatarBg: string;
  socials: {
    github: string;
    linkedin: string;
    website: string;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
