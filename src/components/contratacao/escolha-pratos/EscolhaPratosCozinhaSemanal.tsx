import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Eye, Plus, Minus, Edit, Heart, ShoppingCart, Info, Filter, ChevronDown, ChevronUp, Utensils, Fish, Beef, ChefHat, Leaf, Soup, Salad, Wheat, Zap, Tag, Star, Globe, UtensilsCrossed } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DadosContratacao } from "@/pages/Contratacao";
import { useToast } from "@/hooks/use-toast";
import { loadSession } from "@/services/authService";
import { listDishes, listHighlightedDishes, normalizeDish, type Dish } from "@/services/dishService";

// Import das imagens
import yakisobaFrango from "@/assets/yakisoba-frango.jpg";
import tacosCarnitas from "@/assets/tacos-carnitas.jpg";
import moussakaGrega from "@/assets/moussaka-grega.jpg";
import schnitzelVienense from "@/assets/schnitzel-vienense.jpg";
import hummusVegetais from "@/assets/hummus-vegetais.jpg";
import lagostaThermidor from "@/assets/lagosta-thermidor.jpg";
interface Props {
  dados: DadosContratacao;
  onAvancar: (dados: Partial<DadosContratacao>) => void;
  onVoltar: () => void;
}

type DishOption = {
  id: string;
  dishId: number;
  nome: string;
  descricao: string;
  preco: number;
  foto: string;
  categoria: string;
  favorito: boolean;
  frequente: boolean;
};

const mockDishes: DishOption[] = [{
  id: '1',
  dishId: 1,
  nome: 'Lagosta Thermidor',
  descricao: 'Lagosta gratinada com molho especial',
  preco: 45,
  foto: lagostaThermidor,
  categoria: 'mariscos',
  favorito: true,
  frequente: false
}, {
  id: '2',
  dishId: 2,
  nome: 'Schnitzel Vienense',
  descricao: 'Escalope empanado tradicional austríaco',
  preco: 38,
  foto: schnitzelVienense,
  categoria: 'carnes brancas',
  favorito: false,
  frequente: true
}, {
  id: '3',
  dishId: 3,
  nome: 'Moussaka Grega',
  descricao: 'Lasanha grega com berinjela e carne',
  preco: 35,
  foto: moussakaGrega,
  categoria: 'carnes vermelhas',
  favorito: false,
  frequente: false
}, {
  id: '4',
  dishId: 4,
  nome: 'Yakisoba de Frango',
  descricao: 'Macarrão oriental com legumes e frango',
  preco: 32,
  foto: yakisobaFrango,
  categoria: 'carnes brancas',
  favorito: true,
  frequente: false
}, {
  id: '5',
  dishId: 5,
  nome: 'Hummus com Vegetais',
  descricao: 'Pasta de grão-de-bico com vegetais frescos',
  preco: 28,
  foto: hummusVegetais,
  categoria: 'proteína vegetal',
  favorito: false,
  frequente: false
}, {
  id: '6',
  dishId: 6,
  nome: 'Tacos de Carnitas',
  descricao: 'Tacos mexicanos com carne de porco',
  preco: 35,
  foto: tacosCarnitas,
  categoria: 'comidas rápidas',
  favorito: false,
  frequente: true
}];

