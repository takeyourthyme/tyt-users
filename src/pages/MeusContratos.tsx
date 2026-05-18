import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, Eye, Calendar, ChefHat, Clock, CheckCircle, AlertCircle, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
const MeusContratos = () => {
  const navigate = useNavigate();
  const [filtroAtivo, setFiltroAtivo] = useState("ativos");

  // Mock data para contratos
  const contratos = {
    ativos: [{
      id: "MP-47",
      tipo: "meal-prep",
      titulo: "Cozinha Semanal",
      status: "ativo",
      porção: "Pequena (1-2 pessoas)",
      dia: "Segunda a tarde",
      valorSemanal: 280.00,
      inicio: "2024-12-01",
      proximoPagamento: "2025-01-15"
    }, {
      id: "EV-82",
      tipo: "evento",
      titulo: "Evento",
      status: "confirmado",
      data: "2025-01-20",
      menu: "Noite Italiana",
      tipoMenu: "Banquete",
      pessoas: 12,
      valor: 1200.00
    }, {
      id: "SE-39",
      tipo: "especial",
      titulo: "Serviço Especial",
      status: "aguardando_pagamento",
      dataSolicitada: "2025-01-15",
      preferencias: "Culinária mediterrânea",
      pessoas: 4,
      valor: 450.00
    }],
    antigos: [{
      id: "MP-15",
      tipo: "meal-prep",
      titulo: "Cozinha Semanal",
      status: "finalizado",
      porção: "Grande (4-6 pessoas)",
      periodo: "Dezembro 2024",
      valorTotal: 1120.00,
      dataFim: "2024-12-30"
    }, {
      id: "EV-64",
      tipo: "evento",
      titulo: "Evento",
      status: "concluido",
      data: "2024-11-15",
      menu: "Festa de Aniversário",
      tipoMenu: "Coquetel",
      pessoas: 25,
      valor: 2500.00
    }]
  };
  const contratosFiltrados = contratos[filtroAtivo as keyof typeof contratos];
  const getStatusBadge = (contrato: any) => {
    if (contrato.status === "confirmado") {
      return <Badge variant="outline" className="border-green-300 text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Confirmado
        </Badge>;
    }
    if (contrato.status === "aguardando_pagamento") {
      return <Badge className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100">
          <AlertCircle className="w-3 h-3 mr-1" />
          Aguardando pagamento
        </Badge>;
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
            Ativos ({contratos.ativos.length})
          </Button>
          <Button variant={filtroAtivo === "antigos" ? "default" : "outline"} onClick={() => setFiltroAtivo("antigos")} className="flex-1">
            Antigos ({contratos.antigos.length})
          </Button>
        </div>

        {/* Lista de Contratos */}
        <div className="space-y-4">
          {contratosFiltrados.map(contrato => <Card key={contrato.id} className={`bg-white shadow-md ${contrato.tipo === "meal-prep" ? "border-green-200" : contrato.tipo === "evento" ? "border-purple-200" : "border-orange-200"}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${contrato.tipo === "meal-prep" ? "bg-green-500" : contrato.tipo === "evento" ? "bg-purple-500" : "bg-orange-500"}`}>
                      {contrato.tipo === "meal-prep" ? <ChefHat className="w-4 h-4 text-white" /> : <Calendar className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-lg text-gray-800">{contrato.titulo}</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(contrato)}
                  </div>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Referência: #{contrato.id}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Conteúdo específico por tipo - Cozinha Semanal */}
                {contrato.tipo === "meal-prep" && <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Porção</p>
                        <p className="font-medium">{contrato.porção}</p>
                      </div>
                      {filtroAtivo === "ativos" ? <>
                          <div>
                            <p className="text-gray-500">Dia</p>
                            <p className="font-medium">{contrato.dia}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Valor semanal</p>
                            <p className="font-medium">R$ {contrato.valorSemanal?.toFixed(2)}</p>
                          </div>
                        </> : <>
                          <div>
                            <p className="text-gray-500">Período</p>
                            <p className="font-medium">{(contrato as any).periodo}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Valor total</p>
                            <p className="font-medium">R$ {(contrato as any).valorTotal?.toFixed(2)}</p>
                          </div>
                        </>}
                    </div>
                  </>}

                {/* Conteúdo específico por tipo - Evento */}
                {contrato.tipo === "evento" && <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Data</p>
                        <p className="font-medium">{new Date(contrato.data).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Menu</p>
                        <p className="font-medium">{contrato.menu}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Tipo</p>
                        <p className="font-medium">{contrato.tipoMenu}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Pessoas</p>
                        <p className="font-medium">{contrato.pessoas}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Valor estimado</p>
                        <p className="font-medium text-sm">R$ {contrato.valor.toFixed(2)}</p>
                      </div>
                    </div>
                  </>}

                {/* Conteúdo específico por tipo - Serviço Especial */}
                {contrato.tipo === "especial" && <>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Data solicitada</p>
                        <p className="font-medium">{new Date((contrato as any).dataSolicitada).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Nº de pessoas</p>
                        <p className="font-medium">{contrato.pessoas}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Valor</p>
                        <p className="font-medium">R$ {contrato.valor.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-500 text-sm">Preferências</p>
                      <p className="font-medium text-sm">{(contrato as any).preferencias}</p>
                    </div>
                  </>}

                <Separator />

                {/* Botões de ação */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {contrato.status === "aguardando_pagamento" && <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pagar agora
                    </Button>}
                  <Button variant="outline" className={`flex-1 ${contrato.tipo === "meal-prep" ? "border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800" : contrato.tipo === "evento" ? "border-purple-300 text-purple-700 hover:bg-purple-50 hover:text-purple-800" : "border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800"}`} onClick={() => navigate(`/detalhes-contrato/${contrato.id}`)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>)}
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