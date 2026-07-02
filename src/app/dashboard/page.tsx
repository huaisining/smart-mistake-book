"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getStats } from "@/lib/local-db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, BarChart3, PlusCircle, RefreshCw, TrendingUp, Target } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

interface DashboardStats {
  totalMistakes: number; dueForReview: number; masteredCount: number; todayReviewed: number;
  mistakesBySubject: Array<{ subject: string; count: number }>;
  mistakesByType: Array<{ type: string; count: number }>;
  activityHeatmap: Array<{ date: string; count: number }>;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const TYPE_LABELS: Record<string, string> = { concept: "概念不清", careless: "计算失误", time: "时间不足", other: "其他" };

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);
  const fetchData = async () => {
    try { setStats(await getStats()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  const total = stats?.totalMistakes || 0;
  const due = stats?.dueForReview || 0;
  const mastered = stats?.masteredCount || 0;
  const today = stats?.todayReviewed || 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">学习仪表盘</h1>
          <p className="text-muted-foreground text-sm mt-1">掌握你的学习进度，高效复习</p>
        </div>
        <Link href="/add">
          <Button className="gap-2"><PlusCircle className="h-4 w-4" /> 添加错题</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex flex-col items-center text-center">
          <BookOpen className="h-5 w-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{total}</p>
          <p className="text-xs text-muted-foreground">总错题数</p>
        </CardContent></Card>
        <Card className="border-red-200 bg-red-50/50"><CardContent className="p-4 flex flex-col items-center text-center">
          <Target className="h-5 w-5 text-red-500 mb-2" />
          <p className="text-2xl font-bold text-red-600">{due}</p>
          <p className="text-xs text-red-500">待复习</p>
          {due > 0 && <Link href="/review" className="mt-2"><Badge variant="destructive" className="cursor-pointer">立即复习 →</Badge></Link>}
        </CardContent></Card>
        <Card className="border-green-200 bg-green-50/50"><CardContent className="p-4 flex flex-col items-center text-center">
          <TrendingUp className="h-5 w-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-green-600">{mastered}</p>
          <p className="text-xs text-green-500">已掌握</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex flex-col items-center text-center">
          <RefreshCw className="h-5 w-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{today}</p>
          <p className="text-xs text-muted-foreground">今日复习</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">学习趋势（近30天）</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats?.activityHeatmap || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">错题类型分布</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={(stats?.mistakesByType || []).map(t => ({ ...t, type: TYPE_LABELS[t.type] || t.type }))}
                  cx="50%" cy="50%" outerRadius={90} dataKey="count"
                  label={({ type, count }: any) => count > 0 ? type : ""} labelLine
                >
                  {(stats?.mistakesByType || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { href: "/review", icon: RefreshCw, label: "开始复习", desc: due > 0 ? due + " 题待复习" : "暂无待复习", color: "text-blue-600 bg-blue-50" },
          { href: "/add", icon: PlusCircle, label: "添加新错题", desc: "拍照或粘贴题目", color: "text-purple-600 bg-purple-50" },
          { href: "/mistakes", icon: BookOpen, label: "查看错题本", desc: "浏览所有错题", color: "text-emerald-600 bg-emerald-50" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                <div className={"p-2 rounded-full " + item.color}>
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
