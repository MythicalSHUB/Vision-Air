/**
 * Calls backend Gemini processing API
 * (Key is NOT stored in frontend anymore)
 */
export const enhanceImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const response = await fetch("/api/enhance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Image, mimeType, prompt }),
    });

    const data = await response.json();

    if (data.error) {
      // 🔥 Friendly client-side error formatting
      if (
        data.error.includes("quota") ||
        data.error.includes("RESOURCE_EXHAUSTED") ||
        data.error.includes("429")
      ) {
        throw new Error("🔥 You've hit the free Gemini quota limit. Turn on billing or try again tomorrow.");
      }

      if (data.error.includes("API key") || data.error.includes("invalid")) {
        throw new Error("❌ Invalid or missing Gemini API key. Check Vercel environment variables.");
      }

      throw new Error(data.error);
    }

    return data.image; // base64 result returned by server
  } catch (err: any) {
    // Last safety catch so UI never crashes with raw JSON
    return Promise.reject(
      err?.message || "⚠️ Something went wrong communicating with the AI server."
    );
  }
};

/**
 * Returns AI enhancement prompt depending on user selection
 */
export const getPromptForType = (type: string, customPrompt?: string): string => {
  switch (type) {
    case "High Quality Restore":
      return "Create a high-quality, high-resolution version of this image. Improve sharpness, lighting, and details while maintaining original identity. Photorealistic.";

    case "Creative Upscale":
      return "Upscale with cinematic lighting, refined textures, and high visual fidelity.";

    case "Portrait Enhance":
      return "Enhance facial sharpness and lighting while keeping background unchanged. Preserve identity.";

    case "Custom Prompt":
      return customPrompt || "Enhance this image realistically.";

    default:
      return "Improve image clarity and detail.";
  }
};
