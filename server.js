// server.js
// npm install express node-fetch
const express = require("express");
const fetch = require("node-fetch"); // or global fetch in newer node
const app = express();
app.use(express.json());

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const MODEL = "gpt-4"; // replace with whichever model you have access to

if (!OPENAI_KEY) {
  console.error("Set OPENAI_API_KEY environment variable");
  process.exit(1);
}

app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "No prompt provided" });

    // Build request for OpenAI Chat completions (classic example)
    const body = {
      model: MODEL,
      messages: [
        { role: "system", content: "You are Bacon Admin, a short friendly admin-bot." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("OpenAI error:", r.status, text);
      return res.status(500).json({ error: "OpenAI request failed", status: r.status, body: text });
    }

    const data = await r.json();
    // get the assistant reply (adjust path if using responses endpoint)
    const reply = data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : (data.output && data.output[0] && data.output[0].content) || "";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server listening on port", PORT));
