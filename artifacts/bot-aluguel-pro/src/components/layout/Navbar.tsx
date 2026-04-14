import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary glow-primary">
            <span className="text-xl font-bold text-white">B</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">BotAluguel<span className="text-primary">.Pro</span></span>
        </div>
        
        <nav className="hidden md:flex gap-6">
          <a href="#features" className="text-sm text-muted-foreground hover:text-white transition-colors">Recursos</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-white transition-colors">Planos</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-white hover:text-primary transition-colors">
            Entrar
          </Link>
          <Button asChild className="hidden sm:inline-flex bg-primary hover:bg-primary/90 text-white font-medium glow-primary">
            <Link href="/register">Começar Agora</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
