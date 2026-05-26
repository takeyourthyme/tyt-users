import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Users, User, Trash2 } from "lucide-react";
import { DadosContratacao } from "@/pages/Contratacao";
import { loadSession } from "@/services/authService";
import { listCulinaryPreferences, listCuisineTypes, listDishCategories, listMainIngredients, type LookupOption } from "@/services/lookupService";
interface Props {
  dados: DadosContratacao;
  onAvancar: (dados: Partial<DadosContratacao>) => void;
  onVoltar: () => void;
}
const tamanhosPorcao = [{
  id: 'pequena',
  nome: 'Pequena (1–2 pessoas)'
}, {
  id: 'media',
  nome: 'Média (3–4 pessoas)'
}, {
  id: 'grande',
  nome: 'Grande (5–6 pessoas)'
}];
const diasSemana = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
const periodos = ['Manhã', 'Tarde', 'Indiferente'];

const fallbackCategories: LookupOption[] = [
  { id: "Entradas", label: "Entradas" },
  { id: "Saladas", label: "Saladas" },
  { id: "Pratos Principais", label: "Pratos Principais" },
  { id: "Sobremesas", label: "Sobremesas" },
  { id: "Petiscos", label: "Petiscos" },
  { id: "Aperitivos", label: "Aperitivos" },
];
const fallbackPreferences: LookupOption[] = [
  { id: "Vegetariano", label: "Vegetariano" },
  { id: "Vegano", label: "Vegano" },
  { id: "Sem Glúten", label: "Sem Glúten" },
  { id: "Sem Lactose", label: "Sem Lactose" },
  { id: "Low Carb", label: "Low Carb" },
  { id: "Proteína", label: "Proteína" },
];
const fallbackIngredients: LookupOption[] = [
  { id: "Frango", label: "Frango" },
  { id: "Carne Bovina", label: "Carne Bovina" },
  { id: "Peixes", label: "Peixes" },
  { id: "Frutos do Mar", label: "Frutos do Mar" },
  { id: "Queijos", label: "Queijos" },
  { id: "Cogumelos", label: "Cogumelos" },
];
const fallbackCuisineTypes: LookupOption[] = [
  { id: "Brasileira", label: "Brasileira" },
  { id: "Italiana", label: "Italiana" },
  { id: "Asiática", label: "Asiática" },
  { id: "Mediterrânea", label: "Mediterrânea" },
  { id: "Francesa", label: "Francesa" },
  { id: "Japonesa", label: "Japonesa" },
];
export const ConfiguracaoCozinhaSemanal: React.FC<Props> = ({
  dados,
  onAvancar,
  onVoltar
}) => {
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(dados.tamanhoPortacao || '');
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<string[]>(dados.categorias || []);
  const [preferenciaseSelecionadas, setPreferenciasSelecionadas] = useState<string[]>(dados.preferencias || []);
  const [ingredientesSelecionados, setIngredientesSelecionados] = useState<string[]>(dados.ingredientes || []);
  const [tiposCozinhaSelecionados, setTiposCozinhaSelecionados] = useState<string[]>(dados.tiposCozinha || []);
  const [availableCategories, setAvailableCategories] = useState<LookupOption[]>([]);
  const [availablePreferences, setAvailablePreferences] = useState<LookupOption[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<LookupOption[]>([]);
  const [availableCuisineTypes, setAvailableCuisineTypes] = useState<LookupOption[]>([]);
  const [isLoadingLookups, setIsLoadingLookups] = useState(true);
  const [diasEntrega, setDiasEntrega] = useState<Array<{ dia: string; periodo: string }>>(
    dados.diasEntrega || [{ dia: '', periodo: '' }]
  );
  const [errosValidacao, setErrosValidacao] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const session = loadSession();
    const token = session?.token;

    const load = async () => {
      setIsLoadingLookups(true);
      try {
        const [cats, prefs, ings, cuisines] = await Promise.all([
          listDishCategories({ token }),
          listCulinaryPreferences({ token }),
          listMainIngredients({ token }),
          listCuisineTypes({ token }),
        ]);
        setAvailableCategories(cats.length > 0 ? cats : fallbackCategories);
        setAvailablePreferences(prefs.length > 0 ? prefs : fallbackPreferences);
        setAvailableIngredients(ings.length > 0 ? ings : fallbackIngredients);
        setAvailableCuisineTypes(cuisines.length > 0 ? cuisines : fallbackCuisineTypes);
      } catch {
        setAvailableCategories(fallbackCategories);
        setAvailablePreferences(fallbackPreferences);
        setAvailableIngredients(fallbackIngredients);
        setAvailableCuisineTypes(fallbackCuisineTypes);
      } finally {
        setIsLoadingLookups(false);
      }
    };

    void load();
  }, []);
  const toggleItem = (item: string, selectedItems: string[], setSelectedItems: (items: string[]) => void) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };
  const adicionarDia = () => {
    if (diasEntrega.length < 3) {
      setDiasEntrega([...diasEntrega, { dia: '', periodo: '' }]);
    }
  };

  const removerDia = (index: number) => {
    if (diasEntrega.length > 1) {
      setDiasEntrega(diasEntrega.filter((_, i) => i !== index));
    }
  };

  const atualizarDia = (index: number, campo: 'dia' | 'periodo', valor: string) => {
    const novosDias = [...diasEntrega];
    novosDias[index][campo] = valor;
    setDiasEntrega(novosDias);
  };

  const isDiaPeríodoDisponivel = (dia: string, periodo: string, indexAtual: number) => {
    // Verifica se o dia+período já foi selecionado em outro slot
    return !diasEntrega.some((d, i) => i !== indexAtual && d.dia === dia && d.periodo === periodo);
  };

  const getPeriodosDisponiveis = (dia: string, indexAtual: number) => {
    if (!dia) return periodos;

    // Retorna apenas períodos que não foram selecionados para este dia
    return periodos.filter(periodo =>
      isDiaPeríodoDisponivel(dia, periodo, indexAtual)
    );
  };

  const handleAvancar = () => {
    const novosErros: { [key: string]: boolean } = {};

    if (!tamanhoSelecionado) {
      novosErros.tamanho = true;
    }

    // Validar que pelo menos o primeiro dia está completo
    if (!diasEntrega[0]?.dia || !diasEntrega[0]?.periodo) {
      novosErros.dia = true;
    }

    // Validar que dias adicionados estão completos
    for (let i = 0; i < diasEntrega.length; i++) {
      if (diasEntrega[i].dia && !diasEntrega[i].periodo) {
        novosErros[`periodo_${i}`] = true;
      }
      if (!diasEntrega[i].dia && diasEntrega[i].periodo) {
        novosErros[`dia_${i}`] = true;
      }
    }

    setErrosValidacao(novosErros);

    if (Object.keys(novosErros).length === 0) {
      // Filtrar apenas dias completos
      const diasCompletos = diasEntrega.filter(d => d.dia && d.periodo);

      onAvancar({
        tamanhoPortacao: tamanhoSelecionado as DadosContratacao["tamanhoPortacao"],
        categorias: categoriasSelecionadas,
        preferencias: preferenciaseSelecionadas,
        ingredientes: ingredientesSelecionados,
        tiposCozinha: tiposCozinhaSelecionados,
        diasEntrega: diasCompletos
      });
    }
  };
  const renderSelectionCards = (
    title: string,
    description: string,
    items: LookupOption[],
    selectedItems: string[],
    setSelectedItems: (items: string[]) => void,
  ) => (
    <div className="space-y-3">
      <Label className="text-base font-semibold">{title}</Label>
      <p className="text-sm text-gray-500">{description}</p>
      <div className="flex flex-wrap gap-2">
        {isLoadingLookups
          ? Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-6 w-24" />
          ))
          : items.map((item) => {
            const isSelected = selectedItems.includes(item.label);
            return (
              <Badge
                key={item.id}
                variant={isSelected ? "default" : "secondary"}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => toggleItem(item.label, selectedItems, setSelectedItems)}
              >
                {item.label}
              </Badge>
            );
          })}
      </div>
    </div>
  );

  const getPortionIcon = (size: string) => {
    switch (size) {
      case 'pequena':
        return (
          <div className="flex gap-1">
            <User size={16} />
            <User size={16} />
          </div>
        );
      case 'media':
        return (
          <div className="flex gap-1">
            <User size={16} />
            <User size={16} />
            <User size={16} />
          </div>
        );
      case 'grande':
        return (
          <div className="flex gap-1">
            <User size={16} />
            <User size={16} />
            <User size={16} />
            <User size={16} />
            <User size={16} />
          </div>
        );
      default:
        return null;
    }
  };
  return <div className="space-y-8">
    <div className="text-center">

      <p className="text-gray-600">
        Vamos entender melhor suas preferências para te guiar na escolha dos pratos.
      </p>
    </div>

    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Tamanho da Porção */}
        <div className="space-y-3">
          <Label className={`text-base font-semibold ${errosValidacao.tamanho ? 'text-red-600' : ''}`}>Tamanho de Porção *</Label>
          <p className="text-sm text-gray-500">Escolha o tamanho ideal para o número de pessoas da sua casa</p>
          <RadioGroup value={tamanhoSelecionado} onValueChange={setTamanhoSelecionado}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tamanhosPorcao.map(tamanho => (
                <div
                  key={tamanho.id}
                  className={`flex items-center space-x-3 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer ${errosValidacao.tamanho ? 'border-red-500' : ''}`}
                  onClick={() => setTamanhoSelecionado(tamanho.id)}
                >
                  <RadioGroupItem value={tamanho.id} id={tamanho.id} />
                  {getPortionIcon(tamanho.id)}
                  <div className="flex flex-col flex-1">
                    <Label htmlFor={tamanho.id} className="cursor-pointer font-normal">
                      {tamanho.id === 'pequena' ? 'Pequena' : tamanho.id === 'media' ? 'Média' : 'Grande'}
                    </Label>
                    <div className="text-sm text-gray-500">
                      {tamanho.id === 'pequena' ? '1–2 pessoas' : tamanho.id === 'media' ? '3–4 pessoas' : '5–6 pessoas'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Categorias */}
        {renderSelectionCards(
          "Categorias",
          "Selecione os tipos de pratos que você mais gosta",
          availableCategories,
          categoriasSelecionadas,
          setCategoriasSelecionadas,
        )}

        {/* Preferências Culinárias */}
        {renderSelectionCards(
          "Preferências Culinárias",
          "Informe suas restrições alimentares ou preferências especiais",
          availablePreferences,
          preferenciaseSelecionadas,
          setPreferenciasSelecionadas,
        )}

        {/* Ingredientes Preferenciais */}
        {renderSelectionCards(
          "Ingredientes Preferenciais",
          "Escolha os ingredientes que você mais consome",
          availableIngredients,
          ingredientesSelecionados,
          setIngredientesSelecionados,
        )}

        {/* Tipos de Cozinha */}
        {renderSelectionCards(
          "Tipos de Cozinha",
          "Selecione as culinárias que mais te agradam",
          availableCuisineTypes,
          tiposCozinhaSelecionados,
          setTiposCozinhaSelecionados,
        )}

        {/* Dias da Semana */}
        <div className="space-y-3">
          <Label className={`text-base font-semibold ${errosValidacao.dia ? 'text-red-600' : ''}`}>
            Dias da Semana *
          </Label>
          <p className="text-sm text-gray-500">
            Escolha os dias e períodos para receber suas refeições (até 3 dias)
          </p>

          <div className="space-y-3">
            {diasEntrega.map((diaEntrega, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-1 grid md:grid-cols-2 gap-3">
                  <Select
                    value={diaEntrega.dia}
                    onValueChange={(valor) => atualizarDia(index, 'dia', valor)}
                  >
                    <SelectTrigger className={errosValidacao[`dia_${index}`] || (index === 0 && errosValidacao.dia) ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {diasSemana.map(dia => (
                        <SelectItem key={dia} value={dia}>
                          {dia}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={diaEntrega.periodo}
                    onValueChange={(valor) => atualizarDia(index, 'periodo', valor)}
                    disabled={!diaEntrega.dia}
                  >
                    <SelectTrigger className={errosValidacao[`periodo_${index}`] || (index === 0 && errosValidacao.dia) ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      {getPeriodosDisponiveis(diaEntrega.dia, index).map(periodo => (
                        <SelectItem key={periodo} value={periodo}>
                          {periodo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {diasEntrega.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removerDia(index)}
                    className="mt-0.5 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {diasEntrega.length < 3 && diasEntrega[diasEntrega.length - 1]?.dia && diasEntrega[diasEntrega.length - 1]?.periodo && (
              <Button
                type="button"
                variant="outline"
                onClick={adicionarDia}
                className="w-full"
              >
                + Adicionar mais um dia
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Botões */}
    <div className="flex justify-between">
      <Button variant="outline" onClick={onVoltar}>
        Voltar
      </Button>
      <Button onClick={handleAvancar}>
        Avançar
      </Button>
    </div>
  </div>;
};
