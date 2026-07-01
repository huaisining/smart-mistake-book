export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

// GET - Get a single mistake by id
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const mistake = await prisma.mistake.findUnique({
      where: { id: params.id, userId: user.id },
      include: {
        notebook: true,
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!mistake) {
      return NextResponse.json({ error: 'Mistake not found' }, { status: 404 });
    }

    return NextResponse.json(mistake);
  } catch (error) {
    console.error('Failed to fetch mistake:', error);
    return NextResponse.json({ error: 'Failed to fetch mistake' }, { status: 500 });
  }
}

// PUT - Update a mistake
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existing = await prisma.mistake.findUnique({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Mistake not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, answer, explanation, masteryLevel } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (answer !== undefined) updateData.answer = answer;
    if (explanation !== undefined) updateData.explanation = explanation;
    if (masteryLevel !== undefined) updateData.masteryLevel = masteryLevel;

    const updated = await prisma.mistake.update({
      where: { id: params.id },
      data: updateData,
      include: {
        notebook: true,
        tags: {
          include: { tag: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update mistake:', error);
    return NextResponse.json({ error: 'Failed to update mistake' }, { status: 500 });
  }
}

// DELETE - Delete a mistake
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existing = await prisma.mistake.findUnique({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Mistake not found' }, { status: 404 });
    }

    await prisma.mistake.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete mistake:', error);
    return NextResponse.json({ error: 'Failed to delete mistake' }, { status: 500 });
  }
}
