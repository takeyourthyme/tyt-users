import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { AppHeader } from "@/components/AppHeader";
import { EtapaEscolhaServico } from "@/components/contratacao/EtapaEscolhaServico";
import { EtapaConfiguracao } from "@/components/contratacao/EtapaConfiguracao";
import { EtapaEscolhaPratos } from "@/components/contratacao/EtapaEscolhaPratos";
import { EtapaIdentificacao } from "@/components/contratacao/EtapaIdentificacao";
import { EtapaResumoePagamento } from "@/components/contratacao/EtapaResumoePagamento";
import { TelaSuccesso } from "@/components/contratacao/TelaSuccesso";

export interface DadosContratacao {
  // Etapa 1
  cidade: string;
  tipoServico: 'cozinha-semanal' | 'eventos' | 'servicos-especiais' | '';
  
  // Etapa 2 - Cozinha Semanal
  tamanhoPortacao?: 'pequena' | 'media' | 'grande';
  categorias?: string[];
  preferencias?: string[];
  ingredientes?: string[];
  tiposCozinha?: string[];
  diasEntrega?: Array<{ dia: string; periodo: string }>;
  
  // Etapa 2 - Eventos
  quantidadePessoas?: number;
  dataEvento?: Date;
  horarioInicio?: string;
  horarioFim?: string;
  temaSelecionado?: string;
  
  // Etapa 2 - Serviços Especiais
  orcamentoEstimado?: number;
  orcamentoTipo?: 'servico' | 'pessoa';
  
  // Etapa 3
  pratosSelecionados?: any[];
  nivelServico?: 'classico' | 'banquete';
  descricaoDetalhada?: string;
  
  // Etapa 5
  endereco?: {
    cep: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
  };
  cartaoSelecionado?: string;
  novoCartao?: any;
  aceitouTermos?: boolean;
}

