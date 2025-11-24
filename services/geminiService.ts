/**
 * Calls backend Gemini processing API
 * (Key is NOT stored in frontend anymore)
 */
export const enhanceImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  const response = await fetch("/api/enhance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64Image, mimeType, prompt }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.image; // base64 result returned by server
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
      return "Enhance the subject's face, skin texture, and lighting. Improve sharpness and clarity. KEEP the background unchanged and preserve identity.";

    case "Custom Prompt":
      return customPrompt || "Enhance this image.";

    default:
      return "Make this image high quality.";
  }
};
