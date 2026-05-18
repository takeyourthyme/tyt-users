import React from "react";
import { DadosContratacao } from "@/pages/Contratacao";
import { ConfiguracaoCozinhaSemanal } from "./configuracao/ConfiguracaoCozinhaSemanal";
import { ConfiguracaoEventos } from "./configuracao/ConfiguracaoEventos";
import { ConfiguracaoServicosEspeciais } from "./configuracao/ConfiguracaoServicosEspeciais";

interface Props {
  dados: DadosContratacao;
  onAvancar: (dados: Partial<DadosContratacao>) => void;
  onVoltar: () => void;
}

export const EtapaConfiguracao: React.FC<Props> = ({ dados, onAvancar, onVoltar }) => {
  if (dados.tipoServico === 'cozinha-semanal') {
    return (
      <ConfiguracaoCozinhaSemanal 
        dados={dados} 
        onAvancar={onAvancar} 
        onVoltar={onVoltar} 
      />
    );
  }

  if (dados.tipoServico === 'eventos') {
    return (
      <ConfiguracaoEventos 
        dados={dados} 
        onAvancar={onAvancar} 
        onVoltar={onVoltar} 
      />
    );
  }

  if (dados.tipoServico === 'servicos-especiais') {
    return (
      <ConfiguracaoServicosEspeciais 
        dados={dados} 
        onAvancar={onAvancar} 
        onVoltar={onVoltar} 
      />
    );
  }

  return null;
};