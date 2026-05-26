import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Receipt, User, Info, Home, DollarSign } from "lucide-react";
import { DadosContratacao } from "@/pages/Contratacao";
import { loadSession } from "@/services/authService";
import { getUserById } from "@/services/userService";

interface Props {
  dados: DadosContratacao;
  onVoltar: () => void;
  onConcluir: (novosDados: Partial<DadosContratacao>) => void;
}

export const EtapaResumoePagamento: React.FC<Props> = ({ dados, onVoltar, onConcluir }) => {
  const getDishName = (dish: unknown, fallback: string) => {
    if (!dish || typeof dish !== "object") return fallback;
    const record = dish as Record<string, unknown>;
    const name = record.nome ?? record.name ?? record.titulo ?? record.title;
    return typeof name === "string" && name.trim() ? name.trim() : fallback;
  };

  const getDishPrice = (dish: unknown) => {
    if (!dish || typeof dish !== "object") return 35;
    const record = dish as Record<string, unknown>;
    const price = record.preco ?? record.price ?? record.valor ?? record.value;
    return typeof price === "number" && Number.isFinite(price) ? price : 35;
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

  const precoChef = 550;
  const selectedDishes: unknown[] = Array.isArray(dados.pratosSelecionados) ? dados.pratosSelecionados : [];
  const precoCompras = selectedDishes.reduce<number>((total, prato) => total + getDishPrice(prato), 0) || 210;
  const total = precoChef + precoCompras;

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

    return erros;
  };

  const concluirSemPagamento = async () => {
    const erros = validarFormulario();
    setErrosValidacao(erros);

    if (erros.length > 0) return;

    setIsSubmitting(true);
    onConcluir({
      endereco,
      aceitouTermos,
    });
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
                    {dados.diasEntrega.map((diaEntrega: { dia: string, periodo: string }, diaIndex: number) => {
                      const pratosDoDia = (dados.pratosSelecionados || []).filter((p) => getDishDayIndex(p) === diaIndex);

                      return (
                        <div key={diaIndex} className="space-y-2">
                          <div className="flex items-center justify-between border-b pb-1">
                            <span className="text-sm font-semibold">{diaEntrega.dia} - {diaEntrega.periodo}</span>
                            <span className="text-xs text-muted-foreground">{pratosDoDia.length} pratos</span>
                          </div>
                          <div className="space-y-1">
                            {pratosDoDia.map((prato, index: number) => (
                              <div key={index} className="flex justify-between text-sm pl-2">
                                <span>• {getDishName(prato, `Prato ${index + 1}`)}</span>
                                <span className="text-muted-foreground">R$ {getDishPrice(prato).toFixed(2)}</span>
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
                        <span>R$ {getDishPrice(prato).toFixed(2)}</span>
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="w-5 h-5" />
                Pagamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Pagamento ainda não está disponível. Você pode concluir a contratação e o pagamento será habilitado em breve.
              </p>
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
