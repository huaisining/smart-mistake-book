"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Mail, Lock, User, LogIn } from "lucide-react";
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
        if (result.success) { toast.success("注册成功！请登录"); setIsRegistering(false); }
        else { toast.error(result.error || "注册失败"); }
      } else {
        const result = await login(formData.email, formData.password);
        if (!result.success) { toast.error(result.error || "登录失败"); }
        else { toast.success("登录成功！"); router.push("/dashboard"); }
      }
    } catch (error) { toast.error("网络错误，请重试"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{isRegistering ? "注册账号" : "智能错题本"}</CardTitle>
          <CardDescription>{isRegistering ? "创建您的学习账户" : "登录以继续学习"}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {isRegistering && (
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="姓名（选填）" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" type="email" placeholder="邮箱" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" type="password" placeholder="密码" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <LogIn className="h-4 w-4" /> {loading ? "处理中..." : isRegistering ? "注册" : "登录"}
            </Button>
          </CardContent>
        </form>
        <div className="px-6 pb-6 text-center">
          <Button variant="link" className="text-sm" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? "已有账号？登录" : "没有账号？注册"}
          </Button>
        </div>
      </Card>
      <Toaster position="top-center" />
    </div>
  );
}
