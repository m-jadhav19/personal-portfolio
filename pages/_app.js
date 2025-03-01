import "../styles/globals.css";
import { ThemeProvider } from "next-themes";
import { Analytics } from '@vercel/analytics/next';

const App = ({ Component, pageProps }) => {
  return (
    <ThemeProvider>
      <Component {...pageProps} />
      <Analytics />
    </ThemeProvider>
  );
};

export default App;
