// Local database service - replaces Prisma & API routes
// Uses in-memory storage for dev, Capacitor SQLite for APK

import { Mistake, Notebook, ReviewSession, DashboardStats } from '@/types';

// ---- In-memory store (dev fallback) ----
let notebooks: any[] = [];
let mistakes: any[] = [];
let tags: any[] = [];
let reviewSessions: any[] = [];

let initialized = false;

function generateId(): string {
  return 'local_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

async function ensureInit() {
  if (initialized) return;
  
  // Try Capacitor SQLite, fallback to memory
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      // SQLite for native builds
      const { CapacitorSQLite } = await import('@capacitor-community/sqlite');
      // Will implement SQLite init separately
    }
  } catch {}
  
  // Load from localStorage if available
  try {
    const saved = localStorage.getItem('mistakebook_data');
    if (saved) {
      const data = JSON.parse(saved);
      notebooks = data.notebooks || [];
      mistakes = data.mistakes || [];
      tags = data.tags || [];
      reviewSessions = data.reviewSessions || [];
    }
  } catch {}
  
  initialized = true;
}

function persist() {
  try {
    localStorage.setItem('mistakebook_data', JSON.stringify({
      notebooks, mistakes, tags, reviewSessions
    }));
  } catch {}
}

// ---- Notebooks ----
export async function getNotebooks(): Promise<any[]> {
  await ensureInit();
  return notebooks.map(nb => ({
    ...nb,
    _count: { mistakes: mistakes.filter(m => m.notebookId === nb.id).length }
  }));
}

export async function createNotebook(data: { name: string; description?: string; color?: string }): Promise<any> {
  await ensureInit();
  const nb = { id: generateId(), name: data.name, description: data.description || null, color: data.color || '#3b82f6', userId: 'local_user', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  notebooks.push(nb);
  persist();
  return { ...nb, _count: { mistakes: 0 } };
}

export async function getNotebook(id: string): Promise<any> {
  await ensureInit();
  const nb = notebooks.find(n => n.id === id);
  if (!nb) throw new Error('Notebook not found');
  return { ...nb, mistakes: mistakes.filter(m => m.notebookId === id) };
}

export async function updateNotebook(id: string, data: any): Promise<any> {
  await ensureInit();
  const idx = notebooks.findIndex(n => n.id === id);
  if (idx < 0) throw new Error('Notebook not found');
  notebooks[idx] = { ...notebooks[idx], ...data, updatedAt: new Date().toISOString() };
  persist();
  return notebooks[idx];
}

export async function deleteNotebook(id: string): Promise<void> {
  await ensureInit();
  notebooks = notebooks.filter(n => n.id !== id);
  mistakes = mistakes.filter(m => m.notebookId !== id);
  persist();
}

// ---- Mistakes ----
export async function getMistakes(filters?: { notebookId?: string; due?: boolean }): Promise<any[]> {
  await ensureInit();
  let result = [...mistakes];
  if (filters?.notebookId) result = result.filter(m => m.notebookId === filters.notebookId);
  if (filters?.due) result = result.filter(m => new Date(m.nextReviewDate) <= new Date());
  result.sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());
  return result.map(m => ({ ...m, notebook: notebooks.find(n => n.id === m.notebookId) || { name: 'Unknown' } }));
}

export async function getMistake(id: string): Promise<any> {
  await ensureInit();
  const m = mistakes.find(m => m.id === id);
  if (!m) throw new Error('Mistake not found');
  return { ...m, notebook: notebooks.find(n => n.id === m.notebookId) || { name: 'Unknown' }, tags: [] };
}

