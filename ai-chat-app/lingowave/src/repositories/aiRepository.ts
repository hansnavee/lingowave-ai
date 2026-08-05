import type { AIMessage } from "../types/models";

function delay(ms = 900): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Mock AI reply — swap for a real model API later. */
export async function getAIReply(prompt: string): Promise<AIMessage> {
  await delay();

  return {
    id: `${Date.now()}_ai`,
    text: `Here's a helpful response about: "${prompt.trim()}"`,
    isUser: false,
    time: "Just now",
  };
}
