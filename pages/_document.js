import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Script to prevent theme flash - runs before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  var html = document.documentElement;
                  var body = document.body;
                  
                  // Immediately set theme attributes
                  html.setAttribute('data-theme', theme);
                  html.classList.toggle('dark', theme === 'dark');
                  
                  // Force CSS variables
                  html.style.setProperty('--current-theme', theme);
                  html.style.setProperty('color-scheme', theme);
                  
                  // Force body classes
                  if (theme === 'dark') {
                    body.classList.add('dark-mode-persist');
                    body.classList.remove('light-mode');
                  } else {
                    body.classList.remove('dark-mode-persist');
                    body.classList.add('light-mode');
                  }
                  
                  // Prevent flash by hiding content until theme is set
                  html.style.visibility = 'visible';
                } catch (e) {
                  // Fallback to dark mode
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Hide content until theme is set to prevent flash */
              html { visibility: hidden; }
              html[data-theme] { visibility: visible; }
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
