import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function ask(prompt: string): Promise<string> {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export function parseJSON<T>(raw: string, fallback: T): T {
  const clean = raw.replace(/```json|```/g, "").trim();
  try { return JSON.parse(clean); }
  catch { return fallback; }
}
