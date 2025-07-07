import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WHIX - Delivery Dystopia",
  description: "Navigate the gig economy dystopia of Polanco as a delivery courier",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {/* Accessibility: Skip to content link */}
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>
          
          {/* Main content */}
          <main id="main-content">
            {children}
          </main>
          
          {/* SVG filters for color blind modes */}
          <svg className="color-blind-filters" aria-hidden="true">
            <defs>
              <filter id="protanopia-filter">
                <feColorMatrix type="matrix" values="
                  0.567, 0.433, 0,     0, 0
                  0.558, 0.442, 0,     0, 0
                  0,     0.242, 0.758, 0, 0
                  0,     0,     0,     1, 0
                "/>
              </filter>
              
              <filter id="deuteranopia-filter">
                <feColorMatrix type="matrix" values="
                  0.625, 0.375, 0,   0, 0
                  0.7,   0.3,   0,   0, 0
                  0,     0.3,   0.7, 0, 0
                  0,     0,     0,   1, 0
                "/>
              </filter>
              
              <filter id="tritanopia-filter">
                <feColorMatrix type="matrix" values="
                  0.95, 0.05,  0,     0, 0
                  0,    0.433, 0.567, 0, 0
                  0,    0.475, 0.525, 0, 0
                  0,    0,     0,     1, 0
                "/>
              </filter>
            </defs>
          </svg>
        </SessionProvider>
      </body>
    </html>
  );
}
