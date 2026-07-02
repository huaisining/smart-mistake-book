"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login, register: localRegister } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegistering) {
        const result = await localRegister(formData.email, formData.password, formData.name);
        if (result.success) {
          toast.success("注册成功！请登录");
          setIsRegistering(false);
        } else {
          toast.error(result.error || "注册失败");
        }
      } else {
        const result = await login(formData.email, formData.password);
        if (!result.success) {
          toast.error(result.error || "登录失败，请检查账号密码");
        } else {
          toast.success("登录成功！");
          router.push("/dashboard");
        }
      }
    } catch (error) {
      toast.error("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-3xl font-bold text-gray-900">
            {isRegistering ? "注册账号" : "登录智能错题本"}
          </h2>
          <p className="mt-2 text-gray-600">
            {isRegistering ? "创建您的学习账户" : "开始您的智能学习之旅"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入姓名"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="请输入邮箱"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input
                type="password"
                className="input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="请输入密码"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary disabled:opacity-50">
            {loading ? "处理中..." : isRegistering ? "注册" : "登录"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              {isRegistering ? "已有账号？登录" : "没有账号？注册"}
            </button>
          </div>
        </form>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}
