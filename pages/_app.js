import "../styles/globals.css";
import { ThemeProvider } from "next-themes";
import { useEffect } from "react";

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

const App = ({ Component, pageProps }) => {
  return (
    <ThemeProvider 
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      <ThemeScript />
      <Component {...pageProps} />
    </ThemeProvider>
  );
};

export default App;
