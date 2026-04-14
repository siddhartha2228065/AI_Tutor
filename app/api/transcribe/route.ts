import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Convert Blob to Base64
    const buffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString("base64");

    // Map MIME type to format for input_audio
    // OpenAI standard expects "wav" or "mp3", but Gemini can handle "webm" or "mp4" via OpenRouter mapping
    const rawMimeType = audioFile.type || "audio/webm";
    const format = rawMimeType.includes("webm") ? "webm" : rawMimeType.includes("mp4") ? "mp4" : "wav";

    // Use OpenRouter endpoint with OpenAI Audio standard
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
              {
                type: "text",
                text: "You are a verbatim transcription engine. Listen carefully to the spoken audio and output EXACTLY what was said. Do not add punctuation unless clearly spoken, do not add filler, and do not summarize. Output ONLY the transcript.",
              },
              {
                type: "input_audio",
                input_audio: {
                  data: base64Audio,
                  format: format,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenRouter Response Error:", JSON.stringify(data));
      throw new Error(data.error?.message || `OpenRouter returned ${response.status}`);
    }

    const rawTranscript = data.choices?.[0]?.message?.content || "";
    
    // Server-side filter: Gemini sometimes hallucinates filler on silence
    const trimmed = rawTranscript.trim();
    const isHallucination = 
      !trimmed ||
      trimmed.length < 2 ||
      /^\[.*\]$/.test(trimmed) ||
      /^(okay|ok|um|uh|hmm|hello|hi|hey|\.+|\?+|,+)$/i.test(trimmed) ||
      /^no\s*(audio|speech|sound|input|content)/i.test(trimmed) ||
      /^(the\s+)?(audio|video|recording)\s+(is|was|contains?)\s/i.test(trimmed);
    
    if (isHallucination) {
      return NextResponse.json({ text: "", filtered: true });
    }

    return NextResponse.json({ text: trimmed });
  } catch (error: any) {
    console.error("Transcription API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to transcribe audio" }, { status: 500 });
  }
}
