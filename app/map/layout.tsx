import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All-Nigeria Vendor Discovery Map & Live Wholesale Radar",
  description:
    "Explore verified Nigerian retail stalls, directions, and live depot commodity prices across all 36 States and FCT (Kano, Abuja, Onitsha, Aba, Port Harcourt, Ibadan, Lagos). Auto-detect your GPS to locate shops near you.",
  openGraph: {
    title: "MoniePay All-Nigeria Vendor Discovery Map",
    description:
      "Explore verified Nigerian retail stalls, directions, and live depot prices across all 36 States and FCT.",
    url: "https://moniepay.app/map",
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "MoniePay All-Nigeria Vendor Discovery Map",
    description:
      "Discover verified Nigerian merchants and live depot prices near you.",
  },
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
