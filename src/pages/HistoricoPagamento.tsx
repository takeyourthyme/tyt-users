import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  Filter,
  Eye,
  ChevronDown,
  Utensils,
  Martini,
  PartyPopper,
  Receipt,
  QrCode,
  CreditCard,
  SearchX,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppMenu } from "@/components/AppMenu";
import Footer from "@/components/Footer";
import visaIcon from "@/assets/visa-icon.png";
import mastercardIcon from "@/assets/mastercard-icon.png";
import { loadSession } from "@/services/authService";
import { listKitchenOrders } from "@/services/kitchenOrderService";
import {
  getPaymentDetails,
  type AsaasPaymentDetails,
} from "@/services/asaasService";

// ─── Tipos internos ────────────────────────────────────────────────────────────

interface Transacao {
  id: number;
  code: string;
  data: string;
  tipo: "credito" | "pix" | "desconhecido";
  servico: "Meal Prep" | "Get Together" | "Special Service";
  statusPedido: string;
  statusPagamento: string | null;
  valor: number | null;
  bandeira: string | null;
  ultimos4: string | null;
  comprovante: string | null;
  fatura: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizeServico = (type: string): Transacao["servico"] => {
  const t = String(type).toUpperCase();
  if (t.includes("MEAL") || t.includes("PREP") || t === "MEAL_PREAP") return "Meal Prep";
  if (t.includes("TOGETHER") || t.includes("GET_TOGETHER") || t.includes("TOGHETER")) return "Get Together";
  if (t.includes("SPECIAL") || t.includes("SERVICE")) return "Special Service";
  return "Meal Prep";
};

const normalizeBillingTipo = (
  billingType: string | null | undefined
): Transacao["tipo"] => {
  const b = String(billingType || "").toUpperCase();
  if (b === "CREDIT_CARD") return "credito";
  if (b === "PIX") return "pix";
  return "desconhecido";
};

const formatCurrency = (value: number | null) => {
  if (value === null) return "–";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "–";
  return date.toLocaleDateString("pt-BR");
};

const getStatusPagamentoLabel = (status: string | null) => {
  if (!status) return null;
  const s = status.toUpperCase();
  switch (s) {
    case "RECEIVED":
    case "RECEIVED_IN_CASH":
    case "DUNNING_RECEIVED":
    case "CONFIRMED":
      return { label: "Pago", color: "text-green-700 bg-green-50 border-green-200" };
    case "PENDING":
    case "AWAITING_RISK_ANALYSIS":
      return { label: "Aguardando", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
    case "REFUNDED":
    case "CHARGEBACK":
    case "CHARGEBACK_DISPUTE":
    case "CHARGEBACK_REQUESTED":
      return { label: "Estornado", color: "text-red-700 bg-red-50 border-red-200" };
    case "OVERDUE":
      return { label: "Vencido", color: "text-orange-700 bg-orange-50 border-orange-200" };
    default:
      return { label: status, color: "text-gray-700 bg-gray-50 border-gray-200" };
  }
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const ServicoIcon: React.FC<{ servico: string }> = ({ servico }) => {
  switch (servico) {
    case "Get Together":
      return <Martini className="h-4 w-4 text-[#BC008F]" />;
    case "Special Service":
      return <PartyPopper className="h-4 w-4 text-[#89CDD2]" />;
    default:
      return <Utensils className="h-4 w-4 text-[#EF3F0D]" />;
  }
};

const BandeiraIcon: React.FC<{ bandeira: string | null; tipo: string }> = ({
  bandeira,
  tipo,
}) => {
  if (tipo === "pix") {
    return <QrCode className="h-4 w-4 text-[#004B2A]" />;
  }
  const b = String(bandeira || "").toLowerCase();
  if (b.includes("visa")) {
    return <img src={visaIcon} alt="Visa" className="h-3.5 w-auto object-contain" />;
  }
  if (b.includes("master")) {
    return <img src={mastercardIcon} alt="Mastercard" className="h-3.5 w-auto object-contain" />;
  }
  return <CreditCard className="h-4 w-4 text-gray-400" />;
};

const RowSkeleton: React.FC = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
    <TableCell><Skeleton className="h-7 w-7 rounded" /></TableCell>
  </TableRow>
);

const CardSkeleton: React.FC = () => (
  <Card>
    <CardContent className="p-4 space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-3 w-40" />
      <Skeleton className="h-3 w-24" />
    </CardContent>
  </Card>
);

// ─── Componente principal ──────────────────────────────────────────────────────

const HistoricoPagamento = () => {
  const navigate = useNavigate();
  const session = useMemo(() => loadSession(), []);
  const token = session?.token ?? null;

  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [busca, setBusca] = useState("");
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  // ─── Carregamento de dados ─────────────────────────────────────────────────

  const carregarDados = useCallback(async () => {
    if (!token) {
      setError("Sessão expirada. Faça login novamente.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await listKitchenOrders({ token });
      const rawOrders: Record<string, unknown>[] = (() => {
        const r = res as any;
        if (Array.isArray(r)) return r;
        if (Array.isArray(r?.data)) return r.data;
        return [];
      })();

      // Enriquecer com detalhes do Asaas em paralelo (limit-concurrency friendly)
      const enriched = await Promise.all(
        rawOrders.map(async (order) => {
          const idPag = String(order.id_pagamento ?? "").trim();
          const billingType = String(order.billing_type ?? "").trim();
          const tipo = normalizeBillingTipo(billingType || (idPag ? "CREDIT_CARD" : null));

          let paymentDetails: AsaasPaymentDetails | null = null;
          if (idPag && token) {
            paymentDetails = await getPaymentDetails(token, idPag);
          }

          const transacao: Transacao = {
            id: Number(order.id),
            code: String(order.code ?? order.id ?? ""),
            data: String(order.event_date ?? order.createdAt ?? ""),
            tipo: paymentDetails?.billingType
              ? normalizeBillingTipo(paymentDetails.billingType)
              : tipo,
            servico: normalizeServico(String(order.type ?? "")),
            statusPedido: String(order.status ?? ""),
            statusPagamento: paymentDetails?.status ?? null,
            valor:
              paymentDetails?.value != null
                ? paymentDetails.value
                : (order.service_value as number | null | undefined) ?? null,
            bandeira:
              paymentDetails?.creditCard?.creditCardBrand ??
              null,
            ultimos4:
              paymentDetails?.creditCard?.creditCardNumber ??
              null,
            comprovante:
              paymentDetails?.transactionReceiptUrl ?? null,
            fatura:
              paymentDetails?.invoiceUrl ?? paymentDetails?.bankSlipUrl ?? null,
          };
          return transacao;
        })
      );

      setTransacoes(enriched);
    } catch (err) {
      console.error("[HistoricoPagamento] Erro ao carregar dados:", err);
      setError("Não foi possível carregar o histórico. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // ─── Filtragem ─────────────────────────────────────────────────────────────

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter((t) => {
      const dataT = new Date(t.data);

      if (dataInicial) {
        const ini = new Date(dataInicial);
        ini.setHours(0, 0, 0, 0);
        if (dataT < ini) return false;
      }
      if (dataFinal) {
        const fim = new Date(dataFinal);
        fim.setHours(23, 59, 59, 999);
        if (dataT > fim) return false;
      }
      if (busca) {
        const b = busca.toLowerCase();
        if (!t.code.toLowerCase().includes(b) && !t.servico.toLowerCase().includes(b)) {
          return false;
        }
      }
      return true;
    });
  }, [transacoes, dataInicial, dataFinal, busca]);

  const temFiltrosAtivos = dataInicial || dataFinal || busca;

  const limparFiltros = () => {
    setDataInicial("");
    setDataFinal("");
    setBusca("");
  };

  // ─── Ações de comprovante ──────────────────────────────────────────────────

  const handleVerComprovante = (t: Transacao) => {
    const url = t.comprovante ?? t.fatura;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col bg-background pt-20">
      <AppMenu />

      <div className="flex-1 container mx-auto px-4 py-6">
        {/* Título */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/inicio")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-h2">Histórico de Pagamento</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Seus pedidos e cobranças realizadas na plataforma
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <Collapsible open={filtrosAbertos} onOpenChange={setFiltrosAbertos}>
              <div className="flex items-center justify-between gap-3">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filtros
                    {temFiltrosAtivos && (
                      <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        !
                      </span>
                    )}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${filtrosAbertos ? "rotate-180" : ""}`}
                    />
                  </Button>
                </CollapsibleTrigger>
                {temFiltrosAtivos && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={limparFiltros}
                    className="text-muted-foreground gap-1"
                  >
                    <X className="h-3.5 w-3.5" />
                    Limpar filtros
                  </Button>
                )}
              </div>
              <CollapsibleContent className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="w-full">
                    <Label htmlFor="busca">Buscar por código ou serviço</Label>
                    <Input
                      id="busca"
                      type="text"
                      placeholder="Ex: TYT-123 ou Meal Prep"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="w-full">
                    <Label htmlFor="dataInicial">Data Inicial</Label>
                    <Input
                      id="dataInicial"
                      type="date"
                      value={dataInicial}
                      onChange={(e) => setDataInicial(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="w-full">
                    <Label htmlFor="dataFinal">Data Final</Label>
                    <Input
                      id="dataFinal"
                      type="date"
                      value={dataFinal}
                      onChange={(e) => setDataFinal(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Erro */}
        {error && (
          <Card className="mb-6 border-destructive/40 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">
              {error}
              <Button
                variant="link"
                className="ml-2 text-destructive p-0 h-auto"
                onClick={() => carregarDados()}
              >
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabela Desktop */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Serviço / Código</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <RowSkeleton key={i} />
                  ))
                ) : transacoesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-16 text-center text-muted-foreground"
                    >
                      <SearchX className="h-8 w-8 mx-auto mb-3 opacity-30" />
                      {temFiltrosAtivos
                        ? "Nenhuma transação encontrada para os filtros aplicados."
                        : "Nenhuma transação encontrada."}
                    </TableCell>
                  </TableRow>
                ) : (
                  transacoesFiltradas.map((t, index) => {
                    const statusPag = t.statusPagamento
                      ? getStatusPagamentoLabel(t.statusPagamento)
                      : null;
                    const temComprovante = !!(t.comprovante ?? t.fatura);
                    return (
                      <TableRow
                        key={t.id}
                        className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}
                      >
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="text-sm">{formatDate(t.data)}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <BandeiraIcon bandeira={t.bandeira} tipo={t.tipo} />
                              {t.tipo === "pix" ? (
                                <span>Pix</span>
                              ) : t.ultimos4 ? (
                                <span>•••• {t.ultimos4}</span>
                              ) : (
                                <span className="italic opacity-60">–</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ServicoIcon servico={t.servico} />
                            <div>
                              <div className="text-xs text-muted-foreground">
                                {t.servico}
                              </div>
                              <Button
                                variant="link"
                                className="p-0 h-auto text-primary text-sm font-medium"
                                onClick={() => navigate(`/meus-pedidos/${t.code}`)}
                              >
                                {t.code}
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {formatCurrency(t.valor)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {statusPag ? (
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusPag.color}`}
                            >
                              {statusPag.label}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">–</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {temComprovante && (
                            <Button
                              variant="outline"
                              size="sm"
                              title="Ver comprovante"
                              onClick={() => handleVerComprovante(t)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Cards Mobile */}
        <div className="md:hidden space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          ) : transacoesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <SearchX className="h-8 w-8 mb-3 opacity-30" />
              <p className="text-sm">
                {temFiltrosAtivos
                  ? "Nenhuma transação para os filtros aplicados."
                  : "Nenhuma transação encontrada."}
              </p>
            </div>
          ) : (
            transacoesFiltradas.map((t, index) => {
              const statusPag = t.statusPagamento
                ? getStatusPagamentoLabel(t.statusPagamento)
                : null;
              const temComprovante = !!(t.comprovante ?? t.fatura);
              return (
                <Card
                  key={t.id}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <ServicoIcon servico={t.servico} />
                        <div>
                          <div className="text-xs text-muted-foreground">
                            {t.servico}
                          </div>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-primary text-sm font-medium"
                            onClick={() => navigate(`/meus-pedidos/${t.code}`)}
                          >
                            {t.code}
                          </Button>
                        </div>
                      </div>
                      {temComprovante && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerComprovante(t)}
                          title="Ver comprovante"
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="space-y-1">
                        <div className="text-muted-foreground text-xs">
                          {formatDate(t.data)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <BandeiraIcon bandeira={t.bandeira} tipo={t.tipo} />
                          {t.tipo === "pix" ? (
                            <span>Pix</span>
                          ) : t.ultimos4 ? (
                            <span>•••• {t.ultimos4}</span>
                          ) : (
                            <span className="italic opacity-60">–</span>
                          )}
                        </div>
                        {statusPag && (
                          <span
                            className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full border ${statusPag.color}`}
                          >
                            {statusPag.label}
                          </span>
                        )}
                      </div>
                      <div className="text-base font-medium">
                        {formatCurrency(t.valor)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Contador de resultados */}
        {!loading && transacoesFiltradas.length > 0 && (
          <p className="text-xs text-center text-muted-foreground mt-4">
            Exibindo {transacoesFiltradas.length} de {transacoes.length} transação(ões)
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default HistoricoPagamento;