export interface SplitImageResult {
  id: string;
  data: string;
  position: string;
}

export interface ImageGenerationResult {
  triggerId: string;
  originalImageUrl: string;
  splitImages: SplitImageResult[];
  promptVideo: string;
  error?: string;
}
