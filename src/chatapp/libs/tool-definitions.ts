// Minimal inline type matching the OpenAI ChatCompletionTool shape
// (avoids requiring the openai package)
type ToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    strict?: boolean;
  };
};

/** OpenAI-compatible tool definitions for portfolio content reading.
 *  These are passed as the `tools` parameter to any OpenAI-compatible API call
 *  (DeepSeek or Gemini via OpenAI compatibility layer). */
export const CONTENT_TOOLS: ToolDefinition[] = [
  {
    type: "function",
    function: {
      name: "list_files",
      description:
        "List files and directories inside storage/content/<path>. Use this to discover what blogs, projects, or library items exist before reading them. Call with an empty string path '' to list the root content directory.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "Relative path inside storage/content/. Examples: 'blog', 'projects', 'library', '' for root.",
          },
        },
        required: ["path"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description:
        "Read the full text content of a file inside storage/content/<path>. Use this after list_files to read a specific blog post, project case study, or library entry. Returns the raw file text.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "Relative file path inside storage/content/. Examples: 'blog/Logging-in-the-AI-Era.md', 'projects/sentinel-mcp/case-study.md', 'aboutview.config.json'.",
          },
        },
        required: ["path"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "grep_content",
      description:
        "Search for a keyword or phrase across all files in a storage/content/<directory>. Returns matching file names and relevant line excerpts. Use when you need to locate content about a specific topic without knowing the exact file name.",
      parameters: {
        type: "object",
        properties: {
          directory: {
            type: "string",
            description:
              "Directory to search inside storage/content/. Examples: 'blog', 'projects', 'library'.",
          },
          query: {
            type: "string",
            description: "The keyword or phrase to search for (case-insensitive).",
          },
        },
        required: ["directory", "query"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
];
