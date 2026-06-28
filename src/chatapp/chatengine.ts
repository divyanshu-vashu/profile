import "server-only";
import fs from "fs/promises";
import path from "path";
import { CONTENT_TOOLS } from "./libs/tool-definitions";
import {
  executeListFiles,
  executeReadFile,
  executeGrepContent,
} from "./libs/tools/content-reader";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

interface ApiResponse {
  choices?: {
    message?: {
      role: string;
      content?: string | null;
      tool_calls?: ToolCall[];
    };
    finish_reason?: string;
  }[];
}

// ---------------------------------------------------------------------------
// Tool Dispatcher
// ---------------------------------------------------------------------------

async function dispatchToolCall(toolCall: ToolCall): Promise<string> {
  const { name, arguments: argsStr } = toolCall.function;

  let args: Record<string, string>;
  try {
    args = JSON.parse(argsStr);
  } catch {
    return JSON.stringify({ error: `Invalid JSON arguments for tool "${name}": ${argsStr}` });
  }

  console.log(`[Tool Call] ${name}(${argsStr})`);

  switch (name) {
    case "list_files":
      return executeListFiles(args.path ?? "");

    case "read_file":
      return executeReadFile(args.path ?? "");

    case "grep_content":
      return executeGrepContent(args.directory ?? "", args.query ?? "");

    default:
      return JSON.stringify({ error: `Unknown tool: "${name}"` });
  }
}

// ---------------------------------------------------------------------------
// Shared API caller (OpenAI-compatible)
// ---------------------------------------------------------------------------

async function callApi(
  endpoint: string,
  apiKey: string,
  model: string,
  messages: Message[],
  useTools: boolean
): Promise<ApiResponse | null> {
  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.3, // Lower temp + no reasoning params = disables DeepSeek thinking mode
    stream: false,
  };

  // Only include tools if we're in tool-calling mode
  if (useTools && CONTENT_TOOLS.length > 0) {
    body.tools = CONTENT_TOOLS;
    body.tool_choice = "auto";
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.warn(`API error (${response.status}): ${errText}`);
    return null;
  }

  return response.json() as Promise<ApiResponse>;
}

// ---------------------------------------------------------------------------
// Agentic Tool-Calling Loop
// ---------------------------------------------------------------------------

const MAX_TOOL_ITERATIONS = 5;

async function runAgentLoop(
  endpoint: string,
  apiKey: string,
  model: string,
  messages: Message[]
): Promise<string | null> {
  let currentMessages = [...messages];

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const data = await callApi(endpoint, apiKey, model, currentMessages, true);

    if (!data) return null;

    const choice = data.choices?.[0];
    if (!choice?.message) return null;

    const { content, tool_calls, role } = choice.message;

    // If the model returned a final text response — we're done
    if (!tool_calls || tool_calls.length === 0) {
      return content ?? null;
    }

    console.log(`[Agent Loop] Iteration ${iteration + 1}: executing ${tool_calls.length} tool call(s)`);

    // Append assistant message with tool_calls to history
    currentMessages.push({
      role: "assistant",
      content: content ?? null,
      tool_calls,
    });

    // Execute each tool call and append results
    for (const toolCall of tool_calls) {
      const result = await dispatchToolCall(toolCall);

      currentMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolCall.function.name,
        content: result,
      });
    }

    // Loop: re-send to model with tool results
  }

  console.warn("[Agent Loop] Hit max iterations without final response");
  return null;
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

export async function handleChat(
  messages: { role: "user" | "assistant"; content: string }[]
) {
  const llmApiKey = process.env.LLM_API;
  const geminiApiKey = process.env.GEMINI_API;

  // Build system prompt
  let systemInstruction = "";
  try {
    const promptPath = path.join(process.cwd(), "src/chatapp/utils/prompt.txt");
    const memoryPath = path.join(process.cwd(), "src/chatapp/utils/memory.txt");
    const memory = await fs.readFile(memoryPath, "utf-8");
    systemInstruction = await fs.readFile(promptPath, "utf-8");
    systemInstruction += `\n\n${memory}`;
  } catch (err) {
    console.error("Failed to read prompt.txt, using basic fallback", err);
    systemInstruction =
      "You are the AI Assistant for Divyanshu Singh's professional portfolio.";
  }

  const apiMessages: Message[] = [
    { role: "system", content: systemInstruction },
    ...messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
  ];

  // --- Try DeepSeek with agentic tool loop ---
  if (llmApiKey) {
    try {
      console.log("[ChatEngine] Attempting DeepSeek with tool calling...");
      const text = await runAgentLoop(
        "https://api.deepseek.com/chat/completions",
        llmApiKey,
        "deepseek-chat",
        apiMessages
      );
      if (text) return { text };
      console.warn("[ChatEngine] DeepSeek returned no usable response.");
    } catch (error) {
      console.error("[ChatEngine] DeepSeek error:", error);
    }
  }

  // --- Fallback: Gemini with agentic tool loop ---
  if (geminiApiKey) {
    try {
      console.log("[ChatEngine] Falling back to Gemini with tool calling...");
      const text = await runAgentLoop(
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        geminiApiKey,
        "gemini-2.0-flash",
        apiMessages
      );
      if (text) return { text };
      console.error("[ChatEngine] Gemini returned no usable response.");
    } catch (error) {
      console.error("[ChatEngine] Gemini error:", error);
    }
  }

  throw new Error(
    "Both DeepSeek and Gemini API calls failed or API keys are not configured."
  );
}
