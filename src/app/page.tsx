import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { MethodExplainer } from "@/components/MethodExplainer";
import { HowItWorks } from "@/components/HowItWorks";
import { VideoLibrary } from "@/components/VideoLibrary";
import { MetricsDashboard } from "@/components/MetricsDashboard";
import { ToolsGrid } from "@/components/ToolsGrid";
import { EvasionCalculator } from "@/components/EvasionCalculator";
import { CallToAction } from "@/components/CallToAction";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <MethodExplainer />
        <HowItWorks />
        <VideoLibrary />
        <ToolsGrid />
        <EvasionCalculator />
        <MetricsDashboard />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}
