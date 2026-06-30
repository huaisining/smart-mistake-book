import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

// GET - List all mistakes for current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const notebookId = searchParams.get('notebookId');
    const masteryLevel = searchParams.get('masteryLevel');
    const mistakeType = searchParams.get('mistakeType');
    const tagId = searchParams.get('tagId');
    const due = searchParams.get('due');

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { mistakes: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const where: any = { userId: user.id };

    if (notebookId) {
      where.notebookId = notebookId;
    }

    if (masteryLevel !== null && masteryLevel !== undefined) {
      where.masteryLevel = parseInt(masteryLevel);
    }

    if (mistakeType) {
      where.mistakeType = mistakeType;
    }

    if (tagId) {
      where.tags = {
        some: { tagId }
      };
    }

    if (due === 'true') {
      where.nextReviewDate = {
        lte: new Date()
      };
    }

    const mistakes = await prisma.mistake.findMany({
      where,
      include: {
        notebook: true,
        tags: {
          include: { tag: true }
        }
      },
      orderBy: {
        nextReviewDate: 'asc'
      }
    });

    return NextResponse.json(mistakes);
  } catch (error) {
    console.error('Failed to fetch mistakes:', error);
    return NextResponse.json({ error: 'Failed to fetch mistakes' }, { status: 500 });
  }
}

// POST - Create a new mistake
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      answer,
      explanation,
      imageUrl,
      knowledgePoints,
      mistakeType,
      difficulty,
      notebookId,
      tagIds
    } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const mistake = await prisma.mistake.create({
      data: {
        title,
        content,
        answer,
        explanation,
        imageUrl,
        knowledgePoints: knowledgePoints ? knowledgePoints.join(',') : null,
        mistakeType: mistakeType || 'concept',
        difficulty: difficulty || 3,
        notebookId,
        userId: user.id,
        tags: tagIds && tagIds.length > 0
          ? {
              create: tagIds.map((tagId: string) => ({
                tag: { connect: { id: tagId } }
              }))
            }
          : undefined
      },
      include: {
        tags: {
          include: { tag: true }
        }
      }
    });

    return NextResponse.json(mistake, { status: 201 });
  } catch (error) {
    console.error('Failed to create mistake:', error);
    return NextResponse.json({ error: 'Failed to create mistake' }, { status: 500 });
  }
}
