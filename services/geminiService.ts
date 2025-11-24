import { GoogleGenAI } from "@google/genai";

// Get API Key (supports Vercel + Vite local dev)
const getApiKey = () => {
  return (
    process.env.API_KEY || // Server-side
    import.meta.env.VITE_API_KEY // Client-side build
  );
};

// Initialize the Gemini API client
const getAiClient = () => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("⚠️ Gemini API Key Missing. Set API_KEY or VITE_API_KEY in environment.");
  }

  return new GoogleGenAI({ apiKey });
};

/**
 * Enhances an image using the Gemini model.
 * @returns base64 enhanced image
 */
export const enhanceImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType,
              },
            },
            { text: prompt },
          ],
        },
      ],
    });

    const candidates = response.candidates;
    if (candidates?.length) {
      const parts = candidates[0].content?.parts;
      let fallbackMessage = "";

      for (const part of parts ?? []) {
        if (part.inlineData?.data) return part.inlineData.data;
        if (part.text) fallbackMessage += part.text;
      }

      if (fallbackMessage) {
        throw new Error(`Gemini Response: ${fallbackMessage}`);
      }
    }

    throw new Error("❌ No image returned from Gemini.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);

    let message = error.message || "Failed to enhance image.";

    if (message.includes("429") || message.includes("quota")) {
      message = "🚫 AI Limit reached. Try again later.";
    } else if (message.includes("SAFETY")) {
      message = "⚠️ Blocked by safety filter. Try a different image.";
    } else if (message.includes("API key not valid")) {
      message = "🔑 Invalid API Key — check Vercel Environment Variables.";
    }

    throw new Error(message);
  }
};

export const getPromptForType = (type: string, customPrompt?: string): string => {
  switch (type) {
    case "High Quality Restore":
      return "Restore image with extreme clarity, accurate colors, sharp texture, and realistic lighting. Preserve identity. Output in 8K.";
    case "Creative Upscale":
      return "Upscale and enhance with rich detail, cinematic lighting, and advanced realism. 8K output.";
    case "Portrait Enhance":
      return "Improve facial clarity, smooth skin naturally, enhance lighting and sharpness. KEEP background unchanged.";
    case "Custom Prompt":
      return customPrompt || "Enhance the image realistically.";
    default:
      return "Make this image high quality.";
  }
};
