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
import { Eye, Edit, Heart, Flame, Info, Search, Utensils, ChefHat, Salad, Plus, Users, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DadosContratacao } from "@/pages/Contratacao";
import { loadSession } from "@/services/authService";
import { listDishes, listHighlightedDishes, normalizeDish, type Dish } from "@/services/dishService";
import { listDishCategories, listThemes, type LookupOption } from "@/services/lookupService";

interface Props {
  dados: DadosContratacao;
  onAvancar: (dados: Partial<DadosContratacao>) => void;
  onVoltar: () => void;
}

type DishOption = {
  id: string;
  dishId?: number;
  nome: string;
  descricao: string;
  foto: string;
  preco: number;
  favorito?: boolean;
  frequente?: boolean;
  categorias: string[];
  themes?: string[];
  themeIds?: number[];
};

// Unified mock data for fallback
const mockDishes: DishOption[] = [
  // Entradas
  {
    id: 'e1',
    nome: 'Bruschetta Italiana',
    descricao: 'Torrada com tomate, manjericão e queijo',
    foto: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&h=300&fit=crop',
    preco: 18,
    favorito: true,
    categorias: ['entradas'],
    dishId: 1,
    themes: ['Noite Italiana', 'Festa Italiana', 'Noite de Massas']
  },
  {
    id: 'e2',
    nome: 'Carpaccio de Salmão',
    descricao: 'Fatias finas de salmão com alcaparras',
    foto: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    preco: 25,
    favorito: false,
    categorias: ['entradas'],
    dishId: 2,
    themes: ['Jantar das Meninas', 'Clássicos Mediterrâneos']
  },
  {
    id: 'e3',
    nome: 'Camarão na Moranga',
    descricao: 'Camarões refogados servidos na moranga',
    foto: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop',
    preco: 32,
    frequente: true,
    categorias: ['entradas'],
    dishId: 3,
    themes: ['Clássicos Brasileiros']
  },
  {
    id: 'cat-e1',
    nome: 'Hummus com Vegetais',
    descricao: 'Grão-de-bico, tahine, azeite, vegetais crudité',
    foto: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=400&h=300&fit=crop',
    preco: 20,
    categorias: ['entradas'],
    themes: ['Noite Marroquina', 'Clássicos Mediterrâneos']
  },
  {
    id: 'cat-e2',
    nome: 'Falafel com Tahine',
    descricao: 'Crocantes bolinhos de falafel servidos com molho tahine cremoso',
    foto: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop',
    preco: 22,
    categorias: ['entradas'],
    themes: ['Noite Marroquina', 'Clássicos Judaicos']
  },
  // Saladas
  {
    id: 's1',
    nome: 'Salada Caesar',
    descricao: 'Alface romana, croutons e molho caesar',
    foto: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    preco: 22,
    favorito: false,
    categorias: ['saladas'],
    dishId: 4,
    themes: ['Almoço de Country Club']
  },
  {
    id: 's2',
    nome: 'Salada Caprese',
    descricao: 'Tomate, muçarela de búfala e manjericão',
    foto: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    preco: 28,
    favorito: true,
    categorias: ['saladas'],
    dishId: 5,
    themes: ['Noite Italiana', 'Festa Italiana']
  },
  {
    id: 's3',
    nome: 'Salada de Quinoa',
    descricao: 'Quinoa com vegetais e molho tahine',
    foto: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    preco: 24,
    frequente: false,
    categorias: ['saladas'],
    dishId: 6,
    themes: ['Clássicos Mediterrâneos', 'Jantar das Meninas']
  },
  {
    id: 'cat-s1',
    nome: 'Salada Caesar com Camarão',
    descricao: 'Alface americana, camarão grelhado, croutons, parmesão',
    foto: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    preco: 26,
    categorias: ['saladas'],
    themes: ['Almoço de Country Club']
  },
  {
    id: 'cat-s2',
    nome: 'Salada Mediterrânea',
    descricao: 'Mix de folhas, tomate cereja, azeitonas e queijo feta',
    foto: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    preco: 24,
    categorias: ['saladas'],
    themes: ['Clássicos Mediterrâneos']
  },
  // Principais
  {
    id: 'p1',
    nome: 'Salmão Grelhado',
    descricao: 'Salmão com crosta de ervas e legumes',
    foto: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    preco: 58,
    favorito: false,
    categorias: ['principais'],
    dishId: 7,
    themes: ['Clássicos Mediterrâneos', 'Jantar das Meninas']
  },
  {
    id: 'p2',
    nome: 'Risotto de Camarão',
    descricao: 'Risotto cremoso com camarões frescos',
    foto: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop',
    preco: 52,
    frequente: true,
    categorias: ['principais'],
    dishId: 8,
    themes: ['Noite Italiana', 'Clássicos Mediterrâneos']
  },
  {
    id: 'p3',
    nome: 'Filé Wellington',
    descricao: 'Filé mignon envolvido em massa folhada',
    foto: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop',
    preco: 75,
    favorito: true,
    categorias: ['principais'],
    dishId: 9,
    themes: ['Jantar dos Meninos', 'Almoço de Country Club']
  },
  {
    id: 'cat-p1',
    nome: 'Yakisoba de Frango',
    descricao: 'Macarrão yakisoba, frango, legumes, molho shoyu',
    foto: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    preco: 45,
    categorias: ['principais'],
    themes: ['Comida de Pub']
  },
  {
    id: 'cat-p2',
    nome: 'Risotto de Cogumelos Porcini',
    descricao: 'Arroz arbóreo, cogumelos porcini, parmesão',
    foto: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop',
    preco: 50,
    categorias: ['principais'],
    themes: ['Noite de Massas', 'Noite Italiana']
  },
  {
    id: 'cat-p3',
    nome: 'Picanha na Brasa',
    descricao: 'Suculenta picanha grelhada na brasa, temperada apenas com sal grosso',
    foto: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop',
    preco: 68,
    categorias: ['principais'],
    themes: ['Clássicos da Churrascaria']
  },
  {
    id: 'cat-p4',
    nome: 'Linguine alle Vongole',
    descricao: 'Linguine, vongole, alho, vinho branco, salsa',
    foto: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
    preco: 55,
    categorias: ['principais'],
    themes: ['Noite Italiana', 'Clássicos Mediterrâneos']
  },
  {
    id: 'cat-p5',
    nome: 'Lagosta Thermidor',
    descricao: 'Sofisticada lagosta thermidor com molho bechamel cremoso',
    foto: 'https://images.unsplash.com/photo-1625944230945-1b7dd3b949ab?w=400&h=300&fit=crop',
    preco: 120,
    categorias: ['principais'],
    themes: ['Jantar Romântico', 'Almoço de Country Club']
  },
  // Sobremesas
  {
    id: 'so1',
    nome: 'Tiramisù',
    descricao: 'Sobremesa italiana com café e mascarpone',
    foto: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
    preco: 18,
    favorito: true,
    categorias: ['sobremesas'],
    dishId: 10,
    themes: ['Noite Italiana', 'Festa Italiana', 'Noite de Massas']
  },
  {
    id: 'so2',
    nome: 'Petit Gateau',
    descricao: 'Bolinho de chocolate com sorvete de baunilha',
    foto: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    preco: 22,
    frequente: false,
    categorias: ['sobremesas'],
    dishId: 11,
    themes: ['Jantar Romântico']
  },
  {
    id: 'so3',
    nome: 'Cheesecake de Frutas Vermelhas',
    descricao: 'Torta cremosa com calda de frutas',
    foto: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400&h=300&fit=crop',
    preco: 20,
    favorito: false,
    categorias: ['sobremesas'],
    dishId: 12,
    themes: ['Jantar das Meninas']
  },
  {
    id: 'cat-so1',
    nome: 'Panna Cotta de Frutas Vermelhas',
    descricao: 'Sobremesa italiana cremosa com calda de frutas vermelhas',
    foto: 'https://images.unsplash.com/photo-1567306301408-9b74779a11af?w=400&h=300&fit=crop',
    preco: 18,
    categorias: ['sobremesas'],
    themes: ['Festa Italiana', 'Noite de Massas']
  },
  {
    id: 'cat-so2',
    nome: 'Brownie com Sorvete',
    descricao: 'Brownie de chocolate com sorvete de creme',
    foto: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    preco: 16,
    categorias: ['sobremesas'],
    themes: ['Comida de Pub']
  },
  {
    id: 'cat-so3',
    nome: 'Mousse de Chocolate Belga',
    descricao: 'Mousse aerado feito com chocolate belga',
    foto: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
    preco: 19,
    categorias: ['sobremesas'],
    themes: ['Jantar dos Meninos']
  }
];

