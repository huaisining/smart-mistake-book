'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            导航
          </h3>
          <nav className="mt-2 space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'overview'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="mr-3">📊</span>
              概览
            </Link>
            <Link
              href="/mistakes"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50`}
              onClick={() => setActiveTab('mistakes')}
            >
              <span className="mr-3">📝</span>
              所有错题
            </Link>
            <Link
              href="/notebooks"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50`}
              onClick={() => setActiveTab('notebooks')}
            >
              <span className="mr-3">📂</span>
              管理错题本
            </Link>
            <Link
              href="/review"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50`}
              onClick={() => setActiveTab('review')}
            >
              <span className="mr-3">🔄</span>
              复习模式
            </Link>
            <Link
              href="/add"
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50`}
              onClick={() => setActiveTab('add')}
            >
              <span className="mr-3">➕</span>
              添加错题
            </Link>
          </nav>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            错题本
          </h3>
          <nav className="mt-2 space-y-1">
            <Link
              href="/notebooks/math"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
            >
              <span className="w-3 h-3 rounded-full bg-red-500 mr-3"></span>
              数学
            </Link>
            <Link
              href="/notebooks/physics"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
            >
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-3"></span>
              物理
            </Link>
            <Link
              href="/notebooks/english"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
            >
              <span className="w-3 h-3 rounded-full bg-green-500 mr-3"></span>
              英语
            </Link>
          </nav>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            标签
          </h3>
          <nav className="mt-2 space-y-1">
            <button className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 w-full">
              <span className="w-3 h-3 rounded-full bg-purple-500 mr-3"></span>
              概念理解
            </button>
            <button className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 w-full">
              <span className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></span>
              计算错误
            </button>
            <button className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 w-full">
              <span className="w-3 h-3 rounded-full bg-orange-500 mr-3"></span>
              审题不清
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
}
