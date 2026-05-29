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
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import logoWhite from "@/assets/tyt-logo-white.png";
import logoCompleta from "@/assets/logo-completa.webp";

import { useEffect, useMemo } from "react";
import { loadSession, clearSession } from "@/services/authService";
import { getUserPhotoUrl } from "@/services/userService";
import {
  getKitchenOrderClient,
  getKitchenOrderDate,
  getKitchenOrderLocation,
  getKitchenOrderTime,
  getKitchenOrderByCode,
  normalizeKitchenOrderStatusLabel,
  normalizeKitchenOrderTypeLabel,
  type KitchenOrder,
} from "@/services/kitchenOrderService";

// Chef Menu Component
const ChefMenu = () => {
  const navigate = useNavigate();

  const handleMenuAction = (action: string) => {
    switch (action) {
      case 'dashboard':
        navigate('/dashboard-chef');
        break;
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

  const session = useMemo(() => loadSession(), []);
  const chefName = (session?.user?.nome as string | undefined) ?? (session?.user?.name as string | undefined) ?? "Chef";
  const chefPhotoUrl = getUserPhotoUrl(session?.user);

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
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                    {chefPhotoUrl ? (
                      <img 
                        src={chefPhotoUrl} 
                        alt={`Foto de perfil do Chef ${chefName}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
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
                  onClick={() => handleMenuAction('dashboard')}
                >
                  <ChefHat className="w-5 h-5 mr-3" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base hover:bg-gray-100"
                  onClick={() => handleMenuAction('agenda')}
                >
                  <Calendar className="w-5 h-5 mr-3" />
                  Agenda
                </Button>
                <Button
                  variant="default"
                  className="w-full justify-start h-12 text-base bg-tyt-blue-700 hover:bg-tyt-blue-800 text-white"
                  onClick={() => handleMenuAction('servicos-ativos')}
                >
                  <UtensilsCrossed className="w-5 h-5 mr-3" />
                  Serviços Ativos
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 text-base hover:bg-gray-100"
                  disabled
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
            className="h-6 w-auto cursor-pointer"
            onClick={() => navigate('/dashboard-chef')}
          />
        </div>
      </div>
    </div>
  );
};

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
    getKitchenOrderByCode({ token: session.token, code: id })
      .then((data) => {
        if (data && typeof data === "object") {
          setKitchenOrder(data as KitchenOrder);
        }
      })
      .catch(() => {})
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
      type,
      client: {
        ...client,
        phone: (kitchenOrder.client_phone as string) || "(11) 99999-9999",
        email: (kitchenOrder.client_email as string) || "cliente@email.com",
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
      monthlyValue: "R$ 450,00",
      sessionValue: "R$ 450,00"
    };
  }, [kitchenOrder, id]);

  const ordensServico = useMemo(() => {
    if (!kitchenOrder) return [];
    return [{
      id: (kitchenOrder.id as string | number) || id,
      data: getKitchenOrderDate(kitchenOrder)?.toISOString() || new Date().toISOString(),
      valor: "R$ 450,00",
      status: normalizeKitchenOrderStatusLabel(kitchenOrder) === 'concluido' ? "finalizado" : "em_andamento",
      pratos: Array.isArray(kitchenOrder.dishes) 
        ? kitchenOrder.dishes.map(d => typeof d === 'object' && d !== null && 'dish' in d ? { nome: (d.dish as Record<string, unknown>)?.name as string } : { nome: "Prato" })
        : [{ nome: "Menu Personalizado" }]
    }];
  }, [kitchenOrder, id]);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">Carregando...</div>;
  }

  if (!servico) {
    return <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">Serviço não encontrado</div>;
  }

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

  const IconComponent = getServiceIcon(servico.type);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Chef AppBar */}
      <ChefMenu />

      {/* Main Content */}
      <main className="p-4 space-y-6 max-w-4xl mx-auto">
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
            <h1 className="text-2xl font-bold text-gray-900">Detalhes do Serviço</h1>
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
                  <p className="text-sm text-gray-600 font-normal">Contrato #{servico.id}</p>
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
                      <span>{servico.frequency} às {servico.time}</span>
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
                  <h3 className="font-semibold text-lg">{servico.client.name}</h3>
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
    </div>
  );
};

export default ServicoDetalhes;