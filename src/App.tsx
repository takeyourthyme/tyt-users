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
import AprovacoesChef from "./pages/AprovacoesChef";
import Cardapio from "./pages/Cardapio";
import PratoDetalhes from "./pages/PratoDetalhes";
import EditarDadosPessoais from "./pages/EditarDadosPessoais";
import MeusContratos from "./pages/MeusContratos";
import DetalheContrato from "./pages/DetalheContrato";
import HistoricoPagamento from "./pages/HistoricoPagamento";
import GerenciarCartoes from "./pages/GerenciarCartoes";
import Contratacao from "./pages/Contratacao";
import EsqueciSenha from "./pages/EsqueciSenha";
import NotFound from "./pages/NotFound";
import { ClientRoute, ChefRoute, PublicClientRoute, GuestRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const AppContent = () => {
  useStatusBarColor();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="*" element={<NotFound />} />

      {/* Guest/Auth Routes */}
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/login/chef" element={<GuestRoute><LoginChef /></GuestRoute>} />
      <Route path="/cadastro" element={<GuestRoute><Cadastro /></GuestRoute>} />
      <Route path="/cadastro-chef" element={<GuestRoute><CadastroChef /></GuestRoute>} />
      <Route path="/cadastro-chef-sucesso" element={<GuestRoute><CadastroChefSucesso /></GuestRoute>} />
      <Route path="/esqueci-senha" element={<GuestRoute><EsqueciSenha /></GuestRoute>} />

      {/* Public Client Routes (Blocked for Chefs) */}
      <Route path="/pratos" element={<PublicClientRoute><Cardapio /></PublicClientRoute>} />
      <Route path="/prato/:id" element={<PublicClientRoute><PratoDetalhes /></PublicClientRoute>} />
      <Route path="/contratacao" element={<PublicClientRoute><Contratacao /></PublicClientRoute>} />

      {/* Protected Client Routes */}
      <Route path="/dashboard-cliente" element={<ClientRoute><DashboardCliente /></ClientRoute>} />
      <Route path="/editar-dados" element={<ClientRoute><EditarDadosPessoais /></ClientRoute>} />
      <Route path="/meus-contratos" element={<ClientRoute><MeusContratos /></ClientRoute>} />
      <Route path="/detalhes-contrato/:id" element={<ClientRoute><DetalheContrato /></ClientRoute>} />
      <Route path="/historico-pagamento" element={<ClientRoute><HistoricoPagamento /></ClientRoute>} />
      <Route path="/contratacao-logado" element={<ClientRoute><Contratacao /></ClientRoute>} />

      {/* Protected Chef Routes */}
      <Route path="/editar-cadastro-chef" element={<ChefRoute><EditarCadastroChef /></ChefRoute>} />
      <Route path="/dashboard-chef" element={<ChefRoute><DashboardChef /></ChefRoute>} />
      <Route path="/dashboard-chef2" element={<ChefRoute><DashboardChef2 /></ChefRoute>} />
      <Route path="/agenda-chef" element={<ChefRoute><AgendaChef /></ChefRoute>} />
      <Route path="/servicos-ativos" element={<ChefRoute><ServicosAtivos /></ChefRoute>} />
      <Route path="/ordem-de-cozinha/:id" element={<ChefRoute><OrdemDeCozinha /></ChefRoute>} />
      <Route path="/ordem-pendente/:id" element={<ChefRoute><OrdemPendente /></ChefRoute>} />
      <Route path="/servico-detalhes/:id" element={<ChefRoute><ServicoDetalhes /></ChefRoute>} />
      <Route path="/meus-pagamentos" element={<ChefRoute><MeusPagamentos /></ChefRoute>} />
      <Route path="/servicos-pendentes" element={<ChefRoute><AprovacoesChef /></ChefRoute>} />
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
