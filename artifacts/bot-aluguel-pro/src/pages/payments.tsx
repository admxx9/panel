import { useState } from "react";
import { Coins, Copy, CheckCircle, Clock, Loader2, Zap } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCreatePixCharge, useGetPaymentHistory, useCheckPixStatus, getGetPaymentHistoryQueryKey, getCheckPixStatusQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "#F59E0B" },
  paid:    { label: "Pago",     color: "#22C55E" },
  expired: { label: "Expirado", color: "#4b4c6b" },
  error:   { label: "Erro",     color: "#EF4444" },
};

const PRESETS = [0.01, 5, 10, 25, 50, 100];

export default function PaymentsPage() {
  const [amount, setAmount] = useState("");
  const [pendingTxid, setPendingTxid] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{ copyPaste?: string | null; qrCodeBase64?: string | null; coins: number; amount: number } | null>(null);
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
      toast({ title: "Valor inválido", description: "Mínimo de R$ 0,01", variant: "destructive" });
      return;
    }
    try {
      const result = await createPix.mutateAsync({ data: { amount: val } });
      setPendingTxid(result.txid);
      setPixData({ copyPaste: result.copyPaste, qrCodeBase64: result.qrCodeBase64, coins: result.coins, amount: result.amount });
      queryClient.invalidateQueries({ queryKey: getGetPaymentHistoryQueryKey() });
    } catch {
      toast({ title: "Erro", description: "Não foi possível gerar o PIX.", variant: "destructive" });
    }
  };

  const handleCopy = () => {
    if (pixData?.copyPaste) {
      navigator.clipboard.writeText(pixData.copyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      toast({ title: "Copiado!", description: "Código PIX copiado." });
    }
  };

  if (pixStatus?.status === "paid" && pendingTxid) {
    queryClient.invalidateQueries({ queryKey: getGetPaymentHistoryQueryKey() });
  }

  const historyList = (history as any[] | undefined) ?? [];

  return (
    <DashboardLayout>
      <div className="mb-6 pb-4 border-b border-[#1a1b28]">
        <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Recarga</p>
        <h1 className="text-[20px] font-bold text-white mt-0.5">Comprar Moedas</h1>
        <p className="text-[12px] text-[#4b4c6b] mt-1">R$ 1,00 = 100 moedas &bull; Pagamento via PIX instantâneo</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-5">
          <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-4">Gerar PIX</p>

          {!pixData ? (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[0.5px] uppercase mb-2">Valores rápidos</p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset.toString())}
                      className={`px-3 py-2 rounded-md text-[12px] border transition-colors ${
                        amount === preset.toString()
                          ? "bg-[#7C3AED]/15 border-[#7C3AED]/40 text-[#7C3AED]"
                          : "bg-[#131420] border-[#1e1f2e] text-[#4b4c6b] hover:text-[#8b8ea0]"
                      }`}
                    >
                      <span className="font-semibold">R$ {preset}</span>
                      <span className="block text-[10px] opacity-70">{preset * 100} moedas</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[0.5px] uppercase mb-2">Valor personalizado</p>
                <div className="flex items-center bg-[#131420] border border-[#1e1f2e] rounded-md px-3 focus-within:border-[#7C3AED] transition-colors">
                  <span className="text-[#4b4c6b] text-[14px] font-bold mr-2">R$</span>
                  <input
                    type="number"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    className="flex-1 bg-transparent text-[16px] font-bold text-white py-3 outline-none placeholder-[#4b4c6b]"
                  />
                </div>
                {amount && parseFloat(amount) > 0 && (
                  <p className="text-[11px] text-[#4b4c6b] mt-1 flex items-center gap-1">
                    <Coins className="h-3 w-3 text-[#7C3AED]" />
                    {Math.floor(parseFloat(amount) * 100)} moedas
                  </p>
                )}
              </div>

              <button
                onClick={handleCreatePix}
                disabled={createPix.isPending || !amount}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-60 text-white py-2.5 rounded-md text-[13px] font-bold transition-colors flex items-center justify-center gap-2"
              >
                {createPix.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                Gerar PIX
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#131420] border border-[#1a1b28] border-l-[3px] border-l-[#7C3AED] rounded-md p-4 text-center">
                <p className="text-[28px] font-extrabold text-[#7C3AED]">{pixData.coins}</p>
                <p className="text-[12px] text-[#4b4c6b]">moedas por R$ {pixData.amount.toFixed(2)}</p>
              </div>

              {pixStatus?.status === "paid" ? (
                <div className="bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-md p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-[#22C55E] mx-auto mb-2" />
                  <p className="text-[#22C55E] font-semibold text-[14px]">Pagamento confirmado!</p>
                  <p className="text-[12px] text-[#4b4c6b]">{pixData.coins} moedas adicionadas ao saldo.</p>
                </div>
              ) : (
                <>
                  {pixData.qrCodeBase64 && (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-[10px] font-semibold text-[#4b4c6b] uppercase tracking-wide self-start">QR Code PIX</p>
                      <div className="bg-white rounded-lg p-3 inline-block">
                        <img
                          src={pixData.qrCodeBase64}
                          alt="QR Code PIX"
                          className="w-48 h-48 block"
                        />
                      </div>
                      <p className="text-[11px] text-[#4b4c6b]">Escaneie com o app do banco</p>
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] font-semibold text-[#4b4c6b] uppercase tracking-wide mb-2">PIX Copia e Cola</p>
                    <div className="bg-[#090A0F] border border-[#1a1b28] rounded-md p-3 text-[11px] text-[#4b4c6b] font-mono break-all max-h-20 overflow-y-auto">
                      {pixData.copyPaste}
                    </div>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`w-full py-2.5 rounded-md text-[13px] font-bold border flex items-center justify-center gap-2 transition-colors ${
                      copied
                        ? "border-[#22C55E]/40 text-[#22C55E] bg-[#22C55E]/10"
                        : "border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED]/10"
                    }`}
                  >
                    {copied ? <CheckCircle className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copiado!" : "Copiar Código PIX"}
                  </button>
                  <p className="flex items-center justify-center gap-2 text-[11px] text-[#4b4c6b]">
                    <Clock className="h-3 w-3 text-[#F59E0B] animate-pulse" />
                    Aguardando pagamento...
                  </p>
                </>
              )}

              <button
                onClick={() => { setPixData(null); setPendingTxid(null); setAmount(""); }}
                className="w-full text-[12px] text-[#4b4c6b] hover:text-[#8b8ea0] transition-colors py-1"
              >
                Gerar novo PIX
              </button>
            </div>
          )}
        </div>

        <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-5">
          <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-4">Histórico</p>
          {historyLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-[#131420] rounded-md animate-pulse" />
              ))}
            </div>
          ) : historyList.length > 0 ? (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {historyList.map((payment: any) => {
                const cfg = STATUS_CFG[payment.status] ?? STATUS_CFG.pending;
                return (
                  <div key={payment.id} className="flex items-center justify-between px-4 py-3 bg-[#131420] border border-[#1a1b28] rounded-md hover:border-[#2a2b3e] transition-colors">
                    <div>
                      <p className="text-[13px] font-semibold text-[#c9cadb]">+{payment.coins} moedas</p>
                      <p className="text-[11px] text-[#4b4c6b]">
                        R$ {payment.amount.toFixed(2)} &bull; {format(new Date(payment.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div
                      className="px-2 py-1 rounded text-[11px] font-semibold border"
                      style={{ color: cfg.color, backgroundColor: cfg.color + "15", borderColor: cfg.color + "30" }}
                    >
                      {cfg.label}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Coins className="h-6 w-6 text-[#2a2b3e]" />
              <p className="text-[12px] text-[#4b4c6b]">Nenhuma recarga realizada</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
