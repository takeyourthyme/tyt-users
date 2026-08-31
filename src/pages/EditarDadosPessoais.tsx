import React, { useEffect, useMemo, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Camera, User, MapPin, FileImage, Edit2, Lock, Upload, ExternalLink, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/AppHeader";
import Footer from "@/components/Footer";
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

  // Foto e Câmera
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comprovante de Endereço
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null);
  const comprovanteInputRef = useRef<HTMLInputElement>(null);

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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });

  // Atribui o stream ao <video> após ele ser montado no DOM
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  // Garante que a câmera seja desligada e os tracks de mídia liberados ao desmontar o componente
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          try {
            track.stop();
          } catch (e) {
            console.error("Erro ao fechar track:", e);
          }
        });
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!token || !userId) return;

    getUserById({ token, userId })
      .then((data) => {
        if (!data || typeof data !== "object" || Array.isArray(data)) return;
        const candidate = (data as Record<string, unknown>).user
          ? ((data as Record<string, unknown>).user as Record<string, unknown>)
          : (data as Record<string, unknown>);
        setUser(candidate);
      })
      .catch(() => { });
  }, [token, userId]);

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
    const userPhoto = getUserPhotoUrl(user) ?? "";

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
      foto: userPhoto,
    }));

    if (!photoFile && userPhoto) {
      setPhotoPreview(userPhoto);
    }
  }, [user, photoFile]);

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

  const fetchAddressByCEP = async (cep: string) => {
    try {
      const cleanCep = digitsOnly(cep);
      if (cleanCep.length !== 8) return;
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          endereco: data.logradouro || prev.endereco,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handlePhotoUpload = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "A foto deve estar em formato JPEG, PNG ou WebP.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A foto deve ter no máximo 5 MB.",
        variant: "destructive",
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    setPhotoFile(file);
    toast({
      title: "Foto selecionada",
      description: "Lembre-se de salvar as alterações para concluir a atualização.",
    });
  };

  const startCamera = async () => {
    stopCamera();

    if (!navigator?.mediaDevices?.getUserMedia) {
      fileInputRef.current?.click();
      return;
    }

    try {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (stream) {
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      toast({
        title: "Erro na câmera",
        description: "Não foi possível acessar a câmera diretamente. Use o botão de enviar arquivo.",
        variant: "destructive",
      });
      fileInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.error("Erro ao parar track:", e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            toast({
              title: "Erro ao capturar foto",
              description: "Tente novamente",
              variant: "destructive",
            });
            return;
          }

          const file = new File([blob], `client-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
          const previewUrl = URL.createObjectURL(file);
          setPhotoPreview(previewUrl);
          setPhotoFile(file);
          stopCamera();
          toast({
            title: "Foto capturada com sucesso!",
            description: "Clique em 'Salvar Alterações' para confirmar a nova foto de perfil.",
          });
        },
        "image/jpeg",
        0.92,
      );
    }
  };

  const handleComprovanteUpload = (file: File) => {
    setComprovanteFile(file);
    toast({
      title: "Comprovante selecionado",
      description: `Arquivo: ${file.name}. Clique em 'Salvar Alterações' para confirmar.`,
    });
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
      navigate("/entrar");
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

      if (photoFile) {
        input.append("foto", photoFile, photoFile.name);
      }

      if (comprovanteFile) {
        input.append("comprovante_end", comprovanteFile, comprovanteFile.name);
      }

      const updated = await updateClientUser({ token, userId, input });

      const updatedUser =
        updated && typeof updated === "object" && "user" in updated && (updated as Record<string, unknown>).user
          ? ((updated as Record<string, unknown>).user as Record<string, unknown>)
          : updated && typeof updated === "object" && !Array.isArray(updated)
            ? (updated as Record<string, unknown>)
            : user ?? undefined;

      const nextSession = {
        token: session?.token,
        userId: session?.userId ?? userId,
        user: updatedUser,
      };
      saveSession(nextSession);
      setUser(updatedUser ?? null);
      setPhotoFile(null);
      setComprovanteFile(null);

      toast({
        title: "Dados salvos com sucesso!",
        description: "Suas informações pessoais foram atualizadas.",
      });
      navigate("/inicio");
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
    navigate("/inicio");
  };

  const userClient = (user?.usuario_cliente as Record<string, unknown> | null) ?? (user?.cliente as Record<string, unknown> | null);
  const existingComprovanteUrl = (userClient?.comprovante_end as string | undefined) ?? (user?.comprovante_end as string | undefined);
  const displayPhotoUrl = photoPreview || getUserPhotoUrl(user ?? undefined) || formData.foto;

  return (
    <div className="min-h-screen flex flex-col bg-white pt-20">
      <AppHeader />

      <div className="flex-1 container mx-auto px-4 py-6">
        {/* Título da página */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/inicio")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-light">Minha Conta</h1>
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
                {!cameraActive ? (
                  <>
                    <Avatar className="h-32 w-32 border-2 border-primary/20 shadow-sm">
                      <AvatarImage src={displayPhotoUrl || undefined} className="object-cover object-center" />
                      <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                        {(formData.nome || "Cliente").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Enviar foto
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={startCamera}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Abrir câmera
                      </Button>

                      {photoFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            setPhotoFile(null);
                            setPhotoPreview(getUserPhotoUrl(user ?? undefined) ?? formData.foto ?? "");
                          }}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Descartar foto nova
                        </Button>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(file);
                        e.target.value = "";
                      }}
                    />
                  </>
                ) : (
                  <div className="w-full space-y-4">
                    <div className="relative bg-muted rounded-lg aspect-video max-h-80 overflow-hidden flex items-center justify-center">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover object-center"
                        style={{ transform: "scaleX(-1)" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-44 h-56 border-4 border-primary rounded-full border-dashed opacity-50"></div>
                      </div>
                    </div>

                    <div className="flex justify-center gap-3">
                      <Button
                        type="button"
                        onClick={takePhoto}
                        className="bg-[#004B2A] hover:bg-[#00381F] text-white"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Capturar foto
                      </Button>
                      <Button
                        type="button"
                        onClick={stopCamera}
                        variant="outline"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
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
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => {
                      handleInputChange("cep", e.target.value);
                      if (digitsOnly(e.target.value).length === 8) {
                        fetchAddressByCEP(e.target.value);
                      }
                    }}
                    className={errors.cep ? "border-red-500" : ""}
                  />
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
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileImage className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      {comprovanteFile ? (
                        <>
                          <p className="font-medium text-sm text-gray-800">{comprovanteFile.name}</p>
                          <p className="text-xs text-green-600 font-medium">Novo comprovante selecionado (salve para confirmar)</p>
                        </>
                      ) : existingComprovanteUrl ? (
                        <>
                          <p className="font-medium text-sm text-gray-800">Comprovante de endereço anexado</p>
                          <a
                            href={existingComprovanteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            Visualizar arquivo atual
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-sm text-gray-800">Nenhum comprovante enviado</p>
                          <p className="text-xs text-gray-500">Envie uma conta recente (luz, água, etc.)</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => comprovanteInputRef.current?.click()}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      {existingComprovanteUrl || comprovanteFile ? "Trocar" : "Enviar"}
                    </Button>

                    {comprovanteFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setComprovanteFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <input
                ref={comprovanteInputRef}
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleComprovanteUpload(file);
                  e.target.value = "";
                }}
              />
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
            <Button onClick={handleSave} className="flex-1 bg-[#004B2A] hover:bg-[#00381F] text-white" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default EditarDadosPessoais;

