import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import AtletasPage from "./pages/AtletasPage.tsx";
import CompeticoesPage from "./pages/CompeticoesPage.tsx";
import TreinosPage from "./pages/TreinosPage.tsx";
import GeekPage from "./pages/GeekPage.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/paceone">
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/atletas" element={<AtletasPage />} />
            <Route path="/competicoes" element={<CompeticoesPage />} />
            <Route path="/treinos" element={<TreinosPage />} />
            <Route path="/geek" element={<GeekPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
