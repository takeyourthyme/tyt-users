import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useNavigate } from "react-router-dom";
import { DadosContratacao } from "@/pages/Contratacao";
import { MessageCircle, Check } from "lucide-react";
import InputMask from 'react-input-mask';
interface Props {
  dados: DadosContratacao;
  onAvancar: (dados: Partial<DadosContratacao>) => void;
  onVoltar: () => void;
  onLogin: () => void;
}
export const EtapaIdentificacao: React.FC<Props> = ({
  dados,
  onAvancar,
  onVoltar,
  onLogin
}) => {
  const navigate = useNavigate();
  const [telefone, setTelefone] = useState("");
  const [mostrarOTP, setMostrarOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [validatingOTP, setValidatingOTP] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const enviarCodigo = async () => {
    if (!telefone) return;
    setCarregando(true);
    // Simular envio de código
    setTimeout(() => {
      setMostrarOTP(true);
      setCarregando(false);
    }, 1000);
  };
  const validarOTP = async () => {
    if (otp.length !== 6) return;
    
    setValidatingOTP(true);
    setValidationProgress(0);

    // Simulate validation progress
    const progressInterval = setInterval(() => {
      setValidationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 20;
      });
    }, 200);

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    onLogin();
    if (dados.tipoServico === 'servicos-especiais') {
      // Vai direto para sucesso para serviços especiais
      onAvancar({});
    } else {
      onAvancar({});
    }
    
    setValidatingOTP(false);
    setValidationProgress(0);
    setMostrarOTP(false);
  };
  const irParaCadastro = () => {
    navigate('/cadastro');
  };
  return <div className="max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
        <p className="text-gray-600">Faça login com seus dados para  continuar com sua contratação</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {!mostrarOTP ? <>
              <div className="space-y-2">
                <Label htmlFor="telefone">WhatsApp</Label>
                <InputMask mask="(99) 99999-9999" value={telefone} onChange={e => setTelefone(e.target.value)}>
                  {(inputProps: any) => <Input {...inputProps} id="telefone" placeholder="(00) 00000-0000" className="w-full" inputMode="tel" />}
                </InputMask>
              </div>

              <Button onClick={enviarCodigo} disabled={!telefone || carregando} className="w-full">
                {carregando ? "Enviando..." : "Entrar"}
              </Button>

              <div className="text-center">
                <Button variant="link" onClick={irParaCadastro} className="text-sm">
                  Não tenho conta, criar uma agora
                </Button>
              </div>
            </> : null}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onVoltar}>
          Voltar
        </Button>
      </div>

      {/* 2FA Modal */}
      <Dialog open={mostrarOTP} onOpenChange={setMostrarOTP}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Código de Verificação</DialogTitle>
            <DialogDescription className="text-center">
              Enviamos um código de 6 dígitos para {telefone}.
              Digite o código abaixo para entrar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP 
                value={otp} 
                onChange={setOtp} 
                maxLength={6}
                disabled={validatingOTP}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <div className="relative">
              <Button 
                onClick={validarOTP} 
                className="w-full relative overflow-hidden"
                size="lg"
                disabled={validatingOTP || otp.length !== 6}
              >
                {/* Progress overlay */}
                <div 
                  className="absolute inset-0 bg-green-600 transition-all duration-200 ease-out"
                  style={{
                    width: `${validationProgress}%`,
                    opacity: validatingOTP ? 1 : 0
                  }}
                />
                
                {/* Button content */}
                <span className="relative z-10 flex items-center justify-center">
                  {validatingOTP ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Validando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Validar e Continuar
                    </>
                  )}
                </span>
              </Button>
            </div>
            
            <div className="text-center">
              <Button 
                variant="ghost" 
                size="sm"
                disabled={validatingOTP}
                onClick={() => setMostrarOTP(false)}
              >
                Voltar para alterar número
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};