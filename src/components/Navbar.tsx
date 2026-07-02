"use client";

import Link from "next/link";
import { useState } from "react";
import { checkForUpdateWithToast, downloadUpdate } from "@/lib/update-checker";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { BookOpen, BarChart3, PlusCircle, Menu, X, RefreshCw, Download } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: BarChart3, label: "仪表盘" },
  { href: "/mistakes", icon: BookOpen, label: "错题本" },
  { href: "/review", icon: RefreshCw, label: "复习" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleCheckUpdate = async () => {
    const u = await checkForUpdateWithToast();
    if (u) downloadUpdate(u.apkUrl);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="text-2xl">📎</span>
          <span className="bg-gradient-to-r from-primary to-primary-500 bg-clip-text text-transparent">
            智能错题本
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="ghost" size="sm" className="gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
          <button onClick={handleCheckUpdate} title="检查更新">
            <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
          </button>
          <Link href="/add">
            <Button size="sm" className="gap-2 ml-2">
              <PlusCircle className="h-4 w-4" />
              添加错题
            </Button>
          </Link>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-3 space-y-2">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-3" size="sm">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
          <hr className="my-1" />
          <button onClick={() => { handleCheckUpdate(); setMobileOpen(false); }} className="w-full">
            <Button variant="ghost" className="w-full justify-start gap-3" size="sm">
              <Download className="h-4 w-4" /> 检查更新
            </Button>
          </button>
          <Link href="/add" onClick={() => setMobileOpen(false)}>
            <Button className="w-full gap-2" size="sm">
              <PlusCircle className="h-4 w-4" />
              添加错题
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}