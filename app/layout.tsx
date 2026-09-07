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
  title: "AJO — Personal Money Intelligence | Your money. Understood.",
  description: "AJO automatically observes financial activity from connected accounts, understands transactions, organizes information, analyzes patterns, and explains your money story.",
  keywords: ["AJO", "money intelligence", "personal finance", "open banking", "automated finance"],
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
