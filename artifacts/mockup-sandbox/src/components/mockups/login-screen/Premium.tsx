import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ChevronDown, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

const COUNTRIES = [
  { code: "BR", dial: "+55", flag: "🇧🇷", name: "Brasil" },
  { code: "US", dial: "+1", flag: "🇺🇸", name: "Estados Unidos" },
  { code: "PT", dial: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "AR", dial: "+54", flag: "🇦🇷", name: "Argentina" },
  { code: "MX", dial: "+52", flag: "🇲🇽", name: "México" },
  { code: "CO", dial: "+57", flag: "🇨🇴", name: "Colômbia" },
  { code: "CL", dial: "+56", flag: "🇨🇱", name: "Chile" },
  { code: "ES", dial: "+34", flag: "🇪🇸", name: "Espanha" },
];

export function Premium() {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [step, setStep] = useState<"login" | "code">("login");
  const [email, setEmail] = useState("");

  return (
    <div
      className="w-[390px] min-h-[844px] font-sans flex flex-col relative overflow-hidden select-none"
      style={{ background: "linear-gradient(160deg, #0D0A1A 0%, #08080D 40%, #0A0814 100%)" }}
    >
      {/* Animated BG blobs */}
      <div className="absolute top-[-60px] left-[-40px] w-72 h-72 rounded-full opacity-25 pointer-events-none"
        style={{ background: "radial-gradient(circle, #7C3AED, transparent 70%)", filter: "blur(60px)" }} />
      <div className="absolute top-32 right-[-60px] w-56 h-56 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #EC4899, transparent 70%)", filter: "blur(50px)" }} />
      <div className="absolute bottom-20 left-8 w-48 h-48 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #6366F1, transparent 70%)", filter: "blur(45px)" }} />

      {/* Top spacing */}
      <div className="pt-16 px-7 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
            <Zap className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-white tracking-tight">BotAluguel</h1>
            <span className="text-[11px] font-bold tracking-[2px] text-purple-400/70">PRO</span>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-[14px] text-purple-200/40 mt-4 leading-relaxed">
          Automatize seu WhatsApp com inteligência
        </p>
      </div>

      {step === "login" ? (
        <div className="px-7 mt-8 flex-1 flex flex-col relative z-10">
          {/* Email input */}
          <label className="text-[11px] font-bold tracking-[1.5px] text-purple-300/50 mb-2">E-MAIL</label>
          <div className="relative mb-5">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Mail className="w-[18px] h-[18px] text-purple-400/50" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full h-[52px] rounded-xl pl-11 pr-4 text-[15px] text-white placeholder:text-purple-300/25 outline-none transition-all focus:ring-2 focus:ring-purple-500/40"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
          </div>

          {/* Phone with country code */}
          <label className="text-[11px] font-bold tracking-[1.5px] text-purple-300/50 mb-2">WHATSAPP</label>
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setShowCountryPicker(!showCountryPicker)}
              className="h-[52px] px-3 rounded-xl flex items-center gap-1.5 shrink-0 transition-all hover:bg-white/[0.08]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span className="text-[20px]">{selectedCountry.flag}</span>
              <span className="text-[13px] text-purple-200/60 font-medium">{selectedCountry.dial}</span>
              <ChevronDown className="w-3.5 h-3.5 text-purple-400/40" />
            </button>
            <div className="relative flex-1">
              <input
                type="tel"
                placeholder="(00) 00000-0000"
                className="w-full h-[52px] rounded-xl px-4 text-[15px] text-white placeholder:text-purple-300/25 outline-none transition-all focus:ring-2 focus:ring-purple-500/40"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            </div>
          </div>

          {/* Country picker dropdown */}
          {showCountryPicker && (
            <div className="mb-4 rounded-xl overflow-hidden max-h-[200px] overflow-y-auto"
              style={{ background: "rgba(14,14,22,0.97)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
              {COUNTRIES.map(c => (
                <button key={c.code}
                  className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-purple-500/10"
                  onClick={() => { setSelectedCountry(c); setShowCountryPicker(false); }}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-[20px]">{c.flag}</span>
                  <span className="text-[14px] text-white/80 flex-1">{c.name}</span>
                  <span className="text-[12px] text-purple-300/40">{c.dial}</span>
                </button>
              ))}
            </div>
          )}

          {/* Password */}
          <label className="text-[11px] font-bold tracking-[1.5px] text-purple-300/50 mb-2">SENHA</label>
          <div className="relative mb-3">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Lock className="w-[18px] h-[18px] text-purple-400/50" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full h-[52px] rounded-xl pl-11 pr-12 text-[15px] text-white placeholder:text-purple-300/25 outline-none transition-all focus:ring-2 focus:ring-purple-500/40"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400/40 hover:text-purple-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
            </button>
          </div>

          <button className="self-end text-[12px] text-purple-400/60 hover:text-purple-300 transition-colors mb-6">
            Esqueci minha senha
          </button>

          {/* Login button */}
          <button
            onClick={() => setStep("code")}
            className="w-full h-[54px] rounded-xl flex items-center justify-center gap-2 text-[15px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)", boxShadow: "0 4px 24px rgba(124,58,237,0.35)" }}
          >
            Entrar
            <ArrowRight className="w-[18px] h-[18px]" />
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="text-[11px] text-purple-300/30 font-medium">ou continue com</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Google button */}
          <button
            className="w-full h-[52px] rounded-xl flex items-center justify-center gap-3 text-[14px] font-semibold text-white/80 transition-all hover:bg-white/[0.08] active:scale-[0.98]"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Entrar com Google
          </button>

          {/* Sign up */}
          <div className="mt-auto pb-10 pt-6 text-center">
            <p className="text-[13px] text-purple-200/30">
              Não tem conta?{" "}
              <button className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
                Criar agora
              </button>
            </p>
          </div>
        </div>
      ) : (
        /* Verification Code Step */
        <div className="px-7 mt-8 flex-1 flex flex-col relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
              <Shield className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-white">Verificação</h2>
              <p className="text-[12px] text-purple-200/40">Código enviado para {email || "seu@email.com"}</p>
            </div>
          </div>

          <p className="text-[13px] text-purple-200/30 mt-4 mb-8">
            Digite o código de 6 dígitos que enviamos para seu e-mail
          </p>

          {/* Code input boxes */}
          <div className="flex gap-3 justify-center mb-8">
            {[0,1,2,3,4,5].map(i => (
              <div key={i}
                className="w-[46px] h-[56px] rounded-xl flex items-center justify-center text-[24px] font-bold text-white"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${i === 0 ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}` }}
              >
                {i === 0 && <span className="animate-pulse text-purple-400">|</span>}
              </div>
            ))}
          </div>

          {/* Confirm button */}
          <button
            className="w-full h-[54px] rounded-xl flex items-center justify-center gap-2 text-[15px] font-bold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%)", boxShadow: "0 4px 24px rgba(124,58,237,0.35)" }}
          >
            <Sparkles className="w-[18px] h-[18px]" />
            Confirmar
          </button>

          <div className="text-center mt-6">
            <p className="text-[13px] text-purple-200/30">
              Não recebeu?{" "}
              <button className="text-purple-400 font-semibold">Reenviar código</button>
            </p>
          </div>

          <button
            onClick={() => setStep("login")}
            className="mt-4 self-center text-[12px] text-purple-400/50 hover:text-purple-300 transition-colors"
          >
            ← Voltar ao login
          </button>

          {/* Features section */}
          <div className="mt-auto pb-10 pt-8 space-y-4">
            {[
              { icon: <Zap className="w-4 h-4" />, text: "Bot ativo 24h no WhatsApp" },
              { icon: <Shield className="w-4 h-4" />, text: "Moderação automática de grupos" },
              { icon: <Sparkles className="w-4 h-4" />, text: "Comandos ilimitados" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-purple-400"
                  style={{ background: "rgba(124,58,237,0.1)" }}>
                  {f.icon}
                </div>
                <span className="text-[13px] text-purple-200/40">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}