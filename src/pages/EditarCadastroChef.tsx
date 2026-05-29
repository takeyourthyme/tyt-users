import { useEffect, useMemo, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputMask from "react-input-mask";
import { isAxiosError } from "axios";
import { Camera, MapPin, Upload, ArrowLeft, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import LogoText from "@/components/LogoText";
import { Lock } from "lucide-react";

import { loadSession, saveSession, changePassword } from "@/services/authService";
import { updateChefUser } from "@/services/chefService";
import { getUserById } from "@/services/userService";

// Validation schema
const toDigits = (value: string) => value.replace(/\D/g, "");

const validateCpf = (value: string) => {
  const cpf = toDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcDigit = (base: string, factor: number) => {
    let total = 0;
    for (let i = 0; i < base.length; i += 1) {
      total += Number(base[i]) * (factor - i);
    }
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const d1 = calcDigit(cpf.slice(0, 9), 10);
  const d2 = calcDigit(cpf.slice(0, 9) + String(d1), 11);
  return cpf.endsWith(`${d1}${d2}`);
};

const formatCpf = (value: string) => {
  const digits = toDigits(value).slice(0, 11);
  if (digits.length !== 11) return value;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

const formatCep = (value: string) => {
  const digits = toDigits(value).slice(0, 8);
  if (digits.length !== 8) return value;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
};

const formatWhatsapp = (value: string) => {
  const digits = toDigits(value);
  const brDigits = digits.startsWith("55") ? digits.slice(2) : digits;
  if (brDigits.length !== 11) return value;
  const ddd = brDigits.slice(0, 2);
  const part1 = brDigits.slice(2, 7);
  const part2 = brDigits.slice(7, 11);
  return `+55 (${ddd}) ${part1}-${part2}`;
};

const formatIsoToBrDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = String(date.getUTCFullYear());
  return `${day}/${month}/${year}`;
};

const parseBrDateToIso = (value: string) => {
  const [day, month, year] = value.split("/").map((v) => Number(v));
  const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  return utcDate.toISOString();
};

const getStringArray = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value.filter((item) => typeof item === "string") as string[];
};

const getObjectArrayValues = (value: unknown, key: string) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return undefined;
      const record = item as Record<string, unknown>;
      return typeof record[key] === "string" ? (record[key] as string) : undefined;
    })
    .filter((item): item is string => typeof item === "string");
};

const getActiveObjectArrayValues = (value: unknown, key: string) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return undefined;
      const record = item as Record<string, unknown>;
      if (!record.active) return undefined;
      return typeof record[key] === "string" ? (record[key] as string) : undefined;
    })
    .filter((item): item is string => typeof item === "string");
};

