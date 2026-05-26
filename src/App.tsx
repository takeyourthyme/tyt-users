import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";
import { useStatusBarColor } from "./hooks/use-status-bar-color";
import Index from "./pages/Index";
import Login from "./pages/Login";
import LoginChef from "./pages/LoginChef";
import Cadastro from "./pages/Cadastro";
import CadastroChef from "./pages/CadastroChef";
import CadastroChefSucesso from "./pages/CadastroChefSucesso";
import EditarCadastroChef from "./pages/EditarCadastroChef";
import DashboardCliente from "./pages/DashboardCliente";
import DashboardChef from "./pages/DashboardChef";
import DashboardChef2 from "./pages/DashboardChef2";
import AgendaChef from "./pages/AgendaChef";
import ServicosAtivos from "./pages/ServicosAtivos";
import OrdemDeCozinha from "./pages/OrdemDeCozinha";
import OrdemPendente from "./pages/OrdemPendente";
import ServicoDetalhes from "./pages/ServicoDetalhes";
import MeusPagamentos from "./pages/MeusPagamentos";
import Cardapio from "./pages/Cardapio";
import PratoDetalhes from "./pages/PratoDetalhes";
import EditarDadosPessoais from "./pages/EditarDadosPessoais";
import MeusContratos from "./pages/MeusContratos";
import DetalheContrato from "./pages/DetalheContrato";
import HistoricoPagamento from "./pages/HistoricoPagamento";
import GerenciarCartoes from "./pages/GerenciarCartoes";
import Contratacao from "./pages/Contratacao";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  useStatusBarColor();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/login/chef" element={<LoginChef />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/cadastro-chef" element={<CadastroChef />} />
      <Route path="/cadastro-chef-sucesso" element={<CadastroChefSucesso />} />
      <Route path="/editar-cadastro-chef" element={<EditarCadastroChef />} />
      <Route path="/dashboard-cliente" element={<DashboardCliente />} />
      <Route path="/dashboard-chef" element={<DashboardChef />} />
      <Route path="/dashboard-chef2" element={<DashboardChef2 />} />
      <Route path="/agenda-chef" element={<AgendaChef />} />
      <Route path="/servicos-ativos" element={<ServicosAtivos />} />
      <Route path="/ordem-de-cozinha/:id" element={<OrdemDeCozinha />} />
      <Route path="/ordem-pendente/:id" element={<OrdemPendente />} />
      <Route path="/servico-detalhes/:id" element={<ServicoDetalhes />} />
      <Route path="/meus-pagamentos" element={<MeusPagamentos />} />
      <Route path="/cardapio" element={<Cardapio />} />
      <Route path="/prato/:id" element={<PratoDetalhes />} />
      <Route path="/editar-dados" element={<EditarDadosPessoais />} />
      <Route path="/meus-contratos" element={<MeusContratos />} />
      <Route path="/detalhes-contrato/:id" element={<DetalheContrato />} />
      <Route path="/historico-pagamento" element={<HistoricoPagamento />} />
      <Route path="/gerenciar-cartoes" element={<GerenciarCartoes />} />
      <Route path="/contratacao" element={<Contratacao />} />
      <Route path="/contratacao-logado" element={<Contratacao />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <ScrollToTop />
        <AppContent />
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