export async function createMistake(data: any): Promise<any> {
  await ensureInit();
  const m = {
    id: generateId(),
    title: data.title || null,
    content: data.content || '',
    answer: data.answer || null,
    explanation: data.explanation || null,
    imageUrl: data.imageUrl || null,
    knowledgePoints: data.knowledgePoints || null,
    mistakeType: data.mistakeType || 'concept',
    difficulty: data.difficulty || 3,
    masteryLevel: 0,
    nextReviewDate: new Date().toISOString(),
    interval: 1,
    repetitions: 0,
    elapser: 2.5,
    timesReviewed: 0,
    notebookId: data.notebookId,
    userId: 'local_user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mistakes.push(m);
  persist();
  return m;
}

export async function updateMistake(id: string, data: any): Promise<any> {
  await ensureInit();
  const idx = mistakes.findIndex(m => m.id === id);
  if (idx < 0) throw new Error('Mistake not found');
  mistakes[idx] = { ...mistakes[idx], ...data, updatedAt: new Date().toISOString() };
  persist();
  return mistakes[idx];
}

export async function deleteMistake(id: string): Promise<void> {
  await ensureInit();
  mistakes = mistakes.filter(m => m.id !== id);
  persist();
}

// ---- Review (SM-2) ----
export async function reviewMistake(mistakeId: string, rating: string): Promise<any> {
  await ensureInit();
  const idx = mistakes.findIndex(m => m.id === mistakeId);
  if (idx < 0) throw new Error('Mistake not found');
  
  const m = mistakes[idx];
  const now = Date.now();
  
  // SM-2 calculation
  let newInterval = m.interval;
  let newRepetitions = m.repetitions;
  let newEase = m.elapser;
  let newMastery = m.masteryLevel;
  
  switch (rating) {
    case 'again':
      newRepetitions = 0; newInterval = 1; newEase = Math.max(1.3, m.elapser - 0.2); newMastery = 0;
      break;
    case 'hard':
      newInterval = Math.max(1, Math.round(m.interval * 1.2)); newEase = Math.max(1.3, m.elapser - 0.15); newMastery = Math.min(5, m.masteryLevel + 1);
      break;
    case 'good':
      newInterval = m.repetitions === 0 ? 1 : m.repetitions === 1 ? 6 : Math.round(m.interval * m.elapser);
      newMastery = Math.min(5, m.masteryLevel + 1);
      break;
    case 'easy':
      newInterval = m.repetitions === 0 ? 4 : m.repetitions === 1 ? 9 : Math.round(m.interval * m.elapser * 1.3);
      newEase = m.elapser + 0.15; newMastery = 5;
      break;
  }
  
  mistakes[idx] = {
    ...m,
    interval: newInterval,
    repetitions: newRepetitions,
    elapser: newEase,
    masteryLevel: newMastery,
    timesReviewed: m.timesReviewed + 1,
    nextReviewDate: new Date(now + newInterval * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Create review result
  reviewSessions.push({
    id: generateId(),
    mistakeId,
    rating,
    reviewTime: new Date().toISOString(),
  });
  
  persist();
  return { mistake: mistakes[idx], reviewResult: { rating }, nextReviewDate: mistakes[idx].nextReviewDate };
}

// ---- Stats ----
export async function getStats(): Promise<DashboardStats> {
  await ensureInit();
  const totalMistakes = mistakes.length;
  const dueForReview = mistakes.filter(m => new Date(m.nextReviewDate) <= new Date()).length;
  const masteredCount = mistakes.filter(m => m.masteryLevel >= 4).length;
  
  const byType: Record<string, number> = {};
  mistakes.forEach(m => { byType[m.mistakeType] = (byType[m.mistakeType] || 0) + 1; });
  
  const bySubject: Record<string, number> = {};
  mistakes.forEach(m => {
    const nb = notebooks.find(n => n.id === m.notebookId);
    const name = nb?.name || 'Unknown';
    bySubject[name] = (bySubject[name] || 0) + 1;
  });
  
  return {
    totalMistakes,
    dueForReview,
    masteredCount,
    reviewStreak: 0,
    todayReviewed: reviewSessions.filter(r => {
      const d = new Date(r.reviewTime);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    }).length,
    mistakesBySubject: Object.entries(bySubject).map(([subject, count]) => ({ subject, count })),
    mistakesByType: Object.entries(byType).map(([type, count]) => ({ type, count })),
    activityHeatmap: [],
  };
}

// ---- Auth (local, no-op) ----
export async function localLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  // For dev, test account always works
  if (email === 'test@example.com' && password === '123456') {
    return { success: true };
  }
  return { success: false, error: '用户名或密码错误' };
}

export async function localRegister(email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> {
  // Simple local registration - just store in localStorage
  try {
    const users = JSON.parse(localStorage.getItem('mistakebook_users') || '[]');
    if (users.find((u: any) => u.email === email)) {
      return { success: false, error: '用户已存在' };
    }
    users.push({ email, password, name, id: generateId() });
    localStorage.setItem('mistakebook_users', JSON.stringify(users));
    return { success: true };
  } catch {
    return { success: false, error: '注册失败' };
  }
}
