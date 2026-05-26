import React, { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarIcon, Info, Minus, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DadosContratacao } from "@/pages/Contratacao";
import { cn } from "@/lib/utils";
import { loadSession } from "@/services/authService";
import { listCulinaryPreferences, listCuisineTypes, listThemes, type LookupOption } from "@/services/lookupService";
import { Skeleton } from "@/components/ui/skeleton";

// Import das imagens dos temas
import temaNoiteItaliana from "@/assets/tema-noite-italiana.jpg";
import temaChurrasco from "@/assets/tema-churrasco.jpg";
import temaPub from "@/assets/tema-pub.jpg";
import temaJantarMeninas from "@/assets/tema-jantar-meninas.jpg";
import temaJantarMeninos from "@/assets/tema-jantar-meninos.jpg";
import temaClassicosBrasileiros from "@/assets/tema-classicos-brasileiros.jpg";
import temaMediterraneo from "@/assets/tema-mediterraneo.jpg";
import temaJudaico from "@/assets/tema-judaico.jpg";
import temaCountryClub from "@/assets/tema-country-club.jpg";
import temaMarroquino from "@/assets/tema-marroquino.jpg";
import temaEspanhol from "@/assets/tema-espanhol.jpg";
import temaFestaItaliana from "@/assets/tema-festa-italiana.jpg";
import temaNoiteMassas from "@/assets/tema-noite-massas.jpg";
import temaPetiscos from "@/assets/tema-petiscos.jpg";
import temaAcaoGracas from "@/assets/tema-acao-gracas.jpg";
import temaNatal from "@/assets/tema-natal.jpg";
import temaOktoberfest from "@/assets/tema-oktoberfest.jpg";
import temaRomantico from "@/assets/tema-romantico.jpg";
interface Props {
  dados: DadosContratacao;
  onAvancar: (dados: Partial<DadosContratacao>) => void;
  onVoltar: () => void;
}
type ThemeCard = {
  id: string;
  nome: string;
  descricao: string;
  foto: string;
};

