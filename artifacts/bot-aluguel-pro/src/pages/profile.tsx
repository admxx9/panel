import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetMe, useUpdateProfile, useDeleteAccount } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { Loader2, Save, User, Phone, Shield, Coins, Calendar, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ProfilePage() {
  const { data: me, isLoading } = useGetMe();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();
  const { toast } = useToast();
  const { logout } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (me) {
      setName(me.name ?? "");
      setPhone(me.phone ?? "");
    }
  }, [me]);

  const handleSave = () => {
    updateProfile.mutate(
      { data: { name, phone } },
      {
        onSuccess: () => {
          toast({ title: "Perfil atualizado!", description: "Suas informações foram salvas." });
        },
        onError: (err) => {
          toast({ title: "Erro", description: (err as Error).message, variant: "destructive" });
        },
      }
    );
  };

  const handleDeleteAccount = () => {
    if (!confirm("Tem certeza? Essa ação é irreversível e todos os seus dados serão apagados.")) return;
    if (!confirm("Última chance! Deseja realmente excluir sua conta permanentemente?")) return;
    deleteAccount.mutate(
      {},
      {
        onSuccess: () => {
          toast({ title: "Conta excluída" });
          logout();
        },
        onError: (err) => {
          toast({ title: "Erro", description: (err as Error).message, variant: "destructive" });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-[#7C3AED] animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 pb-4 border-b border-[#1a1b28]">
        <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Conta</p>
        <h1 className="text-[20px] font-bold text-white mt-0.5">Meu Perfil</h1>
      </div>

      <div className="max-w-xl space-y-4">
        <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center text-[20px] font-bold text-[#7C3AED]">
            {me?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div>
            <p className="text-[16px] font-bold text-white">{me?.name}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-[11px] text-[#4b4c6b]">
                <Coins className="h-3 w-3" /> {me?.coins ?? 0} moedas
              </span>
              <span className="flex items-center gap-1 text-[11px] text-[#4b4c6b]">
                <Shield className="h-3 w-3" /> {me?.isAdmin ? "Admin" : "Usuário"}
              </span>
              {me?.createdAt && (
                <span className="flex items-center gap-1 text-[11px] text-[#4b4c6b]">
                  <Calendar className="h-3 w-3" /> Desde {format(new Date(me.createdAt), "MMM yyyy", { locale: ptBR })}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-5 space-y-4">
          <p className="text-[13px] font-semibold text-[#c9cadb] pb-3 border-b border-[#1a1b28]">Informações Pessoais</p>

          <div>
            <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1.5">Nome</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4b4c6b]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#131420] border border-[#1e1f2e] rounded-md pl-9 pr-3 py-2.5 text-[14px] text-white placeholder-[#4b4c6b] outline-none focus:border-[#7C3AED] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1.5">Telefone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4b4c6b]" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={15}
                className="w-full bg-[#131420] border border-[#1e1f2e] rounded-md pl-9 pr-3 py-2.5 text-[14px] text-white placeholder-[#4b4c6b] outline-none focus:border-[#7C3AED] transition-colors"
              />
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-60 text-white text-[13px] font-bold px-5 py-2.5 rounded-md transition-colors flex items-center gap-2"
            >
              {updateProfile.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Salvar Alterações
            </button>
          </div>
        </div>

        <div className="bg-[#0d0e16] border border-red-500/20 rounded-lg p-5">
          <p className="text-[13px] font-semibold text-red-400 mb-2">Zona de Perigo</p>
          <p className="text-[12px] text-[#4b4c6b] mb-4">
            Ao excluir sua conta, todos os seus bots, configurações e dados serão permanentemente removidos.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteAccount.isPending}
            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[12px] font-bold px-4 py-2 rounded-md border border-red-500/20 transition-colors flex items-center gap-2"
          >
            {deleteAccount.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Excluir Minha Conta
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
