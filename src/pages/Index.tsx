import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import SkillsSection from "@/components/sections/SkillsSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import AchievementsSection from "@/components/sections/AchievementsSection";
import CertificationsSection from "@/components/sections/CertificationsSection";
import FeaturedBlogSection from "@/components/sections/FeaturedBlogSection";
import ContactSection from "@/components/sections/ContactSection";
import Chatbot from "@/components/chat/Chatbot";

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <main>
      <HeroSection />
      <AboutSection />
      <SkillsSection />
      <ProjectsSection />
      <ExperienceSection />
      <AchievementsSection />
      <CertificationsSection />
      <FeaturedBlogSection />
      <ContactSection />
    </main>
    <Footer />
    <Chatbot />
  </div>
);

export default Index;
