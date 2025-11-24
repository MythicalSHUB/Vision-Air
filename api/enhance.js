import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { base64Image, mimeType, prompt } = req.body;

    if (!base64Image || !mimeType || !prompt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API Key missing on server." });
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          parts: [
            { inlineData: { data: base64Image, mimeType } },
            { text: prompt }
          ],
        }
      ],
    });

    const candidates = response?.candidates?.[0]?.content?.parts || [];

    for (const part of candidates) {
      if (part.inlineData?.data) {
        return res.status(200).json({ image: part.inlineData.data });
      }
    }

    res.status(500).json({ error: "No output image returned." });

  } catch (err) {
    console.error("Gemini Server Error:", err);
    res.status(500).json({ error: err.message || "Unknown error." });
  }
}
