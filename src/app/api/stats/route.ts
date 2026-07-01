export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

// GET - Get dashboard statistics
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        mistakes: {
          where: {
            nextReviewDate: {
              lte: new Date()
            }
          }
        },
        _count: {
          select: {
            mistakes: true,
            notebooks: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get mistakes by notebook (subject)
    const mistakesBySubject = await prisma.mistake.groupBy({
      by: ['notebookId'],
      where: { userId: user.id },
      _count: true
    });

    // Get mistakes by type
    const mistakesByType = await prisma.mistake.groupBy({
      by: ['mistakeType'],
      where: { userId: user.id },
      _count: true
    });

    // Get activity for last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentMistakes = await prisma.mistake.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { createdAt: true }
    });

    const activityHeatmap = recentMistakes.reduce((acc, mistake) => {
      const date = mistake.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activityData = Object.entries(activityHeatmap).map(([date, count]) => ({
      date,
      count
    }));

    // Calculate mastered mistakes (masteryLevel >= 4)
    const masteredCount = await prisma.mistake.count({
      where: {
        userId: user.id,
        masteryLevel: { gte: 4 }
      }
    });

    return NextResponse.json({
      totalMistakes: user._count.mistakes,
      dueForReview: user.mistakes.length,
      masteredCount,
      todayReviewed: 0, // Would need to track daily reviews
      mistakesBySubject: mistakesBySubject.map(item => ({
        subject: item.notebookId,
        count: item._count
      })),
      mistakesByType: mistakesByType.map(item => ({
        type: item.mistakeType,
        count: item._count
      })),
      activityHeatmap: activityData
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
