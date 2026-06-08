import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ChefHat,
  Clock,
  MapPin,
  Users,
  Check,
  X,
  Eye,
  ChevronLeft,
  User,
  Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ChefMenu } from "@/components/ChefMenu";
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
  updateKitchenOrderStatus,
  type KitchenOrder,
} from "@/services/kitchenOrderService";

const AprovacoesChef = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for actions
  const [isAccepting, setIsAccepting] = useState<number | null>(null);
  const [declineOrderId, setDeclineOrderId] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [isDeclining, setIsDeclining] = useState(false);

  const session = useMemo(() => loadSession(), []);
  const token = session?.token;
  const user = session?.user as any;
  const chefUserId = user?.id;
  const chefProfileId = user?.usuario_chef?.id ?? user?.chef?.id;

  const loadPendingOrders = () => {
    if (!token) return;
    setIsLoading(true);
    listKitchenOrders({ token })
      .then((data) => {
        const orders = Array.isArray(data)
          ? data
          : (data as { data?: unknown })?.data ?? (data as { orders?: unknown })?.orders;

        if (Array.isArray(orders)) {
          // Filter by current chef and status 'pendente'
          const filtered = (orders as KitchenOrder[]).filter((order) => {
            const orderChefId = (order.chef as { id?: number } | null)?.id;
            const matchesChef = Number(orderChefId) === Number(chefUserId) || Number(orderChefId) === Number(chefProfileId);
            const status = normalizeKitchenOrderStatusLabel(order);
            return matchesChef && status === "pendente";
          });
          setKitchenOrders(filtered);
        }
      })
      .catch((err) => {
        console.error("Falha ao carregar pedidos pendentes:", err);
        toast({
          variant: "destructive",
          title: "Erro ao carregar aprovações",
          description: "Tente novamente em instantes.",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    loadPendingOrders();
  }, [token]);

  const handleAccept = async (orderId: number) => {
    if (!token) return;
    setIsAccepting(orderId);
    try {
      await updateKitchenOrderStatus({
        token,
        id: orderId,
        status: "CONFIRMED",
      });
      toast({
        title: "Serviço aceito!",
        description: "A ordem de cozinha foi aceita e movida para seus serviços confirmados.",
      });
      loadPendingOrders();
    } catch (error) {
      console.error("Erro ao aceitar ordem:", error);
      toast({
        variant: "destructive",
        title: "Erro ao aceitar serviço",
        description: "Ocorreu um problema ao confirmar a ordem.",
      });
    } finally {
      setIsAccepting(null);
    }
  };

  const handleDecline = async () => {
    if (!token || declineOrderId === null) return;
    if (!declineReason.trim()) {
      toast({
        variant: "destructive",
        title: "Justificativa obrigatória",
        description: "Por favor, explique o motivo da recusa.",
      });
      return;
    }

    setIsDeclining(true);
    try {
      await updateKitchenOrderStatus({
        token,
        id: declineOrderId,
        status: "DECLINED",
      });
      toast({
        title: "Serviço recusado",
        description: "A ordem foi recusada e enviada de volta para redistribuição.",
      });
      setDeclineOrderId(null);
      setDeclineReason("");
      loadPendingOrders();
    } catch (error) {
      console.error("Erro ao recusar ordem:", error);
      toast({
        variant: "destructive",
        title: "Erro ao recusar serviço",
        description: "Ocorreu um problema ao recusar a ordem.",
      });
    } finally {
      setIsDeclining(false);
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case "Cozinha Semanal":
        return "bg-green-500";
      case "Evento":
        return "bg-purple-500";
      case "Serviço Especial":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "Cozinha Semanal":
        return ChefHat;
      case "Evento":
        return Calendar;
      case "Serviço Especial":
        return Clock;
      default:
        return ChefHat;
    }
  };

  // Mask function for phone and location (address)
  const maskAddress = (location: string) => {
    const parts = location.split("-");
    const cityState = parts[parts.length - 1] || "";
    return `Bairro oculto - ${cityState.trim()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <ChefMenu activeItem="aprovacoes" />

      <main className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard-chef')}
            className="text-gray-600 hover:text-gray-900 p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aprovações Pendentes</h1>
            <p className="text-gray-600">Serviços que aguardam seu aceite ou recusa</p>
          </div>
        </div>

        {/* List of Pending Orders */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <p>Carregando aprovações...</p>
          </div>
        ) : kitchenOrders.length === 0 ? (
          <Card className="border border-gray-200">
            <CardContent className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <Inbox className="w-12 h-12 text-gray-400" />
              <h3 className="font-semibold text-lg text-gray-800">Tudo limpo por aqui!</h3>
              <p className="text-sm text-gray-600">Nenhum serviço pendente de aprovação no momento.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {kitchenOrders.map((order) => {
              const code = getKitchenOrderCode(order);
              const type = normalizeKitchenOrderTypeLabel(order);
              const dateObj = getKitchenOrderDate(order);
              const dateStr = dateObj ? dateObj.toLocaleDateString('pt-BR') : "";
              const timeStr = getKitchenOrderTime(order);
              const locationStr = getKitchenOrderLocation(order) || "";
              const client = getKitchenOrderClient(order);
              const people = (order.people_quantity as number) || 1;
              const IconComponent = getServiceIcon(type);

              return (
                <Card key={order.id as number} className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-10 h-10 ${getServiceColor(type)} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{type}</span>
                          <span className="text-xs text-gray-500 font-normal">#{code}</span>
                        </div>

                        <div className="text-sm text-gray-600 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                            <span>{dateStr} às {timeStr}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-gray-500" />
                            <span>{people} {people === 1 ? "pessoa" : "pessoas"}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-500" />
                            <span className="truncate">{maskAddress(locationStr)}</span>
                          </div>
                        </div>

                        {/* Client name with avatar */}
                        <div className="flex items-center gap-2 pt-2 border-t mt-2">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            {client.photo ? (
                              <img src={client.photo} alt={client.name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <span className="text-xs font-medium text-gray-800">{client.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col gap-2 flex-wrap items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 md:w-full"
                        onClick={() => navigate(`/servico-detalhes/${code}`)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Detalhes
                      </Button>

                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white flex-1 md:w-full"
                        onClick={() => handleAccept(order.id as number)}
                        disabled={isAccepting !== null}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {isAccepting === order.id ? "Aceitando..." : "Aceitar"}
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1 md:w-full"
                        onClick={() => setDeclineOrderId(order.id as number)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Recusar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Rejection Justification Dialog */}
      <Dialog open={declineOrderId !== null} onOpenChange={(open) => !open && setDeclineOrderId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Recusar Ordem de Cozinha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="reason">Justificativa da Recusa</Label>
              <Textarea
                id="reason"
                placeholder="Por favor, nos informe o motivo da recusa (indisponibilidade, distância, etc)..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setDeclineOrderId(null);
                setDeclineReason("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDecline}
              disabled={isDeclining}
            >
              {isDeclining ? "Recusando..." : "Confirmar Recusa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AprovacoesChef;
