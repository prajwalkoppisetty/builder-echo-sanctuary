import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Navbar from "@/components/Navbar";
import AuthPage from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Complaints from "@/pages/Complaints";
import MapPage from "@/pages/Map";
import Volunteers from "@/pages/Volunteers";
import Emergency from "@/pages/Emergency";
import Feedback from "@/pages/Feedback";
import Placeholder from "@/pages/Placeholder";
import CitizenAssistance from "@/pages/CitizenAssistance";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/volunteers" element={<Volunteers />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<AuthPage />} />
            <Route path="/citizen-assistance" element={<CitizenAssistance />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