const CATEGORIAS_ICONES = {
  "massas": { icon: Utensils, color: "bg-orange-100 text-orange-700 border-orange-200" },
  "peixes": { icon: Fish, color: "bg-blue-100 text-blue-700 border-blue-200" },
  "carnes vermelhas": { icon: Beef, color: "bg-red-100 text-red-700 border-red-200" },
  "carnes brancas": { icon: ChefHat, color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  "proteína vegetal": { icon: Leaf, color: "bg-green-100 text-green-700 border-green-200" },
  "frutos do mar": { icon: Fish, color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  "mariscos": { icon: Fish, color: "bg-teal-100 text-teal-700 border-teal-200" },
  "comidas rápidas": { icon: Zap, color: "bg-purple-100 text-purple-700 border-purple-200" },
  "sopas": { icon: Soup, color: "bg-amber-100 text-amber-700 border-amber-200" },
  "saladas": { icon: Salad, color: "bg-lime-100 text-lime-700 border-lime-200" },
  "grãos": { icon: Wheat, color: "bg-stone-100 text-stone-700 border-stone-200" }
};

const CATEGORIAS = Object.keys(CATEGORIAS_ICONES);
const PREFERENCIAS = ["orgânica", "sem óleo", "menos óleo", "baixo sal", "picante", "sem molho", "com molho", "frutos do mar", "vegetariano", "vegano", "sem fritura", "rica em proteínas", "light", "mediterrânea", "cuidados com temperos"];
const INGREDIENTES = ["laticínios", "soja", "nozes", "glúten", "carne de porco", "alho", "ovo", "frutos do mar", "amendoim"];
const TIPOS_COZINHA = ["brasileira", "japonesa", "mexicana", "mediterrânea", "italiana", "grega", "espanhola", "asiática", "judaica", "alemã", "árabe", "contemporânea", "francesa"];
export const EscolhaPratosCozinhaSemanal: React.FC<Props> = ({
  dados,
  onAvancar,
  onVoltar
}) => {
  const { toast } = useToast();
  const location = useLocation();
  const avancarButtonRef = useRef<HTMLDivElement>(null);
  const [availableDishes, setAvailableDishes] = useState<DishOption[]>([]);
  const [isLoadingDishes, setIsLoadingDishes] = useState(true);

  const diasEntrega = dados.diasEntrega || [];
  const totalPratosNecessarios = diasEntrega.length * 6;

  // Organizar pratos por dia
  const [pratosPorDia, setPratosPorDia] = useState<Record<number, DishOption[]>>(() => {
    const inicial: Record<number, DishOption[]> = {};
    diasEntrega.forEach((_, index) => {
      const slice = dados.pratosSelecionados?.slice(index * 6, (index + 1) * 6) ?? [];
      inicial[index] = slice.filter((item) => item && typeof item === "object") as DishOption[];
    });
    return inicial;
  });

  const [diaAtualSelecionando, setDiaAtualSelecionando] = useState(0);
  const [filtroNome, setFiltroNome] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtrosAbertos, setFiltrosAbertos] = useState({
    categorias: false,
    preferencias: false,
    ingredientes: false,
    tiposCozinha: false
  });
  const [filtros, setFiltros] = useState({
    categorias: [] as string[],
    preferencias: [] as string[],
    ingredientes: [] as string[],
    tiposCozinha: [] as string[],
    apenasavoritos: false
  });
  const [personalizacoes, setPersonalizacoes] = useState<{
    [key: string]: { texto: string; quantidade: number };
  }>({});
  const [dialogPersonalizacao, setDialogPersonalizacao] = useState<string | null>(null);
  const [textoPersonalizacao, setTextoPersonalizacao] = useState('');
  const [quantidadePersonalizacao, setQuantidadePersonalizacao] = useState(1);
  const [dialogDetalhes, setDialogDetalhes] = useState<string | null>(null);

  useEffect(() => {
    const session = loadSession();
    const token = session?.token;

    const extractList = (data: unknown): Dish[] => {
      if (Array.isArray(data)) return data as Dish[];
      if (data && typeof data === "object") {
        const record = data as Record<string, unknown>;
        const candidates = [record.pratos, record.dishes, record.items, record.data, record.results];
        const list = candidates.find((value) => Array.isArray(value));
        if (Array.isArray(list)) return list as Dish[];
      }
      return [];
    };

    setIsLoadingDishes(true);
    const request = token ? listDishes({ token }) : listHighlightedDishes();

    request
      .then((data) => {
        const list = extractList(data);
        if (!Array.isArray(list) || list.length === 0) throw new Error("empty");
        const mapped: DishOption[] = list
          .map((dish) => {
            const normalized = normalizeDish(dish);
            const dishId = Number(normalized.id);
            if (!Number.isFinite(dishId)) return undefined;
            const photo =
              normalized.photoUrl || "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop";
            return {
              id: normalized.id,
              dishId,
              nome: normalized.name,
              descricao: normalized.description,
              preco: 0,
              foto: photo,
              categoria: normalized.categories[0]?.toLowerCase() || "outros",
              favorito: false,
              frequente: false,
            };
          })
          .filter((item): item is DishOption => Boolean(item));
        if (mapped.length > 0) setAvailableDishes(mapped);
      })
      .catch(() => setAvailableDishes(mockDishes))
      .finally(() => setIsLoadingDishes(false));
  }, []);

  const filtrarPratos = () => {
    let resultado = availableDishes.filter(prato =>
      prato.nome.toLowerCase().includes(filtroNome.toLowerCase()) ||
      prato.descricao.toLowerCase().includes(filtroNome.toLowerCase())
    );

    // Aplicar filtros avançados
    if (filtros.categorias.length > 0) {
      resultado = resultado.filter(prato => filtros.categorias.includes(prato.categoria));
    }

    if (filtros.preferencias.length > 0) {
      resultado = resultado.filter(prato =>
        filtros.preferencias.some(pref => prato.categoria.includes(pref)) // Mock: usando categoria como preferência
      );
    }

    if (filtros.ingredientes.length > 0) {
      resultado = resultado.filter(prato =>
        filtros.ingredientes.some(ing => prato.categoria.includes(ing)) // Mock: usando categoria como ingrediente
      );
    }

    if (filtros.tiposCozinha.length > 0) {
      resultado = resultado.filter(prato =>
        filtros.tiposCozinha.some(tipo => prato.categoria.includes(tipo)) // Mock: usando categoria como tipo cozinha
      );
    }

    if (filtros.apenasavoritos) {
      resultado = resultado.filter(prato => prato.favorito);
    }

    return resultado;
  };

  const toggleFiltro = (tipo: keyof typeof filtros, valor: string) => {
    setFiltros(prev => {
      if (tipo === 'apenasavoritos') {
        return { ...prev, [tipo]: !prev[tipo] };
      }
      const currentArray = prev[tipo] as string[];
      return {
        ...prev,
        [tipo]: currentArray.includes(valor)
          ? currentArray.filter(item => item !== valor)
          : [...currentArray, valor]
      };
    });
  };

  const toggleFiltroAberto = (tipo: keyof typeof filtrosAbertos) => {
    setFiltrosAbertos(prev => ({ ...prev, [tipo]: !prev[tipo] }));
  };
  const isPratoSelecionadoNoDia = (pratoId: string, diaIndex: number) => {
    return pratosPorDia[diaIndex]?.some(p => p.id === pratoId) || false;
  };

  const togglePratoSelecionado = (prato: DishOption) => {
    const diaIndex = diaAtualSelecionando;
    const pratosDoDia = pratosPorDia[diaIndex] || [];
    const jaSelecionado = isPratoSelecionadoNoDia(prato.id, diaIndex);

    if (jaSelecionado) {
      // Remove o prato do dia atual
      setPratosPorDia(prev => ({
        ...prev,
        [diaIndex]: pratosDoDia.filter(p => p.id !== prato.id)
      }));

      const chavePersonalizacao = `${diaIndex}_${prato.id}`;
      setPersonalizacoes(prev => {
        const newPersonalizacoes = { ...prev };
        delete newPersonalizacoes[chavePersonalizacao];
        return newPersonalizacoes;
      });
    } else {
      // Adiciona o prato se ainda há espaço no dia atual
      if (pratosDoDia.length < 6) {
        setPratosPorDia(prev => ({
          ...prev,
          [diaIndex]: [...pratosDoDia, prato]
        }));

        const chavePersonalizacao = `${diaIndex}_${prato.id}`;
        setPersonalizacoes(prev => ({
          ...prev,
          [chavePersonalizacao]: { texto: '', quantidade: 1 }
        }));

        // Scroll suave para o botão Avançar após selecionar
        setTimeout(() => {
          if (avancarButtonRef.current) {
            avancarButtonRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'end'
            });
          }
        }, 200);
      } else {
        toast({
          title: "Limite atingido",
          description: `Você já selecionou 6 pratos para ${diasEntrega[diaIndex].dia}`,
          variant: "destructive"
        });
      }
    }
  };
  const abrirPersonalizacao = (pratoId: string, diaIndex?: number) => {
    const diaParaPersonalizar = diaIndex !== undefined ? diaIndex : diaAtualSelecionando;
    const chave = `${diaParaPersonalizar}_${pratoId}`;
    setDialogPersonalizacao(chave);

    const dados = personalizacoes[chave] || { texto: '' };
    setTextoPersonalizacao(dados.texto || '');

    const pratosDoDia = pratosPorDia[diaParaPersonalizar] || [];
    const count = pratosDoDia.filter(p => p.id === pratoId).length || 1;
    setQuantidadePersonalizacao(Math.max(1, count));
  };

  const calcularQuantidadeTotalDia = (diaIndex: number) => {
    return pratosPorDia[diaIndex]?.length || 0;
  };

  const salvarPersonalizacao = () => {
    if (!dialogPersonalizacao) return;

    const [diaIndexStr, pratoId] = dialogPersonalizacao.split('_');
    const diaIndexNum = parseInt(diaIndexStr, 10);

    const pratosDoDiaAtual = pratosPorDia[diaIndexNum] || [];
    const currentCount = pratosDoDiaAtual.filter(p => p.id === pratoId).length;
    const outrosPratos = pratosDoDiaAtual.filter(p => p.id !== pratoId);
    const pratoObj = pratosDoDiaAtual.find(p => p.id === pratoId) || availableDishes.find(p => p.id === pratoId);
    if (!pratoObj) {
      setDialogPersonalizacao(null);
      return;
    }

    const target = Math.max(1, quantidadePersonalizacao);
    let finalCount = target;

    if (target > currentCount) {
      const availableSlots = 6 - pratosDoDiaAtual.length;
      const desiredAdd = target - currentCount;
      const actualAdd = Math.min(desiredAdd, Math.max(0, availableSlots));
      finalCount = currentCount + actualAdd;
      if (actualAdd < desiredAdd) {
        toast({
          title: "Limite por dia",
          description: "Não há espaço suficiente para adicionar essa quantidade. Ajustamos ao máximo permitido.",
          variant: "destructive"
        });
      }
    }

    const novoArr = [
      ...outrosPratos,
      ...Array.from({ length: finalCount }, () => pratoObj)
    ];

    setPratosPorDia(prev => ({
      ...prev,
      [diaIndexNum]: novoArr
    }));

    setPersonalizacoes(prev => ({
      ...prev,
      [dialogPersonalizacao]: {
        texto: textoPersonalizacao,
        quantidade: finalCount
      }
    }));

    setDialogPersonalizacao(null);
    setTextoPersonalizacao('');
    setQuantidadePersonalizacao(1);
  };

  const abrirDetalhes = (pratoId: string) => {
    setDialogDetalhes(pratoId);
  };
  const handleAvancar = () => {
    // Verificar se todos os dias têm pelo menos 1 prato
    const diasIncompletos: string[] = [];

    for (let i = 0; i < diasEntrega.length; i++) {
      const pratosDoDia = pratosPorDia[i] || [];
      if (pratosDoDia.length < 1) {
        diasIncompletos.push(diasEntrega[i].dia);
      }
    }

    if (diasIncompletos.length > 0) {
      toast({
        title: "Seleção incompleta",
        description: `Você precisa selecionar pelo menos 1 prato para: ${diasIncompletos.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Consolidar todos os pratos com informações do dia
    const pratosConsolidados: Array<
      DishOption & {
        diaEntrega: string;
        periodoEntrega: string;
        diaIndex: number;
        personalizacao: string;
        quantity: number;
      }
    > = [];
    diasEntrega.forEach((diaEntrega, diaIndex) => {
      const pratosDoDia = pratosPorDia[diaIndex] || [];
      pratosDoDia.forEach(prato => {
        const chavePersonalizacao = `${diaIndex}_${prato.id}`;
        pratosConsolidados.push({
          ...prato,
          diaEntrega: diaEntrega.dia,
          periodoEntrega: diaEntrega.periodo,
          diaIndex: diaIndex,
          personalizacao: personalizacoes[chavePersonalizacao]?.texto || '',
          quantity: personalizacoes[chavePersonalizacao]?.quantidade || 1
        });
      });
    });

    onAvancar({
      pratosSelecionados: pratosConsolidados
    });
  };
  const calcularTotal = () => {
    const precoChef = 550;
    let precoCompras = 0;

    diasEntrega.forEach((_, diaIndex) => {
      const pratosDoDia = pratosPorDia[diaIndex] || [];
      precoCompras += pratosDoDia.reduce((total, prato) => total + prato.preco, 0);
    });

    return {
      precoChef,
      precoCompras,
      total: precoChef + precoCompras
    };
  };
  const {
    precoChef,
    precoCompras,
    total
  } = calcularTotal();
  return <div className="space-y-8">
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Coluna da Esquerda - Catálogo */}
      <div className="lg:col-span-2 space-y-6">
        {/* Busca e Filtros */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Buscar pratos..." value={filtroNome} onChange={e => setFiltroNome(e.target.value)} className="pl-10" />
            </div>
            <Button
              variant="outline"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Filtros Avançados */}
          {mostrarFiltros && (
            <Card className="bg-card/60 backdrop-blur border-2">
              <CardContent className="p-4 space-y-4">

                {/* Filtro por Categoria */}
                <Collapsible open={filtrosAbertos.categorias} onOpenChange={() => toggleFiltroAberto('categorias')}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4" />
                        <span>Categorias</span>
                      </div>
                      {filtrosAbertos.categorias ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIAS.map(categoria => {
                        const categoriaDados = CATEGORIAS_ICONES[categoria as keyof typeof CATEGORIAS_ICONES];
                        const IconeCategoria = categoriaDados?.icon || Utensils;
                        const isSelected = filtros.categorias.includes(categoria);
                        return (
                          <Badge
                            key={categoria}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer gap-1 px-3 py-1.5 text-xs font-medium hover:bg-primary/10"
                            onClick={() => toggleFiltro('categorias', categoria)}
                          >
                            <IconeCategoria className="h-3 w-3" />
                            {categoria}
                          </Badge>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Filtro por Preferências */}
                <Collapsible open={filtrosAbertos.preferencias} onOpenChange={() => toggleFiltroAberto('preferencias')}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        <span>Preferências</span>
                      </div>
                      {filtrosAbertos.preferencias ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
                    <div className="flex flex-wrap gap-2">
                      {PREFERENCIAS.map(preferencia => {
                        const isSelected = filtros.preferencias.includes(preferencia);
                        return (
                          <Badge
                            key={preferencia}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer px-3 py-1.5 text-xs font-medium hover:bg-primary/10"
                            onClick={() => toggleFiltro('preferencias', preferencia)}
                          >
                            {preferencia}
                          </Badge>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Filtro por Ingredientes */}
                <Collapsible open={filtrosAbertos.ingredientes} onOpenChange={() => toggleFiltroAberto('ingredientes')}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4" />
                        <span>Ingredientes</span>
                      </div>
                      {filtrosAbertos.ingredientes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
                    <div className="flex flex-wrap gap-2">
                      {INGREDIENTES.map(ingrediente => {
                        const isSelected = filtros.ingredientes.includes(ingrediente);
                        return (
                          <Badge
                            key={ingrediente}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer px-3 py-1.5 text-xs font-medium hover:bg-primary/10"
                            onClick={() => toggleFiltro('ingredientes', ingrediente)}
                          >
                            {ingrediente}
                          </Badge>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Filtro por Tipos de Cozinha */}
                <Collapsible open={filtrosAbertos.tiposCozinha} onOpenChange={() => toggleFiltroAberto('tiposCozinha')}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>Tipos de Cozinha</span>
                      </div>
                      {filtrosAbertos.tiposCozinha ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pt-2">
                    <div className="flex flex-wrap gap-2">
                      {TIPOS_COZINHA.map(tipo => {
                        const isSelected = filtros.tiposCozinha.includes(tipo);
                        return (
                          <Badge
                            key={tipo}
                            variant={isSelected ? "default" : "outline"}
                            className="cursor-pointer px-3 py-1.5 text-xs font-medium hover:bg-primary/10"
                            onClick={() => toggleFiltro('tiposCozinha', tipo)}
                          >
                            {tipo}
                          </Badge>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Seletor de Dia */}
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {diasEntrega.map((diaEntrega, index) => {
              const pratosDoDia = pratosPorDia[index] || [];
              const temPratos = pratosDoDia.length > 0;

              return (
                <Button
                  key={index}
                  variant={diaAtualSelecionando === index ? "default" : "outline"}
                  onClick={() => setDiaAtualSelecionando(index)}
                  className="flex-shrink-0 relative min-w-[120px] h-auto py-3 overflow-visible"
                >
                  {temPratos && (
                    <Badge className="absolute top-1 right-1 bg-green-500 text-white px-1.5 py-0.5 text-xs z-10">
                      {pratosDoDia.length}
                    </Badge>
                  )}
                  <div className="flex flex-col items-center gap-1 w-full">
                    <span className="font-semibold text-xs">{diaEntrega.dia}</span>
                    <span className="text-xs opacity-75">{diaEntrega.periodo}</span>
                  </div>
                </Button>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Selecionando pratos para <strong>{diasEntrega[diaAtualSelecionando]?.dia}</strong> - {diasEntrega[diaAtualSelecionando]?.periodo}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {calcularQuantidadeTotalDia(diaAtualSelecionando)} de até 6 pratos selecionados para este dia
            </p>
          </div>
        </div>

        {/* Lista de Pratos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoadingDishes
            ? Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-6 w-28" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-28" />
                  </div>
                </CardContent>
              </Card>
            ))
            : filtrarPratos().map(prato => {
              const selecionado = isPratoSelecionadoNoDia(prato.id, diaAtualSelecionando);
              const chavePersonalizacao = `${diaAtualSelecionando}_${prato.id}`;
              const temPersonalizacao = personalizacoes[chavePersonalizacao];
              const categoriaDados = CATEGORIAS_ICONES[prato.categoria as keyof typeof CATEGORIAS_ICONES];
              const IconeCategoria = categoriaDados?.icon || Utensils;

              return <Card key={prato.id} className="overflow-hidden">
                <div className="relative">
                  <img src={prato.foto} alt={prato.nome} className="w-full h-48 object-cover" />
                  {prato.favorito && <Heart className="absolute top-2 right-2 text-red-500 fill-current" size={20} />}
                  {prato.frequente && <ShoppingCart className="absolute top-2 left-2 text-orange-500 fill-current" size={20} />}
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{prato.nome}</h3>
                      <p className="text-muted-foreground text-sm">{prato.descricao}</p>
                    </div>

                    {/* Tag da categoria */}
                    <div>
                      <Badge className={`${categoriaDados?.color} border font-normal`}>
                        <IconeCategoria className="h-3 w-3 mr-1" />
                        <span>{prato.categoria}</span>
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => abrirDetalhes(prato.id)}>
                          <Eye size={16} />
                        </Button>

                        {selecionado && (
                          <Button
                            variant={temPersonalizacao ? "default" : "outline"}
                            size="sm"
                            onClick={() => abrirPersonalizacao(prato.id)}
                          >
                            <Edit size={16} />
                          </Button>
                        )}
                      </div>

                      <Button
                        variant={selecionado ? "default" : "outline"}
                        size="sm"
                        className={selecionado ? "bg-green-600 hover:bg-green-700" : ""}
                        onClick={() => togglePratoSelecionado(prato)}
                        disabled={!selecionado && calcularQuantidadeTotalDia(diaAtualSelecionando) >= 6}
                      >
                        {selecionado ? "Selecionado" : "Selecionar"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>;
            })}
        </div>
      </div>

      {/* Coluna da Direita - Resumo */}
      <div className="space-y-6">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pratos por Dia */}
            <div className="space-y-4">
              {diasEntrega.map((diaEntrega, diaIndex) => {
                const pratosDoDia = pratosPorDia[diaIndex] || [];

                return (
                  <div key={diaIndex} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold">
                        {diaEntrega.dia} - {diaEntrega.periodo}
                      </h4>
                      <Badge variant={pratosDoDia.length >= 1 ? "default" : "secondary"}>
                        {pratosDoDia.length}/6
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      {Array.from({ length: 6 }, (_, index) => {
                        const prato = pratosDoDia[index];
                        const chavePersonalizacao = prato ? `${diaIndex}_${prato.id}` : null;
                        const temPersonalizacao = chavePersonalizacao ? personalizacoes[chavePersonalizacao]?.texto : null;

                        return (
                          <div key={index} className="flex justify-between items-center gap-2 p-2 border rounded min-h-[36px] text-xs">
                            {prato ? (
                              <>
                                <div className="flex-1 flex items-center gap-1">
                                  <span>{prato.nome}</span>
                                  {temPersonalizacao && (
                                    <Badge variant="secondary" className="text-xs px-1 py-0">
                                      Personalizado
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-muted-foreground">R$ {prato.preco.toFixed(2)}</span>
                              </>
                            ) : (
                              <span className="text-muted-foreground italic">Vazio</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <hr />

            {/* Resumo Financeiro */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Serviço do Chef:</span>
                <span className="font-medium">R$ {precoChef.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <span>Compras:</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-4 w-4">
                        <Info size={12} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Informações sobre Compras</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-muted-foreground">
                        As compras de Supermercado são um valor estimado conforme a pesquisa do TYT na sua região.
                        Depois que o chef fizer a compra, ele vai anexar o comprovante do mercado e o valor será
                        atualizado, reembolsado ou cobrado adicional no cartão de crédito em caso de diferença.
                      </p>
                    </DialogContent>
                  </Dialog>
                </div>
                <span className="font-medium">R$ {precoCompras.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Botão Avançar no Desktop */}
            <div className="hidden lg:block pt-4">
              <Button onClick={handleAvancar} className="w-full">
                Avançar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    {/* Dialog de Personalização */}
    <Dialog open={!!dialogPersonalizacao} onOpenChange={() => setDialogPersonalizacao(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Personalizar Prato</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Descreva as mudanças que você gostaria no preparo deste prato:
            </p>
            <Textarea
              value={textoPersonalizacao}
              onChange={e => setTextoPersonalizacao(e.target.value)}
              placeholder="Ex: Sem cebola, mais tempero, ponto da carne mal passado..."
              rows={4}
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Quantidade</p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantidadePersonalizacao(Math.max(1, quantidadePersonalizacao - 1))}
                disabled={quantidadePersonalizacao <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-lg min-w-[40px] text-center">
                {quantidadePersonalizacao}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantidadePersonalizacao(quantidadePersonalizacao + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogPersonalizacao(null)}>
              Cancelar
            </Button>
            <Button onClick={salvarPersonalizacao}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Dialog de Detalhes */}
    <Dialog open={!!dialogDetalhes} onOpenChange={() => setDialogDetalhes(null)}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {dialogDetalhes ? availableDishes.find(p => p.id === dialogDetalhes)?.nome : ""}
          </DialogTitle>
        </DialogHeader>
        {dialogDetalhes && (() => {
          const prato = availableDishes.find(p => p.id === dialogDetalhes);
          if (!prato) return null;

          const categoriaDados = CATEGORIAS_ICONES[prato.categoria as keyof typeof CATEGORIAS_ICONES];
          const IconeCategoria = categoriaDados?.icon || Utensils;

          return (
            <div className="space-y-4">
              <img src={prato.foto} alt={prato.nome} className="w-full h-48 object-cover rounded-lg" />

              {/* Conheça o prato */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <UtensilsCrossed className="h-4 w-4 text-primary" />
                    Conheça o prato
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm leading-relaxed">{prato.descricao}</p>
                </CardContent>
              </Card>

              {/* Categoria */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Tag className="h-4 w-4 text-primary" />
                    Categoria
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Badge variant="default" className={`text-xs gap-1 ${categoriaDados?.color}`}>
                    <IconeCategoria className="h-3 w-3" />
                    {prato.categoria}
                  </Badge>
                </CardContent>
              </Card>

              {/* Características (mock data) */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Heart className="h-4 w-4 text-primary" />
                    Características
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">rica em proteínas</Badge>
                    <Badge variant="secondary" className="text-xs">sem fritura</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Ingredientes (mock data) */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Utensils className="h-4 w-4 text-primary" />
                    Ingredientes Principais
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">principais ingredientes</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Tipos de Cozinha (mock data) */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="h-4 w-4 text-primary" />
                    Tipos de Cozinha
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default" className="text-xs">internacional</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })()}
      </DialogContent>
    </Dialog>

    {/* Botões - Apenas no Mobile */}
    <div ref={avancarButtonRef} className="flex justify-between lg:hidden">
      <Button variant="outline" onClick={onVoltar}>
        Voltar
      </Button>
      <Button onClick={handleAvancar}>
        Avançar
      </Button>
    </div>

    {/* Botão Voltar fixo no Desktop */}
    <div className="hidden lg:block">
      <Button variant="outline" onClick={onVoltar}>
        Voltar
      </Button>
    </div>
  </div>;
};
