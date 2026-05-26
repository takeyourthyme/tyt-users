import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { DadosContratacao } from "@/pages/Contratacao";
import { isAxiosError } from "axios";
import { login, parseLoginResponse, saveSession } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    try {
      setIsSubmitting(true);
      const response = await login({ email: email.trim(), password });
      const session = parseLoginResponse(response);
      saveSession(session);
      onLogin();
      onAvancar({});
    } catch (error) {
      const description = isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message || "Verifique suas credenciais e tente novamente."
        : "Verifique suas credenciais e tente novamente.";
      toast({
        title: "Não foi possível fazer login",
        description,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              inputMode="email"
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <Button onClick={handleLogin} disabled={!email || !password || isSubmitting} className="w-full">
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>

          <div className="text-center">
            <Button variant="link" onClick={irParaCadastro} className="text-sm">
              Não tenho conta, criar uma agora
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onVoltar}>
          Voltar
        </Button>
      </div>
    </div>;
};
