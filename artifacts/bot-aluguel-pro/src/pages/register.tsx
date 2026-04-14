import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Cpu, Phone, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useRegister } from "@workspace/api-client-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await registerMutation.mutateAsync({ data: { name, phone, password } });
      login(result.token, result.user);
      setLocation("/dashboard");
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string }; message?: string };
      const msg = apiErr?.data?.message || apiErr?.message || "Erro ao criar conta";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-xl bg-[#7C3AED] flex items-center justify-center mb-4 shadow-[0_0_32px_rgba(124,58,237,0.4)]">
            <Cpu className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-[22px] font-bold text-white tracking-tight">
            BotAluguel<span className="text-[#7C3AED]">.Pro</span>
          </h1>
          <p className="text-[#4b4c6b] text-[12px] mt-1 tracking-wide">Crie sua conta grátis</p>
        </div>

        <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-6">
          <h2 className="text-[15px] font-bold text-[#f1f2f6] mb-5">Criar conta</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1.5">Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4b4c6b]" />
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#131420] border border-[#1e1f2e] rounded-md pl-9 pr-3 py-2.5 text-[14px] text-white placeholder-[#4b4c6b] outline-none focus:border-[#7C3AED] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1.5">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4b4c6b]" />
                <input
                  type="tel"
                  placeholder="55 11 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full bg-[#131420] border border-[#1e1f2e] rounded-md pl-9 pr-3 py-2.5 text-[14px] text-white placeholder-[#4b4c6b] outline-none focus:border-[#7C3AED] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4b4c6b]" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#131420] border border-[#1e1f2e] rounded-md pl-9 pr-9 py-2.5 text-[14px] text-white placeholder-[#4b4c6b] outline-none focus:border-[#7C3AED] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4b4c6b] hover:text-[#8b8ea0] transition-colors"
                >
                  {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-[14px] py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
            >
              {registerMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar conta
            </button>
          </form>
        </div>

        <p className="text-center text-[#4b4c6b] text-[12px] mt-5">
          Já tem conta?{" "}
          <Link href="/login" className="text-[#7C3AED] hover:text-[#6D28D9] font-semibold transition-colors">
            Entrar
          </Link>
        </p>
      </div>

      <p className="text-[#1a1b28] text-[11px] mt-10">BotAluguel Pro © 2025</p>
    </div>
  );
}
