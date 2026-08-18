import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iRAM-Services - ระบบบริหารจัดการโครงการวิจัยและงานบริการวิชาการ",
  description: "ระบบเว็บแอปพลิเคชันสำหรับการบริหารจัดการข้อมูลนักวิจัย โครงการวิจัย การตีพิมพ์วารสารวิชาการ และการนัดหมายให้คำปรึกษาอย่างมีประสิทธิภาพ",
};

import Navigation from "@/components/Navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Navigation>
          {children}
        </Navigation>
      </body>
    </html>
  );
}
