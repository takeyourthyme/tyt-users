import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ChefHat,
  Clock,
  MapPin,
  User,
  CheckCircle,
  UtensilsCrossed,
  DollarSign,
  MessageCircle,
  LogOut,
  Menu,
  Eye,
  BookOpen,
  Upload,
  Edit,
  Star,
  ChevronDown,
  Utensils,
  Martini,
  PartyPopper,
  Check,
  X,
  Award,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { loadSession } from "@/services/authService";
import { getUserPhotoUrl } from "@/services/userService";
import { ChefMenu } from "@/components/ChefMenu";
import Footer from "@/components/Footer";

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
  const session = useMemo(() => loadSession(), []);
  const chefName = (session?.user?.nome as string | undefined) ?? (session?.user?.name as string | undefined) ?? "Chef";
  const chefPhotoUrl = getUserPhotoUrl(session?.user);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [receiptValue, setReceiptValue] = useState("");
  const [selectedServiceForCompletion, setSelectedServiceForCompletion] = useState<number | null>(null);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [serviceNotes, setServiceNotes] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [aguardandoOpen, setAguardandoOpen] = useState(false);
  const [pendenteComprovanteOpen, setPendenteComprovanteOpen] = useState(false);
  const [pendenteConclusaoOpen, setPendenteConclusaoOpen] = useState(false);
  const [ordensOpen, setOrdensOpen] = useState(false);

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

  // Mock chef data
  const chefData = {
    firstName: chefName.split(' ')[0],
    fullName: chefName,
    timeWithTYT: getTempoTyt(session?.user?.createdAt ?? session?.user?.created_at)
  };

  // Mock stats
  const stats = {
    servicosRealizados: 47,
    agendados: 12,
    aguardandoAprovacao: 3,
    pendenteComprovante: 2,
    avaliacaoMedia: 4.75
  };

  // Mock pending receipt services
  const pendingReceipt = [
    {
      id: 1,
      type: "Meal Prep",
      icon: ChefHat,
      date: "2025-01-20",
      time: "14:00",
      location: "Vila Madalena - São Paulo - SP",
      client: {
        name: "Maria Silva",
        photo: ""
      }
    },
    {
      id: 2,
      type: "Get Together",
      icon: Calendar,
      date: "2025-01-22",
      time: "19:00",
      location: "Moema - São Paulo - SP",
      client: {
        name: "João Santos",
        photo: ""
      }
    }
  ];

  // Mock pending completion services
  const pendingCompletion = [
    {
      id: 3,
      type: "Special Service",
      icon: Clock,
      date: "2025-01-18",
      time: "12:00",
      location: "Jardins - São Paulo - SP",
      client: {
        name: "Ana Costa",
        photo: ""
      }
    },
    {
      id: 4,
      type: "Meal Prep",
      icon: ChefHat,
      date: "2025-01-19",
      time: "15:00",
      location: "Pinheiros - São Paulo - SP",
      client: {
        name: "Carlos Lima",
        photo: ""
      }
    }
  ];

  // Mock new services
  const newServices = [
    {
      id: 1,
      type: "Meal Prep",
      icon: ChefHat,
      date: "2025-01-27",
      time: "14:00",
      location: "Vila Madalena - São Paulo - SP",
      client: {
        name: "Maria Silva",
        photo: ""
      }
    },
    {
      id: 2,
      type: "Get Together",
      icon: Calendar,
      date: "2025-01-28",
      time: "19:00",
      location: "Moema - São Paulo - SP",
      client: {
        name: "João Santos",
        photo: ""
      }
    }
  ];

  // Mock week orders
  const weekOrders = [
    {
      id: 1,
      type: "Meal Prep",
      icon: ChefHat,
      date: "2025-01-27",
      time: "14:00",
      location: "Vila Madalena - São Paulo - SP",
      client: {
        name: "Maria Silva",
        photo: ""
      }
    },
    {
      id: 2,
      type: "Special Service",
      icon: Clock,
      date: "2025-01-28",
      time: "12:00",
      location: "Jardins - São Paulo - SP",
      client: {
        name: "Ana Costa",
        photo: ""
      }
    },
    {
      id: 3,
      type: "Get Together",
      icon: Calendar,
      date: "2025-01-29",
      time: "19:00",
      location: "Moema - São Paulo - SP",
      client: {
        name: "João Santos",
        photo: ""
      }
    }
  ];

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

  return (
    <div className="min-h-screen flex flex-col bg-background pt-20">
      {/* Chef AppBar with yellow theme */}
      <ChefMenu activeItem="dashboard" />

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-6 max-w-4xl mx-auto w-full">
        {/* Welcome Message */}
        <div
          className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => navigate('/editar-cadastro-chef')}
        >
          <div className="flex items-center gap-4">
            {chefPhotoUrl ? (
              <img src={chefPhotoUrl} alt={`Foto de perfil do Chef ${chefName}`} className="w-16 h-16 rounded-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-light text-gray-900">Olá, {chefName}</h1>
              <p className="text-gray-600">Aqui está o resumo da sua semana</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-pink-600" />
              <div>
                <div className="text-xs text-gray-500">Tempo de TYT</div>
                <div className="text-sm font-light text-gray-800">{chefData.timeWithTYT}</div>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card
            className="bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/agenda-chef#proximos-compromissos')}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-light">{stats.servicosRealizados}</div>
              <div className="text-xs opacity-90">Serviços realizados</div>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/agenda-chef#proximos-compromissos')}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-light">{stats.agendados}</div>
              <div className="text-xs opacity-90">Agendados</div>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/agenda-chef#proximos-compromissos')}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-light">{stats.aguardandoAprovacao}</div>
              <div className="text-xs opacity-90">Aguardando aprovação</div>
            </CardContent>
          </Card>

          <Card
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-light">5</div>
              <div className="text-xs opacity-90">Pendente de aprovação</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="py-6 text-base font-light border-2"
            onClick={() => navigate('/agenda-chef')}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Ver Agenda
          </Button>
          <Button
            className="bg-tyt-blue-700 hover:bg-tyt-blue-800 text-white py-6 text-base font-light"
            onClick={() => navigate('/guia-chef')}
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Guia do Chef
          </Button>
        </div>

        {/* Aguardando Aprovação */}
        <Collapsible open={aguardandoOpen} onOpenChange={setAguardandoOpen} className="space-y-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-3 h-auto hover:bg-gray-100 border border-gray-300 rounded-lg">
              <h3 className="text-h4 font-light text-gray-800">
                Aguardando aprovação ({newServices.length})
              </h3>
              <ChevronDown className={`w-5 h-5 transition-transform ${aguardandoOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3">
            {newServices.map((service) => {
              const IconComponent = getServiceIcon(service.type);
              return (
                <Card key={service.id} className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/ordem-de-cozinha/${service.id}`)}>
                  <CardContent className="p-4">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 ${getServiceColor(service.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800">{service.type}</span>
                            <Badge variant="outline" className="text-xs">
                              Novo
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {new Date(service.date).toLocaleDateString('pt-BR')} às {service.time}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {service.location}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={service.client.photo}
                            alt={service.client.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-600">{service.client.name}</span>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="p-2 h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/ordem-de-cozinha/${service.id}`);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-10 h-10 ${getServiceColor(service.type)} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800">{service.type}</span>
                            <Badge variant="outline" className="text-xs">
                              Novo
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {new Date(service.date).toLocaleDateString('pt-BR')} às {service.time}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {service.location}
                          </div>
                        </div>
                      </div>

                      {/* Client info and button below on mobile */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={service.client.photo}
                            alt={service.client.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-700 font-medium">{service.client.name}</span>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="px-3 py-1 h-auto text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/ordem-de-cozinha/${service.id}`);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Pendentes (união de comprovante e finalização) */}
        <Collapsible open={pendenteComprovanteOpen} onOpenChange={setPendenteComprovanteOpen} className="space-y-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-3 h-auto hover:bg-gray-100 border border-gray-300 rounded-lg">
              <h3 className="text-h4 font-light text-gray-800">
                Pendentes ({pendingReceipt.length + pendingCompletion.length})
              </h3>
              <ChevronDown className={`w-5 h-5 transition-transform ${pendenteComprovanteOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3">
            {[...pendingReceipt, ...pendingCompletion].map((service) => {
              const IconComponent = getServiceIcon(service.type);
              return (
                <Card key={service.id} className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 ${getServiceColor(service.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800">{service.type}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {new Date(service.date).toLocaleDateString('pt-BR')} às {service.time}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {service.location}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={service.client.photo}
                            alt={service.client.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-600">{service.client.name}</span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="p-2 h-8 w-8"
                            onClick={() => navigate(`/ordem-de-cozinha/${service.id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadDialogOpen(true);
                            }}
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            Recibo
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-3"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedServiceForCompletion(service.id);
                              setCompletionDialogOpen(true);
                            }}
                          >
                            <Check className="w-4 h-4 mr-1 text-green-600" />
                            Concluir
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-10 h-10 ${getServiceColor(service.type)} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800">{service.type}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {new Date(service.date).toLocaleDateString('pt-BR')} às {service.time}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {service.location}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={service.client.photo}
                            alt={service.client.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-700 font-medium">{service.client.name}</span>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 min-w-[100px]"
                            onClick={() => navigate(`/ordem-de-cozinha/${service.id}`)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Detalhes
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 min-w-[100px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadDialogOpen(true);
                            }}
                          >
                            <Upload className="w-3 h-3 mr-1" />
                            Recibo
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 min-w-[100px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedServiceForCompletion(service.id);
                              setCompletionDialogOpen(true);
                            }}
                          >
                            <Check className="w-3 h-3 mr-1 text-green-600" />
                            Concluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Week Orders */}
        <Collapsible open={ordensOpen} onOpenChange={setOrdensOpen} className="space-y-4">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-3 h-auto hover:bg-gray-100 border border-gray-300 rounded-lg">
              <h3 className="text-h4 font-light text-gray-800">
                Ordens da Semana ({weekOrders.length})
              </h3>
              <ChevronDown className={`w-5 h-5 transition-transform ${ordensOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3">
            {weekOrders.map((order) => {
              const IconComponent = getServiceIcon(order.type);
              return (
                <Card key={order.id} className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/ordem-de-cozinha/${order.id}`)}>
                  <CardContent className="p-4">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 ${getServiceColor(order.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>

                        <div>
                          <div className="font-medium text-gray-800 mb-1">{order.type}</div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.date).toLocaleDateString('pt-BR')} às {order.time}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {order.location}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={order.client.photo}
                            alt={order.client.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-600">{order.client.name}</span>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="p-2 h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/ordem-de-cozinha/${order.id}`);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-10 h-10 ${getServiceColor(order.type)} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>

                        <div className="flex-1">
                          <div className="font-medium text-gray-800 mb-1">{order.type}</div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {new Date(order.date).toLocaleDateString('pt-BR')} às {order.time}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {order.location}
                          </div>
                        </div>
                      </div>

                      {/* Client info and button below on mobile */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={order.client.photo}
                            alt={order.client.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-700 font-medium">{order.client.name}</span>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="px-3 py-1 h-auto text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/ordem-de-cozinha/${order.id}`);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        {/* Ver Pagamentos Button */}
        <div className="text-center">
          <Button
            className="bg-tyt-yellow-500 hover:bg-tyt-yellow-600 text-gray-900 px-8 py-2 w-full"
            disabled
            onClick={() => navigate('/meus-pagamentos')}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Ver Pagamentos
          </Button>
        </div>
      </main>

      {/* Upload Receipt Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Anexar Comprovante de Compra</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="receipt-upload">Foto do Comprovante</Label>
              <Input
                id="receipt-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setUploadedFile(file);
                  }
                }}
                className="mt-2"
              />
              {uploadedFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {uploadedFile.name}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="receipt-value">Valor Total da Compra (R$)</Label>
              <Input
                id="receipt-value"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={receiptValue}
                onChange={(e) => setReceiptValue(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setUploadDialogOpen(false);
                  setUploadedFile(null);
                  setReceiptValue("");
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-tyt-blue-700 hover:bg-tyt-blue-800"
                disabled={!uploadedFile || !receiptValue}
                onClick={() => {
                  // Aqui você adicionaria a lógica de upload
                  setUploadDialogOpen(false);
                  setUploadedFile(null);
                  setReceiptValue("");
                }}
              >
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Completion Dialog */}
      <Dialog open={completionDialogOpen} onOpenChange={setCompletionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Concluir Serviço</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="service-notes">Nos conte algo importante sobre esse atendimento</Label>
              <Textarea
                id="service-notes"
                placeholder="Descreva como foi o atendimento, observações importantes..."
                value={serviceNotes}
                onChange={(e) => setServiceNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="client-notes">Escreva algo para aparecer para você no próximo serviço desse cliente</Label>
              <Textarea
                id="client-notes"
                placeholder="Observações para o próximo atendimento..."
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => {
                setCompletionDialogOpen(false);
                setServiceNotes("");
                setClientNotes("");
                setSelectedServiceForCompletion(null);
              }}
            >
              Finalizar Serviço
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default DashboardChef;