import type { Metadata } from "next";
import "./globals.css";

import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import UpdatePrompt from "@/components/UpdatePrompt";

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
      <body className={inter.className + " min-h-screen bg-background antialiased"}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <UpdatePrompt />
        </AuthProvider>
      </body>
    </html>
  );
}