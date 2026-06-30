'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import toast, { Toaster } from 'react-hot-toast';

interface MistakeDetail {
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
  interval: number;
  repetitions: number;
  timesReviewed: number;
  notebook: { name: string };
  tags: Array<{ tag: { name: string; color: string } }>;
}

export default function MistakeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [mistake, setMistake] = useState<MistakeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    answer: '',
    explanation: '',
    masteryLevel: 0
  });

  useEffect(() => {
    if (params.id) {
      fetchMistake();
    }
  }, [params.id]);

  const fetchMistake = async () => {
    try {
      const response = await fetch(`/api/mistakes/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setMistake(data);
        setEditData({
          title: data.title || '',
          answer: data.answer || '',
          explanation: data.explanation || '',
          masteryLevel: data.masteryLevel
        });
      }
    } catch (error) {
      console.error('Failed to fetch mistake:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/mistakes/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        toast.success('保存成功！');
        setEditing(false);
        fetchMistake();
      }
    } catch (error) {
      toast.error('保存失败');
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这道错题吗？')) return;

    try {
      const response = await fetch(`/api/mistakes/${params.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('删除成功！');
        router.push('/mistakes');
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!mistake) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card text-center">
          <p className="text-gray-600">错题不存在</p>
          <button onClick={() => router.push('/mistakes')} className="btn-primary mt-4">
            返回错题列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">错题详情</h1>
            <div className="flex gap-2">
              <button onClick={() => setEditing(!editing)} className="btn-secondary">
                {editing ? '取消编辑' : '编辑'}
              </button>
              <button onClick={handleDelete} className="btn-secondary text-red-600 hover:bg-red-50">
                删除
              </button>
              <button onClick={() => router.push('/mistakes')} className="btn-secondary">
                返回列表
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                {editing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">标题</label>
                      <input
                        type="text"
                        className="input"
                        value={editData.title}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">答案</label>
                      <textarea
                        className="input min-h-[80px]"
                        value={editData.answer}
                        onChange={(e) => setEditData({ ...editData, answer: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">解析</label>
                      <textarea
                        className="input min-h-[120px]"
                        value={editData.explanation}
                        onChange={(e) => setEditData({ ...editData, explanation: e.target.value })}
                      />
                    </div>
                    <button onClick={handleSave} className="btn-primary w-full">
                      保存修改
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-4">
                      {mistake.title || '未命名题目'}
                    </h2>
                    <div className="prose max-w-none mb-4">
                      <p className="whitespace-pre-wrap text-gray-800">{mistake.content}</p>
                    </div>
                    {mistake.imageUrl && (
                      <img
                        src={mistake.imageUrl}
                        alt="题目截图"
                        className="max-h-80 rounded-lg object-contain"
                      />
                    )}
                  </>
                )}
              </div>

              {mistake.answer && (
                <div className="card">
                  <h3 className="font-semibold text-green-800 mb-2">正确答案</h3>
                  <p className="text-green-700 whitespace-pre-wrap">{mistake.answer}</p>
                </div>
              )}

              {mistake.explanation && (
                <div className="card">
                  <h3 className="font-semibold text-blue-800 mb-2">解析</h3>
                  <p className="text-blue-700 whitespace-pre-wrap">{mistake.explanation}</p>
                </div>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="font-semibold mb-4">错题信息</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-600">错题本</dt>
                    <dd className="font-medium">{mistake.notebook.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">错误类型</dt>
                    <dd className="font-medium capitalize">{mistake.mistakeType}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">难度</dt>
                    <dd className="font-medium">{'⭐'.repeat(mistake.difficulty)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">掌握程度</dt>
                    <dd className="font-medium">Level {mistake.masteryLevel}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">下次复习</dt>
                    <dd className="font-medium">
                      {new Date(mistake.nextReviewDate).toLocaleDateString('zh-CN')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">已复习次数</dt>
                    <dd className="font-medium">{mistake.timesReviewed}</dd>
                  </div>
                </dl>
              </div>

              {mistake.tags && mistake.tags.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold mb-3">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {mistake.tags.map((tagItem, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{
                          backgroundColor: `${tagItem.tag.color}20`,
                          color: tagItem.tag.color
                        }}
                      >
                        {tagItem.tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
