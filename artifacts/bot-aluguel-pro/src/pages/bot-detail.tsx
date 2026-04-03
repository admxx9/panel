import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Bot, QrCode, Hash, Wifi, WifiOff, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetBot, useConnectBot, useDisconnectBot, getGetBotQueryKey, getGetBotCommandsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function BotDetailPage() {
  const params = useParams<{ botId: string }>();
  const botId = params.botId;
  const [, setLocation] = useLocation();
  const { data: bot, isLoading } = useGetBot(botId, { query: { enabled: !!botId } });
  const connectBot = useConnectBot();
  const disconnectBot = useDisconnectBot();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [phoneInput, setPhoneInput] = useState("");

  const handleConnect = async (type: "qrcode" | "code") => {
    try {
      await connectBot.mutateAsync({ botId, data: { type, phone: phoneInput || undefined } });
      queryClient.invalidateQueries({ queryKey: getGetBotQueryKey(botId) });
      toast({ title: "Conexao iniciada!", description: "Escaneie o QR Code ou use o codigo para conectar." });
    } catch {
      toast({ title: "Erro", description: "Nao foi possivel iniciar a conexao.", variant: "destructive" });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectBot.mutateAsync({ botId });
      queryClient.invalidateQueries({ queryKey: getGetBotQueryKey(botId) });
      toast({ title: "Bot desconectado" });
    } catch {
      toast({ title: "Erro", description: "Nao foi possivel desconectar o bot.", variant: "destructive" });
    }
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    connected: { label: "Conectado", color: "bg-green-500/10 text-green-400 border-green-500/20" },
    connecting: { label: "Conectando...", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
    disconnected: { label: "Desconectado", color: "bg-white/5 text-muted-foreground border-white/10" },
    error: { label: "Erro", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  };

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
        <>
          <div className="bg-card border border-white/5 rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{bot.name}</h1>
                  <p className="text-muted-foreground text-sm">{bot.phone ? `+${bot.phone}` : "Sem telefone"} &bull; {bot.totalGroups} grupos</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`border ${statusConfig[bot.status]?.color || statusConfig.disconnected.color}`}>
                  {bot.status === "connecting" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
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

          {(bot.status === "disconnected" || bot.status === "error") && (
            <div className="bg-card border border-white/5 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">Conectar ao WhatsApp</h2>
              <Tabs defaultValue="qrcode">
                <TabsList className="bg-background border border-white/10 mb-6">
                  <TabsTrigger value="qrcode" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </TabsTrigger>
                  <TabsTrigger value="code" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    <Hash className="h-4 w-4 mr-2" />
                    Codigo 8 Digitos
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="qrcode">
                  <p className="text-muted-foreground text-sm mb-4">
                    Clique em Gerar QR Code e escaneie com o WhatsApp no seu celular.
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
                <TabsContent value="code">
                  <p className="text-muted-foreground text-sm mb-4">
                    Gere um codigo de 8 digitos. No WhatsApp, va em Dispositivos Vinculados e insira o codigo.
                  </p>
                  <Button
                    onClick={() => handleConnect("code")}
                    disabled={connectBot.isPending}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    {connectBot.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Hash className="mr-2 h-4 w-4" />}
                    Gerar Codigo
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {bot.status === "connecting" && (
            <motion.div
              className="bg-card border border-yellow-500/20 rounded-xl p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h2 className="text-white font-semibold mb-4">Aguardando Conexao</h2>
              {bot.connectionType === "qrcode" && bot.qrCode ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-muted-foreground text-sm">Escaneie o QR Code abaixo com seu WhatsApp</p>
                  <div className="p-4 bg-white rounded-xl">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(bot.qrCode)}&size=250x250`}
                      alt="QR Code WhatsApp"
                      className="w-64 h-64"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Abra o WhatsApp {'>'} Dispositivos Vinculados {'>'} Vincular dispositivo</p>
                </div>
              ) : bot.connectionType === "code" && bot.pairCode ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-muted-foreground text-sm">Insira este codigo no WhatsApp em Dispositivos Vinculados</p>
                  <div className="text-5xl font-mono font-bold tracking-widest text-primary bg-primary/10 px-8 py-4 rounded-xl border border-primary/20">
                    {bot.pairCode}
                  </div>
                  <p className="text-xs text-muted-foreground">WhatsApp {'>'} Configuracoes {'>'} Dispositivos Vinculados {'>'} Vincular com numero</p>
                </div>
              ) : null}
              <div className="flex justify-center mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => queryClient.invalidateQueries({ queryKey: getGetBotQueryKey(botId) })}
                  className="text-muted-foreground"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Atualizar status
                </Button>
              </div>
            </motion.div>
          )}

          {bot.status === "connected" && (
            <div className="bg-card border border-green-500/10 rounded-xl p-6">
              <div className="flex items-center gap-3 text-green-400">
                <Wifi className="h-5 w-5" />
                <span className="font-semibold">Bot conectado e ativo!</span>
              </div>
              <p className="text-muted-foreground text-sm mt-2">
                Seu bot esta em execucao e respondendo mensagens. Acesse o Builder para configurar os comandos.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Bot nao encontrado</p>
        </div>
      )}
    </DashboardLayout>
  );
}
