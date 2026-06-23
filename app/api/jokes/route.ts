import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { type } = await request.json();
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "MISTRAL_API_KEY is missing" }, { status: 500 });
    }

    const systemPrompt = type === "dark" 
      ? "Tell a short, punchy dark humor joke. Max 2 lines. Do not include introductory text." 
      : "Tell a witty, funny joke about Bollywood movies or stars. Max 2 lines. Do not include introductory text.";

    const response = await fetch("https://mistral.ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "mistral-medium",
        messages: [{ role: "user", content: systemPrompt }],
        max_tokens: 100
      })
    });

    const data = await response.json();
    const joke = data.choices?.[0]?.message?.content || "Failed to generate joke.";
    return NextResponse.json({ joke });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}