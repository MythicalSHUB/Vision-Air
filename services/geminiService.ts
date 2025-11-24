import { GoogleGenAI, Modality } from "@google/genai";

// Initialize the Gemini API client
// API Key is injected via process.env.API_KEY
// Using a factory function to ensure we get the latest environment variable if it updates
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Enhances an image using the gemini-2.5-flash-image model.
 * 
 * @param base64Image The base64 string of the source image (excluding data:image/... prefix).
 * @param mimeType The mime type of the image.
 * @param prompt The text prompt describing the enhancement.
 * @returns The base64 string of the generated image.
 */
export const enhanceImage = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    // Extract the image from the response
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts && parts.length > 0) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }

    throw new Error("No image data found in the response.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    let message = error.message || "Failed to enhance image.";

    // Handle Quota/Rate Limit errors gracefully
    // This hides the raw 429 JSON error and presents a clean message
    if (
      message.includes("429") || 
      message.includes("quota") || 
      message.includes("RESOURCE_EXHAUSTED") ||
      message.includes("User has exceeded")
    ) {
      message = "Daily AI processing limit reached. Please try again later.";
    } 
    // Handle Safety Filters
    else if (message.includes("SAFETY") || message.includes("blocked")) {
      message = "Image processing was blocked by safety filters. Please use a different image.";
    }
    // Handle JSON error objects that might be stringified in the message
    else if (message.includes('{"error":')) {
      try {
        const jsonObj = JSON.parse(message.substring(message.indexOf('{')));
        if (jsonObj.error?.code === 429) {
          message = "Daily AI processing limit reached. Please try again later.";
        } else {
          message = jsonObj.error?.message || "An unexpected error occurred with the AI service.";
        }
      } catch (e) {
        // If parsing fails, keep original message but cleaned up
        message = "Service is currently busy. Please try again.";
      }
    }

    throw new Error(message);
  }
};

export const getPromptForType = (type: string, customPrompt?: string): string => {
  switch (type) {
    case 'High Quality Restore':
      return "Create a high-quality, high-resolution version of this image. Improve sharpness, lighting, and details while maintaining the original composition and subject identity exactly. Photorealistic 8k output.";
    case 'Creative Upscale':
      return "Re-imagine this image in ultra-high definition. Add intricate details, dramatic lighting, and rich textures. Make it look like a masterpiece. Cinematic 8k quality.";
    case 'Portrait Enhance':
      return "Enhance the subject's face, skin texture, and lighting in this portrait. Improve sharpness and clarity. STRICTLY PRESERVE the original background and surroundings. Do not remove any objects or change the background. Maintain subject identity exactly.";
    case 'Custom Prompt':
      return customPrompt || "Enhance this image.";
    default:
      return "Make this image high quality.";
  }
};