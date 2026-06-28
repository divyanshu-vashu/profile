import { NextResponse } from "next/server";
import { handleChat } from "@/chatapp/chatengine";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array." }, { status: 400 });
    }

    const result = await handleChat(messages);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "An error occurred with the AI assistant.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
