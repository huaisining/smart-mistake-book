import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { messages, context } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.AI_MODEL || "qwen-plus";

    if (!apiKey) {
      return NextResponse.json(
        { error: "AI API not configured" },
        { status: 500 }
      );
    }

    let systemPrompt =
      "你是一位基于错题上下文回答学生问题的辅导老师。请根据以下错题信息回答学生的问题。";

    if (context) {
      systemPrompt += [
        "",
        "错题信息：",
        `- 题目：${context.title || ""}`,
        `- 科目：${context.subject || ""}`,
        `- 题目内容：${context.questionText || ""}`,
        `- 正确答案：${context.answer || ""}`,
        `- 解题思路：${context.solution || ""}`,
        `- 考点：${(context.examPoints || []).join("、")}`,
        `- 知识点：${(context.knowledgePoints || []).join("、")}`,
      ].join("\n");
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Chat API error:", errText);
      return NextResponse.json(
        { error: "AI回复失败" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content || "抱歉，我无法回答这个问题。";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "聊天请求失败" }, { status: 500 });
  }
}
