'use client';


import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

interface Mistake {
  id: string;
  title?: string;
  content: string;
  answer?: string;
  explanation?: string;
  imageUrl?: string;
  mistakeType: string;
  difficulty: number;
  masteryLevel: number;
  nextReviewDate: string;
  notebookId: string;
  createdAt: string;
  tags?: Array<{ tag: { name: string; color: string } }>;
}

const MASTERY_LABELS = ['未学习', '了解', '熟悉', '掌握中', '熟练', '已掌握'];
const MASTERY_COLORS = ['red', 'orange', 'yellow', 'lime', 'green', 'emerald'];
const TYPE_LABELS: Record<string, string> = {
  concept: '概念不理解',
  careless: '粗心错误',
  time: '时间不足',
  other: '其他'
};

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'due'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMistakes();
  }, [filter]);

  const fetchMistakes = async () => {
    try {
      const response = await fetch(`/api/mistakes?${filter === 'due' ? 'due=true' : ''}`);
      if (response.ok) {
        const data = await response.json();
        setMistakes(data);
      }
    } catch (error) {
      console.error('Failed to fetch mistakes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMistakes = mistakes.filter(m =>
    m.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">错题本</h1>
            <Link href="/add" className="btn-primary">
              + 添加错题
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="搜索错题..."
                className="input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                className={`px-4 py-2 rounded-lg ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
                onClick={() => setFilter('all')}
              >
                全部错题
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  filter === 'due'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
                onClick={() => setFilter('due')}
              >
                待复习
              </button>
            </div>
          </div>

          {/* Mistakes List */}
          {filteredMistakes.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold mb-2">暂无错题</h3>
              <p className="text-gray-600 mb-6">开始添加您的第一道错题吧</p>
              <Link href="/add" className="btn-primary inline-block">
                添加错题
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMistakes.map((mistake) => (
                <div key={mistake.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">
                        {mistake.title || '未命名题目'}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{mistake.content}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium bg-${MASTERY_COLORS[mistake.masteryLevel]}-100 text-${MASTERY_COLORS[mistake.masteryLevel]}-800`}
                      >
                        {MASTERY_LABELS[mistake.masteryLevel]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(mistake.nextReviewDate).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {TYPE_LABELS[mistake.mistakeType] || mistake.mistakeType}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      难度: {'⭐'.repeat(mistake.difficulty)}
                    </span>
                    {mistake.tags?.map((tagItem, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs rounded"
                        style={{
                          backgroundColor: `${tagItem.tag.color}20`,
                          color: tagItem.tag.color
                        }}
                      >
                        {tagItem.tag.name}
                      </span>
                    ))}
                  </div>

                  {mistake.imageUrl && (
                    <div className="mt-3">
                      <img
                        src={mistake.imageUrl}
                        alt="题目截图"
                        className="max-h-48 rounded-lg object-contain"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 mt-4">
                    <Link href={`/mistakes/${mistake.id}`} className="btn-secondary text-sm">
                      查看详情
                    </Link>
                    {mistake.masteryLevel < 5 && (
                      <Link href={`/review?id=${mistake.id}`} className="btn-primary text-sm">
                        开始复习
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
