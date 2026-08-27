import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import Header from "@/components/Header";
import { AppHeader } from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { EtapaEscolhaServico } from "@/components/contratacao/EtapaEscolhaServico";
import { EtapaConfiguracao } from "@/components/contratacao/EtapaConfiguracao";
import { EtapaEscolhaPratos } from "@/components/contratacao/EtapaEscolhaPratos";
import { EtapaIdentificacao } from "@/components/contratacao/EtapaIdentificacao";
import { EtapaResumoePagamento } from "@/components/contratacao/EtapaResumoePagamento";
import { TelaSuccesso } from "@/components/contratacao/TelaSuccesso";
import { useToast } from "@/hooks/use-toast";
import { loadSession } from "@/services/authService";
import { createKitchenOrder, CreditCardHolderInfoInput } from "@/services/kitchenOrderService";
import { PixPaymentModal } from "@/components/contratacao/PixPaymentModal";
import IllustrationOrder from "@/assets/illustration-order";

export interface DadosContratacao {
  // Etapa 1
  cidade: string;
  tipoServico: 'cozinha-semanal' | 'eventos' | 'servicos-especiais' | '';

  // Etapa 2 - Meal Prep
  tamanhoPortacao?: 'pequena' | 'media' | 'grande';
  categorias?: string[];
  preferencias?: string[];
  ingredientes?: string[];
  tiposCozinha?: string[];
  diasEntrega?: Array<{ dia: string; periodo: string }>;

  // Etapa 2 - Get Together
  quantidadePessoas?: number;
  dataEvento?: Date;
  horarioInicio?: string;
  horarioFim?: string;
  temaSelecionado?: string;

