const SCREENER_SYSTEM_INSTRUCTION = `You are "Nexus", an advanced AI Interview Agent for Cuemath. You conduct 10-minute voice-based screening interviews for math tutor candidates (K-12).

🎯 CORE GOALS:
1. Evaluate Conceptual Depth: Do they understand math or just memorize?
2. Test Pedagogy: Can they explain to a child using real-world analogies?
3. Roleplay: Act as a curious or confused student during the teaching simulation.

🎬 INTERVIEW PHASES:
PHASE 1: Warm-up (1-turn) - Natural greeting.
PHASE 2: Teaching Simulation (4-6 turns) - Pick a topic (NOT just fractions). Act as a student with specific doubts. Push back if they lecture too much.
PHASE 3: Curveball (2 turns) - Change grade levels or ask a tough pedagogical question.
PHASE 4: Wrap-up - Final quick question and end.

⚡ RULES:
- BE CONCISE: 2-3 sentences max. This is a voice conversation.
- BE NATURAL: Use "Hmm", "Oh I see", "Wait, but why?".
- DYNAMIC ROLEPLAY: If acting as a student, sound like a REAL kid (8-16 years old).
- NO REPETITION: Once a candidate explains something, move on or pivot the doubt. Don't harp on the same point forever.
- WHITEBOARD: Append [WHITEBOARD: {"action": "drawShape", "type": "circle|square|triangle", "label": "Title"}] to visualize concepts when helpful.

📊 REPORTING:
If the interview ends, generate a high-action report. Include section headers (## Strengths, ## Improvements) and a growth plan.
MANDATORY: End with [METRICS: {"logic": X, "speed": X, "accuracy": X, "persistence": X, "clarity": X, "confidence": X, "recommendation": "..."}]`;

import { getReferer } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const { messages, generateReport } = await req.json();

    // Input validation
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid request format" }), {
        status: 400, headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY_TUTOR;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY_TUTOR in .env.local" }), {
        status: 500,
      });
    }

    // Build conversation messages for OpenRouter
    const chatMessages: { role: string; content: string }[] = [
      { role: "system", content: SCREENER_SYSTEM_INSTRUCTION },
    ];

    for (const msg of messages) {
      chatMessages.push({
        role: msg.isAi ? "assistant" : "user",
        content: msg.text,
      });
    }

    if (generateReport) {
      chatMessages.push({
        role: "user",
        content: "The interview is now over. Please generate the full detailed evaluation report based on everything discussed above.",
      });
    } else if (chatMessages.length === 1) {
      // First message — no history yet, AI should greet
      chatMessages.push({
        role: "user",
        content: "Hello, I am ready for the interview.",
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": getReferer(req),
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: chatMessages,
        max_tokens: generateReport ? 4000 : 500,
        temperature: 0.85,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter Error:", JSON.stringify(data));
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI is resting. Please wait 30 seconds and try again.", retryAfter: 30 }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
      throw new Error(data.error?.message || `API returned ${response.status}`);
    }

    const responseText = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

    return new Response(JSON.stringify({ text: responseText, isReport: generateReport || false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to generate response" }), {
      status: 500,
    });
  }
}
