import { RequestHandler } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiChatRequest, GeminiChatResponse } from "@shared/api";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const handleGeminiChat: RequestHandler = async (req, res) => {
  try {
    const { message } = req.body as GeminiChatRequest;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("GOOGLE_GEMINI_API_KEY (last 5 chars):", (process.env.GEMINI_API_KEY || "").slice(-5));
    const modelName = "gemini-pro";
    console.log("Using Gemini model:", modelName);

    const model = genAI.getGenerativeModel({ model: modelName });
    if (!model) {
      console.error("Failed to retrieve generative model:", modelName);
      return res.status(500).json({ error: "Failed to retrieve generative model" });
    }

    const result = await model.generateContent(message);
    if (!result || !result.response) {
      console.error("Invalid response from generateContent:", result);
      return res.status(500).json({ error: "Invalid response from AI model" });
    }

    const text = await result.response.text();
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
    console.log("Project ID:", "1092133182363"); // Replace with your actual project ID if different
    console.log("Activation URL:", "https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview?project=1092133182363");
  }
};