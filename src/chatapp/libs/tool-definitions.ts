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
  {
    type: "function",
    function: {
      name: "send_email",
      description:
        "Send or forward an email inquiry to Divyanshu (specifically to support@sarugeek.com). Use this tool whenever a user asks to drop a message, send a query, contact him, or leave a note.",
      parameters: {
        type: "object",
        properties: {
          who: {
            type: "string",
            description: "The name of the person sending the message/inquiry. E.g. 'John Doe'. [REQUIRED]",
          },
          query: {
            type: "string",
            description: "The main body of the message or query text that the user wants to send.",
          },
          email: {
            type: "string",
            description: "The contact email address of the person sending the message. [OPTIONAL]",
          },
          why: {
            type: "string",
            description: "The reason or context for reaching out (e.g. 'Freelance Work', 'Networking'). [OPTIONAL]",
          },
        },
        required: ["who", "query"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "get_availability",
      description:
        "Retrieve Divyanshu's free slots/availability for booking a meeting between two dates/times. Default username and eventTypeSlug are handled on the server, but can be customized.",
      parameters: {
        type: "object",
        properties: {
          startTime: {
            type: "string",
            description: "ISO-8601 start date-time string to query for slots. E.g. '2026-07-01T00:00:00Z' or plain YYYY-MM-DD. Ensure this is a future date/time relative to user local time.",
          },
          endTime: {
            type: "string",
            description: "ISO-8601 end date-time string to query for slots. E.g. '2026-07-07T23:59:59Z' or plain YYYY-MM-DD. Typically 1 to 7 days after startTime.",
          },
          timeZone: {
            type: "string",
            description: "The preferred IANA timezone database name of the user (e.g. 'Asia/Kolkata', 'America/New_York', 'UTC'). This is critical for showing correct slot hours.",
          },
          duration: {
            type: "number",
            description: "Custom duration of the slot/meeting in minutes. E.g. 30, 45, 60.",
          },
        },
        required: ["startTime", "endTime"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
  {
    type: "function",
    function: {
      name: "create_booking",
      description:
        "Book a new meeting/slot with Divyanshu. Be sure to confirm the slot timezone and time matches one of the available times from get_availability before booking.",
      parameters: {
        type: "object",
        properties: {
          startTime: {
            type: "string",
            description: "ISO-8601 UTC date-time string representing the booking slot start. E.g. '2026-07-01T10:00:00Z'.",
          },
          attendeeName: {
            type: "string",
            description: "Name of the attendee booking the meeting.",
          },
          attendeeEmail: {
            type: "string",
            description: "Email address of the attendee.",
          },
          attendeeTimezone: {
            type: "string",
            description: "IANA timezone database name for the attendee. E.g. 'Asia/Kolkata', 'America/New_York'.",
          },
          why: {
            type: "string",
            description: "Detailed reason/agenda for booking the meeting. E.g. 'Discuss full-stack role', 'Collaboration inquiry'.",
          },
          whoAreYou: {
            type: "string",
            description: "Brief professional description of who the attendee is. E.g. 'Recruiter at Google', 'Freelance Designer'.",
          },
          duration: {
            type: "number",
            description: "Custom duration of the booking/meeting in minutes. E.g. 30.",
          },
        },
        required: ["startTime", "attendeeName", "attendeeEmail", "attendeeTimezone", "why", "whoAreYou"],
        additionalProperties: false,
      },
      strict: true,
    },
  },
];
