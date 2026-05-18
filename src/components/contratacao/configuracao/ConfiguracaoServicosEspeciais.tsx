import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Info, Minus, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DadosContratacao } from "@/pages/Contratacao";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
interface Props {
  dados: DadosContratacao;
  onAvancar: (dados: Partial<DadosContratacao>) => void;
  onVoltar: () => void;
}
export const ConfiguracaoServicosEspeciais: React.FC<Props> = ({
  dados,
  onAvancar,
  onVoltar
}) => {
  const [quantidadePessoas, setQuantidadePessoas] = useState(dados.quantidadePessoas || 1);
  const [dataEvento, setDataEvento] = useState<Date>(dados.dataEvento || new Date());
  const [horarioInicio, setHorarioInicio] = useState(dados.horarioInicio || '');
  const [horarioFim, setHorarioFim] = useState(dados.horarioFim || '');
  const [errors, setErrors] = useState<{
    [key: string]: boolean;
  }>({});
  const validateForm = () => {
    const newErrors: {
      [key: string]: boolean;
    } = {};
    if (!dataEvento) {
      newErrors.dataEvento = true;
    }
    if (!horarioInicio) {
      newErrors.horarioInicio = true;
    }
    if (!horarioFim) {
      newErrors.horarioFim = true;
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const missingFields = [];
      if (newErrors.dataEvento) missingFields.push("Data do evento");
      if (newErrors.horarioInicio) missingFields.push("Horário de início");
      if (newErrors.horarioFim) missingFields.push("Horário de fim");
      toast({
        title: "Campos obrigatórios não preenchidos",
        description: `Por favor, preencha: ${missingFields.join(", ")}`,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };
  const handleAvancar = () => {
    if (validateForm()) {
      onAvancar({
        quantidadePessoas,
        dataEvento,
        horarioInicio,
        horarioFim
      });
    }
  };
  return <div className="space-y-8">
      <div className="text-center">
        <p className="text-gray-600">
          Vamos entender melhor suas expectativas para te guiar na melhor opção de serviço.
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Quantidade de Pessoas */}
          <div className="space-y-3">
            <Label className={cn("text-base font-semibold", errors.quantidadePessoas && "text-red-500")}>
              Quantidade de pessoas
            </Label>
            <p className="text-sm text-gray-500">
              Informe o número de pessoas que irão participar do evento para calcularmos as porções adequadas.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="h-10 w-10 rounded-md border-gray-300 text-gray-600 hover:bg-gray-50" onClick={() => setQuantidadePessoas(Math.max(1, quantidadePessoas - 1))}>
                <Minus size={16} />
              </Button>
              <Input type="number" value={quantidadePessoas} onChange={e => setQuantidadePessoas(parseInt(e.target.value) || 1)} className="h-10 w-20 text-center rounded-md border-gray-300 text-gray-900" min="1" />
              <Button variant="outline" className="h-10 w-10 rounded-md border-gray-300 text-gray-600 hover:bg-gray-50" onClick={() => setQuantidadePessoas(quantidadePessoas + 1)}>
                <Plus size={16} />
              </Button>
            </div>
          </div>

          {/* Data e Horários em uma linha */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Data do Evento */}
            <div className="space-y-3">
              <Label className={cn("text-base font-semibold", errors.dataEvento && "text-red-500")}>
                Data do evento
              </Label>
              <p className="text-sm text-gray-500">
                Quando o evento acontecerá.
              </p>
              <Input type="date" value={dataEvento ? format(dataEvento, "yyyy-MM-dd") : ''} onChange={e => {
              if (e.target.value) {
                setDataEvento(new Date(e.target.value));
                setErrors(prev => ({
                  ...prev,
                  dataEvento: false
                }));
              }
            }} min={format(new Date(), "yyyy-MM-dd")} className={cn("h-10 rounded-md border-gray-300 text-gray-900", errors.dataEvento && "border-red-500")} />
            </div>

            {/* Horário de Início */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className={cn("text-base font-semibold", errors.horarioInicio && "text-red-500")}>
                  Horário de Início
                </Label>
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
              <p className="text-sm text-gray-500">Em que   comida deve ser servida.</p>
              <Input type="time" value={horarioInicio} onChange={e => {
              setHorarioInicio(e.target.value);
              setErrors(prev => ({
                ...prev,
                horarioInicio: false
              }));
            }} className={cn("h-10 rounded-md border-gray-300 text-gray-900", errors.horarioInicio && "border-red-500")} />
            </div>

            {/* Horário de Fim */}
            <div className="space-y-3">
              <Label className={cn("text-base font-semibold", errors.horarioFim && "text-red-500")}>
                Horário de Fim
              </Label>
              <p className="text-sm text-gray-500">
                Quando o serviço deve terminar.
              </p>
              <Input type="time" value={horarioFim} onChange={e => {
              setHorarioFim(e.target.value);
              setErrors(prev => ({
                ...prev,
                horarioFim: false
              }));
            }} className={cn("h-10 rounded-md border-gray-300 text-gray-900", errors.horarioFim && "border-red-500")} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onVoltar}>
          Voltar
        </Button>
        <Button onClick={handleAvancar}>
          Avançar
        </Button>
      </div>
    </div>;
};