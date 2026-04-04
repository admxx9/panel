import { useState } from "react";
import { Coins, CreditCard, Copy, CheckCircle, Clock, Loader2, History } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCreatePixCharge, useGetPaymentHistory, useCheckPixStatus, getGetPaymentHistoryQueryKey, getCheckPixStatusQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  paid: { label: "Pago", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  expired: { label: "Expirado", color: "bg-white/5 text-muted-foreground border-white/10" },
  error: { label: "Erro", color: "bg-red-500/10 text-red-400 border-red-500/20" },
};

const presets = [5, 10, 25, 50, 100];

export default function PaymentsPage() {
  const [amount, setAmount] = useState("");
  const [pendingTxid, setPendingTxid] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{ copyPaste?: string | null; coins: number; amount: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const createPix = useCreatePixCharge();
  const { data: history, isLoading: historyLoading } = useGetPaymentHistory();
  const { data: pixStatus } = useCheckPixStatus(pendingTxid || "", {
    query: {
      enabled: !!pendingTxid,
      refetchInterval: 10000,
      queryKey: getCheckPixStatusQueryKey(pendingTxid || ""),
    },
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleCreatePix = async () => {
    const val = parseFloat(amount);
    if (!val || val < 0.01) {
      toast({ title: "Valor invalido", description: "Minimo de R$ 0,01", variant: "destructive" });
      return;
    }
    try {
      const result = await createPix.mutateAsync({ data: { amount: val } });
      setPendingTxid(result.txid);
      setPixData({ copyPaste: result.copyPaste, coins: result.coins, amount: result.amount });
      queryClient.invalidateQueries({ queryKey: getGetPaymentHistoryQueryKey() });
    } catch {
      toast({ title: "Erro", description: "Nao foi possivel gerar o PIX.", variant: "destructive" });
    }
  };

  const handleCopy = () => {
    if (pixData?.copyPaste) {
      navigator.clipboard.writeText(pixData.copyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      toast({ title: "Copiado!", description: "Codigo PIX copiado para a area de transferencia." });
    }
  };

  if (pixStatus?.status === "paid" && pendingTxid) {
    queryClient.invalidateQueries({ queryKey: getGetPaymentHistoryQueryKey() });
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Comprar Moedas</h1>
        <p className="text-muted-foreground text-sm mt-1">1 BRL = 100 moedas &bull; Pagamento via PIX instantaneo</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="text-white font-semibold">Gerar PIX</h2>
          </div>

          {!pixData ? (
            <div className="space-y-4">
              <div>
                <Label className="text-white/80 text-sm mb-2 block">Valores rapidos</Label>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset.toString())}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                        amount === preset.toString()
                          ? "bg-primary/20 border-primary/40 text-primary"
                          : "bg-background border-white/10 text-muted-foreground hover:border-white/20 hover:text-white"
                      }`}
                    >
                      R$ {preset}
                      <span className="block text-xs opacity-60">{preset * 100} moedas</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-white/80 text-sm mb-1.5 block">Ou digite o valor (R$)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Ex: 10.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    className="bg-background border-white/10 text-white"
                  />
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    = {Math.floor(parseFloat(amount) * 100)} moedas
                  </p>
                )}
              </div>
              <Button
                onClick={handleCreatePix}
                disabled={createPix.isPending || !amount}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                {createPix.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Coins className="mr-2 h-4 w-4" />}
                Gerar PIX
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                <p className="text-primary text-2xl font-bold">{pixData.coins} moedas</p>
                <p className="text-muted-foreground text-sm">R$ {pixData.amount.toFixed(2)}</p>
              </div>

              {pixStatus?.status === "paid" ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-semibold">Pagamento confirmado!</p>
                  <p className="text-muted-foreground text-sm">{pixData.coins} moedas adicionadas ao saldo.</p>
                </div>
              ) : (
                <>
                  <div>
                    <Label className="text-white/80 text-sm mb-2 block">PIX Copia e Cola</Label>
                    <div className="bg-background border border-white/10 rounded-lg p-3 text-xs text-muted-foreground font-mono break-all max-h-20 overflow-y-auto">
                      {pixData.copyPaste}
                    </div>
                  </div>
                  <Button onClick={handleCopy} variant="outline" className="w-full border-white/10 text-white hover:bg-white/5">
                    {copied ? <CheckCircle className="mr-2 h-4 w-4 text-green-400" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copiado!" : "Copiar Codigo PIX"}
                  </Button>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Clock className="h-3 w-3 animate-pulse text-yellow-400" />
                    Aguardando pagamento... verificando automaticamente
                  </div>
                </>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground text-xs w-full"
                onClick={() => { setPixData(null); setPendingTxid(null); setAmount(""); }}
              >
                Gerar novo PIX
              </Button>
            </div>
          )}
        </div>

        <div className="bg-card border border-white/5 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-white font-semibold">Historico</h2>
          </div>
          {historyLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg bg-background" />)}
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {history.map((payment) => {
                const s = statusLabels[payment.status] || statusLabels.pending;
                return (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-white/5">
                    <div>
                      <p className="text-white text-sm font-medium">+{payment.coins} moedas</p>
                      <p className="text-muted-foreground text-xs">
                        R$ {payment.amount.toFixed(2)} &bull; {format(new Date(payment.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Badge className={`border text-xs ${s.color}`}>{s.label}</Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Coins className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Nenhuma recarga realizada</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
