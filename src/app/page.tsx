'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className={`text-center transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              智能错题本
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              AI驱动的学习助手，让您的每一次错误都成为进步的阶梯
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/add"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                开始使用
              </Link>
              <Link
                href="/dashboard"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                查看演示
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">核心功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '📸',
                title: '智能录入',
                description: '支持拍照、截图、粘贴多种录入方式，AI自动识别题目内容'
              },
              {
                icon: '🤖',
                title: 'AI分析',
                description: '自动生成题目解析、知识点标签和难度评估'
              },
              {
                icon: '📂',
                title: '分类管理',
                description: '按科目、题型、掌握状态多维度分类，轻松管理错题'
              },
              {
                icon: '🔄',
                title: '间隔重复',
                description: '基于SM-2算法的智能复习提醒，科学记忆不遗忘'
              },
              {
                icon: '📊',
                title: '数据统计',
                description: '可视化学习进度和掌握情况，精准定位薄弱环节'
              },
              {
                icon: '🖨️',
                title: '导出打印',
                description: '一键导出错题，支持自定义排版和打印'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">26K+</div>
              <div className="text-gray-600">Anki用户信赖</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">SM-2</div>
              <div className="text-gray-600">间隔重复算法</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary-600 mb-2">3x</div>
              <div className="text-gray-600">复习效率提升</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">准备好提升学习效率了吗？</h2>
          <p className="text-xl mb-8 text-primary-100">
            加入数万学习者的行列，让智能错题本助您一臂之力
          </p>
          <Link
            href="/add"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            立即开始
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2026 智能错题本 - 基于开源项目构建</p>
          <p className="mt-2 text-sm">
            整合了 Anki、wrong-notebook、ErrLog 等优秀开源项目的核心功能
          </p>
        </div>
      </footer>
    </div>
  );
}
