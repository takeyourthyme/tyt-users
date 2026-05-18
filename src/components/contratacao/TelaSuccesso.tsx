import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface Props {
  onIrDashboard: () => void;
  tipoServico?: 'cozinha-semanal' | 'eventos' | 'servicos-especiais' | '';
}

export const TelaSuccesso: React.FC<Props> = ({ onIrDashboard, tipoServico }) => {
  const codigoReferencia = "TYT" + Math.random().toString(36).substr(2, 9).toUpperCase();
  const isServicoEspecial = tipoServico === 'servicos-especiais';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          {/* Animação de Sucesso */}
          <div className="flex justify-center">
            <div className="relative">
              <CheckCircle 
                size={80} 
                className="text-green-500 animate-pulse" 
              />
              <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-ping"></div>
            </div>
          </div>

          {/* Título */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isServicoEspecial ? 'Solicitação Enviada!' : 'Contratação Realizada!'}
            </h1>
            <p className="text-gray-600">
              {isServicoEspecial 
                ? 'Recebemos sua solicitação de serviço especial'
                : 'Sua contratação foi confirmada com sucesso'
              }
            </p>
          </div>

          {/* Código de Referência */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">
              Código de Referência:
            </p>
            <p className="text-lg font-mono font-bold text-gray-900">
              {codigoReferencia}
            </p>
          </div>

          {/* Informações */}
          <div className="text-sm text-gray-600 space-y-2">
            {isServicoEspecial ? (
              <>
                <p className="font-semibold text-gray-900">
                  Em breve o time da Take Your Thyme entrará em contato!
                </p>
                <p>
                  Nossa equipe irá analisar sua solicitação e entrar em contato em até 24 horas
                  para discutir os detalhes do seu serviço especial e elaborar um orçamento personalizado.
                </p>
                <p>
                  Você pode acompanhar o status da sua solicitação no seu dashboard.
                </p>
              </>
            ) : (
              <>
                <p>
                  Seu pagamento foi processado com sucesso e nossa equipe entrará em contato
                  para confirmar os detalhes finais.
                </p>
                <p>
                  Você pode acompanhar o status do seu serviço no seu dashboard.
                </p>
              </>
            )}
          </div>

          {/* Botão */}
          <Button 
            onClick={onIrDashboard}
            className="w-full"
            size="lg"
          >
            Ir para o Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};