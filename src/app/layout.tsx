import type { Metadata } from "next";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Inter } from "next/font/google";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "智能错题本 - Smart Mistake Book",
  description: "基于AI的智能错题管理系统，帮助您高效整理、分析和复习错题",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
