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
  Upload,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
} from "@/services/kitchenOrderService";
import { ChefMenu } from "@/components/ChefMenu";

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

  const [isLoading, setIsLoading] = useState(true);
  const [kitchenOrder, setKitchenOrder] = useState<KitchenOrder | null>(null);

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
  const handleCompleteService = async () => {
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
    } catch (error) {
      console.error("Erro ao concluir ordem:", error);
      toast({
        variant: "destructive",
        title: "Erro ao concluir serviço",
        description: "Ocorreu um problema ao finalizar a ordem.",
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
        ? kitchenOrder.dishes.map(d => typeof d === 'object' && d !== null && 'dish' in d ? (d.dish as Record<string, unknown>)?.name as string : "Prato")
        : ["Menu Personalizado"],
      observations: (kitchenOrder.observations as string) || (kitchenOrder.client_request as string) || "Sem observações adicionais.",
      budget: (kitchenOrder.service_value ?? (kitchenOrder as any).serviceValue)
        ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(kitchenOrder.service_value ?? (kitchenOrder as any).serviceValue))
        : "—"
    };
  }, [kitchenOrder, id]);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">Carregando...</div>;
  }

  if (!ordem) {
    return <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">Ordem não encontrada</div>;
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "Meal Prep":
        return ChefHat;
      case "Get Together":
        return Calendar;
      case "Special Service":
        return Clock;
      default:
        return ChefHat;
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case "Meal Prep":
        return "bg-green-500";
      case "Get Together":
        return "bg-purple-500";
      case "Special Service":
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
      <ChefMenu activeItem="agenda" />

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
            <h1 className="text-2xl font-light text-gray-900">Pendente de Comprovante</h1>
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
                  <p className="text-sm text-gray-600 font-normal">#{String(ordem.code || ordem.id)}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{new Date(ordem.date).toLocaleDateString('pt-BR')}{ordem.time ? ` às ${ordem.time}` : ''}</span>
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
