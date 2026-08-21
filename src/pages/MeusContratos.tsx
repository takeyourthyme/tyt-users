import React, { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Eye, Calendar, ChefHat, CheckCircle, AlertCircle, Utensils, Martini, PartyPopper } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { loadSession } from "@/services/authService";
import {
  getKitchenOrderByCode,
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
  const [filtroAtivo, setFiltroAtivo] = useState("ativos"); // "ativos" | "pendentes" | "antigos"
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contractsDetails, setContractsDetails] = useState<Record<string, KitchenOrder>>({});
  const fetchedCodesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const session = loadSession();
    if (!session?.token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    listKitchenOrders({ token: session.token })
      .then((data) => {
        const orders = (() => {
          if (Array.isArray(data)) return data;
          if (data && typeof data === "object") {
            const record = data as Record<string, unknown>;
            const candidates = [record.orders, record.data, record.items, record.results];
            const list = candidates.find((value) => Array.isArray(value));
            if (Array.isArray(list)) return list;
          }
          return undefined;
        })();
        if (Array.isArray(orders)) setKitchenOrders(orders as KitchenOrder[]);
      })
      .catch(() => { })
      .finally(() => setIsLoading(false));
  }, []);

  const { activeContracts, pendingContracts, pastContracts } = useMemo(() => {
    const active: KitchenOrder[] = [];
    const pending: KitchenOrder[] = [];
    const past: KitchenOrder[] = [];

    kitchenOrders.forEach((order) => {
      const status = normalizeKitchenOrderStatusLabel(order);
      if (status === "concluido" || status === "cancelado") {
        past.push(order);
        return;
      }
      if (status === "pendente") {
        pending.push(order);
        return;
      }
      active.push(order);
    });

    return { activeContracts: active, pendingContracts: pending, pastContracts: past };
  }, [kitchenOrders]);

  useEffect(() => {
    const session = loadSession();
    if (!session?.token) return;

    const targetContracts = [...activeContracts, ...pendingContracts];

    targetContracts.forEach((order) => {
      const code = getKitchenOrderCode(order);
      if (!code || fetchedCodesRef.current.has(code)) return;

      fetchedCodesRef.current.add(code);

      getKitchenOrderByCode({ token: session.token, code })
        .then((res) => {
          if (res && typeof res === "object") {
            const detail = (res as any).data && typeof (res as any).data === "object" && !Array.isArray((res as any).data)
              ? (res as any).data
              : res;
            if (detail && typeof detail === "object" && !Array.isArray(detail)) {
              const matchedOrder = targetContracts.find(o => getKitchenOrderCode(o) === code);
              const mergedDetail = {
                ...matchedOrder,
                ...detail,
                service_value: (detail.service_value !== undefined && detail.service_value !== null && Number(detail.service_value) !== 0)
                  ? detail.service_value
                  : (matchedOrder?.service_value ?? (matchedOrder as any)?.serviceValue ?? detail.service_value)
              };
              setContractsDetails((prev) => ({
                ...prev,
                [code]: mergedDetail as KitchenOrder,
              }));
            }
          }
        })
        .catch(() => {
          fetchedCodesRef.current.delete(code);
        });
    });
  }, [activeContracts, pendingContracts]);

  const contratosFiltrados = useMemo(() => {
    if (filtroAtivo === "antigos") return pastContracts;
    if (filtroAtivo === "pendentes") return pendingContracts;
    return activeContracts;
  }, [filtroAtivo, activeContracts, pendingContracts, pastContracts]);

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
  return (
    <div className="min-h-screen flex flex-col bg-background pt-20">
      <AppHeader />

      <main className="flex-1 p-4 space-y-6 max-w-4xl mx-auto w-full">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/inicio")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-light">Serviços </h1>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant={filtroAtivo === "ativos" ? "default" : "outline"} onClick={() => setFiltroAtivo("ativos")} className="flex-1">
          Ativos ({isLoading ? "..." : activeContracts.length})
        </Button>
        <Button variant={filtroAtivo === "pendentes" ? "default" : "outline"} onClick={() => setFiltroAtivo("pendentes")} className="flex-1">
          Pendentes ({isLoading ? "..." : pendingContracts.length})
        </Button>
        <Button variant={filtroAtivo === "antigos" ? "default" : "outline"} onClick={() => setFiltroAtivo("antigos")} className="flex-1">
          Antigos ({isLoading ? "..." : pastContracts.length})
        </Button>
      </div>

      {/* Lista de Contratos */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="bg-white shadow-md border-gray-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-5 w-36" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-28 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-5 w-48" />
                  </div>
                </div>
                <Separator />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          contratosFiltrados.map((contrato, index) => {
            const type = normalizeKitchenOrderTypeLabel(contrato);
            const code = getKitchenOrderCode(contrato);
            const detail = contractsDetails[code] || contrato;
            const date = getKitchenOrderDate(detail);
            const time = getKitchenOrderTime(detail);
            const location = getKitchenOrderLocation(detail);
            const borderClass =
              type === "Meal Prep" ? "border-[#EF3F0D]/20" : type === "Get Together" ? "border-[#BC008F]/20" : "border-[#89CDD2]/20";

            return (
              <Card key={code || `${type}-${index}`} className={`bg-white shadow-md ${borderClass}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${type === "Meal Prep" ? "bg-[#EF3F0D]" : type === "Get Together" ? "bg-[#BC008F]" : "bg-[#89CDD2]"}`}>
                        {type === "Meal Prep" ? <Utensils className="w-4 h-4 text-white" /> : type === "Get Together" ? <Martini className="w-4 h-4 text-white" /> : <PartyPopper className="w-4 h-4 text-white" />}
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
                      className={`flex-1`}
                      disabled={!code}
                      onClick={() => navigate(`/meus-pedidos/${code}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {!isLoading && contratosFiltrados.length === 0 && <Card className="bg-white shadow-md">
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-light text-gray-800 mb-2">
            Nenhum contrato {filtroAtivo === "ativos" ? "ativo" : filtroAtivo === "pendentes" ? "pendente" : "antigo"} encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            {filtroAtivo === "ativos"
              ? "Você não possui contratos ativos no momento."
              : filtroAtivo === "pendentes"
                ? "Você não possui contratos pendentes no momento."
                : "Você não possui contratos anteriores."}
          </p>
          {(filtroAtivo === "ativos" || filtroAtivo === "pendentes") && <Button onClick={() => navigate("/inicio")}>
            Contratar novo serviço
          </Button>}
        </CardContent>
      </Card>}
    </main>
    <Footer />
  </div>
  );
};
export default MeusContratos;
