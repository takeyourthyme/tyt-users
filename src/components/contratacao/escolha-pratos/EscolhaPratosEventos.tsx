import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Edit, Heart, Flame, Info, Search, Utensils, Fish, Beef, ChefHat, Leaf, Soup, Salad, Wheat, Zap, Users, Crown, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DadosContratacao } from "@/pages/Contratacao";
import { loadSession } from "@/services/authService";
import { listDishes, listHighlightedDishes, normalizeDish, type Dish } from "@/services/dishService";
interface Props {
  dados: DadosContratacao;
  onAvancar: (dados: Partial<DadosContratacao>) => void;
  onVoltar: () => void;
}

type Course = "entradas" | "saladas" | "principais" | "sobremesas";

type DishOption = {
  id: string;
  dishId?: number;
  nome: string;
  descricao: string;
  foto: string;
  preco: number;
  favorito?: boolean;
  frequente?: boolean;
  categoria: Course;
};
const CATEGORIAS_ICONES = {
  "entradas": {
    icon: Utensils,
    color: "bg-orange-100 text-orange-700 border-orange-200"
  },
  "saladas": {
    icon: Salad,
    color: "bg-lime-100 text-lime-700 border-lime-200"
  },
  "principais": {
    icon: ChefHat,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200"
  },
  "sobremesas": {
    icon: Heart,
    color: "bg-pink-100 text-pink-700 border-pink-200"
  }
};
const pratosEventos: Record<Course, DishOption[]> = {
  entradas: [{
    id: 'e1',
    nome: 'Bruschetta Italiana',
    descricao: 'Torrada com tomate, manjericão e queijo',
    foto: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop',
    preco: 18,
    favorito: true,
    categoria: 'entradas',
    dishId: 1
  }, {
    id: 'e2',
    nome: 'Carpaccio de Salmão',
    descricao: 'Fatias finas de salmão com alcaparras',
    foto: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    preco: 25,
    favorito: false,
    categoria: 'entradas',
    dishId: 2
  }, {
    id: 'e3',
    nome: 'Camarão na Moranga',
    descricao: 'Camarões refogados servidos na moranga',
    foto: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop',
    preco: 32,
    frequente: true,
    categoria: 'entradas',
    dishId: 3
  }],
  saladas: [{
    id: 's1',
    nome: 'Salada Caesar',
    descricao: 'Alface romana, croutons e molho caesar',
    foto: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    preco: 22,
    favorito: false,
    categoria: 'saladas',
    dishId: 4
  }, {
    id: 's2',
    nome: 'Salada Caprese',
    descricao: 'Tomate, muçarela de búfala e manjericão',
    foto: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    preco: 28,
    favorito: true,
    categoria: 'saladas',
    dishId: 5
  }, {
    id: 's3',
    nome: 'Salada de Quinoa',
    descricao: 'Quinoa com vegetais e molho tahine',
    foto: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    preco: 24,
    frequente: false,
    categoria: 'saladas',
    dishId: 6
  }],
  principais: [{
    id: 'p1',
    nome: 'Salmão Grelhado',
    descricao: 'Salmão com crosta de ervas e legumes',
    foto: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    preco: 58,
    favorito: false,
    categoria: 'principais',
    dishId: 7
  }, {
    id: 'p2',
    nome: 'Risotto de Camarão',
    descricao: 'Risotto cremoso com camarões frescos',
    foto: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop',
    preco: 52,
    frequente: true,
    categoria: 'principais',
    dishId: 8
  }, {
    id: 'p3',
    nome: 'Filé Wellington',
    descricao: 'Filé mignon envolvido em massa folhada',
    foto: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop',
    preco: 75,
    favorito: true,
    categoria: 'principais',
    dishId: 9
  }],
  sobremesas: [{
    id: 'so1',
    nome: 'Tiramisù',
    descricao: 'Sobremesa italiana com café e mascarpone',
    foto: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
    preco: 18,
    favorito: true,
    categoria: 'sobremesas',
    dishId: 10
  }, {
    id: 'so2',
    nome: 'Petit Gateau',
    descricao: 'Bolinho de chocolate com sorvete de baunilha',
    foto: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    preco: 22,
    frequente: false,
    categoria: 'sobremesas',
    dishId: 11
  }, {
    id: 'so3',
    nome: 'Cheesecake de Frutas Vermelhas',
    descricao: 'Torta cremosa com calda de frutas',
    foto: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400&h=300&fit=crop',
    preco: 20,
    favorito: false,
    categoria: 'sobremesas',
    dishId: 12
  }]
};

