import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, DollarSign, CheckCircle, AlertCircle, Plus, ChefHat, Calendar, CreditCard, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppMenu } from "@/components/AppMenu";
import mariaProfile from "@/assets/maria-profile.jpg";
const DashboardCliente = () => {
  const navigate = useNavigate();

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

  // Mock user data - in real app, this would come from auth context
  const userData = {
    firstName: "Maria",
    fullName: "Maria Silva"
  };

  // Mock active services data
  const activeServices = {
    mealPrep: {
      contractNumber: "MP-2025-001",
      portion: "Pequena (1-2 pessoas)",
      day: "Segunda a tarde",
      weeklyValue: 280.00,
      hasActiveWeek: true
    },
    specialService: {
      requestedDate: "2025-01-15",
      preferences: "Culinária mediterrânea",
      people: 4,
      status: "awaiting_payment",
      // "in_analysis" or "awaiting_payment"
      value: 450.00
    },
    event: {
      date: "2025-01-20",
      menuName: "Noite Italiana",
      menuType: "Banquete",
      people: 12,
      estimatedValue: 1200.00
    }
  };
  return <div className="min-h-screen bg-gray-50 pt-20">
      {/* AppBar */}
      <AppMenu title="Dashboard" />

      {/* Main Content */}
      <main className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Welcome Message */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-lg">
          <div className="flex items-center gap-4">
            {/* Profile Photo */}
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center shadow-md flex-shrink-0">
              <img src={mariaProfile} alt="Foto de perfil da Maria" className="w-16 h-16 rounded-full object-cover" />
            </div>
            
            {/* Welcome Text */}
            <div>
              <h2 className="text-h3 font-semibold text-gray-800 mb-1">
                {getTimeBasedGreeting()}, {userData.firstName}! 👋
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
            Serviços Ativos ({Object.keys(activeServices).length})
          </h3>

          {/* Meal Prep Card */}
          <Card className="bg-white border-green-200 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <ChefHat className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-800">Cozinha Semanal</span>
                </CardTitle>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Referência: #{activeServices.mealPrep.contractNumber}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Porção</p>
                  <p className="font-medium">{activeServices.mealPrep.portion}</p>
                </div>
                <div>
                  <p className="text-gray-500">Dia</p>
                  <p className="font-medium">{activeServices.mealPrep.day}</p>
                </div>
                <div>
                  <p className="text-gray-500">Valor semanal</p>
                  <p className="font-medium">R$ {activeServices.mealPrep.weeklyValue.toFixed(2)}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => navigate("/contratacao-logado", {
                    state: {
                      fromDashboard: true,
                      goToStep3: true,
                      prefilledData: {
                        cidade: "São Paulo", // Cidade padrão
                        tipoServico: "cozinha-semanal",
                        tamanhoPortacao: "pequena",
                        // Dados básicos para pular as etapas 1 e 2
                        categorias: [],
                        preferencias: [],
                        ingredientes: [],
                        tiposCozinha: [],
                        diaSemana: "Segunda-feira",
                        periodo: "Tarde"
                      }
                    }
                  })}
                >
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Selecionar pratos da semana
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800"
                  onClick={() => navigate("/detalhes-contrato/MP-2025-001")}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver detalhes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Event Card */}
          <Card className="bg-white border-purple-200 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-800">Evento</span>
                </CardTitle>
                <Badge variant="outline" className="border-purple-300 text-purple-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Confirmado
                </Badge>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Referência: #EV-82
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Data</p>
                  <p className="font-medium">{new Date(activeServices.event.date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Menu</p>
                  <p className="font-medium">{activeServices.event.menuName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tipo</p>
                  <p className="font-medium">{activeServices.event.menuType}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pessoas</p>
                  <p className="font-medium">{activeServices.event.people}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Valor estimado</p>
                  <p className="font-medium text-gray-800">R$ {activeServices.event.estimatedValue.toFixed(2)}</p>
                </div>
                <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800"
                  onClick={() => navigate("/detalhes-contrato/EV-82")}>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver detalhes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Special Service Card */}
          <Card className="bg-white border-orange-200 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-800">Serviço Especial</span>
                </CardTitle>
                <Badge className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 text-xs py-0.5 px-1">
                  <AlertCircle className="w-2.5 h-2.5 mr-0.5" />
                  Aguardando pagamento
                </Badge>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Referência: #SE-39
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Data solicitada</p>
                  <p className="font-medium">{new Date(activeServices.specialService.requestedDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Nº de pessoas</p>
                  <p className="font-medium">{activeServices.specialService.people}</p>
                </div>
                <div>
                  <p className="text-gray-500">Valor</p>
                  <p className="font-medium">R$ {activeServices.specialService.value.toFixed(2)}</p>
                </div>
              </div>
              
              <div>
                <p className="text-gray-500 text-sm">Preferências</p>
                <p className="font-medium text-sm">{activeServices.specialService.preferences}</p>
              </div>
              
              <Separator />
              
              {activeServices.specialService.status === "awaiting_payment" ? <div className="flex gap-3">
                  <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pagar agora
                  </Button>
                  <Button variant="outline" className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                    onClick={() => navigate("/detalhes-contrato/SE-39")}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver detalhes
                  </Button>
                </div> : <Button variant="outline" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                  onClick={() => navigate("/detalhes-contrato/SE-39")}>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver detalhes
                </Button>}
            </CardContent>
          </Card>
        </div>

        {/* CTAs */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-white border-tyt-blue-200 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-tyt-blue-700 rounded-full flex items-center justify-center">
                    <ChefHat className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-h4 font-semibold text-gray-800">Contratar novo serviço</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Meal Prep, eventos ou serviços especiais personalizados
                </p>
                <Button 
                  className="w-full bg-tyt-blue-700 hover:bg-tyt-blue-800"
                  onClick={() => navigate("/contratacao-logado")}
                >
                  Começar agora
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-tyt-yellow-300 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-tyt-yellow-500 rounded-full flex items-center justify-center">
                    <Eye className="w-6 h-6 text-gray-800" />
                  </div>
                  <h4 className="text-h4 font-semibold text-gray-800">Conhecer nosso cardápio</h4>
                </div>
                <p className="text-sm text-gray-600">Cozinha Semanal, Cheff para eventos ou serviços especiais personalizados</p>
                <Button variant="outline" className="w-full border-tyt-yellow-500 text-tyt-yellow-700 hover:bg-tyt-yellow-50 hover:text-tyt-yellow-800" onClick={() => navigate("/cardapio")}>
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