const sanitizeUrl = (value: string) => {
  return value.trim().replace(/^[`"' ]+|[`"' ]+$/g, "");
};

const getPhotoUrl = (user: Record<string, unknown>) => {
  const candidates = [user.foto_url, user.fotoUrl, user.photoUrl, user.foto, user.photo];
  const raw = candidates.find((value) => typeof value === "string") as string | undefined;
  if (!raw) return undefined;
  return sanitizeUrl(raw);
};

const normalizeAvailableFor = (value: string) => {
  const lower = value.toLowerCase();
  if (lower.includes("cozinha") && lower.includes("seman")) return "cozinha_semanal";
  if (lower.includes("event")) return "eventos";
  return value;
};

const normalizeLanguage = (value: string) => {
  const lower = value.toLowerCase();
  if (lower === "pt") return "br";
  if (lower === "en") return "us";
  return value;
};

const dayApiToKey: Record<string, keyof typeof defaultAvailability> = {
  segunda: "monday",
  terca: "tuesday",
  terça: "tuesday",
  quarta: "wednesday",
  quinta: "thursday",
  sexta: "friday",
  sabado: "saturday",
  sábado: "saturday",
  domingo: "sunday",
};

const mapAvailabilityFromApi = (value: unknown) => {
  const base = structuredClone(defaultAvailability) as typeof defaultAvailability;
  if (!Array.isArray(value)) return base;

  value.forEach((item) => {
    if (!item || typeof item !== "object") return;
    const record = item as Record<string, unknown>;
    const day = record.dia_semana;
    if (typeof day !== "string") return;
    const key = dayApiToKey[day.toLowerCase()];
    if (!key) return;

    const morning = Boolean(record.manha);
    const afternoon = Boolean(record.tarde);
    const evening = Boolean(record.noite);
    base[key] = { enabled: true, morning, afternoon, evening };
  });

  return base;
};

const editChefSchema = z.object({
  // Etapa A - Dados pessoais
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().refine((val) => validateCpf(val), "CPF inválido"),
  birthDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data inválida (dd/mm/aaaa)"),
  whatsapp: z.string().regex(/^\+55 \(\d{2}\) \d{5}-\d{4}$/, "WhatsApp inválido"),
  email: z.string().email("E-mail inválido"),

  // Etapa B - Localização
  cep: z.string().regex(/^\d{5}-\d{3}$/, "CEP inválido"),
  street: z.string().min(1, "Logradouro é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(2, "UF é obrigatória"),
  canTravel: z.boolean(),
  transportType: z.string().optional(),

  // Etapa C - Sobre você
  photo: z.instanceof(File).optional(),
  instagram: z.string().optional(),
  languages: z.array(z.string()).min(1, "Selecione pelo menos um idioma"),
  specialties: z.array(z.string()).min(1, "Selecione pelo menos uma especialidade"),
  education: z.string().min(1, "Campo obrigatório"),
  about: z.string().min(10, "Mínimo 10 caracteres").max(500, "Máximo 500 caracteres"),
  availability: z.record(z.object({
    enabled: z.boolean(),
    morning: z.boolean(),
    afternoon: z.boolean(),
    evening: z.boolean()
  })),
  availableFor: z.array(z.string()).min(1, "Selecione pelo menos uma opção")
}).superRefine((data, ctx) => {
  if (data.canTravel && !data.transportType) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Tipo de transporte é obrigatório",
      path: ["transportType"],
    });
  }
});

type EditChefData = z.infer<typeof editChefSchema>;

const availableLanguages = [
  { id: "br", name: "Português", flag: "🇧🇷" },
  { id: "us", name: "Inglês", flag: "🇺🇸" },
  { id: "es", name: "Espanhol", flag: "🇪🇸" },
  { id: "fr", name: "Francês", flag: "🇫🇷" },
  { id: "it", name: "Italiano", flag: "🇮🇹" },
  { id: "de", name: "Alemão", flag: "🇩🇪" },
  { id: "ja", name: "Japonês", flag: "🇯🇵" }
];

const cuisineSpecialties = [
  "Brasileira", "Italiana", "Francesa", "Japonesa", "Chinesa", "Tailandesa",
  "Indiana", "Árabe", "Mexicana", "Peruana", "Mediterrânea", "Vegetariana",
  "Vegana", "Sem Glúten", "Doces e Sobremesas", "Panificação"
];

const defaultAvailability = {
  monday: { enabled: false, morning: false, afternoon: false, evening: false },
  tuesday: { enabled: false, morning: false, afternoon: false, evening: false },
  wednesday: { enabled: false, morning: false, afternoon: false, evening: false },
  thursday: { enabled: false, morning: false, afternoon: false, evening: false },
  friday: { enabled: false, morning: false, afternoon: false, evening: false },
  saturday: { enabled: false, morning: false, afternoon: false, evening: false },
  sunday: { enabled: false, morning: false, afternoon: false, evening: false }
};

