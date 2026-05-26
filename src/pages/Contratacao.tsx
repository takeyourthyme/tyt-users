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
import { useToast } from "@/hooks/use-toast";
import { loadSession } from "@/services/authService";
import { createKitchenOrder } from "@/services/kitchenOrderService";

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
  pratosSelecionados?: unknown[];
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
  novoCartao?: unknown;
  aceitouTermos?: boolean;
}

const Contratacao = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [dadosContratacao, setDadosContratacao] = useState<DadosContratacao>({
    cidade: '',
    tipoServico: '',
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mostrarSucesso, setMostrarSucesso] = useState(false);
  const [codigoReferencia, setCodigoReferencia] = useState<string>("");

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
        void concluirContratacao(dadosAtualizados);
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

  const getNextDateForWeekday = (weekday: string) => {
    const key = weekday
      .toLowerCase()
      .replace("-feira", "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const map: Record<string, number> = {
      domingo: 0,
      segunda: 1,
      terca: 2,
      quarta: 3,
      quinta: 4,
      sexta: 5,
      sabado: 6,
    };
    const target = map[key];
    if (typeof target !== "number") return new Date();

    const now = new Date();
    const current = now.getDay();
    const delta = (target - current + 7) % 7;
    const result = new Date(now);
    result.setDate(now.getDate() + (delta === 0 ? 7 : delta));
    result.setHours(0, 0, 0, 0);
    return result;
  };

  const getTimeFromPeriod = (period: string) => {
    const normalized = period.toLowerCase();
    if (normalized.includes("manha")) return "09:00";
    if (normalized.includes("tarde")) return "14:00";
    return "19:00";
  };

  const mapServiceType = (tipoServico: DadosContratacao["tipoServico"]) => {
    if (tipoServico === "eventos") return "EVENT";
    if (tipoServico === "servicos-especiais") return "SPECIAL_SERVICE";
    return "MEAL_PREP";
  };

  const getPeopleQuantity = (dados: DadosContratacao) => {
    if (typeof dados.quantidadePessoas === "number" && dados.quantidadePessoas > 0) return dados.quantidadePessoas;
    if (dados.tamanhoPortacao === "media") return 4;
    if (dados.tamanhoPortacao === "grande") return 6;
    return 2;
  };

  const extractDishesPayload = (pratosSelecionados: unknown): Array<{ dish_id: number; quantity: number }> => {
    if (!Array.isArray(pratosSelecionados)) return [];
    const byId = new Map<number, number>();

    pratosSelecionados.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const record = item as Record<string, unknown>;
      const idCandidate = record.dishId ?? record.dish_id ?? record.dishId ?? record.id;
      const id = (() => {
        if (typeof idCandidate === "number") return idCandidate;
        if (typeof idCandidate === "string") {
          const direct = Number(idCandidate);
          if (Number.isFinite(direct)) return direct;
          const matches = idCandidate.match(/\d+/g);
          if (matches && matches.length > 0) {
            const parsed = Number(matches[matches.length - 1]);
            if (Number.isFinite(parsed)) return parsed;
          }
        }
        return NaN;
      })();
      if (!Number.isFinite(id)) return;
      const qtyCandidate = record.quantity ?? record.quantidade ?? record.qtd ?? 1;
      const qty = typeof qtyCandidate === "number" ? qtyCandidate : Number(qtyCandidate);
      const quantity = Number.isFinite(qty) && qty > 0 ? qty : 1;
      byId.set(id, (byId.get(id) ?? 0) + quantity);
    });

    return Array.from(byId.entries()).map(([dish_id, quantity]) => ({ dish_id, quantity }));
  };

  const concluirContratacao = async (dadosParam?: DadosContratacao) => {
    const dados = dadosParam ?? dadosContratacao;
    const session = loadSession();
    const token = session?.token;

    if (!token) {
      toast({
        title: "Faça login para continuar",
        description: "Você precisa estar logado para contratar um serviço.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const endereco = dados.endereco;
    if (!endereco?.rua || !endereco?.numero || !endereco?.bairro) {
      toast({
        title: "Endereço incompleto",
        description: "Preencha seu endereço para finalizar a contratação.",
        variant: "destructive",
      });
      return;
    }

    const dishes = extractDishesPayload(dados.pratosSelecionados);
    if (dishes.length === 0 && dados.tipoServico !== "servicos-especiais") {
      toast({
        title: "Seleção incompleta",
        description: "Selecione ao menos 1 prato para continuar.",
        variant: "destructive",
      });
      return;
    }

    const eventDate = (() => {
      if (dados.dataEvento instanceof Date && !Number.isNaN(dados.dataEvento.getTime())) return dados.dataEvento;
      const firstDelivery = dados.diasEntrega?.[0];
      if (firstDelivery?.dia) return getNextDateForWeekday(firstDelivery.dia);
      const fallback = new Date();
      fallback.setDate(fallback.getDate() + 7);
      fallback.setHours(0, 0, 0, 0);
      return fallback;
    })();

    const eventTime = (() => {
      if (typeof dados.horarioInicio === "string" && dados.horarioInicio.trim()) return dados.horarioInicio.trim();
      const firstDelivery = dados.diasEntrega?.[0];
      if (firstDelivery?.periodo) return getTimeFromPeriod(firstDelivery.periodo);
      return "19:00";
    })();

    try {
      const response = await createKitchenOrder({
        token,
        type: mapServiceType(dados.tipoServico),
        id_pagamento: "",
        event_date: eventDate.toISOString(),
        event_time: eventTime,
        people_quantity: getPeopleQuantity(dados),
        city: endereco.cidade || dados.cidade,
        address: endereco.rua,
        number: endereco.numero,
        complement: endereco.complemento,
        district: endereco.bairro,
        observations: dados.descricaoDetalhada || "",
        client_request: dados.tipoServico === "servicos-especiais" ? dados.descricaoDetalhada || "" : undefined,
        dishes,
      });

      const extracted = (() => {
        if (!response) return undefined;
        if (typeof response === "object") {
          const record = response as Record<string, unknown>;
          const data = record.data;
          if (Array.isArray(data) && data.length > 0 && data[0] && typeof data[0] === "object") return data[0] as Record<string, unknown>;
          if (record.success && record.data && typeof record.data === "object" && !Array.isArray(record.data)) return record.data as Record<string, unknown>;
          return record;
        }
        return undefined;
      })();

      const codeCandidate = extracted?.code ?? extracted?.codigo ?? extracted?.order_code ?? extracted?.orderCode;
      const idCandidate = extracted?.id ?? extracted?.kitchen_order_id ?? extracted?.kitchenOrderId;
      const code =
        typeof codeCandidate === "string" || typeof codeCandidate === "number"
          ? String(codeCandidate)
          : typeof idCandidate === "string" || typeof idCandidate === "number"
            ? String(idCandidate)
            : "";

      setCodigoReferencia(code);
      setMostrarSucesso(true);
    } catch {
      toast({
        title: "Erro ao contratar serviço",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    }
  };

  if (mostrarSucesso) {
    return (
      <TelaSuccesso
        onIrDashboard={() => navigate('/dashboard-cliente')}
        tipoServico={dadosContratacao.tipoServico}
        codigoReferencia={codigoReferencia}
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
            onConcluir={(novosDados) => {
              const merged = { ...dadosContratacao, ...novosDados };
              setDadosContratacao(merged);
              void concluirContratacao(merged);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Contratacao;
