import { NextRequest, NextResponse } from "next/server";
import { ask, parseJSON } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { project, mentions } = await req.json();

  const prompt = `Analyze community sentiment for ${project.name} ($${project.ticker}).

Mentions:
${mentions.map((m: string, i: number) => `${i + 1}. "${m}"`).join("\n")}

Respond ONLY with valid JSON:
{
  "overall": "bullish",
  "score": 0.72,
  "keywords": [{"word": "moon", "count": 3, "sentiment": 0.9}],
  "summary": "2-3 sentence summary of community mood",
  "actionItems": ["specific action to take", "another action"]
}`;

  try {
    const raw = await ask(prompt);
    const data = parseJSON(raw, { overall: "neutral", score: 0, keywords: [], summary: raw, actionItems: [] });
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
