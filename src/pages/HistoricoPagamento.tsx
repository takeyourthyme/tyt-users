import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Filter, Eye, ChefHat, PartyPopper, Users, Plus, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppMenu } from "@/components/AppMenu";
import visaIcon from "@/assets/visa-icon.png";
import mastercardIcon from "@/assets/mastercard-icon.png";

const HistoricoPagamento = () => {
  const navigate = useNavigate();
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [loading, setLoading] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);

  // Mock data para demonstração
  const [transacoes, setTransacoes] = useState([
    {
      id: 1,
      data: "2024-01-15",
      tipo: "credito",
      servico: "jantar",
      referencia: "TYT-2024-001",
      valor: 450.00,
      temComprovante: true,
      pagamento: { bandeira: "visa", ultimos4: "1234" }
    },
    {
      id: 2,
      data: "2024-01-10",
      tipo: "debito",
      servico: "almoco",
      referencia: "TYT-2024-002", 
      valor: 320.00,
      temComprovante: false,
      pagamento: { bandeira: "mastercard", ultimos4: "5678" }
    },
    {
      id: 3,
      data: "2024-01-05",
      tipo: "credito",
      servico: "evento",
      referencia: "TYT-2024-003",
      valor: 1200.00,
      temComprovante: true,
      pagamento: { bandeira: "visa", ultimos4: "9012" }
    },
    {
      id: 4,
      data: "2023-12-20",
      tipo: "debito",
      servico: "jantar",
      referencia: "TYT-2023-045",
      valor: 380.00,
      temComprovante: true,
      pagamento: { bandeira: "mastercard", ultimos4: "3456" }
    },
    {
      id: 5,
      data: "2023-12-15",
      tipo: "credito",
      servico: "almoco",
      referencia: "TYT-2023-044",
      valor: 280.00,
      temComprovante: false,
      pagamento: { bandeira: "visa", ultimos4: "7890" }
    }
  ]);

  // Mock para simular mais dados
  const transacoesAdicionais = [
    {
      id: 6,
      data: "2023-12-10",
      tipo: "credito",
      servico: "evento",
      referencia: "TYT-2023-043",
      valor: 850.00,
      temComprovante: true,
      pagamento: { bandeira: "mastercard", ultimos4: "2468" }
    },
    {
      id: 7,
      data: "2023-12-05",
      tipo: "debito",
      servico: "jantar",
      referencia: "TYT-2023-042",
      valor: 420.00,
      temComprovante: false,
      pagamento: { bandeira: "visa", ultimos4: "1357" }
    }
  ];

  const getServicoIcon = (servico: string) => {
    switch (servico) {
      case "jantar":
      case "almoco":
        return <ChefHat className="h-4 w-4 text-green-600" />;
      case "evento":
        return <PartyPopper className="h-4 w-4 text-purple-600" />;
      case "especial":
        return <Users className="h-4 w-4 text-orange-600" />;
      default:
        return <ChefHat className="h-4 w-4 text-green-600" />;
    }
  };

  const getBandeiraIcon = (bandeira: string) => {
    const baseClasses = "h-3 w-3 object-contain";
    switch (bandeira) {
      case "visa":
        return <img src={visaIcon} alt="Visa" className={baseClasses} />;
      case "mastercard":
        return <img src={mastercardIcon} alt="Mastercard" className={baseClasses} />;
      default:
        return <img src={visaIcon} alt="Cartão" className={baseClasses} />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleCarregarMais = () => {
    setLoading(true);
    // Simular carregamento e adicionar mais transações
    setTimeout(() => {
      setTransacoes(prev => [...prev, ...transacoesAdicionais]);
      setLoading(false);
    }, 1500);
  };

  const handleFiltrar = () => {
    console.log("Filtrar por período:", { dataInicial, dataFinal });
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <AppMenu />
      
      <div className="container mx-auto px-4 py-6">
        {/* Título da página */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard-cliente")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-h2">Histórico de Pagamento</h1>
        </div>

        {/* Filtros de data */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <Collapsible open={filtrosAbertos} onOpenChange={setFiltrosAbertos}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="h-4 w-4" />
                  Filtros
                  <ChevronDown className={`h-4 w-4 transition-transform ${filtrosAbertos ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                  <div className="w-full">
                    <Label htmlFor="dataInicial">Data Inicial</Label>
                    <Input
                      id="dataInicial"
                      type="date"
                      value={dataInicial}
                      onChange={(e) => setDataInicial(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="w-full">
                    <Label htmlFor="dataFinal">Data Final</Label>
                    <Input
                      id="dataFinal"
                      type="date"
                      value={dataFinal}
                      onChange={(e) => setDataFinal(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button onClick={handleFiltrar} className="w-full sm:w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Tabela de transações - Desktop */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Comprovante</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transacoes.map((transacao, index) => (
                  <TableRow 
                    key={transacao.id}
                    className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <div>{formatDate(transacao.data)}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getBandeiraIcon(transacao.pagamento.bandeira)}
                          <span>{transacao.pagamento.ultimos4}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getServicoIcon(transacao.servico)}
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-primary"
                          onClick={() => navigate(`/detalhes-contrato/${transacao.referencia}`)}
                        >
                          {transacao.referencia}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {transacao.tipo === "credito" ? (
                          <Plus className="h-3 w-3 text-success-600" />
                        ) : null}
                        <span className={transacao.tipo === "credito" ? "text-success-600" : "text-foreground"}>
                          {formatCurrency(transacao.valor)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {transacao.temComprovante && (
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Lista mobile */}
        <div className="md:hidden space-y-4">
          {transacoes.map((transacao, index) => (
            <Card key={transacao.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/30"}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getServicoIcon(transacao.servico)}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-primary text-sm"
                        onClick={() => navigate(`/detalhes-contrato/${transacao.referencia}`)}
                      >
                        {transacao.referencia}
                      </Button>
                    </div>
                  </div>
                  {transacao.temComprovante && (
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    <span className="text-muted-foreground">{formatDate(transacao.data)}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {getBandeiraIcon(transacao.pagamento.bandeira)}
                      <span>{transacao.pagamento.ultimos4}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {transacao.tipo === "credito" ? (
                      <Plus className="h-3 w-3 text-success-600" />
                    ) : null}
                    <span className={transacao.tipo === "credito" ? "text-success-600 font-medium" : "text-foreground font-medium"}>
                      {formatCurrency(transacao.valor)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Botão carregar mais */}
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            onClick={handleCarregarMais}
            disabled={loading}
          >
            {loading ? "Carregando..." : "Carregar Mais"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HistoricoPagamento;