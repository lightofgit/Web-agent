import { NextRequest, NextResponse } from "next/server";
import { ask } from "@/lib/gemini";

const KOL_DATABASE = [
  { id: "1", handle: "solana_whale_alpha", tier: "macro", followers: 285000, niche: ["solana","defi","memecoin"], engagement: 4.2, priceRange: [15,30], reputation: 82 },
  { id: "2", handle: "degen_analyst", tier: "macro", followers: 198000, niche: ["memecoin","solana","trading"], engagement: 6.1, priceRange: [10,25], reputation: 78 },
  { id: "3", handle: "solana_news_live", tier: "macro", followers: 450000, niche: ["solana","news","launches"], engagement: 3.8, priceRange: [20,40], reputation: 88 },
  { id: "4", handle: "nft_alpha_caller", tier: "micro", followers: 42000, niche: ["nft","solana","art"], engagement: 8.9, priceRange: [3,8], reputation: 71 },
  { id: "5", handle: "defi_degen_sol", tier: "micro", followers: 67000, niche: ["defi","yield","solana"], engagement: 7.3, priceRange: [5,12], reputation: 85 },
  { id: "6", handle: "memecoin_hunter", tier: "nano", followers: 8500, niche: ["memecoin","degen","100x"], engagement: 15.2, priceRange: [0.5,2], reputation: 58 },
  { id: "7", handle: "sol_defi_whale", tier: "mega", followers: 1200000, niche: ["solana","defi","ecosystem"], engagement: 2.1, priceRange: [80,200], reputation: 91 },
  { id: "8", handle: "solana_gamefi_pro", tier: "micro", followers: 55000, niche: ["gamefi","gaming","solana"], engagement: 6.8, priceRange: [4,10], reputation: 79 },
];

export async function POST(req: NextRequest) {
  const { project, budgetSol } = await req.json();

  // Score and filter KOLs
  const scored = KOL_DATABASE.map(kol => {
    let score = 0;
    const nicheMatch = kol.niche.filter(n =>
      project.category?.includes(n) ||
      project.targetAudience?.some((a: string) => a.toLowerCase().includes(n))
    ).length;
    score += Math.min(nicheMatch * 12, 40);
    score += Math.min(kol.engagement * 2.5, 25);
    score += kol.reputation * 0.2;
    return { ...kol, score };
  })
  .filter(k => k.priceRange[0] <= budgetSol)
  .sort((a, b) => b.score - a.score)
  .slice(0, 5);

  // Generate DMs for top 3
  const withMessages = await Promise.all(
    scored.slice(0, 3).map(async kol => {
      const offerSol = Math.floor((kol.priceRange[0] + kol.priceRange[1]) / 2);
      const prompt = `Write a KOL outreach DM for ${project.name} ($${project.ticker}).
KOL: @${kol.handle} (${kol.followers.toLocaleString()} followers, niche: ${kol.niche.join(", ")})
Our offer: ${offerSol} SOL
Max 150 words. Authentic, specific to their niche, clear ask. No cringe opener. Reply with ONLY the message text.`;
      const message = await ask(prompt);
      return { ...kol, offerSol, message: message.trim() };
    })
  );

  return NextResponse.json({ success: true, data: { kols: withMessages, all: scored } });
}
