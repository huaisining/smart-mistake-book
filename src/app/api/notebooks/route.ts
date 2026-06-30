import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";

// GET - List all notebooks for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const notebooks = await prisma.notebook.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { mistakes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(notebooks);
  } catch (error) {
    console.error('Failed to fetch notebooks:', error);
    return NextResponse.json({ error: 'Failed to fetch notebooks' }, { status: 500 });
  }
}

// POST - Create a new notebook
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const notebook = await prisma.notebook.create({
      data: {
        name,
        description,
        color: color || '#3b82f6',
        userId: user.id
      }
    });

    return NextResponse.json(notebook, { status: 201 });
  } catch (error) {
    console.error('Failed to create notebook:', error);
    return NextResponse.json({ error: 'Failed to create notebook' }, { status: 500 });
  }
}
