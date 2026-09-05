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
  title: "MoniePay — Personal Money Intelligence & Real-Time Finance",
  description: "MoniePay. Real-time personal money intelligence, Open Banking ledger synchronization, and proactive cashflow tracking.",
  keywords: ["MoniePay", "money intelligence", "open banking", "financial audit", "fintech", "nigeria"],
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
