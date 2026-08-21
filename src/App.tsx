import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
      <Route path="/entrar" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/chef/entrar" element={<GuestRoute><LoginChef /></GuestRoute>} />
      <Route path="/cadastro" element={<GuestRoute><Cadastro /></GuestRoute>} />
      <Route path="/chef/cadastro" element={<GuestRoute><CadastroChef /></GuestRoute>} />
      <Route path="/chef/cadastro/status" element={<CadastroChefSucesso />} />
      <Route path="/recuperar-senha" element={<GuestRoute><EsqueciSenha /></GuestRoute>} />

      {/* Public Client Routes (Blocked for Chefs) */}
      <Route path="/cardapio" element={<PublicClientRoute><Cardapio /></PublicClientRoute>} />
      <Route path="/cardapio/:id" element={<PublicClientRoute><PratoDetalhes /></PublicClientRoute>} />
      <Route path="/contratar" element={<PublicClientRoute><Contratacao /></PublicClientRoute>} />

      {/* Protected Client Routes */}
      <Route path="/inicio" element={<ClientRoute><DashboardCliente /></ClientRoute>} />
      <Route path="/minha-conta" element={<ClientRoute><EditarDadosPessoais /></ClientRoute>} />
      <Route path="/meus-pedidos" element={<ClientRoute><MeusContratos /></ClientRoute>} />
      <Route path="/meus-pedidos/:id" element={<ClientRoute><DetalheContrato /></ClientRoute>} />
      <Route path="/pagamentos" element={<ClientRoute><HistoricoPagamento /></ClientRoute>} />
      <Route path="/cartoes" element={<ClientRoute><GerenciarCartoes /></ClientRoute>} />

      {/* Protected Chef Routes */}
      <Route path="/chef/inicio" element={<ChefRoute><DashboardChef /></ChefRoute>} />
      <Route path="/chef/agenda" element={<ChefRoute><AgendaChef /></ChefRoute>} />
      <Route path="/chef/servicos" element={<ChefRoute><ServicosAtivos /></ChefRoute>} />
      <Route path="/chef/pendentes" element={<ChefRoute><AprovacoesChef /></ChefRoute>} />
      <Route path="/chef/servicos/:id" element={<ChefRoute><ServicoDetalhes /></ChefRoute>} />
      <Route path="/chef/ordem/:id" element={<ChefRoute><OrdemDeCozinha /></ChefRoute>} />
      <Route path="/chef/ordem/:id/pendente" element={<ChefRoute><OrdemPendente /></ChefRoute>} />
      <Route path="/chef/pagamentos" element={<ChefRoute><MeusPagamentos /></ChefRoute>} />
      <Route path="/chef/meu-perfil" element={<ChefRoute><EditarCadastroChef /></ChefRoute>} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
