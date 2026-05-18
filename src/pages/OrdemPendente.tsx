import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Calendar, 
  ChefHat, 
  Clock,
  LogOut,
  Menu,
  ChevronLeft,
  MessageCircle,
  Check,
  X,
  Edit,
  BookOpen,
  UtensilsCrossed,
  DollarSign,
  Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
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
                  variant="ghost"
                  className="w-full justify-start h-12 text-base hover:bg-gray-100"
                  onClick={() => handleMenuAction('servicos-ativos')}
                >
                  <UtensilsCrossed className="w-5 h-5 mr-3" />
                  Serviços Ativos
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
            className="h-6 w-auto cursor-pointer"
            onClick={() => navigate('/dashboard-chef')}
          />
        </div>
      </div>
    </div>
  );
};

const OrdemPendente = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [receiptValue, setReceiptValue] = useState("");
  const [serviceNotes, setServiceNotes] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isServiceCompleted, setIsServiceCompleted] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isReceiptSent, setIsReceiptSent] = useState(false);

  // Função para formatar valor como moeda brasileira
  const formatCurrency = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Se vazio, retorna vazio
    if (!numbers) return '';
    
    // Converte para número e divide por 100 para ter os centavos
    const amount = parseFloat(numbers) / 100;
    
    // Formata como moeda brasileira
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Handler para mudança do valor do recibo
  const handleReceiptValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setReceiptValue(formatted);
  };

  // Handler para enviar recibo
  const handleSendReceipt = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "Atenção",
        description: "Por favor, anexe pelo menos um arquivo.",
        variant: "destructive",
      });
      return;
    }

    if (!receiptValue) {
      toast({
        title: "Atenção",
        description: "Por favor, informe o valor total das compras.",
        variant: "destructive",
      });
      return;
    }

    // Aqui você adicionaria a lógica para enviar os dados
    toast({
      title: "Recibo enviado com sucesso!",
      description: `Valor total: R$ ${receiptValue}`,
    });

    // Marca como enviado e fecha o dialog
    setIsReceiptSent(true);
    setIsReceiptDialogOpen(false);
  };

  // Handler para concluir serviço
  const handleCompleteService = () => {
    toast({
      title: "Serviço concluído com sucesso!",
      description: "O serviço foi finalizado.",
    });

    setIsServiceCompleted(true);
    setIsCompleteDialogOpen(false);
  };

  // Mock data for the order
  const clientPhotos = {
    male: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    female: mariaProfile
  };

  // Mock orders database - matching agenda items
  const ordersDatabase: Record<string, any> = {
    "1": {
      type: "Cozinha Semanal",
      date: "2025-01-05",
      time: "10:00",
      duration: "2h",
      location: "Pinheiros - São Paulo - SP",
      address: "Rua dos Pinheiros, 456 - Pinheiros, São Paulo - SP",
      people: 3,
      client: { name: "Carlos Lima", photo: clientPhotos.male, phone: "(11) 66666-6666", email: "carlos.lima@email.com" },
      status: "confirmado",
      menu: ["Salmão Grelhado com Aspargos", "Risotto de Camarão", "Salada Mediterranean"],
      observations: "Preferência por temperos suaves.",
      budget: "R$ 380,00"
    },
    "2": {
      type: "Evento",
      date: "2025-01-09",
      time: "19:00",
      duration: "5h",
      location: "Moema - São Paulo - SP",
      address: "Av. Ibirapuera, 2300 - Moema, São Paulo - SP",
      people: 25,
      client: { name: "João Santos", photo: clientPhotos.male, phone: "(11) 88888-8888", email: "joao.santos@email.com" },
      status: "pendente",
      menu: ["Paella Valenciana", "Gazpacho Andaluz", "Crema Catalana", "Tapas Variadas"],
      observations: "Evento de aniversário. Cliente prefere culinária espanhola.",
      budget: "R$ 2.800,00"
    },
    "3": {
      type: "Serviço Especial",
      date: "2025-01-12",
      time: "12:00",
      duration: "4h",
      location: "Jardins - São Paulo - SP",
      address: "Rua Augusta, 1200 - Jardins, São Paulo - SP",
      people: 8,
      client: { name: "Ana Costa", photo: clientPhotos.female, phone: "(11) 77777-7777", email: "ana.costa@email.com" },
      status: "confirmado",
      menu: ["Picanha na Brasa", "Vinagrete", "Farofa Especial", "Pavê de Chocolate"],
      observations: "Jantar de confraternização. Cliente gosta de churrasco.",
      budget: "R$ 850,00"
    },
    "4": {
      type: "Cozinha Semanal",
      date: "2025-01-12",
      time: "16:00",
      duration: "2h",
      location: "Vila Madalena - São Paulo - SP",
      address: "Rua Harmonia, 123 - Vila Madalena, São Paulo - SP",
      people: 4,
      client: { name: "Maria Silva", photo: clientPhotos.female, phone: "(11) 99999-9999", email: "maria.silva@email.com" },
      status: "confirmado",
      menu: ["Salmão Grelhado com Aspargos", "Risotto de Camarão", "Salada Mediterranean", "Torta de Limão"],
      observations: "Cliente é alérgica a amendoim. Preferência por temperos suaves.",
      budget: "R$ 450,00"
    },
    "5": {
      type: "Evento",
      date: "2025-01-18",
      time: "18:00",
      duration: "4h",
      location: "Ibirapuera - São Paulo - SP",
      address: "Av. Pedro Álvares Cabral, 1500 - Ibirapuera, São Paulo - SP",
      people: 40,
      client: { name: "Patricia Oliveira", photo: clientPhotos.female, phone: "(11) 55555-5555", email: "patricia.oliveira@email.com" },
      status: "confirmado",
      menu: ["Lasanha Bolonhesa", "Bruschetta", "Tiramisu", "Carpaccio"],
      observations: "Jantar corporativo. Cliente gosta de culinária italiana.",
      budget: "R$ 3.500,00"
    },
    "6": {
      type: "Cozinha Semanal",
      date: "2025-01-22",
      time: "09:00",
      duration: "3h",
      location: "Brooklin - São Paulo - SP",
      address: "Av. Santo Amaro, 5000 - Brooklin, São Paulo - SP",
      people: 5,
      client: { name: "Roberto Ferreira", photo: clientPhotos.male, phone: "(11) 44444-4444", email: "roberto.ferreira@email.com" },
      status: "pendente",
      menu: ["Frango Grelhado", "Legumes no Vapor", "Arroz Integral", "Salada Verde"],
      observations: "Cliente segue dieta low-carb.",
      budget: "R$ 420,00"
    },
    "7": {
      type: "Serviço Especial",
      date: "2025-01-25",
      time: "15:00",
      duration: "3h",
      location: "Vila Olímpia - São Paulo - SP",
      address: "Rua Funchal, 500 - Vila Olímpia, São Paulo - SP",
      people: 12,
      client: { name: "Sandra Mendes", photo: clientPhotos.female, phone: "(11) 33333-3333", email: "sandra.mendes@email.com" },
      status: "confirmado",
      menu: ["Sushi Variado", "Sashimi", "Temaki", "Yakisoba"],
      observations: "Jantar especial de comemoração.",
      budget: "R$ 1.200,00"
    },
    "8": {
      type: "Evento",
      date: "2025-01-28",
      time: "20:00",
      duration: "6h",
      location: "Moema - São Paulo - SP",
      address: "Rua Vieira de Morais, 800 - Moema, São Paulo - SP",
      people: 50,
      client: { name: "Fernando Alves", photo: clientPhotos.male, phone: "(11) 22222-2222", email: "fernando.alves@email.com" },
      status: "confirmado",
      menu: ["Buffet Completo", "Carnes Variadas", "Massas", "Sobremesas"],
      observations: "Casamento. Preferência por buffet variado.",
      budget: "R$ 5.000,00"
    },
    "9": {
      type: "Cozinha Semanal",
      date: "2025-01-30",
      time: "11:00",
      duration: "2h",
      location: "Perdizes - São Paulo - SP",
      address: "Rua Turiassu, 300 - Perdizes, São Paulo - SP",
      people: 2,
      client: { name: "Lucia Santos", photo: clientPhotos.female, phone: "(11) 11111-1111", email: "lucia.santos@email.com" },
      status: "pendente",
      menu: ["Peixe Grelhado", "Quinoa com Legumes", "Salada de Folhas"],
      observations: "Cliente vegetariana.",
      budget: "R$ 320,00"
    },
    "10": {
      type: "Serviço Especial",
      date: "2025-01-15",
      time: "14:00",
      duration: "3h",
      location: "Itaim Bibi - São Paulo - SP",
      address: "Av. Brigadeiro Faria Lima, 3000 - Itaim Bibi, São Paulo - SP",
      people: 10,
      client: { name: "Ricardo Martins", photo: clientPhotos.male, phone: "(11) 98888-7777", email: "ricardo.martins@email.com" },
      status: "pendente",
      menu: ["Massa Fresca ao Molho Pesto", "Carpaccio", "Burrata", "Panna Cotta"],
      observations: "Almoço de negócios. Cliente aprecia culinária italiana.",
      budget: "R$ 980,00"
    }
  };

  // Get order by ID or use default
  const ordem = ordersDatabase[id || "1"] ? {
    id: id || "1",
    ...ordersDatabase[id || "1"]
  } : {
    id: id || "1",
    type: "Cozinha Semanal",
    date: "2025-01-27",
    time: "14:00",
    duration: "3h",
    location: "Vila Madalena - São Paulo - SP",
    address: "Rua Harmonia, 123 - Vila Madalena, São Paulo - SP",
    people: 4,
    client: {
      name: "Maria Silva",
      photo: clientPhotos.female,
      phone: "(11) 99999-9999",
      email: "maria.silva@email.com"
    },
    status: "confirmado",
    menu: [
      "Salmão Grelhado com Aspargos",
      "Risotto de Camarão",
      "Salada Mediterranean",
      "Torta de Limão"
    ],
    observations: "Cliente é alérgica a amendoim. Preferência por temperos suaves.",
    budget: "R$ 450,00"
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
      case "confirmado":
        return "bg-green-100 text-green-800";
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const IconComponent = getServiceIcon(ordem.type);

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
            onClick={() => window.history.back()}
            className="text-gray-600 hover:text-gray-900 p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pendente de Comprovante</h1>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Service Info - Modified to show client photo and name below date */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-10 h-10 ${getServiceColor(ordem.type)} rounded-full flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <span>{ordem.type}</span>
                  <p className="text-sm text-gray-600 font-normal">#{ordem.id}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{new Date(ordem.date).toLocaleDateString('pt-BR')} às {ordem.time}</span>
                </div>
                
                {/* Client photo and name below date */}
                <div className="flex items-center gap-2 pt-2">
                  <img 
                    src={ordem.client.photo} 
                    alt={ordem.client.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <span className="text-sm">{ordem.client.name}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accept/Reject Actions - Only for PENDENTE status */}
          {ordem.status === "pendente" && (
            <div className="flex gap-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700">
                    <Check className="w-4 h-4 mr-2" />
                    Aceitar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar aceitação</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja aceitar esta ordem de cozinha? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => navigate('/dashboard-chef')}
                    >
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Recusar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar recusa</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja recusar esta ordem de cozinha? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => navigate('/dashboard-chef')}
                    >
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Receipt and Complete Service - Only for CONFIRMADO status */}
          {ordem.status === "confirmado" && (
            <div className="flex flex-col gap-3">
              <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full",
                      isReceiptSent && "bg-green-600 hover:bg-green-700 text-white border-green-600"
                    )}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isReceiptSent ? "Recibo de Compra Enviado" : "Enviar Recibo de Compra"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Enviar Recibo</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="receipt-file">Anexar recibo</Label>
                      <Input
                        id="receipt-file"
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setUploadedFiles(prev => [...prev, ...files]);
                        }}
                      />
                      
                      {/* Lista de arquivos anexados */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-gray-700">Arquivos anexados:</p>
                          <div className="space-y-1">
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                                <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 ml-2"
                                  onClick={() => {
                                    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="receipt-value">Valor total das compras</Label>
                      <Input
                        id="receipt-value"
                        type="text"
                        placeholder="0,00"
                        value={receiptValue}
                        onChange={handleReceiptValueChange}
                      />
                    </div>
                    
                    <Button className="w-full" onClick={handleSendReceipt}>Enviar</Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className={cn(
                      "w-full",
                      isServiceCompleted 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {isServiceCompleted ? "Serviço Concluído" : "Concluir Serviço"}
                  </Button>
                </DialogTrigger>
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
                      onClick={handleCompleteService}
                    >
                      Finalizar Serviço
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrdemPendente;
