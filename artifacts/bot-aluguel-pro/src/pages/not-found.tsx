import { useEffect } from "react";
import { Link } from "wouter";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("workspace_iframe") || path.includes("__replco")) {
      const params = new URLSearchParams(window.location.search);
      const initialPath = params.get("initialPath") ?? "/";
      window.location.replace(initialPath);
    }
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="flex items-center justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground/40" />
        </div>
        <h1 className="text-5xl font-extrabold text-white mb-2">404</h1>
        <p className="text-muted-foreground mb-6">Pagina nao encontrada</p>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Voltar ao inicio
          </Link>
        </Button>
      </div>
    </div>
  );
}
