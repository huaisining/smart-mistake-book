'use client';


import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import toast, { Toaster } from 'react-hot-toast';
import { Mistake } from '@/types';
import { getMistakes, reviewMistake } from '@/lib/local-db';

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get('id');
  
  const [currentMistake, setCurrentMistake] = useState<Mistake | null>(null);
  const [dueMistakes, setDueMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchDueMistakes();
  }, []);

  const fetchDueMistakes = async () => {
    try {
      const data = await getMistakes({ due: true });
      setDueMistakes(data);
        
        // If a specific ID was passed, find it
        if (preselectedId) {
          const target = data.find((m: Mistake) => m.id === preselectedId);
          if (target) {
            setCurrentMistake(target);
          } else if (data.length > 0) {
            setCurrentMistake(data[0]);
          }
        } else if (data.length > 0) {
          setCurrentMistake(data[0]);
        }
    } catch (error) {
      console.error('Failed to fetch due mistakes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentMistake) return;

    try {
      const result = await reviewMistake(currentMistake.id, rating);
      if (result) {
        toast.success('复习完成！');
        
        // Move to next mistake
        const nextIndex = currentIndex + 1;
        if (nextIndex < dueMistakes.length) {
          setCurrentIndex(nextIndex);
          setCurrentMistake(dueMistakes[nextIndex]);
          setShowAnswer(false);
        } else {
          setReviewComplete(true);
        }
      }
    } catch (error) {
      toast.error('复习失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (dueMistakes.length === 0 || reviewComplete) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="card text-center max-w-md">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4">太棒了！</h2>
            <p className="text-gray-600 mb-6">
              {reviewComplete 
                ? '您已完成所有待复习的题目'
                : '暂无待复习的题目，继续加油！'
              }
            </p>
            <button onClick={() => router.push('/dashboard')} className="btn-primary">
              返回仪表盘
            </button>
          </div>
        </main>
        <Toaster position="top-right" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>复习进度</span>
              <span>{currentIndex + 1} / {dueMistakes.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / dueMistakes.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Card */}
          <div className="card">
            <div className="mb-4 flex justify-between items-center">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                {currentIndex + 1} / {dueMistakes.length}
              </span>
              <span className="text-sm text-gray-500">
                难度: {'⭐'.repeat(currentMistake?.difficulty || 3)}
              </span>
            </div>

            <h2 className="text-xl font-semibold mb-4">
              {currentMistake?.title || '未命名题目'}
            </h2>

            <div className="prose max-w-none mb-6">
              <p className="text-gray-800 whitespace-pre-wrap">{currentMistake?.content}</p>
            </div>

            {currentMistake?.imageUrl && (
              <div className="mb-6">
                <img
                  src={currentMistake.imageUrl}
                  alt="题目"
                  className="max-h-64 rounded-lg object-contain"
                />
              </div>
            )}

            {/* Answer Section */}
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="w-full py-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors font-medium"
              >
                显示答案和解析
              </button>
            ) : (
              <div className="space-y-4">
                {currentMistake?.answer && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">正确答案</h3>
                    <p className="text-green-700 whitespace-pre-wrap">{currentMistake.answer}</p>
                  </div>
                )}

                {currentMistake?.explanation && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">解析</h3>
                    <p className="text-blue-700 whitespace-pre-wrap">{currentMistake.explanation}</p>
                  </div>
                )}

                {/* Rating Buttons */}
                <div className="grid grid-cols-4 gap-3 mt-6">
                  <button
                    onClick={() => handleReview('again')}
                    className="py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                  >
                    完全忘了
                  </button>
                  <button
                    onClick={() => handleReview('hard')}
                    className="py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                  >
                    有些困难
                  </button>
                  <button
                    onClick={() => handleReview('good')}
                    className="py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium"
                  >
                    基本掌握
                  </button>
                  <button
                    onClick={() => handleReview('easy')}
                    className="py-3 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium"
                  >
                    完全掌握
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Skip button */}
          <div className="text-center mt-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              跳过本次复习
            </button>
          </div>
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );

}

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    }>
      <ReviewContent />
    </Suspense>
  );
}
