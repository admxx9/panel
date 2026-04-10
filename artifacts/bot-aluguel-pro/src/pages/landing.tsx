import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { Bot, Zap, Shield, BarChart3, CheckCircle, ArrowRight, Coins, Code2, Smartphone, MessageSquare, Users, Star, ChevronDown, QrCode, Palette, Globe, Mail } from "lucide-react";
import { useRef, useState, useEffect } from "react";

const features = [
  { icon: Bot, title: "Bot WhatsApp em Minutos", description: "Conecte seu bot via QR Code ou codigo de 8 digitos. Sem Termux, sem programacao." },
  { icon: Code2, title: "Builder Visual Drag-and-Drop", description: "Monte fluxos de conversa arrastando blocos visuais. Zero codigo." },
  { icon: Zap, title: "Respostas em Tempo Real", description: "Seu bot responde instantaneamente com WebSockets. Status ao vivo." },
  { icon: Coins, title: "Pagamento via PIX", description: "Carregue moedas com PIX e ative planos na hora. Simples e seguro." },
  { icon: Shield, title: "Multi-Sessoes Isoladas", description: "Cada usuario tem seus bots isolados e seguros." },
  { icon: BarChart3, title: "Dashboard Completo", description: "Acompanhe status dos bots, moedas, planos e atividade." },
];

const steps = [
  { num: "01", icon: Users, title: "Cadastre-se Gratis", description: "Crie sua conta em segundos e ganhe 30 moedas gratis. Sem cartao de credito." },
  { num: "02", icon: QrCode, title: "Conecte seu WhatsApp", description: "Escaneie o QR Code ou use codigo de 8 digitos pra conectar seu numero." },
  { num: "03", icon: Palette, title: "Configure seu Bot", description: "Use o builder visual pra criar comandos, respostas e fluxos personalizados." },
];

const plans = [
  { id: "basico", name: "Basico", coins: 100, features: ["1 grupo de WhatsApp", "Comandos basicos", "Suporte via chat", "30 dias de uso"], popular: false },
  { id: "pro", name: "Pro", coins: 250, features: ["5 grupos de WhatsApp", "Builder visual completo", "Suporte prioritario", "30 dias de uso"], popular: true },
  { id: "premium", name: "Premium", coins: 500, features: ["Grupos ilimitados", "Todos os recursos Pro", "API de integracao", "Suporte VIP 24/7"], popular: false },
];

const testimonials = [
  { name: "Carlos M.", role: "Dono de grupo", text: "Mudou completamente como gerencio meu grupo de vendas. O bot responde instantaneamente e nunca dorme!", avatar: "C", stars: 5 },
  { name: "Ana S.", role: "Atendimento", text: "Antes eu passava horas respondendo as mesmas perguntas. Agora o bot faz tudo sozinho. Economizo tempo demais.", avatar: "A", stars: 5 },
  { name: "Pedro L.", role: "Empreendedor", text: "O builder visual e incrivel. Criei meu primeiro bot em 10 minutos sem saber nada de programacao.", avatar: "P", stars: 5 },
  { name: "Julia R.", role: "Marketing", text: "Uso pra enviar mensagens automaticas pros meus clientes. Ferramenta essencial pro meu negocio.", avatar: "J", stars: 4 },
];

const faqs = [
  { q: "Preciso saber programar?", a: "Nao! O BotAluguel Pro tem um editor visual onde voce monta fluxos arrastando blocos. Zero codigo necessario." },
  { q: "Como funciona o pagamento?", a: "Voce compra moedas via PIX (1 BRL = 100 moedas) e usa pra ativar planos. Sem assinatura mensal obrigatoria." },
  { q: "Meu numero pode ser banido?", a: "Usamos a biblioteca Baileys, a mesma usada por outros bots populares. Recomendamos usar um numero secundario por seguranca." },
  { q: "Quantos bots posso ter?", a: "Depende do plano. O basico permite 1 grupo, o Pro 5 grupos e o Premium ilimitado." },
  { q: "O bot funciona 24 horas?", a: "Sim! Enquanto seu plano estiver ativo, o bot roda 24/7 nos nossos servidores." },
  { q: "Posso cancelar a qualquer momento?", a: "Sim. Nao tem fidelidade. Quando seu plano expirar, voce escolhe se quer renovar ou nao." },
];

const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const fadeInUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1500;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);
  return <span ref={ref}>{count.toLocaleString("pt-BR")}{suffix}</span>;
}

