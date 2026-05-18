import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, CreditCard, Receipt, User, Info, Home, DollarSign } from "lucide-react";
import { DadosContratacao } from "@/pages/Contratacao";
import visaIcon from "@/assets/visa-icon.png";
import mastercardIcon from "@/assets/mastercard-icon.png";

interface Props {
  dados: DadosContratacao;
  onVoltar: () => void;
  onConcluir: () => void;
}

const cartoesExistentes = [
  {
    id: '1',
    bandeira: 'visa',
    ultimos4: '4532',
    titular: 'João Silva'
  },
  {
    id: '2', 
    bandeira: 'mastercard',
    ultimos4: '8745',
    titular: 'João Silva'
  }
];

export const EtapaResumoePagamento: React.FC<Props> = ({ dados, onVoltar, onConcluir }) => {
  const [endereco, setEndereco] = useState(dados.endereco || {
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: dados.cidade?.split(' - ')[0] || ''
  });
  const [usarEnderecoMesmoCadastro, setUsarEnderecoMesmoCadastro] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [mostrarNovoCartao, setMostrarNovoCartao] = useState(false);
  const [novoCartao, setNovoCartao] = useState({
    numero: '',
    titular: '',
    cpf: '',
    validade: '',
    cvv: ''
  });
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [processandoPagamento, setProcessandoPagamento] = useState(false);
  const [errosValidacao, setErrosValidacao] = useState<string[]>([]);

  const precoChef = 550;
  const precoCompras = dados.pratosSelecionados?.reduce((total, prato) => total + (prato.preco || 35), 0) || 210;
  const total = precoChef + precoCompras;

  const getBandeiraIcon = (bandeira: string) => {
    switch (bandeira) {
      case 'visa':
        return <img src={visaIcon} alt="Visa" className="h-4 w-4 object-contain" />;
      case 'mastercard':
        return <img src={mastercardIcon} alt="Mastercard" className="h-4 w-4 object-contain" />;
      default:
        return <img src={visaIcon} alt="Cartão" className="h-4 w-4 object-contain" />;
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
    return limpo.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const preencherEnderecoAutomatico = () => {
    setEndereco({
      cep: '80010-000',
      rua: 'Rua XV de Novembro',
      numero: '123',
      complemento: 'Apto 45',
      bairro: 'Centro',
      cidade: dados.cidade?.split(' - ')[0] || ''
    });
  };

  const buscarCEP = async (cep: string) => {
    if (cep.length === 9) {
      // Simular busca de CEP
      setEndereco(prev => ({
        ...prev,
        rua: 'Rua Exemplo',
        bairro: 'Bairro Exemplo'
      }));
    }
  };

  const validarFormulario = () => {
    const erros: string[] = [];
    
    if (!endereco.cep) erros.push('cep');
    if (!endereco.rua) erros.push('rua');
    if (!endereco.numero) erros.push('numero');
    if (!endereco.bairro) erros.push('bairro');
    if (!endereco.cidade) erros.push('cidade');
    if (!formaPagamento) erros.push('formaPagamento');
    if (!aceitouTermos) erros.push('termos');
    
    if (formaPagamento === 'novo-cartao') {
      if (!novoCartao.numero) erros.push('numeroCartao');
      if (!novoCartao.titular) erros.push('titularCartao');
      if (!novoCartao.cpf) erros.push('cpfCartao');
      if (!novoCartao.validade) erros.push('validadeCartao');
      if (!novoCartao.cvv) erros.push('cvvCartao');
    }
    
    return erros;
  };

  const podeProcessarPagamento = () => {
    return endereco.cep && endereco.rua && endereco.numero && 
           formaPagamento && aceitouTermos;
  };

  const processarPagamento = async () => {
    const erros = validarFormulario();
    setErrosValidacao(erros);
    
    if (erros.length > 0) return;
    
    setProcessandoPagamento(true);
    // Simular processamento
    setTimeout(() => {
      onConcluir();
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Coluna da Esquerda - Resumo */}
        <div className="space-y-4">
          {/* Resumo do Serviço */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Receipt className="w-5 h-5" />
                Resumo do Serviço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Tipo de Serviço:</span>
                <span className="font-medium">
                  {dados.tipoServico === 'cozinha-semanal' && 'Cozinha Semanal'}
                  {dados.tipoServico === 'eventos' && 'Eventos'}
                  {dados.tipoServico === 'servicos-especiais' && 'Serviços Especiais'}
                </span>
              </div>
              
              {dados.quantidadePessoas && (
                <div className="flex justify-between">
                  <span>Quantidade de Pessoas:</span>
                  <span className="font-medium">{dados.quantidadePessoas}</span>
                </div>
              )}
              
              {dados.tamanhoPortacao && (
                <div className="flex justify-between">
                  <span>Tamanho da Porção:</span>
                  <span className="font-medium capitalize">{dados.tamanhoPortacao}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pratos Selecionados */}
          {dados.pratosSelecionados && dados.pratosSelecionados.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Pratos Selecionados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dados.tipoServico === 'cozinha-semanal' && dados.diasEntrega ? (
                  // Agrupar por dia de entrega
                  <div className="space-y-4">
                    {dados.diasEntrega.map((diaEntrega: {dia: string, periodo: string}, diaIndex: number) => {
                      const pratosDoDia = dados.pratosSelecionados?.filter((p: any) => p.diaIndex === diaIndex) || [];
                      
                      return (
                        <div key={diaIndex} className="space-y-2">
                          <div className="flex items-center justify-between border-b pb-1">
                            <span className="text-sm font-semibold">{diaEntrega.dia} - {diaEntrega.periodo}</span>
                            <span className="text-xs text-muted-foreground">{pratosDoDia.length} pratos</span>
                          </div>
                          <div className="space-y-1">
                            {pratosDoDia.map((prato: any, index: number) => (
                              <div key={index} className="flex justify-between text-sm pl-2">
                                <span>• {prato.nome || `Prato ${index + 1}`}</span>
                                <span className="text-muted-foreground">R$ {(prato.preco || 35).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Exibição padrão para outros serviços
                  <div className="space-y-2 text-sm">
                    {dados.pratosSelecionados.map((prato: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{prato.nome || `Prato ${index + 1}`}</span>
                        <span>R$ {(prato.preco || 35).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Resumo Financeiro */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Serviço do Chef:</span>
                <span className="font-medium">R$ {precoChef.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                  <span>Compras:</span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Info className="w-4 h-4 cursor-pointer text-blue-500 hover:text-blue-700" />
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Informações sobre Compras</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          As compras de Supermercado são um valor estimado conforme a pesquisa do TYT na sua região. Depois que o chef fizer a compra, ele vai anexar o comprovante do mercado e o valor será atualizado, reembolsado ou cobrado adicional no cartão de crédito em caso de diferença.
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <span className="font-medium">R$ {precoCompras.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna da Direita - Dados */}
        <div className="space-y-4">
          {/* Endereço */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 text-lg ${errosValidacao.some(e => ['cep', 'rua', 'numero', 'bairro', 'cidade'].includes(e)) ? 'text-red-600' : ''}`}>
                <MapPin className="w-5 h-5" />
                Endereço do Serviço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="endereco-cadastro"
                  checked={usarEnderecoMesmoCadastro}
                  onCheckedChange={(checked) => {
                    setUsarEnderecoMesmoCadastro(checked as boolean);
                    if (checked) {
                      preencherEnderecoAutomatico();
                    }
                  }}
                />
                <Label htmlFor="endereco-cadastro" className="text-sm">
                  Usar o mesmo endereço do meu cadastro
                </Label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <Label htmlFor="cep" className="text-sm">CEP</Label>
                  <Input
                    id="cep"
                    value={endereco.cep}
                    onChange={(e) => {
                      const newCep = e.target.value;
                      setEndereco(prev => ({ ...prev, cep: newCep }));
                      buscarCEP(newCep);
                    }}
                    placeholder="00000-000"
                    className={`text-sm ${errosValidacao.includes('cep') ? 'border-red-500' : ''}`}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="rua" className="text-sm">Rua</Label>
                  <Input
                    id="rua"
                    value={endereco.rua}
                    onChange={(e) => setEndereco(prev => ({ ...prev, rua: e.target.value }))}
                    className={`text-sm ${errosValidacao.includes('rua') ? 'border-red-500' : ''}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <Label htmlFor="numero" className="text-sm">Número</Label>
                  <Input
                    id="numero"
                    value={endereco.numero}
                    onChange={(e) => setEndereco(prev => ({ ...prev, numero: e.target.value }))}
                    className={`text-sm ${errosValidacao.includes('numero') ? 'border-red-500' : ''}`}
                  />
                </div>
                <div className="col-span-3">
                  <Label htmlFor="complemento" className="text-sm">Complemento</Label>
                  <Input
                    id="complemento"
                    value={endereco.complemento}
                    onChange={(e) => setEndereco(prev => ({ ...prev, complemento: e.target.value }))}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="bairro" className="text-sm">Bairro</Label>
                  <Input
                    id="bairro"
                    value={endereco.bairro}
                    onChange={(e) => setEndereco(prev => ({ ...prev, bairro: e.target.value }))}
                    className={`text-sm ${errosValidacao.includes('bairro') ? 'border-red-500' : ''}`}
                  />
                </div>
                <div>
                  <Label htmlFor="cidade" className="text-sm">Cidade</Label>
                  <Input
                    id="cidade"
                    value={endereco.cidade}
                    onChange={(e) => setEndereco(prev => ({ ...prev, cidade: e.target.value }))}
                    className={`text-sm ${errosValidacao.includes('cidade') ? 'border-red-500' : ''}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Forma de Pagamento */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 text-lg ${errosValidacao.includes('formaPagamento') ? 'text-red-600' : ''}`}>
                <CreditCard className="w-5 h-5" />
                Forma de Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <RadioGroup value={formaPagamento} onValueChange={setFormaPagamento}>
                {/* Cartões Existentes */}
                {cartoesExistentes.map((cartao) => (
                  <div key={cartao.id} className="flex items-center space-x-3">
                    <RadioGroupItem value={cartao.id} id={cartao.id} />
                    <Label
                      htmlFor={cartao.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div
                        className={`p-3 border rounded-lg transition-colors ${
                          formaPagamento === cartao.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getBandeiraIcon(cartao.bandeira)}
                            <span className="text-sm">Final {cartao.ultimos4}</span>
                          </div>
                          <span className="text-xs text-gray-600">{cartao.titular}</span>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}

                {/* Cadastrar Novo Cartão */}
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="novo-cartao" id="novo-cartao" />
                  <Label
                    htmlFor="novo-cartao"
                    className="flex-1 cursor-pointer"
                  >
                    <div
                      className={`p-3 border rounded-lg transition-colors ${
                        formaPagamento === 'novo-cartao' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <span className="text-blue-600 text-sm">+ Cadastrar um novo cartão</span>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Formulário Novo Cartão */}
              {formaPagamento === 'novo-cartao' && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label htmlFor="numero-cartao" className="text-sm">Número do Cartão</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="numero-cartao"
                        value={novoCartao.numero}
                        onChange={(e) => {
                          const formatted = formatarNumeroCartao(e.target.value);
                          setNovoCartao(prev => ({ ...prev, numero: formatted }));
                        }}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        className={`text-sm ${errosValidacao.includes('numeroCartao') ? 'border-red-500' : ''}`}
                      />
                      {detectarBandeira(novoCartao.numero) && (
                        <div className="w-8 h-5 flex items-center justify-center">
                          {getBandeiraIcon(detectarBandeira(novoCartao.numero))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="titular-cartao" className="text-sm">Nome do Titular</Label>
                      <Input
                        id="titular-cartao"
                        value={novoCartao.titular}
                        onChange={(e) => setNovoCartao(prev => ({ ...prev, titular: e.target.value }))}
                        placeholder="Nome como está no cartão"
                        className={`text-sm ${errosValidacao.includes('titularCartao') ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cpf-cartao" className="text-sm">CPF do Titular</Label>
                      <Input
                        id="cpf-cartao"
                        value={novoCartao.cpf}
                        onChange={(e) => setNovoCartao(prev => ({ ...prev, cpf: e.target.value }))}
                        placeholder="000.000.000-00"
                        className={`text-sm ${errosValidacao.includes('cpfCartao') ? 'border-red-500' : ''}`}
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="validade" className="text-sm">Validade</Label>
                      <Input
                        id="validade"
                        value={novoCartao.validade}
                        onChange={(e) => setNovoCartao(prev => ({ ...prev, validade: e.target.value }))}
                        placeholder="MM/AA"
                        className={`text-sm ${errosValidacao.includes('validadeCartao') ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-sm">CVV</Label>
                      <Input
                        id="cvv"
                        value={novoCartao.cvv}
                        onChange={(e) => setNovoCartao(prev => ({ ...prev, cvv: e.target.value }))}
                        placeholder="000"
                        className={`text-sm ${errosValidacao.includes('cvvCartao') ? 'border-red-500' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Termos */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="aceitar-termos"
              checked={aceitouTermos}
              onCheckedChange={(checked) => setAceitouTermos(checked as boolean)}
              className={errosValidacao.includes('termos') ? 'border-red-500' : ''}
            />
            <Label htmlFor="aceitar-termos" className={`text-sm ${errosValidacao.includes('termos') ? 'text-red-600' : ''}`}>
              Aceito os{" "}
              <a href="/termos" target="_blank" className="text-blue-600 hover:underline">
                Termos de Uso e Política de Privacidade
              </a>
            </Label>
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onVoltar} className="text-sm">
          Voltar
        </Button>
        <Button 
          onClick={processarPagamento}
          disabled={processandoPagamento}
          size="lg"
          className="text-sm"
        >
          {processandoPagamento ? "Processando..." : "Pagar e Concluir"}
        </Button>
      </div>
    </div>
  );
};