// Catálogo completo de pratos da plataforma
const catalogoPratos: DishOption[] = [
  // Entradas adicionais
  {
    id: 'cat-e1',
    nome: 'Hummus com Vegetais',
    descricao: 'Grão-de-bico, tahine, azeite, vegetais crudité',
    foto: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&h=300&fit=crop',
    preco: 20,
    categoria: 'entradas'
  },
  {
    id: 'cat-e2',
    nome: 'Falafel com Tahine',
    descricao: 'Crocantes bolinhos de falafel servidos com molho tahine cremoso',
    foto: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop',
    preco: 22,
    categoria: 'entradas'
  },
  // Saladas adicionais
  {
    id: 'cat-s1',
    nome: 'Salada Caesar com Camarão',
    descricao: 'Alface americana, camarão grelhado, croutons, parmesão',
    foto: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    preco: 26,
    categoria: 'saladas'
  },
  {
    id: 'cat-s2',
    nome: 'Salada Mediterrânea',
    descricao: 'Mix de folhas, tomate cereja, azeitonas e queijo feta',
    foto: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    preco: 24,
    categoria: 'saladas'
  },
  // Pratos principais adicionais
  {
    id: 'cat-p1',
    nome: 'Yakisoba de Frango',
    descricao: 'Macarrão yakisoba, frango, legumes, molho shoyu',
    foto: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    preco: 45,
    categoria: 'principais'
  },
  {
    id: 'cat-p2',
    nome: 'Risotto de Cogumelos Porcini',
    descricao: 'Arroz arbóreo, cogumelos porcini, parmesão',
    foto: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop',
    preco: 50,
    categoria: 'principais'
  },
  {
    id: 'cat-p3',
    nome: 'Picanha na Brasa',
    descricao: 'Suculenta picanha grelhada na brasa, temperada apenas com sal grosso',
    foto: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop',
    preco: 68,
    categoria: 'principais'
  },
  {
    id: 'cat-p4',
    nome: 'Linguine alle Vongole',
    descricao: 'Linguine, vongole, alho, vinho branco, salsa',
    foto: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
    preco: 55,
    categoria: 'principais'
  },
  {
    id: 'cat-p5',
    nome: 'Lagosta Thermidor',
    descricao: 'Sofisticada lagosta thermidor com molho bechamel cremoso',
    foto: 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=400&h=300&fit=crop',
    preco: 120,
    categoria: 'principais'
  },
  // Sobremesas adicionais
  {
    id: 'cat-so1',
    nome: 'Panna Cotta de Frutas Vermelhas',
    descricao: 'Sobremesa italiana cremosa com calda de frutas vermelhas',
    foto: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400&h=300&fit=crop',
    preco: 18,
    categoria: 'sobremesas'
  },
  {
    id: 'cat-so2',
    nome: 'Brownie com Sorvete',
    descricao: 'Brownie de chocolate com sorvete de creme',
    foto: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    preco: 16,
    categoria: 'sobremesas'
  },
  {
    id: 'cat-so3',
    nome: 'Mousse de Chocolate Belga',
    descricao: 'Mousse aerado feito com chocolate belga',
    foto: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
    preco: 19,
    categoria: 'sobremesas'
  }
];
export const EscolhaPratosEventos: React.FC<Props> = ({
  dados,
  onAvancar,
  onVoltar
}) => {
  const {
    toast
  } = useToast();
  type SelectedByCourse = Record<Course, DishOption[]>;
  const emptySelected: SelectedByCourse = {
    entradas: [],
    saladas: [],
    principais: [],
    sobremesas: [],
  };

  const [nivelServico, setNivelServico] = useState<'classico' | 'banquete'>(dados.nivelServico || 'classico');
  const [pratosSelecionados, setPratosSelecionados] = useState<SelectedByCourse>(() => {
    const raw = dados.pratosSelecionados;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return emptySelected;
    const record = raw as Record<string, unknown>;
    const next: SelectedByCourse = { ...emptySelected };
    (Object.keys(next) as Course[]).forEach((key) => {
      const value = record[key];
      if (Array.isArray(value)) next[key] = value as DishOption[];
    });
    return next;
  });
  const [personalizacoes, setPersonalizacoes] = useState<{
    [key: string]: string;
  }>({});
  const [dialogPersonalizacao, setDialogPersonalizacao] = useState<string | null>(null);
  const [textoPersonalizacao, setTextoPersonalizacao] = useState('');
  const [pesquisaPratos, setPesquisaPratos] = useState('');
  const [dialogAdicionar, setDialogAdicionar] = useState<Course | null>(null);
  const [pesquisaCatalogo, setPesquisaCatalogo] = useState('');
  const [pratoDetalhesDialog, setPratoDetalhesDialog] = useState<DishOption | null>(null);
  const [availableByCourse, setAvailableByCourse] = useState<Record<Course, DishOption[]>>({
    entradas: [],
    saladas: [],
    principais: [],
    sobremesas: [],
  });
  const [catalogDishes, setCatalogDishes] = useState<DishOption[]>([]);
  const [isLoadingDishes, setIsLoadingDishes] = useState(true);

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

    const classifyCourse = (raw: string): Course => {
      const value = raw
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (value.includes("entrada") || value.includes("aperitivo") || value.includes("petisco")) return "entradas";
      if (value.includes("salad")) return "saladas";
      if (value.includes("sobremesa") || value.includes("doce") || value.includes("dessert")) return "sobremesas";
      return "principais";
    };

    setIsLoadingDishes(true);
    const request = token ? listDishes({ token }) : listHighlightedDishes();

    request
      .then((data) => {
        const list = extractList(data);
        if (!Array.isArray(list) || list.length === 0) throw new Error("empty");

        const placeholder = "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=800&fit=crop";
        const mapped = list
          .map((dish) => {
            const normalized = normalizeDish(dish);
            const dishId = Number(normalized.id);
            if (!Number.isFinite(dishId)) return undefined;
            const categoryRaw = normalized.categories[0] || "";
            const categoria = classifyCourse(categoryRaw);
            const foto = normalized.photoUrl || placeholder;
            return {
              id: normalized.id,
              dishId,
              nome: normalized.name,
              descricao: normalized.description,
              foto,
              preco: 0,
              categoria,
            };
          })
          .filter((v): v is DishOption & { dishId: number } => Boolean(v));

        if (mapped.length === 0) throw new Error("empty");

        const byCourse: Record<Course, DishOption[]> = {
          entradas: [],
          saladas: [],
          principais: [],
          sobremesas: [],
        };
        mapped.forEach((dish) => {
          byCourse[dish.categoria].push(dish);
        });

        setCatalogDishes(mapped);
        setAvailableByCourse(byCourse);
      })
      .catch(() => {
        setCatalogDishes(catalogoPratos);
        setAvailableByCourse(pratosEventos);
      })
      .finally(() => setIsLoadingDishes(false));
  }, []);
  const getLimites = () => {
    if (nivelServico === 'classico') {
      return {
        entradas: 1,
        saladas: 2,
        principais: 2,
        sobremesas: 1
      };
    } else {
      return {
        entradas: 2,
        saladas: 3,
        principais: 3,
        sobremesas: 3
      };
    }
  };
  const limites = getLimites();
  const togglePrato = (categoria: Course, prato: DishOption) => {
    setPratosSelecionados((prev) => {
      const categoriaPratos = prev[categoria] || [];
      const jaEscolhido = categoriaPratos.find((p) => p.id === prato.id);
      if (jaEscolhido) {
        return {
          ...prev,
          [categoria]: categoriaPratos.filter((p) => p.id !== prato.id)
        };
      } else {
        const limite = limites[categoria as keyof typeof limites];
        if (categoriaPratos.length < limite) {
          return {
            ...prev,
            [categoria]: [...categoriaPratos, prato]
          };
        } else {
          // Mostrar notificação de limite atingido
          toast({
            title: "Limite atingido",
            description: `Você já selecionou o limite de ${categoria} (${limite}). Desmarque uma opção para marcar essa.`,
            duration: 3000
          });
        }
      }
      return prev;
    });
  };
  const abrirPersonalizacao = (pratoId: string) => {
    setDialogPersonalizacao(pratoId);
    setTextoPersonalizacao(personalizacoes[pratoId] || '');
  };
  const salvarPersonalizacao = () => {
    if (dialogPersonalizacao) {
      setPersonalizacoes(prev => ({
        ...prev,
        [dialogPersonalizacao]: textoPersonalizacao
      }));
      setDialogPersonalizacao(null);
      setTextoPersonalizacao('');
    }
  };
  const verificarCompleto = () => {
    return Object.keys(limites).every(categoria => {
      const categoria_key = categoria as keyof typeof limites;
      return pratosSelecionados[categoria]?.length === limites[categoria_key];
    });
  };
  const calcularTotal = () => {
    const precoChef = 550;
    let precoCompras = 0;
    Object.values(pratosSelecionados).forEach((pratos) => {
      pratos.forEach((prato) => {
        precoCompras += prato.preco;
      });
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
  const handleAvancar = () => {
    const categoriasFaltando: string[] = [];
    (Object.keys(limites) as Course[]).forEach((categoria) => {
      const categoria_key = categoria as keyof typeof limites;
      const selecionados = pratosSelecionados[categoria]?.length || 0;
      const limite = limites[categoria_key];
      if (selecionados < limite) {
        categoriasFaltando.push(`${categoria} (${selecionados}/${limite})`);
      }
    });
    if (categoriasFaltando.length > 0) {
      toast({
        title: "Seleção incompleta",
        description: `Ainda faltam selecionar itens em: ${categoriasFaltando.join(', ')}`,
        duration: 4000
      });
      return;
    }
    onAvancar({
      nivelServico,
      pratosSelecionados: (Object.entries(pratosSelecionados) as Array<[Course, DishOption[]]>).flatMap(([categoria, pratos]) =>
        pratos.map((prato) => ({
          ...prato,
          categoria,
          personalizacao: personalizacoes[prato.id] || '',
        })),
      ),
    });
  };
  const filtrarPratos = (pratos: DishOption[]) => {
    if (!pesquisaPratos) return pratos;
    return pratos.filter(prato => prato.nome.toLowerCase().includes(pesquisaPratos.toLowerCase()) || prato.descricao.toLowerCase().includes(pesquisaPratos.toLowerCase()));
  };
  const renderCategoria = (categoria: Course, pratos: DishOption[], titulo: string) => {
    const categoriaSelecionados = pratosSelecionados[categoria] || [];
    const limite = limites[categoria as keyof typeof limites];
    const pratosFiltrados = filtrarPratos(pratos);

    // Adicionar pratos do catálogo que foram escolhidos mas não estão na lista padrão
    const pratosAdicionais = categoriaSelecionados.filter((ps) =>
      !pratos.find(p => p.id === ps.id)
    );
    const todosPratos = [...pratosFiltrados, ...pratosAdicionais];

    return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{titulo}</h3>
        <Badge variant="outline">
          {categoriaSelecionados.length}/{limite}
        </Badge>
      </div>

      <div className="space-y-3">
        {todosPratos.map(prato => {
          const selecionado = categoriaSelecionados.find((p) => p.id === prato.id);
          const temPersonalizacao = personalizacoes[prato.id];
          return <Card key={prato.id} className={`cursor-pointer transition-colors ${selecionado ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`} onClick={() => togglePrato(categoria, prato)}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Checkbox fora da foto, alinhado à esquerda */}
                <div className="flex items-center">
                  <Checkbox checked={!!selecionado} className="pointer-events-none" />
                </div>

                {/* Foto do prato */}
                <div className="relative">
                  <img src={prato.foto} alt={prato.nome} className="w-20 h-20 object-cover rounded-lg" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{prato.nome}</h4>
                    {prato.favorito && <Heart className="text-red-500 fill-current" size={16} />}
                    {prato.frequente && <Flame className="text-orange-500 fill-current" size={16} />}
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">{prato.descricao}</p>
                </div>

                <div className="flex flex-col gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={e => e.stopPropagation()}>
                        <Eye size={16} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">{prato.nome}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <img src={prato.foto} alt={prato.nome} className="w-full h-64 object-cover rounded-lg" />
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-sm">Descrição</h4>
                            <p className="text-sm">{prato.descricao}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-semibold">Categoria</h4>
                              <p className="capitalize">{prato.categoria}</p>
                            </div>

                          </div>

                          {(prato.favorito || prato.frequente) && <div>
                            <h4 className="font-semibold text-sm">Características</h4>
                            <div className="flex gap-2 mt-1">
                              {prato.favorito && <Badge variant="outline" className="text-xs">
                                <Heart className="w-3 h-3 mr-1 text-red-500 fill-current" />
                                Favorito
                              </Badge>}
                              {prato.frequente && <Badge variant="outline" className="text-xs">
                                <Flame className="w-3 h-3 mr-1 text-orange-500 fill-current" />
                                Mais pedido
                              </Badge>}
                            </div>
                          </div>}

                          <div>
                            <h4 className="font-semibold text-sm">Informações adicionais</h4>
                            <p className="text-sm text-muted-foreground">
                              Este prato faz parte do nosso cardápio especial para eventos.
                              Preparado com ingredientes frescos e técnicas culinárias refinadas.
                            </p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {selecionado && <Button variant={temPersonalizacao ? "default" : "outline"} size="sm" onClick={e => {
                    e.stopPropagation();
                    abrirPersonalizacao(prato.id);
                  }}>
                    <Edit size={16} />
                  </Button>}
                </div>
              </div>
            </CardContent>
          </Card>;
        })}

        {/* Botão Adicionar */}
        <Button
          variant="outline"
          className="w-full border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary hover:text-white"
          onClick={() => setDialogAdicionar(categoria)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar {categoria === 'principais' ? 'Prato Principal' : titulo.slice(0, -1)}
        </Button>
      </div>
    </div>;
  };
  return <div className="space-y-8">
    <div className="text-center">
      <p className="text-muted-foreground">
        Escolha o cardápio completo para o seu evento
      </p>
    </div>

    <div className="grid lg:grid-cols-3 gap-8">
      {/* Coluna da Esquerda - Catálogo */}
      <div className="lg:col-span-2 space-y-6">
        {/* Nível de Serviço */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-base font-semibold">Nível de Serviço</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info size={16} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Níveis de Serviço</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Clássico</h4>
                      <p className="text-sm text-muted-foreground">
                        Os convidados serão bem servidos em quantidades de comida e opções comuns em eventos.
                        Ninguém vai ficar com fome. (1 Entrada, 2 Saladas, 2 Principais, 1 Sobremesa)
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Banquete</h4>
                      <p className="text-sm text-muted-foreground">
                        Um número maior de opções no buffet com mais variedade de pratos.
                        (2 Entradas, 3 Saladas, 3 Principais, 3 Sobremesas)
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <RadioGroup value={nivelServico} onValueChange={value => setNivelServico(value as 'classico' | 'banquete')} className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="classico" id="classico" />
                <Label htmlFor="classico" className="flex-1 cursor-pointer">
                  <Card className={`p-4 transition-colors ${nivelServico === 'classico' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <div className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Clássico</h4>
                        <p className="text-sm text-muted-foreground">Porções adequadas</p>
                      </div>
                    </div>
                  </Card>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="banquete" id="banquete" />
                <Label htmlFor="banquete" className="flex-1 cursor-pointer">
                  <Card className={`p-4 transition-colors ${nivelServico === 'banquete' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                    <div className="flex items-center gap-3">
                      <Crown className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Banquete</h4>
                        <p className="text-sm text-muted-foreground">Maior variedade</p>
                      </div>
                    </div>
                  </Card>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Pesquisa de Pratos */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Pesquisar pratos..." value={pesquisaPratos} onChange={e => setPesquisaPratos(e.target.value)} className="pl-10" />
        </div>

        {/* Categorias de Pratos */}
        {isLoadingDishes ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  {Array.from({ length: 3 }).map((__, itemIndex) => (
                    <div key={itemIndex} className="flex gap-4">
                      <Skeleton className="h-20 w-20" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {renderCategoria('entradas', availableByCourse.entradas, 'Entradas')}
            {renderCategoria('saladas', availableByCourse.saladas, 'Saladas')}
            {renderCategoria('principais', availableByCourse.principais, 'Pratos Principais')}
            {renderCategoria('sobremesas', availableByCourse.sobremesas, 'Sobremesas')}
          </div>
        )}
      </div>

      {/* Coluna da Direita - Resumo */}
      <div className="lg:sticky lg:top-6 lg:h-fit space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Menu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pratos por Categoria */}
            {(Object.entries(pratosSelecionados) as Array<[Course, DishOption[]]>).map(([categoria, pratos]) => (
              <div key={categoria}>
                <h4 className="font-semibold capitalize mb-2">{categoria}</h4>
                <div className="space-y-1 mb-4">
                  {pratos.map((prato) => (
                    <div key={prato.id} className="flex justify-between text-sm">
                      <span>{prato.nome}</span>
                      <span>R$ {prato.preco.toFixed(2)}</span>
                    </div>
                  ))}
                  {pratos.length === 0 && <div className="text-muted-foreground text-sm">Aguardando seleção</div>}
                </div>
              </div>
            ))}

            <hr />

            {/* Resumo Financeiro */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Serviço do Chef:</span>
                <span>R$ {precoChef.toFixed(2)}</span>
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
                <span>R$ {precoCompras.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Botão Avançar */}
            <Button onClick={handleAvancar} className="w-full">
              Avançar
            </Button>
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
          <p className="text-sm text-gray-600">
            Descreva as mudanças que você gostaria no preparo deste prato:
          </p>
          <Textarea value={textoPersonalizacao} onChange={e => setTextoPersonalizacao(e.target.value)} placeholder="Ex: Sem cebola, mais tempero, ponto da carne mal passado..." rows={4} />
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

    {/* Dialog de Adicionar Pratos do Catálogo */}
    <Dialog open={!!dialogAdicionar} onOpenChange={() => {
      setDialogAdicionar(null);
      setPesquisaCatalogo('');
      setPratoDetalhesDialog(null);
    }}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Adicionar {dialogAdicionar === 'entradas' ? 'Entrada' :
              dialogAdicionar === 'saladas' ? 'Salada' :
                dialogAdicionar === 'principais' ? 'Prato Principal' :
                  'Sobremesa'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar pratos..."
              value={pesquisaCatalogo}
              onChange={(e) => setPesquisaCatalogo(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Listagem de Pratos do Catálogo */}
          <div className="space-y-3">
            {catalogDishes
              .filter(prato =>
                prato.categoria === dialogAdicionar &&
                (pesquisaCatalogo === '' ||
                  prato.nome.toLowerCase().includes(pesquisaCatalogo.toLowerCase()) ||
                  prato.descricao.toLowerCase().includes(pesquisaCatalogo.toLowerCase()))
              )
              .map(prato => {
                const categoriaSelecionados = pratosSelecionados[dialogAdicionar!] || [];
                const jaEscolhido = categoriaSelecionados.find((p) => p.id === prato.id);

                return (
                  <Card key={prato.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Foto do prato */}
                        <div className="relative">
                          <img
                            src={prato.foto}
                            alt={prato.nome}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>

                        {/* Informações do prato */}
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{prato.nome}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{prato.descricao}</p>
                          <p className="text-sm font-semibold text-primary">R$ {prato.preco.toFixed(2)}</p>
                        </div>

                        {/* Botões de ação */}
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPratoDetalhesDialog(prato)}
                          >
                            <Eye size={16} className="mr-1" />
                            Ver
                          </Button>

                          <Button
                            size="sm"
                            disabled={Boolean(jaEscolhido)}
                            onClick={() => {
                              togglePrato(dialogAdicionar!, prato);
                              if (!jaEscolhido) {
                                const categoriaSelecionados = pratosSelecionados[dialogAdicionar!] || [];
                                const limite = limites[dialogAdicionar! as keyof typeof limites];
                                // Só fecha se conseguiu adicionar
                                if (categoriaSelecionados.length < limite) {
                                  setDialogAdicionar(null);
                                  setPesquisaCatalogo('');
                                }
                              }
                            }}
                          >
                            {jaEscolhido ? 'Escolhido' : 'Escolher'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Dialog de Detalhes do Prato do Catálogo */}
    <Dialog open={!!pratoDetalhesDialog} onOpenChange={() => setPratoDetalhesDialog(null)}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {pratoDetalhesDialog && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{pratoDetalhesDialog.nome}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={pratoDetalhesDialog.foto}
                alt={pratoDetalhesDialog.nome}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm">Descrição</h4>
                  <p className="text-sm">{pratoDetalhesDialog.descricao}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold">Categoria</h4>
                    <p className="capitalize">{pratoDetalhesDialog.categoria}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Preço</h4>
                    <p>R$ {pratoDetalhesDialog.preco.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm">Informações adicionais</h4>
                  <p className="text-sm text-muted-foreground">
                    Este prato faz parte do nosso catálogo completo.
                    Preparado com ingredientes frescos e técnicas culinárias refinadas.
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  const categoriaSelecionados = pratosSelecionados[pratoDetalhesDialog.categoria] || [];
                  const jaEscolhido = categoriaSelecionados.find((p) => p.id === pratoDetalhesDialog.id);

                  if (!jaEscolhido) {
                    togglePrato(pratoDetalhesDialog.categoria, pratoDetalhesDialog);
                    const limite = limites[pratoDetalhesDialog.categoria as keyof typeof limites];
                    // Só fecha se conseguiu adicionar
                    if (categoriaSelecionados.length < limite) {
                      setPratoDetalhesDialog(null);
                      setDialogAdicionar(null);
                      setPesquisaCatalogo('');
                    }
                  }
                }}
                disabled={Boolean(pratosSelecionados[pratoDetalhesDialog.categoria]?.find((p) => p.id === pratoDetalhesDialog.id))}
              >
                {pratosSelecionados[pratoDetalhesDialog.categoria]?.find((p) => p.id === pratoDetalhesDialog.id)
                  ? 'Já Escolhido'
                  : 'Escolher este Prato'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>

    {/* Botão Voltar */}
    <div className="flex justify-start">
      <Button variant="outline" onClick={onVoltar}>
        Voltar
      </Button>
    </div>
  </div>;
};
