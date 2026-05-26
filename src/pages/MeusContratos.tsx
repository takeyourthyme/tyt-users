import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Eye, Calendar, ChefHat, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { loadSession } from "@/services/authService";
import {
  getKitchenOrderDate,
  getKitchenOrderLocation,
  getKitchenOrderTime,
  listKitchenOrders,
  normalizeKitchenOrderStatusLabel,
  normalizeKitchenOrderTypeLabel,
  type KitchenOrder,
} from "@/services/kitchenOrderService";

const getKitchenOrderCode = (order: KitchenOrder): string => {
  const candidates = [
    order.code,
    order.codigo,
    order.order_code,
    order.orderCode,
    order.id,
    order.kitchen_order_id,
    order.kitchenOrderId,
  ];
  const value = candidates.find((item) => typeof item === "string" || typeof item === "number");
  return value ? String(value) : "";
};
const MeusContratos = () => {
  const navigate = useNavigate();
  const [filtroAtivo, setFiltroAtivo] = useState("ativos");
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);

  useEffect(() => {
    const session = loadSession();
    if (!session?.token) return;

    listKitchenOrders({ token: session.token })
      .then((data) => {
        const orders = Array.isArray(data) ? data : (data as { orders?: unknown })?.orders;
        if (Array.isArray(orders)) setKitchenOrders(orders as KitchenOrder[]);
      })
      .catch(() => { });
  }, []);

  const { activeContracts, pastContracts } = useMemo(() => {
    const active: KitchenOrder[] = [];
    const past: KitchenOrder[] = [];

    kitchenOrders.forEach((order) => {
      const status = normalizeKitchenOrderStatusLabel(order);
      if (status === "concluido" || status === "cancelado") {
        past.push(order);
        return;
      }
      active.push(order);
    });

    return { activeContracts: active, pastContracts: past };
  }, [kitchenOrders]);

  const contratosFiltrados = filtroAtivo === "antigos" ? pastContracts : activeContracts;

  const getStatusBadge = (order: KitchenOrder) => {
    const status = normalizeKitchenOrderStatusLabel(order);
    if (status === "confirmado") {
      return (
        <Badge variant="outline" className="border-green-300 text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Confirmado
        </Badge>
      );
    }
    if (status === "pendente") {
      return (
        <Badge variant="outline" className="border-orange-300 text-orange-700">
          <AlertCircle className="w-3 h-3 mr-1" />
          Pendente
        </Badge>
      );
    }
    return null;
  };
  return <div className="min-h-screen bg-gray-50 pt-20">
    <AppHeader />

    <main className="p-4 space-y-6 max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard-cliente")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Serviços </h1>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button variant={filtroAtivo === "ativos" ? "default" : "outline"} onClick={() => setFiltroAtivo("ativos")} className="flex-1">
          Ativos ({activeContracts.length})
        </Button>
        <Button variant={filtroAtivo === "antigos" ? "default" : "outline"} onClick={() => setFiltroAtivo("antigos")} className="flex-1">
          Antigos ({pastContracts.length})
        </Button>
      </div>

      {/* Lista de Contratos */}
      <div className="space-y-4">
        {contratosFiltrados.map((contrato, index) => {
          const type = normalizeKitchenOrderTypeLabel(contrato);
          const code = getKitchenOrderCode(contrato);
          const date = getKitchenOrderDate(contrato);
          const time = getKitchenOrderTime(contrato);
          const location = getKitchenOrderLocation(contrato);
          const borderClass =
            type === "Cozinha Semanal" ? "border-green-200" : type === "Evento" ? "border-purple-200" : "border-orange-200";

          return (
            <Card key={code || `${type}-${index}`} className={`bg-white shadow-md ${borderClass}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${type === "Cozinha Semanal" ? "bg-green-500" : type === "Evento" ? "bg-purple-500" : "bg-orange-500"}`}>
                      {type === "Cozinha Semanal" ? <ChefHat className="w-4 h-4 text-white" /> : <Calendar className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-lg text-gray-800">{type}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(contrato)}
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Referência: #{code || "—"}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Data</p>
                    <p className="font-medium">{date ? date.toLocaleDateString("pt-BR") : "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Horário</p>
                    <p className="font-medium">{time || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Local</p>
                    <p className="font-medium">{location || "—"}</p>
                  </div>
                </div>

                <Separator />

                {/* Botões de ação */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className={`flex-1 ${type === "Cozinha Semanal" ? "border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800" : type === "Evento" ? "border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800" : "border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800"}`}
                    disabled={!code}
                    onClick={() => navigate(`/detalhes-contrato/${code}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {contratosFiltrados.length === 0 && <Card className="bg-white shadow-md">
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Nenhum contrato {filtroAtivo === "ativos" ? "ativo" : "antigo"} encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            {filtroAtivo === "ativos" ? "Você não possui contratos ativos no momento." : "Você não possui contratos anteriores."}
          </p>
          {filtroAtivo === "ativos" && <Button onClick={() => navigate("/dashboard-cliente")}>
            Contratar novo serviço
          </Button>}
        </CardContent>
      </Card>}
    </main>
  </div>;
};
export default MeusContratos;
