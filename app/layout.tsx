import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/context/NotificationContext";
import { AuthProvider } from "@/context/AuthContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { UpgradeModal } from "@/components/subscription/UpgradeModal";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "MoniePay — Business Decision Intelligence OS",
  description: "Know what is happening in your business. Know what to do next. Operating system for Nigeria's informal and micro-business economy.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MoniePay",
  },
  keywords: ["MoniePay", "Business Decision Intelligence", "Nigeria SME", "Shop Operating System", "Cash POS Debt"],
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
      <body
        className="min-h-full bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500/20 selection:text-emerald-900"
        suppressHydrationWarning
        style={{ fontFamily: "var(--font-sans, system-ui, sans-serif)" }}
      >
        <AuthProvider>
          <NotificationProvider>
            <SubscriptionProvider>
              <TooltipProvider delayDuration={150}>
                {children}
                <UpgradeModal />
                <ServiceWorkerRegister />
                <SpeedInsights />
              </TooltipProvider>
            </SubscriptionProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
