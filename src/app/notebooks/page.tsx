"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import toast, { Toaster } from "react-hot-toast";

const COLOR_OPTIONS = [
  { name: "红色", value: "#ef4444" },
  { name: "蓝色", value: "#3b82f6" },
  { name: "绿色", value: "#10b981" },
  { name: "紫色", value: "#8b5cf6" },
  { name: "橙色", value: "#f59e0b" },
];

interface Notebook {
  id: string;
  name: string;
  description?: string;
  color: string;
  _count: { mistakes: number };
}

export default function NotebooksPage() {
  const router = useRouter();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[1].value);

  useEffect(() => {
    fetchNotebooks();
  }, []);

  const fetchNotebooks = async () => {
    try {
      const response = await fetch("/api/notebooks");
      if (response.ok) {
        const data = await response.json();
        setNotebooks(data);
      }
    } catch (error) {
      console.error("Failed to fetch notebooks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("请输入错题本名称");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/notebooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          color: newColor,
        }),
      });

      if (response.ok) {
        toast.success("错题本创建成功！");
        setNewName("");
        setNewDesc("");
        fetchNotebooks();
      } else {
        const error = await response.json();
        toast.error(error.error || "创建失败");
      }
    } catch (error) {
      toast.error("网络错误，请重试");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            管理错题本
          </h1>

          {/* Create Form */}
          <div className="card mb-8">
            <h2 className="text-xl font-semibold mb-4">创建新错题本</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    名称
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="例如：数学错题本"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述（可选）
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="简短描述"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  颜色
                </label>
                <div className="flex gap-3">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setNewColor(color.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newColor === color.value
                          ? "border-gray-900 scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="btn-primary"
              >
                {creating ? "创建中..." : "创建错题本"}
              </button>
            </form>
          </div>

          {/* Notebooks Grid */}
          <h2 className="text-xl font-semibold mb-4">我的错题本</h2>
          {notebooks.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📂</div>
              <h3 className="text-xl font-semibold mb-2">暂无错题本</h3>
              <p className="text-gray-600">
                创建第一个错题本来组织你的错题吧
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notebooks.map((nb) => (
                <div
                  key={nb.id}
                  className="card hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/mistakes?notebookId=${nb.id}`)}
                >
                  <div className="flex items-center mb-3">
                    <span
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: nb.color }}
                    ></span>
                    <h3 className="text-lg font-semibold truncate">
                      {nb.name}
                    </h3>
                  </div>
                  {nb.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {nb.description}
                    </p>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">📝</span>
                    {nb._count?.mistakes || 0} 道错题
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
