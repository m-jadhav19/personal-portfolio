import "../styles/globals.css";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger);
}

// Script to prevent theme flash
const ThemeScript = () => {
	useEffect(() => {
		// Immediately set the theme to prevent flash
		const theme = localStorage.getItem('theme') || 'dark'
		document.documentElement.setAttribute('data-theme', theme)
		document.documentElement.classList.toggle('dark', theme === 'dark')
		document.documentElement.style.setProperty('--current-theme', theme)
		document.documentElement.style.setProperty('color-scheme', theme)
	}, [])
	
	return null
}

// Lenis Smooth Scrolling Setup
const SmoothScroll = () => {
	useEffect(() => {
		if (typeof window === 'undefined') return;

		const lenis = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
			direction: 'vertical',
			gestureDirection: 'vertical',
			smooth: true,
			smoothTouch: false,
			touchMultiplier: 2,
		});

		// Store Lenis instance globally for access in other components
		if (typeof window !== 'undefined') {
			window.__lenis__ = lenis;
		}

		// Integrate Lenis with GSAP ScrollTrigger
		function raf(time) {
			lenis.raf(time);
			ScrollTrigger.update();
			requestAnimationFrame(raf);
		}

		requestAnimationFrame(raf);

		// Update ScrollTrigger when scrolling
		lenis.on('scroll', ScrollTrigger.update);

		return () => {
			lenis.destroy();
			if (typeof window !== 'undefined') {
				delete window.__lenis__;
			}
		};
	}, []);

	return null;
};

const App = ({ Component, pageProps }) => {
  return (
    <ThemeProvider 
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      <ThemeScript />
      <SmoothScroll />
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default App;