const Contratacao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [dadosContratacao, setDadosContratacao] = useState<DadosContratacao>({
    cidade: '',
    tipoServico: '',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mostrarSucesso, setMostrarSucesso] = useState(false);

  // Verifica se está logado baseado na rota e inicializa dados se necessário
  useEffect(() => {
    const isFromDashboard = location.pathname.includes('dashboard') || 
                           location.pathname.includes('contratacao-logado') ||
                           location.state?.fromDashboard;
    setIsLoggedIn(isFromDashboard);

    // Se veio do dashboard para ir direto à etapa 3
    if (location.state?.goToStep3 && location.state?.prefilledData) {
      setEtapaAtual(3);
      setDadosContratacao(location.state.prefilledData);
    }
  }, [location]);

  // Scroll to top whenever the step changes (handles in-route transitions)
  useEffect(() => {
    const scrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };
    scrollTop();
    requestAnimationFrame(scrollTop);
  }, [etapaAtual]);

  const getTotalEtapas = () => {
    if (dadosContratacao.tipoServico === 'servicos-especiais') {
      return isLoggedIn ? 2 : 3; // Pula etapa 2 (configuração) e etapa de pagamento
    }
    return isLoggedIn ? 4 : 5; // Se logado, pula etapa de identificação
  };

  const getEtapaAtualAjustada = () => {
    if (dadosContratacao.tipoServico === 'servicos-especiais') {
      // Para serviços especiais: etapa 1 -> mostra 1, etapa 3 -> mostra 2, etapa 4 -> mostra 3
      if (etapaAtual === 1) return 1;
      if (etapaAtual === 3) return 2;
      if (etapaAtual === 4) return 3;
    }
    if (isLoggedIn && etapaAtual > 3) {
      return etapaAtual - 1; // Ajusta para etapas sem identificação
    }
    return etapaAtual;
  };

  const avancarEtapa = (novosdados?: Partial<DadosContratacao>) => {
    let dadosAtualizados = dadosContratacao;
    if (novosdados) {
      dadosAtualizados = { ...dadosContratacao, ...novosdados };
      setDadosContratacao(dadosAtualizados);
    }

    // Lógica especial para serviços especiais
    if (dadosAtualizados.tipoServico === 'servicos-especiais') {
      // Da etapa 1, pula direto para etapa 3
      if (etapaAtual === 1) {
        setEtapaAtual(3);
        return;
      }
      // Da etapa 3, vai para identificação se não logado, ou sucesso se logado
      if (etapaAtual === 3 && !isLoggedIn) {
        setEtapaAtual(4); // Vai para identificação
        return;
      } else if ((etapaAtual === 3 && isLoggedIn) || etapaAtual === 4) {
        setMostrarSucesso(true); // Vai direto para sucesso
        return;
      }
    }

    // Para outros serviços
    if (isLoggedIn && etapaAtual === 3) {
      setEtapaAtual(5); // Pula identificação
    } else {
      setEtapaAtual(prev => prev + 1);
    }
  };

  const voltarEtapa = () => {
    // Lógica especial para serviços especiais
    if (dadosContratacao.tipoServico === 'servicos-especiais' && etapaAtual === 3) {
      setEtapaAtual(1); // Volta direto para etapa 1
      return;
    }
    
    if (isLoggedIn && etapaAtual === 5) {
      setEtapaAtual(3); // Volta direto da etapa 5 para 3
    } else {
      setEtapaAtual(prev => Math.max(1, prev - 1));
    }
  };

  const concluirContratacao = () => {
    setMostrarSucesso(true);
  };

  if (mostrarSucesso) {
    return (
      <TelaSuccesso 
        onIrDashboard={() => navigate('/dashboard-cliente')} 
        tipoServico={dadosContratacao.tipoServico}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      {isLoggedIn ? <AppHeader /> : <Header />}
      
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Etapa {getEtapaAtualAjustada()} de {getTotalEtapas()}
            </span>
            <span className="text-sm text-gray-500">
              {getEtapaAtualAjustada() === 1 && "Escolha do Serviço"}
              {getEtapaAtualAjustada() === 2 && "Configuração"}
              {getEtapaAtualAjustada() === 3 && (dadosContratacao.tipoServico === 'servicos-especiais' ? "Detalhamento" : "Escolha de Pratos")}
              {getEtapaAtualAjustada() === 4 && (isLoggedIn ? "Resumo e Pagamento" : "Identificação")}
              {getEtapaAtualAjustada() === 5 && "Resumo e Pagamento"}
            </span>
          </div>
          <Progress 
            value={(getEtapaAtualAjustada() / getTotalEtapas()) * 100} 
            className="h-2"
          />
        </div>
      </div>

      {/* Conteúdo das Etapas */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {etapaAtual === 1 && (
          <EtapaEscolhaServico
            dados={dadosContratacao}
            onAvancar={avancarEtapa}
          />
        )}

        {etapaAtual === 2 && (
          <EtapaConfiguracao
            dados={dadosContratacao}
            onAvancar={avancarEtapa}
            onVoltar={voltarEtapa}
          />
        )}

        {etapaAtual === 3 && (
          <EtapaEscolhaPratos
            dados={dadosContratacao}
            onAvancar={avancarEtapa}
            onVoltar={voltarEtapa}
          />
        )}

        {etapaAtual === 4 && !isLoggedIn && (
          <EtapaIdentificacao
            dados={dadosContratacao}
            onAvancar={avancarEtapa}
            onVoltar={voltarEtapa}
            onLogin={() => setIsLoggedIn(true)}
          />
        )}

        {((etapaAtual === 5 && isLoggedIn) || (etapaAtual === 5 && !isLoggedIn)) && (
          <EtapaResumoePagamento
            dados={dadosContratacao}
            onVoltar={voltarEtapa}
            onConcluir={concluirContratacao}
          />
        )}
      </div>
    </div>
  );
};

export default Contratacao;