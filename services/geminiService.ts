import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
// Using function so newest env key is used
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is configured.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Enhances an image using the Gemini model.
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
    
    // Use gemini-2.5-flash-image for general image generation and editing tasks
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [
        {
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
        }
      ],
      // Ensure no responseMimeType is set as it is not supported for nano banana models
    });

    // Extract the image from the response
    // The response might contain multiple parts (text, image), so we iterate to find the image.
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      const parts = candidates[0].content?.parts;
      if (parts) {
        let textResponse = '';
        
        for (const part of parts) {
          // Check for image data
          if (part.inlineData?.data) {
            return part.inlineData.data;
          }
          // Capture text response in case image is missing (usually implies refusal/error)
          if (part.text) {
            textResponse += part.text;
          }
        }

        // If we found text but no image, throw the text as the error
        if (textResponse) {
           throw new Error(`Model Response: ${textResponse}`);
        }
      }
    }

    throw new Error("No image data found in the response. The model may have refused the request or failed to generate output.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    let message = error.message || "Failed to enhance image.";

    // Handle Quota/Rate Limit errors
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
    // Handle API Key errors
    else if (message.includes("API key not valid") || message.includes("API_KEY_INVALID")) {
      message = "The provided API Key is invalid. Please check your configuration.";
    }
    // Handle JSON-like error messages
    else if (message.includes('{"error":')) {
      try {
        const jsonObj = JSON.parse(message.substring(message.indexOf('{')));
        if (jsonObj.error?.code === 429) {
          message = "Daily AI processing limit reached. Please try again later.";
        } else {
          message = jsonObj.error?.message || "An unexpected error occurred with the AI service.";
        }
      } catch (e) {
        message = "Service is currently busy. Please try again.";
      }
    }

    throw new Error(message);
  }
};

export const getPromptForType = (type: string, customPrompt?: string): string => {
  switch (type) {
    case 'High Quality Restore':
      return "Create a high-quality, high-resolution version of this image. Improve sharpness, lighting, and details while maintaining the original composition and subject identity exactly. Photorealistic 8K output.";

    case 'Creative Upscale':
      return "Re-imagine this image in ultra-high definition. Add intricate details, dramatic lighting, and rich textures. Cinematic 8K quality.";

    case 'Portrait Enhance':
      return "Enhance the subject's face, skin texture, and lighting in this portrait. Improve sharpness and clarity. STRICTLY PRESERVE the original background and surroundings. Maintain subject identity exactly.";

    case 'Custom Prompt':
      return customPrompt || "Enhance this image.";

    default:
      return "Make this image high quality.";
  }
};