import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merchant Sign In & Shop Registration",
  description:
    "Register your Nigerian retail stall or sign in to MoniePay. 1-tap GPS auto-detect your market location, track daily profit, and access offline-ready decision intelligence across all 36 States and FCT.",
  openGraph: {
    title: "MoniePay Merchant Sign In & Shop Registration",
    description:
      "Register your shop with 1-tap GPS auto-detect and track daily profit with 100% offline-ready reliability.",
    url: "https://moniepay.app/login",
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoniePay Merchant Sign In & Shop Registration",
    description:
      "Register your shop with 1-tap GPS auto-detect and track daily profit with 100% offline reliability.",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
