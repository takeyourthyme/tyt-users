import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ChevronDown, ChevronUp, Calendar, MapPin, Clock, DollarSign, User, Phone, Mail, CreditCard, Receipt, Star, ChefHat, Utensils, Calendar as CalendarIcon, AlertTriangle, AlertCircle, Heart, MessageCircle, CheckCircle, PlayCircle, PartyPopper, Users, ShoppingCart, PauseCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/AppHeader";
import mariaProfile from "@/assets/maria-profile.jpg";
import chefRoberto from "@/assets/chef-roberto.jpg";
import visaIcon from "@/assets/visa-icon.png";
import mastercardIcon from "@/assets/mastercard-icon.png";
import { addWeeks, addMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
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
  type KitchenOrder,
} from "@/services/kitchenOrderService";

/* eslint-disable @typescript-eslint/no-explicit-any */

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

const DetalheContrato = () => {
  const navigate = useNavigate();
  const { id: contratoId } = useParams();
  const { toast } = useToast();
  const session = useMemo(() => loadSession(), []);
  const token = session?.token;

  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  const [ordensVisiveis, setOrdensVisiveis] = useState(10);
  const [pauseDuration, setPauseDuration] = useState<string>("");
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState<Record<number, { rating: number, comentario: string }>>({
    1: { rating: 5, comentario: "Excelente serviço! Chef muito profissional." },
    4: { rating: 4, comentario: "Muito bom, pratos deliciosos!" }
  });
  const [novaAvaliacao, setNovaAvaliacao] = useState<{ rating: number, comentario: string }>({ rating: 0, comentario: "" });
  const [avaliacaoAberta, setAvaliacaoAberta] = useState<number | null>(null);

  const [apiOrder, setApiOrder] = useState<KitchenOrder | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    if (!token || !contratoId) return;
    setApiLoading(true);
    getKitchenOrderByCode({ token, code: contratoId })
      .then((data) => {
        if (data && typeof data === "object" && !Array.isArray(data)) {
          setApiOrder(data as KitchenOrder);
        }
      })
      .catch(() => { })
      .finally(() => setApiLoading(false));
  }, [token, contratoId]);

  if (apiOrder) {
    const code = contratoId ?? getKitchenOrderCode(apiOrder);
    const type = normalizeKitchenOrderTypeLabel(apiOrder);
    const status = normalizeKitchenOrderStatusLabel(apiOrder);
    const date = getKitchenOrderDate(apiOrder);
    const time = getKitchenOrderTime(apiOrder);
    const location = getKitchenOrderLocation(apiOrder);
    const client = getKitchenOrderClient(apiOrder, mariaProfile);
    const canCancel = status === "pendente" || status === "confirmado";

    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <AppHeader />
        <main className="p-4 space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/meus-contratos")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl font-bold">{type}</h1>
                <Badge
                  variant="outline"
                  className={status === "pendente" ? "border-orange-300 text-orange-700" : "border-green-300 text-green-700"}
                >
                  {status === "pendente" ? <AlertCircle className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                  {status === "pendente" ? "Pendente" : status === "confirmado" ? "Confirmado" : status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{code ? `Referência: #${code}` : ""}</p>
            </div>
          </div>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 text-gray-500" />
                <div>
                  <p className="text-gray-500">Data</p>
                  <p className="font-medium">{date ? date.toLocaleDateString("pt-BR") : "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 text-gray-500" />
                <div>
                  <p className="text-gray-500">Horário</p>
                  <p className="font-medium">{time || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-gray-500" />
                <div>
                  <p className="text-gray-500">Local</p>
                  <p className="font-medium">{location || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={client.photo} />
                <AvatarFallback>{client.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{client.name}</div>
                <div className="text-sm text-gray-500">—</div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate("/meus-contratos")}>
              Voltar
            </Button>
            <Button
              className="flex-1"
              variant="destructive"
              disabled={!canCancel || apiLoading || !token || !code}
              onClick={async () => {
                if (!token || !code) return;
                try {
                  setApiLoading(true);
                  await cancelKitchenOrder({ token, code });
                  toast({ title: "Serviço cancelado", description: "Seu serviço foi cancelado com sucesso." });
                  navigate("/meus-contratos");
                } catch {
                  toast({
                    title: "Erro ao cancelar",
                    description: "Tente novamente em alguns instantes.",
                    variant: "destructive",
                  });
                } finally {
                  setApiLoading(false);
                }
              }}
            >
              Cancelar serviço
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Dados mockados baseados na listagem de contratos
  const dadosListagem = {
    ativos: [
      {
        id: "MP-47",
        tipo: "meal-prep",
        titulo: "Cozinha Semanal",
        status: "ativo",
        porção: "Pequena (1-2 pessoas)",
        dia: "Segunda a tarde",
        valorSemanal: 280.0,
        inicio: "2024-12-01",
        proximoPagamento: "2025-01-15",
      },
      {
        id: "EV-82",
        tipo: "evento",
        titulo: "Evento",
        status: "confirmado",
        data: "2025-01-20",
        menu: "Noite Italiana",
        tipoMenu: "Banquete",
        pessoas: 12,
        valor: 1200.0,
      },
      {
        id: "SE-39",
        tipo: "especial",
        titulo: "Serviço Especial",
        status: "aguardando_pagamento",
        dataSolicitada: "2025-01-15",
        preferencias: "Culinária mediterrânea",
        pessoas: 4,
        valor: 450.0,
      },
    ],
    antigos: [
      {
        id: "MP-15",
        tipo: "meal-prep",
        titulo: "Cozinha Semanal",
        status: "finalizado",
        porção: "Grande (4-6 pessoas)",
        periodo: "Dezembro 2024",
        valorTotal: 1120.0,
        dataFim: "2024-12-30",
      },
      {
        id: "EV-64",
        tipo: "evento",
        titulo: "Evento",
        status: "concluido",
        data: "2024-11-15",
        menu: "Festa de Aniversário",
        tipoMenu: "Coquetel",
        pessoas: 25,
        valor: 2500.0,
      },
    ],
  } as const;

  const todosContratos = [...dadosListagem.ativos, ...dadosListagem.antigos] as any[];
  const contratoSelecionado = todosContratos.find((c) => c.id === contratoId) || todosContratos[0];

  const contrato = {
    ...contratoSelecionado,
    endereco: "Rua das Flores, 123 - Centro, São Paulo - SP",
  } as any;

  const chef = {
    nome: "Chef Roberto Silva",
    foto: chefRoberto,
    telefone: "(11) 98765-4321",
    especialidade: "Culinária Italiana e Mediterrânea",
  };

  const ordensServico = [
    {
      id: 6,
      data: "2024-02-12",
      valor: "R$ 220,00",
      status: "em_andamento",
      pratos: [
        { nome: "Paella Valenciana" },
        { nome: "Gazpacho Andaluz" },
        { nome: "Crema Catalana" }
      ],
      valorChef: "R$ 80,00",
      valorCompras: "R$ 110,00",
      valorTotal: "R$ 220,00",
      cartao: { bandeira: "visa", ultimos4: "9876" },
      comprovanteMercado: true,
      lancamentos: [
        { data: "2024-02-12", tipo: "cobranca", valor: "R$ 220,00", descricao: "Cobrança da ordem de cozinha" }
      ]
    },
    {
      id: 5,
      data: "2024-02-10",
      valor: "R$ 185,00",
      status: "em_andamento",
      pratos: [
        { nome: "Ramen Tonkotsu" },
        { nome: "Gyoza de Porco" },
        { nome: "Mochi de Chocolate" }
      ],
      valorChef: "R$ 80,00",
      valorCompras: "R$ 85,00",
      valorTotal: "R$ 185,00",
      cartao: { bandeira: "mastercard", ultimos4: "3456" },
      comprovanteMercado: true,
      lancamentos: [
        { data: "2024-02-10", tipo: "cobranca", valor: "R$ 185,00", descricao: "Cobrança da ordem de cozinha" }
      ]
    },
    {
      id: 4,
      data: "2024-02-09",
      valor: "R$ 195,00",
      status: "finalizado",
      pratos: [
        { nome: "Coq au Vin" },
        { nome: "Ratatouille" },
        { nome: "Tarte Tatin" }
      ],
      valorChef: "R$ 80,00",
      valorCompras: "R$ 95,00",
      valorTotal: "R$ 195,00",
      cartao: { bandeira: "visa", ultimos4: "7890" },
      comprovanteMercado: true,
      lancamentos: [
        { data: "2024-02-09", tipo: "cobranca", valor: "R$ 210,00", descricao: "Cobrança da ordem de cozinha" },
        { data: "2024-02-10", tipo: "estorno", valor: "R$ 15,00", descricao: "Estorno - economia nas compras" }
      ]
    },
    {
      id: 3,
      data: "2024-02-07",
      valor: "R$ 165,00",
      status: "finalizado",
      pratos: [
        { nome: "Fish and Chips" },
        { nome: "Shepherd's Pie" },
        { nome: "Apple Crumble" }
      ],
      valorChef: "R$ 80,00",
      valorCompras: "R$ 65,00",
      valorTotal: "R$ 165,00",
      cartao: { bandeira: "mastercard", ultimos4: "2468" },
      comprovanteMercado: false,
      lancamentos: [
        { data: "2024-02-07", tipo: "cobranca", valor: "R$ 165,00", descricao: "Cobrança da ordem de cozinha" }
      ]
    },
    {
      id: 2,
      data: "2024-02-08",
      valor: "R$ 175,00",
      status: "finalizado",
      pratos: [
        { nome: "Lasanha Bolonhesa" },
        { nome: "Bruschetta" },
        { nome: "Tiramisu" }
      ],
      valorChef: "R$ 80,00",
      valorCompras: "R$ 70,00",
      valorTotal: "R$ 175,00",
      cartao: { bandeira: "mastercard", ultimos4: "5678" },
      comprovanteMercado: false,
      lancamentos: [
        { data: "2024-02-08", tipo: "cobranca", valor: "R$ 180,00", descricao: "Cobrança da ordem de cozinha" },
        { data: "2024-02-09", tipo: "estorno", valor: "R$ 5,00", descricao: "Estorno - ajuste de compras" }
      ]
    },
    {
      id: 1,
      data: "2024-02-05",
      valor: "R$ 199,50",
      status: "finalizado",
      pratos: [
        { nome: "Risotto de Camarão" },
        { nome: "Salmão Grelhado" },
        { nome: "Salada Caesar" }
      ],
      valorChef: "R$ 80,00",
      valorCompras: "R$ 94,50",
      valorTotal: "R$ 199,50",
      cartao: { bandeira: "visa", ultimos4: "1234" },
      comprovanteMercado: true,
      lancamentos: [
        { data: "2024-02-05", tipo: "cobranca", valor: "R$ 199,50", descricao: "Cobrança da ordem de cozinha" }
      ]
    }
  ];

  const toggleOrderExpansion = (orderId: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    return status === "finalizado" ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <PlayCircle className="h-4 w-4 text-blue-600" />
    );
  };

  const getBandeiraIcon = (bandeira: string) => {
    switch (bandeira) {
      case "visa":
        return <img src={visaIcon} alt="Visa" className="h-3 w-3 object-contain" />;
      case "mastercard":
        return <img src={mastercardIcon} alt="Mastercard" className="h-3 w-3 object-contain" />;
      default:
        return <img src={visaIcon} alt="Cartão" className="h-3 w-3 object-contain" />;
    }
  };

  const renderStars = (rating: number, onClick?: (star: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 cursor-pointer transition-colors ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
              }`}
            onClick={() => onClick && onClick(star)}
          />
        ))}
      </div>
    );
  };

  const handleAvaliar = (orderId: number) => {
    if (novaAvaliacao.rating === 0) {
      toast({
        title: "Avaliação incompleta",
        description: "Por favor, selecione uma nota de 1 a 5 estrelas.",
        variant: "destructive",
      });
      return;
    }

    setAvaliacoes(prev => ({
      ...prev,
      [orderId]: { ...novaAvaliacao }
    }));

    setNovaAvaliacao({ rating: 0, comentario: "" });
    setAvaliacaoAberta(null);

    toast({
      title: "Avaliação enviada!",
      description: "Obrigado pelo seu feedback.",
    });
  };

  const handleCancelarServico = () => {
    toast({
      title: "Solicitação de cancelamento enviada",
      description: "Você receberá um contato do nosso time em até 2 dias úteis.",
    });
  };

  const handleDescartarSemana = () => {
    toast({
      title: "Semana descartada",
      description: "Seu horário foi disponibilizado. Próximo serviço: 15/02/2024",
    });
  };

  const calculateReturnDate = (duration: string): string => {
    const today = new Date();
    let returnDate: Date;

    switch (duration) {
      case "2semanas":
        returnDate = addWeeks(today, 2);
        break;
      case "3semanas":
        returnDate = addWeeks(today, 3);
        break;
      case "1mes":
        returnDate = addMonths(today, 1);
        break;
      case "2meses":
        returnDate = addMonths(today, 2);
        break;
      case "3meses":
        returnDate = addMonths(today, 3);
        break;
      default:
        returnDate = today;
    }

    return format(returnDate, "dd/MM/yyyy", { locale: ptBR });
  };

  const handleConfirmPause = () => {
    const returnDate = calculateReturnDate(pauseDuration);
    setPauseModalOpen(false);
    setPauseDuration("");

    toast({
      title: "Serviço pausado com sucesso",
      description: `Seu serviço foi pausado. Retorno previsto para ${returnDate}.`,
    });
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <AppHeader />

      <div className="container mx-auto px-4 py-6">
        {/* Título da página */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/meus-contratos")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-black">Detalhes do contrato</h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Informações do Contrato */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {contrato.tipo === "meal-prep" && (
                    <>
                      <ChefHat className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-green-600">{contrato.titulo}</CardTitle>
                    </>
                  )}
                  {contrato.tipo === "evento" && (
                    <>
                      <PartyPopper className="h-5 w-5 text-purple-600" />
                      <CardTitle className="text-purple-600">{contrato.titulo}</CardTitle>
                    </>
                  )}
                  {contrato.tipo === "especial" && (
                    <>
                      <Users className="h-5 w-5 text-orange-600" />
                      <CardTitle className="text-orange-600">{contrato.titulo}</CardTitle>
                    </>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500">Referência: #{contrato.id}</div>
            </CardHeader>
            <CardContent className="space-y-4">
              {contrato.tipo === "meal-prep" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Porção</p>
                    <p className="font-medium">{contrato.porção}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Dia</p>
                    <p className="font-medium">{contrato.dia}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Valor semanal</p>
                    <p className="font-medium">R$ {contrato.valorSemanal?.toFixed(2)}</p>
                  </div>
                </div>
              )}

              {contrato.tipo === "evento" && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Data</p>
                      <p className="font-medium">{new Date(contrato.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Menu</p>
                      <p className="font-medium">{contrato.menu}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tipo</p>
                      <p className="font-medium">{contrato.tipoMenu}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pessoas</p>
                      <p className="font-medium">{contrato.pessoas}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Valor estimado</p>
                    <p className="font-medium">R$ {contrato.valor.toFixed(2)}</p>
                  </div>
                </>
              )}

              {contrato.tipo === "especial" && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Data solicitada</p>
                      <p className="font-medium">{new Date(contrato.dataSolicitada).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Nº de pessoas</p>
                      <p className="font-medium">{contrato.pessoas}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Valor</p>
                      <p className="font-medium">R$ {contrato.valor.toFixed(2)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Preferências</p>
                    <p className="font-medium">{contrato.preferencias}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{contrato.endereco}</p>
            </CardContent>
          </Card>

          {/* Informações do Chef - Posição condicional */}
          {contrato.tipo !== "especial" && (
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${contrato.tipo === "meal-prep" ? "text-green-600" :
                  contrato.tipo === "evento" ? "text-purple-600" : "text-orange-600"
                  }`}>
                  <ChefHat className="h-4 w-4" />
                  Seu Chef
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={chef.foto} />
                    <AvatarFallback>RS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{chef.nome}</h3>
                    <p className="text-gray-600 text-sm">{chef.especialidade}</p>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <MessageCircle className="h-4 w-4" />
                        {chef.telefone}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Boxes específicos para serviços especiais */}
          {contrato.tipo === "especial" && (
            <>
              {/* Suas Necessidades */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Suas Necessidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">
                    Para este evento especial, você solicitou um serviço completo incluindo garçons e bartender especializados.
                    Precisa de profissionais para servir drinks e coquetéis durante 8 horas de evento,
                    garantindo uma experiência diferenciada para seus convidados.
                  </p>
                </CardContent>
              </Card>

              {/* Proposta de Serviço */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Proposta de Serviço
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-800">Serviços inclusos:</h4>
                    <div className="space-y-0 rounded border border-gray-200 overflow-hidden">
                      <div className="px-3 py-2 bg-white flex justify-between items-center text-sm">
                        <span className="text-gray-700">5 Garçons profissionais</span>
                        <span className="text-gray-900">8 horas</span>
                      </div>
                      <div className="px-3 py-2 bg-gray-50 flex justify-between items-center text-sm">
                        <span className="text-gray-700">500 Drinks variados</span>
                        <span className="text-gray-900">Inclusos</span>
                      </div>
                      <div className="px-3 py-2 bg-white flex justify-between items-center text-sm">
                        <span className="text-gray-700">2 Especialistas em drinks</span>
                        <span className="text-gray-900">8 horas</span>
                      </div>
                      <div className="px-3 py-2 bg-gray-50 flex justify-between items-center text-sm">
                        <span className="text-gray-700">Material completo (copos, utensílios)</span>
                        <span className="text-gray-900">Inclusos</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" size="lg">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pagar Agora - R$ {contrato.valor.toFixed(2)}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Informações do Chef para Serviços Especiais - Movido para cá */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <ChefHat className="h-4 w-4" />
                    Seu Chef
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <ChefHat className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-500 text-sm">Em breve você receberá informações sobre seu chef.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Botões de Ação - Condicionais por tipo de contrato */}
          {contrato.tipo === "meal-prep" && (
            <div className="grid grid-cols-2 gap-4">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                variant="default"
                onClick={() => navigate("/contratacao-logado", {
                  state: {
                    fromDashboard: true,
                    goToStep3: true,
                    prefilledData: {
                      cidade: "São Paulo",
                      tipoServico: "cozinha-semanal",
                      tamanhoPortacao: "pequena",
                      categorias: [],
                      preferencias: [],
                      ingredientes: [],
                      tiposCozinha: [],
                      diaSemana: "Segunda-feira",
                      periodo: "Tarde"
                    }
                  }
                })}
              >
                <Utensils className="h-4 w-4 mr-2" />
                Selecionar Pratos da Semana
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Pular Semana
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Descartar esta semana?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Se você desistir dessa semana, seu horário será disponibilizado para outro cliente.
                      A próxima data de serviço será <strong>15/02/2024</strong>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDescartarSemana}>
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Dialog open={pauseModalOpen} onOpenChange={setPauseModalOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    <PauseCircle className="h-4 w-4 mr-2" />
                    Pausar Serviço
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Pausar Serviço</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">
                        <strong>Atenção:</strong> Ao pausar o serviço, o dia e período que hoje são seus
                        serão disponibilizados para outro cliente.
                      </p>
                      <p>
                        Caso você reative o serviço e o horário já tenha sido ocupado por outro cliente,
                        você precisará escolher outro dia da semana para ser atendido pelos chefs.
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Por quanto tempo deseja pausar?
                      </label>
                      <Select value={pauseDuration} onValueChange={setPauseDuration}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2semanas">2 Semanas</SelectItem>
                          <SelectItem value="3semanas">3 Semanas</SelectItem>
                          <SelectItem value="1mes">1 Mês</SelectItem>
                          <SelectItem value="2meses">2 Meses</SelectItem>
                          <SelectItem value="3meses">3 Meses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {pauseDuration && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Sua próxima data será:</strong> {calculateReturnDate(pauseDuration)}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setPauseModalOpen(false);
                          setPauseDuration("");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleConfirmPause}
                        disabled={!pauseDuration}
                      >
                        Confirmar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button className="w-full" variant="secondary">
                <MessageCircle className="h-4 w-4 mr-2" />
                Solicitar Ajuda
              </Button>
            </div>
          )}

          {contrato.tipo === "evento" && (
            <div className="flex justify-center">
              <Button className="w-full max-w-md" variant="secondary">
                <MessageCircle className="h-4 w-4 mr-2" />
                Solicitar Ajuda
              </Button>
            </div>
          )}

          {contrato.tipo === "especial" && (
            <div className="flex justify-center">
              <Button className="w-full max-w-md" variant="secondary">
                <MessageCircle className="h-4 w-4 mr-2" />
                Solicitar Ajuda
              </Button>
            </div>
          )}

          {/* Ordens de Cozinha - Para meal-prep e evento */}
          {(contrato.tipo === "meal-prep" || contrato.tipo === "evento") && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Ordens de Cozinha
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(contrato.tipo === "evento" ? ordensServico.slice(0, 1) : ordensServico.slice(0, ordensVisiveis)).map((ordem) => (
                  <div key={ordem.id} className="border border-gray-200 rounded-lg p-2">
                    <Collapsible>
                      <CollapsibleTrigger
                        className="flex items-center justify-between w-full cursor-pointer"
                        onClick={() => toggleOrderExpansion(ordem.id)}
                      >
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ordem.status)}
                          <div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-500" />
                              <p className="text-sm font-medium">
                                {new Date(ordem.data).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <DollarSign className="h-3 w-3 text-gray-500" />
                              <p className="text-xs text-gray-600">{ordem.valor}</p>
                            </div>
                          </div>
                        </div>
                        {expandedOrders.has(ordem.id) ?
                          <ChevronUp className="h-4 w-4" /> :
                          <ChevronDown className="h-4 w-4" />
                        }
                      </CollapsibleTrigger>

                      <CollapsibleContent className="mt-2 pt-2 border-t border-gray-100">
                        <div className="space-y-3">
                          {/* Lista de Pratos */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-800 mb-2">Pratos Selecionados:</h4>
                            <div className="space-y-0 rounded border border-gray-200 overflow-hidden">
                              {ordem.pratos.map((prato, index) => (
                                <div
                                  key={index}
                                  className={`px-2 py-1.5 text-xs ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    }`}
                                >
                                  {prato.nome}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Resumo de Valores */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-800 mb-2">Resumo:</h4>
                            <div className="rounded border border-gray-200 overflow-hidden">
                              <div className="px-2 py-1.5 bg-white flex justify-between items-center text-xs">
                                <span className="text-gray-700">Valor do Chef:</span>
                                <span className="text-gray-900">{ordem.valorChef}</span>
                              </div>
                              <div className="px-2 py-1.5 bg-gray-50 flex justify-between items-center text-xs">
                                <span className="text-gray-700">Compras:</span>
                                <div className="flex items-center gap-2">
                                  {ordem.comprovanteMercado && (
                                    <Receipt
                                      className="h-4 w-4 text-blue-500 cursor-pointer"
                                      onClick={() => toast({ title: "Comprovante de compras", description: "Abrindo comprovante..." })}
                                    />
                                  )}
                                  <span className="text-gray-900">{ordem.valorCompras}</span>
                                </div>
                              </div>
                              <div className="px-2 py-1.5 bg-white flex justify-between items-center text-xs border-t border-gray-300">
                                <span className="text-gray-800">Valor Total:</span>
                                <span className="text-gray-900">{ordem.valorTotal}</span>
                              </div>
                            </div>
                          </div>

                          {/* Lançamentos no Cartão */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-sm font-bold text-gray-800">Lançamentos no Cartão</h4>
                              <div className="flex items-center gap-1">
                                {getBandeiraIcon(ordem.cartao.bandeira)}
                                <span className="text-xs text-gray-600">{ordem.cartao.ultimos4}</span>
                              </div>
                            </div>
                            <div className="rounded border border-gray-200 overflow-hidden">
                              {ordem.lancamentos.map((lancamento, index) => (
                                <div
                                  key={index}
                                  className={`px-2 py-2 text-xs ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                    }`}
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3 text-gray-500" />
                                      <span className="text-gray-700">
                                        {new Date(lancamento.data).toLocaleDateString('pt-BR')}
                                      </span>
                                    </div>
                                    <span className={`text-xs ${lancamento.tipo === 'estorno' ? 'text-green-600' : 'text-gray-900'
                                      }`}>
                                      {lancamento.tipo === 'estorno' ? '+' : ''}{lancamento.valor}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-600 ml-4">
                                    {lancamento.descricao}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Avaliação */}
                          <div className="pt-2 border-gray-200">
                            {avaliacoes[ordem.id] ? (
                              <div>
                                <h4 className="text-sm font-bold text-gray-800">Sua Avaliação:</h4>
                                {renderStars(avaliacoes[ordem.id].rating)}
                                {avaliacoes[ordem.id].comentario && (
                                  <p className="text-xs text-gray-600 mt-2">"{avaliacoes[ordem.id].comentario}"</p>
                                )}
                              </div>
                            ) : ordem.status === "finalizado" ? (
                              <div>
                                {avaliacaoAberta === ordem.id ? (
                                  <div className="space-y-2">
                                    <div>
                                      <p className="text-sm font-bold text-gray-800 mb-2">Avalie este serviço:</p>
                                      {renderStars(novaAvaliacao.rating, (star) =>
                                        setNovaAvaliacao(prev => ({ ...prev, rating: star }))
                                      )}
                                    </div>
                                    <Textarea
                                      placeholder="Deixe seu comentário (opcional)"
                                      value={novaAvaliacao.comentario}
                                      onChange={(e) => setNovaAvaliacao(prev => ({
                                        ...prev, comentario: e.target.value
                                      }))}
                                      className="min-h-16 text-xs"
                                    />
                                    <div className="flex gap-2">
                                      <Button size="sm" className="text-xs" onClick={() => handleAvaliar(ordem.id)}>
                                        Enviar Avaliação
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-xs"
                                        onClick={() => setAvaliacaoAberta(null)}>
                                        Cancelar
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <Button size="sm" variant="outline" className="text-xs"
                                    onClick={() => setAvaliacaoAberta(ordem.id)}>
                                    <Star className="h-3 w-3 mr-1" />
                                    Avaliar Serviço
                                  </Button>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ))}

                {contrato.tipo === "meal-prep" && ordensVisiveis < ordensServico.length && (
                  <div className="flex justify-center pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setOrdensVisiveis(prev => prev + 10)}
                    >
                      Ver mais
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Cancelar Serviço */}
          <div className="flex justify-center">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full max-w-md border-red-500 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Cancelar Serviço
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Não queremos que você vá
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>Ficamos tristes em saber que você quer cancelar o serviço.</p>
                    <p>Tem certeza de que deseja prosseguir com o cancelamento? Nossa equipe entrará em contato para entender melhor suas necessidades.</p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continuar com o Serviço</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelarServico}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sim, Cancelar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalheContrato;
