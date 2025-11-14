import "./globals.css";
import Providers from "./providers/index.js";
import CookieConsent from "./(pages)/components/CookieConsent";

export const metadata = {
  title: "Your Application",
  description: "Welcome to our application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
            `,
          }}
        />
      </head>
      <body className="bg-base-200 text-base-content min-h-screen flex flex-col">
        <Providers>
          <div className="flex-1">{children}</div>
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
