import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Calendar,
  ChefHat,
  Clock,
  MapPin,
  User,
  UtensilsCrossed,
  DollarSign,
  MessageCircle,
  LogOut,
  Menu,
  ChevronLeft,
  Eye,
  Search,
  Filter,
  Edit,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { clearSession, loadSession } from "@/services/authService";
import {
  getKitchenOrderClient,
  getKitchenOrderDate,
  getKitchenOrderLocation,
  getKitchenOrderTime,
  listKitchenOrders,
  normalizeKitchenOrderStatusLabel,
  normalizeKitchenOrderTypeLabel,
  getKitchenOrderCode,
  getKitchenOrderByCode,
  type KitchenOrder,
} from "@/services/kitchenOrderService";
import { getUserPhotoUrl } from "@/services/userService";
import { ChefMenu } from "@/components/ChefMenu";

const AgendaChef = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    clientName: "",
    dateRange: { start: "", end: "" },
    serviceType: "",
    status: ""
  });
  const [appliedFilters, setAppliedFilters] = useState({
    clientName: "",
    dateRange: { start: "", end: "" },
    serviceType: "",
    status: "",
    searchTerm: "",
    isPendentesFilter: false
  });
  const [sectionTitle, setSectionTitle] = useState("Próximos Compromissos");
  const [hasActiveFilter, setHasActiveFilter] = useState(false);
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);

  // Reset to default agenda and scroll
  const handleGoAgenda = () => {
    setSearchTerm("");
    setFilters({ clientName: "", dateRange: { start: "", end: "" }, serviceType: "", status: "" });
    setAppliedFilters({ clientName: "", dateRange: { start: "", end: "" }, serviceType: "", status: "", searchTerm: "", isPendentesFilter: false });
    setSectionTitle("Próximos Compromissos");
    setHasActiveFilter(false);
    setTimeout(() => {
      const element = document.getElementById('proximos-compromissos');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Scroll to proximos-compromissos on mount if hash is present or filter in state
  React.useEffect(() => {
    const state = location.state as { filter?: string; scrollTo?: string; clear?: boolean } | null;

    if (state?.clear) {
      handleGoAgenda();
      return;
    }

    if (state?.filter) {
      // Apply filter from navigation state
      setAppliedFilters(prev => ({
        ...prev,
        serviceType: state.filter === "servicos-semanais" ? "Cozinha Semanal" :
          state.filter === "eventos" ? "Evento" :
            state.filter === "servicos-especiais" ? "Serviço Especial" : "",
        status: state.filter === "pendentes" ? "confirmado" : "",
        isPendentesFilter: state.filter === "pendentes"
      }));

      // Mark that there's an active filter from dashboard
      setHasActiveFilter(true);

      // Update section title based on filter
      if (state.filter === "servicos-semanais") {
        setSectionTitle("Serviços Semanais");
      } else if (state.filter === "eventos") {
        setSectionTitle("Eventos");
      } else if (state.filter === "servicos-especiais") {
        setSectionTitle("Serviços Especiais");
      } else if (state.filter === "pendentes") {
        setSectionTitle("Serviços Pendentes de Comprovante");
      }
    } else {
      setSectionTitle("Próximos Compromissos");
      setHasActiveFilter(false);
    }

    if (window.location.hash === '#proximos-compromissos' || state?.scrollTo === 'proximos-compromissos') {
      setTimeout(() => {
        const element = document.getElementById('proximos-compromissos');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

  useEffect(() => {
    const session = loadSession();
    if (!session?.token) return;
    listKitchenOrders({ token: session.token })
      .then(async (data) => {
        const orders = Array.isArray(data)
          ? data
          : (data as { data?: unknown })?.data ?? (data as { orders?: unknown })?.orders;
        if (Array.isArray(orders)) {
          const chefUserId = session.userId ?? (session.user as any)?.id;
          const chefProfileId = (session.user as any)?.usuario_chef?.id ?? (session.user as any)?.chef?.id;
          const filtered = (orders as KitchenOrder[]).filter((order) => {
            const orderChefId = (order.chef as { id?: number } | null)?.id;
            return Number(orderChefId) === Number(chefUserId) || Number(orderChefId) === Number(chefProfileId);
          });

          const detailedOrders = await Promise.all(
            filtered.map(async (order) => {
              try {
                const code = getKitchenOrderCode(order);
                const detail = await getKitchenOrderByCode({ token: session.token!, code });
                const detailData = (detail as any).data ?? detail;
                return detailData as KitchenOrder;
              } catch (e) {
                return order;
              }
            })
          );
          setKitchenOrders(detailedOrders);
        }
      })
      .catch((err) => {
        console.error("Falha ao carregar pedidos:", err);
        toast({
          variant: "destructive",
          title: "Não foi possível carregar seus serviços",
          description: "Tente novamente em instantes.",
        });
      });
  }, [toast]);

  const toYMD = (d: Date) => format(d, "yyyy-MM-dd");

  const agendaItems = useMemo(() => {
    return kitchenOrders
      .map((order) => {
        const id = getKitchenOrderCode(order);
        const dateObj = getKitchenOrderDate(order);
        const date = dateObj ? toYMD(dateObj) : toYMD(new Date());
        const time = getKitchenOrderTime(order);
        const client = getKitchenOrderClient(order);
        const type = normalizeKitchenOrderTypeLabel(order);
        const status = normalizeKitchenOrderStatusLabel(order);
        const location = getKitchenOrderLocation(order) || "—";

        return {
          id,
          type,
          date,
          time,
          location,
          client,
          status,
        };
      })
      .filter((item) => Boolean(item.id));
  }, [kitchenOrders]);

  // Filter events based on applied filters and quick search
  const filteredAgendaItems = useMemo(() => {
    return agendaItems.filter(item => {
      // Quick search term filter (dynamic)
      const matchesQuickSearch = !searchTerm ||
        item.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase());

      // Advanced filters (only applied when user clicks search)
      const matchesClientName = !appliedFilters.clientName ||
        item.client.name.toLowerCase().includes(appliedFilters.clientName.toLowerCase());

      const matchesDateRange = (!appliedFilters.dateRange.start || item.date >= appliedFilters.dateRange.start) &&
        (!appliedFilters.dateRange.end || item.date <= appliedFilters.dateRange.end);

      const matchesServiceType = !appliedFilters.serviceType || item.type === appliedFilters.serviceType;

      const matchesStatus = !appliedFilters.status || item.status === appliedFilters.status;

      // Special filter for "Pendentes de Comprovante": exclude "Serviço Especial"
      const isPendentesFilterValid = !appliedFilters.isPendentesFilter || item.type !== "Serviço Especial";

      return matchesQuickSearch && matchesClientName && matchesDateRange && matchesServiceType && matchesStatus && isPendentesFilterValid;
    }).sort((a, b) => {
      // Sort by status: pendentes first, then confirmados
      if (a.status === "pendente" && b.status !== "pendente") return -1;
      if (a.status !== "pendente" && b.status === "pendente") return 1;
      // If same status, maintain original order (by date)
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [agendaItems, searchTerm, appliedFilters]);

  // Get events for selected date
  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredAgendaItems.filter(item => item.date === dateStr);
  };

  // Get all dates that have events
  const getDatesWithEvents = () => {
    return filteredAgendaItems.map(item => new Date(item.date + 'T00:00:00'));
  };

  // Check if a date has events
  const dateHasEvents = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return filteredAgendaItems.some(item => item.date === dateStr);
  };

  // Handle advanced search
  const handleAdvancedSearch = () => {
    setAppliedFilters({
      ...filters,
      searchTerm: "",
      isPendentesFilter: false
    });
    setIsFilterOpen(false);
  };

  // Filter events for selected date
  const selectedDateEvents = getEventsForDate(selectedDate);

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

  // Função para determinar a rota de destino baseado no filtro ativo
  const getOrderRoute = (itemId: string) => {
    if (appliedFilters.isPendentesFilter) {
      return `/ordem-pendente/${itemId}`;
    }
    return `/ordem-de-cozinha/${itemId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Chef AppBar */}
      <ChefMenu activeItem="agenda" hasActiveFilter={hasActiveFilter} onGoAgenda={handleGoAgenda} />

      {/* Main Content */}
      <main className="p-4 space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard-chef')}
            className="text-gray-600 hover:text-gray-900 p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Minha Agenda</h1>
            <p className="text-gray-600">Gerencie seus compromissos e horários</p>
          </div>
        </div>

        {/* Calendar and Events Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Calendar Section */}
          <Card className="p-6 flex flex-col h-full lg:min-h-[480px]">
            <CardHeader className="p-0 mb-4 flex-shrink-0">
              <CardTitle className="text-lg font-semibold">Calendário</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                  }
                }}
                className="w-full lg:h-full pointer-events-auto"
                classNames={{
                  months: "w-full h-full flex flex-col",
                  month: "w-full h-full flex flex-col",
                  table: "w-full h-full",
                  row: "grid grid-cols-7 gap-y-1 flex-1",
                  head_row: "grid grid-cols-7",
                  head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                  cell: "p-0 m-0",
                  day: "w-full h-10 sm:h-12 md:h-14 lg:h-16 p-0 font-normal aria-selected:opacity-100",
                  day_selected: "!bg-blue-500 !text-white hover:!bg-blue-600 focus:!bg-blue-600 rounded-md",
                }}
                modifiers={{
                  hasEvent: (date) => dateHasEvents(date)
                }}
                modifiersClassNames={{
                  hasEvent: "bg-tyt-yellow-500/20 text-tyt-yellow-700 font-semibold rounded-md relative after:absolute after:bottom-1 after:left-1/2 after:transform after:-translate-x-1/2 after:w-1 after:h-1 after:bg-tyt-yellow-600 after:rounded-full"
                }}
              />
            </CardContent>
          </Card>

          {/* Events Section */}
          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg font-semibold">
                Serviços do dia {selectedDate.toLocaleDateString('pt-BR')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum serviço agendado para este dia</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedDateEvents.map((item) => {
                    const IconComponent = getServiceIcon(item.type);
                    return (
                      <Card key={item.id} className="bg-white border-gray-200 shadow-sm cursor-pointer" onClick={() => navigate(getOrderRoute(item.id))}>
                        <CardContent className="p-3">
                          {/* Desktop Layout */}
                          <div className="hidden md:flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                <img
                                  src={item.client.photo}
                                  alt={item.client.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-800 text-sm truncate">{item.type}</span>
                                  <span className="text-xs text-gray-500 font-normal bg-gray-100 px-1.5 py-0.5 rounded">#{item.id}</span>
                                  <Badge className={cn("text-xs pointer-events-none", getStatusColor(item.status))}>
                                    {item.status}
                                  </Badge>
                                </div>

                                <div className="text-xs text-gray-600 space-y-0.5">
                                  {item.time && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 flex-shrink-0" />
                                      <span>{item.time}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{item.client.name}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              className="p-2 h-8 w-8 flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(getOrderRoute(item.id));
                              }}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Mobile Layout */}
                          <div className="md:hidden">
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-8 h-8 ${getServiceColor(item.type)} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-800 text-sm">{item.type}</span>
                                  <span className="text-xs text-gray-500 font-normal bg-gray-100 px-1.5 py-0.5 rounded">#{item.id}</span>
                                  <Badge className={cn("text-xs pointer-events-none", getStatusColor(item.status))}>
                                    {item.status}
                                  </Badge>
                                </div>

                                <div className="text-xs text-gray-600 space-y-0.5">
                                  {item.time && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 flex-shrink-0" />
                                      <span>{item.time}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Client info and button below on mobile */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img
                                  src={item.client.photo}
                                  alt={item.client.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <span className="text-sm text-gray-700 font-medium">{item.client.name}</span>
                              </div>

                              <Button
                                size="sm"
                                variant="outline"
                                className="px-2 py-1 h-auto text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(getOrderRoute(item.id));
                                }}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                VER DETALHES
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-4" id="proximos-compromissos">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {sectionTitle}
            </h3>
          </div>

          {/* Search Bar */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Pesquisar por nome do cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="px-3">
                    <Filter className="w-4 h-4" />
                  </Button>
                </CollapsibleTrigger>
              </Collapsible>
            </div>

            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <CollapsibleContent className="bg-white border rounded-lg shadow-sm p-4 space-y-3 mt-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nome do Cliente</label>
                  <Input
                    placeholder="Digite o nome do cliente..."
                    value={filters.clientName}
                    onChange={(e) => setFilters({ ...filters, clientName: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Data Início</label>
                    <Input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Data Fim</label>
                    <Input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => setFilters({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Tipo de Serviço</label>
                  <Select value={filters.serviceType} onValueChange={(value) => setFilters({ ...filters, serviceType: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cozinha Semanal">Cozinha Semanal</SelectItem>
                      <SelectItem value="Evento">Evento</SelectItem>
                      <SelectItem value="Serviço Especial">Serviço Especial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmado">Confirmado</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleAdvancedSearch}
                  className="w-full"
                >
                  BUSCAR
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="space-y-3">
            {filteredAgendaItems.map((item) => {
              const IconComponent = getServiceIcon(item.type);
              return (
                <Card key={item.id} className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(getOrderRoute(item.id))}>
                  <CardContent className="p-4">
                    {/* Desktop Layout */}
                    <div className="hidden md:flex items-start justify-between gap-3">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`w-10 h-10 ${getServiceColor(item.type)} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800">{item.type}</span>
                            <span className="text-xs text-gray-500 font-normal bg-gray-100 px-1.5 py-0.5 rounded">#{item.id}</span>
                            <Badge className={cn("pointer-events-none", getStatusColor(item.status))}>
                              {item.status}
                            </Badge>
                          </div>

                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.date).toLocaleDateString('pt-BR')}{item.time ? ` às ${item.time}` : ''}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {item.location}
                            </div>
                          </div>
                        </div>

                        {/* Client info on the right side */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <img
                            src={item.client.photo}
                            alt={item.client.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-700 font-medium">{item.client.name}</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="p-2 h-8 w-8 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(getOrderRoute(item.id));
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Mobile Layout */}
                    <div className="md:hidden">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`w-10 h-10 ${getServiceColor(item.type)} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800">{item.type}</span>
                            <span className="text-xs text-gray-500 font-normal bg-gray-100 px-1.5 py-0.5 rounded">#{item.id}</span>
                            <Badge className={cn("pointer-events-none", getStatusColor(item.status))}>
                              {item.status}
                            </Badge>
                          </div>

                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.date).toLocaleDateString('pt-BR')}{item.time ? ` às ${item.time}` : ''}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {item.location}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Client info and button below on mobile */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={item.client.photo}
                            alt={item.client.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-700 font-medium">{item.client.name}</span>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="px-3 py-1 h-auto text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(getOrderRoute(item.id));
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          VER DETALHES
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgendaChef;
