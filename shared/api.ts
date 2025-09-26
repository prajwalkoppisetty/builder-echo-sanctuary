// Shared code between client and server

// ... existing types ...

export interface GeminiChatRequest {
  message: string;
  // NEW: Optional properties for image data
  image_data?: string; 
  mime_type?: string; 
}

export interface GeminiChatResponse {
  response: string;
}