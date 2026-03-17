import { NextRequest, NextResponse } from "next/server";
import { ask, parseJSON } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { project, phase, days } = await req.json();

  const prompt = `You are Hype Agent strategist for Solana token launches.

Project: ${project.name} ($${project.ticker})
Category: ${project.category}
Description: ${project.description}
Phase: ${phase}
Duration: ${days} days

Build a ${days}-day content calendar. Think about optimal posting cadence, content variety, and momentum arc.

Respond ONLY with valid JSON:
{
  "strategy": "2-3 sentence overall strategy",
  "warnings": ["potential risk 1", "potential risk 2"],
  "timeline": [
    {
      "dayOffset": 0,
      "platform": "twitter",
      "contentType": "thread",
      "description": "what this post covers",
      "goal": "what this achieves"
    }
  ]
}

Generate 8-12 timeline items spread across ${days} days across twitter and telegram.`;

  try {
    const raw = await ask(prompt);
    const data = parseJSON(raw, { strategy: "", warnings: [], timeline: [] });
    return NextResponse.json({ success: true, data });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
