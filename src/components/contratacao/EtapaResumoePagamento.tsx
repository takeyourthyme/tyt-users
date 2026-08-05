import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Receipt, User, Info, Home, CreditCard, DollarSign, QrCode } from "lucide-react";
import { DadosContratacao } from "@/pages/Contratacao";
import { loadSession } from "@/services/authService";
import { getUserById } from "@/services/userService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { getAsaasCustomerId, getAsaasTokenizationConfig, tokenizeCard } from "@/services/asaasService";
import { calculateServicePrice, fetchPricingTiers, type PricingTier } from "@/services/pricingService";

interface Props {
  dados: DadosContratacao;
  onVoltar: () => void;
  onConcluir: (novosDados: Partial<DadosContratacao>) => void;
}

type MetodoPagamento = 'CREDIT_CARD' | 'PIX';

export const EtapaResumoePagamento: React.FC<Props> = ({ dados, onVoltar, onConcluir }) => {
  const getDishName = (dish: unknown, fallback: string) => {
    if (!dish || typeof dish !== "object") return fallback;
    const record = dish as Record<string, unknown>;
    const name = record.nome ?? record.name ?? record.titulo ?? record.title;
    return typeof name === "string" && name.trim() ? name.trim() : fallback;
  };

  /**
   * Gets the pre-computed cost for a dish from the API response.
   * Uses Prato.total_cost as the single source of truth.
   * Returns 0 if not available (will show a warning to the user).
   */
  const getDishCost = (dish: unknown): number => {
    if (!dish || typeof dish !== "object") return 0;
    const record = dish as Record<string, unknown>;
    const cost = record.total_cost ?? record.totalCost ?? record.preco ?? record.price;
    return typeof cost === "number" && Number.isFinite(cost) ? cost : 0;
  };

  const getDishDayIndex = (dish: unknown) => {
    if (!dish || typeof dish !== "object") return undefined;
    const record = dish as Record<string, unknown>;
    const raw = record.diaIndex ?? record.dayIndex;
    if (typeof raw === "number" && Number.isInteger(raw)) return raw;
    const parsed = typeof raw === "string" ? Number(raw) : NaN;
    return Number.isInteger(parsed) ? parsed : undefined;
  };

  const toDigits = (value: string) => value.replace(/\D/g, "");

  const [endereco, setEndereco] = useState(dados.endereco || {
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: dados.cidade?.split(' - ')[0] || ''
  });
  const [usarEnderecoMesmoCadastro, setUsarEnderecoMesmoCadastro] = useState(false);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfileAddress, setIsLoadingProfileAddress] = useState(false);
  const [errosValidacao, setErrosValidacao] = useState<string[]>([]);

  // Payment method state
  const isPayableService = dados.tipoServico !== 'servicos-especiais';
  const isGetTogether = dados.tipoServico === 'eventos';
  const [metodoPagamento, setMetodoPagamento] = useState<MetodoPagamento>('CREDIT_CARD');
  const [installmentCount, setInstallmentCount] = useState<number>(1);

  // Credit card state
  const [cartao, setCartao] = useState({
    numero: '',
    validade: '',
    cvv: '',
    nomeTitular: '',
  });

  const selectedDishes: unknown[] = Array.isArray(dados.pratosSelecionados) ? dados.pratosSelecionados : [];

  /**
   * Calculates the actual number of portions needed for the selected dish.
   * Multiplies the selection count by the plan/event multiplier.
   */
  const getDishRealQuantity = (prato: unknown): number => {
    if (!prato || typeof prato !== "object") return 1;
    const record = prato as Record<string, unknown>;

    // Number of times the dish was selected in the menu (default 1)
    const selectionQty = typeof record.quantity === 'number' ? record.quantity : 1;

    if (dados.tipoServico === 'cozinha-semanal') {
      const multiplier = dados.tamanhoPortacao === "grande" ? 6 : dados.tamanhoPortacao === "media" ? 4 : 2;
      return selectionQty * multiplier;
    }

    if (dados.tipoServico === 'eventos') {
      const multiplier = Number(dados.quantidadePessoas || 1);
      return selectionQty * multiplier;
    }

    return selectionQty;
  };

  /**
   * Calculates the subtotal cost for a dish based on the required batch quantity.
   * Batch size is determined by 'servings' (or 'quantidade' yield candidate).
   */
  const getDishSubtotal = (prato: unknown): number => {
    if (!prato || typeof prato !== "object") return 0;
    const record = prato as Record<string, unknown>;

    // User requested quantity (multiplied by portion size/people)
    const qty = getDishRealQuantity(prato);

    // Recipe servings yield
    const servings = typeof record.servings === 'number' && record.servings > 0 ? record.servings : 1;

    // Number of batches required
    const batches = Math.ceil(qty / servings);
    return getDishCost(prato) * batches;
  };

  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);

  React.useEffect(() => {
    fetchPricingTiers().then(setPricingTiers);
  }, []);

  const pricing = calculateServicePrice(
    dados.tipoServico,
    dados.tipoServico === 'eventos' ? dados.quantidadePessoas : dados.tamanhoPortacao,
    pricingTiers
  );

  const valorServico = pricing.clientPrice;
  const custoIngredientes = selectedDishes.reduce<number>(
    (acc, prato) => acc + getDishSubtotal(prato),
    0
  );
  const totalBase = valorServico + custoIngredientes;

  // Installment interest calculation (2% compound/month)
  const MONTHLY_INTEREST_RATE = 0.02;
  const totalComJuros = installmentCount > 1
    ? Math.round(totalBase * Math.pow(1 + MONTHLY_INTEREST_RATE, installmentCount) * 100) / 100
    : totalBase;
  const valorParcela = installmentCount > 1
    ? Math.round((totalComJuros / installmentCount) * 100) / 100
    : totalBase;
  const total = installmentCount > 1 ? totalComJuros : totalBase;

  const buscarCEP = async (cep: string) => {
    const digits = toDigits(cep);
    if (digits.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = (await response.json()) as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string };
      if (data?.erro) return;
      setEndereco((prev) => ({
        ...prev,
        rua: prev.rua || data.logradouro || '',
        bairro: prev.bairro || data.bairro || '',
        cidade: prev.cidade || data.localidade || prev.cidade,
      }));
    } catch {
      return;
    }
  };

  const carregarEnderecoDoPerfil = async () => {
    const session = loadSession();
    if (!session?.token || !session.userId) return;
    try {
      setIsLoadingProfileAddress(true);
      const response = await getUserById({ token: session.token, userId: session.userId });
      const candidate =
        response && typeof response === "object" && !Array.isArray(response) && (response as Record<string, unknown>).user
          ? ((response as Record<string, unknown>).user as unknown)
          : response;
      if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return;
      const user = candidate as Record<string, unknown>;

      const cep = String((user.cep ?? user.codigo_postal ?? user.postal_code ?? "") as string).trim();
      const rua = String((user.endereco ?? user.rua ?? user.street ?? "") as string).trim();
      const numero = String((user.numero ?? user.number ?? "") as string).trim();
      const complemento = String((user.complemento ?? user.complement ?? "") as string).trim();
      const bairro = String((user.bairro ?? user.district ?? "") as string).trim();
      const cidade = String((user.cidade ?? user.city ?? "") as string).trim();

      setEndereco((prev) => ({
        ...prev,
        cep: cep || prev.cep,
        rua: rua || prev.rua,
        numero: numero || prev.numero,
        complemento: complemento || prev.complemento,
        bairro: bairro || prev.bairro,
        cidade: cidade || prev.cidade || dados.cidade?.split(' - ')[0] || '',
      }));

      const shouldFillFromCep = cep && (!(rua || bairro || cidade) || !(rua && bairro && cidade));
      if (shouldFillFromCep) await buscarCEP(cep);
    } finally {
      setIsLoadingProfileAddress(false);
    }
  };

  const validarFormulario = () => {
    const erros: string[] = [];

    if (!endereco.cep) erros.push('cep');
    if (!endereco.rua) erros.push('rua');
    if (!endereco.numero) erros.push('numero');
    if (!endereco.bairro) erros.push('bairro');
    if (!endereco.cidade) erros.push('cidade');
    if (!aceitouTermos) erros.push('termos');

    // Validate card fields only for credit card method
    if (isPayableService && metodoPagamento === 'CREDIT_CARD') {
      if (cartao.numero.replace(/\D/g, '').length < 13) erros.push('cartao_numero');
      if (cartao.validade.length < 5) erros.push('cartao_validade');
      if (cartao.cvv.replace(/\D/g, '').length < 3) erros.push('cartao_cvv');
      if (!cartao.nomeTitular.trim()) erros.push('cartao_nome');
    }

    return erros;
  };

  const concluirSemPagamento = async () => {
    const erros = validarFormulario();
    setErrosValidacao(erros);

    if (erros.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, corrija os erros sinalizados em vermelho no formulário.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    if (isPayableService && metodoPagamento === 'CREDIT_CARD') {
      try {
        const session = loadSession();
        if (!session?.token) {
          throw new Error("Sessão não encontrada. Por favor, faça login novamente.");
        }

        const userRecord = (session.user || {}) as Record<string, any>;

        // 1. Get Asaas customer ID from backend
        const customerRes = await getAsaasCustomerId(session.token);

        if (!customerRes.asaasCustomerId) {
          throw new Error("Não foi possível obter o identificador do cliente no Asaas.");
        }

        // 2. Build tokenize payload
        const [expiryMonth, expiryYearShort] = cartao.validade.split('/');
        const expiryYear = expiryYearShort ? `20${expiryYearShort}` : '';

        const tokenizePayload = {
          customer: customerRes.asaasCustomerId,
          creditCard: {
            holderName: cartao.nomeTitular.trim(),
            number: cartao.numero.replace(/\D/g, ''),
            expiryMonth: (expiryMonth || '').trim(),
            expiryYear,
            ccv: cartao.cvv.replace(/\D/g, '')
          },
          creditCardHolderInfo: {
            name: cartao.nomeTitular.trim(),
            email: String(userRecord.email || ""),
            cpfCnpj: String(userRecord.cpf || "").replace(/\D/g, ""),
            postalCode: endereco.cep.replace(/\D/g, ''),
            addressNumber: endereco.numero,
            addressComplement: endereco.complemento || undefined,
            phone: String(userRecord.whatsapp || "").replace(/\D/g, "")
          }
        };

        // 3. Call backend tokenize proxy
        const asaasData = await tokenizeCard(session.token, tokenizePayload);
        if (!asaasData.creditCardToken) {
          throw new Error("Token do cartão não foi retornado pelo Asaas.");
        }

        // 4. Complete with tokenized card payload
        onConcluir({
          endereco,
          aceitouTermos,
          billingType: 'CREDIT_CARD',
          installmentCount: isGetTogether && installmentCount > 1 ? installmentCount : undefined,
          creditCardToken: asaasData.creditCardToken,
          creditCardHolderInfo: {
            name: cartao.nomeTitular.trim(),
            postalCode: endereco.cep.replace(/\D/g, ''),
            addressNumber: endereco.numero,
            addressComplement: endereco.complemento,
            phone: String(userRecord.whatsapp || "").replace(/\D/g, ""),
            email: String(userRecord.email || ""),
            cpfCnpj: String(userRecord.cpf || "").replace(/\D/g, ""),
          }
        });

      } catch (err: any) {
        console.error("Erro no fluxo de tokenização:", err);
        toast({
          title: "Erro no pagamento",
          description: err.message || "Erro ao processar o cartão. Verifique os dados e tente novamente.",
          variant: "destructive"
        });
        setIsSubmitting(false);
      }
    } else if (isPayableService && metodoPagamento === 'PIX') {
      // PIX: no card tokenization needed, just pass billingType
      onConcluir({
        endereco,
        aceitouTermos,
        billingType: 'PIX',
      });
    } else {
      // Non-payable service (Special Service)
      onConcluir({
        endereco,
        aceitouTermos,
      });
    }
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
                  {dados.tipoServico === 'cozinha-semanal' && 'Meal Prep'}
                  {dados.tipoServico === 'eventos' && 'Get Together'}
                  {dados.tipoServico === 'servicos-especiais' && 'Special Service'}
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

              {dados.dataEvento && (() => {
                const parsed = new Date(dados.dataEvento);
                if (Number.isNaN(parsed.getTime())) return null;
                return (
                  <div className="flex justify-between">
                    <span>Data do Serviço:</span>
                    <span className="font-medium">
                      {format(parsed, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                );
              })()}

              {dados.horarioInicio && (
                <div className="flex justify-between">
                  <span>Horário:</span>
                  <span className="font-medium">
                    {dados.horarioInicio}
                    {dados.horarioFim ? ` às ${dados.horarioFim}` : ""}
                  </span>
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
                    {dados.diasEntrega.map((diaEntrega: { dia: string, periodo: string }, diaIndex: number) => {
                      const pratosDoDia = (dados.pratosSelecionados || []).filter((p) => getDishDayIndex(p) === diaIndex);

                      return (
                        <div key={diaIndex} className="space-y-2">
                          <div className="flex items-center justify-between border-b pb-1">
                            <span className="text-sm font-light">{diaEntrega.dia} - {diaEntrega.periodo}</span>
                            <span className="text-xs text-muted-foreground">{pratosDoDia.length} pratos</span>
                          </div>
                          <div className="space-y-1">
                            {pratosDoDia.map((prato, index: number) => (
                              <div key={index} className="flex justify-between text-sm pl-2">
                                <span>• {getDishName(prato, `Prato ${index + 1}`)}</span>
                                <span className="text-muted-foreground">R$ {getDishSubtotal(prato).toFixed(2)}</span>
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
                    {dados.pratosSelecionados.map((prato, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{getDishName(prato, `Prato ${index + 1}`)}</span>
                        <span>R$ {getDishSubtotal(prato).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {dados.tipoServico !== 'servicos-especiais' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="w-5 h-5" />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span>Valor do Serviço:</span>
                  <span>R$ {valorServico.toFixed(2)}</span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100 pl-4">
                  <div className="flex justify-between">
                    <span>• Chef profissional:</span>
                    <span>R$ {pricing.chefAmount.toFixed(2)}</span>
                  </div>
                  {pricing.subChefAmount > 0 && (
                    <div className="flex justify-between text-amber-800 font-medium">
                      <span>• Sub Chef:</span>
                      <span>R$ {pricing.subChefAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>• Taxa da Plataforma TYT:</span>
                    <span>R$ {pricing.tytAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <span>Custo estimado de ingredientes:</span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Info className="w-4 h-4 cursor-pointer text-blue-500 hover:text-blue-700" />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Sobre o valor estimado de ingredientes</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600">
                            Este valor é calculado automaticamente com base no custo de ingredientes dos pratos selecionados. Após o chef realizar as compras, o comprovante será anexado e qualquer diferença será reembolsada ou cobrada adicionalmente no cartão.
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <span className="font-medium">
                    {custoIngredientes > 0
                      ? `R$ ${custoIngredientes.toFixed(2)}`
                      : <span className="text-amber-600 text-xs">A calcular</span>}
                  </span>
                </div>

                {/* Installment info for Get Together */}
                {isGetTogether && metodoPagamento === 'CREDIT_CARD' && installmentCount > 1 && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 space-y-1">
                    <p className="text-xs font-medium text-blue-800">Parcelamento:</p>
                    <p className="text-sm text-blue-700">
                      {installmentCount}x de R$ {valorParcela.toFixed(2)}
                      <span className="text-xs ml-1">(total c/ juros: R$ {totalComJuros.toFixed(2)})</span>
                    </p>
                    <p className="text-xs text-blue-600">Juros de 2% ao mês</p>
                  </div>
                )}

                <hr />
                <div className="flex justify-between font-semibold text-lg text-primary">
                  <span>Total a pagar:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          )}
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
                  disabled={isLoadingProfileAddress}
                  onCheckedChange={(checked) => {
                    setUsarEnderecoMesmoCadastro(checked as boolean);
                    if (checked) {
                      void carregarEnderecoDoPerfil();
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
                      void buscarCEP(newCep);
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

          {/* Pagamento */}
          {isPayableService ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className={`flex items-center gap-2 text-lg ${errosValidacao.some(e => e.startsWith('cartao_')) ? 'text-red-600' : ''
                  }`}>
                  <CreditCard className="w-5 h-5" />
                  Forma de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment method selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setMetodoPagamento('CREDIT_CARD'); setInstallmentCount(1); }}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm font-medium ${metodoPagamento === 'CREDIT_CARD'
                      ? 'border-[#004B2A] bg-[#004B2A]/5 text-[#004B2A]'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    Cartão de Crédito
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMetodoPagamento('PIX'); setInstallmentCount(1); }}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm font-medium ${metodoPagamento === 'PIX'
                      ? 'border-[#004B2A] bg-[#004B2A]/5 text-[#004B2A]'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                  >
                    <QrCode className="w-5 h-5" />
                    Pix
                  </button>
                </div>

                {/* Credit Card form */}
                {metodoPagamento === 'CREDIT_CARD' && (
                  <div className="space-y-3 pt-2">
                    {/* Installment selector — Get Together only */}
                    {isGetTogether && (
                      <div>
                        <Label className="text-sm">Parcelamento</Label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          {[1, 2, 3].map((n) => {
                            const totalParc = n > 1
                              ? Math.round(totalBase * Math.pow(1 + MONTHLY_INTEREST_RATE, n) * 100) / 100
                              : totalBase;
                            const parcValue = Math.round((totalParc / n) * 100) / 100;

                            return (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setInstallmentCount(n)}
                                className={`p-2 rounded-lg border text-center transition-all ${installmentCount === n
                                  ? 'border-[#004B2A] bg-[#004B2A]/5'
                                  : 'border-gray-200 hover:border-gray-300'
                                  }`}
                              >
                                <span className="block text-sm font-medium">
                                  {n}x de R$ {parcValue.toFixed(2)}
                                </span>
                                {n > 1 && (
                                  <span className="block text-xs text-muted-foreground">
                                    (c/ juros)
                                  </span>
                                )}
                                {n === 1 && (
                                  <span className="block text-xs text-green-600">
                                    sem juros
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Card number */}
                    <div>
                      <Label htmlFor="cartao-numero" className="text-sm">Número do Cartão</Label>
                      <Input
                        id="cartao-numero"
                        value={cartao.numero}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
                          const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                          setCartao(prev => ({ ...prev, numero: formatted }));
                        }}
                        placeholder="0000 0000 0000 0000"
                        inputMode="numeric"
                        maxLength={19}
                        className={`text-sm font-mono ${errosValidacao.includes('cartao_numero') ? 'border-red-500' : ''}`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Expiry */}
                      <div>
                        <Label htmlFor="cartao-validade" className="text-sm">Validade (MM/AA)</Label>
                        <Input
                          id="cartao-validade"
                          value={cartao.validade}
                          onChange={(e) => {
                            let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                            if (raw.length > 2) raw = raw.slice(0, 2) + '/' + raw.slice(2);
                            setCartao(prev => ({ ...prev, validade: raw }));
                          }}
                          placeholder="MM/AA"
                          inputMode="numeric"
                          maxLength={5}
                          className={`text-sm font-mono ${errosValidacao.includes('cartao_validade') ? 'border-red-500' : ''}`}
                        />
                      </div>

                      {/* CVV */}
                      <div>
                        <Label htmlFor="cartao-cvv" className="text-sm">CVV</Label>
                        <Input
                          id="cartao-cvv"
                          value={cartao.cvv}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                            setCartao(prev => ({ ...prev, cvv: raw }));
                          }}
                          placeholder="123"
                          inputMode="numeric"
                          maxLength={4}
                          type="password"
                          className={`text-sm font-mono ${errosValidacao.includes('cartao_cvv') ? 'border-red-500' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Holder name */}
                    <div>
                      <Label htmlFor="cartao-nome" className="text-sm">Nome do Titular (como no cartão)</Label>
                      <Input
                        id="cartao-nome"
                        value={cartao.nomeTitular}
                        onChange={(e) => setCartao(prev => ({ ...prev, nomeTitular: e.target.value.toUpperCase() }))}
                        placeholder="JOÃO DA SILVA"
                        className={`text-sm ${errosValidacao.includes('cartao_nome') ? 'border-red-500' : ''}`}
                      />
                    </div>

                    <p className="text-xs text-muted-foreground pt-1">
                      🔒 Seus dados são processados com segurança via Asaas. Não armazenamos dados do cartão.
                    </p>
                  </div>
                )}

                {/* Pix info */}
                {metodoPagamento === 'PIX' && (
                  <div className="space-y-3 pt-2">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center space-y-2">
                      <QrCode className="w-10 h-10 mx-auto text-green-600" />
                      <p className="text-sm font-medium text-green-800">
                        Pagamento instantâneo via Pix
                      </p>
                      <p className="text-xs text-green-700">
                        Após clicar em "Concluir", um QR Code será gerado para você escanear com o app do seu banco. O pagamento é confirmado em segundos.
                      </p>
                      {totalBase > 0 && (
                        <p className="text-lg font-bold text-green-800 pt-1">
                          R$ {totalBase.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      🔒 Pix é processado com segurança via Asaas. Pagamento à vista, sem juros.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Home className="w-5 h-5" />
                  Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Para Serviços Especiais, o pagamento será solicitado após a aprovação do orçamento pela equipe TYT.
                </p>
              </CardContent>
            </Card>
          )}

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
          onClick={() => void concluirSemPagamento()}
          disabled={isSubmitting}
          size="lg"
          className="text-sm"
        >
          {isSubmitting ? "Concluindo..." : "Concluir"}
        </Button>
      </div>
    </div>
  );
};
