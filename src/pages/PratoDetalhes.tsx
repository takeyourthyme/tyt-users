import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, ChevronLeft, ChevronRight, ZoomIn, FileText, Tag, Utensils, Globe, ChefHat, Fish, Beef, Leaf, Soup, Salad, Wheat, Zap, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AppHeader } from "@/components/AppHeader";

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

export default function PratoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prato, setPrato] = useState<Prato | null>(null);
  const [fotoAtual, setFotoAtual] = useState(0);

  useEffect(() => {
    const dadosCarregados = JSON.parse(localStorage.getItem('cardapio-pratos') || '[]');
    const pratoEncontrado = dadosCarregados.find((p: Prato) => p.id === id);
    if (pratoEncontrado) {
      setPrato(pratoEncontrado);
    }
  }, [id]);

  const toggleFavorito = () => {
    if (!prato) return;
    
    const dadosCarregados = JSON.parse(localStorage.getItem('cardapio-pratos') || '[]');
    const pratosAtualizados = dadosCarregados.map((p: Prato) => 
      p.id === prato.id ? { ...p, favorito: !p.favorito } : p
    );
    
    localStorage.setItem('cardapio-pratos', JSON.stringify(pratosAtualizados));
    setPrato({ ...prato, favorito: !prato.favorito });
  };

  const proximaFoto = () => {
    if (!prato) return;
    setFotoAtual((prev) => (prev + 1) % prato.fotos.length);
  };

  const fotoAnterior = () => {
    if (!prato) return;
    setFotoAtual((prev) => (prev - 1 + prato.fotos.length) % prato.fotos.length);
  };

  if (!prato) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p>Prato não encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <AppHeader />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Título da página */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{prato.nome}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorito}
            className="hover:bg-muted"
          >
            <Heart 
              className={`h-6 w-6 ${prato.favorito ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-500'}`} 
            />
          </Button>
        </div>

          {/* Galeria de Fotos */}
          <div className="relative mb-6">
            <Dialog>
              <DialogTrigger asChild>
                <div className="relative h-80 md:h-96 rounded-lg overflow-hidden cursor-pointer group">
                  <img 
                    src={prato.fotos[fotoAtual]} 
                    alt={prato.nome}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  {prato.fotos.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          fotoAnterior();
                        }}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          proximaFoto();
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh]">
                <div className="relative">
                  <img 
                    src={prato.fotos[fotoAtual]} 
                    alt={prato.nome}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                  {prato.fotos.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={fotoAnterior}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={proximaFoto}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          
            
            {/* Indicadores de foto */}
            {prato.fotos.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {prato.fotos.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === fotoAtual ? 'bg-primary' : 'bg-muted'
                    }`}
                    onClick={() => setFotoAtual(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Informações do Prato */}
          <div className="space-y-6">
            {/* Descrição */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Conheça o prato
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{prato.descricao}</p>
              </CardContent>
            </Card>

            {/* Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const CategoryIcon = CATEGORIAS_ICONES[prato.categoria as keyof typeof CATEGORIAS_ICONES]?.icon;
                  const categoryColor = CATEGORIAS_ICONES[prato.categoria as keyof typeof CATEGORIAS_ICONES]?.color;
                  return (
                    <Badge variant="default" className={`text-sm gap-1 ${categoryColor}`}>
                      {CategoryIcon && <CategoryIcon className="h-4 w-4" />}
                      {prato.categoria}
                    </Badge>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Características (Preferências) */}
            {prato.preferencias.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Características
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {prato.preferencias.map(pref => (
                      <Badge key={pref} variant="secondary">
                        {pref}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ingredientes Principais */}
            {prato.ingredientes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    Ingredientes Principais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {prato.ingredientes.map(ing => (
                      <Badge key={ing} variant="outline">
                        {ing}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tipos de Cozinha */}
            {prato.tiposCozinha.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Tipos de Cozinha
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {prato.tiposCozinha.map(tipo => (
                      <Badge key={tipo} variant="default">
                        {tipo}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
}