import { GoogleGenerativeAI } from "@google/generative-ai";

// Create client with new SDK format
const getAiClient = () => new GoogleGenerativeAI(process.env.API_KEY!);

/**
 * Enhances an image using Gemini.
 */
export const enhanceImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Image,
          mimeType,
        },
      },
      prompt,
    ]);

    // Extract output image
    const parts = result?.response?.candidates?.[0]?.content?.parts;

    if (parts && parts.length > 0) {
      for (const part of parts) {
        if (part.inlineData?.data) return part.inlineData.data;
      }
    }

    throw new Error("No image returned by model.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let message = error.message || "Failed to enhance image.";

    if (
      message.includes("429") ||
      message.includes("quota") ||
      message.includes("RESOURCE_EXHAUSTED") ||
      message.includes("User has exceeded")
    ) {
      message = "Daily AI processing limit reached. Try again later.";
    } else if (message.includes("SAFETY") || message.includes("blocked")) {
      message = "Image blocked by AI safety filters.";
    }

    throw new Error(message);
  }
};

export const getPromptForType = (type: string, customPrompt?: string): string => {
  switch (type) {
    case "High Quality Restore":
      return "Restore quality to photorealistic 8K. Preserve identity and original composition.";
    case "Creative Upscale":
      return "Upscale with cinematic lighting and detailed realism. 8K output.";
    case "Portrait Enhance":
      return "Enhance facial clarity and lighting. Keep background and identity unchanged.";
    case "Custom Prompt":
      return customPrompt || "Enhance the image quality.";
    default:
      return "Enhance this image.";
  }
};