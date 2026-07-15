import type { Metadata } from "next";
import { Sora, Inter, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

// Sora and Inter only ship a "latin" subset, so they have no Thai glyphs at
// all -- and since almost every visible string in this app is Thai, the
// custom typography was silently falling back to whatever default Thai
// font each OS ships (Windows/macOS/Android all differ). Noto Sans Thai
// fills that gap: same weight steps as the two Latin fonts above, placed
// second in each font-family stack, so Latin characters still render with
// Sora/Inter and Thai characters get a real, consistent designed face
// instead of an uncontrolled system fallback.
const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Weight Training Planner",
  description: "สร้างตารางเล่นเวทรายสัปดาห์ที่เหมาะกับเป้าหมาย ระดับ และอุปกรณ์ของคุณ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${sora.variable} ${inter.variable} ${notoSansThai.variable}`}>
      <body className="font-body bg-paper text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
