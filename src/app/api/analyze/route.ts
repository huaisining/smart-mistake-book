export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { analyzeMistake, fullAnalyzeMistake } from '@/lib/ai-service';

// POST - Analyze a mistake using AI
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { questionText, imageUrl, userAnswer, fullAnalysis } = body;

    if (!questionText && !imageUrl) {
      return NextResponse.json(
        { error: 'Please provide question text or image' },
        { status: 400 }
      );
    }

    let result;
    if (fullAnalysis) {
      result = await fullAnalyzeMistake(imageUrl, questionText);
    } else {
      result = await analyzeMistake(imageUrl, questionText, userAnswer);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI analysis failed:', error);
    return NextResponse.json(
      { error: 'AI鍒嗘瀽澶辫触锛岃妫€鏌PI閰嶇疆' },
      { status: 500 }
    );
  }
}
