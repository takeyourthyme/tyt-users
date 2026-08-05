import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  ChefHat,
  Clock,
  MapPin,
  UtensilsCrossed,
  DollarSign,
  MessageCircle,
  LogOut,
  Menu,
  ChevronLeft,
  Phone,
  Mail,
  User,
  FileText,
  ExternalLink,
  Eye,
  CheckCircle,
  PlayCircle,
  Edit,
  BookOpen,
  Utensils,
  Martini,
  PartyPopper
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo } from "react";
import { loadSession } from "@/services/authService";
import { getUserPhotoUrl } from "@/services/userService";
import {
  getKitchenOrderClient,
  getKitchenOrderDate,
  getKitchenOrderLocation,
  getKitchenOrderTime,
  getKitchenOrderByCode,
  normalizeKitchenOrderStatusLabel,
  normalizeKitchenOrderTypeLabel,
  getKitchenOrderCode,
  type KitchenOrder,
} from "@/services/kitchenOrderService";
import { ChefMenu } from "@/components/ChefMenu";
import Footer from "@/components/Footer";
import { normalizeDish, type Dish } from "@/services/dishService";

const ServicoDetalhes = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [kitchenOrder, setKitchenOrder] = useState<KitchenOrder | null>(null);

  useEffect(() => {
    const session = loadSession();
    if (!session?.token || !id) {
      setIsLoading(false);
      return;
    }
    getKitchenOrderByCode({ token: session.token, code: id, fetchFallbackServiceValue: true })
      .then((res) => {
        if (res && typeof res === "object") {
          const order = (res as any).data && typeof (res as any).data === "object" && !Array.isArray((res as any).data)
            ? (res as any).data
            : res;

          if (order && typeof order === "object" && !Array.isArray(order)) {
            setKitchenOrder(order as KitchenOrder);
          }
        }
      })
      .catch(() => { })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const servico = useMemo(() => {
    if (!kitchenOrder) return null;
    const type = normalizeKitchenOrderTypeLabel(kitchenOrder);
    const dateObj = getKitchenOrderDate(kitchenOrder);
    const date = dateObj ? dateObj.toISOString() : new Date().toISOString();
    const time = getKitchenOrderTime(kitchenOrder);
    const client = getKitchenOrderClient(kitchenOrder);
    const status = normalizeKitchenOrderStatusLabel(kitchenOrder);
    const address = getKitchenOrderLocation(kitchenOrder);

    return {
      id: (kitchenOrder.id as string | number) || id,
      code: getKitchenOrderCode(kitchenOrder),
      type,
      client: {
        ...client,
        phone: (kitchenOrder.client_phone as string) || (kitchenOrder.cliente as any)?.whatsapp || (kitchenOrder.cliente as any)?.phone || "(11) 99999-9999",
        email: (kitchenOrder.client_email as string) || (kitchenOrder.cliente as any)?.email || "cliente@email.com",
        address: address,
      },
      startDate: date,
      endDate: date,
      frequency: "Sessão Unica",
      time: time,
      duration: "3h",
      status: status,
      nextSession: date,
      totalSessions: 1,
      completedSessions: status === 'concluido' ? 1 : 0,
      remainingSessions: status === 'concluido' ? 0 : 1,
      monthlyValue: ((kitchenOrder as any)?.chef_amount ?? (kitchenOrder as any)?.chefAmount ?? (kitchenOrder as any)?.chef_value ?? (kitchenOrder as any)?.valor_chef ?? kitchenOrder.service_value ?? (kitchenOrder as any)?.serviceValue)
        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number((kitchenOrder as any)?.chef_amount ?? (kitchenOrder as any)?.chefAmount ?? (kitchenOrder as any)?.chef_value ?? (kitchenOrder as any)?.valor_chef ?? kitchenOrder.service_value ?? (kitchenOrder as any)?.serviceValue) * 4)
        : "—",
      sessionValue: ((kitchenOrder as any)?.chef_amount ?? (kitchenOrder as any)?.chefAmount ?? (kitchenOrder as any)?.chef_value ?? (kitchenOrder as any)?.valor_chef ?? kitchenOrder.service_value ?? (kitchenOrder as any)?.serviceValue)
        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number((kitchenOrder as any)?.chef_amount ?? (kitchenOrder as any)?.chefAmount ?? (kitchenOrder as any)?.chef_value ?? (kitchenOrder as any)?.valor_chef ?? kitchenOrder.service_value ?? (kitchenOrder as any)?.serviceValue))
        : "—"
    };
  }, [kitchenOrder, id]);

  const ordensServico = useMemo(() => {
    if (!kitchenOrder) return [];

    const serviceValueRaw = (kitchenOrder as any)?.chef_amount ?? (kitchenOrder as any)?.chefAmount ?? (kitchenOrder as any)?.chef_value ?? (kitchenOrder as any)?.valor_chef ?? kitchenOrder.service_value ?? (kitchenOrder as any)?.serviceValue;
    const valorFormatted = serviceValueRaw
      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(serviceValueRaw))
      : "—";

    return [{
      id: getKitchenOrderCode(kitchenOrder) || id,
      data: getKitchenOrderDate(kitchenOrder)?.toISOString() || new Date().toISOString(),
      valor: valorFormatted,
      status: normalizeKitchenOrderStatusLabel(kitchenOrder) === 'concluido' ? "finalizado" : "em_andamento",
      pratos: Array.isArray(kitchenOrder.dishes)
        ? kitchenOrder.dishes.map(d => typeof d === 'object' && d !== null && 'dish' in d ? { nome: normalizeDish(d.dish as Dish).name } : { nome: "Prato" })
        : [{ nome: "Menu Personalizado" }]
    }];
  }, [kitchenOrder, id]);

  if (isLoading) {
    return <div className="min-h-screen bg-background pt-20 flex items-center justify-center">Carregando...</div>;
  }

  if (!servico) {
    return <div className="min-h-screen bg-background pt-20 flex items-center justify-center">Serviço não encontrado</div>;
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "Meal Prep":
        return Utensils;
      case "Get Together":
        return Martini;
      case "Special Service":
        return PartyPopper;
      default:
        return Utensils;
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case "Meal Prep":
        return "bg-[#EF3F0D]";
      case "Get Together":
        return "bg-[#BC008F]";
      case "Special Service":
        return "bg-[#89CDD2]";
      default:
        return "bg-[#EF3F0D]";
    }
  };

  const IconComponent = getServiceIcon(servico.type);

  return (
    <div className="min-h-screen flex flex-col bg-background pt-20">
      {/* Chef AppBar */}
      <ChefMenu activeItem="servicos-ativos" />

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-6 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/servicos-ativos')}
            className="text-gray-600 hover:text-gray-900 p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-light text-gray-900">Detalhes do Serviço</h1>
            <p className="text-gray-600">Informações completas do contrato</p>
          </div>
        </div>

        {/* Service Details */}
        <div className="space-y-6">
          {/* Service Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-10 h-10 ${getServiceColor(servico.type)} rounded-full flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span>{servico.type}</span>
                  <p className="text-sm text-gray-600 font-normal">Contrato #{servico.code}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Cronograma</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>Próximo: {new Date(servico.nextSession).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{servico.frequency}{servico.time ? ` às ${servico.time}` : ''}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <span>{servico.client.address}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Valores</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Por sessão:</span>
                      <span className="font-medium">{servico.sessionValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mensal:</span>
                      <span className="font-medium text-green-600">{servico.monthlyValue}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-start gap-4">
                <img
                  src={servico.client.photo}
                  alt={servico.client.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-light text-lg">{servico.client.name}</h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${servico.client.phone}`} className="hover:text-blue-600">
                        {servico.client.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${servico.client.email}`} className="hover:text-blue-600">
                        {servico.client.email}
                      </a>
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>{servico.client.address}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop buttons - side by side */}
                <div className="hidden md:flex flex-col gap-2">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(servico.client.address)}`, '_blank')}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Abrir no Google Maps
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => window.open(`https://wa.me/55${servico.client.phone.replace(/\D/g, '')}`, '_blank')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enviar mensagem
                  </Button>
                  <Button
                    variant="outline"
                    className="text-gray-600 border-gray-300 hover:bg-gray-50"
                    onClick={() => window.open(`tel:${servico.client.phone}`, '_self')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Ligar
                  </Button>
                </div>
              </div>

              {/* Mobile buttons - stacked below */}
              <div className="md:hidden flex flex-col gap-2 mt-4">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(servico.client.address)}`, '_blank')}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Abrir no Google Maps
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                  onClick={() => window.open(`https://wa.me/55${servico.client.phone.replace(/\D/g, '')}`, '_blank')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar mensagem
                </Button>
                <Button
                  variant="outline"
                  className="text-gray-600 border-gray-300 hover:bg-gray-50 w-full"
                  onClick={() => window.open(`tel:${servico.client.phone}`, '_self')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Ligar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Kitchen Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5" />
                Ordens de Cozinha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ordensServico.map((ordem) => (
                  <div
                    key={ordem.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center">
                        {ordem.status === "finalizado" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <PlayCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {new Date(ordem.data).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-sm text-green-600 font-medium">
                            {ordem.valor}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {ordem.pratos.map(prato => prato.nome).join(', ')}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/ordem-de-cozinha/${ordem.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServicoDetalhes;