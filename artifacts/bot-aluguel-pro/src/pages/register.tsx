import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Bot, Phone, Lock, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useRegister } from "@workspace/api-client-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await registerMutation.mutateAsync({ data: { name, phone, password } });
      login(result.token, result.user);
      toast({ title: "Conta criada!", description: "Voce ganhou 30 moedas de boas-vindas!" });
      setLocation("/dashboard");
    } catch (err: unknown) {
      const apiErr = err as { data?: { message?: string }; message?: string };
      const msg = apiErr?.data?.message || apiErr?.message || "Erro ao criar conta";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[100px]" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">BotAluguel<span className="text-primary">.Pro</span></span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Criar sua conta</h1>
          <p className="text-muted-foreground mt-1 text-sm">Ganhe 30 moedas gratis no cadastro</p>
        </div>

        <div className="bg-card border border-white/5 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white/80 text-sm mb-1.5 block">Nome</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 bg-background border-white/10 text-white placeholder:text-muted-foreground/50"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone" className="text-white/80 text-sm mb-1.5 block">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Ex: 11999887766"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9 bg-background border-white/10 text-white placeholder:text-muted-foreground/50"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="password" className="text-white/80 text-sm mb-1.5 block">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Crie uma senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-background border-white/10 text-white placeholder:text-muted-foreground/50"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white mt-2"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar conta gratis
            </Button>
          </form>
        </div>

        <p className="text-center text-muted-foreground text-sm mt-6">
          Ja tem conta?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
