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
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  CreditCard,
  Receipt,
  ChefHat,
  Utensils,
  Martini,
  PartyPopper,
  AlertTriangle,
  MessageCircle,
  CheckCircle,
  Info,
  Phone,
  ClipboardList,
  QrCode,
  Copy,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { tokenizeCard, getAsaasCustomerId } from "@/services/asaasService";
import { AppHeader } from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { loadSession } from "@/services/authService";
import {
  cancelKitchenOrder,
  getKitchenOrderDate,
  getKitchenOrderLocation,
  getKitchenOrderTime,
  getKitchenOrderClient,
  getKitchenOrderByCode,
  getPixQrCode,
  normalizeKitchenOrderStatusLabel,
  normalizeKitchenOrderTypeLabel,
  updateKitchenOrderStatus,
  paySpecialServiceOrder,
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
    case "CANCELATION_REQUESTED":
      return { label: "Cancelamento Solicitado", color: "border-yellow-300 text-yellow-700 bg-yellow-50/50" };
    case "FINALIZED":
      return { label: "Concluído", color: "border-gray-300 text-gray-700 bg-gray-50/50" };
    default:
      return { label: status, color: "border-gray-300 text-gray-700" };
  }
};

const PixDetailsCard: React.FC<{ paymentId: string; token: string; orderCode: string }> = ({ paymentId, token, orderCode }) => {
  const { toast } = useToast();
  const [qrCodeImage, setQrCodeImage] = useState("");
  const [pixPayload, setPixPayload] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!paymentId || !token) return;
    getPixQrCode({ token, paymentId })
      .then((res) => {
        let qrData = res as unknown as Record<string, unknown>;
        for (let i = 0; i < 3; i++) {
          if (qrData?.data && typeof qrData.data === "object" && !Array.isArray(qrData.data)) {
            qrData = qrData.data as Record<string, unknown>;
          }
        }
        setQrCodeImage(String(qrData?.encodedImage || qrData?.qrCode || qrData?.image || ""));
        setPixPayload(String(qrData?.payload || qrData?.pixCopiaECola || qrData?.copyAndPaste || ""));
      })
      .catch((err) => {
        console.error("Erro ao carregar Pix nos detalhes:", err);
      })
      .finally(() => setLoading(false));
  }, [paymentId, token]);

  const handleCopy = async () => {
    if (!pixPayload) return;
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      toast({ title: "Código Pix copiado!", description: "Cole no aplicativo do seu banco." });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({ title: "Erro ao copiar", description: "Copie manualmente.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border border-green-200 shadow-none rounded-xl">
        <CardContent className="p-6 text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#004B2A] mb-2" />
          <p className="text-sm text-gray-500">Carregando dados do Pix...</p>
        </CardContent>
      </Card>
    );
  }

  if (!qrCodeImage && !pixPayload) return null;

  return (
    <Card className="bg-white border-2 border-green-600/30 shadow-none rounded-xl overflow-hidden">
      <CardHeader className="bg-green-50/50 pb-3 border-b border-green-100">
        <CardTitle className="flex items-center gap-2 text-base text-[#004B2A]">
          <QrCode className="w-5 h-5" />
          <span>Pagamento via Pix (Pendente)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <p className="text-xs text-muted-foreground text-center">
          Escaneie o QR Code abaixo ou copie a chave Pix para realizar o pagamento no app do seu banco:
        </p>

        {qrCodeImage && (
          <div className="flex justify-center py-1">
            <div className="bg-white p-3 rounded-xl border-2 border-gray-100 shadow-sm">
              <img
                src={`data:image/png;base64,${qrCodeImage}`}
                alt="QR Code Pix"
                className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
              />
            </div>
          </div>
        )}

        {pixPayload && (
          <div className="space-y-1.5 w-full min-w-0">
            <p className="text-xs font-medium text-muted-foreground text-center">
              Código Pix Copia e Cola:
            </p>
            <div className="flex items-center gap-2 w-full min-w-0">
              <div className="flex-1 min-w-0 bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                <p className="text-xs font-mono text-gray-600 truncate select-all">
                  {pixPayload}
                </p>
              </div>
              <Button
                variant={copied ? "default" : "outline"}
                size="sm"
                onClick={() => void handleCopy()}
                className={`shrink-0 ${copied ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
              >
                {copied ? (
                  <><CheckCircle2 className="w-4 h-4 mr-1" /> Copiado</>
                ) : (
                  <><Copy className="w-4 h-4 mr-1" /> Copiar</>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
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


  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [errosValidacao, setErrosValidacao] = useState<string[]>([]);

  const [cartao, setCartao] = useState({
    numero: "",
    nomeTitular: "",
    validade: "",
    cvv: "",
  });

  const [endereco, setEndereco] = useState({
    cep: "",
    numero: "",
    complemento: "",
  });

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
            const cli = (order as any).cliente || {};
            setEndereco({
              cep: cli.cep || "",
              numero: cli.numero || "",
              complemento: cli.complemento || "",
            });
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

  const validarPagamentoForm = () => {
    const erros: string[] = [];
    if (!endereco.cep.replace(/\D/g, '')) erros.push('cep');
    if (!endereco.numero.trim()) erros.push('numero');

    const numLimpo = cartao.numero.replace(/\D/g, '');
    if (numLimpo.length < 15 || numLimpo.length > 16) erros.push('cartao_numero');

    if (!cartao.nomeTitular.trim()) erros.push('cartao_nome');

    const valRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    if (!valRegex.test(cartao.validade)) erros.push('cartao_validade');

    const cvvLimpo = cartao.cvv.replace(/\D/g, '');
    if (cvvLimpo.length < 3 || cvvLimpo.length > 4) erros.push('cartao_cvv');

    return erros;
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !apiOrder) return;

    const erros = validarPagamentoForm();
    setErrosValidacao(erros);

    if (erros.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos do cartão e endereço corretamente.",
        variant: "destructive"
      });
      return;
    }

    setIsPaying(true);

    try {
      // 1. Get Customer ID from backend
      const customerRes = await getAsaasCustomerId(token);
      if (!customerRes.asaasCustomerId) {
        throw new Error("Não foi possível obter o identificador do cliente no Asaas.");
      }

      // 2. Tokenize Credit Card via our backend proxy
      const [expiryMonth, expiryYearShort] = cartao.validade.split('/');
      const expiryYear = expiryYearShort ? `20${expiryYearShort}` : '';
      const userRecord = (session?.user || {}) as Record<string, any>;

      const tokenizePayload = {
        customer: customerRes.asaasCustomerId,
        creditCard: {
          holderName: cartao.nomeTitular.trim(),
          number: cartao.numero.replace(/\D/g, ''),
          expiryMonth: (expiryMonth || '').trim(),
          expiryYear,
          ccv: cartao.cvv.replace(/\D/g, '')
        },
        creditCardHolderInfo: {
          name: cartao.nomeTitular.trim(),
          email: String(userRecord.email || ""),
          cpfCnpj: String(userRecord.cpf || "").replace(/\D/g, ""),
          postalCode: endereco.cep.replace(/\D/g, ''),
          addressNumber: endereco.numero,
          addressComplement: endereco.complemento || undefined,
          phone: String(userRecord.whatsapp || "").replace(/\D/g, "")
        }
      };

      const tokenizeResult = await tokenizeCard(token, tokenizePayload);
      if (!tokenizeResult.creditCardToken) {
        throw new Error("Não foi possível tokenizar o cartão.");
      }

      // 3. Submit payment request to our backend
      await paySpecialServiceOrder({
        token,
        code: getKitchenOrderCode(apiOrder),
        creditCardToken: tokenizeResult.creditCardToken,
        creditCardHolderInfo: {
          name: cartao.nomeTitular.trim(),
          postalCode: endereco.cep.replace(/\D/g, ''),
          addressNumber: endereco.numero,
          addressComplement: endereco.complemento,
          email: String(userRecord.email || ""),
          phone: String(userRecord.whatsapp || "").replace(/\D/g, ""),
          cpfCnpj: String(userRecord.cpf || "").replace(/\D/g, "")
        }
      });

      toast({
        title: "Pagamento Aprovado!",
        description: "Seu serviço especial foi pago e confirmado com sucesso.",
      });

      setIsPaymentModalOpen(false);
      loadOrderDetails();
    } catch (err: any) {
      console.error("Erro no processamento do pagamento:", err);
      toast({
        variant: "destructive",
        title: "Falha no pagamento",
        description: err.response?.data?.error || err.message || "Erro ao processar o pagamento. Verifique seus dados.",
      });
    } finally {
      setIsPaying(false);
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
    // Consider ACCEPTED if order is confirmed OR if a payment has already been registered
    const hasPaid = !!(apiOrder.id_pagamento || (apiOrder as any).id_payment);
    if (orderStatus === "CONFIRMED" || orderStatus === "COMPLETED" || hasPaid) return "ACCEPTED";
    if (orderStatus === "DECLINED" || orderStatus === "CANCELLED") return "DECLINED";
    return "AWAITING_CLIENT";
  }, [apiOrder, rawProposals]);

  // Chef specialties helper
  const chefSpecialties = useMemo(() => {
    if (!apiOrder) return "";
    const chefObj = (apiOrder.chef as any) ?? (apiOrder.usuario_chef as any);
    if (!chefObj) return "";
    const especialidades = chefObj.usuario_chef_especialidades as Array<{ especialidade: string; active: boolean }> | undefined;
    if (Array.isArray(especialidades)) {
      return especialidades
        .filter((e) => e.active)
        .map((e) => e.especialidade)
        .slice(0, 2)
        .join(" e ");
    }
    return "";
  }, [apiOrder]);

  // Menu / theme name
  const menuName = useMemo(() => {
    if (!apiOrder) return "—";
    const theme = (apiOrder as any).tema ?? (apiOrder as any).theme ?? (apiOrder as any).menu;
    if (theme && typeof theme === "object") return (theme as any).nome ?? (theme as any).name ?? "—";
    if (typeof theme === "string" && theme) return theme;
    return "—";
  }, [apiOrder]);

  // Service level (Clássico / Banquete)
  const serviceLevel = useMemo(() => {
    if (!apiOrder) return "—";
    return (apiOrder as any).nivel_servico ?? (apiOrder as any).service_level ?? (apiOrder as any).tipo_servico ?? "—";
  }, [apiOrder]);

  // Skeleton view
  if (apiLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background pt-20">
        <AppHeader />
        <main className="flex-1 p-4 space-y-4 max-w-3xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-7 w-48" />
          </div>
          <Card className="bg-white border border-gray-200/70">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-24" />
              <div className="grid grid-cols-4 gap-4 pt-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-5 w-32" />
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200/70">
            <CardContent className="p-6 space-y-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-64" />
            </CardContent>
          </Card>
          <Card className="bg-white border border-gray-200/70">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
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

  const hasPaid = !!(
    apiOrder.id_pagamento ||
    (apiOrder as any).id_payment ||
    ["CONFIRMED", "COMPLETED", "FINALIZED"].includes(String(apiOrder.status).toUpperCase())
  );

  const dishes = Array.isArray(apiOrder.dishes) ? (apiOrder.dishes as any[]) : [];
  const observations = (apiOrder.observations as string | null) ?? "";
  const clientRequest = (apiOrder.client_request as string | null) ?? "";

  return (
    <div className="min-h-screen flex flex-col bg-background pt-20">
      <AppHeader />
      <main className="flex-1 px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {/* Navigation and Title */}
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate("/meus-contratos")}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Detalhes do contrato</h1>
        </div>

        {/* Card de Pagamento Pix Pendente */}
        {apiOrder.id_pagamento && String(apiOrder.status).toUpperCase() === "PENDING" && token && (
          <PixDetailsCard
            paymentId={String(apiOrder.id_pagamento)}
            token={token}
            orderCode={code}
          />
        )}

        {/* Order details card - Figma style */}
        <Card className="bg-white border border-gray-200/70 shadow-none rounded-xl">
          <CardContent className="p-6">
            {/* Card header: icon + service type + reference */}
            <div className="flex items-center gap-2 mb-1">
              {type === "Meal Prep" ? (
                <Utensils className="w-5 h-5 text-[#EF3F0D]" />
              ) : type === "Get Together" ? (
                <Martini className="w-5 h-5 text-[#BC008F]" />
              ) : (
                <PartyPopper className="w-5 h-5 text-[#89CDD2]" />
              )}
              <h2 className={`text-lg font-semibold ${type === "Meal Prep" ? "text-[#EF3F0D]" : type === "Get Together" ? "text-[#BC008F]" : "text-[#89CDD2]"}`}>{type}</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">Referência: #{code}</p>

            {/* Info columns: Data | Menu | Tipo | Pessoas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Data</p>
                <p className="text-sm font-medium text-gray-800">
                  {date ? date.toLocaleDateString("pt-BR") : "—"}
                </p>
                {time && <p className="text-xs text-gray-500">{time}</p>}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Menu</p>
                <p className="text-sm font-medium text-gray-800">{menuName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Tipo</p>
                <p className="text-sm font-medium text-gray-800">{serviceLevel !== "—" ? serviceLevel : type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Pessoas</p>
                <p className="text-sm font-medium text-gray-800">{(apiOrder as any)?.people_quantity ?? "—"}</p>
              </div>
            </div>

            {/* Financial breakdown */}
            {((apiOrder as any)?.service_value > 0 || proposalTotalPrice > 0) && (
              <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">Valor do Serviço</p>
                  <p className="text-base font-semibold text-gray-800">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                      (apiOrder as any)?.service_value ?? proposalTotalPrice
                    )}
                  </p>
                </div>
                {(apiOrder as any)?.chef_amount !== undefined && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div>
                      <span className="text-gray-400 block">Chef recebe</span>
                      <span className="font-medium text-gray-700">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((apiOrder as any).chef_amount)}
                      </span>
                    </div>
                    {Number((apiOrder as any)?.sub_chef_amount) > 0 && (
                      <div>
                        <span className="text-gray-400 block">Sub Chef (via TYT)</span>
                        <span className="font-medium text-amber-700">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((apiOrder as any).sub_chef_amount)}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400 block">TYT Plataforma</span>
                      <span className="font-medium text-gray-700">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((apiOrder as any).tyt_amount ?? 0)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Observations */}
            {observations && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Observações / Restrições Alimentares</p>
                <p className="text-sm text-gray-700 italic">{observations}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Endereço card */}
        {location && (
          <Card className="bg-white border border-gray-200/70 shadow-none rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h2 className="text-base font-semibold text-gray-800">Endereço</h2>
              </div>
              <p className="text-sm text-gray-600">{location}</p>
            </CardContent>
          </Card>
        )}

        {/* Seu Chef card */}
        <Card className="bg-white border border-gray-200/70 shadow-none rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold text-primary">Seu Chef</h2>
            </div>
            {chefInfo ? (
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border border-gray-200 flex-shrink-0">
                  {chefInfo.photo ? <AvatarImage src={resolveMediaUrl(chefInfo.photo)} className="object-cover" /> : null}
                  <AvatarFallback className="bg-gray-100 text-gray-600 text-lg font-medium">
                    {chefInfo.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-800">{chefInfo.name}</h3>
                  {chefSpecialties && (
                    <p className="text-sm text-gray-500 mt-0.5">{chefSpecialties}</p>
                  )}
                  {chefInfo.phone && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Phone className="h-3.5 w-3.5 text-green-600" />
                      <a
                        href={`https://wa.me/${chefInfo.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:text-green-700 transition-colors"
                      >
                        {chefInfo.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 border border-gray-200/70 rounded-full flex items-center justify-center text-gray-400 flex-shrink-0">
                  <ChefHat className="w-7 h-7" />
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

        {/* Solicitar Ajuda button - centered as per Figma */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900 gap-2 px-8"
            onClick={() => window.open("https://wa.me/5511999999999", "_blank")}
          >
            <MessageCircle className="h-4 w-4 text-green-500" />
            Solicitar Ajuda
          </Button>
        </div>

        {/* Ordens de Cozinha card */}
        <Card className="bg-white border border-gray-200/70 shadow-none rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-gray-600" />
              <h2 className="text-base font-semibold text-gray-800">Ordens de Cozinha</h2>
            </div>
            {dishes.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
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
                          <p className="text-sm font-medium text-gray-800">{dishName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.dish?.descricao ?? ""}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700 px-2 py-0.5 text-xs">
                        × {qty}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium">{date ? date.toLocaleDateString("pt-BR") : "—"}</span>
                      </div>
                      {proposalTotalPrice > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <DollarSign className="w-3 h-3" />
                          <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(proposalTotalPrice)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChefHat className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Special Service Needs Description */}
        {type === "Special Service" && clientRequest && (
          <Card className="bg-white border border-gray-200/70 shadow-none rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="h-5 w-5 text-gray-600" />
                <h2 className="text-base font-semibold text-gray-800">Suas Necessidades</h2>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed italic bg-gray-50 p-4 rounded-lg border border-gray-100/50">
                "{clientRequest}"
              </p>
            </CardContent>
          </Card>
        )}

        {/* Special Service Proposal Details */}
        {type === "Special Service" && (
          <Card className="bg-white border border-gray-200/70 shadow-none rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Receipt className="h-5 w-5 text-gray-600" />
                <h2 className="text-base font-semibold text-gray-800">Orçamento e Itens da Proposta</h2>
              </div>
              {proposalStatus ? (
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
                    {proposalItems.map((item, index) => (
                      <div
                        key={index}
                        className={`p-3 flex justify-between items-center text-sm ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                          }`}
                      >
                        <span className="text-gray-700 font-medium">{item.description}</span>
                        <span className="text-gray-900 font-medium">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}
                        </span>
                      </div>
                    ))}
                    <div className="p-3 bg-primary/5 flex justify-between items-center text-sm border-t-2 border-primary/20">
                      <span className="text-gray-800 font-medium">Total da Proposta</span>
                      <span className="text-primary text-base font-semibold">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(proposalTotalPrice)}
                      </span>
                    </div>
                  </div>

                  {proposalStatus === "AWAITING_CLIENT" && (
                    <div className="flex flex-col gap-3">
                      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            className="w-full bg-primary hover:bg-primary/90 text-white h-11"
                            disabled={isAcceptingProposal || isDecliningProposal}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Aceitar e Pagar - {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(proposalTotalPrice)}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-white border border-gray-150 rounded-xl shadow-2xl p-6">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-light text-gray-800">Pagamento com Cartão</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-2">
                            {/* Card number */}
                            <div className="space-y-1">
                              <Label htmlFor="cardNumber" className="text-xs text-gray-500 font-light">Número do Cartão</Label>
                              <Input
                                id="cardNumber"
                                placeholder="0000 0000 0000 0000"
                                value={cartao.numero}
                                onChange={(e) => setCartao({ ...cartao, numero: e.target.value })}
                                className={`text-sm font-mono ${errosValidacao.includes('cartao_numero') ? 'border-red-500 ring-red-500' : ''}`}
                              />
                            </div>
                            {/* Card Holder Name */}
                            <div className="space-y-1">
                              <Label htmlFor="cardName" className="text-xs text-gray-500 font-light">Nome Impresso no Cartão</Label>
                              <Input
                                id="cardName"
                                placeholder="NOME DO TITULAR"
                                value={cartao.nomeTitular}
                                onChange={(e) => setCartao({ ...cartao, nomeTitular: e.target.value.toUpperCase() })}
                                className={`text-sm ${errosValidacao.includes('cartao_nome') ? 'border-red-500 ring-red-500' : ''}`}
                              />
                            </div>
                            {/* Expiry and CVV */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label htmlFor="cardExpiry" className="text-xs text-gray-500 font-light">Validade (MM/AA)</Label>
                                <Input
                                  id="cardExpiry"
                                  placeholder="MM/AA"
                                  value={cartao.validade}
                                  onChange={(e) => setCartao({ ...cartao, validade: e.target.value })}
                                  className={`text-sm font-mono ${errosValidacao.includes('cartao_validade') ? 'border-red-500 ring-red-500' : ''}`}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="cardCvv" className="text-xs text-gray-500 font-light">CVV</Label>
                                <Input
                                  id="cardCvv"
                                  placeholder="123"
                                  value={cartao.cvv}
                                  onChange={(e) => setCartao({ ...cartao, cvv: e.target.value })}
                                  className={`text-sm font-mono ${errosValidacao.includes('cartao_cvv') ? 'border-red-500 ring-red-500' : ''}`}
                                />
                              </div>
                            </div>

                            <Separator className="my-2" />

                            {/* Billing Address (CEP & Number) */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <Label htmlFor="billingCep" className="text-xs text-gray-500 font-light">CEP de Cobrança</Label>
                                <Input
                                  id="billingCep"
                                  placeholder="00000-000"
                                  value={endereco.cep}
                                  onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })}
                                  className={`text-sm font-mono ${errosValidacao.includes('cep') ? 'border-red-500 ring-red-500' : ''}`}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="billingNumber" className="text-xs text-gray-500 font-light">Número</Label>
                                <Input
                                  id="billingNumber"
                                  placeholder="123"
                                  value={endereco.numero}
                                  onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
                                  className={`text-sm ${errosValidacao.includes('numero') ? 'border-red-500 ring-red-500' : ''}`}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="billingComplement" className="text-xs text-gray-500 font-light">Complemento (Opcional)</Label>
                              <Input
                                id="billingComplement"
                                placeholder="Apto, Bloco, etc."
                                value={endereco.complemento}
                                onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
                                className="text-sm"
                              />
                            </div>

                            <Button
                              type="submit"
                              disabled={isPaying}
                              className="w-full bg-[#0A4275] hover:bg-[#08355e] text-white font-light h-11 mt-4"
                            >
                              {isPaying ? "Processando Pagamento..." : `Confirmar e Pagar ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(proposalTotalPrice)}`}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
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
        {type === "Meal Prep" && status === "pendente" && (
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white"
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

        {/* Cancel button - centered as per Figma */}
        {canCancel && (
          <div className="flex justify-center">
            {hasPaid ? (
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2 px-8"
                onClick={() => {
                  const clientName = client?.name || "";
                  const whatsappMsg = encodeURIComponent(`Olá! Gostaria de cancelar o pedido ${code}${clientName ? ` de ${clientName}` : ""}.`);
                  window.open(`https://wa.me/5511999999999?text=${whatsappMsg}`, "_blank");
                }}
              >
                <AlertTriangle className="h-4 w-4" />
                Cancelar Serviço
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2 px-8"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Cancelar Serviço
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
        )}
      </main>
      <Footer />
    </div>
  );
};

export default DetalheContrato;
