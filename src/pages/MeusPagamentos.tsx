import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ChefHat,
  Clock,
  UtensilsCrossed,
  DollarSign,
  MessageCircle,
  LogOut,
  Menu,
  ChevronLeft,
  Download,
  Eye,
  CalendarIcon,
  Search,
  Edit,
  BookOpen,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import logoWhite from "@/assets/tyt-logo-white.png";
import logoCompleta from "@/assets/logo-completa.webp";

import { useMemo } from "react";
import { loadSession, clearSession } from "@/services/authService";
import { getUserPhotoUrl } from "@/services/userService";

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
                  variant="default"
                  className="w-full justify-start h-12 text-base bg-tyt-blue-700 hover:bg-tyt-blue-800 text-white"
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

const MeusPagamentos = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const clientPhotos = {
    "João Santos": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    "Carlos Lima": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  };

  const pagamentos = [
    {
      id: 1,
      cliente: "Maria Silva",
      codigo: "CS-001",
      servico: "Cozinha Semanal",
      valor: 1800,
      data: "2025-01-15",
      status: "pago",
      referencia: "Janeiro 2025"
    },
    {
      id: 2,
      cliente: "João Santos",
      codigo: "EV-047",
      servico: "Evento",
      valor: 850,
      data: "2025-01-10",
      status: "pago",
      referencia: "Aniversário"
    },
    {
      id: 3,
      cliente: "Ana Costa",
      codigo: "CS-023",
      servico: "Cozinha Semanal",
      valor: 1600,
      data: "2025-01-05",
      status: "pendente",
      referencia: "Janeiro 2025"
    },
    {
      id: 4,
      cliente: "Carlos Lima",
      codigo: "SE-012",
      servico: "Serviço Especial",
      valor: 450,
      data: "2024-12-28",
      status: "pago",
      referencia: "Réveillon"
    }
  ];

  // Filter payments based on search term and date range
  const filteredPagamentos = pagamentos.filter(pagamento => {
    const matchesSearch = pagamento.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const paymentDate = new Date(pagamento.data);

    const matchesStartDate = !startDate || paymentDate >= startDate;
    const matchesEndDate = !endDate || paymentDate <= endDate;

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

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
            onClick={() => navigate('/dashboard-chef')}
            className="text-gray-600 hover:text-gray-900 p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meus Pagamentos</h1>
            <p className="text-gray-600">Acompanhe seus recebimentos e ganhos</p>
          </div>
        </div>

        {/* Seus Ganhos */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Seus Ganhos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl text-gray-900">R$ 850</div>
                <div className="text-xs text-gray-600 mt-1">Últimos 7 dias</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl text-gray-900">R$ 3.700</div>
                <div className="text-xs text-gray-600 mt-1">Últimos 30 dias</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl text-gray-900">R$ 18.900</div>
                <div className="text-xs text-gray-600 mt-1">Últimos 6 meses</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl text-gray-900">R$ 32.400</div>
                <div className="text-xs text-gray-600 mt-1">Últimos 12 meses</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Client Name Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome do cliente"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Start Date */}
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yyyy") : "Data inicial"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yyyy") : "Data final"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Histórico de Pagamentos</span>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead className="hidden md:table-cell">Serviço</TableHead>
                  <TableHead className="hidden md:table-cell">Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Valor</TableHead>
                  <TableHead className="hidden md:table-cell w-20"></TableHead>

                  {/* Mobile Headers */}
                  <TableHead className="md:hidden">Data/Serviço</TableHead>
                  <TableHead className="md:hidden w-12"></TableHead>
                  <TableHead className="md:hidden">Valor</TableHead>
                  <TableHead className="md:hidden w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPagamentos.map((pagamento) => (
                  <TableRow key={pagamento.id}>
                    {/* Desktop Layout */}
                    <TableCell className="hidden md:table-cell">
                      {new Date(pagamento.data).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div>
                        <div className="font-medium">{pagamento.servico}</div>
                        <div className="text-sm text-gray-500">{pagamento.codigo}</div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-3">
                        <img
                          src={clientPhotos[pagamento.cliente as keyof typeof clientPhotos]}
                          alt={pagamento.cliente}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="font-medium">{pagamento.cliente}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      R$ {pagamento.valor.toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>

                    {/* Mobile Layout */}
                    <TableCell className="md:hidden">
                      <div>
                        <div className="font-medium text-sm">{pagamento.servico}</div>
                        <div className="text-xs text-gray-500">{pagamento.codigo}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {new Date(pagamento.data).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="md:hidden p-2">
                      <img
                        src={clientPhotos[pagamento.cliente as keyof typeof clientPhotos]}
                        alt={pagamento.cliente}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </TableCell>
                    <TableCell className="md:hidden">
                      <div className="text-sm font-medium">
                        R$ {pagamento.valor.toLocaleString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell className="md:hidden p-2">
                      <Button variant="ghost" size="sm" className="p-1">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MeusPagamentos;