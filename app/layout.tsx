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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('moniepay_theme');
                var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && supportDarkMode)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (e) {}
            `,
          }}
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
