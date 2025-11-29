import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ErrorBoundary } from './components/ErrorBoundary';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "New Hampshire Emerging Technologies Caucus",
  description: "A bicameral, bipartisan caucus championing progress and innovation while advocating for thoughtful governance that maximizes societal and economic benefits.",
  icons: {
    icon: [
      { url: "/img/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/img/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/img/favicon/favicon.ico",
    apple: "/img/favicon/apple-touch-icon.png",
  },
  manifest: "/img/favicon/site.webmanifest",
  openGraph: {
    title: "New Hampshire Emerging Technologies Caucus",
    description: "A bicameral, bipartisan caucus championing progress and innovation while advocating for thoughtful governance that maximizes societal and economic benefits.",
    url: "https://emergingtechnh.org",
    type: "website",
    images: [
      {
        url: "https://emergingtechnh.org/img/index.png",
        alt: "New Hampshire Emerging Technologies Caucus",
      },
    ],
  },
  twitter: {
    card: "summary",
    site: "@EmergingTechNH",
    title: "New Hampshire Emerging Technologies Caucus",
    description: "A bicameral, bipartisan caucus championing progress and innovation while advocating for thoughtful governance that maximizes societal and economic benefits.",
    images: ["https://emergingtechnh.org/img/index.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* React Dev Tools */}
        <script src="http://localhost:8097"></script>
      </head>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
        <SpeedInsights />
      </body>
    </html>
  );
}

