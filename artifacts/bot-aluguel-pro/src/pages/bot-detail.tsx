import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Bot, QrCode, Hash, Wifi, WifiOff, Loader2, ArrowLeft, RefreshCw, Phone,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetBot, useConnectBot, useDisconnectBot, getGetBotQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig: Record<string, { label: string; color: string }> = {
  connected: { label: "Conectado", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  connecting: { label: "Conectando...", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  disconnected: { label: "Desconectado", color: "bg-white/5 text-muted-foreground border-white/10" },
  error: { label: "Erro", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export default function BotDetailPage() {
  const params = useParams<{ botId: string }>();
  const botId = params.botId;
  const [, setLocation] = useLocation();
  const { data: bot, isLoading, refetch } = useGetBot(botId, { query: { enabled: !!botId } });
  const connectBot = useConnectBot();
  const disconnectBot = useDisconnectBot();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [phoneInput, setPhoneInput] = useState("");
  const [liveQr, setLiveQr] = useState<string | null>(null);
  const [livePairCode, setLivePairCode] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const sseRef = useRef<EventSource | null>(null);

  const closeSse = () => {
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
  };

  const openSse = (id: string) => {
    closeSse();
    const token = localStorage.getItem("bot_token") ?? "";
    const url = `/api/bots/${id}/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    sseRef.current = es;

    es.addEventListener("qr", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setLiveQr(data.qrCode);
      setLivePairCode(null);
      refetch();
    });

    es.addEventListener("paircode", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setLivePairCode(data.code);
      setLiveQr(null);
      refetch();
    });

    es.addEventListener("status", (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      if (data.status === "connected") {
        setConnecting(false);
        setLiveQr(null);
        setLivePairCode(null);
        closeSse();
        toast({ title: "WhatsApp conectado!", description: `Número: +${data.phone}` });
      } else if (data.status === "disconnected") {
        setConnecting(false);
        closeSse();
      }
      refetch();
      queryClient.invalidateQueries({ queryKey: getGetBotQueryKey(botId) });
    });

    es.addEventListener("error", (e) => {
      const data = JSON.parse((e as MessageEvent).data ?? "{}");
      toast({ title: "Erro na conexão", description: data.message ?? "Tente novamente.", variant: "destructive" });
      setConnecting(false);
    });

    es.onerror = () => {};
  };

  useEffect(() => {
    if (bot?.status === "connecting" && botId) {
      openSse(botId);
    }
    return () => closeSse();
  }, []);

  useEffect(() => {
    return () => closeSse();
  }, []);

  const handleConnect = async (type: "qrcode" | "code") => {
    if (type === "code" && !phoneInput.trim()) {
      toast({ title: "Informe o número", description: "Digite o número do WhatsApp do bot.", variant: "destructive" });
      return;
    }
    try {
      setConnecting(true);
      setLiveQr(null);
      setLivePairCode(null);
      await connectBot.mutateAsync({ botId, data: { type, phone: phoneInput || undefined } });
      queryClient.invalidateQueries({ queryKey: getGetBotQueryKey(botId) });
      openSse(botId);
      toast({ title: "Aguardando...", description: type === "qrcode" ? "QR Code sendo gerado..." : "Código sendo gerado..." });
    } catch {
      setConnecting(false);
      toast({ title: "Erro", description: "Não foi possível iniciar a conexão.", variant: "destructive" });
    }
  };

  const handleDisconnect = async () => {
    try {
      closeSse();
      setLiveQr(null);
      setLivePairCode(null);
      setConnecting(false);
      await disconnectBot.mutateAsync({ botId });
      queryClient.invalidateQueries({ queryKey: getGetBotQueryKey(botId) });
      toast({ title: "Bot desconectado" });
    } catch {
      toast({ title: "Erro", description: "Não foi possível desconectar.", variant: "destructive" });
    }
  };

  const isConnecting = connecting || bot?.status === "connecting";
  const showQr = liveQr || (bot?.status === "connecting" && bot.connectionType === "qrcode" && bot.qrCode);
  const showCode = livePairCode || (bot?.status === "connecting" && bot.connectionType === "code" && bot.pairCode);
  const displayQr = liveQr ?? (bot?.qrCode ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(bot.qrCode)}&size=250x250` : null);
  const displayCode = livePairCode ?? bot?.pairCode;

  return (
    <DashboardLayout>
      <button
        onClick={() => setLocation("/dashboard/bots")}
        className="flex items-center gap-2 text-muted-foreground hover:text-white text-sm mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Meus Bots
      </button>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 rounded-xl bg-card" />
          <Skeleton className="h-64 rounded-xl bg-card" />
        </div>
      ) : bot ? (
        <div className="space-y-6">
          <div className="bg-card border border-white/5 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{bot.name}</h1>
                  <p className="text-muted-foreground text-sm">
                    {bot.phone ? `+${bot.phone}` : "Sem número vinculado"} &bull; {bot.totalGroups} grupos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`border ${statusConfig[bot.status]?.color || statusConfig.disconnected.color}`}>
                  {isConnecting && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                  {statusConfig[bot.status]?.label || "Desconhecido"}
                </Badge>
                {bot.status === "connected" && (
                  <Button size="sm" variant="outline" onClick={handleDisconnect} className="border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Desconectar
                  </Button>
                )}
              </div>
            </div>
          </div>

          {(bot.status === "disconnected" || bot.status === "error") && !isConnecting && (
            <div className="bg-card border border-white/5 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-2">Conectar ao WhatsApp</h2>
              <p className="text-muted-foreground text-sm mb-5">
                Informe o número do WhatsApp que será usado como bot (com DDI e DDD, ex: 5511999990000).
              </p>

              <div className="mb-5">
                <Label className="text-white/80 text-sm mb-2 block">
                  <Phone className="inline h-3.5 w-3.5 mr-1" />
                  Número do bot (WhatsApp)
                </Label>
                <Input
                  placeholder="Ex: 5511999990000"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))}
                  className="bg-background border-white/10 text-white max-w-xs"
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground mt-1">Somente números, com DDI (55 para Brasil)</p>
              </div>

              <Tabs defaultValue="code">
                <TabsList className="bg-background border border-white/10 mb-6">
                  <TabsTrigger value="code" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    <Hash className="h-4 w-4 mr-2" />
                    Código 8 Dígitos
                  </TabsTrigger>
                  <TabsTrigger value="qrcode" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="code">
                  <p className="text-muted-foreground text-sm mb-4">
                    Gere um código de pareamento. No WhatsApp, vá em <strong className="text-white/70">Dispositivos Vinculados → Vincular com número</strong> e insira o código.
                  </p>
                  <Button
                    onClick={() => handleConnect("code")}
                    disabled={connectBot.isPending}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {connectBot.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Hash className="mr-2 h-4 w-4" />}
                    Gerar Código de Pareamento
                  </Button>
                </TabsContent>

                <TabsContent value="qrcode">
                  <p className="text-muted-foreground text-sm mb-4">
                    Clique em Gerar QR Code e escaneie com o WhatsApp no celular em <strong className="text-white/70">Dispositivos Vinculados → Vincular dispositivo</strong>.
                  </p>
                  <Button
                    onClick={() => handleConnect("qrcode")}
                    disabled={connectBot.isPending}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {connectBot.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <QrCode className="mr-2 h-4 w-4" />}
                    Gerar QR Code
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {(isConnecting || showQr || showCode) && (
            <motion.div
              className="bg-card border border-yellow-500/20 rounded-xl p-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <Loader2 className="h-5 w-5 text-yellow-400 animate-spin" />
                <h2 className="text-white font-semibold">Aguardando Conexão</h2>
              </div>

              {showQr && displayQr ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-muted-foreground text-sm">Escaneie o QR Code com seu WhatsApp</p>
                  <div className="p-4 bg-white rounded-xl">
                    {liveQr ? (
                      <img src={liveQr} alt="QR Code WhatsApp" className="w-64 h-64" />
                    ) : (
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(bot.qrCode ?? "")}&size=250x250`}
                        alt="QR Code WhatsApp"
                        className="w-64 h-64"
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    WhatsApp → Dispositivos Vinculados → Vincular dispositivo
                  </p>
                </div>
              ) : showCode && displayCode ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-muted-foreground text-sm">Insira este código no WhatsApp</p>
                  <div className="text-5xl font-mono font-bold tracking-widest text-primary bg-primary/10 px-8 py-5 rounded-xl border border-primary/20">
                    {displayCode}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    WhatsApp → Configurações → Dispositivos Vinculados → Vincular com número
                  </p>
                  <p className="text-xs text-yellow-400/80 text-center">
                    O código expira em 60 segundos. Insira rapidamente!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-6">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  <p className="text-muted-foreground text-sm">Iniciando sessão Baileys...</p>
                </div>
              )}

              <div className="flex justify-center gap-3 mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    refetch();
                    queryClient.invalidateQueries({ queryKey: getGetBotQueryKey(botId) });
                  }}
                  className="text-muted-foreground"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Atualizar status
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-red-400/70 hover:text-red-400"
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          )}

          {bot.status === "connected" && !isConnecting && (
            <div className="bg-card border border-green-500/10 rounded-xl p-6">
              <div className="flex items-center gap-3 text-green-400">
                <Wifi className="h-5 w-5" />
                <span className="font-semibold">Bot conectado e ativo!</span>
              </div>
              <p className="text-muted-foreground text-sm mt-2">
                Seu bot está em execução. Acesse o Builder para configurar os comandos.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Bot não encontrado</p>
        </div>
      )}
    </DashboardLayout>
  );
}
