export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { idea } = req.body;

  if (!idea) {
    return res.status(400).json({ error: "Idea is required" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a brutally honest startup critic. Respond only in JSON."
          },
          {
            role: "user",
            content: `Analyze this idea:\n${idea}`
          }
        ],
        temperature: 0.7
      }),
    });

    const data = await response.json();

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "AI request failed" });
  }
}