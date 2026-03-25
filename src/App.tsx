import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import GovHeader from "@/components/GovHeader";
import GovFooter from "@/components/GovFooter";
import CitizenPage from "./pages/CitizenPage";
import AdminDashboard from "./pages/AdminDashboard";
import CompliancePage from "./pages/CompliancePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-background">
          <GovHeader />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<CitizenPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/compliance" element={<CompliancePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <GovFooter />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
