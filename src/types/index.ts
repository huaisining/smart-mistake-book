export interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notebook {
  id: string;
  name: string;
  description?: string;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type MistakeType = 'concept' | 'careless' | 'time' | 'other';
export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface Tag {
  id: string;
  name: string;
  color: string;
  userId?: string;
  createdAt: Date;
}

export interface Mistake {
  id: string;
  title?: string;
  content: string;
  answer?: string;
  explanation?: string;
  imageUrl?: string;
  knowledgePoints?: string;
  mistakeType: MistakeType;
  difficulty: number;
  masteryLevel: number;
  nextReviewDate: Date;
  interval: number;
  repetitions: number;
  elapsed: number;
  timesReviewed: number;
  notebookId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: Tag[];
}

export interface ReviewSession {
  id: string;
  userId: string;
  type: string;
  startTime: Date;
  endTime?: Date;
  totalCards: number;
  correctCards: number;
  createdAt: Date;
}

export interface ReviewResult {
  id: string;
  sessionId: string;
  mistakeId: string;
  rating: string;
  reviewTime: Date;
}

export interface DashboardStats {
  totalMistakes: number;
  dueForReview: number;
  masteredCount: number;
  reviewStreak: number;
  todayReviewed: number;
  mistakesBySubject: { subject: string; count: number }[];
  mistakesByType: { type: string; count: number }[];
  activityHeatmap: { date: string; count: number }[];
}
