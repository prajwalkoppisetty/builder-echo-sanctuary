import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Included Upload icon
import { Send, Plus, BrainCircuit, Upload } from "lucide-react"; 
import { cn } from "@/lib/utils";
import { GeminiChatRequest, GeminiChatResponse } from "@shared/api";
import { toast } from "sonner";

// Utility function to convert File to Base64 Part
const fileToGenerativePart = (file: File) => {
    return new Promise<{ data: string; mimeType: string }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Get the Base64 part after the header (e.g., "data:image/jpeg;base64,")
            const base64Data = (reader.result as string).split(',')[1];
            resolve({
                data: base64Data,
                mimeType: file.type,
            });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file); // Reads the file as a data URL (Base64)
    });
};

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

export default function CitizenAssistance() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! How can I assist you today? You can also upload an image for me to analyze.", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  // NEW: State for selected image file
  const [selectedImage, setSelectedImage] = useState<File | null>(null); 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if either text input OR an image is present
    if (input.trim() || selectedImage) { 
        
      // Use the text input, or a default prompt if only an image is uploaded
      const userMessage = input.trim() || "Please provide a detailed caption and analysis for this image.";
      const imageFile = selectedImage;

      // 1. Add user message/image to the chat display
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: prevMessages.length + 1, text: userMessage, sender: "user" },
      ]);
      
      setInput("");
      setSelectedImage(null); // Clear image after submission
      setLoading(true);

      try {
        let requestBody: GeminiChatRequest = { message: userMessage };

        // 2. Process the image file if it exists
        if (imageFile) {
            const imagePart = await fileToGenerativePart(imageFile);
            requestBody.image_data = imagePart.data; // Base64 data
            requestBody.mime_type = imagePart.mimeType; // MIME type (e.g., image/jpeg)
        }

        // 3. Send the request to the backend
        const response = await fetch("/api/gemini-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: GeminiChatResponse = await response.json();
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: prevMessages.length + 1, text: data.response, sender: "bot" },
        ]);
      } catch (error) {
        console.error("Error sending message to AI bot:", error);
        toast.error("Failed to get response from AI bot.");
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: prevMessages.length + 1, text: "Sorry, I'm having trouble connecting to the AI bot. Please try again later.", sender: "bot" },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 min-h-[calc(100vh-4rem)] bg-gradient-to-br from-orange-50 to-green-50 via-white">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Citizen Assistance AI Bot</CardTitle>
          <BrainCircuit className="h-6 w-6 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-xs p-3 rounded-lg",
                    message.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  )}
                >
                  {message.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="bg-white p-4 border-t flex items-center gap-2">
            
            {/* Hidden File Input */}
            <input
                type="file"
                id="image-upload"
                accept="image/png, image/jpeg, image/webp"
                onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                        setSelectedImage(e.target.files[0]);
                        toast.info(`Image selected: ${e.target.files[0].name}`);
                    }
                }}
                className="hidden"
            />
            
            {/* Button to trigger file input */}
            <label htmlFor="image-upload" className="cursor-pointer">
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    // Highlight the button if an image is selected
                    className={cn(
                        "text-gray-500", 
                        selectedImage ? "bg-orange-100 text-orange-600 hover:bg-orange-200" : ""
                    )} 
                    disabled={loading}
                >
                    {/* Replaced Plus with Upload icon */}
                    <Upload className="h-5 w-5" /> 
                </Button>
            </label>
            
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedImage ? `Ask a question about ${selectedImage.name}...` : "Type your message..."}
              className="flex-1"
              disabled={loading}
            />
            
            {/* Submit button enabled if there's text OR an image */}
            <Button 
                type="submit" 
                size="icon" 
                className="bg-blue-500 hover:bg-blue-600 text-white" 
                disabled={loading || (!input.trim() && !selectedImage)}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 