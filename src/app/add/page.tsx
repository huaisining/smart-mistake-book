export const dynamic = 'force-dynamic';

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MarkdownWithMath from "@/components/MarkdownWithMath";
import toast, { Toaster } from "react-hot-toast";

interface ExamPoint { name: string; detail: string; }
interface Notebook { id: string; name: string; color: string; }
interface SimilarQuestion { question: string; answer: string; explanation: string; }
interface AnalysisResult {
  title: string; subject: string; questionText: string; answer: string;
  explanation: string; examPoints: ExamPoint[]; knowledgePoints: string[]; solution: string;
  mistakeType: string; difficulty: number; similarQuestions: SimilarQuestion[]; gaokaoComparison: string;
}

const TYPE_LABELS: Record<string, string> = {
  concept: "概念不理解",
  careless: "粗心错误",
  time: "时间不足",
  other: "其他",
};

export default function AddMistakePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<number>(1);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [textInput, setTextInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [selectedNotebook, setSelectedNotebook] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const [expandedExamPoints, setExpandedExamPoints] = useState<Record<number, boolean>>({});
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchNotebooks(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  const fetchNotebooks = async () => {
    try { const r = await fetch("/api/notebooks"); if (r.ok) setNotebooks(await r.json()); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleFileSelect = async (file: File) => {
    const fd = new FormData(); fd.append("file", file);
    try { const r = await fetch("/api/upload", { method: "POST", body: fd }); if (r.ok) { setUploadedImageUrl((await r.json()).url); toast.success("图片上传成功！"); } else toast.error((await r.json()).error || "上传失败"); }
    catch { toast.error("网络错误，请重试"); }
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f && f.type.startsWith("image/")) handleFileSelect(f); };
  const startEdit = (field: string, val: string) => { setEditField(field); setEditValue(val); };
  const saveEdit = () => { if (!analysisResult) return; setAnalysisResult({ ...analysisResult, [editField as keyof AnalysisResult]: editValue }); setEditField(null); };

  const handleStartAnalysis = async () => {
    if (!uploadedImageUrl && !textInput) { toast.error("请上传图片或输入题目内容"); return; }
    setStep(2); setIsAnalyzing(true);
    try {
      const r = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageUrl: uploadedImageUrl, questionText: textInput, fullAnalysis: true }) });
      if (r.ok) { setAnalysisResult(await r.json()); setStep(3); toast.success("AI分析完成！"); }
      else { toast.error((await r.json()).error || "分析失败"); setStep(1); }
    } catch { toast.error("AI分析失败，请重试"); setStep(1); }
    finally { setIsAnalyzing(false); }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !analysisResult) return;
    const u = { role: "user", content: chatInput }; const msgs = [...chatMessages, u];
    setChatMessages(msgs); setChatInput(""); setIsSending(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: msgs, context: analysisResult }) });
      if (r.ok) setChatMessages([...msgs, { role: "assistant", content: (await r.json()).reply }]);
      else setChatMessages([...msgs, { role: "assistant", content: "AI回复失败，请重试。" }]);
    } catch { setChatMessages([...msgs, { role: "assistant", content: "网络错误，请重试。" }]); }
    finally { setIsSending(false); }
  };
  const handleChatKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendChat(); } };

  const handleSave = async () => {
    if (!selectedNotebook || !analysisResult) return; setSaving(true);
    try {
      const saveBody = JSON.stringify({
        title: analysisResult.title, content: analysisResult.questionText, answer: analysisResult.answer,
        explanation: analysisResult.explanation,
        knowledgePoints: analysisResult.examPoints.map(p => p.name).concat(analysisResult.knowledgePoints),
        mistakeType: analysisResult.mistakeType, difficulty: analysisResult.difficulty, notebookId: selectedNotebook
      });
      const r = await fetch("/api/mistakes", { method: "POST", headers: { "Content-Type": "application/json" }, body: saveBody });
      if (r.ok) { toast.success("错题保存成功！"); router.push("/mistakes"); }
      else toast.error((await r.json()).error || "保存失败");
    } catch { toast.error("网络错误，请重试"); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">添加错题</h1>
          {step === 1 && <div className="space-y-6">
            <div className={`card border-2 border-dashed text-center py-12 cursor-pointer transition-colors ${dragOver ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-400"}`} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
              <div className="text-6xl mb-4">📸</div><p className="text-xl font-semibold mb-2">点击或拖拽上传错题照片</p><p className="text-gray-500">支持 JPG、PNG，最大 10MB</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }} />
            </div>
            {uploadedImageUrl && <div className="card"><img src={uploadedImageUrl} alt="上传的错题图片" className="max-h-96 mx-auto rounded-lg" /></div>}
            <div className="card"><label className="block text-sm font-medium text-gray-700 mb-2">题目文字补充（可选）</label><textarea className="input min-h-[80px]" value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="如果图片不清晰，可以手动输入题目文字..." /></div>
            <button onClick={handleStartAnalysis} disabled={!uploadedImageUrl && !textInput} className="btn-primary w-full disabled:opacity-50">🚀 开始 AI 分析</button>
          </div>}
          {step === 2 && <div className="card text-center py-16"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-6"></div><h2 className="text-xl font-semibold mb-2">AI 正在分析你的错题...</h2><p className="text-gray-500">这可能需要 5-15 秒，请耐心等待</p></div>}
          {step === 3 && analysisResult && <div className="space-y-6">
            <div className="card"><div className="flex justify-between items-start mb-3"><h3 className="font-semibold text-lg">📋 题目信息</h3><button onClick={() => startEdit("title", analysisResult.title)} className="text-sm text-primary-600 hover:underline">编辑</button></div>
              {editField === "title" ? <div className="space-y-2"><input className="input" value={editValue} onChange={e => setEditValue(e.target.value)} /><button onClick={saveEdit} className="btn-primary text-sm">保存</button></div> : <><div className="flex items-center gap-2 mb-2"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{analysisResult.subject}</span><span className="text-lg font-medium">{analysisResult.title}</span></div><MarkdownWithMath content={analysisResult.questionText || "(未识别到题目文字)"} /><div className="mt-3 p-3 bg-green-50 rounded"><span className="text-sm text-green-600 font-medium">正确答案：</span> <MarkdownWithMath content={analysisResult.answer || "(未提供)"} /></div></>}
            </div>
            <div className="card"><div className="flex justify-between items-start mb-3"><h3 className="font-semibold text-lg">📝 详细解析</h3><button onClick={() => startEdit("explanation", analysisResult.explanation)} className="text-sm text-primary-600 hover:underline">编辑</button></div>
              {editField === "explanation" ? <div className="space-y-2"><textarea className="input min-h-[150px]" value={editValue} onChange={e => setEditValue(e.target.value)} /><button onClick={saveEdit} className="btn-primary text-sm">保存</button></div> : <MarkdownWithMath content={analysisResult.explanation || ""} />}
            </div>
            <div className="card"><h3 className="font-semibold text-lg mb-3">🎯 考点分析</h3><div className="space-y-2">
              <div className="flex flex-wrap gap-2">{analysisResult.examPoints.map((ep,i) => <button key={i} type="button" className={`px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm cursor-pointer hover:shadow transition-all ${expandedExamPoints[i] ? "ring-2 ring-yellow-400 border border-yellow-500" : "hover:bg-yellow-200"}`} onClick={() => setExpandedExamPoints({...expandedExamPoints, [i]: !expandedExamPoints[i]})}>{ep.name} {expandedExamPoints[i] ? "▲" : "▼"}</button>)}</div>
              {Object.entries(expandedExamPoints).filter(([_,v])=>v).map(([idx]) => { const i = Number(idx); const ep = analysisResult.examPoints[i]; return ep ? <div key={i} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"><p className="text-sm font-medium text-yellow-900 mb-2">{ep.name}</p><MarkdownWithMath content={ep.detail} /></div> : null; })}
            </div></div>
            <div className="card"><h3 className="font-semibold text-lg mb-3">📚 知识点</h3><div className="flex flex-wrap gap-2">{analysisResult.knowledgePoints.map((p,i) => <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">{p}</span>)}</div></div>
            <div className="card"><div className="flex justify-between items-start mb-3"><h3 className="font-semibold text-lg">💡 解题思路</h3><button onClick={() => startEdit("solution", analysisResult.solution)} className="text-sm text-primary-600 hover:underline">编辑</button></div>
              {editField === "solution" ? <div className="space-y-2"><textarea className="input min-h-[100px]" value={editValue} onChange={e => setEditValue(e.target.value)} /><button onClick={saveEdit} className="btn-primary text-sm">保存</button></div> : <MarkdownWithMath content={analysisResult.solution || ""} />}
            </div>
            <div className="card"><h3 className="font-semibold text-lg mb-3">🔄 举一反三</h3>
              {analysisResult.similarQuestions.length === 0 ? <p className="text-gray-500">暂无相似题目</p> : analysisResult.similarQuestions.map((q,i) => <div key={i} className="border rounded-lg mb-3">
                <button className="w-full text-left p-3 font-medium hover:bg-gray-50 flex justify-between" onClick={() => setExpandedQuestions({...expandedQuestions, [i]: !expandedQuestions[i]})}><span>题目 {i+1}：{q.question?.substring(0,40)}{q.question?.length > 40 ? "..." : ""}</span><span>{expandedQuestions[i] ? "收起" : "展开"}</span></button>
                {expandedQuestions[i] && <div className="p-4 border-t bg-gray-50 space-y-2"><div className="mb-2"><strong>题目：</strong><MarkdownWithMath content={q.question} /></div><div className="mb-2"><strong>答案：</strong><MarkdownWithMath content={q.answer} /></div><div><strong>解析：</strong><MarkdownWithMath content={q.explanation} /></div></div>}
              </div>)}
            </div>
            <div className="card"><div className="flex justify-between items-start mb-3"><h3 className="font-semibold text-lg">🎓 高考真题对比</h3><button onClick={() => startEdit("gaokaoComparison", analysisResult.gaokaoComparison)} className="text-sm text-primary-600 hover:underline">编辑</button></div>
              {editField === "gaokaoComparison" ? <div className="space-y-2"><textarea className="input min-h-[150px]" value={editValue} onChange={e => setEditValue(e.target.value)} /><button onClick={saveEdit} className="btn-primary text-sm">保存</button></div> : <MarkdownWithMath content={analysisResult.gaokaoComparison || ""} />}
            </div>
            <div className="card"><h3 className="font-semibold text-lg mb-3">💬 追问 AI</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="h-[300px] overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {chatMessages.length === 0 ? <p className="text-gray-400 text-center pt-24">对分析结果有疑问？在这里继续提问</p> : chatMessages.map((msg,i) => <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-white text-gray-800 border"}`}>{msg.role === "user" ? msg.content : <MarkdownWithMath content={msg.content} />}</div></div>)}
                  {isSending && <div className="flex justify-start"><div className="bg-white border px-4 py-2 rounded-lg text-sm text-gray-400">思考中...</div></div>}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex border-t p-3 bg-white">
                  <input className="flex-1 input text-sm" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={handleChatKeyDown} placeholder="输入你的问题..." disabled={isSending} />
                  <button onClick={handleSendChat} disabled={!chatInput.trim() || isSending} className="btn-primary ml-2 disabled:opacity-50">发送</button>
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-4"><button onClick={() => setStep(1)} className="btn-secondary">🔄 重新分析</button><button onClick={() => setStep(4)} className="btn-primary">💾 保存到错题本</button></div>
          </div>}
          {step === 4 && <div className="card max-w-lg mx-auto"><h2 className="text-xl font-semibold mb-6 text-center">保存到错题本</h2><div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">选择错题本</label><select className="input" value={selectedNotebook} onChange={e => setSelectedNotebook(e.target.value)} required><option value="">请选择错题本</option>{notebooks.map(nb => <option key={nb.id} value={nb.id}>{nb.name}</option>)}</select></div>
            {analysisResult && <div className="bg-gray-50 p-4 rounded-lg text-sm"><p><strong>题目：</strong>{analysisResult.title}</p><p><strong>科目：</strong>{analysisResult.subject}</p><p><strong>难度：</strong>{"⭐".repeat(analysisResult.difficulty)}</p></div>}
            <div className="flex gap-3"><button onClick={() => setStep(3)} className="btn-secondary flex-1">返回修改</button><button onClick={handleSave} disabled={!selectedNotebook || saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? "保存中..." : "确认保存"}</button></div>
          </div></div>}
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