const fallbackPreferences = ['Vegetariano', 'Vegano', 'Sem Glúten', 'Sem Lactose', 'Low Carb', 'Proteína'];
const fallbackCuisineTypes = ['Brasileira', 'Italiana', 'Asiática', 'Mediterrânea', 'Francesa', 'Japonesa'];
const fallbackThemes: ThemeCard[] = [{
  id: 'noite-italiana',
  nome: 'Noite Italiana',
  descricao: 'Sabores autênticos da Itália com massas artesanais e vinhos selecionados',
  foto: temaNoiteItaliana
}, {
  id: 'classicos-churrascaria',
  nome: 'Clássicos da Churrascaria',
  descricao: 'Carnes nobres grelhadas na perfeição com acompanhamentos tradicionais',
  foto: temaChurrasco
}, {
  id: 'comida-pub',
  nome: 'Comida de Pub',
  descricao: 'Petiscos e pratos descontraídos para momentos informais entre amigos',
  foto: temaPub
}, {
  id: 'jantar-meninas',
  nome: 'Jantar das Meninas',
  descricao: 'Menu elegante e delicado para momentos especiais entre amigas',
  foto: temaJantarMeninas
}, {
  id: 'jantar-meninos',
  nome: 'Jantar dos Meninos',
  descricao: 'Pratos fartos e saborosos para encontros animados e descontraídos',
  foto: temaJantarMeninos
}, {
  id: 'classicos-brasileiros',
  nome: 'Clássicos Brasileiros',
  descricao: 'O melhor da culinária nacional com toque gourmet e ingredientes premium',
  foto: temaClassicosBrasileiros
}, {
  id: 'mediterraneos',
  nome: 'Clássicos Mediterrâneos',
  descricao: 'Sabores frescos e saudáveis do mar Mediterrâneo com azeites especiais',
  foto: temaMediterraneo
}, {
  id: 'judaicos',
  nome: 'Clássicos Judaicos',
  descricao: 'Tradições culinárias judaicas com ingredientes premium e preparo ritual',
  foto: temaJudaico
}, {
  id: 'almoco-country',
  nome: 'Almoço de Country Club',
  descricao: 'Sofisticação e elegância em cada prato para eventos refinados',
  foto: temaCountryClub
}, {
  id: 'noite-marroquina',
  nome: 'Noite Marroquina',
  descricao: 'Especiarias exóticas e sabores autênticos do norte da África',
  foto: temaMarroquino
}, {
  id: 'festa-espanhola',
  nome: 'Festa Espanhola',
  descricao: 'Tapas variadas e paellas tradicionais para uma experiência ibérica',
  foto: temaEspanhol
}, {
  id: 'festa-italiana',
  nome: 'Festa Italiana',
  descricao: 'Celebração italiana com pratos tradicionais da nonna e muito sabor',
  foto: temaFestaItaliana
}, {
  id: 'noite-massas',
  nome: 'Noite de Massas',
  descricao: 'Variedade de massas artesanais com molhos especiais e queijos nobres',
  foto: temaNoiteMassas
}, {
  id: 'petiscos-especiais',
  nome: 'Petiscos Especiais',
  descricao: 'Entradas gourmet elaboradas para compartilhar e socializar com estilo',
  foto: temaPetiscos
}, {
  id: 'acao-gracas',
  nome: 'Ação de Graças',
  descricao: 'Menu tradicional americano para momentos de gratidão e celebração',
  foto: temaAcaoGracas
}, {
  id: 'noite-natal',
  nome: 'Noite de Natal',
  descricao: 'Ceia natalina completa com pratos tradicionais e sabores especiais',
  foto: temaNatal
}, {
  id: 'oktoberfest',
  nome: 'Oktoberfest',
  descricao: 'Sabores alemães autênticos com cervejas artesanais e pratos típicos',
  foto: temaOktoberfest
}, {
  id: 'jantar-romantico',
  nome: 'Jantar Romântico',
  descricao: 'Menu íntimo e sofisticado para momentos especiais a dois',
  foto: temaRomantico
}];
export const ConfiguracaoEventos: React.FC<Props> = ({
  dados,
  onAvancar,
  onVoltar
}) => {
  const [quantidadePessoas, setQuantidadePessoas] = useState(dados.quantidadePessoas || 1);
  const [dataEvento, setDataEvento] = useState<Date>(dados.dataEvento || new Date());
  const [horarioInicio, setHorarioInicio] = useState(dados.horarioInicio || '');
  const [horarioFim, setHorarioFim] = useState(dados.horarioFim || '');
  const [preferenciaseSelecionadas, setPreferenciasSelecionadas] = useState<string[]>(dados.preferencias || []);
  const [tiposCozinhaSelecionados, setTiposCozinhaSelecionados] = useState<string[]>(dados.tiposCozinha || []);
  const [pesquisaTema, setPesquisaTema] = useState('');
  const [temaSelecionado, setTemaSelecionado] = useState(dados.temaSelecionado || '');
  const [availablePreferences, setAvailablePreferences] = useState<LookupOption[]>([]);
  const [availableCuisineTypes, setAvailableCuisineTypes] = useState<LookupOption[]>([]);
  const [availableThemes, setAvailableThemes] = useState<ThemeCard[]>([]);
  const [isLoadingLookups, setIsLoadingLookups] = useState(true);
  const [errors, setErrors] = useState<{
    [key: string]: boolean;
  }>({});
  const avancarButtonsRef = useRef<HTMLDivElement>(null);

  const themePhotoByName = useMemo(() => {
    const normalize = (value: string) =>
      value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();

    const map = new Map<string, string>();
    fallbackThemes.forEach((t) => {
      map.set(normalize(t.nome), t.foto);
      map.set(normalize(t.id), t.foto);
    });
    return { normalize, map };
  }, []);

  useEffect(() => {
    const session = loadSession();
    const token = session?.token;

    const load = async () => {
      setIsLoadingLookups(true);
      try {
        const [prefs, cuisines, themes] = await Promise.all([
          listCulinaryPreferences({ token }),
          listCuisineTypes({ token }),
          listThemes({ token }),
        ]);

        setAvailablePreferences(prefs.length > 0 ? prefs : fallbackPreferences.map((label) => ({ id: label, label })));
        setAvailableCuisineTypes(cuisines.length > 0 ? cuisines : fallbackCuisineTypes.map((label) => ({ id: label, label })));

        if (themes.length > 0) {
          const placeholder = "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&h=800&fit=crop";
          const mappedThemes: ThemeCard[] = themes.map((t) => {
            const key = themePhotoByName.normalize(t.label);
            const photo = themePhotoByName.map.get(key) ?? placeholder;
            return {
              id: t.id,
              nome: t.label,
              descricao: t.label,
              foto: photo,
            };
          });
          setAvailableThemes(mappedThemes);
        } else {
          setAvailableThemes(fallbackThemes);
        }
      } catch {
        setAvailablePreferences(fallbackPreferences.map((label) => ({ id: label, label })));
        setAvailableCuisineTypes(fallbackCuisineTypes.map((label) => ({ id: label, label })));
        setAvailableThemes(fallbackThemes);
      } finally {
        setIsLoadingLookups(false);
      }
    };

    void load();
  }, [themePhotoByName]);
  const filtrarTemas = () => {
    let temas = availableThemes;

    // Filtro por pesquisa
    if (pesquisaTema) {
      temas = temas.filter(tema => tema.nome.toLowerCase().includes(pesquisaTema.toLowerCase()) || tema.descricao.toLowerCase().includes(pesquisaTema.toLowerCase()));
    }

    return temas;
  };
  const toggleItem = (item: string, selectedItems: string[], setSelectedItems: (items: string[]) => void) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };
  const validarCampos = () => {
    const novosErrors: {
      [key: string]: boolean;
    } = {};
    if (!dataEvento) novosErrors.dataEvento = true;
    if (!horarioInicio) novosErrors.horarioInicio = true;
    if (!horarioFim) novosErrors.horarioFim = true;
    if (!temaSelecionado) novosErrors.temaSelecionado = true;
    setErrors(novosErrors);
    return Object.keys(novosErrors).length === 0;
  };
  const handleAvancar = () => {
    if (validarCampos()) {
      onAvancar({
        quantidadePessoas,
        dataEvento,
        horarioInicio,
        horarioFim,
        preferencias: preferenciaseSelecionadas,
        tiposCozinha: tiposCozinhaSelecionados,
        temaSelecionado
      });
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
        {/* Quantidade de Pessoas */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Quantidade de pessoas</Label>
          <p className="text-sm text-gray-500">Nos ajude a dimensionar as porções ideais para seu evento</p>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setQuantidadePessoas(Math.max(1, quantidadePessoas - 1))} className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50">
              <Minus size={14} />
            </Button>
            <Input type="number" value={quantidadePessoas} onChange={e => setQuantidadePessoas(parseInt(e.target.value) || 1)} className="w-16 text-center h-8 border-gray-300" min="1" />
            <Button variant="ghost" size="sm" onClick={() => setQuantidadePessoas(quantidadePessoas + 1)} className="h-8 w-8 p-0 border border-gray-300 hover:bg-gray-50">
              <Plus size={14} />
            </Button>
          </div>
        </div>

        {/* Data do Evento e Horários */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Data do evento</Label>
            <p className="text-sm text-gray-500">Quando será seu evento especial?</p>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className={cn("w-full justify-start text-left font-normal border rounded-md px-3 py-2 text-sm ring-offset-background", "file:border-0 file:bg-transparent file:text-sm file:font-medium", "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", "disabled:cursor-not-allowed disabled:opacity-50", errors.dataEvento ? "border-red-500" : "border-input", !dataEvento && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dataEvento ? format(dataEvento, "PPP", {
                    locale: ptBR
                  }) : <span>Selecione a data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dataEvento} onSelect={date => date && setDataEvento(date)} disabled={date => date < new Date()} initialFocus className="pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-base font-semibold">Horário de início</Label>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5">
                    <Info size={14} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Informações sobre Horário</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-gray-600">
                    Insira aqui a hora que você deseja que a comida seja servida/consumida
                    e a hora que você quer que o serviço seja interrompido/concluído.
                  </p>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm text-gray-500">Em que e a comida deve ser servida.</p>
            <Input type="time" value={horarioInicio} onChange={e => setHorarioInicio(e.target.value)} className={cn("border-input bg-background", errors.horarioInicio && "border-red-500")} />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Horário de fim</Label>
            <p className="text-sm text-gray-500">Até que horas servir?</p>
            <Input type="time" value={horarioFim} onChange={e => setHorarioFim(e.target.value)} className={cn("border-input bg-background", errors.horarioFim && "border-red-500")} />
          </div>
        </div>

        {/* Preferências Culinárias */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Preferências Culinárias</Label>
          <p className="text-sm text-gray-500">Tem alguma preferência alimentar que devemos saber?</p>
          <div className="flex flex-wrap gap-2">
            {isLoadingLookups
              ? Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-6 w-24" />)
              : availablePreferences.map((item) => {
                const isSelected = preferenciaseSelecionadas.includes(item.label);
                return (
                  <Badge
                    key={item.id}
                    variant={isSelected ? "default" : "secondary"}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => toggleItem(item.label, preferenciaseSelecionadas, setPreferenciasSelecionadas)}
                  >
                    {item.label}
                  </Badge>
                );
              })}
          </div>
        </div>

        {/* Tipos de Cozinha */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Tipos de Cozinha</Label>
          <p className="text-sm text-gray-500">Quais sabores do mundo vocês mais apreciam?</p>
          <div className="flex flex-wrap gap-2">
            {isLoadingLookups
              ? Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-6 w-24" />)
              : availableCuisineTypes.map((item) => {
                const isSelected = tiposCozinhaSelecionados.includes(item.label);
                return (
                  <Badge
                    key={item.id}
                    variant={isSelected ? "default" : "secondary"}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => toggleItem(item.label, tiposCozinhaSelecionados, setTiposCozinhaSelecionados)}
                  >
                    {item.label}
                  </Badge>
                );
              })}
          </div>
        </div>

        {/* Escolha um Tema */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">Escolha um tema</Label>
            <p className="text-sm text-gray-500 mt-1">Qual atmosfera combina mais com seu evento?</p>
          </div>

          {/* Campo de pesquisa de temas */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Pesquisar temas..." value={pesquisaTema} onChange={e => setPesquisaTema(e.target.value)} className="pl-10" />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {isLoadingLookups
              ? Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="border-gray-200">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="w-full h-48" />
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))
              : filtrarTemas().map(tema => <Card key={tema.id} className={cn("transition-all duration-200 hover:shadow-lg flex flex-col h-full", temaSelecionado === tema.id ? 'border-primary shadow-md' : 'border-gray-200 hover:border-gray-300', errors.temaSelecionado && !temaSelecionado ? 'border-red-500' : '')}>
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="space-y-4 flex-1 flex flex-col">
                    <img src={tema.foto} alt={tema.nome} className="w-full h-48 object-cover rounded-lg bg-gray-100" />
                    <div className="flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg leading-tight min-h-[3.5rem] flex items-center">{tema.nome}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed min-h-[4rem] line-clamp-3">{tema.descricao}</p>
                      </div>
                      <Button
                        onClick={() => {
                          setTemaSelecionado(tema.id);
                          setTimeout(() => {
                            avancarButtonsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                          }, 100);
                        }}
                        variant={temaSelecionado === tema.id ? "default" : "outline"}
                        className="w-full mt-auto"
                        size="sm"
                      >
                        {temaSelecionado === tema.id ? "Selecionado" : "Selecionar"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
          {errors.temaSelecionado && <p className="text-red-500 text-sm">Por favor, selecione um tema para continuar</p>}
        </div>
      </CardContent>
    </Card>

    {/* Botões */}
    <div ref={avancarButtonsRef} className="flex justify-between">
      <Button variant="outline" onClick={onVoltar}>
        Voltar
      </Button>
      <Button onClick={handleAvancar}>
        Avançar
      </Button>
    </div>
  </div>;
};
