export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { calculateNextReview, ReviewRating } from '@/lib/spaced-repetition';

// POST - Review a mistake
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mistakeId, rating, sessionId } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const mistake = await prisma.mistake.findUnique({
      where: { id: mistakeId }
    });

    if (!mistake) {
      return NextResponse.json({ error: 'Mistake not found' }, { status: 404 });
    }

    // Bridge: Prisma field is "elapser" (typo), SM-2 algorithm expects "elapsed"
    // Also normalize null -> undefined for optional fields
    const mistakeForSM2 = {
      id: mistake.id,
      title: mistake.title ?? undefined,
      content: mistake.content,
      answer: mistake.answer ?? undefined,
      explanation: mistake.explanation ?? undefined,
      imageUrl: mistake.imageUrl ?? undefined,
      knowledgePoints: mistake.knowledgePoints ?? undefined,
      mistakeType: mistake.mistakeType as "concept" | "careless" | "time" | "other",
      difficulty: mistake.difficulty,
      masteryLevel: mistake.masteryLevel,
      nextReviewDate: mistake.nextReviewDate,
      interval: mistake.interval,
      repetitions: mistake.repetitions,
      elapsed: mistake.elapser,
      timesReviewed: mistake.timesReviewed,
      notebookId: mistake.notebookId,
      userId: mistake.userId,
      createdAt: mistake.createdAt,
      updatedAt: mistake.updatedAt,
    };

    // Calculate next review using SM-2 algorithm
    const sm2Result = calculateNextReview(mistakeForSM2, rating as ReviewRating);

    // Update mistake
    const updatedMistake = await prisma.mistake.update({
      where: { id: mistakeId },
      data: {
        interval: sm2Result.interval,
        repetitions: sm2Result.repetitions,
        elapser: sm2Result.easeFactor,
        masteryLevel: sm2Result.masteryLevel,
        timesReviewed: { increment: 1 },
        nextReviewDate: new Date(Date.now() + sm2Result.interval * 24 * 60 * 60 * 1000)
      }
    });

    // Create review result
    const reviewResult = await prisma.reviewResult.create({
      data: {
        sessionId: sessionId || null,
        mistakeId,
        rating
      }
    });

    return NextResponse.json({
      mistake: updatedMistake,
      reviewResult,
      nextReviewDate: updatedMistake.nextReviewDate
    });
  } catch (error) {
    console.error('Failed to review mistake:', error);
    return NextResponse.json({ error: 'Failed to review mistake' }, { status: 500 });
  }
}
