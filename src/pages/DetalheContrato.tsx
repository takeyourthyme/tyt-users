import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  User,
  CreditCard,
  Receipt,
  ChefHat,
  Utensils,
  AlertTriangle,
  AlertCircle,
  MessageCircle,
  CheckCircle,
  Users,
  Info,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/AppHeader";
import { loadSession } from "@/services/authService";
import {
  cancelKitchenOrder,
  getKitchenOrderDate,
  getKitchenOrderLocation,
  getKitchenOrderTime,
  getKitchenOrderClient,
  getKitchenOrderByCode,
  normalizeKitchenOrderStatusLabel,
  normalizeKitchenOrderTypeLabel,
  updateKitchenOrderStatus,
  type KitchenOrder,
} from "@/services/kitchenOrderService";

const getKitchenOrderCode = (order: KitchenOrder): string => {
  const candidates = [
    order.code,
    order.codigo,
    order.order_code,
    order.orderCode,
    order.id,
    order.kitchen_order_id,
    order.kitchenOrderId,
  ];
  const value = candidates.find((item) => typeof item === "string" || typeof item === "number");
  return value ? String(value) : "";
};

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "https://tyt-api.vercel.app/").replace(/\/+$/, "");

const resolveMediaUrl = (value?: string) => {
  if (!value) return undefined;
  if (/^(https?:)?\/\//.test(value)) return value;
  if (value.startsWith("data:") || value.startsWith("blob:")) return value;
  if (value.startsWith("/")) return `${apiBaseUrl}${value}`;
  return `${apiBaseUrl}/${value}`;
};

const getKitchenOrderChef = (order: KitchenOrder) => {
  const chef =
    (order.chef as Record<string, unknown> | undefined) ??
    (order.usuario_chef as Record<string, unknown> | undefined) ??
    (order.user_chef as Record<string, unknown> | undefined) ??
    (order.userChef as Record<string, unknown> | undefined);
  if (!chef) return null;

  const name =
    (chef.nome as string | undefined) ??
    (chef.name as string | undefined) ??
    (order.chef_name as string | undefined) ??
    "Chef";

  const photo =
    (chef.foto as string | undefined) ??
    (chef.fotoUrl as string | undefined) ??
    (chef.photoUrl as string | undefined);

  const phone =
    (chef.whatsapp as string | undefined) ??
    (chef.telefone as string | undefined) ??
    (chef.phone as string | undefined);

  return { name, photo, phone };
};

const getStatusDetails = (statusRaw: string) => {
  const status = String(statusRaw).toUpperCase();
  switch (status) {
    case "PENDING":
      return { label: "Aguardando Chef", color: "border-orange-300 text-orange-700 bg-orange-50/50" };
    case "IN_REVIEW":
      return { label: "Em Análise", color: "border-blue-300 text-blue-700 bg-blue-50/50" };
    case "CONFIRMED":
      return { label: "Confirmado", color: "border-green-300 text-green-700 bg-green-50/50" };
    case "COMPLETED":
      return { label: "Concluído", color: "border-gray-300 text-gray-700 bg-gray-50/50" };
    case "DECLINED":
      return { label: "Recusado", color: "border-red-300 text-red-700 bg-red-50/50" };
    case "CANCELLED":
      return { label: "Cancelado", color: "border-red-300 text-red-700 bg-red-50/50" };
    case "CANCELLATION_REQUESTED":
      return { label: "Cancelamento Solicitado", color: "border-yellow-300 text-yellow-700 bg-yellow-50/50" };
    default:
      return { label: status, color: "border-gray-300 text-gray-700" };
  }
};

const DetalheContrato = () => {
  const navigate = useNavigate();
  const { id: contratoId } = useParams();
  const { toast } = useToast();

  const session = useMemo(() => loadSession(), []);
  const token = session?.token;

  const [apiOrder, setApiOrder] = useState<KitchenOrder | null>(null);
  const [apiLoading, setApiLoading] = useState(true);
  const [isAcceptingProposal, setIsAcceptingProposal] = useState(false);
  const [isDecliningProposal, setIsDecliningProposal] = useState(false);
  const [pauseDuration, setPauseDuration] = useState<string>("");
  const [pauseModalOpen, setPauseModalOpen] = useState(false);

  const loadOrderDetails = () => {
    if (!token || !contratoId) return;
    setApiLoading(true);
    getKitchenOrderByCode({ token, code: contratoId })
      .then((res) => {
        if (res && typeof res === "object") {
          const order = (res as any).data && typeof (res as any).data === "object" && !Array.isArray((res as any).data)
            ? (res as any).data
            : res;

          if (order && typeof order === "object" && !Array.isArray(order)) {
            setApiOrder(order as KitchenOrder);
            return;
          }
        }

        toast({
          variant: "destructive",
          title: "Erro ao carregar detalhes",
          description: "Serviço não encontrado.",
        });
        navigate("/meus-contratos");
      })
      .catch((err) => {
        console.error("Erro ao carregar serviço:", err);
        toast({
          variant: "destructive",
          title: "Não foi possível obter os detalhes",
          description: "Verifique sua conexão ou tente novamente.",
        });
        navigate("/meus-contratos");
      })
      .finally(() => setApiLoading(false));
  };

  useEffect(() => {
    loadOrderDetails();
  }, [token, contratoId]);

  const handleAcceptProposal = async () => {
    if (!token || !apiOrder) return;
    const orderId = (apiOrder.id as string | number) ?? getKitchenOrderCode(apiOrder);
    try {
      setIsAcceptingProposal(true);
      await updateKitchenOrderStatus({
        token,
        id: orderId,
        status: "CONFIRMED",
      });
      toast({
        title: "Proposta aceita!",
        description: "O pagamento foi processado e seu serviço agora está Confirmado.",
      });
      loadOrderDetails();
    } catch (err) {
      console.error("Erro ao aceitar proposta:", err);
      toast({
        variant: "destructive",
        title: "Erro ao aceitar proposta",
        description: "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsAcceptingProposal(false);
    }
  };

  const handleDeclineProposal = async () => {
    if (!token || !apiOrder) return;
    const orderId = (apiOrder.id as string | number) ?? getKitchenOrderCode(apiOrder);
    try {
      setIsDecliningProposal(true);
      await updateKitchenOrderStatus({
        token,
        id: orderId,
        status: "DECLINED",
      });
      toast({
        title: "Proposta recusada",
        description: "Você recusou a proposta. O status do serviço foi atualizado.",
      });
      loadOrderDetails();
    } catch (err) {
      console.error("Erro ao recusar proposta:", err);
      toast({
        variant: "destructive",
        title: "Erro ao recusar proposta",
        description: "Tente novamente em alguns instantes.",
      });
    } finally {
      setIsDecliningProposal(false);
    }
  };

  const handlePausarServico = () => {
    setPauseModalOpen(false);
    setPauseDuration("");
    toast({
      title: "Serviço pausado",
      description: "Seu serviço foi pausado. Entraremos em contato para reagendamento.",
    });
  };

  const handleDescartarSemana = () => {
    toast({
      title: "Semana descartada",
      description: "Seu horário foi descartado e disponibilizado para esta semana.",
    });
  };

  const rawProposals = useMemo(() => {
    if (!apiOrder) return [];
    if (Array.isArray(apiOrder.proposals)) {
      return apiOrder.proposals as Array<{ id: number; item: string; value: number }>;
    }
    const spec = apiOrder.special_service_proposal as Record<string, unknown> | null;
    if (spec && Array.isArray(spec.items)) {
      return spec.items.map((item: any, idx: number) => ({
        id: idx,
        item: item.description ?? "",
        value: item.price ?? 0,
      }));
    }
    return [];
  }, [apiOrder]);

  const proposalItems = useMemo(() => {
    return rawProposals.map((p) => ({
      description: p.item,
      price: Number(p.value),
    }));
  }, [rawProposals]);

  const proposalTotalPrice = useMemo(() => {
    return proposalItems.reduce((acc, item) => acc + (item.price || 0), 0);
  }, [proposalItems]);

  const proposalStatus = useMemo(() => {
    if (!apiOrder) return null;
    if (rawProposals.length === 0) return null;

    const orderStatus = String(apiOrder.status).toUpperCase();
    if (orderStatus === "CONFIRMED") return "ACCEPTED";
    if (orderStatus === "DECLINED" || orderStatus === "CANCELLED") return "DECLINED";
    return "AWAITING_CLIENT";
  }, [apiOrder, rawProposals]);

  // Skeleton view
  if (apiLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <AppHeader />
        <main className="p-4 space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Card className="bg-white">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!apiOrder) return null;

  const code = contratoId ?? getKitchenOrderCode(apiOrder);
  const type = normalizeKitchenOrderTypeLabel(apiOrder);
  const status = normalizeKitchenOrderStatusLabel(apiOrder);
  const date = getKitchenOrderDate(apiOrder);
  const time = getKitchenOrderTime(apiOrder);
  const location = getKitchenOrderLocation(apiOrder);
  const client = getKitchenOrderClient(apiOrder);
  const chefInfo = getKitchenOrderChef(apiOrder);
  const statusInfo = getStatusDetails(String(apiOrder.status));

  const canCancel =
    status === "pendente" ||
    status === "confirmado" ||
    String(apiOrder.status).toUpperCase() === "PENDING" ||
    String(apiOrder.status).toUpperCase() === "IN_REVIEW";

  const dishes = Array.isArray(apiOrder.dishes) ? (apiOrder.dishes as any[]) : [];
  const observations = (apiOrder.observations as string | null) ?? "";
  const clientRequest = (apiOrder.client_request as string | null) ?? "";

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <AppHeader />
      <main className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Navigation and Title */}
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/meus-contratos")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-2xl font-light">{type}</h1>
              <Badge variant="outline" className={`px-2.5 py-1 ${statusInfo.color}`}>
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{code ? `Referência: #${code}` : ""}</p>
          </div>
        </div>

        {/* Order details */}
        <Card className="bg-white shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-light text-gray-800">Detalhes do Serviço</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Data</p>
                <p className="font-light text-gray-800 mt-0.5">{date ? date.toLocaleDateString("pt-BR") : "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Horário</p>
                <p className="font-light text-gray-800 mt-0.5">{time || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Local de Atendimento</p>
                <p className="font-light text-gray-800 mt-0.5">{location || "—"}</p>
              </div>
            </div>
          </CardContent>
          {observations && (
            <CardContent className="pt-0 border-t border-gray-50 mt-4 pt-4 text-sm">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Observações / Restrições Alimentares</p>
              <p className="text-gray-700 mt-1 italic">{observations}</p>
            </CardContent>
          )}
        </Card>

        {/* Chef details */}
        <Card className="bg-white shadow-sm border border-gray-100">
          <CardHeader>
            <CardTitle className="text-lg font-light text-gray-800">Chef Atribuído</CardTitle>
          </CardHeader>
          <CardContent>
            {chefInfo ? (
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border border-gray-200">
                  {chefInfo.photo ? <AvatarImage src={resolveMediaUrl(chefInfo.photo)} className="object-cover" /> : null}
                  <AvatarFallback className="bg-gray-100 text-gray-600 font-light">
                    {chefInfo.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-light text-gray-800 text-base">{chefInfo.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Parceiro TYT Verificado</p>
                  {chefInfo.phone && (
                    <div className="flex gap-4 mt-2">
                      <a
                        href={`https://wa.me/${chefInfo.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 font-medium bg-green-50 px-2.5 py-1 rounded-full w-fit hover:bg-green-100/70 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Falar no WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 py-2">
                <div className="w-12 h-12 bg-gray-50 border border-gray-200/50 rounded-full flex items-center justify-center text-gray-400">
                  <ChefHat className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-gray-700 text-sm">Buscando o Chef Ideal</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    O time da TYT está selecionando o chef perfeito para o seu menu. Você será notificado.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected dishes (Meal Prep & Events) */}
        {dishes.length > 0 && (
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-light text-gray-800 flex items-center gap-2">
                <Utensils className="h-5 w-5 text-gray-500" />
                Menu Selecionado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-100">
                {dishes.map((item, index) => {
                  const dishName = item.dish?.nome_prato ?? item.dish?.nome ?? "Prato";
                  const dishPhoto = item.dish?.foto1 ?? item.dish?.foto;
                  const qty = item.quantity ?? 1;

                  return (
                    <div key={item.dish?.id || index} className="p-3 bg-white flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-md border border-gray-100">
                          {dishPhoto ? <AvatarImage src={resolveMediaUrl(dishPhoto)} className="object-cover" /> : null}
                          <AvatarFallback className="rounded-md bg-gray-50">
                            <Utensils className="w-5 h-5 text-gray-400" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-light text-gray-800">{dishName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.dish?.descricao ?? ""}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800 px-2 py-0.5 text-xs font-light">
                        Quantidade: {qty}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Special Service Needs Description */}
        {type === "Serviço Especial" && clientRequest && (
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-light text-gray-800 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-gray-500" />
                Suas Necessidades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 leading-relaxed italic bg-gray-50 p-4 rounded-lg border border-gray-100/50">
                "{clientRequest}"
              </p>
            </CardContent>
          </Card>
        )}

        {/* Special Service Proposal Details */}
        {type === "Serviço Especial" && (
          <Card className="bg-white shadow-sm border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg font-light text-gray-800 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-gray-500" />
                Orçamento e Itens da Proposta
              </CardTitle>
            </CardHeader>
            <CardContent>
              {proposalStatus ? (
                <div className="space-y-4">
                  <div className="border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-100">
                    {proposalItems.map((item, index) => (
                      <div
                        key={index}
                        className={`p-3 flex justify-between items-center text-sm ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                      >
                        <span className="text-gray-700 font-medium">{item.description}</span>
                        <span className="text-gray-950 font-light">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}
                        </span>
                      </div>
                    ))}
                    <div className="p-3 bg-primary/5 flex justify-between items-center text-sm font-light border-t-2 border-primary/20">
                      <span className="text-gray-800">Total da Proposta</span>
                      <span className="text-primary text-base">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(proposalTotalPrice)}
                      </span>
                    </div>
                  </div>

                  {proposalStatus === "AWAITING_CLIENT" && (
                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={handleAcceptProposal}
                        disabled={isAcceptingProposal || isDecliningProposal}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white font-light h-11"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {isAcceptingProposal ? "Processando Pagamento..." : `Aceitar e Pagar - ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(proposalTotalPrice)}`}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDeclineProposal}
                        disabled={isAcceptingProposal || isDecliningProposal}
                        className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-light h-11"
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        {isDecliningProposal ? "Recusando Proposta..." : "Recusar Proposta"}
                      </Button>
                    </div>
                  )}
                  {proposalStatus === "ACCEPTED" && (
                    <div className="p-3 bg-green-50 text-green-800 rounded-lg border border-green-200 text-sm font-light flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Você aceitou esta proposta. O pagamento foi efetuado.
                    </div>
                  )}
                  {proposalStatus === "DECLINED" && (
                    <div className="p-3 bg-red-50 text-red-800 rounded-lg border border-red-200 text-sm font-light flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Esta proposta foi recusada. Aguarde o envio de uma nova proposta.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-gray-500">
                  <Info className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  Aguardando elaboração do orçamento pelo administrador/chef.
                  <p className="text-xs text-gray-400 mt-1">O prazo médio para retorno é de até 48 horas.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons for Meal Prep */}
        {type === "Cozinha Semanal" && (
          <div className="space-y-3">
            {status === "pendente" && (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-light"
                size="lg"
                onClick={() =>
                  navigate("/contratacao-logado", {
                    state: {
                      fromDashboard: true,
                      goToStep3: true,
                      prefilledData: {
                        cidade: apiOrder.city || "",
                        tipoServico: "cozinha-semanal",
                        tamanhoPortacao:
                          Number(apiOrder.people_quantity) <= 2
                            ? "pequena"
                            : Number(apiOrder.people_quantity) <= 4
                              ? "media"
                              : "grande",
                        categorias: [],
                        preferencias: [],
                        ingredientes: [],
                        tiposCozinha: [],
                        pratosSelecionados: dishes.map((item) => ({
                          id: item.dish?.id,
                          dishId: item.dish?.id,
                          nome: item.dish?.nome_prato ?? item.dish?.nome,
                          descricao: item.dish?.descricao ?? "",
                          foto: resolveMediaUrl(item.dish?.foto1 ?? item.dish?.foto) ?? "",
                          quantity: item.quantity ?? 1,
                        })),
                      },
                    },
                  })
                }
              >
                <Utensils className="h-4 w-4 mr-2" />
                Alterar Pratos da Semana / Editar
              </Button>
            )}

            <div className="grid grid-cols-2 gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    Pular Semana
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Descartar esta semana?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Ao pular esta semana, seu horário será disponibilizado para outro cliente e nenhuma cobrança será efetuada para este período.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDescartarSemana}>Confirmar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Dialog open={pauseModalOpen} onOpenChange={setPauseModalOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    Pausar Serviço
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Pausar Serviço</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-2">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Ao pausar o serviço, o dia e período reservados serão disponibilizados. Ao retornar, você poderá escolher entre os horários disponíveis.
                    </p>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Por quanto tempo deseja pausar?</label>
                      <Select value={pauseDuration} onValueChange={setPauseDuration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2semanas">2 Semanas</SelectItem>
                          <SelectItem value="3semanas">3 Semanas</SelectItem>
                          <SelectItem value="1mes">1 Mês</SelectItem>
                          <SelectItem value="2meses">2 Meses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1" onClick={() => setPauseModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button className="flex-1" onClick={handlePausarServico} disabled={!pauseDuration}>
                        Confirmar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {/* Global actions: Help & Cancel */}
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full border-gray-200 hover:bg-gray-100 hover:text-gray-900"
            onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
          >
            <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
            Preciso de Ajuda / Suporte
          </Button>

          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Cancelar Pedido
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Confirmar Cancelamento do Serviço
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza de que deseja prosseguir com o cancelamento? Essa ação cancelará o agendamento atual com o Chef. Em caso de dúvidas, fale com o suporte.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      if (!token || !code) return;
                      try {
                        setApiLoading(true);
                        await cancelKitchenOrder({ token, code });
                        toast({
                          title: "Serviço cancelado",
                          description: "Seu agendamento foi cancelado com sucesso.",
                        });
                        navigate("/meus-contratos");
                      } catch (err) {
                        console.error("Erro ao cancelar:", err);
                        toast({
                          title: "Erro ao cancelar",
                          description: "Tente novamente em alguns instantes.",
                          variant: "destructive",
                        });
                      } finally {
                        setApiLoading(false);
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Sim, Cancelar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </main>
    </div>
  );
};

export default DetalheContrato;
