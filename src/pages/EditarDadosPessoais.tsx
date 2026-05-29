import React, { useEffect, useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Camera, User, MapPin, FileImage, Edit2, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/AppHeader";
import { loadSession, saveSession, changePassword } from "@/services/authService";
import { updateClientUser } from "@/services/clientService";
import { getUserById } from "@/services/userService";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const isoToDateInput = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const dateInputToIso = (value: string) => {
  if (!value) return "";
  const [year, month, day] = value.split("-").map((v) => Number(v));
  const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  return utcDate.toISOString();
};

const getUserPhotoUrl = (user?: Record<string, unknown>) => {
  if (!user) return undefined;
  const candidates = [user.foto_url, user.fotoUrl, user.photoUrl, user.foto, user.photo];
  const raw = candidates.find((v) => typeof v === "string") as string | undefined;
  if (!raw) return undefined;
  return raw.trim().replace(/^[`"' ]+|[`"' ]+$/g, "");
};

const EditarDadosPessoais = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const session = useMemo(() => loadSession(), []);
  const token = session?.token;
  const userId =
    session?.userId ??
    (typeof session?.user?.id === "string" || typeof session?.user?.id === "number" ? session.user.id : undefined);
  const [user, setUser] = useState<Record<string, unknown> | null>(session?.user ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    foto: "",
    nome: "",
    dataNascimento: "",
    email: "",
    whatsapp: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    comprovanteEndereco: null as File | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token || !userId) return;
    if (user) return;

    getUserById({ token, userId })
      .then((data) => {
        if (!data || typeof data !== "object" || Array.isArray(data)) return;
        setUser(data as Record<string, unknown>);
      })
      .catch(() => {});
  }, [token, userId, user]);

  useEffect(() => {
    if (!user) return;

    const nome = (user.nome as string | undefined) ?? (user.name as string | undefined) ?? "";
    const email = (user.email as string | undefined) ?? "";
    const whatsappRaw =
      (user.whatsapp as string | undefined) ??
      (user.telefone as string | undefined) ??
      (user.phone as string | undefined) ??
      "";
    const cepRaw = (user.cep as string | undefined) ?? "";
    const endereco = (user.endereco as string | undefined) ?? (user.street as string | undefined) ?? "";
    const numero = (user.numero as string | undefined) ?? (user.number as string | undefined) ?? "";
    const complemento = (user.complemento as string | undefined) ?? (user.complement as string | undefined) ?? "";
    const bairro = (user.bairro as string | undefined) ?? (user.neighborhood as string | undefined) ?? "";
    const cidade = (user.cidade as string | undefined) ?? (user.city as string | undefined) ?? "";
    const estado = (user.estado as string | undefined) ?? (user.state as string | undefined) ?? "";
    const dataNascimentoRaw =
      (user.data_nascimento as string | undefined) ??
      (user.dataNascimento as string | undefined) ??
      (user.birthDate as string | undefined) ??
      "";

    setFormData((prev) => ({
      ...prev,
      nome,
      email,
      whatsapp: whatsappRaw,
      cep: cepRaw,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      dataNascimento: dataNascimentoRaw ? isoToDateInput(dataNascimentoRaw) : "",
      foto: getUserPhotoUrl(user) ?? "",
    }));
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.email.trim()) newErrors.email = "E-mail é obrigatório";
    if (!formData.whatsapp.trim()) newErrors.whatsapp = "WhatsApp é obrigatório";
    if (!formData.endereco.trim()) newErrors.endereco = "Endereço é obrigatório";
    if (!formData.cep.trim()) newErrors.cep = "CEP é obrigatório";
    if (formData.email && !formData.email.includes("@")) {
      newErrors.email = "E-mail inválido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!token || !userId) {
      toast({
        title: "Sessão inválida",
        description: "Faça login novamente para atualizar seus dados.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    try {
      setIsSubmitting(true);

      const input = new FormData();
      input.append("nome", formData.nome.trim());
      input.append("email", formData.email.trim());
      input.append("whatsapp", digitsOnly(formData.whatsapp));
      if (formData.dataNascimento) input.append("data_nascimento", dateInputToIso(formData.dataNascimento));
      input.append("cep", digitsOnly(formData.cep));
      input.append("endereco", formData.endereco.trim());
      input.append("numero", formData.numero.trim());
      if (formData.complemento?.trim()) input.append("complemento", formData.complemento.trim());
      input.append("bairro", formData.bairro.trim());
      input.append("cidade", formData.cidade.trim());
      input.append("estado", formData.estado.trim().toUpperCase());

      const updated = await updateClientUser({ token, userId, input });

      const nextSession = {
        token: session?.token,
        userId: session?.userId ?? userId,
        user: updated && typeof updated === "object" && !Array.isArray(updated) ? (updated as Record<string, unknown>) : user ?? undefined,
      };
      saveSession(nextSession);

      toast({
        title: "Dados salvos com sucesso!",
        description: "Suas informações pessoais foram atualizadas.",
      });
      navigate("/dashboard-cliente");
    } catch (error) {
      const message = (() => {
        if (isAxiosError(error)) {
          const payload = error.response?.data;
          if (typeof payload === "string") return payload;
          if (payload && typeof payload === "object") {
            const record = payload as Record<string, unknown>;
            if (typeof record.message === "string") return record.message;
            if (typeof record.error === "string") return record.error;
          }
          return error.message;
        }
        if (error instanceof Error) return error.message;
        return "Tente novamente em alguns instantes";
      })();

      toast({
        title: "Erro ao salvar dados",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.senhaAtual || !passwordData.novaSenha || !passwordData.confirmarSenha) {
      toast({ title: "Atenção", description: "Preencha todos os campos de senha", variant: "destructive" });
      return;
    }
    if (passwordData.novaSenha !== passwordData.confirmarSenha) {
      toast({ title: "Atenção", description: "As senhas não conferem", variant: "destructive" });
      return;
    }
    if (!token || !formData.email) return;

    try {
      setIsPasswordSubmitting(true);
      await changePassword({ 
        token, 
        email: formData.email, 
        senhaAtual: passwordData.senhaAtual, 
        novaSenha: passwordData.novaSenha 
      });
      toast({ title: "Senha alterada!", description: "Sua senha foi atualizada com sucesso." });
      setPasswordData({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
    } catch (error) {
      const message = (() => {
        if (isAxiosError(error)) {
          const payload = error.response?.data;
          if (typeof payload === "string") return payload;
          if (payload && typeof payload === "object") {
            const record = payload as Record<string, unknown>;
            if (typeof record.message === "string") return record.message;
            if (typeof record.error === "string") return record.error;
          }
          return error.message;
        }
        if (error instanceof Error) return error.message;
        return "Tente novamente em alguns instantes";
      })();

      toast({
        title: "Erro ao alterar senha",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard-cliente");
  };

  const photoUrl = getUserPhotoUrl(user ?? undefined) ?? formData.foto;
  return <div className="min-h-screen bg-white pt-20">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-6">
        {/* Título da página */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard-cliente")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Minha Conta</h1>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Foto de Perfil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Foto do Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={photoUrl || undefined} />
                  <AvatarFallback>{(formData.nome || "Cliente").slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" disabled>
                  <Camera className="h-4 w-4 mr-2" />
                  Alterar Foto
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input id="nome" value={formData.nome} onChange={e => handleInputChange("nome", e.target.value)} className={errors.nome ? "border-red-500" : ""} />
                  {errors.nome && <p className="text-sm text-red-500">{errors.nome}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input id="dataNascimento" type="date" value={formData.dataNascimento} onChange={e => handleInputChange("dataNascimento", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange("email", e.target.value)} className={errors.email ? "border-red-500" : ""} />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input id="whatsapp" value={formData.whatsapp} onChange={e => handleInputChange("whatsapp", e.target.value)} className={errors.whatsapp ? "border-red-500" : ""} inputMode="tel" />
                  {errors.whatsapp && <p className="text-sm text-red-500">{errors.whatsapp}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP *</Label>
                  <Input id="cep" value={formData.cep} onChange={e => handleInputChange("cep", e.target.value)} className={errors.cep ? "border-red-500" : ""} />
                  {errors.cep && <p className="text-sm text-red-500">{errors.cep}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço *</Label>
                  <Input id="endereco" value={formData.endereco} onChange={e => handleInputChange("endereco", e.target.value)} className={errors.endereco ? "border-red-500" : ""} />
                  {errors.endereco && <p className="text-sm text-red-500">{errors.endereco}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input id="numero" value={formData.numero} onChange={e => handleInputChange("numero", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input id="complemento" value={formData.complemento} onChange={e => handleInputChange("complemento", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input id="bairro" value={formData.bairro} onChange={e => handleInputChange("bairro", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" value={formData.cidade} onChange={e => handleInputChange("cidade", e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input id="estado" value={formData.estado} onChange={e => handleInputChange("estado", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comprovante de Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="h-5 w-5" />
                Comprovante de Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Comprovante Atual */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileImage className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">conta_luz_atual.pdf</p>
                      <p className="text-sm text-gray-500">Enviado em 15/01/2024</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Trocar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Alterar Senha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senhaAtual">Senha Atual</Label>
                  <Input 
                    id="senhaAtual" 
                    type="password" 
                    value={passwordData.senhaAtual} 
                    onChange={e => setPasswordData(prev => ({ ...prev, senhaAtual: e.target.value }))} 
                  />
                </div>
                <div className="hidden md:block" />
                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <Input 
                    id="novaSenha" 
                    type="password" 
                    value={passwordData.novaSenha} 
                    onChange={e => setPasswordData(prev => ({ ...prev, novaSenha: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                  <Input 
                    id="confirmarSenha" 
                    type="password" 
                    value={passwordData.confirmarSenha} 
                    onChange={e => setPasswordData(prev => ({ ...prev, confirmarSenha: e.target.value }))} 
                  />
                </div>
              </div>
              <div className="pt-2">
                <Button 
                  onClick={handlePasswordChange} 
                  variant="outline" 
                  disabled={isPasswordSubmitting}
                >
                  {isPasswordSubmitting ? "Alterando..." : "Atualizar Senha"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default EditarDadosPessoais;
