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
  Users,
  Check,
  X,
  ExternalLink,
  Receipt,
  ShoppingCart,
  Upload,
  CreditCard,
  Edit,
  BookOpen
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
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

const OrdemDeCozinha = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [receiptValue, setReceiptValue] = useState("");
  const [serviceNotes, setServiceNotes] = useState("");
  const [clientNotes, setClientNotes] = useState("");
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isServiceCompleted, setIsServiceCompleted] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [isReceiptSent, setIsReceiptSent] = useState(false);

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
      .catch(() => {
        toast({ title: "Erro", description: "Não foi possível carregar a ordem", variant: "destructive" });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id, toast]);

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
    // Aqui você adicionaria a lógica para salvar as notas
    toast({
      title: "Serviço concluído com sucesso!",
      description: "O serviço foi finalizado.",
    });

    // Marca como concluído e fecha o dialog
    setIsServiceCompleted(true);
    setIsCompleteDialogOpen(false);
  };

  // Mock data for the order
  const clientPhotos = {
    male: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    female: ""
  };

  // Mock dish images
  const dishImages: Record<string, string> = {
    "Salmão Grelhado com Aspargos": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop",
    "Risotto de Camarão": "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=300&h=200&fit=crop", 
    "Salada Mediterranean": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop",
    "Torta de Limão": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=200&fit=crop",
    "Paella Valenciana": "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=300&h=200&fit=crop",
    "Lasanha Bolonhesa": "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=300&h=200&fit=crop",
    "Picanha na Brasa": "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop",
    "Sushi Variado": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop",
    "Gazpacho Andaluz": "https://images.unsplash.com/photo-1564671165093-20688ff1fffa?w=300&h=200&fit=crop",
    "Crema Catalana": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=200&fit=crop",
    "Tapas Variadas": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&h=200&fit=crop",
    "Vinagrete": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop",
    "Farofa Especial": "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop",
    "Pavê de Chocolate": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop",
    "Bruschetta": "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=300&h=200&fit=crop",
    "Tiramisu": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=200&fit=crop",
    "Carpaccio": "https://images.unsplash.com/photo-1598866594230-a7c12756260f?w=300&h=200&fit=crop",
    "Frango Grelhado": "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=200&fit=crop",
    "Legumes no Vapor": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&h=200&fit=crop",
    "Arroz Integral": "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=300&h=200&fit=crop",
    "Salada Verde": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop",
    "Sashimi": "https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=300&h=200&fit=crop",
    "Temaki": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop",
    "Yakisoba": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop",
    "Buffet Completo": "https://images.unsplash.com/photo-1555244162-803834f70033?w=300&h=200&fit=crop",
    "Carnes Variadas": "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=300&h=200&fit=crop",
    "Massas": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300&h=200&fit=crop",
    "Sobremesas": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=200&fit=crop",
    "Peixe Grelhado": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&h=200&fit=crop",
    "Quinoa com Legumes": "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=300&h=200&fit=crop",
    "Salada de Folhas": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop",
    "Massa Fresca ao Molho Pesto": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=300&h=200&fit=crop",
    "Burrata": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&h=200&fit=crop",
    "Panna Cotta": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=200&fit=crop"
  };



  const toggleCheckItem = (index: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Function to mask phone number
  const maskPhone = (phone: string) => {
    // Keep only first 5 chars and last 4, replace middle with asterisks
    if (phone.length <= 9) return phone;
    const start = phone.substring(0, 5);
    const end = phone.substring(phone.length - 4);
    return `${start}****${end}`;
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (!username || !domain) return email;
    
    // Show first 2 chars of username and mask the rest
    const maskedUsername = username.length > 2 
      ? `${username.substring(0, 2)}${'*'.repeat(Math.min(username.length - 2, 5))}`
      : username;
    
    return `${maskedUsername}@${domain}`;
  };

  const ordem = useMemo(() => {
    if (!kitchenOrder) return null;
    const type = normalizeKitchenOrderTypeLabel(kitchenOrder);
    const dateObj = getKitchenOrderDate(kitchenOrder);
    const date = dateObj ? dateObj.toISOString() : new Date().toISOString();
    const time = getKitchenOrderTime(kitchenOrder);
    const client = getKitchenOrderClient(kitchenOrder);
    const status = normalizeKitchenOrderStatusLabel(kitchenOrder);
    const address = getKitchenOrderLocation(kitchenOrder);

    return {
      id: kitchenOrder.id || id,
      type,
      date,
      time,
      duration: "3h",
      location: address,
      address: address,
      people: (kitchenOrder.people_quantity as number) || 4,
      client: {
        ...client,
        phone: (kitchenOrder.client_phone as string) || "(11) 99999-9999",
        email: (kitchenOrder.client_email as string) || "cliente@email.com",
      },
      status,
      menu: Array.isArray(kitchenOrder.dishes) 
        ? kitchenOrder.dishes.map(d => typeof d === 'object' && d !== null && 'dish' in d ? (d.dish as Record<string, unknown>)?.name as string : "Prato")
        : ["Menu Personalizado"],
      observations: (kitchenOrder.observations as string) || (kitchenOrder.client_request as string) || "Sem observações adicionais.",
      budget: "R$ 0,00"
    };
  }, [kitchenOrder, id]);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">Carregando...</div>;
  }

  if (!ordem) {
    return <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">Ordem não encontrada</div>;
  }

  // Dynamic shopping list based on menu
  const shoppingList = ordem.menu.length > 3 ? [
    { item: "Ingrediente principal 1", quantity: "1 kg" },
    { item: "Ingrediente principal 2", quantity: "800g" },
    { item: "Ingrediente secundário 1", quantity: "500g" },
    { item: "Ingrediente secundário 2", quantity: "2 pacotes" },
    { item: "Temperos variados", quantity: "conforme receita" },
    { item: "Azeite extra virgem", quantity: "1 litro" },
    { item: "Sal e pimenta", quantity: "a gosto" }
  ] : [
    { item: "Ingrediente principal", quantity: "1 kg" },
    { item: "Ingrediente secundário", quantity: "500g" },
    { item: "Temperos", quantity: "conforme receita" },
    { item: "Azeite", quantity: "1 litro" }
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
            <h1 className="text-2xl font-bold text-gray-900">Ordem de Cozinha</h1>
            <p className="text-gray-600">Detalhes do serviço agendado</p>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Service Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`w-10 h-10 ${getServiceColor(ordem.type)} rounded-full flex items-center justify-center`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span>{ordem.type}</span>
                    <Badge className={cn("pointer-events-none", getStatusColor(ordem.status))}>
                      {ordem.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 font-normal">#{String(ordem.id)}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{new Date(ordem.date).toLocaleDateString('pt-BR')} às {ordem.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{ordem.people} pessoas</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-sm">{ordem.address}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-start gap-4">
                <img 
                  src={ordem.client.photo} 
                  alt={ordem.client.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{ordem.client.name}</h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {ordem.status === "confirmado" ? (
                        <a href={`tel:${ordem.client.phone}`} className="hover:text-blue-600">
                          {ordem.client.phone}
                        </a>
                      ) : (
                        <span>{maskPhone(ordem.client.phone)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {ordem.status === "confirmado" ? (
                        <a href={`mailto:${ordem.client.email}`} className="hover:text-blue-600">
                          {ordem.client.email}
                        </a>
                      ) : (
                        <span>{maskEmail(ordem.client.email)}</span>
                      )}
                    </div>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>{ordem.address}</span>
                    </div>
                  </div>
                </div>
                
                {/* Desktop buttons - side by side */}
                <div className="hidden md:flex flex-col gap-2">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(ordem.address)}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir no Google Maps
                  </Button>
                  {ordem.status === "confirmado" && (
                    <>
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => window.open(`https://wa.me/55${ordem.client.phone.replace(/\D/g, '')}`, '_blank')}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Mandar mensagem
                      </Button>
                      <Button
                        variant="outline"
                        className="text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                        onClick={() => window.open(`tel:${ordem.client.phone}`, '_self')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Ligar
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {/* Mobile buttons - stacked below */}
              <div className="md:hidden flex flex-col gap-2 mt-4">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(ordem.address)}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir no Google Maps
                </Button>
                {ordem.status === "confirmado" && (
                  <>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white w-full"
                      onClick={() => window.open(`https://wa.me/55${ordem.client.phone.replace(/\D/g, '')}`, '_blank')}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Mandar mensagem
                    </Button>
                    <Button
                      variant="outline"
                      className="text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-900 w-full"
                      onClick={() => window.open(`tel:${ordem.client.phone}`, '_self')}
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Ligar
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Valor do serviço:</span>
                  <span className="font-semibold text-lg">{ordem.budget}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Data do pagamento:</span>
                  <span className="font-medium">{new Date(ordem.date).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observations */}
          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{ordem.observations}</p>
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

          {/* Menu - Only for CONFIRMADO status and NOT Serviço Especial */}
          {ordem.status === "confirmado" && ordem.type !== "Serviço Especial" && (
            <Card>
              <CardHeader>
                <CardTitle>Menu Planejado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ordem.menu.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <img 
                        src={dishImages[item] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop"} 
                        alt={item}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Sheet and Shopping List Buttons - Only for CONFIRMADO and not Serviço Especial */}
          {ordem.status === "confirmado" && (
            <div className="flex flex-col gap-3">
              {ordem.type !== "Serviço Especial" && (
                <>
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Ficha Técnica
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Ver Lista de Compras
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Lista de Compras</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-96 overflow-y-auto">
                        <div className="grid gap-2">
                          {shoppingList.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 border-b border-gray-100">
                              <Checkbox
                                id={`item-${index}`}
                                checked={checkedItems[index] || false}
                                onCheckedChange={() => toggleCheckItem(index)}
                              />
                              <div className="flex-1 flex items-center justify-between">
                                <label 
                                  htmlFor={`item-${index}`} 
                                  className={`font-medium cursor-pointer ${checkedItems[index] ? 'line-through text-gray-500' : ''}`}
                                >
                                  {item.item}
                                </label>
                                <span className="text-gray-600">{item.quantity}</span>
                              </div>
                            </div>
                          ))}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center font-semibold text-lg">
                              <span>Valor Estimado da Compra</span>
                              <span className="text-green-600">R$ 345,00</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrdemDeCozinha;