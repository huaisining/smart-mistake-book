import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

// GET - Get a single notebook by id
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

    const notebook = await prisma.notebook.findUnique({
      where: { id: params.id, userId: user.id },
      include: {
        _count: {
          select: { mistakes: true },
        },
        mistakes: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!notebook) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 });
    }

    return NextResponse.json(notebook);
  } catch (error) {
    console.error('Failed to fetch notebook:', error);
    return NextResponse.json({ error: 'Failed to fetch notebook' }, { status: 500 });
  }
}

// PUT - Update a notebook
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

    const existing = await prisma.notebook.findUnique({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, color } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;

    const updated = await prisma.notebook.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: { mistakes: true },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update notebook:', error);
    return NextResponse.json({ error: 'Failed to update notebook' }, { status: 500 });
  }
}

// DELETE - Delete a notebook
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

    const existing = await prisma.notebook.findUnique({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 });
    }

    await prisma.notebook.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete notebook:', error);
    return NextResponse.json({ error: 'Failed to delete notebook' }, { status: 500 });
  }
}
