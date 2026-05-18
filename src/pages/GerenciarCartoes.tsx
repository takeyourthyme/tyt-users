import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, CreditCard, Plus, Trash2, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AppMenu } from "@/components/AppMenu";
import visaIcon from "@/assets/visa-icon.png";
import mastercardIcon from "@/assets/mastercard-icon.png";

interface Cartao {
  id: number;
  numero: string;
  ultimos4: string;
  bandeira: string;
  vencimento: string;
  nomeTitular: string;
  cpf: string;
  isPadrao: boolean;
}

const GerenciarCartoes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Mock data para demonstração
  const [cartoes, setCartoes] = useState<Cartao[]>([
    {
      id: 1,
      numero: "4111111111111111",
      ultimos4: "1111",
      bandeira: "visa",
      vencimento: "12/26",
      nomeTitular: "Maria Santos",
      cpf: "123.456.789-00",
      isPadrao: true
    },
    {
      id: 2,
      numero: "5555555555554444",
      ultimos4: "4444",
      bandeira: "mastercard",
      vencimento: "08/25",
      nomeTitular: "Maria Santos",
      cpf: "123.456.789-00",
      isPadrao: false
    }
  ]);

  // Form state para novo cartão
  const [novoCartao, setNovoCartao] = useState({
    numero: "",
    validade: "",
    cvv: "",
    nome: "",
    cpf: ""
  });

  const getBandeiraIcon = (bandeira: string) => {
    switch (bandeira) {
      case "visa":
        return <img src={visaIcon} alt="Visa" className="w-8 h-5 object-contain" />;
      case "mastercard":
        return <img src={mastercardIcon} alt="Mastercard" className="w-8 h-5 object-contain" />;
      case "amex":
      case "elo":
      default:
        return <img src={visaIcon} alt="Cartão" className="w-8 h-5 object-contain" />;
    }
  };

  const detectarBandeira = (numero: string) => {
    const limpo = numero.replace(/\D/g, "");
    if (limpo.startsWith("4")) return "visa";
    if (limpo.startsWith("5") || limpo.startsWith("2")) return "mastercard";
    if (limpo.startsWith("3")) return "amex";
    if (limpo.startsWith("6")) return "elo";
    return "";
  };

  const formatarNumeroCartao = (numero: string) => {
    const limpo = numero.replace(/\D/g, "");
    const grupos = limpo.match(/.{1,4}/g);
    return grupos ? grupos.join(" ") : limpo;
  };

  const handleNumeroChange = (value: string) => {
    const numeroFormatado = formatarNumeroCartao(value);
    setNovoCartao(prev => ({
      ...prev,
      numero: numeroFormatado
    }));
  };

  const handleSalvarCartao = async () => {
    setLoading(true);
    
    // Simular validação do cartão
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const novoId = Math.max(...cartoes.map(c => c.id), 0) + 1;
    const limpo = novoCartao.numero.replace(/\D/g, "");
    
    const cartaoCompleto: Cartao = {
      id: novoId,
      numero: limpo,
      ultimos4: limpo.slice(-4),
      bandeira: detectarBandeira(limpo),
      vencimento: novoCartao.validade,
      nomeTitular: novoCartao.nome,
      cpf: novoCartao.cpf,
      isPadrao: cartoes.length === 0
    };

    setCartoes(prev => [...prev, cartaoCompleto]);
    setNovoCartao({
      numero: "",
      validade: "",
      cvv: "",
      nome: "",
      cpf: ""
    });
    setLoading(false);
    setDialogAberto(false);
    
    toast({
      title: "Cartão adicionado com sucesso!",
      description: "Seu cartão foi validado e está pronto para uso."
    });
  };

  const handleRemoverCartao = (id: number) => {
    setCartoes(prev => {
      const novosCartoes = prev.filter(c => c.id !== id);
      // Se removeu o padrão e há outros cartões, define o primeiro como padrão
      if (novosCartoes.length > 0 && !novosCartoes.some(c => c.isPadrao)) {
        novosCartoes[0].isPadrao = true;
      }
      return novosCartoes;
    });
    
    toast({
      title: "Cartão removido",
      description: "O cartão foi removido da sua conta."
    });
  };

  const handleDefinirPadrao = (id: number) => {
    setCartoes(prev => prev.map(cartao => ({
      ...cartao,
      isPadrao: cartao.id === id
    })));
    
    toast({
      title: "Cartão padrão alterado",
      description: "Este cartão agora é seu método de pagamento padrão."
    });
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <AppMenu />
      
      <div className="container mx-auto px-4 py-6">
        {/* Título da página */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard-cliente")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-h2">Gerenciar Cartões</h1>
          </div>
          
          {/* Botão Adicionar Cartão */}
          <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Cartão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cartão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="numero">Número do Cartão</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="numero"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      value={novoCartao.numero}
                      onChange={(e) => handleNumeroChange(e.target.value)}
                    />
                    {detectarBandeira(novoCartao.numero) && (
                      <div className="w-8 h-5 flex items-center justify-center">
                        {getBandeiraIcon(detectarBandeira(novoCartao.numero))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validade">Validade</Label>
                    <Input
                      id="validade"
                      placeholder="MM/AA"
                      maxLength={5}
                      value={novoCartao.validade}
                      onChange={(e) => setNovoCartao(prev => ({ ...prev, validade: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="000"
                      maxLength={4}
                      value={novoCartao.cvv}
                      onChange={(e) => setNovoCartao(prev => ({ ...prev, cvv: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Titular</Label>
                  <Input
                    id="nome"
                    placeholder="Nome completo"
                    value={novoCartao.nome}
                    onChange={(e) => setNovoCartao(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF do Titular</Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={novoCartao.cpf}
                    onChange={(e) => setNovoCartao(prev => ({ ...prev, cpf: e.target.value }))}
                    inputMode="numeric"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogAberto(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSalvarCartao}
                    disabled={loading || !novoCartao.numero || !novoCartao.validade || !novoCartao.cvv || !novoCartao.nome || !novoCartao.cpf}
                    className="flex-1"
                  >
                    {loading ? "Validando cartão..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de cartões */}
        <div className="space-y-4">
          {cartoes.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-h4 mb-2">Nenhum cartão cadastrado</h3>
                <p className="text-muted-foreground mb-4">
                  Adicione um cartão para facilitar seus pagamentos.
                </p>
              </CardContent>
            </Card>
          ) : (
            cartoes.map((cartao) => (
              <Card key={cartao.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {getBandeiraIcon(cartao.bandeira)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Final {cartao.ultimos4}
                          </span>
                          {cartao.isPadrao && (
                            <div className="flex items-center gap-1 text-accent bg-accent/10 px-2 py-1 rounded text-sm">
                              <Star className="h-3 w-3 fill-current" />
                              Padrão
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center md:gap-2">
                            <span>Vence em {cartao.vencimento}</span>
                            <span className="hidden md:inline">•</span>
                            <span className="hidden md:inline">{cartao.nomeTitular}</span>
                          </div>
                          <div className="md:hidden">
                            {cartao.nomeTitular}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!cartao.isPadrao && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDefinirPadrao(cartao.id)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4 md:mr-1" />
                            <span className="hidden md:inline">Remover</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover cartão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover este cartão? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoverCartao(cartao.id)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GerenciarCartoes;