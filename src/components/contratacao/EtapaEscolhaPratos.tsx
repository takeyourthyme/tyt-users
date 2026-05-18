import React from "react";
import { DadosContratacao } from "@/pages/Contratacao";
import { EscolhaPratosCozinhaSemanal } from "./escolha-pratos/EscolhaPratosCozinhaSemanal";
import { EscolhaPratosEventos } from "./escolha-pratos/EscolhaPratosEventos";
import { DetalhamentoServicosEspeciais } from "./escolha-pratos/DetalhamentoServicosEspeciais";

interface Props {
  dados: DadosContratacao;
  onAvancar: (dados: Partial<DadosContratacao>) => void;
  onVoltar: () => void;
}

export const EtapaEscolhaPratos: React.FC<Props> = ({ dados, onAvancar, onVoltar }) => {
  if (dados.tipoServico === 'cozinha-semanal') {
    return (
      <EscolhaPratosCozinhaSemanal 
        dados={dados} 
        onAvancar={onAvancar} 
        onVoltar={onVoltar} 
      />
    );
  }

  if (dados.tipoServico === 'eventos') {
    return (
      <EscolhaPratosEventos 
        dados={dados} 
        onAvancar={onAvancar} 
        onVoltar={onVoltar} 
      />
    );
  }

  if (dados.tipoServico === 'servicos-especiais') {
    return (
      <DetalhamentoServicosEspeciais 
        dados={dados} 
        onAvancar={onAvancar} 
        onVoltar={onVoltar} 
      />
    );
  }

  return null;
};