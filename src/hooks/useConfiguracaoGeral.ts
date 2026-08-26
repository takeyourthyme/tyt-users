import { useQuery } from "@tanstack/react-query";
import { getConfiguracaoGeral } from "@/services/configuracaoService";

export function useConfiguracaoGeral() {
  return useQuery({
    queryKey: ["configuracao-geral"],
    queryFn: getConfiguracaoGeral,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
