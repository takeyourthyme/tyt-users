import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DadosContratacao } from "@/pages/Contratacao";
interface Props {
  dados: DadosContratacao;
  onAvancar: (dados: Partial<DadosContratacao>) => void;
  onVoltar: () => void;
}
export const DetalhamentoServicosEspeciais: React.FC<Props> = ({
  dados,
  onAvancar,
  onVoltar
}) => {
  const [descricaoDetalhada, setDescricaoDetalhada] = useState(dados.descricaoDetalhada || '');
  const handleAvancar = () => {
    onAvancar({
      descricaoDetalhada
    });
  };
  return <div className="space-y-8">
      <div className="text-center">
        
        <p className="text-gray-600">Descreva em detalhes sua necessidade.</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <Label htmlFor="descricao" className="text-lg font-semibold">
              Datas e descrição detalhada
            </Label>
            <Textarea id="descricao" value={descricaoDetalhada} onChange={e => setDescricaoDetalhada(e.target.value)} placeholder="Escreva aqui sua necessidade, restrições, logística, objetivos e expectativas. Seja o mais detalhado possível para que possamos atender perfeitamente sua demanda." rows={10} className="min-h-[200px]" />
            <p className="text-sm text-gray-500">Serviços que podem ser contratados: Cozinha, compras, bebidas e drinks, garçons, somelier, etc.</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Como funciona?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Nossa equipe analisará sua solicitação em até 24 horas</li>
              <li>• Entraremos em contato para esclarecimentos e ajustes</li>
              <li>• Enviaremos uma proposta personalizada com valores e cronograma</li>
              <li>• Após aprovação, agendaremos o serviço conforme sua disponibilidade</li>
            </ul>
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