export interface AnalysisResult {
  title: string;
  answer: string;
  explanation: string;
  knowledgePoints: string[];
  mistakeType: "concept" | "careless" | "time" | "other";
  difficulty: number;
}

async function callAIApi(
  messages: Array<{ role: string; content: string | Array<any> }>,
  maxTokens: number = 1000,
  useJsonFormat: boolean = true
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.AI_MODEL || "gpt-4o";
  if (!apiKey) throw new Error("AI API key not configured");
  const requestBody: any = { model, messages, max_tokens: maxTokens };
  if (useJsonFormat) requestBody.response_format = { type: "json_object" };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(baseUrl + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error("AI API call failed: " + response.status + " - " + errorText.substring(0, 200));
    }
    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } finally {
    clearTimeout(timeoutId);
  }
}

function getImageContent(imageUrl: string): string {
  if (imageUrl.startsWith("data:")) return imageUrl;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  const fs = require("fs"); const path = require("path");
  const filePath = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""));
  if (fs.existsSync(filePath)) { const buffer = fs.readFileSync(filePath); const ext = path.extname(filePath).toLowerCase(); const mimeMap: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp" }; return "data:" + (mimeMap[ext] || "image/jpeg") + ";base64," + buffer.toString("base64"); }
  return imageUrl;
}

export async function analyzeMistake(imageUrl?: string, questionText?: string, userAnswer?: string): Promise<AnalysisResult> {
  const prompt = "You are an intelligent tutor. Analyze and return JSON: {\"title\":\"\",\"answer\":\"\",\"explanation\":\"\",\"knowledgePoints\":[],\"mistakeType\":\"concept|careless|time|other\",\"difficulty\":1-5}. Question: " + (questionText || "See attached image");
  try {
    const content = imageUrl ? [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: getImageContent(imageUrl), detail: "high" } }] : prompt;
    const responseText = await callAIApi([{ role: "system", content: "You are a helpful tutor. Always return JSON." }, { role: "user", content }]);
    const result = JSON.parse(responseText);
    return { title: result.title || "Untitled", answer: result.answer || "", explanation: result.explanation || "", knowledgePoints: Array.isArray(result.knowledgePoints) ? result.knowledgePoints : [], mistakeType: result.mistakeType || "concept", difficulty: Math.min(5, Math.max(1, result.difficulty || 3)) };
  } catch (error) { console.error("AI analysis failed:", error); throw new Error("AI分析失败，请稍后重试"); }
}

export interface ExamPoint {
  name: string;
  detail: string;
}

export interface FullAnalysisResult {
  title: string; subject: string; questionText: string; answer: string;
  explanation: string; examPoints: ExamPoint[]; knowledgePoints: string[]; solution: string;
  mistakeType: string; difficulty: number;
  similarQuestions: Array<{ question: string; answer: string; explanation: string }>;
  gaokaoComparison: string;
}

export async function fullAnalyzeMistake(imageUrl?: string, questionText?: string): Promise<FullAnalysisResult> {
  const prompt = `你是一位资深高考辅导老师。请严格按 JSON 格式返回：
{"title":"10字以内","subject":"数学/物理/英语等","questionText":"完整题目原文","answer":"正确答案","explanation":"详细解析，用Markdown格式，包含步骤、原理、公式推导，如果有数学公式请用LaTeX格式：行内用\$公式\$，独立公式用\$\$公式\$\$。注意换行用\\n","examPoints":[{"name":"考点名","detail":"该考点的详细解释，包含定义、常见考法、易错点"}],"knowledgePoints":["知识点1"],"solution":"解题思路分步骤，用编号列表，每步一行，注意换行用\\n","mistakeType":"concept/careless/time/other","difficulty":3,"similarQuestions":[{"question":"举一反三题目","answer":"答案","explanation":"解析"}],"gaokaoComparison":"用Markdown说明高考真题对比，注意换行用\\n。如果没找到，写\"暂无相关高考真题数据\""}
题目：${questionText || "See attached image"}

注意：
1. difficulty 必须是数字(1-5)
2. 只返回JSON，不要有其他文字
3. solution、explanation、gaokaoComparison 字段必须是单个字符串，不是数组
4. 公式用LaTeX格式：\$...\$ 或 \$\$...\$\$
5. 换行用\\n表示`;

  try {
    const content = imageUrl ? [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: getImageContent(imageUrl), detail: "high" } }] : prompt;
    const responseText = await callAIApi([{ role: "system", content: "你是资深高考辅导老师。严格按JSON返回，不要其他内容。公式用LaTeX格式。" }, { role: "user", content }], 3000, false);
    console.log("AI response:", responseText.substring(0, 300));
    let result: any;
    try { result = JSON.parse(responseText); } catch {
      const m = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (m) result = JSON.parse(m[1]);
      else { const a = responseText.indexOf("{"); const b = responseText.lastIndexOf("}"); if (a >= 0 && b > a) result = JSON.parse(responseText.substring(a, b + 1)); else throw new Error("No JSON"); }
    }
    return {
      title: result.title || "未命名题目", subject: result.subject || "未知", questionText: result.questionText || questionText || "", answer: result.answer || "",
      explanation: result.explanation || "",
      examPoints: Array.isArray(result.examPoints) ? result.examPoints.map((p: any) => ({ name: p.name || p, detail: p.detail || "" })) : [],
      knowledgePoints: Array.isArray(result.knowledgePoints) ? result.knowledgePoints : [],
      solution: Array.isArray(result.solution) ? result.solution.join("\n") : (result.solution || ""),
      mistakeType: result.mistakeType || "concept", difficulty: typeof result.difficulty === "number" ? result.difficulty : 3,
      similarQuestions: Array.isArray(result.similarQuestions) ? result.similarQuestions : [],
      gaokaoComparison: result.gaokaoComparison || "暂无高考真题对比数据"
    };
  } catch (error) { console.error("Full AI analysis failed:", error); throw new Error("AI全面分析失败，请稍后重试"); }
}

export async function generatePracticeQuestions(knowledgePoints: string[], count: number = 3): Promise<Array<{ question: string; answer: string; explanation: string }>> {
  try {
    const responseText = await callAIApi([{ role: "system", content: "You are a question generator. Always return valid JSON arrays." }, { role: "user", content: "Generate " + count + " practice questions for: " + knowledgePoints.join(", ") + ". Return JSON array: [{\"question\":\"\",\"answer\":\"\",\"explanation\":\"\"}]" }]);
    const result = JSON.parse(responseText); return Array.isArray(result) ? result : [];
  } catch (error) { console.error("Practice question generation failed:", error); return []; }
}
