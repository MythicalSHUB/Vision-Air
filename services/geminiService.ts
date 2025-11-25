import { GoogleGenAI } from "@google/genai";

/**
 * Calls Gemini API directly from the client.
 * Uses the API Key injected via window.process in index.html.
 */
export const enhanceImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  // Access window explicitly to bypass potential bundler polyfills of 'process'
  // The index.html file defines window.process.env.API_KEY
  const apiKey = (window as any).process?.env?.API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Please check your configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
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

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No response from AI model.");
    }

    const content = candidates[0].content;
    if (!content || !content.parts) {
      throw new Error("Empty content received from AI.");
    }

    // 1. Check for valid image output
    for (const part of content.parts) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }

    // 2. Check for text refusal (e.g., safety filters)
    for (const part of content.parts) {
      if (part.text) {
        throw new Error(`AI Refusal: ${part.text}`);
      }
    }

    throw new Error("The model did not return an image. Please try a different prompt or image.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Enhance the error message for the UI
    let msg = error.message || "An unexpected error occurred.";
    if (msg.includes("400") || msg.includes("INVALID_ARGUMENT")) {
        msg = "Bad Request: Check your image format or prompt.";
    } else if (msg.includes("401") || msg.includes("API key")) {
        msg = "Invalid API Key.";
    } else if (msg.includes("500") || msg.includes("503")) {
        msg = "AI Service is temporarily busy. Please retry.";
    }
    throw new Error(msg);
  }
};


/**
 * Returns AI enhancement prompt depending on user selection
 */
export const getPromptForType = (type: string, customPrompt?: string): string => {
  switch (type) {
    case "High Quality Restore":
      return "Create a high-quality, high-resolution version of this image. Improve sharpness, lighting, and details while maintaining the original composition and subject identity exactly. Photorealistic 8K output.";

    case "Creative Upscale":
      return "Re-imagine this image in ultra-high definition. Add intricate details, dramatic lighting, and rich textures. Cinematic 8K quality.";

    case "Portrait Enhance":
      return "Enhance the subject's face, skin texture, and lighting. Improve sharpness and clarity.";

    case "Custom Prompt":
      return customPrompt || "Enhance this image.";

    default:
      return "Make this image high quality.";
  }
};