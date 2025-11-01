// server.js
// To install dependencies: npm install express node-fetch

import express from "express";
import fetch from "node-fetch"; // ES module import

const app = express();
app.use(express.json());

// Get your OpenAI API key from environment variable
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const MODEL = "gpt-4"; // Replace with your accessible model

if (!OPENAI_KEY) {
  console.error("Set OPENAI_API_KEY environment variable");
  process.exit(1);
}

// POST /ask endpoint
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "No prompt provided" });

    // Prepare request body for OpenAI Chat Completion
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
    const reply = data.choices?.[0]?.message?.content || "";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// Simple GET endpoint to check server status
app.get("/", (req, res) => {
  res.send("✅ Bacon Admin backend is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));


