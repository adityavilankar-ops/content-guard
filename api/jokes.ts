export default async function handler(req: any, res: any) {
  try {
    // Direct link to your active ngrok tunnel path
    const n8nUrl = "https://ngrok-free.dev";

    const response = await fetch(n8nUrl, {
      method: "GET",
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    });

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`);
    }

    const jokeText = await response.text();
    return res.status(200).json({ joke: jokeText });
  } catch (error: any) {
    console.error("Vercel Serverless Joke Error:", error);
    return res.status(500).json({ joke: "🌶️ Comedy club tunnel is booting up... try clicking again!" });
  }
}