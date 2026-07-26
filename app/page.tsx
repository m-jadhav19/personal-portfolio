import { About } from "@/components/About";
import { ContactFooter } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { FeaturedWork } from "@/components/Projects";
import { Services } from "@/components/Services";

export default function HomePage() {
  return (
    <main id="top">
      <Hero />
      <About />
      <FeaturedWork />
      <Services />
      <ContactFooter />
    </main>
  );
}
