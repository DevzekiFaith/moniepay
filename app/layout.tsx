import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { AuthProvider } from "@/context/AuthContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { InstallAppBanner } from "@/components/pwa/InstallAppBanner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://moniepay.app"),
  title: {
    default: "MoniePay — Nigeria's Nationwide Trader OS & Live Wholesale Radar",
    template: "%s | MoniePay",
  },
  description:
    "Nigeria's nationwide business operating system for informal traders, shops, and wholesale merchants across all 36 States and FCT. 100% offline-ready cash drawer bookkeeping, daily profit tracking, verified stall trust ratings, and live national wholesale depot pricing.",
  applicationName: "MoniePay Trader OS",
  authors: [{ name: "MoniePay Technologies Nigeria", url: "https://moniepay.app" }],
  creator: "MoniePay Technologies Nigeria",
  publisher: "MoniePay OS",
  category: "finance",
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/moniepay-logo-square.png", sizes: "any" },
      { url: "/moniepay-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/moniepay-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/moniepay-logo-square.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MoniePay",
  },
  keywords: [
    "MoniePay",
    "Trader OS Nigeria",
    "Nigeria Business Decision Intelligence",
    "Shop Bookkeeping App Nigeria",
    "Offline POS Slip Generator",
    "Ajo Daily Contribution Tracker",
    "Nigerian Market Wholesale Prices",
    "Mile 12 Ketu Prices",
    "Dawanau Kano Grains Depot",
    "Onitsha Main Market Trade",
    "Ariaria Aba Leather Hub",
    "Bodija Ibadan Market",
    "Oil Mill Port Harcourt",
    "Balogun Market Lagos Island",
    "Wuse Market Abuja FCT",
    "Nigeria Commercial Stall Trust Rating",
    "Daily Profit Calculator Naira",
    "Credit Debt Customer Ledger",
    "Informal Micro Business Nigeria",
  ],
  alternates: {
    canonical: "https://moniepay.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://moniepay.app",
    siteName: "MoniePay",
    title: "MoniePay — Nigeria's Nationwide Trader OS & Live Wholesale Radar",
    description:
      "Know what is happening in your shop. Know what to do next. Operating system for traders across all 36 Nigerian States and FCT.",
    images: [
      {
        url: "/moniepay-icon-512.png",
        width: 512,
        height: 512,
        alt: "MoniePay — Trader OS for All 36 States in Nigeria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MoniePay — Nigeria's Nationwide Trader OS",
    description:
      "Operating system for traders across all 36 Nigerian States and FCT. 100% Offline Ready.",
    site: "@MoniePayHQ",
    creator: "@MoniePayHQ",
    images: ["/moniepay-icon-512.png"],
  },
  other: {
    "geo.region": "NG",
    "geo.placename": "Nigeria",
    "geo.position": "9.0765;7.3986",
    "ICBM": "9.0765, 7.3986",
    "format-detection": "telephone=no",
    "target-country": "NG",
    "mobile-web-app-capable": "yes",
  },
};

const JSON_LD_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://moniepay.app/#app",
      name: "MoniePay Trader OS",
      applicationCategory: "BusinessApplication",
      operatingSystem: "All modern web browsers, Android, iOS, Windows, macOS",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "NGN",
      },
      description:
        "Nationwide business operating system and decision intelligence for informal traders across all 36 Nigerian States and FCT.",
    },
    {
      "@type": "FinancialService",
      "@id": "https://moniepay.app/#organization",
      name: "MoniePay Technologies Nigeria",
      url: "https://moniepay.app",
      logo: "https://moniepay.app/moniepay-icon-512.png",
      description:
        "Operating system and wholesale trade decision intelligence for Nigerian merchants.",
      areaServed: {
        "@type": "Country",
        name: "Nigeria",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 9.0765,
        longitude: 7.3986,
      },
      address: {
        "@type": "PostalAddress",
        addressCountry: "NG",
        addressRegion: "All 36 States and FCT",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_SCHEMA) }}
        />
      </head>
      <body
        className="min-h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500/20 selection:text-blue-950 dark:selection:text-white"
        suppressHydrationWarning
        style={{ fontFamily: "var(--font-sans, system-ui, sans-serif)" }}
      >
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <SubscriptionProvider>
                <TooltipProvider delayDuration={150}>
                  {children}
                  <UpgradeModal />
                  <InstallAppBanner />
                  <ServiceWorkerRegister />
                  <SpeedInsights />
                </TooltipProvider>
              </SubscriptionProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
