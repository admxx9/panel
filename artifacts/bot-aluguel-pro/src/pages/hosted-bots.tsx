import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListHostedBots, useCreateHostedBot, useDeleteHostedBot, useStartHostedBot, useStopHostedBot, useRestartHostedBot } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Upload, Play, Square, RotateCcw, Trash2, Loader2, Server, Plus, Github, FileCode } from "lucide-react";

export default function HostedBotsPage() {
  const { data: hostedBots, isLoading } = useListHostedBots();
  const createBot = useCreateHostedBot();
  const deleteBot = useDeleteHostedBot();
  const startBot = useStartHostedBot();
  const stopBot = useStopHostedBot();
  const restartBot = useRestartHostedBot();
  const { toast } = useToast();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [sourceType, setSourceType] = useState<"github" | "upload">("github");
  const [githubUrl, setGithubUrl] = useState("");
  const [mainFile, setMainFile] = useState("index.js");

  const handleCreate = () => {
    if (!name.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    createBot.mutate(
      { data: { name, sourceType, githubUrl: sourceType === "github" ? githubUrl : undefined, mainFile } },
      {
        onSuccess: () => {
          toast({ title: "Bot criado!", description: "Seu bot hospedado foi criado com sucesso." });
          setShowCreate(false);
          setName("");
          setGithubUrl("");
          setMainFile("index.js");
        },
        onError: (err) => {
          toast({ title: "Erro", description: (err as Error).message, variant: "destructive" });
        },
      }
    );
  };

  const handleDelete = (id: string, botName: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${botName}"?`)) return;
    deleteBot.mutate(
      { hostedBotId: id },
      {
        onSuccess: () => toast({ title: "Bot excluído" }),
        onError: (err) => toast({ title: "Erro", description: (err as Error).message, variant: "destructive" }),
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-6 pb-4 border-b border-[#1a1b28]">
        <p className="text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase">Hospedagem</p>
        <div className="flex items-center justify-between mt-0.5">
          <h1 className="text-[20px] font-bold text-white">Bots Hospedados</h1>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[12px] font-bold px-4 py-2 rounded-md transition-colors flex items-center gap-2"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo Bot
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-5 mb-6 space-y-4">
          <p className="text-[13px] font-semibold text-[#c9cadb]">Criar Bot Hospedado</p>

          <div>
            <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1.5">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meu Bot"
              className="w-full bg-[#131420] border border-[#1e1f2e] rounded-md px-3 py-2.5 text-[14px] text-white placeholder-[#4b4c6b] outline-none focus:border-[#7C3AED] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1.5">Fonte</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSourceType("github")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-[12px] font-semibold border transition-colors ${
                  sourceType === "github"
                    ? "border-[#7C3AED] bg-[#7C3AED]/10 text-[#c4b5fd]"
                    : "border-[#1e1f2e] text-[#4b4c6b] hover:border-[#2a2b3e]"
                }`}
              >
                <Github className="h-3.5 w-3.5" /> GitHub
              </button>
              <button
                onClick={() => setSourceType("upload")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-[12px] font-semibold border transition-colors ${
                  sourceType === "upload"
                    ? "border-[#7C3AED] bg-[#7C3AED]/10 text-[#c4b5fd]"
                    : "border-[#1e1f2e] text-[#4b4c6b] hover:border-[#2a2b3e]"
                }`}
              >
                <Upload className="h-3.5 w-3.5" /> Upload
              </button>
            </div>
          </div>

          {sourceType === "github" && (
            <div>
              <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1.5">URL do Repositório</label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/user/repo"
                className="w-full bg-[#131420] border border-[#1e1f2e] rounded-md px-3 py-2.5 text-[14px] text-white placeholder-[#4b4c6b] outline-none focus:border-[#7C3AED] transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-semibold text-[#4b4c6b] tracking-[1px] uppercase mb-1.5">Arquivo Principal</label>
            <div className="relative">
              <FileCode className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#4b4c6b]" />
              <input
                type="text"
                value={mainFile}
                onChange={(e) => setMainFile(e.target.value)}
                placeholder="index.js"
                className="w-full bg-[#131420] border border-[#1e1f2e] rounded-md pl-9 pr-3 py-2.5 text-[14px] text-white placeholder-[#4b4c6b] outline-none focus:border-[#7C3AED] transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCreate}
              disabled={createBot.isPending}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-60 text-white text-[13px] font-bold px-5 py-2.5 rounded-md transition-colors flex items-center gap-2"
            >
              {createBot.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Criar
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="text-[#4b4c6b] hover:text-white text-[13px] font-bold px-5 py-2.5 rounded-md border border-[#1e1f2e] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#0d0e16] border border-[#1a1b28] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : hostedBots && hostedBots.length > 0 ? (
        <div className="space-y-2">
          {hostedBots.map((bot) => (
            <div key={bot.id} className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#131420] border border-[#1e1f2e] flex items-center justify-center">
                  <Server className="h-4 w-4 text-[#7C3AED]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white">{bot.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-[#4b4c6b]">{bot.mainFile}</span>
                    <div className="flex items-center gap-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${bot.isRunning ? "bg-green-500" : "bg-[#2a2b3e]"}`} />
                      <span className="text-[10px] text-[#4b4c6b]">{bot.isRunning ? "Rodando" : "Parado"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {!bot.isRunning ? (
                  <button
                    onClick={() => startBot.mutate({ hostedBotId: bot.id! }, {
                      onSuccess: () => toast({ title: "Bot iniciado!" }),
                      onError: (err) => toast({ title: "Erro", description: (err as Error).message, variant: "destructive" }),
                    })}
                    className="h-8 w-8 rounded-md bg-green-500/10 text-green-500 hover:bg-green-500/20 flex items-center justify-center transition-colors"
                    title="Iniciar"
                  >
                    <Play className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => stopBot.mutate({ hostedBotId: bot.id! }, {
                        onSuccess: () => toast({ title: "Bot parado" }),
                        onError: (err) => toast({ title: "Erro", description: (err as Error).message, variant: "destructive" }),
                      })}
                      className="h-8 w-8 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                      title="Parar"
                    >
                      <Square className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => restartBot.mutate({ hostedBotId: bot.id! }, {
                        onSuccess: () => toast({ title: "Bot reiniciado!" }),
                        onError: (err) => toast({ title: "Erro", description: (err as Error).message, variant: "destructive" }),
                      })}
                      className="h-8 w-8 rounded-md bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/20 flex items-center justify-center transition-colors"
                      title="Reiniciar"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(bot.id!, bot.name ?? "Bot")}
                  className="h-8 w-8 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#0d0e16] border border-[#1a1b28] rounded-lg flex flex-col items-center justify-center py-16 gap-3">
          <Server className="h-8 w-8 text-[#2a2b3e]" />
          <p className="text-[14px] font-semibold text-[#4b4c6b]">Nenhum bot hospedado</p>
          <p className="text-[12px] text-[#2a2b3e] max-w-sm text-center">
            Hospede seu bot Node.js diretamente na plataforma. Importe do GitHub ou faça upload do código.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[12px] font-bold px-5 py-2 rounded-md transition-colors flex items-center gap-2"
          >
            <Plus className="h-3.5 w-3.5" />
            Criar Primeiro Bot
          </button>
        </div>
      )}
    </DashboardLayout>
  );
}
