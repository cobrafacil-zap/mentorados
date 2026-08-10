import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { FeaturedVideo } from "@/components/VideoLibrary";
import { CallToAction } from "@/components/CallToAction";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedVideo />
        <CallToAction />
      </main>
      <Footer />
    </>
  );
}