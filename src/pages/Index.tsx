import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WeatherSection from "@/components/WeatherSection";
import LevelSystemSection from "@/components/LevelSystemSection";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <WeatherSection />
    <LevelSystemSection />
    <Footer />
  </div>
);

export default Index;
