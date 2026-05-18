import { useState } from "react";
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
import chefProfile from "@/assets/chef-roberto.jpg";
import logoWhite from "@/assets/tyt-logo-white.png";
import logoCompleta from "@/assets/logo-completa.webp";
import mariaProfile from "@/assets/maria-profile.jpg";

// Chef Menu Component - Different from client menu
const ChefMenu = () => {
  const navigate = useNavigate();

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
                      src={chefProfile} 
                      alt="Foto de perfil do Chef Roberto" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">Chef Roberto Silva</h4>
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
    firstName: "Roberto",
    fullName: "Chef Roberto Silva",
    timeWithTYT: "2 meses"
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
      type: "Cozinha Semanal",
      icon: ChefHat,
      date: "2025-01-20",
      time: "14:00",
      location: "Vila Madalena - São Paulo - SP",
      client: {
        name: "Maria Silva",
        photo: mariaProfile
      }
    },
    {
      id: 2,
      type: "Evento",
      icon: Calendar,
      date: "2025-01-22",
      time: "19:00",
      location: "Moema - São Paulo - SP",
      client: {
        name: "João Santos",
        photo: mariaProfile
      }
    }
  ];

  // Mock pending completion services
  const pendingCompletion = [
    {
      id: 3,
      type: "Serviço Especial",
      icon: Clock,
      date: "2025-01-18",
      time: "12:00",
      location: "Jardins - São Paulo - SP",
      client: {
        name: "Ana Costa",
        photo: mariaProfile
      }
    },
    {
      id: 4,
      type: "Cozinha Semanal",
      icon: ChefHat,
      date: "2025-01-19",
      time: "15:00",
      location: "Pinheiros - São Paulo - SP",
      client: {
        name: "Carlos Lima",
        photo: mariaProfile
      }
    }
  ];

  // Mock new services
  const newServices = [
    {
      id: 1,
      type: "Cozinha Semanal",
      icon: ChefHat,
      date: "2025-01-27",
      time: "14:00",
      location: "Vila Madalena - São Paulo - SP",
      client: {
        name: "Maria Silva",
        photo: mariaProfile
      }
    },
    {
      id: 2,
      type: "Evento",
      icon: Calendar,
      date: "2025-01-28",
      time: "19:00",
      location: "Moema - São Paulo - SP",
      client: {
        name: "João Santos",
        photo: mariaProfile
      }
    }
  ];

  // Mock week orders
  const weekOrders = [
    {
      id: 1,
      type: "Cozinha Semanal",
      icon: ChefHat,
      date: "2025-01-27",
      time: "14:00",
      location: "Vila Madalena - São Paulo - SP",
      client: {
        name: "Maria Silva",
        photo: mariaProfile
      }
    },
    {
      id: 2,
      type: "Serviço Especial",
      icon: Clock,
      date: "2025-01-28",
      time: "12:00",
      location: "Jardins - São Paulo - SP",
      client: {
        name: "Ana Costa",
        photo: mariaProfile
      }
    },
    {
      id: 3,
      type: "Evento",
      icon: Calendar,
      date: "2025-01-29",
      time: "19:00",
      location: "Moema - São Paulo - SP",
      client: {
        name: "João Santos",
        photo: mariaProfile
      }
    }
  ];

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
              <img src={chefProfile} alt="Foto de perfil do Chef Roberto" className="w-16 h-16 rounded-full object-cover" />
            </div>
            
            {/* Welcome and Stats */}
            <div className="flex-1">
              <h2 className="text-h3 font-semibold text-gray-800 mb-3">
                {getTimeBasedGreeting()}, {chefData.firstName}! 👨‍🍳
              </h2>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-pink-600" />
                  <div>
                    <div className="text-xs text-gray-500">Tempo de TYT</div>
                    <div className="text-sm font-semibold text-gray-800">{chefData.timeWithTYT}</div>
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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className="bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/agenda-chef#proximos-compromissos')}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.servicosRealizados}</div>
              <div className="text-xs opacity-90">Serviços realizados</div>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/agenda-chef#proximos-compromissos')}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.agendados}</div>
              <div className="text-xs opacity-90">Agendados</div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/agenda-chef#proximos-compromissos')}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.aguardandoAprovacao}</div>
              <div className="text-xs opacity-90">Aguardando aprovação</div>
            </CardContent>
          </Card>

          <Card 
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">5</div>
              <div className="text-xs opacity-90">Pendente de aprovação</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline"
            className="py-6 text-base font-semibold border-2"
            onClick={() => navigate('/agenda-chef')}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Ver Agenda
          </Button>
          <Button 
            className="bg-tyt-blue-700 hover:bg-tyt-blue-800 text-white py-6 text-base font-semibold"
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
              <h3 className="text-h4 font-semibold text-gray-800">
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
              <h3 className="text-h4 font-semibold text-gray-800">
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
              <h3 className="text-h4 font-semibold text-gray-800">
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
    </div>
  );
};

export default DashboardChef;