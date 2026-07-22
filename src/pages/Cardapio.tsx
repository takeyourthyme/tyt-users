import { useState, useEffect } from "react";
import { Search, Filter, Heart, Eye, ChefHat, Utensils, Beef, Fish, Leaf, Soup, Salad, Wheat, Zap, ChevronDown, ChevronUp, Tag, Star, Globe, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import Footer from "@/components/Footer";
import { loadSession } from "@/services/authService";
import { listDishes, listHighlightedDishes, normalizeDish, type Dish } from "@/services/dishService";

// Import das imagens geradas
import yakisobaFrango from "@/assets/yakisoba-frango.jpg";
import tacosCarnitas from "@/assets/tacos-carnitas.jpg";
import moussakaGrega from "@/assets/moussaka-grega.jpg";
import schnitzelVienense from "@/assets/schnitzel-vienense.jpg";
import hummusVegetais from "@/assets/hummus-vegetais.jpg";
import lagostaThermidor from "@/assets/lagosta-thermidor.jpg";

interface Prato {
  id: string;
  nome: string;
  foto: string;
  resumo: string;
  descricao: string;
  fotos: string[];
  categoria: string;
  preferencias: string[];
  ingredientes: string[];
  tiposCozinha: string[];
  favorito: boolean;
}

const FAVORITES_STORAGE_KEY = "cardapio-favorites";

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

export default function Cardapio() {
  const navigate = useNavigate();
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [pratosFiltrados, setPratosFiltrados] = useState<Prato[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
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

  useEffect(() => {
    const rawFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsedFavorites = (() => {
      if (!rawFavorites) return [];
      try {
        const parsed = JSON.parse(rawFavorites) as unknown;
        return Array.isArray(parsed) ? (parsed.filter((id) => typeof id === "string") as string[]) : [];
      } catch {
        return [];
      }
    })();
    setFavoriteIds(parsedFavorites);

    const session = loadSession();
    const token = session?.token;

    const mapDishToPrato = (dish: Dish): Prato => {
      const normalized = normalizeDish(dish);
      const categoria = normalized.categories[0]?.toLowerCase() || "outros";
      const foto = normalized.photoUrl || "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop";
      return {
        id: normalized.id,
        nome: normalized.name,
        foto,
        resumo: normalized.description,
        descricao: normalized.description,
        fotos: normalized.photoUrls.length > 0 ? normalized.photoUrls : [foto],
        categoria,
        preferencias: normalized.culinaryPreferences.map((p) => p.toLowerCase()),
        ingredientes: normalized.mainIngredients.map((i) => i.toLowerCase()),
        tiposCozinha: normalized.cuisineTypes.map((t) => t.toLowerCase()),
        favorito: parsedFavorites.includes(normalized.id),
      };
    };

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

    const load = async () => {
      setIsLoading(true);
      try {
        const response = token ? await listDishes({ token }) : await listHighlightedDishes();
        const list = extractList(response);
        if (list.length === 0) throw new Error("empty");

        const pratosCarregados = list.map(mapDishToPrato).filter((p) => p.id);
        setPratos(pratosCarregados);
        setPratosFiltrados(pratosCarregados);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    let resultado = pratos;

    // Filtro por pesquisa
    if (pesquisa) {
      resultado = resultado.filter(prato =>
        prato.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
        prato.resumo.toLowerCase().includes(pesquisa.toLowerCase())
      );
    }

    // Filtros avançados
    if (filtros.categorias.length > 0) {
      resultado = resultado.filter(prato => filtros.categorias.includes(prato.categoria));
    }

    if (filtros.preferencias.length > 0) {
      resultado = resultado.filter(prato =>
        filtros.preferencias.some(pref => prato.preferencias.includes(pref))
      );
    }

    if (filtros.ingredientes.length > 0) {
      resultado = resultado.filter(prato =>
        filtros.ingredientes.some(ing => prato.ingredientes.includes(ing))
      );
    }

    if (filtros.tiposCozinha.length > 0) {
      resultado = resultado.filter(prato =>
        filtros.tiposCozinha.some(tipo => prato.tiposCozinha.includes(tipo))
      );
    }

    if (filtros.apenasavoritos) {
      resultado = resultado.filter(prato => prato.favorito);
    }

    setPratosFiltrados(resultado);
  }, [pratos, pesquisa, filtros]);

  const toggleFavorito = (pratoId: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(pratoId) ? prev.filter((id) => id !== pratoId) : [...prev, pratoId];
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      setPratos((current) => current.map((prato) => (prato.id === pratoId ? { ...prato, favorito: !prato.favorito } : prato)));
      return next;
    });
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

  const limparFiltros = () => {
    setFiltros({
      categorias: [],
      preferencias: [],
      ingredientes: [],
      tiposCozinha: [],
      apenasavoritos: false
    });
  };

  const toggleFiltroAberto = (tipo: keyof typeof filtrosAbertos) => {
    setFiltrosAbertos(prev => ({ ...prev, [tipo]: !prev[tipo] }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pt-20">
      <AppHeader />
      <div className="flex-1 container mx-auto px-4 py-6">
        {/* Título da página */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-light">Pratos</h1>
        </div>

        {/* Pesquisa e Filtros */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Pesquisar pratos..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                className="pl-10"
              />
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
                <div className="flex justify-between items-center">
                  <h3 className="font-light">Filtros Avançados</h3>
                  <Button variant="ghost" size="sm" onClick={limparFiltros}>
                    Limpar Filtros
                  </Button>
                </div>

                {/* Apenas Favoritos - Primeiro */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/30 border">
                  <Heart className="h-4 w-4 text-red-500" />
                  <input
                    type="checkbox"
                    id="favoritos"
                    checked={filtros.apenasavoritos}
                    onChange={() => toggleFiltro('apenasavoritos', '')}
                    className="rounded"
                  />
                  <label htmlFor="favoritos" className="text-sm font-medium cursor-pointer">
                    Apenas favoritos
                  </label>
                </div>

                <div className="space-y-3">
                  {/* Categorias */}
                  <Collapsible open={filtrosAbertos.categorias} onOpenChange={() => toggleFiltroAberto('categorias')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-3 h-auto rounded-lg bg-muted/50 hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <span className="font-medium">Categorias</span>
                        </div>
                        {filtrosAbertos.categorias ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pt-2">
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIAS.map(categoria => {
                          const CategoryIcon = CATEGORIAS_ICONES[categoria as keyof typeof CATEGORIAS_ICONES]?.icon;
                          const categoryColor = CATEGORIAS_ICONES[categoria as keyof typeof CATEGORIAS_ICONES]?.color;
                          return (
                            <Badge
                              key={categoria}
                              variant={filtros.categorias.includes(categoria) ? "default" : "outline"}
                              className={`cursor-pointer gap-1 font-normal ${!filtros.categorias.includes(categoria) ? categoryColor : ''}`}
                              onClick={() => toggleFiltro('categorias', categoria)}
                            >
                              {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                              {categoria}
                            </Badge>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Preferências */}
                  <Collapsible open={filtrosAbertos.preferencias} onOpenChange={() => toggleFiltroAberto('preferencias')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-3 h-auto rounded-lg bg-muted/50 hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-primary" />
                          <span className="font-medium">Preferências</span>
                        </div>
                        {filtrosAbertos.preferencias ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pt-2">
                      <div className="flex flex-wrap gap-2">
                        {PREFERENCIAS.map(pref => (
                          <Badge
                            key={pref}
                            variant={filtros.preferencias.includes(pref) ? "default" : "outline"}
                            className="cursor-pointer font-normal"
                            onClick={() => toggleFiltro('preferencias', pref)}
                          >
                            {pref}
                          </Badge>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Ingredientes */}
                  <Collapsible open={filtrosAbertos.ingredientes} onOpenChange={() => toggleFiltroAberto('ingredientes')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-3 h-auto rounded-lg bg-muted/50 hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <Utensils className="h-4 w-4 text-primary" />
                          <span className="font-medium">Ingredientes</span>
                        </div>
                        {filtrosAbertos.ingredientes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pt-2">
                      <div className="flex flex-wrap gap-2">
                        {INGREDIENTES.map(ing => (
                          <Badge
                            key={ing}
                            variant={filtros.ingredientes.includes(ing) ? "default" : "outline"}
                            className="cursor-pointer font-normal"
                            onClick={() => toggleFiltro('ingredientes', ing)}
                          >
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Tipos de Cozinha */}
                  <Collapsible open={filtrosAbertos.tiposCozinha} onOpenChange={() => toggleFiltroAberto('tiposCozinha')}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-3 h-auto rounded-lg bg-muted/50 hover:bg-muted">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-primary" />
                          <span className="font-medium">Tipos de cozinha</span>
                        </div>
                        {filtrosAbertos.tiposCozinha ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pt-2">
                      <div className="flex flex-wrap gap-2">
                        {TIPOS_COZINHA.map(tipo => (
                          <Badge
                            key={tipo}
                            variant={filtros.tiposCozinha.includes(tipo) ? "default" : "outline"}
                            className="cursor-pointer font-normal"
                            onClick={() => toggleFiltro('tiposCozinha', tipo)}
                          >
                            {tipo}
                          </Badge>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Grid de Pratos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 9 }).map((_, index) => (
              <Card key={index} className="overflow-hidden h-full flex flex-col">
                <div className="p-4 space-y-4 flex flex-col flex-1 justify-between">
                  <div className="space-y-4">
                    <Skeleton className="w-full h-48" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </Card>
            ))
            : pratosFiltrados.map(prato => (
              <Card
                key={prato.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col"
                onClick={() => navigate(`/prato/${prato.id}`)}
              >
                <div className="p-4 flex flex-col flex-1">
                  <img
                    src={prato.foto}
                    alt={prato.nome}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <div className="space-y-2 flex flex-col flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-light text-lg">{prato.nome}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorito(prato.id);
                        }}
                      >
                        <Heart
                          className={`h-4 w-4 ${prato.favorito ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                        />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground flex-1">{prato.resumo}</p>
                    <div className="flex items-center justify-between pt-2">
                      {(() => {
                        const categoryEntry = CATEGORIAS_ICONES[prato.categoria as keyof typeof CATEGORIAS_ICONES];
                        const CategoryIcon = categoryEntry?.icon ?? Tag;
                        const categoryColor = categoryEntry?.color ?? "bg-muted text-foreground border-border";
                        const extraBadges = [
                          prato.tiposCozinha?.[0],
                          prato.preferencias?.[0],
                        ].filter(Boolean) as string[];
                        return (
                          <div className="flex flex-wrap gap-2 items-center">
                            <Badge variant="secondary" className={`text-xs gap-1 font-normal ${categoryColor}`}>
                              <CategoryIcon className="h-3 w-3" />
                              {prato.categoria}
                            </Badge>
                            {extraBadges.map((label) => (
                              <Badge key={label} variant="outline" className="text-xs font-normal">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        );
                      })()}
                      <Button
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/prato/${prato.id}`);
                        }}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>

        {!isLoading && pratosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum prato encontrado com os filtros selecionados.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
