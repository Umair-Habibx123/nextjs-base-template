import "./globals.css";
import Providers from "./providers/index.js";
import { initDatabase } from "../lib/db-init";
import CookieConsent from "./(pages)/components/CookieConsent";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const baseUrl = process.env.FRONTEND_URL;
    const response = await fetch(`${baseUrl}/api/super-admin/settings/global`, {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      const { data } = await response.json();

      if (data?.site_favicon) {
        return {
          title: "Your Application",
          description: "Welcome to our application",
          icons: {
            icon: "/api/public/favicon",
            shortcut: "/api/public/favicon",
            apple: "/api/public/favicon",
          },
        };
      }
    }
  } catch (error) {
    console.error("Error fetching favicon from database:", error);
  }

  return {
    title: "Your Application",
    description: "Welcome to our application",
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await initDatabase();
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
