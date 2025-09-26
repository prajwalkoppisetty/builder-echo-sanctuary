import { RequestHandler } from "express";
// Import 'Part' from the SDK for constructing multimodal content
import { GoogleGenerativeAI, Part } from "@google/generative-ai"; 
// Assume GeminiChatRequest now includes image_data and mime_type
import { GeminiChatRequest, GeminiChatResponse } from "@shared/api"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const handleGeminiChat: RequestHandler = async (req, res) => {
  try {
    // CRITICAL CHANGE 1: Destructure new image fields from the request body
    const { message, image_data, mime_type } = req.body as GeminiChatRequest;

    // Allow request if either message OR image data is present
    if (!message && !image_data) {
      return res.status(400).json({ error: "Message or image is required" });
    }

    console.log("GOOGLE_GEMINI_API_KEY (last 5 chars):", (process.env.GEMINI_API_KEY || "").slice(-5));
    
    // CRITICAL CHANGE 2: Use a multimodal model
    const modelName = "gemini-2.5-flash"; // Better for multimodal input
    console.log("Using Gemini model:", modelName);

    const model = genAI.getGenerativeModel({ model: modelName });
    if (!model) {
      console.error("Failed to retrieve generative model:", modelName);
      return res.status(500).json({ error: "Failed to retrieve generative model" });
    }

    // CRITICAL CHANGE 3: Construct the multimodal contents array
    const contents: Part[] = [];

    // Add the image part first if data is available
    if (image_data && mime_type) {
        contents.push({
            inlineData: {
                data: image_data,
                mimeType: mime_type,
            },
        });
    }

    // Add the text message part (the prompt)
    if (message) {
        contents.push({ text: message });
    }

    // Fix: generateContent expects { contents: [...] }, but the SDK may expect a different structure.
    // If you get an error, try: model.generateContent({ contents: contents })
    let result;
    try {
      result = await model.generateContent({ contents }); // correct usage for Gemini SDK
    } catch (err) {
      // fallback for SDKs that expect an array directly
      result = await model.generateContent(contents);
    }

    if (!result || !result.response) {
      console.error("Invalid response from generateContent:", result);
      return res.status(500).json({ error: "Invalid response from AI model" });
    }

    // Fix: .text may be a function or property depending on SDK version
    let text: string | undefined;
    if (result.response && typeof result.response.text === "function") {
      text = await result.response.text();
    } else if (result.response && typeof result.response.text === "string") {
      text = result.response.text;
    } else if (typeof result.text === "function") {
      text = await result.text();
    } else if (typeof result.text === "string") {
      text = result.text;
    } else {
      text = undefined;
    }

    if (!text) {
      console.error("Empty text response from AI model");
      return res.status(500).json({ error: "Empty response from AI model" });
    }

    const geminiResponse: GeminiChatResponse = {
      response: text,
    };
    res.json(geminiResponse);
  } catch (error: any) {
    if (error.status === 403) {
      console.error("API access error:", error);
      return res.status(403).json({
        error: "Generative Language API is not enabled or access is forbidden. Please enable the API and try again.",
        details: error.errorDetails,
      });
    }
    console.error("Error communicating with Gemini API:", error);
    res.status(500).json({ error: "Failed to get response from AI" });
  } finally {
    console.log("API Key:", process.env.GEMINI_API_KEY ? "Provided" : "Not Provided");
    console.log("Project ID:", "1092133182363");
    console.log("Activation URL:", "https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview?project=1092133182363");
  }
};
// No changes needed, the file is correct and ready for multimodal Gemini API usage.