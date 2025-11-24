export interface ImageState {
  file: File | null;
  previewUrl: string | null;
  base64: string | null;
  mimeType: string | null;
}

export interface ProcessingState {
  isProcessing: boolean;
  error: string | null;
  resultBase64: string | null;
}

export enum EnhancementType {
  HIGH_QUALITY = 'High Quality Restore',
  CREATIVE_UPSCALE = 'Creative Upscale',
  PORTRAIT_ENHANCE = 'Portrait Enhance',
  CUSTOM = 'Custom Prompt'
}