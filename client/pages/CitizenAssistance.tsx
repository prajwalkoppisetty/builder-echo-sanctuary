import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Plus, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import { GeminiChatRequest, GeminiChatResponse } from "@shared/api";
import { toast } from "sonner";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

export default function CitizenAssistance() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! How can I assist you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      const userMessage = input.trim();
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: prevMessages.length + 1, text: userMessage, sender: "user" },
      ]);
      setInput("");
      setLoading(true);

      try {
        const requestBody: GeminiChatRequest = { message: userMessage };
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
            <Button type="button" variant="ghost" size="icon" className="text-gray-500" disabled={loading}>
              <Plus className="h-5 w-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" size="icon" className="bg-blue-500 hover:bg-blue-600 text-white" disabled={loading}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}