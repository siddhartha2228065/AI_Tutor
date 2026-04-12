import { rateLimit, getClientIP, getReferer } from "@/lib/rateLimit";

export async function GET(req: Request) {
  try {
    // Rate limit: 8 image generations per minute per IP
    const ip = getClientIP(req);
    const limited = rateLimit(ip, 8, 60_000);
    if (limited) return limited;

    const { searchParams } = new URL(req.url);
    const prompt = searchParams.get('prompt') || 'random visual';
    
    const apiKey = process.env.GEMINI_API_KEY_STUDIO;
    if (!apiKey) {
      return new Response('No GEMINI_API_KEY_STUDIO key', { status: 500 });
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
          {
            role: "system",
            content: `You are an elite SVG graphic designer. You ONLY output raw, valid SVG code — no markdown, no explanation, no wrapping.

CRITICAL RULES:
1. Output MUST start with <svg and end with </svg>
2. NEVER wrap in \`\`\`xml, \`\`\`svg, or any markdown
3. Use xmlns="http://www.w3.org/2000/svg" on the root <svg>
4. Use viewBox="0 0 800 600" width="800" height="600"
5. Use <defs> for gradients, filters, and clip paths
6. Use rich <linearGradient> and <radialGradient> for depth
7. Use <filter> for soft drop shadows and blur effects
8. Use modern flat-design colors: deep indigo (#4f46e5), teal (#14b8a6), cyan (#06b6d4), amber (#f59e0b), rose (#f43f5e)
9. Layer elements from background to foreground for proper z-ordering
10. Include at least 3-4 distinct visual elements (not just text)
11. Add subtle background shapes for visual richness
12. ALL text must use font-family="Inter, system-ui, sans-serif"
13. Keep the SVG self-contained — no external references
14. Make it BEAUTIFUL — this is for a premium educational platform`
          },
          {
            role: "user",
            content: `Create a stunning, detailed SVG illustration for: "${prompt}".

Requirements:
- Professional quality, suitable for a premium education platform
- Use harmonious color palette with gradients
- Include visual hierarchy (background → midground → foreground)
- Add geometric decoration elements
- Must look polished and modern
- Use rounded shapes for a friendly feel
- Minimum 15 SVG elements for rich detail`
          }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter Image Error:", JSON.stringify(data));
      return new Response(generateFallbackSVG(prompt), {
        status: 200,
        headers: { 'Content-Type': 'image/svg+xml' },
      });
    }

    let svgCode = data.choices?.[0]?.message?.content || '';
    
    // Aggressively clean up LLM output
    svgCode = svgCode
      .replace(/```(?:xml|svg|html)?\n?/g, '')  // Remove code block markers
      .replace(/```\n?/g, '')
      .trim();
    
    // Extract just the SVG if there's any surrounding text
    const svgMatch = svgCode.match(/<svg[\s\S]*<\/svg>/i);
    if (svgMatch) {
      svgCode = svgMatch[0];
    } else {
      // If no valid SVG found, return a nice fallback
      console.error("No valid SVG in LLM response. Raw:", svgCode.substring(0, 200));
      svgCode = generateFallbackSVG(prompt);
    }

    return new Response(svgCode, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable'
      },
    });
  } catch (error: any) {
    console.error("Image API Error:", error);
    return new Response(generateFallbackSVG("Error"), {
      status: 200,
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  }
}

function generateFallbackSVG(prompt: string): string {
  const label = prompt.length > 40 ? prompt.substring(0, 40) + '...' : prompt;
  return `<svg viewBox="0 0 800 600" width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e1b4b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#4f46e5"/>
      <stop offset="100%" style="stop-color:#06b6d4"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="800" height="600" fill="url(#bg)"/>
  <circle cx="200" cy="150" r="120" fill="#4f46e5" opacity="0.15"/>
  <circle cx="600" cy="450" r="180" fill="#06b6d4" opacity="0.1"/>
  <rect x="100" y="250" width="600" height="100" rx="50" fill="url(#accent)" opacity="0.2"/>
  <text x="400" y="280" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="22" fill="#a5b4fc" font-weight="600">AI Generated Illustration</text>
  <text x="400" y="320" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="16" fill="#94a3b8">${label}</text>
  <circle cx="400" cy="200" r="60" fill="none" stroke="url(#accent)" stroke-width="3" filter="url(#glow)" opacity="0.7"/>
  <polygon points="385,180 385,220 415,200" fill="#06b6d4" opacity="0.8"/>
</svg>`;
}
