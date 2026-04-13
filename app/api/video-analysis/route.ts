import { NextRequest, NextResponse } from "next/server";

const VISION_PROMPT = `You are an expert in non-verbal communication analysis for teacher/tutor evaluation. 
Analyze this webcam frame of a tutor candidate during an interview and evaluate their non-verbal cues.

Score each of the following dimensions from 0 to 100:

1. **eyeContact** — Is the person looking at the camera/screen? Direct gaze = high score. Looking away frequently = low.
2. **gestures** — Are they using hand gestures to explain? Active, purposeful gestures = high. Stiff or no gestures = low.
3. **smileFrequency** — Do they appear warm, friendly, or smiling? Genuine warmth = high. Neutral/tense = low.
4. **posture** — Are they sitting upright, leaning in (engaged)? Good posture = high. Slouching or too far back = low.
5. **overallPresence** — Overall teaching presence. A combination of confidence, approachability, and energy.

Respond ONLY with valid JSON in this exact format, no markdown, no explanation:
{"eyeContact": <number>, "gestures": <number>, "smileFrequency": <number>, "posture": <number>, "overallPresence": <number>}`;

export async function POST(req: NextRequest) {
  try {
    const { frame } = await req.json();

    if (!frame) {
      return NextResponse.json({ error: "No frame provided" }, { status: 400 });
    }

    // Strip data URL prefix if present
    const base64Data = frame.replace(/^data:image\/\w+;base64,/, "");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GEMINI_API_KEY_TUTOR}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: VISION_PROMPT },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Data}`,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Video Analysis API Error:", JSON.stringify(data));
      throw new Error(data.error?.message || `API returned ${response.status}`);
    }

    const rawContent = data.choices?.[0]?.message?.content || "";

    // Extract JSON from the response (handle potential markdown wrapping)
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse vision response as JSON");
    }

    const scores = JSON.parse(jsonMatch[0]);

    // Validate and clamp scores
    const validated = {
      eyeContact: Math.min(100, Math.max(0, Number(scores.eyeContact) || 50)),
      gestures: Math.min(100, Math.max(0, Number(scores.gestures) || 50)),
      smileFrequency: Math.min(100, Math.max(0, Number(scores.smileFrequency) || 50)),
      posture: Math.min(100, Math.max(0, Number(scores.posture) || 50)),
      overallPresence: Math.min(100, Math.max(0, Number(scores.overallPresence) || 50)),
    };

    return NextResponse.json(validated);
  } catch (error: any) {
    console.error("Video Analysis Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze video frame" },
      { status: 500 }
    );
  }
}
