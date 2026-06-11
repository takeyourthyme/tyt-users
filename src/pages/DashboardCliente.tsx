import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, CheckCircle, AlertCircle, ChefHat, Calendar, UtensilsCrossed, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppMenu } from "@/components/AppMenu";
import { Skeleton } from "@/components/ui/skeleton";
import { loadSession } from "@/services/authService";
import { getUserById } from "@/services/userService";
import {
  getKitchenOrderByCode,
  getKitchenOrderDate,
  getKitchenOrderLocation,
  getKitchenOrderTime,
  listKitchenOrders,
  normalizeKitchenOrderStatusLabel,
  normalizeKitchenOrderTypeLabel,
  type KitchenOrder,
} from "@/services/kitchenOrderService";

const getUserPhotoUrl = (user?: Record<string, unknown>) => {
  if (!user) return undefined;
  const candidates = [user.foto_url, user.fotoUrl, user.photoUrl, user.foto, user.photo];
  const raw = candidates.find((value) => typeof value === "string") as string | undefined;
  if (!raw) return undefined;
  return raw.trim().replace(/^[`"' ]+|[`"' ]+$/g, "");
};

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

const typeConfig: Record<
  ReturnType<typeof normalizeKitchenOrderTypeLabel>,
  { title: string; borderClass: string; iconBgClass: string; icon: typeof ChefHat }
> = {
  "Cozinha Semanal": {
    title: "Cozinha Semanal",
    borderClass: "border-[#E1F5EC] border-2 shadow-sm",
    iconBgClass: "bg-[#A6D8B5]",
    icon: ChefHat,
  },
  Evento: {
    title: "Evento",
    borderClass: "border-[#F5E5F0] border-2 shadow-sm",
    iconBgClass: "bg-[#BC008F]",
    icon: Calendar,
  },
  "Serviço Especial": {
    title: "Serviço Especial",
    borderClass: "border-[#E0F2F5] border-2 shadow-sm",
    iconBgClass: "bg-[#89CDD2]",
    icon: Calendar,
  },
};


const DashboardCliente = () => {
  const navigate = useNavigate();
  const [clientUser, setClientUser] = useState<Record<string, unknown> | null>(() => loadSession()?.user ?? null);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeOrdersDetails, setActiveOrdersDetails] = useState<Record<string, KitchenOrder>>({});

  // Function to get greeting based on time
  const getTimeBasedGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return "Excelente dia";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "Boa tarde";
    } else {
      return "Boa noite";
    }
  };

  useEffect(() => {
    const session = loadSession();
    if (!session?.token) return;

    if (session.user) {
      setClientUser(session.user);
      return;
    }

    if (!session.userId) return;
    getUserById({ token: session.token, userId: session.userId })
      .then((data) => {
        if (data && typeof data === "object" && !Array.isArray(data)) {
          setClientUser(data as Record<string, unknown>);
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const session = loadSession();
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    listKitchenOrders({ token: session.token })
      .then((data) => {
        const orders = (() => {
          if (Array.isArray(data)) return data;
          if (data && typeof data === "object") {
            const record = data as Record<string, unknown>;
            const candidates = [record.orders, record.data, record.items, record.results];
            const list = candidates.find((value) => Array.isArray(value));
            if (Array.isArray(list)) return list;
          }
          return undefined;
        })();
        if (Array.isArray(orders)) setKitchenOrders(orders as KitchenOrder[]);
      })
      .catch(() => { })
      .finally(() => setIsLoading(false));
  }, []);

  const clientName = (clientUser?.nome as string | undefined) ?? (clientUser?.name as string | undefined) ?? "Cliente";
  const clientFirstName = clientName.split(" ")[0] ?? "Cliente";
  const clientPhotoUrl = getUserPhotoUrl(clientUser ?? undefined);

  const activeOrders = useMemo(() => {
    return kitchenOrders.filter((order) => {
      const status = normalizeKitchenOrderStatusLabel(order);
      return status === "pendente" || status === "confirmado";
    });
  }, [kitchenOrders]);

  useEffect(() => {
    const session = loadSession();
    if (!session?.token) return;

    activeOrders.forEach((order) => {
      const code = getKitchenOrderCode(order);
      if (!code || activeOrdersDetails[code]) return;

      getKitchenOrderByCode({ token: session.token, code })
        .then((res) => {
          if (res && typeof res === "object") {
            const detail = (res as any).data && typeof (res as any).data === "object" && !Array.isArray((res as any).data)
              ? (res as any).data
              : res;
            if (detail && typeof detail === "object" && !Array.isArray(detail)) {
              setActiveOrdersDetails((prev) => ({
                ...prev,
                [code]: detail as KitchenOrder,
              }));
            }
          }
        })
        .catch(() => { });
    });
  }, [activeOrders, activeOrdersDetails]);

  const activeOrdersByType = useMemo(() => {
    const byType: Partial<Record<ReturnType<typeof normalizeKitchenOrderTypeLabel>, KitchenOrder>> = {};
    activeOrders.forEach((order) => {
      const type = normalizeKitchenOrderTypeLabel(order);
      if (!byType[type]) byType[type] = order;
    });
    return byType;
  }, [activeOrders]);
  return <div className="min-h-screen bg-gray-50 pt-20">
    {/* AppBar */}
    <AppMenu title="Dashboard" user={clientUser} />

    {/* Main Content */}
    <main className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* Welcome Message */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg">
        <div className="flex items-center gap-4">
          {/* Profile Photo */}
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shadow-md flex-shrink-0">
            {clientPhotoUrl ? (
              <img
                src={clientPhotoUrl}
                alt={`Foto de perfil do(a) ${clientFirstName}`}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>

          {/* Welcome Text */}
          <div>
            <h2 className="text-h3 font-semibold text-gray-800 mb-1">
              {getTimeBasedGreeting()}, {clientFirstName}! 👋
            </h2>
            <p className="text-body text-gray-600">
              Aqui você pode acompanhar seus serviços ativos e gerenciar suas preferências.
            </p>
          </div>
        </div>
      </div>

      {/* Active Services */}
      <div className="space-y-4">
        <h3 className="text-h4 font-semibold text-gray-800">
          Serviços Ativos {isLoading ? "" : `(${activeOrders.length})`}
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} className="bg-white shadow-md border-gray-100">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <Skeleton className="h-5 w-36" />
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-28 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-5 w-48" />
                    </div>
                  </div>
                  <Separator />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          Object.entries(activeOrdersByType).map(([typeKey, order]) => {
            if (!order) return null;
            const type = typeKey as ReturnType<typeof normalizeKitchenOrderTypeLabel>;
            const config = typeConfig[type];
            const status = normalizeKitchenOrderStatusLabel(order);
            const code = getKitchenOrderCode(order);
            const detail = activeOrdersDetails[code] || order;
            const date = getKitchenOrderDate(detail);
            const time = getKitchenOrderTime(detail);
            const location = getKitchenOrderLocation(detail);
            const isPending = status === "pendente";

            return (
              <Card key={code || type} className={`bg-white shadow-md ${config.borderClass}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className={`w-10 h-10 ${config.iconBgClass} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <config.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-800">{config.title}</span>
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className={
                        isPending ? "border-orange-300 text-orange-700" : "border-green-300 text-green-700"
                      }
                    >
                      {isPending ? <AlertCircle className="w-3 h-3 mr-1" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                      {isPending ? "Pendente" : "Confirmado"}
                    </Badge>
                  </div>
                  {code ? (
                    <div className="text-sm text-gray-500 mt-2">Referência: #{code}</div>
                  ) : null}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Data</p>
                      <p className="font-medium">{date ? date.toLocaleDateString("pt-BR") : "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Horário</p>
                      <p className="font-medium">{time || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Local</p>
                      <p className="font-medium">{location || "—"}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={!code}
                      onClick={() => navigate(`/detalhes-contrato/${code}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* CTAs */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-white border-[#E0F2F5] shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-tyt-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bodoni font-normal text-gray-800">Contratar novo serviço</h4>
              </div>
              <p className="text-sm text-gray-600">
                Meal Prep, eventos ou serviços especiais personalizados
              </p>
              <Button
                className="w-full bg-tyt-blue-700 hover:bg-tyt-blue-800 text-white"
                onClick={() => navigate("/contratacao-logado")}
              >
                Começar agora
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-tyt-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-gray-800" />
                </div>
                <h4 className="text-xl font-bodoni font-normal text-gray-800">Conhecer nosso cardápio</h4>
              </div>
              <p className="text-sm text-gray-600">Cozinha Semanal, Cheff para eventos ou serviços especiais personalizados</p>
              <Button variant="outline" className="w-full border-tyt-yellow-500 text-gray-800 hover:text-tyt-blue-700 hover:bg-tyt-yellow-50" onClick={() => navigate("/cardapio")}>
                Ver cardápio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>;
};
export default DashboardCliente;
