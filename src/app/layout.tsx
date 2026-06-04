import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iRAM-Services - ระบบบริหารจัดการโครงการวิจัยและงานบริการวิชาการ",
  description: "ระบบเว็บแอปพลิเคชันสำหรับการบริหารจัดการข้อมูลนักวิจัย โครงการวิจัย การตีพิมพ์วารสารวิชาการ และการนัดหมายให้คำปรึกษาอย่างมีประสิทธิภาพ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
