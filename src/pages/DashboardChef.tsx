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
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import chefProfile from "@/assets/chef-roberto.jpg";
import logoWhite from "@/assets/tyt-logo-white.png";
import logoCompleta from "@/assets/logo-completa.webp";
import { clearSession, loadSession } from "@/services/authService";
import { getUserById } from "@/services/userService";

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

// Chef Menu Component - Different from client menu
const ChefMenu = () => {
  const navigate = useNavigate();
  const session = useMemo(() => loadSession(), []);

  const chefName =
    (session?.user?.nome as string | undefined) ??
    (session?.user?.name as string | undefined) ??
    "Chef";
  const chefPhotoUrl = getUserPhotoUrl(session?.user);

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'agenda':
        navigate('/agenda-chef');
        break;
      case 'servicos-ativos':
        navigate('/servicos-ativos');
        break;
      case 'pagamentos':
        navigate('/meus-pagamentos');
        break;
      case 'editar-cadastro':
        navigate('/editar-cadastro-chef');
        break;
      case 'guia':
        // TODO: Navigate to chef guide page
        break;
      case 'ajuda':
        window.open('https://wa.me/5511999999999', '_blank');
        break;
      case 'logout':
        clearSession();
        localStorage.removeItem("token");
        navigate('/');
        break;
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-tyt-yellow-500 border-b border-tyt-yellow-600 px-4 py-4 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-900 hover:bg-tyt-yellow-600/20"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 flex flex-col max-h-screen">
              {/* Chef Profile Card */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src={chefPhotoUrl ?? chefProfile}
                      alt={`Foto de perfil do Chef ${chefName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = chefProfile;
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">{chefName}</h4>
                    <p className="text-xs text-gray-600">Bem-vindo!</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 flex-1 overflow-y-auto">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base hover:bg-gray-100"
                  onClick={() => handleMenuAction('agenda')}
                >
                  <Calendar className="w-5 h-5 mr-3" />
                  Agenda
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base hover:bg-gray-100"
                  onClick={() => handleMenuAction('servicos-ativos')}
                >
                  <UtensilsCrossed className="w-5 h-5 mr-3" />
                  Cozinha Semanal
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base hover:bg-gray-100"
                  onClick={() => handleMenuAction('pagamentos')}
                >
                  <DollarSign className="w-5 h-5 mr-3" />
                  Pagamentos
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base hover:bg-gray-100"
                  onClick={() => handleMenuAction('editar-cadastro')}
                >
                  <Edit className="w-5 h-5 mr-3" />
                  Meu Cadastro
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base hover:bg-gray-100"
                  onClick={() => handleMenuAction('ajuda')}
                >
                  <MessageCircle className="w-5 h-5 mr-3" />
                  Ajuda
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base hover:bg-gray-100"
                  onClick={() => handleMenuAction('guia')}
                >
                  <BookOpen className="w-5 h-5 mr-3" />
                  Guia do Chef
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base hover:bg-gray-100"
                  onClick={() => handleMenuAction('logout')}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sair
                </Button>
              </div>

              {/* Logo no final do menu */}
              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-center flex-shrink-0">
                <img
                  src={logoCompleta}
                  alt="Logo Take Your Thyme"
                  className="h-6 w-auto opacity-80"
                />
              </div>
            </SheetContent>
          </Sheet>

          <img
            src={logoWhite}
            alt="Take Your Thyme"
            className="h-6 w-auto"
          />
        </div>
      </div>
    </div>
  );
};

const DashboardChef = () => {
  const navigate = useNavigate();
  const [chefUser, setChefUser] = useState<Record<string, unknown> | null>(null);

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

  const chefName = (chefUser?.nome as string | undefined) ?? (chefUser?.name as string | undefined) ?? "Chef";
  const chefFirstName = chefName.split(" ")[0] ?? "Chef";
  const chefPhotoUrl = getUserPhotoUrl(chefUser ?? undefined);

  // Mock stats
  const stats = {
    servicosRealizados: 47,
    agendados: 12,
    aguardandoAprovacao: 3,
    pendenteComprovante: 2,
    avaliacaoMedia: 4.75
  };

  const handleNavigateToAgenda = (filter?: string) => {
    navigate('/agenda-chef', { state: { filter, scrollTo: 'proximos-compromissos' } });
  };

  const handleNavigateToDisponibilidade = () => {
    navigate('/editar-cadastro-chef', { state: { scrollTo: 'disponibilidade' } });
  };

  const handleNavigateToPagamentos = () => {
    navigate('/meus-pagamentos');
  };

  const handleLogout = () => {
    clearSession();
    localStorage.removeItem("token");
    navigate('/');
  };

  const actionButtons = [
    {
      icon: CalendarCheck,
      label: "Serviços Semanais",
      description: "Veja seus serviços semanais",
      onClick: () => handleNavigateToAgenda("servicos-semanais"),
      color: "from-green-500 to-green-600",
    },
    {
      icon: Briefcase,
      label: "Eventos",
      description: "Veja seus eventos agendados",
      onClick: () => handleNavigateToAgenda("eventos"),
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: ClipboardList,
      label: "Serviços Especiais",
      description: "Veja seus serviços especiais",
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
    },
    {
      icon: BookOpen,
      label: "Manual do Chefe",
      description: "Consulte o guia",
      onClick: () => { },
      color: "from-indigo-500 to-indigo-600",
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
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Chef AppBar with yellow theme */}
      <ChefMenu />

      {/* Main Content */}
      <main className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Welcome Message */}
        <div
          className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => navigate('/editar-cadastro-chef')}
        >
          <div className="flex items-start gap-4">
            {/* Profile Photo */}
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shadow-md flex-shrink-0">
              <img
                src={chefPhotoUrl ?? chefProfile}
                alt={`Foto de perfil do Chef ${chefFirstName}`}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = chefProfile;
                }}
              />
            </div>

            {/* Welcome and Stats */}
            <div className="flex-1">
              <h2 className="text-h3 font-semibold text-gray-800 mb-3">
                {getTimeBasedGreeting()}, {chefFirstName}! 👨‍🍳
              </h2>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-pink-600" />
                  <div>
                    <div className="text-xs text-gray-500">Tempo de TYT</div>
                    <div className="text-sm font-semibold text-gray-800">—</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-purple-600 fill-purple-600" />
                  <div>
                    <div className="text-xs text-gray-500">Sua avaliação</div>
                    <div className="text-sm font-semibold text-gray-800">{stats.avaliacaoMedia}</div>
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
              className="bg-white border border-gray-200 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
              onClick={button.onClick}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-200 p-2 rounded-full">
                    <button.icon className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-gray-800">{button.label}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardChef;
