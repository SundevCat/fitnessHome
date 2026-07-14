import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
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
    <html lang="th" className={`${sora.variable} ${inter.variable}`}>
      <body className="font-body bg-paper text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
