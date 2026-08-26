import React, { useEffect } from "react";
import { useConfiguracaoGeral } from "@/hooks/useConfiguracaoGeral";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Loader2 } from "lucide-react";

const TermosRedirect: React.FC = () => {
  const { data: config, isLoading } = useConfiguracaoGeral();
  const termosUrl = config?.termos_politicas;

  useEffect(() => {
    if (termosUrl) {
      // Redireciona automaticamente para o documento oficial hospedado
      window.location.href = termosUrl;
    }
  }, [termosUrl]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-[#004B2A]/10 text-[#004B2A] rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-900">
              Termos de Uso e Políticas de Privacidade
            </h1>
            <p className="text-sm text-gray-500">
              {isLoading
                ? "Carregando o documento oficial..."
                : termosUrl
                ? "Redirecionando para o documento..."
                : "O documento de termos e políticas está sendo atualizado pela administração."}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-[#004B2A]" />
            </div>
          ) : termosUrl ? (
            <Button
              className="w-full bg-[#004B2A] hover:bg-[#003820] text-white flex items-center justify-center gap-2"
              onClick={() => {
                window.location.href = termosUrl;
              }}
            >
              <span>Abrir Documento (PDF)</span>
              <ExternalLink className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                window.history.back();
              }}
            >
              Voltar
            </Button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermosRedirect;