const EditarCadastroChef = () => {
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [characterCount, setCharacterCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [passwordData, setPasswordData] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const session = useMemo(() => loadSession(), []);
  const token = session?.token;
  const userId =
    session?.userId ??
    (typeof session?.user?.id === "string" || typeof session?.user?.id === "number" ? session.user.id : undefined);

  // Scroll to availability section if requested
  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo === 'disponibilidade') {
      setTimeout(() => {
        const element = document.getElementById('disponibilidade');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

  const form = useForm<EditChefData>({
    resolver: zodResolver(editChefSchema),
    defaultValues: {
      name: "",
      cpf: "",
      birthDate: "",
      whatsapp: "",
      email: "",
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      canTravel: false,
      transportType: "particular",
      photo: undefined,
      instagram: "",
      languages: ["br"],
      specialties: [],
      education: "",
      about: "",
      availability: defaultAvailability,
      availableFor: []
    }
  });

  useEffect(() => {
    if (!token || !userId) return;

    const applyUserToForm = (user: Record<string, unknown>) => {
      const chef =
        (user.usuario_chef as Record<string, unknown> | null) ??
        (user.chef as Record<string, unknown> | null) ??
        null;

      const about =
        (chef?.conte_sobre_voce as string | undefined) ??
        (user.conte_sobre_voce as string | undefined) ??
        (user.about as string | undefined) ??
        "";
      setCharacterCount(about.length);

      const photoUrl = getPhotoUrl(user);
      if (photoUrl) setPhotoPreview(photoUrl);

      const dataNascimento =
        (user.data_nascimento as string | undefined) ??
        (user.birthDate as string | undefined) ??
        (user.birth_date as string | undefined) ??
        "";

      const idiomas = (
        chef
          ? getActiveObjectArrayValues(chef.usuario_chef_idiomas, "idioma")
          : getStringArray(user.idiomas ?? user.languages)
      ).map(normalizeLanguage);

      const especialidades = chef
        ? getActiveObjectArrayValues(chef.usuario_chef_especialidades, "especialidade")
        : getStringArray(user.especialidades ?? user.specialties);

      const disponivelPara = (
        chef
          ? getActiveObjectArrayValues(chef.usuario_chef_disponivel_para, "disponivel_para")
          : getStringArray(user.disponivel_para ?? user.availableFor)
      ).map(normalizeAvailableFor);

      form.reset({
        name: ((user.nome as string | undefined) ?? (user.name as string | undefined) ?? "").trim(),
        cpf: formatCpf(String(user.cpf ?? "")),
        birthDate: dataNascimento ? formatIsoToBrDate(dataNascimento) : "",
        whatsapp: formatWhatsapp(String(user.whatsapp ?? "")),
        email: ((user.email as string | undefined) ?? "").trim(),
        cep: formatCep(String(user.cep ?? "")),
        street: ((user.endereco as string | undefined) ?? "").trim(),
        number: String(user.numero ?? ""),
        complement: ((user.complemento as string | undefined) ?? "").trim(),
        neighborhood: ((user.bairro as string | undefined) ?? "").trim(),
        city: ((user.cidade as string | undefined) ?? "").trim(),
        state: ((user.estado as string | undefined) ?? "").trim().toUpperCase(),
        canTravel: Boolean(chef?.disponivel_viajar ?? user.disponivel_viajar),
        transportType: String((chef?.tipo_transporte ?? user.tipo_transporte ?? "particular")).trim(),
        photo: undefined,
        instagram: String((chef?.instagram ?? user.instagram ?? "")).trim(),
        languages: idiomas.length ? idiomas : ["br"],
        specialties: especialidades,
        education: String((chef?.escola_formacao ?? user.escola_formacao ?? "")).trim(),
        about,
        availability: mapAvailabilityFromApi(chef?.usuario_chef_disponibilidade ?? user.disponibilidade),
        availableFor: disponivelPara,
      });
    };

    if (session?.user) applyUserToForm(session.user);

    getUserById({ token, userId })
      .then((data) => {
        const candidate =
          data && typeof data === "object" && !Array.isArray(data) && (data as Record<string, unknown>).user
            ? ((data as Record<string, unknown>).user as unknown)
            : data;
        if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
          const user = candidate as Record<string, unknown>;
          applyUserToForm(user);
          saveSession({ token, userId, user });
        }
      })
      .catch(() => { });
  }, [form, session, token, userId]);

  const fetchAddressByCEP = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${toDigits(cep)}/json/`);
      const data = await response.json();
      if (!data.erro) {
        form.setValue("street", data.logradouro || "");
        form.setValue("neighborhood", data.bairro || "");
        form.setValue("city", data.localidade || "");
        form.setValue("state", data.uf || "");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleFileUpload = (file: File) => {
    setPhotoPreview(URL.createObjectURL(file));
    form.setValue("photo", file, { shouldValidate: true });
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      toast({
        title: "Erro na câmera",
        description: "Não foi possível acessar a câmera",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) {
          toast({
            title: "Erro ao capturar foto",
            description: "Tente novamente",
            variant: "destructive",
          });
          return;
        }

        const file = new File([blob], `chef-photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        setPhotoPreview(URL.createObjectURL(file));
        form.setValue("photo", file, { shouldValidate: true });
        stopCamera();
      }, "image/jpeg", 0.92);
    }
  };

  const onSubmit = async (data: EditChefData) => {
    try {
      if (!token || !userId) {
        toast({
          title: "Sessão expirada",
          description: "Faça login novamente para atualizar seus dados",
          variant: "destructive",
        });
        navigate("/login/chef");
        return;
      }

      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("nome", data.name.trim());
      formData.append("cpf", toDigits(data.cpf));
      formData.append("email", data.email.trim());
      formData.append("whatsapp", toDigits(data.whatsapp));
      formData.append("data_nascimento", parseBrDateToIso(data.birthDate));
      formData.append("cep", toDigits(data.cep));
      formData.append("endereco", data.street.trim());
      formData.append("numero", data.number.trim());
      if (data.complement?.trim()) formData.append("complemento", data.complement.trim());
      formData.append("bairro", data.neighborhood.trim());
      formData.append("cidade", data.city.trim());
      formData.append("estado", data.state.trim().toUpperCase());
      formData.append("disponivel_viajar", String(data.canTravel));
      if (data.canTravel && data.transportType) {
        formData.append("tipo_transporte", data.transportType);
      }

      if (data.instagram?.trim()) formData.append("instagram", data.instagram.trim());
      formData.append("escola_formacao", data.education.trim());
      formData.append("conte_sobre_voce", data.about.trim());

      data.languages.forEach((lang) => formData.append("idiomas[]", lang));
      data.specialties.forEach((specialty) => formData.append("especialidades[]", specialty));
      data.availableFor.forEach((value) => formData.append("disponivel_para[]", value));

      const dayKeyToApi: Record<string, string> = {
        monday: "segunda",
        tuesday: "terca",
        wednesday: "quarta",
        thursday: "quinta",
        friday: "sexta",
        saturday: "sabado",
        sunday: "domingo",
      };

      let availabilityIndex = 0;
      Object.entries(data.availability).forEach(([dayKey, dayValue]) => {
        if (!dayValue.enabled) return;

        formData.append(
          `disponibilidade[${availabilityIndex}][dia_semana]`,
          dayKeyToApi[dayKey] ?? dayKey,
        );
        formData.append(`disponibilidade[${availabilityIndex}][manha]`, String(dayValue.morning));
        formData.append(`disponibilidade[${availabilityIndex}][tarde]`, String(dayValue.afternoon));
        formData.append(`disponibilidade[${availabilityIndex}][noite]`, String(dayValue.evening));
        availabilityIndex += 1;
      });

      if (data.photo) {
        formData.append("foto", data.photo, data.photo.name);
      }

      await updateChefUser({ token, userId, input: formData });

      getUserById({ token, userId })
        .then((fresh) => {
          if (fresh && typeof fresh === "object" && !Array.isArray(fresh)) {
            saveSession({ token, userId, user: fresh as Record<string, unknown> });
          }
        })
        .catch(() => { });

      toast({
        title: "Cadastro atualizado!",
        description: "Suas informações foram atualizadas com sucesso"
      });
      navigate("/dashboard-chef");
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
        title: "Erro ao atualizar",
        description: message,
        variant: "destructive"
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
    if (!token || !form.getValues("email")) return;

    try {
      setIsPasswordSubmitting(true);
      await changePassword({ 
        token, 
        email: form.getValues("email"), 
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-tyt-yellow-500 border-b border-tyt-yellow-600 px-4 py-4 relative">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard-chef")}
            className="text-gray-900 hover:bg-tyt-yellow-600/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <LogoText variant="dark" className="absolute left-1/2 transform -translate-x-1/2" />

          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 px-4 py-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-tyt-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="w-8 h-8 text-gray-900" />
              </div>
              <CardTitle className="text-h2">Alterar Cadastro</CardTitle>
              <CardDescription>
                Atualize suas informações de chef
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Dados Pessoais */}
                  <div className="space-y-4">
                    <h3 className="text-h3 font-semibold text-gray-800 border-b pb-2">Dados Pessoais</h3>

                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="cpf" render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <InputMask mask="999.999.999-99" value={field.value} onChange={field.onChange}>
                            {(inputProps: ComponentPropsWithoutRef<"input">) => <Input {...inputProps} placeholder="000.000.000-00" inputMode="numeric" />}
                          </InputMask>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="birthDate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de nascimento</FormLabel>
                        <FormControl>
                          <InputMask mask="99/99/9999" value={field.value} onChange={field.onChange}>
                            {(inputProps: ComponentPropsWithoutRef<"input">) => <Input {...inputProps} placeholder="dd/mm/aaaa" />}
                          </InputMask>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="whatsapp" render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <InputMask mask="+55 (99) 99999-9999" value={field.value} onChange={field.onChange}>
                            {(inputProps: ComponentPropsWithoutRef<"input">) => <Input {...inputProps} placeholder="+55 (11) 99999-9999" inputMode="tel" />}
                          </InputMask>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="seu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* Localização */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <MapPin className="w-5 h-5 text-tyt-yellow-600" />
                      <h3 className="text-h3 font-semibold text-gray-800">Localização</h3>
                    </div>

                    <FormField control={form.control} name="cep" render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <InputMask mask="99999-999" value={field.value} onChange={(e) => {
                            field.onChange(e);
                            if (e.target.value.length === 9) {
                              fetchAddressByCEP(e.target.value);
                            }
                          }}>
                            {(inputProps: ComponentPropsWithoutRef<"input">) => <Input {...inputProps} placeholder="00000-000" />}
                          </InputMask>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-3">
                        <FormField control={form.control} name="street" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da rua" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <div className="col-span-1">
                        <FormField control={form.control} name="number" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nº</FormLabel>
                            <FormControl>
                              <Input placeholder="123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <FormField control={form.control} name="complement" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Apto, bloco, etc" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="neighborhood" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-3">
                        <FormField control={form.control} name="city" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da cidade" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <div className="col-span-1">
                        <FormField control={form.control} name="state" render={({ field }) => (
                          <FormItem>
                            <FormLabel>UF</FormLabel>
                            <FormControl>
                              <Input placeholder="SP" maxLength={2} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <FormField control={form.control} name="canTravel" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Tenho disponibilidade para me deslocar</FormLabel>
                        </div>
                      </FormItem>
                    )} />

                    {form.watch("canTravel") && (
                      <FormField control={form.control} name="transportType" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de transporte</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="particular">Particular</SelectItem>
                              <SelectItem value="publico">Público</SelectItem>
                              <SelectItem value="aplicativo">Aplicativo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                  </div>

                  {/* Sobre Você */}
                  <div className="space-y-4">
                    <h3 className="text-h3 font-semibold text-gray-800 border-b pb-2">Sobre Você</h3>

                    {/* Photo Upload */}
                    <div className="space-y-3">
                      <Label>Foto de perfil</Label>
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden">
                          {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </Button>
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file);
                            }}
                          />

                          {!cameraActive ? (
                            <Button type="button" variant="outline" size="sm" onClick={startCamera}>
                              <Camera className="w-4 h-4 mr-2" />
                              Câmera
                            </Button>
                          ) : (
                            <Button type="button" variant="outline" size="sm" onClick={takePhoto}>
                              Capturar
                            </Button>
                          )}
                        </div>

                        {cameraActive && (
                          <div className="relative">
                            <video ref={videoRef} autoPlay className="rounded-lg" style={{ width: '320px' }} />
                            <canvas ref={canvasRef} className="hidden" />
                          </div>
                        )}
                      </div>
                    </div>

                    <FormField control={form.control} name="instagram" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="@seuinstagram" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="languages" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idiomas que domina</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {availableLanguages.map((lang) => (
                            <div key={lang.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={lang.id}
                                checked={field.value.includes(lang.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, lang.id]);
                                  } else {
                                    field.onChange(field.value.filter((l: string) => l !== lang.id));
                                  }
                                }}
                              />
                              <Label htmlFor={lang.id} className="text-sm">
                                {lang.flag} {lang.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="specialties" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especialidades</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {cuisineSpecialties.map((specialty) => (
                            <div key={specialty} className="flex items-center space-x-2">
                              <Checkbox
                                id={specialty}
                                checked={field.value.includes(specialty)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, specialty]);
                                  } else {
                                    field.onChange(field.value.filter((s: string) => s !== specialty));
                                  }
                                }}
                              />
                              <Label htmlFor={specialty} className="text-sm">
                                {specialty}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="education" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Escola de Formação / Origem de conhecimento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Le Cordon Bleu, autodidata, família..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="about" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nos fale um pouco sobre você, sua experiência e especialidades</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Conte sua história, experiências e o que te inspira na cozinha..."
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              setCharacterCount(e.target.value.length);
                            }}
                            maxLength={500}
                            rows={4}
                          />
                        </FormControl>
                        <div className="text-sm text-gray-500 text-right">
                          {characterCount}/500 caracteres
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Configurar Disponibilidade */}
                    <FormField control={form.control} name="availability" render={({ field }) => (
                      <FormItem id="disponibilidade">
                        <FormLabel>Configurar Disponibilidade</FormLabel>
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="text-left p-2 text-sm font-medium">Dia</th>
                                <th className="text-center p-2 text-sm font-medium">Manhã</th>
                                <th className="text-center p-2 text-sm font-medium">Tarde</th>
                                <th className="text-center p-2 text-sm font-medium">Noite</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[
                                { key: 'monday', label: 'Segunda-feira' },
                                { key: 'tuesday', label: 'Terça-feira' },
                                { key: 'wednesday', label: 'Quarta-feira' },
                                { key: 'thursday', label: 'Quinta-feira' },
                                { key: 'friday', label: 'Sexta-feira' },
                                { key: 'saturday', label: 'Sábado' },
                                { key: 'sunday', label: 'Domingo' }
                              ].map(({ key, label }) => (
                                <tr key={key} className="border-t">
                                  <td className="p-2">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={key}
                                        checked={field.value[key]?.enabled || false}
                                        onCheckedChange={(checked) => {
                                          const newValue = { ...field.value };
                                          if (checked) {
                                            newValue[key] = {
                                              enabled: true,
                                              morning: true,
                                              afternoon: true,
                                              evening: true
                                            };
                                          } else {
                                            newValue[key] = {
                                              enabled: false,
                                              morning: false,
                                              afternoon: false,
                                              evening: false
                                            };
                                          }
                                          field.onChange(newValue);
                                        }}
                                      />
                                      <Label htmlFor={key} className="text-sm cursor-pointer">
                                        {label}
                                      </Label>
                                    </div>
                                  </td>
                                  <td className="text-center p-2">
                                    <Checkbox
                                      checked={field.value[key]?.morning || false}
                                      disabled={!field.value[key]?.enabled}
                                      onCheckedChange={(checked) => {
                                        const newValue = { ...field.value };
                                        newValue[key] = {
                                          ...newValue[key],
                                          morning: !!checked
                                        };
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </td>
                                  <td className="text-center p-2">
                                    <Checkbox
                                      checked={field.value[key]?.afternoon || false}
                                      disabled={!field.value[key]?.enabled}
                                      onCheckedChange={(checked) => {
                                        const newValue = { ...field.value };
                                        newValue[key] = {
                                          ...newValue[key],
                                          afternoon: !!checked
                                        };
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </td>
                                  <td className="text-center p-2">
                                    <Checkbox
                                      checked={field.value[key]?.evening || false}
                                      disabled={!field.value[key]?.enabled}
                                      onCheckedChange={(checked) => {
                                        const newValue = { ...field.value };
                                        newValue[key] = {
                                          ...newValue[key],
                                          evening: !!checked
                                        };
                                        field.onChange(newValue);
                                      }}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Disponível para */}
                    <FormField control={form.control} name="availableFor" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disponível para</FormLabel>
                        <div className="space-y-2">
                          {[
                            { label: "Cozinha Semanal", value: "cozinha_semanal" },
                            { label: "Eventos", value: "eventos" }
                          ].map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`available-${option.value}`}
                                checked={field.value.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, option.value]);
                                  } else {
                                    field.onChange(field.value.filter((v: string) => v !== option.value));
                                  }
                                }}
                              />
                              <Label htmlFor={`available-${option.value}`} className="text-sm cursor-pointer">
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-tyt-yellow-500 hover:bg-tyt-yellow-600 text-gray-900"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card className="mt-6">
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
                  type="button"
                  onClick={handlePasswordChange} 
                  variant="outline" 
                  disabled={isPasswordSubmitting}
                >
                  {isPasswordSubmitting ? "Alterando..." : "Atualizar Senha"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EditarCadastroChef;
