import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Users, Utensils } from "lucide-react";
import { DadosContratacao } from "@/pages/Contratacao";

interface Props {
  dados: DadosContratacao;
  onAvancar: (dados: Partial<DadosContratacao>) => void;
}

const cidades = [
  "Curitiba - PR",
  "São Paulo - SP", 
  "Rio de Janeiro - RJ",
  "Florianópolis - SC",
  "Belo Horizonte - MG"
];

const servicos = [
  {
    id: 'cozinha-semanal',
    nome: 'Cozinha Semanal',
    descricao: 'Chef em casa toda semana para preparar suas refeições',
    cor: 'bg-green-500',
    icone: Utensils
  },
  {
    id: 'eventos',
    nome: 'Eventos',
    descricao: 'Chef especializado para seus eventos especiais',
    cor: 'bg-purple-500',
    icone: Calendar
  },
  {
    id: 'servicos-especiais',
    nome: 'Serviços Especiais',
    descricao: 'Soluções customizadas para suas necessidades específicas',
    cor: 'bg-orange-500',
    icone: Users
  }
];

export const EtapaEscolhaServico: React.FC<Props> = ({ dados, onAvancar }) => {
  const [cidadeSelecionada, setCidadeSelecionada] = useState(dados.cidade);
  const [servicoSelecionado, setServicoSelecionado] = useState(dados.tipoServico);
  const [tentouAvancar, setTentouAvancar] = useState(false);

  const podeAvancar = cidadeSelecionada && servicoSelecionado;

  const handleAvancar = () => {
    setTentouAvancar(true);
    if (podeAvancar) {
      onAvancar({
        cidade: cidadeSelecionada,
        tipoServico: servicoSelecionado as any
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Vamos começar
        </h1>
        <p className="text-gray-600">
          Nos conte o que você está planejando!
        </p>
      </div>

      {/* Seleção de Cidade */}
      <div className="space-y-3">
        <Label className="text-lg font-semibold">Cidade</Label>
        <p className="text-sm text-gray-500 mb-3">
          Selecione a cidade onde você precisa que o serviço seja executado
        </p>
        <Select value={cidadeSelecionada} onValueChange={setCidadeSelecionada}>
          <SelectTrigger className={`w-full ${tentouAvancar && !cidadeSelecionada ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Selecione sua cidade" />
          </SelectTrigger>
          <SelectContent>
            {cidades.map((cidade) => (
              <SelectItem key={cidade} value={cidade}>
                {cidade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Seleção de Serviço */}
      <div className="space-y-3">
        <Label className="text-lg font-semibold">Serviço Desejado</Label>
        <p className="text-sm text-gray-500 mb-3">
          Escolha o tipo de serviço que melhor atende sua necessidade
        </p>
        <div className={`grid gap-4 md:grid-cols-3 ${tentouAvancar && !servicoSelecionado ? 'border-2 border-red-500 rounded-lg p-4' : ''}`}>
          {servicos.map((servico) => {
            const IconeServico = servico.icone;
            const selecionado = servicoSelecionado === servico.id;
            
            return (
              <Card
                key={servico.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${
                  selecionado ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setServicoSelecionado(servico.id as any)}
              >
                <CardContent className="p-4 md:p-6">
                  {/* Layout mobile: horizontal */}
                  <div className="flex items-center space-x-3 md:hidden">
                    <div className={`p-2 rounded-full flex-shrink-0 ${selecionado ? servico.cor : 'bg-gray-100'}`}>
                      <IconeServico 
                        size={20} 
                        className={selecionado ? 'text-white' : 'text-gray-600'} 
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base text-gray-900 leading-tight">{servico.nome}</h3>
                      <p className="text-xs text-gray-600 mt-1 leading-tight">{servico.descricao}</p>
                    </div>
                  </div>
                  
                  {/* Layout desktop: vertical */}
                  <div className="hidden md:block text-center space-y-3">
                    <div className="flex justify-center">
                      <div className={`p-3 rounded-full ${selecionado ? servico.cor : 'bg-gray-100'}`}>
                        <IconeServico 
                          size={24} 
                          className={selecionado ? 'text-white' : 'text-gray-600'} 
                        />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900">{servico.nome}</h3>
                    <p className="text-sm text-gray-600">{servico.descricao}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Botão Avançar */}
      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleAvancar}
          size="lg"
        >
          Avançar
        </Button>
      </div>
    </div>
  );
};