  // Etapa 2 - Special Service
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
  aceitouDisponibilidadeChef?: boolean;
  // Payment fields (from EtapaResumoePagamento)
  creditCardToken?: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email?: string;
    cpfCnpj?: string;
    postalCode: string;
    addressNumber: string;
    phone?: string;
    addressComplement?: string;
    mobilePhone?: string;
  };
  billingType?: 'CREDIT_CARD' | 'PIX';
  installmentCount?: number;
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
  const [mostrarPixModal, setMostrarPixModal] = useState(false);
  const [pixPaymentId, setPixPaymentId] = useState<string>("");
  const [pixTotalValue, setPixTotalValue] = useState<number>(0);
  const [isPendingPayment, setIsPendingPayment] = useState<boolean>(false);

  // Verifica sessão real no localStorage e inicializa dados se necessário
  useEffect(() => {
    const session = loadSession();
    const loggedIn = !!(session?.token && session?.user);
    setIsLoggedIn(loggedIn);

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
    return isLoggedIn ? 4 : 5;
  };

  const getEtapaAtualAjustada = () => {
    if (isLoggedIn && etapaAtual > 3) {
      return etapaAtual - 1;
    }
    return etapaAtual;
  };

  /**
   * Helper to strip fields that belong exclusively to the OTHER service type,
   * so switching between Meal Prep and Get Together won't carry stale data.
   */
  const limparDadosTipoAnterior = (
    tipoAtual: DadosContratacao['tipoServico'],
    tipoAnterior: DadosContratacao['tipoServico']
  ): Partial<DadosContratacao> => {
    if (tipoAtual === tipoAnterior) return {};

    const mealPrepFields: Partial<DadosContratacao> = {
      tamanhoPortacao: undefined,
      categorias: undefined,
      preferencias: undefined,
      ingredientes: undefined,
      tiposCozinha: undefined,
      diasEntrega: undefined,
    };
    const getTogetherFields: Partial<DadosContratacao> = {
      quantidadePessoas: undefined,
      dataEvento: undefined,
      horarioInicio: undefined,
      horarioFim: undefined,
      temaSelecionado: undefined,
    };
    const sharedClearFields: Partial<DadosContratacao> = {
      pratosSelecionados: undefined,
      nivelServico: undefined,
      descricaoDetalhada: undefined,
    };

    if (tipoAnterior === 'cozinha-semanal') {
      return { ...mealPrepFields, ...sharedClearFields };
    }
    if (tipoAnterior === 'eventos') {
      return { ...getTogetherFields, ...sharedClearFields };
    }
    if (tipoAnterior === 'servicos-especiais') {
      return { ...sharedClearFields };
    }
    return {};
  };

  const avancarEtapa = (novosdados?: Partial<DadosContratacao>) => {
    if (novosdados) {
      setDadosContratacao(prev => {
        // If service type changed, clear incompatible fields from the previous type
        const tipoAnterior = prev.tipoServico;
        const tipoNovo = (novosdados.tipoServico ?? prev.tipoServico) as DadosContratacao['tipoServico'];
        const camposLimpos = limparDadosTipoAnterior(tipoNovo, tipoAnterior);
        return { ...prev, ...camposLimpos, ...novosdados };
      });
    }

    if (etapaAtual === 4) {
      // Etapa 4 é sempre identificação — ao avancar vem sempre o checkout
      setEtapaAtual(5);
    } else if (isLoggedIn && etapaAtual === 3) {
      // Usuário já logado pula a identificação
      setEtapaAtual(5);
    } else {
      setEtapaAtual(prev => prev + 1);
    }
  };


  const voltarEtapa = (dadosRascunho?: Partial<DadosContratacao>) => {
    if (dadosRascunho) {
      setDadosContratacao(prev => ({ ...prev, ...dadosRascunho }));
    }
    if (isLoggedIn && etapaAtual === 5) {
      setEtapaAtual(3);
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
    if (normalized.includes("manha") || normalized.includes("manhã")) return "10:00";
    if (normalized.includes("tarde")) return "14:00";
    return "19:00";
  };

  const mapServiceType = (tipoServico: DadosContratacao["tipoServico"]) => {
    if (tipoServico === "eventos") return "GET_TOGETHER";
    if (tipoServico === "servicos-especiais") return "SPECIAL_SERVICE";
    return "MEAL_PREP";
  };

  const getPeopleQuantity = (dados: DadosContratacao) => {
    if (typeof dados.quantidadePessoas === "number" && dados.quantidadePessoas > 0) return dados.quantidadePessoas;
    if (dados.tamanhoPortacao === "media") return 4;
    if (dados.tamanhoPortacao === "grande") return 6;
    return 2;
  };

  const extractDishesPayload = (pratosSelecionados: unknown): Array<{ dish_id: number; quantity: number; observations?: string }> => {
    if (!Array.isArray(pratosSelecionados)) return [];
    const byId = new Map<number, { quantity: number; observations: string }>();

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
      const qtyCandidate = record.quantity ?? record.qtd ?? 1;
      const selectionQty = typeof qtyCandidate === "number" ? qtyCandidate : Number(qtyCandidate);
      let quantity = Number.isFinite(selectionQty) && selectionQty > 0 ? selectionQty : 1;

      if (dadosContratacao.tipoServico === "cozinha-semanal") {
        const multiplier = dadosContratacao.tamanhoPortacao === "grande" ? 6 : dadosContratacao.tamanhoPortacao === "media" ? 4 : 2;
        quantity = quantity * multiplier;
      } else if (dadosContratacao.tipoServico === "eventos") {
        const multiplier = Number(dadosContratacao.quantidadePessoas || 1);
        quantity = quantity * multiplier;
      }

      const obsCandidate = record.personalizacao ?? record.observations ?? record.observacao ?? "";
      const obs = typeof obsCandidate === "string" ? obsCandidate.trim().substring(0, 140) : "";

      const existing = byId.get(id);
      if (existing) {
        existing.quantity += quantity;
        if (obs && !existing.observations) {
          existing.observations = obs;
        }
      } else {
        byId.set(id, { quantity, observations: obs });
      }
    });

    return Array.from(byId.entries()).map(([dish_id, { quantity, observations }]) => ({
      dish_id,
      quantity,
      ...(observations ? { observations } : {}),
    }));
  };

  const concluirContratacao = async (dadosParam?: DadosContratacao) => {
    const dados = dadosParam ?? dadosContratacao;
    const session = loadSession();
    const token = session?.token;

    if (!token) {
      // Não deveria chegar aqui — a Etapa 4 exige autenticação antes do checkout
      toast({
        title: "Faça login para continuar",
        description: "Você precisa estar logado para contratar um serviço.",
        variant: "destructive",
      });
      setEtapaAtual(4);
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
      const session = loadSession();
      // Enrich creditCardHolderInfo with user profile data
      let enrichedCardHolderInfo: CreditCardHolderInfoInput | undefined = undefined;
      if (dados.creditCardHolderInfo) {
        const u = (session?.user || {}) as Record<string, unknown>;
        enrichedCardHolderInfo = {
          name: dados.creditCardHolderInfo.name || String(u.nome ?? ''),
          email: dados.creditCardHolderInfo.email || String(u.email ?? ''),
          cpfCnpj: dados.creditCardHolderInfo.cpfCnpj || String(u.cpf ?? '').replace(/\D/g, ''),
          postalCode: dados.creditCardHolderInfo.postalCode,
          addressNumber: dados.creditCardHolderInfo.addressNumber,
          phone: dados.creditCardHolderInfo.phone || String(u.whatsapp ?? '').replace(/\D/g, ''),
          addressComplement: dados.creditCardHolderInfo.addressComplement,
          mobilePhone: dados.creditCardHolderInfo.mobilePhone,
        };
      }

      const response = await createKitchenOrder({
        token,
        type: mapServiceType(dados.tipoServico),
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
        temas: dados.temaSelecionado ? [parseInt(dados.temaSelecionado, 10)] : undefined,
        dishes,
        billingType: dados.billingType || 'CREDIT_CARD',
        installmentCount: dados.installmentCount,
        ...(dados.creditCardToken ? {
          creditCardToken: dados.creditCardToken,
          creditCardHolderInfo: enrichedCardHolderInfo,
        } : (dados.creditCard && {
          creditCard: dados.creditCard,
          creditCardHolderInfo: enrichedCardHolderInfo,
        })),
      });

      const extracted = (() => {
        if (!response) return undefined;
        if (typeof response === "object") {
          const record = response as Record<string, unknown>;
          if (record.order && typeof record.order === "object" && !Array.isArray(record.order)) {
            return record.order as Record<string, unknown>;
          }
          if (record.data && typeof record.data === "object") {
            if (Array.isArray(record.data)) {
              if (record.data.length > 0 && record.data[0] && typeof record.data[0] === "object") {
                return record.data[0] as Record<string, unknown>;
              }
            } else {
              return record.data as Record<string, unknown>;
            }
          }
          return record;
        }
        return undefined;
      })();

      const codeCandidate = extracted?.code ?? extracted?.codigo ?? extracted?.order_code ?? extracted?.orderCode;
      const idCandidate = extracted?.id ?? extracted?.kitchen_order_id ?? extracted?.kitchenOrderId;
      const paymentIdCandidate = extracted?.id_pagamento ?? extracted?.asaas_payment_id ?? extracted?.asaasPaymentId ?? extracted?.paymentId;
      const serviceValueCandidate = extracted?.total_value ?? extracted?.totalValue ?? extracted?.service_value ?? extracted?.serviceValue ?? extracted?.total;

      const code =
        typeof codeCandidate === "string" || typeof codeCandidate === "number"
          ? String(codeCandidate)
          : typeof idCandidate === "string" || typeof idCandidate === "number"
            ? String(idCandidate)
            : "";

      const paymentId = (typeof paymentIdCandidate === "string" || typeof paymentIdCandidate === "number") ? String(paymentIdCandidate) : "";
      const totalVal = typeof serviceValueCandidate === "number" ? serviceValueCandidate : (Number(serviceValueCandidate) || 0);

      setCodigoReferencia(code);

      if (dados.billingType === 'PIX' && paymentId) {
        setIsPendingPayment(true);
        setPixPaymentId(paymentId);
        setPixTotalValue(totalVal);
        setMostrarPixModal(true);
      } else {
        setIsPendingPayment(false);
        setMostrarSucesso(true);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { error?: string } } };
      const status = axiosErr?.response?.status;
      const serverMsg = axiosErr?.response?.data?.error;

      if (status === 422 && serverMsg) {
        // Defensive check: ensure no internal business/split rules or raw gateway terms are shown to the user
        const lower = String(serverMsg).toLowerCase();
        const hasInternalTerms = [
          'split', 'wallet', 'subconta', 'subaccount', 'escrow', 'valor a receber', 'desconto', 'fundo'
        ].some(term => lower.includes(term));

        const safeMsg = hasInternalTerms
          ? "Não foi possível processar o pagamento. Verifique os dados do cartão ou tente outra forma de pagamento."
          : serverMsg;

        toast({
          title: "Pagamento não autorizado",
          description: safeMsg,
          variant: "destructive",
        });
        throw new Error(safeMsg);
      }

      toast({
        title: "Erro ao contratar serviço",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const getStepHeaderLabel = () => {
    const step = getEtapaAtualAjustada();
    const isSpecial = dadosContratacao.tipoServico === 'servicos-especiais';

    if (step === 1) return "Escolha do Serviço";
    if (step === 2) return "Configuração";
    if (step === 3) return isSpecial ? "Detalhamento" : "Escolha de Pratos";
    if (step === 4) {
      if (isLoggedIn) {
        return isSpecial ? "Endereço e Resumo" : "Resumo e Pagamento";
      }
      return "Identificação";
    }
    return isSpecial ? "Endereço e Resumo" : "Resumo e Pagamento";
  };

  if (mostrarSucesso) {
    return (
      <TelaSuccesso
        onIrDashboard={() => navigate('/inicio')}
        tipoServico={dadosContratacao.tipoServico}
        codigoReferencia={codigoReferencia}
        isPendingPayment={isPendingPayment}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pt-16">
      {isLoggedIn ? <AppHeader /> : <Header />}

      {/* Progress Bar */}
      <div className="bg-[#F4F5F4] border-b border-gray-200/80 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Etapa {getEtapaAtualAjustada()} de {getTotalEtapas()}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {getStepHeaderLabel()}
            </span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#004B2A] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(getEtapaAtualAjustada() / getTotalEtapas()) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Conteúdo das Etapas */}
      <div className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <IllustrationOrder className="mx-auto mb-6" />
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
            onVoltar={(rascunho) => voltarEtapa(rascunho)}
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
            onConcluir={async (novosDados) => {
              const merged = { ...dadosContratacao, ...novosDados };
              setDadosContratacao(merged);
              await concluirContratacao(merged);
            }}
          />
        )}
      </div>
      <Footer />

      {/* Pix Payment Modal */}
      {mostrarPixModal && (
        <PixPaymentModal
          open={mostrarPixModal}
          paymentId={pixPaymentId}
          orderCode={codigoReferencia}
          totalValue={pixTotalValue}
          onClose={() => {
            setMostrarPixModal(false);
            setMostrarSucesso(true);
          }}
          onPaymentConfirmed={() => {
            setIsPendingPayment(false);
            setMostrarPixModal(false);
            setMostrarSucesso(true);
          }}
        />
      )}
    </div>
  );
};

export default Contratacao;
