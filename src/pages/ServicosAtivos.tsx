import { useNavigate } from "react-router-dom";
import { Calendar, ChefHat, Clock, MapPin, UtensilsCrossed, ChevronLeft, Eye, User, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { loadSession } from "@/services/authService";
import {
  getKitchenOrderClient,
  getKitchenOrderDate,
  getKitchenOrderLocation,
  getKitchenOrderTime,
  listKitchenOrders,
  normalizeKitchenOrderStatusLabel,
  normalizeKitchenOrderTypeLabel,
  getKitchenOrderCode,
  getKitchenOrderByCode,
  type KitchenOrder,
} from "@/services/kitchenOrderService";
import { getUserPhotoUrl } from "@/services/userService";
import { ChefMenu } from "@/components/ChefMenu";
const ServicosAtivos = () => {
  const navigate = useNavigate();

  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);

  useEffect(() => {
    const session = loadSession();
    if (!session?.token) return;
    listKitchenOrders({ token: session.token })
      .then(async (data) => {
        const orders = Array.isArray(data)
          ? data
          : (data as { data?: unknown })?.data ?? (data as { orders?: unknown })?.orders;
        if (Array.isArray(orders)) {

          const chefUserId = session.userId ?? (session.user as any)?.id;
          const chefProfileId = (session.user as any)?.usuario_chef?.id ?? (session.user as any)?.chef?.id;
          const filtered = (orders as KitchenOrder[]).filter((order) => {
            const orderChefId = (order.chef as { id?: number } | null)?.id;
            return Number(orderChefId) === Number(chefUserId) || Number(orderChefId) === Number(chefProfileId);
          });

          const detailedOrders = await Promise.all(
            filtered.map(async (order) => {
              try {
                const code = getKitchenOrderCode(order);
                const detail = await getKitchenOrderByCode({ token: session.token!, code });
                const detailData = (detail as any).data ?? detail;
                return {
                  ...order,
                  ...detailData,
                  service_value: (detailData.service_value !== undefined && detailData.service_value !== null && Number(detailData.service_value) !== 0)
                    ? detailData.service_value
                    : (order.service_value ?? (order as any).serviceValue ?? detailData.service_value)
                } as KitchenOrder;
              } catch (e) {
                return order;
              }
            })
          );
          setKitchenOrders(detailedOrders);
        }
      })
      .catch(() => { });
  }, []);

  const servicosAtivos = useMemo(() => {
    return kitchenOrders
      .map((order) => {
        const id = getKitchenOrderCode(order);
        const dateObj = getKitchenOrderDate(order);
        const nextSession = dateObj ? dateObj.toISOString() : new Date().toISOString();
        const time = getKitchenOrderTime(order);
        const client = getKitchenOrderClient(order);
        const type = normalizeKitchenOrderTypeLabel(order);
        const status = normalizeKitchenOrderStatusLabel(order);
        const location = getKitchenOrderLocation(order) || "—";
        const frequency = "Sessão";

        const serviceValueRaw = order.service_value ?? (order as any).serviceValue;

        const serviceValue = serviceValueRaw
          ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(serviceValueRaw))
          : "—";

        return {
          id,
          type,
          client,
          startDate: nextSession,
          endDate: nextSession,
          frequency,
          time,
          location,
          status,
          nextSession,
          serviceValue,
        };
      })
      .filter((item) => Boolean(item.id) && (item.status === "confirmado" || item.status === "pendente"));
  }, [kitchenOrders]);
  const getServiceIcon = (type: string) => {
    switch (type) {
      case "Meal Prep":
        return ChefHat;
      case "Get Together":
        return Calendar;
      case "Special Service":
        return Clock;
      default:
        return ChefHat;
    }
  };
  const getServiceColor = (type: string) => {
    switch (type) {
      case "Meal Prep":
        return "bg-green-500";
      case "Get Together":
        return "bg-purple-500";
      case "Special Service":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "em-andamento":
        return "bg-blue-100 text-blue-800";
      case "confirmado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "em-andamento":
        return "Em Andamento";
      case "confirmado":
        return "Confirmado";
      default:
        return status;
    }
  };
  return <div className="min-h-screen bg-gray-50 pt-20">
    {/* Chef AppBar */}
    <ChefMenu activeItem="servicos-ativos" />

    {/* Main Content */}
    <main className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard-chef')} className="text-gray-600 hover:text-gray-900 p-2">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-light text-gray-900">Serviços Ativos</h1>
          <p className="text-gray-600">Acompanhe os serviços semanais fixos aqui.</p>
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {servicosAtivos.map(servico => {
          const IconComponent = getServiceIcon(servico.type);
          return <Card key={servico.id} className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/servico-detalhes/${servico.id}`)}>
            <CardContent className="p-4">
              {/* Desktop Layout */}
              <div className="hidden md:flex items-start justify-between gap-3">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 ${getServiceColor(servico.type)} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800">{servico.type}</span>
                      <span className="text-xs text-gray-500 font-normal bg-gray-100 px-1.5 py-0.5 rounded">#{servico.id}</span>
                      <Badge className={cn("pointer-events-none", getStatusColor(servico.status))}>
                        {getStatusLabel(servico.status)}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Próximo: {new Date(servico.nextSession).toLocaleDateString('pt-BR')}{servico.time ? ` às ${servico.time}` : ''}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {servico.frequency}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {servico.location}
                      </div>
                      <div className="flex items-center gap-1 text-green-700 font-medium">
                        <DollarSign className="w-3 h-3" />
                        Valor: {servico.serviceValue}
                      </div>
                    </div>
                  </div>

                  {/* Client info on desktop */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <img src={servico.client.photo} alt={servico.client.name} className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-sm text-gray-700 font-medium">{servico.client.name}</span>
                  </div>
                </div>

                {/* Desktop: Icon only */}
                <Button
                  size="sm"
                  variant="outline"
                  className="p-2 h-8 w-8 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/servico-detalhes/${servico.id}`);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-10 h-10 ${getServiceColor(servico.type)} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800">{servico.type}</span>
                      <span className="text-xs text-gray-500 font-normal bg-gray-100 px-1.5 py-0.5 rounded">#{servico.id}</span>
                      <Badge className={cn("pointer-events-none", getStatusColor(servico.status))}>
                        {getStatusLabel(servico.status)}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Próximo: {new Date(servico.nextSession).toLocaleDateString('pt-BR')}{servico.time ? ` às ${servico.time}` : ''}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {servico.frequency}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {servico.location}
                      </div>
                      <div className="flex items-center gap-1 text-green-700 font-medium">
                        <DollarSign className="w-3 h-3" />
                        Valor: {servico.serviceValue}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client info below on mobile */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={servico.client.photo} alt={servico.client.name} className="w-7 h-7 rounded-full object-cover" />
                    <span className="text-sm text-gray-700 font-medium">{servico.client.name}</span>
                  </div>

                  {/* Mobile: Button with text */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-3 py-1 h-auto text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/servico-detalhes/${servico.id}`);
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    VER DETALHES
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>;
        })}
      </div>
    </main>
  </div>;
};
export default ServicosAtivos;