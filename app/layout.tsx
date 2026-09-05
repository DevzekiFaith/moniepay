import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NotificationProvider } from "@/context/NotificationContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AjoPay — Save Small, Grow Big | Money Intelligence",
  description: "Save Small, Grow Big. Real-time personal money intelligence, Open Banking integration and proactive wealth tracking.",
  keywords: ["AjoPay", "save small grow big", "personal finance", "money intelligence", "open banking", "nigeria"],
  icons: {
    icon: "/ajopay-logo-square.png",
    apple: "/ajopay-logo-square.png",
  },
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
        className="min-h-full"
        suppressHydrationWarning
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <AuthProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
