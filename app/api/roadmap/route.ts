import { NextRequest, NextResponse } from "next/server";

const ROADMAP_SYSTEM_PROMPT = `You are a Cuemath Pedagogical Expert. Your task is to analyze a math tutor candidate's interview evaluation and create a highly personalized 4-week pedagogical roadmap to help them improve their teaching skills.

The roadmap MUST be a JSON object with this exact structure:
{
  "roadmap": {
    "id": "string",
    "candidateName": "string",
    "title": "string",
    "weeks": [
      {
        "week": number,
        "focus": "string",
        "topics": [
          { "title": "string", "desc": "string", "icon": "string" }
        ],
        "outcome": "string"
      }
    ]
  }
}

Guidelines:
- Week 1 MUST focus on the candidate's biggest identified weakness.
- Use Material Design icon names (e.g., 'school', 'functions', 'psychology', 'trending_up', 'menu_book').
- Each week should have 2-3 specific topics.
- The outcome should be a clear, motivational statement.
- Ensure the JSON is valid and only return the JSON object.
`;

export async function POST(req: NextRequest) {
  try {
    const { candidate } = await req.json();

    if (!candidate) {
      return NextResponse.json({ error: "Missing candidate data" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY_TUTOR;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY_TUTOR");
    }

    const prompt = `
      Candidate Name: ${candidate.name}
      Interview Metrics: ${JSON.stringify(candidate.metrics)}
      Interview Summary: ${candidate.summary}

      Generate a 4-week growth roadmap based on this candidate's performance. Focus on improving their pedagogical clarity, student engagement, and conceptual depth as identified in their summary.
    `;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "system", content: ROADMAP_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Roadmap API Error:", JSON.stringify(data));
      throw new Error(data.error?.message || "Failed to generate roadmap");
    }

    let roadmapData;
    try {
      // Handle potential double nesting or stringified content
      const content = data.choices[0].message.content;
      roadmapData = typeof content === 'string' ? JSON.parse(content) : content;
      
      // Ensure the ID is unique
      if (roadmapData.roadmap) {
        roadmapData.roadmap.id = `rd-${Date.now()}`;
        roadmapData.roadmap.candidateName = candidate.name;
      }
    } catch (e) {
      console.error("JSON Parsing Error:", e);
      throw new Error("Failed to parse AI response as valid roadmap JSON.");
    }

    return NextResponse.json(roadmapData);
  } catch (error: any) {
    console.error("Roadmap API Exception:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
