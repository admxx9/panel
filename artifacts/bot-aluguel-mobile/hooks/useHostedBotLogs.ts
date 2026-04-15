import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "";
}

export function useHostedBotLogs(botId: string, enabled: boolean) {
  const { token } = useAuth();

  return useQuery({
    queryKey: [`/api/hosted-bots/${botId}/logs`],
    queryFn: async () => {
      const resp = await fetch(`${getApiBase()}/api/hosted-bots/${botId}/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("Falha ao carregar logs");
      return resp.json() as Promise<{ logs: string[] }>;
    },
    enabled: enabled && !!token,
    refetchInterval: 3000,
    staleTime: 0,
    gcTime: 0,
  });
}