const getFallbackThemeName = (id: string): string => {
  const map: Record<string, string> = {
    'noite-italiana': 'Noite Italiana',
    'classicos-churrascaria': 'Clássicos da Churrascaria',
    'comida-pub': 'Comida de Pub',
    'jantar-meninas': 'Jantar das Meninas',
    'jantar-meninos': 'Jantar dos Meninos',
    'classicos-brasileiros': 'Clássicos Brasileiros',
    'mediterraneos': 'Clássicos Mediterrâneos',
    'judaicos': 'Clássicos Judaicos',
    'almoco-country': 'Almoço de Country Club',
    'noite-marroquina': 'Noite Marroquina',
    'festa-espanhola': 'Festa Espanhola',
    'festa-italiana': 'Festa Italiana',
    'noite-massas': 'Noite de Massas',
    'petiscos-especiais': 'Petiscos Especiais',
    'acao-gracas': 'Ação de Graças',
    'noite-natal': 'Noite de Natal',
    'oktoberfest': 'Oktoberfest',
    'jantar-romantico': 'Jantar Romântico'
  };
  return map[id] || id;
};

const isDishInTheme = (prato: DishOption, temaId: string, selectedThemeName?: string) => {
  if (!temaId) return true;
  
  const numericThemeId = parseInt(temaId, 10);
  if (!isNaN(numericThemeId) && prato.themeIds?.includes(numericThemeId)) {
    return true;
  }

  const themeName = selectedThemeName || getFallbackThemeName(temaId);
  const normTheme = themeName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  
  if (prato.themes) {
    return prato.themes.some((tName) => {
      const normDishTheme = tName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return normDishTheme === normTheme;
    });
  }

  return false;
};

