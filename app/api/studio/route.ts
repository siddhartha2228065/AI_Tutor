import { rateLimit, getClientIP, getReferer } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    // Rate limit: 10 requests per minute per IP
    const ip = getClientIP(req);
    const limited = rateLimit(ip, 10, 60_000);
    if (limited) return limited;

    const { topic, mode = 'canvas' } = await req.json();

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Topic is required" }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY_STUDIO;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "No GEMINI_API_KEY_STUDIO set" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are "Studio AI" — an expert instructional designer, storyteller, and curriculum architect for Cuemath, the world's leading math education platform.

You generate premium, pedagogically sound educational content that is:
- Scientifically accurate and age-appropriate
- Engagingly written with vivid language and real-world analogies
- Structured for maximum comprehension and retention
- Rich in detail — each slide/chapter should have 3-5 sentences of substantive content

You NEVER produce generic or surface-level content. Every slide must teach something specific and valuable.`;

    let userPrompt = "";

    if (mode === 'canvas') {
      userPrompt = `Create a comprehensive educational storyboard about: "${topic}".

Generate exactly 5-6 slides that form a complete learning journey.

SLIDE TYPES to use (pick the best ones for this topic):
- HOOK: An attention-grabbing opening that makes the student curious
- PROBLEM: Frame the real-world problem this concept solves
- CONCEPT: The core idea explained simply with an analogy
- DEEP DIVE: A detailed walkthrough with step-by-step reasoning
- EXAMPLE: A concrete, relatable real-world example
- PRACTICE: An interactive challenge or thought experiment
- SUMMARY: Key takeaways and "aha!" moments
- CALL TO ACTION: What to explore next

Each slide MUST have:
- A compelling, specific title (not generic)
- 3-5 sentences of rich, educational content
- Real examples, numbers, or scenarios where possible

You MUST respond in PURE JSON — an array of objects. NO markdown, NO code blocks, NO explanation.
Start with [ and end with ].

Format:
[
  { "id": 1, "type": "HOOK", "title": "Your specific title", "content": "Rich, detailed educational content here..." },
  { "id": 2, "type": "CONCEPT", "title": "Another specific title", "content": "More rich content..." }
]`;
    } else if (mode === 'story') {
      userPrompt = `Write a captivating educational story about a student learning: "${topic}".

Generate exactly 5-6 story chapters that teach through narrative.

Make the story:
- Feature a relatable protagonist (give them a name and personality)
- Include dialogue and emotional moments
- Weave the math/science concepts naturally into the plot
- Build tension and have a satisfying resolution
- Each chapter should be 4-6 sentences of vivid storytelling

You MUST respond in PURE JSON — an array of objects. NO markdown, NO code blocks, NO explanation.
Start with [ and end with ].

Format:
[
  { "id": 1, "type": "CHAPTER 1", "title": "The Mysterious Pattern", "content": "Detailed story content here..." },
  { "id": 2, "type": "CHAPTER 2", "title": "A Sudden Discovery", "content": "More story content..." }
]`;
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
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 3000,
        temperature: 0.8,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter Studio Error:", JSON.stringify(data));
      throw new Error(data.error?.message || `API returned ${response.status}`);
    }

    let responseText = data.choices?.[0]?.message?.content || "[]";
    
    // Aggressively clean up any markdown/code block formatting
    responseText = responseText
      .replace(/```(?:json)?\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Try to extract JSON array if there's surrounding text
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      responseText = jsonMatch[0];
    }

    let slides;
    try {
      slides = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error. Raw text:", responseText.substring(0, 300));
      // Return a graceful fallback
      slides = [
        { id: 1, type: "ERROR", title: "Generation Issue", content: "The AI response couldn't be parsed. Please try generating again with a different topic." }
      ];
    }

    return new Response(JSON.stringify({ slides }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Studio API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to generate studio content" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
