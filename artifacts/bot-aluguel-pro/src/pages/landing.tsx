import { Link } from "wouter";
import { motion } from "framer-motion";
import { Bot, Zap, Shield, BarChart3, CheckCircle, ArrowRight, Coins, Code2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Bot,
    title: "Bot WhatsApp em Minutos",
    description: "Conecte seu bot via QR Code ou codigo de 8 digitos. Sem Termux, sem programacao, sem complicacao.",
  },
  {
    icon: Code2,
    title: "Builder Visual Drag-and-Drop",
    description: "Monte fluxos de conversa arrastando blocos visuais. Configure comandos sem escrever uma linha de codigo.",
  },
  {
    icon: Zap,
    title: "Respostas em Tempo Real",
    description: "Seu bot responde instantaneamente com WebSockets. Status ao vivo, sem atualizacoes manuais.",
  },
  {
    icon: Coins,
    title: "Pagamento via PIX",
    description: "Carregue moedas com PIX e ative planos na hora. Simples, rapido e seguro com EFI Bank.",
  },
  {
    icon: Shield,
    title: "Multi-Sessoes Isoladas",
    description: "Cada usuario tem seus bots isolados e seguros. Sem interferencia entre sessoes.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Completo",
    description: "Acompanhe o status dos seus bots, moedas, planos e atividade em um painel centralizado.",
  },
];

const plans = [
  {
    id: "basico",
    name: "Basico",
    coins: 100,
    features: ["1 grupo de WhatsApp", "Comandos basicos", "Suporte via chat", "30 dias de uso"],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    coins: 250,
    features: ["5 grupos de WhatsApp", "Builder visual completo", "Suporte prioritario", "30 dias de uso"],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    coins: 500,
    features: ["Grupos ilimitados", "Todos os recursos Pro", "API de integracao", "Suporte VIP 24/7"],
    popular: false,
  },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">BotAluguel<span className="text-primary">.Pro</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white">
              <Link href="/register">Comecar Gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[300px] bg-accent/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge className="mb-6 border-primary/30 bg-primary/10 text-primary text-sm px-4 py-1">
              Plataforma SaaS de Bots WhatsApp
            </Badge>
          </motion.div>
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-none"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Seu Bot WhatsApp{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Profissional
            </span>
            <br />sem Programar
          </motion.h1>
          <motion.p
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Crie, configure e gerencie bots de WhatsApp com um editor visual. Conecte via QR Code, compre com PIX e use imediatamente.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-base font-semibold group">
              <Link href="/register">
                Criar conta gratis
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white px-8 py-6 text-base">
              <Link href="/login">Ja tenho conta</Link>
            </Button>
          </motion.div>
          <motion.div
            className="mt-8 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Ganhe 30 moedas gratis no cadastro. Sem cartao de credito.
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tudo que voce precisa para automatizar
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Uma plataforma completa para criar e gerenciar seus bots de WhatsApp sem precisar de um tecnico.
            </p>
          </motion.div>
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="p-6 rounded-xl border border-white/5 bg-card hover:border-primary/20 transition-all duration-300 group"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planos e Precos</h2>
            <p className="text-muted-foreground">1 BRL = 100 moedas. Recarregue via PIX e ative quando quiser.</p>
          </motion.div>
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                variants={fadeInUp}
                className={`relative p-6 rounded-xl border transition-all duration-300 ${
                  plan.popular
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-white/5 bg-card hover:border-white/10"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white border-0">
                    Mais Popular
                  </Badge>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.coins}</span>
                    <span className="text-muted-foreground text-sm">moedas / 30 dias</span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-1">R$ {(plan.coins * 0.01).toFixed(2)}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={`w-full ${plan.popular ? "bg-primary hover:bg-primary/90 text-white" : "border-white/10 bg-white/5 hover:bg-white/10 text-white"}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link href="/register">Comecar Agora</Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4 bg-card/30">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pronto para automatizar seu WhatsApp?
            </h2>
            <p className="text-muted-foreground mb-8">
              Junte-se a centenas de usuarios que ja usam o BotAluguel Pro para automatizar atendimentos e grupos.
            </p>
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-10 py-6 text-base font-semibold">
              <Link href="/register">
                <Smartphone className="mr-2 h-5 w-5" />
                Criar meu bot agora
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">BotAluguel<span className="text-primary">.Pro</span></span>
          </div>
          <p className="text-muted-foreground text-sm">
            2024 BotAluguel Pro. Plataforma de bots WhatsApp.
          </p>
        </div>
      </footer>
    </div>
  );
}
