'use client';


import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStats } from '@/lib/local-db';
import Sidebar from '@/components/Sidebar';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardStats {
  totalMistakes: number;
  dueForReview: number;
  masteredCount: number;
  todayReviewed: number;
  mistakesBySubject: Array<{ subject: string; count: number }>;
  mistakesByType: Array<{ type: string; count: number }>;
  activityHeatmap: Array<{ date: string; count: number }>;
}

const SUBJECT_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const dueCount = stats?.dueForReview || 0;
  const masteredCount = stats?.masteredCount || 0;
  const totalCount = stats?.totalMistakes || 0;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">学习仪表盘</h1>
            <Link href="/add" className="btn-primary">
              + 添加错题
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">总错题数</div>
              <div className="text-3xl font-bold text-gray-900">{totalCount}</div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">待复习</div>
              <div className="text-3xl font-bold text-red-600">{dueCount}</div>
              <Link href="/review" className="text-sm text-primary-600 hover:underline">
                开始复习 →
              </Link>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">已掌握</div>
              <div className="text-3xl font-bold text-green-600">{masteredCount}</div>
            </div>
            <div className="card">
              <div className="text-sm text-gray-600 mb-1">今日复习</div>
              <div className="text-3xl font-bold text-primary-600">{stats?.todayReviewed || 0}</div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Activity Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">学习趋势（近30天）</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats?.activityHeatmap || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Mistakes by Type */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">错题类型分布</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats?.mistakesByType || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, count }) => `${type}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {(stats?.mistakesByType || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SUBJECT_COLORS[index % SUBJECT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">掌握进度</h3>
            <div className="space-y-4">
              {[0, 1, 2, 3, 4, 5].map((level) => {
                const percentage = totalCount > 0 ? ((masteredCount / totalCount) * 100) : 0;
                return (
                  <div key={level} className="flex items-center">
                    <span className="w-24 text-sm text-gray-600">
                      {level === 0 ? '未开始' : level === 5 ? '已掌握' : `Level ${level}`}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5 ml-4">
                      <div
                        className={`h-2.5 rounded-full ${
                          level >= 4 ? 'bg-green-500' : level >= 2 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${level === 5 ? percentage : (100 / 6)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Link href="/review" className="card hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl mb-2">🔄</div>
              <h3 className="font-semibold mb-1">开始复习</h3>
              <p className="text-sm text-gray-600">
                {dueCount > 0 ? `有 ${dueCount} 道题目等待复习` : '暂无待复习题目'}
              </p>
            </Link>
            <Link href="/add" className="card hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl mb-2">📸</div>
              <h3 className="font-semibold mb-1">添加新错题</h3>
              <p className="text-sm text-gray-600">拍照或粘贴题目内容</p>
            </Link>
            <Link href="/mistakes" className="card hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-semibold mb-1">查看所有错题</h3>
              <p className="text-sm text-gray-600">浏览和管理您的错题本</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
