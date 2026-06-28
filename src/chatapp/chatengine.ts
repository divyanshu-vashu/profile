import "server-only";
import fs from "fs/promises";
import path from "path";

export async function handleChat(messages: { role: "user" | "assistant"; content: string }[]) {
  const llmApiKey = process.env.LLM_API;
  const geminiApiKey = process.env.GEMINI_API;

  let systemInstruction = "";
  try {
    const promptPath = path.join(process.cwd(), "src/chatapp/utils/prompt.txt");
    const memoryPath = path.join(process.cwd(),"src/chatapp/utils/memory.txt");
    const memory = await fs.readFile(memoryPath, "utf-8");
    systemInstruction = await fs.readFile(promptPath, "utf-8");
    systemInstruction += `\n\n${memory}`;
  } catch (err) {
    console.error("Failed to read prompt.txt, using basic fallback", err);
    systemInstruction = "You are the AI Assistant for Divyanshu Singh's professional portfolio.";
  }


  const apiMessages = [
    { role: "system", content: systemInstruction },
    ...messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  ];

  // Try DeepSeek first
  if (llmApiKey) {
    try {
      console.log("Attempting chat completion with DeepSeek API...");
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${llmApiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-v4-flash",
          messages: apiMessages,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return { text: content };
        }
      } else {
        const errText = await response.text();
        console.warn(`DeepSeek API returned non-OK status: ${response.status}. Details: ${errText}`);
      }
    } catch (error) {
      console.error("DeepSeek API connection error:", error);
    }
  }

  // Fallback to Gemini
  if (geminiApiKey) {
    try {
      console.log("Falling back to Gemini API (gemini-3.1-flash-lite) via OpenAI compatibility...");
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${geminiApiKey}`,
        },
        body: JSON.stringify({
          model: "gemini-3.1-flash-lite",
          messages: apiMessages,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return { text: content };
        }
      } else {
        const errText = await response.text();
        console.error(`Gemini API returned non-OK status: ${response.status}. Details: ${errText}`);
      }
    } catch (error) {
      console.error("Gemini API connection error:", error);
    }
  }

  throw new Error("Both DeepSeek and Gemini API calls failed or API keys are not configured.");
}