function FAQItem({ q, a, id }: { q: string; a: string; id: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={fadeInUp} className="border border-[#1a1b28] rounded-lg overflow-hidden bg-[#0d0e16] hover:border-[#2a2b3e] transition-colors">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-5 text-left" aria-expanded={open} aria-controls={`faq-${id}`}>
        <span className="text-white font-medium text-sm pr-4">{q}</span>
        <ChevronDown className={`h-4 w-4 text-[#4b4c6b] flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div id={`faq-${id}`} role="region" className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-5" : "max-h-0"}`}>
        <p className="px-5 text-[#4b4c6b] text-sm leading-relaxed">{a}</p>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#c9cadb] overflow-x-hidden">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#090A0F]/95 backdrop-blur-lg border-b border-[#1a1b28] shadow-lg" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-[#7C3AED] flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">BotAluguel<span className="text-[#7C3AED]">.Pro</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#recursos" className="text-sm text-[#4b4c6b] hover:text-white transition-colors">Recursos</a>
            <a href="#como-funciona" className="text-sm text-[#4b4c6b] hover:text-white transition-colors">Como Funciona</a>
            <a href="#planos" className="text-sm text-[#4b4c6b] hover:text-white transition-colors">Planos</a>
            <a href="#faq" className="text-sm text-[#4b4c6b] hover:text-white transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-3 py-1.5 text-sm text-[#4b4c6b] hover:text-white transition-colors">Entrar</Link>
            <Link href="/register" className="px-4 py-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold rounded-md transition-colors">
              Comecar Gratis
            </Link>
          </div>
        </div>
      </header>

      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#7C3AED]/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[300px] bg-[#7C3AED]/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 text-[#7C3AED] text-sm font-semibold mb-6">
              Plataforma SaaS de Bots WhatsApp
            </div>
          </motion.div>
          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          >
            Seu Bot WhatsApp{" "}
            <span className="bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] bg-clip-text text-transparent">Profissional</span>
            <br />sem Programar
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-[#4b4c6b] max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          >
            Crie, configure e gerencie bots de WhatsApp com um editor visual. Conecte via QR Code, compre com PIX e use imediatamente.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/register" className="group inline-flex items-center justify-center bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-4 text-base font-semibold rounded-md shadow-xl shadow-[#7C3AED]/20 transition-colors">
              Criar conta gratis
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center border border-[#1a1b28] bg-[#0d0e16] hover:bg-[#131420] text-white px-8 py-4 text-base rounded-md transition-colors">
              Ja tenho conta
            </Link>
          </motion.div>
          <motion.p className="mt-8 text-sm text-[#4b4c6b]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            Ganhe 30 moedas gratis no cadastro. Sem cartao de credito.
          </motion.p>
        </div>

        <motion.div
          className="max-w-4xl mx-auto mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}
        >
          {[
            { label: "Usuarios Ativos", value: 1200, suffix: "+" },
            { label: "Bots Criados", value: 3500, suffix: "+" },
            { label: "Mensagens/dia", value: 50000, suffix: "+" },
            { label: "Uptime", value: 99, suffix: "%" },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-lg border border-[#1a1b28] bg-[#0d0e16]/50 backdrop-blur-sm">
              <p className="text-2xl sm:text-3xl font-bold text-white"><AnimatedCounter target={stat.value} suffix={stat.suffix} /></p>
              <p className="text-xs sm:text-sm text-[#4b4c6b] mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <section id="recursos" className="py-24 px-4 bg-[#0d0e16]/30">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-semibold mb-4">Recursos</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Tudo que voce precisa para automatizar</h2>
            <p className="text-[#4b4c6b] max-w-xl mx-auto">Uma plataforma completa para criar e gerenciar seus bots de WhatsApp sem precisar de um tecnico.</p>
          </motion.div>
          <motion.div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeInUp}
                className="p-6 rounded-lg border border-[#1a1b28] bg-[#0d0e16] hover:border-[#7C3AED]/20 transition-all duration-300 group"
              >
                <div className="h-12 w-12 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center mb-4 group-hover:bg-[#7C3AED]/20 group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="h-6 w-6 text-[#7C3AED]" />
                </div>
                <h3 className="text-white font-semibold mb-2 text-lg">{feature.title}</h3>
                <p className="text-[#4b4c6b] text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="como-funciona" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-semibold mb-4">Como Funciona</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">3 passos simples</h2>
            <p className="text-[#4b4c6b] max-w-xl mx-auto">Do cadastro ao bot funcionando em menos de 10 minutos.</p>
          </motion.div>
          <motion.div className="grid md:grid-cols-3 gap-8" variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {steps.map((step, i) => (
              <motion.div key={step.num} variants={fadeInUp} className="relative text-center group">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-[#7C3AED]/30 to-transparent" />
                )}
                <div className="h-24 w-24 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-[#7C3AED]/20 group-hover:scale-110 transition-all duration-300">
                  <step.icon className="h-10 w-10 text-[#7C3AED]" />
                </div>
                <span className="text-[#7C3AED] font-bold text-sm">{step.num}</span>
                <h3 className="text-white font-semibold text-lg mt-2 mb-2">{step.title}</h3>
                <p className="text-[#4b4c6b] text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="planos" className="py-24 px-4 bg-[#0d0e16]/30">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-semibold mb-4">Planos</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planos e Precos</h2>
            <p className="text-[#4b4c6b]">1 BRL = 100 moedas. Recarregue via PIX e ative quando quiser.</p>
          </motion.div>
          <motion.div className="grid md:grid-cols-3 gap-6" variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {plans.map((plan) => (
              <motion.div key={plan.id} variants={fadeInUp}
                className={`relative p-6 rounded-lg border transition-all duration-300 hover:scale-[1.02] ${
                  plan.popular ? "border-[#7C3AED]/50 bg-[#7C3AED]/5 shadow-xl shadow-[#7C3AED]/10 border-l-[3px] border-l-[#7C3AED]" : "border-[#1a1b28] bg-[#0d0e16] hover:border-[#2a2b3e]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                    Mais Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.coins}</span>
                    <span className="text-[#4b4c6b] text-sm">moedas / 30 dias</span>
                  </div>
                  <p className="text-[#4b4c6b] text-xs mt-1">R$ {(plan.coins * 0.01).toFixed(2)}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-[#4b4c6b]">
                      <CheckCircle className="h-4 w-4 text-[#7C3AED] flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/register"
                  className={`block text-center w-full py-2.5 rounded-md text-sm font-semibold transition-colors ${
                    plan.popular ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg shadow-[#7C3AED]/20" : "border border-[#1a1b28] bg-[#131420] hover:bg-[#1a1b28] text-white"
                  }`}
                >
                  Comecar Agora
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-semibold mb-4">Depoimentos</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">O que nossos usuarios dizem</h2>
            <p className="text-[#4b4c6b] max-w-xl mx-auto">Veja como o BotAluguel Pro esta transformando negocios.</p>
          </motion.div>
          <motion.div className="grid md:grid-cols-2 gap-6" variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {testimonials.map((t) => (
              <motion.div key={t.name} variants={fadeInUp}
                className="p-6 rounded-lg border border-[#1a1b28] bg-[#0d0e16] hover:border-[#2a2b3e] transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < t.stars ? "text-yellow-400 fill-yellow-400" : "text-[#2a2b3e]"}`} />
                  ))}
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] font-bold text-sm">{t.avatar}</div>
                  <div>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-[#4b4c6b] text-xs">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="faq" className="py-24 px-4 bg-[#0d0e16]/30">
        <div className="max-w-3xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 text-[#7C3AED] text-xs font-semibold mb-4">FAQ</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Perguntas Frequentes</h2>
            <p className="text-[#4b4c6b]">Tudo que voce precisa saber sobre o BotAluguel Pro.</p>
          </motion.div>
          <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {faqs.map((faq, i) => <FAQItem key={faq.q} q={faq.q} a={faq.a} id={String(i)} />)}
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="relative rounded-xl border border-[#7C3AED]/20 bg-gradient-to-br from-[#7C3AED]/10 via-[#0d0e16] to-[#7C3AED]/10 p-10 sm:p-16 text-center overflow-hidden"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#7C3AED]/10 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#7C3AED]/10 rounded-full blur-[60px]" />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pronto para automatizar seu WhatsApp?</h2>
              <p className="text-[#4b4c6b] mb-8 max-w-lg mx-auto">Junte-se a centenas de usuarios que ja usam o BotAluguel Pro para automatizar atendimentos e grupos.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" className="group inline-flex items-center justify-center bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-10 py-4 text-base font-semibold rounded-md shadow-xl shadow-[#7C3AED]/20 transition-colors">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Criar meu bot agora
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-[#1a1b28] bg-[#0d0e16]/50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-md bg-[#7C3AED] flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg text-white">BotAluguel<span className="text-[#7C3AED]">.Pro</span></span>
              </div>
              <p className="text-[#4b4c6b] text-sm leading-relaxed">Plataforma SaaS de bots WhatsApp para automatizar seus atendimentos e grupos.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#recursos" className="text-[#4b4c6b] text-sm hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#planos" className="text-[#4b4c6b] text-sm hover:text-white transition-colors">Planos</a></li>
                <li><a href="#como-funciona" className="text-[#4b4c6b] text-sm hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#faq" className="text-[#4b4c6b] text-sm hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Conta</h4>
              <ul className="space-y-2">
                <li><Link href="/register" className="text-[#4b4c6b] text-sm hover:text-white transition-colors">Criar Conta</Link></li>
                <li><Link href="/login" className="text-[#4b4c6b] text-sm hover:text-white transition-colors">Entrar</Link></li>
                <li><Link href="/dashboard" className="text-[#4b4c6b] text-sm hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Contato</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-[#4b4c6b] text-sm"><Mail className="h-3.5 w-3.5" /> suporte@botaluguel.pro</li>
                <li className="flex items-center gap-2 text-[#4b4c6b] text-sm"><MessageSquare className="h-3.5 w-3.5" /> WhatsApp</li>
                <li className="flex items-center gap-2 text-[#4b4c6b] text-sm"><Globe className="h-3.5 w-3.5" /> botaluguel.pro</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#1a1b28] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#4b4c6b] text-xs">2024-2026 BotAluguel Pro. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <span className="text-[#2a2b3e] text-xs">Termos de Uso</span>
              <span className="text-[#2a2b3e] text-xs">Privacidade</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
