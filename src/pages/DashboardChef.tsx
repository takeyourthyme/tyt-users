import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  UtensilsCrossed,
  DollarSign,
  MessageCircle,
  LogOut,
  Menu,
  BookOpen,
  Edit,
  Star,
  TrendingUp,
  Briefcase,
  CalendarCheck,
  ClipboardList,
  AlertCircle,
  Settings,
  Wallet,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { clearSession, loadSession } from "@/services/authService";
import { getUserById } from "@/services/userService";
import { listKitchenOrders, normalizeKitchenOrderStatusLabel, type KitchenOrder } from "@/services/kitchenOrderService";
import { ChefMenu } from "@/components/ChefMenu";
import Footer from "@/components/Footer";

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "https://tyt-api.vercel.app/").replace(/\/+$/, "");

const resolveMediaUrl = (value?: string) => {
  if (!value) return undefined;
  if (/^(https?:)?\/\//.test(value)) return value;
  if (value.startsWith("data:") || value.startsWith("blob:")) return value;
  if (value.startsWith("/")) return `${apiBaseUrl}${value}`;
  return `${apiBaseUrl}/${value}`;
};

const getUserPhotoUrl = (user?: Record<string, unknown>) => {
  if (!user) return undefined;
  const candidates = [
    user.foto_url,
    user.fotoUrl,
    user.photoUrl,
    user.foto,
    user.photo,
    user.avatar,
    user.avatarUrl,
  ];
  const raw = candidates.find((v) => typeof v === "string") as string | undefined;
  return resolveMediaUrl(raw);
};

const getTempoTyt = (createdAt: any) => {
  if (!createdAt) return "—";
  const createdDate = new Date(createdAt);
  if (isNaN(createdDate.getTime())) return "—";

  const now = new Date();
  const diffTime = now.getTime() - createdDate.getTime();
  if (diffTime < 0) return "1 dia";

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 30) {
    if (diffDays <= 1) return "1 dia";
    return `${diffDays} dias`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    if (diffMonths === 1) return "1 mês";
    return `${diffMonths} meses`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  const remainingMonths = diffMonths % 12;

  if (remainingMonths === 0) {
    return diffYears === 1 ? "1 ano" : `${diffYears} anos`;
  }

  const yearText = diffYears === 1 ? "1 ano" : `${diffYears} anos`;
  const monthText = remainingMonths === 1 ? "1 mês" : `${remainingMonths} meses`;
  return `${yearText} e ${monthText}`;
};

const DashboardChef = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [chefUser, setChefUser] = useState<Record<string, unknown> | null>(() => loadSession()?.user ?? null);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);

  // Function to get greeting based on time
  const getTimeBasedGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return "Bom dia";
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
      setChefUser(session.user);
      return;
    }

    if (!session.userId) return;
    getUserById({ token: session.token, userId: session.userId })
      .then((data) => {
        if (data && typeof data === "object" && !Array.isArray(data)) {
          setChefUser(data as Record<string, unknown>);
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const session = loadSession();
    if (!session?.token) return;
    listKitchenOrders({ token: session.token })
      .then((data) => {
        const orders = Array.isArray(data)
          ? data
          : (data as { data?: unknown })?.data ?? (data as { orders?: unknown })?.orders;
        if (Array.isArray(orders)) {
          const sessionUser = session.user as { id?: number; usuario_chef?: { id?: number }; chef?: { id?: number } } | undefined;
          const chefUserId = session.userId ?? sessionUser?.id;
          const chefProfileId = sessionUser?.usuario_chef?.id ?? sessionUser?.chef?.id;
          const filtered = (orders as KitchenOrder[]).filter((order) => {
            const orderChefId = (order.chef as { id?: number } | null)?.id;
            return Number(orderChefId) === Number(chefUserId) || Number(orderChefId) === Number(chefProfileId);
          });
          setKitchenOrders(filtered);
        }
      })
      .catch((err) => {
        console.error("Falha ao carregar pedidos:", err);
        toast({
          variant: "destructive",
          title: "Não foi possível carregar seus serviços",
          description: "Tente novamente em instantes.",
        });
      });
  }, [toast]);

  const chefName = (chefUser?.nome as string | undefined) ?? (chefUser?.name as string | undefined) ?? "Chef";
  const chefFirstName = chefName.split(" ")[0] ?? "Chef";
  const chefPhotoUrl = getUserPhotoUrl(chefUser ?? undefined);

  const stats = useMemo(() => {
    const orders = kitchenOrders;
    const byStatus: Record<string, number> = {};
    orders.forEach((order) => {
      const status = normalizeKitchenOrderStatusLabel(order);
      const current = typeof byStatus[status] === "number" ? byStatus[status] : 0;
      byStatus[status] = current + 1;
    });

    return {
      servicosRealizados: byStatus.concluido ?? 0,
      agendados: orders.length,
      aguardandoAprovacao: byStatus.pendente ?? 0,
      pendenteComprovante: 0,
      avaliacaoMedia: 0,
    };
  }, [kitchenOrders]);

  const handleNavigateToAgenda = (filter?: string) => {
    navigate('/chef/agenda', { state: { filter, scrollTo: 'proximos-compromissos' } });
  };

  const handleNavigateToDisponibilidade = () => {
    navigate('/chef/meu-perfil', { state: { scrollTo: 'disponibilidade' } });
  };

  const handleNavigateToPagamentos = () => {
    navigate('/chef/pagamentos');
  };

  const handleLogout = () => {
    clearSession();
    localStorage.removeItem("token");
    navigate('/');
  };

  const actionButtons = [
    {
      icon: CalendarCheck,
      label: "Meal Prep",
      description: "Veja seus Meal Preps",
      onClick: () => handleNavigateToAgenda("servicos-semanais"),
      color: "from-green-500 to-green-600",
    },
    {
      icon: Briefcase,
      label: "Get Together",
      description: "Veja seus Get Togethers",
      onClick: () => handleNavigateToAgenda("eventos"),
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: ClipboardList,
      label: "Special Service",
      description: "Veja seus Special Services",
      onClick: () => handleNavigateToAgenda("servicos-especiais"),
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: AlertCircle,
      label: "Serviços Pendentes de Comprovante",
      description: "Finalize seus serviços",
      onClick: () => handleNavigateToAgenda("pendentes"),
      color: "from-red-500 to-red-600",
    },
    {
      icon: Settings,
      label: "Atualize sua Agenda",
      description: "Configure sua disponibilidade",
      onClick: handleNavigateToDisponibilidade,
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Wallet,
      label: "Pagamentos",
      description: "Gerencie seus pagamentos",
      onClick: handleNavigateToPagamentos,
      color: "from-teal-500 to-teal-600",
      disabled: true,
    },
    {
      icon: BookOpen,
      label: "Manual do Chef",
      description: "Consulte o guia",
      onClick: () => { },
      color: "from-indigo-500 to-indigo-600",
      disabled: true,
    },
    {
      icon: LogOut,
      label: "Sair",
      description: "Encerrar sessão",
      onClick: handleLogout,
      color: "from-gray-500 to-gray-600",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background pt-20">
      {/* Chef AppBar with yellow theme */}
      <ChefMenu activeItem="dashboard" />

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-6 max-w-4xl mx-auto w-full">
        {/* Welcome Message */}
        <div
          className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => navigate('/chef/meu-perfil')}
        >
          <div className="flex items-start gap-4">
            {/* Profile Photo */}
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shadow-md flex-shrink-0">
              {chefPhotoUrl ? (
                <img
                  src={chefPhotoUrl}
                  alt={`Foto de perfil do Chef ${chefFirstName}`}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>

            {/* Welcome and Stats */}
            <div className="flex-1">
              <h2 className="text-h3 font-light text-gray-800 mb-3">
                {getTimeBasedGreeting()}, {chefFirstName}! 👨‍🍳
              </h2>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-pink-600" />
                  <div>
                    <div className="text-xs text-gray-500">Tempo de TYT</div>
                    <div className="text-sm font-light text-gray-800">
                      {getTempoTyt(chefUser?.createdAt ?? chefUser?.created_at)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-purple-600 fill-purple-600" />
                  <div>
                    <div className="text-xs text-gray-500">Sua avaliação</div>
                    <div className="text-sm font-light text-gray-800">{stats.avaliacaoMedia}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 gap-3">
          {actionButtons.map((button, index) => (
            <Card
              key={index}
              className={
                button.disabled
                  ? "bg-white border border-gray-200 opacity-50 cursor-not-allowed"
                  : "bg-white border border-gray-200 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
              }
              onClick={button.disabled ? undefined : button.onClick}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-200 p-2 rounded-full">
                    <button.icon className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-light text-base text-gray-800">{button.label}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardChef;
