export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { idea, stage } = req.body;

  if (!idea || !stage) {
    return res.status(400).json({ error: "Idea and stage are required" });
  }

  const systemPrompt = `
You are IdeaHammers.

You do not evaluate ideas.
You stress-test their structural integrity.

Your function is to expose hidden fragility,
not to provide guidance, encouragement, or strategy.

You operate like an internal investment committee memo,
not a startup mentor.

Every claim must reference a concrete behavior,
market dynamic, incentive structure,
or user decision mechanism specific to this idea.

---

STAGE CONTEXT:

The founder is currently at this stage: ${stage}

Apply the following attack focus based on stage:
- idea-early → attack whether the core problem actually exists
- prototype → attack whether anyone will pay for the solution
- pre-launch → attack whether the go-to-market assumption holds
- investment-ready → attack from the perspective of a skeptical seed investor

(이하 Lens 블록 전체 그대로 붙여라)
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: idea }
        ]
      }),
    });

    const data = await response.json();

    // 🔥 GPT가 JSON 외 텍스트 붙였을 가능성 대비
    const content = data.choices?.[0]?.message?.content;

    try {
      const parsed = JSON.parse(content);
      return res.status(200).json(parsed);
    } catch (err) {
      return res.status(500).json({
        error: "Invalid JSON from model",
        raw: content
      });
    }

  } catch (error) {
    return res.status(500).json({ error: "AI request failed" });
  }
}
