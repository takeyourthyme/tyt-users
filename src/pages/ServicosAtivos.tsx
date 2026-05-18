import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, ChefHat, Clock, MapPin, UtensilsCrossed, DollarSign, MessageCircle, LogOut, Menu, ChevronLeft, Eye, CheckCircle, Edit, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import chefProfile from "@/assets/chef-roberto.jpg";
import logoWhite from "@/assets/tyt-logo-white.png";
import logoCompleta from "@/assets/logo-completa.webp";
import mariaProfile from "@/assets/maria-profile.jpg";

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
        navigate('/');
        break;
    }
  };
  return <div className="fixed top-0 left-0 right-0 bg-tyt-yellow-500 border-b border-tyt-yellow-600 px-4 py-4 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-900 hover:bg-tyt-yellow-600/20">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 flex flex-col max-h-screen">
              {/* Chef Profile Card */}
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img src={chefProfile} alt="Foto de perfil do Chef Roberto" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm">Chef Roberto Silva</h4>
                    <p className="text-xs text-gray-600">Bem-vindo!</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 flex-1 overflow-y-auto">
                <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-gray-100" onClick={() => handleMenuAction('dashboard')}>
                  <ChefHat className="w-5 h-5 mr-3" />
                  Dashboard
                </Button>
                <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-gray-100" onClick={() => handleMenuAction('agenda')}>
                  <Calendar className="w-5 h-5 mr-3" />
                  Agenda
                </Button>
                <Button variant="default" className="w-full justify-start h-12 text-base bg-tyt-blue-700 hover:bg-tyt-blue-800 text-white" onClick={() => handleMenuAction('servicos-ativos')}>
                  <UtensilsCrossed className="w-5 h-5 mr-3" />
                  Serviços Ativos
                </Button>
                <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-gray-100" onClick={() => handleMenuAction('pagamentos')}>
                  <DollarSign className="w-5 h-5 mr-3" />
                  Pagamentos
                </Button>
                <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-gray-100" onClick={() => handleMenuAction('editar-cadastro')}>
                  <Edit className="w-5 h-5 mr-3" />
                  Meu Cadastro
                </Button>
                <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-gray-100" onClick={() => handleMenuAction('ajuda')}>
                  <MessageCircle className="w-5 h-5 mr-3" />
                  Ajuda
                </Button>
                <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-gray-100" onClick={() => handleMenuAction('guia')}>
                  <BookOpen className="w-5 h-5 mr-3" />
                  Guia do Chef
                </Button>
                <Button variant="ghost" className="w-full justify-start h-12 text-base hover:bg-gray-100" onClick={() => handleMenuAction('logout')}>
                  <LogOut className="w-5 h-5 mr-3" />
                  Sair
                </Button>
              </div>

              {/* Logo no final do menu */}
              <div className="mt-3 pt-3 border-t border-gray-200 flex justify-center flex-shrink-0">
                <img src={logoCompleta} alt="Logo Take Your Thyme" className="h-6 w-auto opacity-80" />
              </div>
            </SheetContent>
          </Sheet>
          
          <img src={logoWhite} alt="Take Your Thyme" className="h-6 w-auto cursor-pointer" onClick={() => navigate('/dashboard-chef')} />
        </div>
      </div>
    </div>;
};
const ServicosAtivos = () => {
  const navigate = useNavigate();

  // Mock data for active services
  const clientPhotos = {
    male: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    female: mariaProfile
  };
  const servicosAtivos = [{
    id: 1,
    type: "Cozinha Semanal",
    client: {
      name: "Maria Silva",
      photo: clientPhotos.female
    },
    startDate: "2025-01-15",
    endDate: "2025-03-15",
    frequency: "Segundas e Quartas",
    time: "14:00",
    location: "Vila Madalena - São Paulo - SP",
    status: "em-andamento",
    nextSession: "2025-01-29"
  }, {
    id: 2,
    type: "Evento",
    client: {
      name: "João Santos",
      photo: clientPhotos.male
    },
    startDate: "2025-02-05",
    endDate: "2025-02-05",
    frequency: "Evento único",
    time: "19:00",
    location: "Moema - São Paulo - SP",
    status: "confirmado",
    nextSession: "2025-02-05"
  }, {
    id: 3,
    type: "Cozinha Semanal",
    client: {
      name: "Ana Costa",
      photo: clientPhotos.female
    },
    startDate: "2025-01-20",
    endDate: "2025-04-20",
    frequency: "Terças e Sextas",
    time: "10:00",
    location: "Jardins - São Paulo - SP",
    status: "em-andamento",
    nextSession: "2025-01-31"
  }];
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
      <ChefMenu />

      {/* Main Content */}
      <main className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard-chef')} className="text-gray-600 hover:text-gray-900 p-2">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Serviços Ativos</h1>
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
                          <Badge className={cn("pointer-events-none", getStatusColor(servico.status))}>
                            {getStatusLabel(servico.status)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Próximo: {new Date(servico.nextSession).toLocaleDateString('pt-BR')} às {servico.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {servico.frequency}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {servico.location}
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
                          <Badge className={cn("pointer-events-none", getStatusColor(servico.status))}>
                            {getStatusLabel(servico.status)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Próximo: {new Date(servico.nextSession).toLocaleDateString('pt-BR')} às {servico.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {servico.frequency}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {servico.location}
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