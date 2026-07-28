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
  Utensils,
  Martini,
  PartyPopper,
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import { useEffect, useMemo } from "react";
import { loadSession } from "@/services/authService";
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
  getKitchenOrderCode,
  updateKitchenOrderStatus,
  uploadGroceryReceipt,
} from "@/services/kitchenOrderService";
import { ChefMenu } from "@/components/ChefMenu";
import Footer from "@/components/Footer";
import { normalizeDish, type Dish } from "@/services/dishService";

const apiBaseUrl = (import.meta.env.VITE_API_URL ?? "https://tyt-api.vercel.app/").replace(/\/+$/, "");

const resolveMediaUrl = (value?: string) => {
  if (!value) return undefined;
  if (/^(https?:)?\/\//.test(value)) return value;
  if (value.startsWith("data:") || value.startsWith("blob:")) return value;
  if (value.startsWith("/")) return `${apiBaseUrl}${value}`;
  return `${apiBaseUrl}/${value}`;
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
  const [isSendingReceipt, setIsSendingReceipt] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [kitchenOrder, setKitchenOrder] = useState<KitchenOrder | null>(null);

  const hasReceipt = useMemo(() => {
    if (isReceiptSent) return true;
    const url = (kitchenOrder as any)?.grocery_receipt_url ?? (kitchenOrder as any)?.groceryReceiptUrl;
    return Boolean(url);
  }, [isReceiptSent, kitchenOrder]);

  useEffect(() => {
    const session = loadSession();
    if (!session?.token || !id) {
      setIsLoading(false);
      return;
    }
    getKitchenOrderByCode({ token: session.token, code: id, fetchFallbackServiceValue: true })
      .then((res) => {
        if (res && typeof res === "object") {
          const order = (res as any).data && typeof (res as any).data === "object" && !Array.isArray((res as any).data)
            ? (res as any).data
            : res;

          if (order && typeof order === "object" && !Array.isArray(order)) {
            setKitchenOrder(order as KitchenOrder);

            const receiptUrl = (order as any)?.grocery_receipt_url ?? (order as any)?.groceryReceiptUrl;
            const receiptAmt = (order as any)?.grocery_receipt_amount ?? (order as any)?.groceryReceiptAmount;
            if (receiptUrl) {
              setIsReceiptSent(true);
            }
            if (receiptAmt !== undefined && receiptAmt !== null) {
              const num = Number(receiptAmt);
              if (!isNaN(num) && num > 0) {
                const formatted = (num * 100).toString();
                setReceiptValue(formatCurrency(formatted));
              }
            }

            const statusLabel = normalizeKitchenOrderStatusLabel(order as KitchenOrder);
            if (statusLabel === "concluido") {
              setIsServiceCompleted(true);
            }
          }
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
  const handleSendReceipt = async () => {
    if (uploadedFiles.length === 0 && !hasReceipt) {
      toast({
        title: "Atenção",
        description: "Por favor, anexe o arquivo do recibo de compras (imagem ou PDF).",
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

    const rawNumbers = receiptValue.replace(/\D/g, '');
    if (!rawNumbers || parseFloat(rawNumbers) <= 0) {
      toast({
        title: "Atenção",
        description: "Informe um valor total de compras válido maior que zero.",
        variant: "destructive",
      });
      return;
    }

    const numericAmount = parseFloat(rawNumbers) / 100;
    const session = loadSession();
    const orderCode = getKitchenOrderCode(kitchenOrder) || id;

    if (!session?.token || !orderCode) {
      toast({
        variant: "destructive",
        title: "Erro de sessão",
        description: "Sessão expirada. Por favor, faça login novamente.",
      });
      return;
    }

    setIsSendingReceipt(true);
    try {
      const fileToUpload = uploadedFiles[0];
      await uploadGroceryReceipt({
        token: session.token,
        code: orderCode,
        receipt: fileToUpload,
        amount: numericAmount,
      });

      toast({
        title: "Recibo enviado com sucesso!",
        description: `Valor total registrado: R$ ${receiptValue}`,
      });

      setIsReceiptSent(true);
      setIsReceiptDialogOpen(false);
      setKitchenOrder((prev) =>
        prev
          ? {
              ...prev,
              grocery_receipt_url: "uploaded",
              grocery_receipt_amount: numericAmount,
            }
          : null
      );
    } catch (error: any) {
      console.error("Erro ao enviar recibo:", error);
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Não foi possível enviar o comprovante de compra.";
      toast({
        variant: "destructive",
        title: "Erro no envio",
        description: msg,
      });
    } finally {
      setIsSendingReceipt(false);
    }
  };

  // Handler para concluir serviço
  const handleCompleteService = async () => {
    if (!hasReceipt) {
      toast({
        variant: "destructive",
        title: "Comprovante de compra pendente",
        description: "É necessário enviar o recibo de compra de ingredientes antes de concluir o serviço.",
      });
      setIsCompleteDialogOpen(false);
      setIsReceiptDialogOpen(true);
      return;
    }

    const session = loadSession();
    if (!session?.token || !kitchenOrder?.id) {
      toast({
        variant: "destructive",
        title: "Erro de sessão",
        description: "Sessão expirada. Por favor, faça login novamente.",
      });
      return;
    }

    try {
      await updateKitchenOrderStatus({
        token: session.token,
        id: kitchenOrder.id as number,
        status: "FINALIZED",
      });

      toast({
        title: "Serviço concluído com sucesso!",
        description: "O serviço foi finalizado.",
      });

      setIsServiceCompleted(true);
      setIsCompleteDialogOpen(false);

      if (kitchenOrder) {
        setKitchenOrder(prev => prev ? { ...prev, status: "FINALIZED" } : null);
      }
      navigate('/dashboard-chef');
    } catch (error: any) {
      console.error("Erro ao concluir ordem:", error);
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Ocorreu um problema ao finalizar a ordem.";
      toast({
        variant: "destructive",
        title: "Erro ao concluir serviço",
        description: errorMsg,
      });
    }
  };

  const handleAccept = async () => {
    const session = loadSession();
    if (!session?.token || !kitchenOrder?.id) return;
    try {
      await updateKitchenOrderStatus({
        token: session.token,
        id: kitchenOrder.id as number,
        status: "CONFIRMED",
      });
      toast({
        title: "Serviço aceito!",
        description: "A ordem de cozinha foi aceita.",
      });
      navigate('/dashboard-chef');
    } catch (error) {
      console.error("Erro ao aceitar ordem:", error);
      toast({
        variant: "destructive",
        title: "Erro ao aceitar serviço",
        description: "Ocorreu um problema ao confirmar a ordem.",
      });
    }
  };

  const handleDecline = async () => {
    const session = loadSession();
    if (!session?.token || !kitchenOrder?.id) return;
    try {
      await updateKitchenOrderStatus({
        token: session.token,
        id: kitchenOrder.id as number,
        status: "DECLINED",
      });
      toast({
        title: "Serviço recusado",
        description: "A ordem foi recusada.",
      });
      navigate('/dashboard-chef');
    } catch (error) {
      console.error("Erro ao recusar ordem:", error);
      toast({
        variant: "destructive",
        title: "Erro ao recusar serviço",
        description: "Ocorreu um problema ao recusar a ordem.",
      });
    }
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
      code: getKitchenOrderCode(kitchenOrder) || "",
      type,
      date,
      time,
      duration: "3h",
      location: address,
      address: address,
      people: (kitchenOrder.people_quantity as number) || 4,
      client: {
        ...client,
        phone: (kitchenOrder.client_phone as string) || (kitchenOrder.cliente as any)?.whatsapp || (kitchenOrder.cliente as any)?.phone || "(11) 99999-9999",
        email: (kitchenOrder.client_email as string) || (kitchenOrder.cliente as any)?.email || "cliente@email.com",
      },
      status,
      menu: Array.isArray(kitchenOrder.dishes)
        ? kitchenOrder.dishes.map(d => typeof d === 'object' && d !== null && 'dish' in d ? (normalizeDish(d.dish as Dish).name) : "Prato")
        : ["Menu Personalizado"],
      dishes: Array.isArray(kitchenOrder.dishes)
        ? kitchenOrder.dishes.map(d => {
          if (typeof d === 'object' && d !== null && 'dish' in d) {
            return {
              dish: normalizeDish(d.dish as Dish),
              quantity: (d as any).quantity as number ?? 1
            };
          }
          return null;
        }).filter(Boolean) as Array<{ dish: any; quantity: number }>
        : [],
      observations: (kitchenOrder.observations as string) || (kitchenOrder.client_request as string) || "Sem observações adicionais.",
      budget: (kitchenOrder.service_value ?? (kitchenOrder as any).serviceValue)
        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(kitchenOrder.service_value ?? (kitchenOrder as any).serviceValue))
        : "—"
    };
  }, [kitchenOrder, id]);

  const rawProposals = useMemo(() => {
    if (!kitchenOrder) return [];
    if (Array.isArray((kitchenOrder as any).proposals)) {
      return (kitchenOrder as any).proposals as Array<{ id: number; item: string; value: number }>;
    }
    const spec = (kitchenOrder as any).special_service_proposal as Record<string, unknown> | null;
    if (spec && Array.isArray(spec.items)) {
      return spec.items as Array<{ id: number; description: string; price: number }>;
    }
    return [];
  }, [kitchenOrder]);

  const proposalItems = useMemo(() => {
    return rawProposals.map((p: any) => ({
      name: p.item || p.description || "Item da Proposta",
      price: Number(p.value ?? p.price ?? 0),
    }));
  }, [rawProposals]);

  const proposalTotalPrice = useMemo(() => {
    return proposalItems.reduce((acc, item) => acc + (item.price || 0), 0);
  }, [proposalItems]);

  // Dynamic shopping list and total price based on consolidated dish ingredients
  const { shoppingList, totalEstimatedPrice } = useMemo(() => {
    if (!kitchenOrder || !Array.isArray(kitchenOrder.dishes)) {
      return { shoppingList: [], totalEstimatedPrice: 0 };
    }

    const consolidated = new Map<string, { quantityValue: number; unit: string; totalCost: number }>();

    kitchenOrder.dishes.forEach((item: any) => {
      if (item && typeof item === 'object' && item.dish) {
        const normalized = normalizeDish(item.dish as Dish);
        const dishQty = item.quantity ?? 1;

        if (normalized.ingredients && normalized.ingredients.length > 0) {
          normalized.ingredients.forEach(ing => {
            const key = ing.name.toLowerCase().trim();
            const existing = consolidated.get(key);
            if (existing) {
              existing.quantityValue += ing.quantityValue * dishQty;
              existing.totalCost += ing.price * dishQty;
            } else {
              consolidated.set(key, {
                quantityValue: ing.quantityValue * dishQty,
                unit: ing.unit,
                totalCost: ing.price * dishQty
              });
            }
          });
        } else if (Array.isArray(normalized.mainIngredients) && normalized.mainIngredients.length > 0) {
          normalized.mainIngredients.forEach(ingName => {
            const key = ingName.toLowerCase().trim();
            const existing = consolidated.get(key);
            if (!existing) {
              consolidated.set(key, {
                quantityValue: dishQty,
                unit: "unidade(s)",
                totalCost: 0
              });
            }
          });
        }
      }
    });

    const list = Array.from(consolidated.entries()).map(([name, info]) => {
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      const qtyStr = info.unit ? `${info.quantityValue} ${info.unit}` : `${info.quantityValue}`;
      return {
        item: displayName,
        quantity: qtyStr
      };
    });

    const total = Array.from(consolidated.values()).reduce((acc, curr) => acc + curr.totalCost, 0);

    return { shoppingList: list, totalEstimatedPrice: total };
  }, [kitchenOrder]);

  if (isLoading) {
    return <div className="min-h-screen bg-background pt-20 flex items-center justify-center">Carregando...</div>;
  }

  if (!ordem) {
    return <div className="min-h-screen bg-background pt-20 flex items-center justify-center">Ordem não encontrada</div>;
  }

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
    <div className="min-h-screen flex flex-col bg-background pt-20">
      {/* Chef AppBar */}
      <ChefMenu activeItem="agenda" />

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-6 max-w-4xl mx-auto w-full">
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
            <h1 className="text-2xl font-light text-gray-900">Ordem de Cozinha</h1>
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
                  <p className="text-sm text-gray-600 font-normal">#{String(ordem.code)}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{new Date(ordem.date).toLocaleDateString('pt-BR')}{ordem.time ? ` às ${ordem.time}` : ''}</span>
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
                  <h3 className="font-light text-lg">{ordem.client.name}</h3>
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
                  <span className="font-light text-lg">{ordem.budget}</span>
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
                      onClick={handleAccept}
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
                      onClick={handleDecline}
                    >
                      Confirmar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Menu - Only for CONFIRMADO status and NOT Special Service */}
          {ordem.status === "confirmado" && ordem.type !== "Special Service" && (
            <Card>
              <CardHeader>
                <CardTitle>Menu Planejado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ordem.dishes && ordem.dishes.length > 0 ? (
                    ordem.dishes.map((item, index) => {
                      const dish = item.dish;
                      const dishPhoto = dish.photoUrl ? resolveMediaUrl(dish.photoUrl) : undefined;
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                          <img
                            src={dishPhoto || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop"}
                            alt={dish.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <span className="font-medium block">{dish.name}</span>
                            <span className="text-xs text-gray-500 font-medium">Quantidade: {item.quantity}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center py-6 text-gray-500 text-sm">
                      Nenhum prato selecionado.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Menu Proposto - Only for Special Service */}
          {ordem.type === "Special Service" && (
            <Card className="border-[#F5A623] border-t-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  Menu Proposto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {kitchenOrder && kitchenOrder.client_request && (
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-gray-700">Solicitação do Cliente:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                      "{String(kitchenOrder.client_request)}"
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700">Itens do Menu Proposto:</h4>
                  {proposalItems.length > 0 ? (
                    <>
                      <div className="border border-gray-100 rounded-lg divide-y divide-gray-100 overflow-hidden bg-white">
                        {proposalItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 text-sm">
                            <span className="text-gray-600 font-medium">{item.name}</span>
                            <span className="font-semibold text-gray-800">
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2 font-semibold text-base border-t border-dashed">
                        <span className="text-gray-800">Valor Total da Proposta</span>
                        <span className="text-amber-600">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(proposalTotalPrice)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Nenhum item proposto cadastrado.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}


          {/* Technical Sheet and Shopping List Buttons - Only for CONFIRMADO and not Special Service */}
          {ordem.status === "confirmado" && (
            <div className="flex flex-col gap-3">
              {ordem.type !== "Special Service" && (
                <>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Receitas dos Pratos
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Receitas dos Pratos</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3 mt-2">
                        {ordem.dishes && ordem.dishes.length > 0 ? (
                          ordem.dishes.map((item, index) => {
                            const dish = item.dish;
                            const hasReceita = !!dish.receita;
                            return (
                              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-5 h-5 text-gray-400" />
                                  <span className="font-medium text-sm">{dish.name}</span>
                                </div>
                                {hasReceita ? (
                                  <Button
                                    size="sm"
                                    onClick={() => window.open(resolveMediaUrl(dish.receita), '_blank')}
                                    className="bg-[#0E4684] hover:bg-[#0a3769] text-white font-medium"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Baixar Receita
                                  </Button>
                                ) : (
                                  <span className="text-xs text-gray-500 italic">Não disponível</span>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-4">Nenhum prato disponível.</p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

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
                          {shoppingList.length > 0 ? (
                            shoppingList.map((item, index) => (
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
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 text-center py-4">
                              Nenhum ingrediente cadastrado para estes pratos.
                            </p>
                          )}
                          {totalEstimatedPrice > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex justify-between items-center font-light text-lg">
                                <span>Valor Estimado da Compra</span>
                                <span className="text-green-600">
                                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalEstimatedPrice)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {/* Receipt and Complete Service */}
              <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full",
                      hasReceipt && "bg-green-600 hover:bg-green-700 text-white border-green-600"
                    )}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {hasReceipt ? "Recibo de Compra Enviado (Clique para alterar)" : "Enviar Recibo de Compra"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Enviar Recibo de Compra</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="receipt-file">Anexar recibo (Imagem ou PDF)</Label>
                      <Input
                        id="receipt-file"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setUploadedFiles(files);
                        }}
                      />

                      {/* Lista de arquivos anexados */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-sm font-medium text-gray-700">Arquivo selecionado:</p>
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
                      <Label htmlFor="receipt-value">Valor total das compras (R$)</Label>
                      <Input
                        id="receipt-value"
                        type="text"
                        placeholder="0,00"
                        value={receiptValue}
                        onChange={handleReceiptValueChange}
                      />
                    </div>

                    <Button
                      className="w-full bg-[#0E4684] hover:bg-[#0a3769] text-white font-medium"
                      onClick={handleSendReceipt}
                      disabled={isSendingReceipt}
                    >
                      {isSendingReceipt ? "Enviando recibo..." : "Enviar Recibo"}
                    </Button>
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
                    onClick={(e) => {
                      if (isServiceCompleted) return;
                      if (!hasReceipt) {
                        e.preventDefault();
                        toast({
                          variant: "destructive",
                          title: "Comprovante pendente",
                          description: "É necessário enviar o recibo de compra de ingredientes antes de concluir o serviço.",
                        });
                        setIsReceiptDialogOpen(true);
                      }
                    }}
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
      <Footer />
    </div>
  );
};

export default OrdemDeCozinha;