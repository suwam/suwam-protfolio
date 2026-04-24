import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminOverview from "./pages/admin/AdminOverview.tsx";
import AdminProjects from "./pages/admin/AdminProjects.tsx";
import AdminBlog from "./pages/admin/AdminBlog.tsx";
import AdminMessages from "./pages/admin/AdminMessages.tsx";
import AdminSimple from "./pages/admin/AdminSimple.tsx";
import AdminProfile from "./pages/admin/AdminProfile.tsx";
import AdminChatbot from "./pages/admin/AdminChatbot.tsx";
import AdminSeo from "./pages/admin/AdminSeo.tsx";
import SeoHead from "./components/SeoHead.tsx";
import { ThemeProvider } from "./components/ThemeProvider.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SeoHead />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="achievements" element={<AdminSimple table="achievements" title="Achievements" fields={[{key:"title",label:"Title"},{key:"description",label:"Description",type:"textarea"},{key:"date_text",label:"Date / Year"}]} />} />
            <Route path="certifications" element={<AdminSimple table="certifications" title="Certifications" fields={[{key:"title",label:"Title"},{key:"issuer",label:"Issuer"},{key:"date_text",label:"Date / Year"},{key:"credential_url",label:"Credential URL"}]} />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="chatbot" element={<AdminChatbot />} />
            <Route path="seo" element={<AdminSeo />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
