import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, Utensils } from "lucide-react";
import { DadosContratacao } from "@/pages/Contratacao";
import { loadSession } from "@/services/authService";
import { listKitchenOrders } from "@/services/kitchenOrderService";
import IllustrationOrder from "@/assets/illustration-order";

interface Props {
  dados: DadosContratacao;
  onAvancar: (dados: Partial<DadosContratacao>) => void;
}

const fallbackCities = [
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
    icone: Utensils,
    unselectedBg: 'bg-[#F4FBF7]',
    unselectedBorder: 'border-[#E1F5EC]',
    unselectedIconBg: 'bg-[#E1F5EC]',
    unselectedIconColor: 'text-[#208253]',
    selectedBg: 'bg-[#E1F5EC]',
    selectedBorder: 'border-[#208253]',
    selectedIconBg: 'bg-[#208253]',
    selectedIconColor: 'text-white'
  },
  {
    id: 'eventos',
    nome: 'Eventos',
    descricao: 'Chef especializado para seus eventos especiais',
    icone: Calendar,
    unselectedBg: 'bg-[#FAF2F7]',
    unselectedBorder: 'border-[#F5E5F0]',
    unselectedIconBg: 'bg-[#F5E5F0]',
    unselectedIconColor: 'text-[#B04B99]',
    selectedBg: 'bg-[#F5E5F0]',
    selectedBorder: 'border-[#B04B99]',
    selectedIconBg: 'bg-[#B04B99]',
    selectedIconColor: 'text-white'
  },
  {
    id: 'servicos-especiais',
    nome: 'Serviços Especiais',
    descricao: 'Soluções customizadas para suas necessidades específicas',
    icone: Users,
    unselectedBg: 'bg-[#F0F8FA]',
    unselectedBorder: 'border-[#E0F2F5]',
    unselectedIconBg: 'bg-[#E0F2F5]',
    unselectedIconColor: 'text-[#0E7490]',
    selectedBg: 'bg-[#E0F2F5]',
    selectedBorder: 'border-[#0E7490]',
    selectedIconBg: 'bg-[#0E7490]',
    selectedIconColor: 'text-white'
  }
];

export const EtapaEscolhaServico: React.FC<Props> = ({ dados, onAvancar }) => {
  const [cities, setCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [cidadeSelecionada, setCidadeSelecionada] = useState(dados.cidade);
  const [servicoSelecionado, setServicoSelecionado] = useState(dados.tipoServico);
  const [tentouAvancar, setTentouAvancar] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (!session?.token) {
      setCities(fallbackCities);
      setIsLoadingCities(false);
      return;
    }

    const extractOrders = (data: unknown): Array<Record<string, unknown>> => {
      if (Array.isArray(data)) return data as Array<Record<string, unknown>>;
      if (data && typeof data === "object") {
        const record = data as Record<string, unknown>;
        const candidates = [record.orders, record.data, record.items, record.results];
        const list = candidates.find((value) => Array.isArray(value));
        if (Array.isArray(list)) return list as Array<Record<string, unknown>>;
      }
      return [];
    };

    setIsLoadingCities(true);
    listKitchenOrders({ token: session.token })
      .then((data) => {
        const orders = extractOrders(data);
        const mapped = orders
          .map((order) => {
            const city = (order.city as string | undefined) ?? (order.cidade as string | undefined) ?? "";
            const state = (order.state as string | undefined) ?? (order.estado as string | undefined) ?? "";
            const label = [city, state].filter(Boolean).join(" - ");
            return label.trim();
          })
          .filter(Boolean);
        const unique = Array.from(new Set([...mapped, ...fallbackCities])).filter(Boolean);
        if (unique.length > 0) setCities(unique);
      })
      .catch(() => {
        setCities(fallbackCities);
      })
      .finally(() => setIsLoadingCities(false));
  }, []);

  const podeAvancar = cidadeSelecionada && servicoSelecionado;

  const handleAvancar = () => {
    setTentouAvancar(true);
    if (podeAvancar) {
      onAvancar({
        cidade: cidadeSelecionada,
        tipoServico: servicoSelecionado as DadosContratacao["tipoServico"]
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-light text-gray-900 mb-2">
          Vamos começar
        </h1>
        <p className="text-gray-600">
          Nos conte o que você está planejando!
        </p>
      </div>

      {/* Seleção de Cidade */}
      <div className="space-y-3">
        <Label className="text-lg font-light">Cidade</Label>
        <p className="text-sm text-gray-500 mb-3">
          Selecione a cidade onde você precisa que o serviço seja executado
        </p>
        {isLoadingCities ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select value={cidadeSelecionada} onValueChange={setCidadeSelecionada}>
            <SelectTrigger className={`w-full ${tentouAvancar && !cidadeSelecionada ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Selecione sua cidade" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((cidade) => (
                <SelectItem key={cidade} value={cidade}>
                  {cidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Seleção de Serviço */}
      <div className="space-y-3">
        <Label className="text-lg font-light">Serviço Desejado</Label>
        <p className="text-sm text-gray-500 mb-3">
          Escolha o tipo de serviço que melhor atende sua necessidade
        </p>
        <div className={`grid gap-4 md:grid-cols-3 ${tentouAvancar && !servicoSelecionado ? 'border-2 border-red-500 rounded-lg p-4' : ''}`}>
          {servicos.map((servico) => {
            const IconeServico = servico.icone;
            const selecionado = servicoSelecionado === servico.id;

            const cardBgBorder = selecionado
              ? `${servico.selectedBg} ${servico.selectedBorder}`
              : `${servico.unselectedBg} ${servico.unselectedBorder} hover:border-gray-300`;

            const iconBg = selecionado
              ? servico.selectedIconBg
              : servico.unselectedIconBg;

            const iconColor = selecionado
              ? servico.selectedIconColor
              : servico.unselectedIconColor;

            return (
              <Card
                key={servico.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md border ${cardBgBorder}`}
                onClick={() => setServicoSelecionado(servico.id as DadosContratacao["tipoServico"])}
              >
                <CardContent className="p-4 md:p-6">
                  {/* Layout mobile: horizontal */}
                  <div className="flex items-center space-x-3 md:hidden">
                    <div className={`p-2 rounded-full flex-shrink-0 ${iconBg}`}>
                      <IconeServico
                        size={20}
                        className={iconColor}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-light text-base text-gray-900 leading-tight">{servico.nome}</h3>
                      <p className="text-xs text-gray-600 mt-1 leading-tight">{servico.descricao}</p>
                    </div>
                  </div>

                  {/* Layout desktop: vertical */}
                  <div className="hidden md:block text-center space-y-3">
                    <div className="flex justify-center">
                      <div className={`p-3 rounded-full ${iconBg}`}>
                        <IconeServico
                          size={24}
                          className={iconColor}
                        />
                      </div>
                    </div>
                    <h3 className="font-light text-lg text-gray-900">{servico.nome}</h3>
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
