import { About } from "@/components/About";
import { Capabilities } from "@/components/Capabilities";
import { Experience } from "@/components/Experience";
import { ContactFooter } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Lab } from "@/components/Lab";
import { Metrics } from "@/components/Metrics";
import { FeaturedWork } from "@/components/Projects";
import { TechTicker } from "@/components/TechTicker";

export default function HomePage() {
  return (
    <main id="top">
      <Hero />
      <TechTicker />
      <FeaturedWork />
      <About />
      <Capabilities />
      <Experience />
      <Metrics />
      <Lab />
      <ContactFooter />
    </main>
  );
}