export const EscolhaPratosEventos: React.FC<Props> = ({
  dados,
  onAvancar,
  onVoltar
}) => {
  const {
    toast
  } = useToast();

  const [nivelServico, setNivelServico] = useState<'classico' | 'banquete'>(dados.nivelServico || 'classico');
  const [categorias, setCategorias] = useState<LookupOption[]>([]);
  const [pratosSelecionados, setPratosSelecionados] = useState<DishOption[]>(() => {
    const raw = dados.pratosSelecionados;
    if (Array.isArray(raw)) return raw as DishOption[];
    return [];
  });
  const [personalizacoes, setPersonalizacoes] = useState<{
    [key: string]: string;
  }>({});
  const [dialogPersonalizacao, setDialogPersonalizacao] = useState<string | null>(null);
  const [textoPersonalizacao, setTextoPersonalizacao] = useState('');
  const [pesquisaPratos, setPesquisaPratos] = useState('');
  const [dialogAdicionar, setDialogAdicionar] = useState<string | null>(null);
  const [pesquisaCatalogo, setPesquisaCatalogo] = useState('');
  const [pratoDetalhesDialog, setPratoDetalhesDialog] = useState<DishOption | null>(null);
  const [catalogDishes, setCatalogDishes] = useState<DishOption[]>([]);
  const [isLoadingDishes, setIsLoadingDishes] = useState(true);

  const matchesCategory = (pratoCategorias: string[], targetCategoryId: string) => {
    if (!pratoCategorias || !Array.isArray(pratoCategorias)) return false;

    if (pratoCategorias.includes(targetCategoryId)) return true;

    const targetCategory = categorias.find(c => c.id === targetCategoryId);
    if (!targetCategory) return false;

    const targetLabelNorm = targetCategory.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return pratoCategorias.some(cat => {
      const catNorm = cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (catNorm === targetLabelNorm) return true;

      const catLookup = categorias.find(c => c.id === cat);
      if (catLookup) {
        const catLookupNorm = catLookup.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if (catLookupNorm === targetLabelNorm) return true;
      }
      return false;
    });
  };

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

    const loadData = async () => {
      setIsLoadingDishes(true);
      try {
        const cats = await listDishCategories({ token });
        const hasCategories = cats && cats.length > 0;
        if (hasCategories) {
          setCategorias(cats);
        } else {
          setCategorias([{ id: "prato", label: "Prato" }]);
        }

        const request = token ? listDishes({ token }) : listHighlightedDishes();
        const data = await request;
        const list = extractList(data);

        const placeholder = "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=800&fit=crop";
        const mapped = list
          .map((dish) => {
            const normalized = normalizeDish(dish);
            const dishId = Number(normalized.id);
            if (!Number.isFinite(dishId)) return undefined;
            return {
              id: normalized.id,
              dishId,
              nome: normalized.name,
              descricao: normalized.description,
              foto: normalized.photoUrl || placeholder,
              preco: 0,
              categorias: hasCategories ? normalized.categories : ["prato"],
              themes: normalized.themes,
              themeIds: normalized.themeIds,
            };
          })
          .filter((v): v is DishOption & { dishId: number } => Boolean(v));

        let selectedThemeName = "";
        if (dados.temaSelecionado) {
          try {
            const themesList = await listThemes({ token });
            const found = themesList.find(t => t.id === dados.temaSelecionado);
            if (found) selectedThemeName = found.nome;
          } catch (e) {
            console.warn("Could not load themes list for matching:", e);
          }
        }

        const allDishes = mapped.length > 0 ? mapped : mockDishes;
        const filteredDishes = allDishes.filter(prato => 
          dados.temaSelecionado ? isDishInTheme(prato, dados.temaSelecionado, selectedThemeName) : true
        );

        setCatalogDishes(filteredDishes);

        if (!dados.pratosSelecionados || dados.pratosSelecionados.length === 0) {
          setPratosSelecionados(filteredDishes);
          if (filteredDishes.length > 5) {
            setNivelServico('banquete');
          } else {
            setNivelServico('classico');
          }
        }
      } catch {
        const fallbackThemeName = dados.temaSelecionado ? getFallbackThemeName(dados.temaSelecionado) : "";
        const filteredMock = mockDishes.filter(prato =>
          dados.temaSelecionado ? isDishInTheme(prato, dados.temaSelecionado, fallbackThemeName) : true
        );
        setCatalogDishes(filteredMock);
        if (!dados.pratosSelecionados || dados.pratosSelecionados.length === 0) {
          setPratosSelecionados(filteredMock);
          if (filteredMock.length > 5) {
            setNivelServico('banquete');
          } else {
            setNivelServico('classico');
          }
        }
        setCategorias([
          { id: "entradas", label: "Entradas" },
          { id: "saladas", label: "Saladas" },
          { id: "principais", label: "Pratos Principais" },
          { id: "sobremesas", label: "Sobremesas" },
        ]);
      } finally {
        setIsLoadingDishes(false);
      }
    };

    void loadData();
  }, [dados.temaSelecionado, dados.pratosSelecionados]);

  const togglePrato = (prato: DishOption) => {
    const isSelected = pratosSelecionados.some((p) => p.id === prato.id);
    if (isSelected) {
      setPratosSelecionados((prev) => prev.filter((p) => p.id !== prato.id));
    } else {
      const limit = nivelServico === 'classico' ? 5 : 10;
      if (pratosSelecionados.length < limit) {
        setPratosSelecionados((prev) => [...prev, prato]);
      } else {
        toast({
          title: "Limite atingido",
          description: `Você já selecionou o limite de ${limit} pratos para o nível ${nivelServico === 'classico' ? 'Clássico' : 'Banquete'}. Desmarque uma opção para marcar esta.`,
          duration: 3000
        });
      }
    }
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

  const calcularTotal = () => {
    const precoChef = 550;
    const precoCompras = pratosSelecionados.reduce((acc, p) => acc + p.preco, 0);
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
    if (pratosSelecionados.length === 0) {
      toast({
        title: "Seleção incompleta",
        description: "Selecione ao menos 1 prato para continuar.",
        duration: 4000
      });
      return;
    }

    const limit = nivelServico === 'classico' ? 5 : 10;
    if (pratosSelecionados.length > limit) {
      toast({
        title: "Limite excedido",
        description: `Você selecionou ${pratosSelecionados.length} pratos, mas o limite para o nível ${nivelServico === 'classico' ? 'Clássico' : 'Banquete'} é de ${limit} pratos.`,
        duration: 4000
      });
      return;
    }

    onAvancar({
      nivelServico,
      pratosSelecionados: pratosSelecionados.map((prato) => ({
        ...prato,
        personalizacao: personalizacoes[prato.id] || '',
      })),
    });
  };

  const filtrarPratos = (pratos: DishOption[]) => {
    if (!pesquisaPratos) return pratos;
    return pratos.filter(prato => prato.nome.toLowerCase().includes(pesquisaPratos.toLowerCase()) || prato.descricao.toLowerCase().includes(pesquisaPratos.toLowerCase()));
  };

  const renderCategoria = (categoriaId: string, pratos: DishOption[], titulo: string) => {
    const categoriaSelecionados = pratosSelecionados.filter((p) => matchesCategory(p.categorias, categoriaId));
    const pratosFiltrados = filtrarPratos(pratos);

    // Adicionar pratos do catálogo que foram escolhidos mas não estão na lista padrão
    const pratosAdicionais = categoriaSelecionados.filter((ps) =>
      !pratos.find(p => p.id === ps.id)
    );
    const todosPratos = [...pratosFiltrados, ...pratosAdicionais];

    return <div className="space-y-4" key={categoriaId}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-light">{titulo}</h3>
        <Badge variant="outline">
          {categoriaSelecionados.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {todosPratos.map(prato => {
          const selecionado = pratosSelecionados.some((p) => p.id === prato.id);
          const temPersonalizacao = personalizacoes[prato.id];
          return <Card key={prato.id} className={`cursor-pointer transition-colors ${selecionado ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`} onClick={() => togglePrato(prato)}>
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
                    <h4 className="font-light">{prato.nome}</h4>
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
                        <DialogTitle className="text-xl font-light">{prato.nome}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <img src={prato.foto} alt={prato.nome} className="w-full h-64 object-cover rounded-lg" />
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-light text-sm">Descrição</h4>
                            <p className="text-sm">{prato.descricao}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-light">Categoria</h4>
                              <p className="capitalize">{titulo}</p>
                            </div>
                          </div>

                          {(prato.favorito || prato.frequente) && <div>
                            <h4 className="font-light text-sm">Características</h4>
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
                            <h4 className="font-light text-sm">Informações adicionais</h4>
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
          onClick={() => setDialogAdicionar(categoriaId)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar {titulo === 'Pratos Principais' ? 'Prato Principal' : (titulo === 'Prato' ? 'Prato' : titulo.replace(/s$/, ''))}
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
              <h3 className="text-base font-light">Nível de Serviço</h3>
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
                      <h4 className="font-light">Clássico</h4>
                      <p className="text-sm text-muted-foreground">
                        Os convidados serão bem servidos em quantidades de comida e opções comuns em eventos.
                        Ninguém vai ficar com fome. (Até 5 pratos no total)
                      </p>
                    </div>
                    <div>
                      <h4 className="font-light">Banquete</h4>
                      <p className="text-sm text-muted-foreground">
                        Um número maior de opções no buffet com mais variedade de pratos.
                        (Até 10 pratos no total)
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
                        <p className="text-sm text-muted-foreground">Até 5 pratos</p>
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
                        <p className="text-sm text-muted-foreground">Até 10 pratos</p>
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
            {categorias.map((cat) => {
              const pratosDaCategoria = catalogDishes.filter((p) => matchesCategory(p.categorias, cat.id));
              return renderCategoria(cat.id, pratosDaCategoria, cat.label);
            })}
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
            {categorias.map((cat) => {
              const pratosDaCategoria = pratosSelecionados.filter((p) => matchesCategory(p.categorias, cat.id));
              return (
                <div key={cat.id}>
                  <h4 className="font-light capitalize mb-2">{cat.label}</h4>
                  <div className="space-y-1 mb-4">
                    {pratosDaCategoria.map((prato) => (
                      <div key={prato.id} className="flex justify-between text-sm">
                        <span>{prato.nome}</span>
                        <span>R$ {prato.preco.toFixed(2)}</span>
                      </div>
                    ))}
                    {pratosDaCategoria.length === 0 && (
                      <div className="text-muted-foreground text-sm">Aguardando seleção</div>
                    )}
                  </div>
                </div>
              );
            })}

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
              <div className="flex justify-between text-sm font-light border-t pt-2 mt-2">
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
            Adicionar {dialogAdicionar ? (
              categorias.find(c => c.id === dialogAdicionar)?.label?.replace(/s$/, '') || 'Prato'
            ) : 'Prato'}
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
                dialogAdicionar ? (
                  matchesCategory(prato.categorias, dialogAdicionar) &&
                  (pesquisaCatalogo === '' ||
                    prato.nome.toLowerCase().includes(pesquisaCatalogo.toLowerCase()) ||
                    prato.descricao.toLowerCase().includes(pesquisaCatalogo.toLowerCase()))
                ) : false
              )
              .map(prato => {
                const jaEscolhido = pratosSelecionados.some((p) => p.id === prato.id);

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
                          <h4 className="font-light mb-1">{prato.nome}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{prato.descricao}</p>
                          <p className="text-sm font-light text-primary">R$ {prato.preco.toFixed(2)}</p>
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
                              togglePrato(prato);
                              if (!jaEscolhido) {
                                const limit = nivelServico === 'classico' ? 5 : 10;
                                if (pratosSelecionados.length < limit) {
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
              <DialogTitle className="text-xl font-light">{pratoDetalhesDialog.nome}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={pratoDetalhesDialog.foto}
                alt={pratoDetalhesDialog.nome}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="space-y-3">
                <div>
                  <h4 className="font-light text-sm">Descrição</h4>
                  <p className="text-sm">{pratoDetalhesDialog.descricao}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-light">Preço</h4>
                    <p>R$ {pratoDetalhesDialog.preco.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-light text-sm">Informações adicionais</h4>
                  <p className="text-sm text-muted-foreground">
                    Este prato faz parte do nosso catálogo completo.
                    Preparado com ingredientes frescos e técnicas culinárias refinadas.
                  </p>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  const jaEscolhido = pratosSelecionados.some((p) => p.id === pratoDetalhesDialog.id);

                  if (!jaEscolhido) {
                    togglePrato(pratoDetalhesDialog);
                    const limit = nivelServico === 'classico' ? 5 : 10;
                    if (pratosSelecionados.length < limit) {
                      setPratoDetalhesDialog(null);
                      setDialogAdicionar(null);
                      setPesquisaCatalogo('');
                    }
                  }
                }}
                disabled={pratosSelecionados.some((p) => p.id === pratoDetalhesDialog.id)}
              >
                {pratosSelecionados.some((p) => p.id === pratoDetalhesDialog.id)
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
