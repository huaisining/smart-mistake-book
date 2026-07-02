"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Brain, BookOpen, RefreshCw, BarChart3, FileText, ArrowRight, Sparkles } from "lucide-react";

const FEATURES = [
  { icon: Camera, title: "智能录入", desc: "拍照、截图、粘贴多种录入方式，AI自动识别题目内容" },
  { icon: Brain, title: "AI分析", desc: "自动生成题目解析、知识点标签、难度评估和举一反三" },
  { icon: BookOpen, title: "分类管理", desc: "按科目、题型、掌握状态多维度分类，轻松管理错题" },
  { icon: RefreshCw, title: "间隔重复", desc: "基于SM-2算法的智能复习提醒，科学记忆不遗忘" },
  { icon: BarChart3, title: "数据统计", desc: "可视化学习进度和掌握情况，精准定位薄弱环节" },
  { icon: FileText, title: "导出打印", desc: "一键导出错题，支持自定义排版和打印" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary-700 text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm backdrop-blur mb-6">
            <Sparkles className="h-3.5 w-3.5" /> AI 驱动的智能错题管理
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">智能错题本</h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-lg mx-auto mb-8">让每一次错误都成为进步的阶梯</p>
          <div className="flex gap-3 justify-center">
            <Link href="/add">
              <Button size="lg" variant="secondary" className="gap-2 font-semibold">开始使用 <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 hover:text-white font-semibold">登录账号</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-center mb-2">核心功能</h2>
          <p className="text-muted-foreground text-center mb-10">全方位覆盖错题管理与复习的每一个环节</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="bg-primary/10 p-2 rounded-lg w-fit"><Icon className="h-5 w-5 text-primary" /></div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/50">
        <div className="mx-auto max-w-3xl px-4 grid grid-cols-3 gap-8 text-center">
          {[{ num: "SM-2", label: "间隔重复算法" }, { num: "KaTeX", label: "数学公式渲染" }, { num: "本地", label: "数据完全离线" }].map(({ num, label }) => (
            <div key={label}><p className="text-2xl font-bold text-primary">{num}</p><p className="text-sm text-muted-foreground mt-1">{label}</p></div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4">
        <Card className="mx-auto max-w-xl text-center bg-primary text-primary-foreground border-0">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-2xl font-bold">准备好提升学习效率了吗？</h2>
            <p className="text-primary-foreground/80">加入智能错题本，让AI助你一臂之力</p>
            <Link href="/add"><Button size="lg" variant="secondary" className="gap-2 font-semibold">立即开始 <ArrowRight className="h-4 w-4" /></Button></Link>
          </CardContent>
        </Card>
      </section>

      <footer className="mt-auto py-6 text-center text-sm text-muted-foreground border-t">
        <p> 2026 智能错题本 · 基于开源项目构建</p>
      </footer>
    </div>
  );
}
