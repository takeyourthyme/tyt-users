import { useState, useEffect } from "react";
import { Search, Filter, Heart, Eye, ChefHat, Utensils, Beef, Fish, Leaf, Soup, Salad, Wheat, Zap, ChevronDown, ChevronUp, Tag, Star, Globe, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";

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

const DADOS_MOCKADOS: Prato[] = [
  {
    id: "1",
    nome: "Salmão Grelhado Mediterrâneo",
    foto: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
    resumo: "Salmão fresco, azeite de oliva, limão siciliano",
    descricao: "Delicioso salmão grelhado com temperos mediterrâneos, servido com legumes sazonais e molho de ervas finas.",
    fotos: [
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=400&fit=crop"
    ],
    categoria: "peixes",
    preferencias: ["sem fritura", "rica em proteínas", "mediterrânea"],
    ingredientes: ["frutos do mar"],
    tiposCozinha: ["mediterrânea"],
    favorito: false
  },
  {
    id: "2",
    nome: "Risotto de Cogumelos Porcini",
    foto: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop",
    resumo: "Arroz arbóreo, cogumelos porcini, parmesão",
    descricao: "Cremoso risotto preparado com cogumelos porcini frescos e finalizado com parmesão envelhecido.",
    fotos: [
      "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=600&h=400&fit=crop"
    ],
    categoria: "massas",
    preferencias: ["vegetariano"],
    ingredientes: ["laticínios", "glúten"],
    tiposCozinha: ["italiana"],
    favorito: false
  },
  {
    id: "3",
    nome: "Hambúrguer Vegano de Quinoa",
    foto: "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop",
    resumo: "Quinoa, grão-de-bico, avocado, pão integral",
    descricao: "Hambúrguer artesanal vegano feito com quinoa e grão-de-bico, servido com avocado e molho tahine.",
    fotos: [
      "https://images.unsplash.com/photo-1551782450-17144efb9c50?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1525059696034-4967a729002e?w=600&h=400&fit=crop"
    ],
    categoria: "proteína vegetal",
    preferencias: ["vegano", "orgânica", "rica em proteínas"],
    ingredientes: ["glúten"],
    tiposCozinha: ["contemporânea"],
    favorito: false
  },
  {
    id: "4",
    nome: "Yakisoba de Frango",
    foto: yakisobaFrango,
    resumo: "Macarrão yakisoba, frango, legumes, molho shoyu",
    descricao: "Tradicional yakisoba japonês com frango grelhado, legumes frescos e molho shoyu especial.",
    fotos: [
      yakisobaFrango,
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop"
    ],
    categoria: "carnes brancas",
    preferencias: ["rica em proteínas"],
    ingredientes: ["glúten", "soja"],
    tiposCozinha: ["japonesa", "asiática"],
    favorito: false
  },
  {
    id: "5",
    nome: "Picanha na Brasa",
    foto: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop",
    resumo: "Picanha nobre, sal grosso, farofa, vinagrete",
    descricao: "Suculenta picanha grelhada na brasa, temperada apenas com sal grosso, acompanha farofa e vinagrete.",
    fotos: [
      "https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop"
    ],
    categoria: "carnes vermelhas",
    preferencias: ["rica em proteínas"],
    ingredientes: [],
    tiposCozinha: ["brasileira"],
    favorito: false
  },
  {
    id: "6",
    nome: "Salada Caesar com Camarão",
    foto: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
    resumo: "Alface americana, camarão grelhado, croutons, parmesão",
    descricao: "Clássica salada caesar com camarões grelhados, croutons crocantes e molho caesar tradicional.",
    fotos: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&h=400&fit=crop"
    ],
    categoria: "saladas",
    preferencias: ["light", "rica em proteínas"],
    ingredientes: ["frutos do mar", "laticínios", "glúten", "ovo"],
    tiposCozinha: ["mediterrânea"],
    favorito: false
  },
  {
    id: "7",
    nome: "Paella Valenciana",
    foto: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&h=300&fit=crop",
    resumo: "Arroz bomba, frango, coelho, judión, açafrão",
    descricao: "Autêntica paella valenciana com frango, coelho, judión verde e o melhor açafrão espanhol.",
    fotos: [
      "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600&h=400&fit=crop"
    ],
    categoria: "grãos",
    preferencias: ["rica em proteínas"],
    ingredientes: [],
    tiposCozinha: ["espanhola", "mediterrânea"],
    favorito: false
  },
  {
    id: "8",
    nome: "Sopa de Miso com Tofu",
    foto: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop",
    resumo: "Miso vermelho, tofu sedoso, cebolinha, alga wakame",
    descricao: "Tradicional sopa japonesa de miso com tofu sedoso, alga wakame e cebolinha fresca.",
    fotos: [
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&h=400&fit=crop"
    ],
    categoria: "sopas",
    preferencias: ["vegano", "baixo sal", "light"],
    ingredientes: ["soja"],
    tiposCozinha: ["japonesa", "asiática"],
    favorito: false
  },
  {
    id: "9",
    nome: "Tacos de Carnitas",
    foto: tacosCarnitas,
    resumo: "Porco desfiado, tortilla, cebola roxa, cilantro",
    descricao: "Autênticos tacos mexicanos com carnitas de porco cozida lentamente, cebola roxa e cilantro fresco.",
    fotos: [
      tacosCarnitas,
      "https://images.unsplash.com/photo-1565299585323-38174c813d9d?w=600&h=400&fit=crop"
    ],
    categoria: "comidas rápidas",
    preferencias: ["picante"],
    ingredientes: ["carne de porco", "glúten"],
    tiposCozinha: ["mexicana"],
    favorito: false
  },
  {
    id: "10",
    nome: "Moussaka Grega",
    foto: moussakaGrega,
    resumo: "Berinjela, carne moída, molho bechamel, queijo",
    descricao: "Tradicional moussaka grega com camadas de berinjela, carne temperada e cremoso molho bechamel.",
    fotos: [
      moussakaGrega,
      "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=600&h=400&fit=crop"
    ],
    categoria: "carnes vermelhas",
    preferencias: ["rica em proteínas", "mediterrânea"],
    ingredientes: ["laticínios", "glúten"],
    tiposCozinha: ["grega", "mediterrânea"],
    favorito: false
  },
  {
    id: "11",
    nome: "Linguine alle Vongole",
    foto: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop",
    resumo: "Linguine, vongole, alho, vinho branco, salsa",
    descricao: "Clássico prato italiano com linguine al dente, vongole frescas, alho, vinho branco e salsa.",
    fotos: [
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=600&h=400&fit=crop"
    ],
    categoria: "massas",
    preferencias: ["rica em proteínas"],
    ingredientes: ["frutos do mar", "glúten", "alho"],
    tiposCozinha: ["italiana", "mediterrânea"],
    favorito: false
  },
  {
    id: "12",
    nome: "Falafel com Tahine",
    foto: "https://images.unsplash.com/photo-1621852004158-f3bc188ace2d?w=400&h=300&fit=crop",
    resumo: "Grão-de-bico, tahine, pepino, tomate, pita",
    descricao: "Crocantes bolinhos de falafel servidos com molho tahine cremoso, salada fresca e pão pita.",
    fotos: [
      "https://images.unsplash.com/photo-1621852004158-f3bc188ace2d?w=600&h=400&fit=crop",
      "https://images.unsplash.com/photo-1571197119297-4f39f3b967c4?w=600&h=400&fit=crop"
    ],
    categoria: "proteína vegetal",
    preferencias: ["vegano", "rica em proteínas"],
    ingredientes: ["glúten"],
    tiposCozinha: ["árabe", "mediterrânea"],
    favorito: false
  },
  {
    id: "13",
    nome: "Lagosta Thermidor",
    foto: lagostaThermidor,
    resumo: "Lagosta, molho bechamel, queijo gruyère, conhaque",
    descricao: "Sofisticada lagosta thermidor com molho bechamel cremoso, queijo gruyère e toque de conhaque.",
    fotos: [
      lagostaThermidor,
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&h=400&fit=crop"
    ],
    categoria: "mariscos",
    preferencias: ["rica em proteínas"],
    ingredientes: ["frutos do mar", "laticínios"],
    tiposCozinha: ["francesa", "mediterrânea"],
    favorito: false
  },
  {
    id: "14",
    nome: "Schnitzel Vienense",
    foto: schnitzelVienense,
    resumo: "Escalope de vitela, farinha de rosca, batatas",
    descricao: "Tradicional schnitzel vienense com escalope de vitela empanado, servido com batatas sauté e limão.",
    fotos: [
      schnitzelVienense,
      "https://images.unsplash.com/photo-1594041388841-2d4be31a4b8a?w=600&h=400&fit=crop"
    ],
    categoria: "carnes brancas",
    preferencias: ["rica em proteínas"],
    ingredientes: ["glúten", "ovo"],
    tiposCozinha: ["alemã"],
    favorito: false
  },
  {
    id: "15",
    nome: "Hummus com Vegetais",
    foto: hummusVegetais,
    resumo: "Grão-de-bico, tahine, azeite, vegetais crudité",
    descricao: "Cremoso hummus tradicional servido com vegetais frescos cortados em bastões para acompanhar.",
    fotos: [
      hummusVegetais,
      "https://images.unsplash.com/photo-1571197119297-4f39f3b967c4?w=600&h=400&fit=crop"
    ],
    categoria: "proteína vegetal",
    preferencias: ["vegano", "light", "orgânica"],
    ingredientes: [],
    tiposCozinha: ["árabe", "mediterrânea"],
    favorito: false
  }
];

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
    const dadosExistentes = localStorage.getItem('cardapio-pratos');
    let dadosCarregados: Prato[] = [];

    if (!dadosExistentes) {
      dadosCarregados = DADOS_MOCKADOS;
    } else {
      const existentes = JSON.parse(dadosExistentes);
      // Sincroniza imagens atualizadas do mock (corrige fotos quebradas)
      dadosCarregados = existentes.map((p: Prato) => {
        const atualizado = DADOS_MOCKADOS.find(d => d.id === p.id);
        return atualizado ? { ...p, foto: atualizado.foto, fotos: atualizado.fotos } : p;
      });
    }

    localStorage.setItem('cardapio-pratos', JSON.stringify(dadosCarregados));
    setPratos(dadosCarregados);
    setPratosFiltrados(dadosCarregados);
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
    const pratosAtualizados = pratos.map(prato => 
      prato.id === pratoId ? { ...prato, favorito: !prato.favorito } : prato
    );
    setPratos(pratosAtualizados);
    localStorage.setItem('cardapio-pratos', JSON.stringify(pratosAtualizados));
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
    <div className="min-h-screen bg-background pt-20">
      <AppHeader />
      <div className="container mx-auto px-4 py-6">
        {/* Título da página */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Cardápio</h1>
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
                  <h3 className="font-semibold">Filtros Avançados</h3>
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
          {pratosFiltrados.map(prato => (
            <Card 
              key={prato.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/prato/${prato.id}`)}
            >
              <div className="p-4">
                <img 
                  src={prato.foto} 
                  alt={prato.nome}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg">{prato.nome}</h3>
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
                  <p className="text-sm text-muted-foreground">{prato.resumo}</p>
                  <div className="flex items-center justify-between">
                    {(() => {
                      const CategoryIcon = CATEGORIAS_ICONES[prato.categoria as keyof typeof CATEGORIAS_ICONES]?.icon;
                      const categoryColor = CATEGORIAS_ICONES[prato.categoria as keyof typeof CATEGORIAS_ICONES]?.color;
                      return (
                        <Badge variant="secondary" className={`text-xs gap-1 font-normal ${categoryColor}`}>
                          {CategoryIcon && <CategoryIcon className="h-3 w-3" />}
                          {prato.categoria}
                        </Badge>
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

        {pratosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum prato encontrado com os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}