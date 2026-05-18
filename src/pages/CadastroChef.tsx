import { useState, useRef, type ChangeEvent, type ComponentPropsWithoutRef, type FocusEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import InputMask from "react-input-mask";
import { Camera, MapPin, ChefHat, Upload, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import LogoText from "@/components/LogoText";
import { createChefUser } from "@/services/chefService";

// Validation schemas
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

const stepASchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().refine((val) => validateCpf(val), "CPF inválido"),
  birthDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data inválida (dd/mm/aaaa)"),
  whatsapp: z.string().regex(/^\+55 \(\d{2}\) \d{5}-\d{4}$/, "WhatsApp inválido"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres")
});
const stepBSchema = z.object({
  cep: z.string().regex(/^\d{5}-\d{3}$/, "CEP inválido"),
  street: z.string().min(1, "Logradouro é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(2, "UF é obrigatória"),
  canTravel: z.boolean(),
  transportType: z.string().min(1, "Tipo de transporte é obrigatório")
});
const stepCSchema = z.object({
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
  availableFor: z.array(z.string()).min(1, "Selecione pelo menos uma opção"),
  acceptTerms: z.boolean().refine((val) => val === true, "Você deve aceitar os termos")
}).superRefine((data, ctx) => {
  const enabledDays = Object.entries(data.availability).filter(([, value]) => value.enabled);
  if (enabledDays.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Selecione pelo menos um dia de disponibilidade",
      path: ["availability"],
    });
    return;
  }

  const invalidDay = enabledDays.find(
    ([, value]) => !value.morning && !value.afternoon && !value.evening,
  );
  if (invalidDay) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Selecione pelo menos um período (manhã/tarde/noite) nos dias habilitados",
      path: ["availability"],
    });
  }
});
type StepAData = z.infer<typeof stepASchema>;
type StepBData = z.infer<typeof stepBSchema>;
type StepCData = z.infer<typeof stepCSchema>;
const availableLanguages = [{
  id: "br",
  name: "Português",
  flag: "🇧🇷"
}, {
  id: "us",
  name: "Inglês",
  flag: "🇺🇸"
}, {
  id: "es",
  name: "Espanhol",
  flag: "🇪🇸"
}, {
  id: "fr",
  name: "Francês",
  flag: "🇫🇷"
}, {
  id: "it",
  name: "Italiano",
  flag: "🇮🇹"
}, {
  id: "de",
  name: "Alemão",
  flag: "🇩🇪"
}, {
  id: "ja",
  name: "Japonês",
  flag: "🇯🇵"
}];
const cuisineSpecialties = ["Brasileira", "Italiana", "Francesa", "Japonesa", "Chinesa", "Tailandesa", "Indiana", "Árabe", "Mexicana", "Peruana", "Mediterrânea", "Vegetariana", "Vegana", "Sem Glúten", "Doces e Sobremesas", "Panificação"];
const CadastroChef = () => {
  const [currentStep, setCurrentStep] = useState<"A" | "B" | "C">("A");
  const [stepAData, setStepAData] = useState<StepAData | null>(null);
  const [stepBData, setStepBData] = useState<StepBData | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [characterCount, setCharacterCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastCepLookupRef = useRef<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const formA = useForm<StepAData>({
    resolver: zodResolver(stepASchema),
    defaultValues: {
      name: "",
      cpf: "",
      birthDate: "",
      whatsapp: "",
      email: "",
      password: ""
    }
  });
  const formB = useForm<StepBData>({
    resolver: zodResolver(stepBSchema),
    defaultValues: {
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      canTravel: false,
      transportType: ""
    }
  });
  const formC = useForm<StepCData>({
    resolver: zodResolver(stepCSchema),
    defaultValues: {
      photo: undefined,
      instagram: "",
      languages: ["br"],
      // Portuguese by default
      specialties: [],
      education: "",
      about: "",
      availability: {
        monday: { enabled: false, morning: false, afternoon: false, evening: false },
        tuesday: { enabled: false, morning: false, afternoon: false, evening: false },
        wednesday: { enabled: false, morning: false, afternoon: false, evening: false },
        thursday: { enabled: false, morning: false, afternoon: false, evening: false },
        friday: { enabled: false, morning: false, afternoon: false, evening: false },
        saturday: { enabled: false, morning: false, afternoon: false, evening: false },
        sunday: { enabled: false, morning: false, afternoon: false, evening: false }
      },
      availableFor: [],
      acceptTerms: false
    }
  });
  const onSubmitStepA = async (data: StepAData) => {
    setStepAData(data);
    setCurrentStep("B");
    toast({
      title: "Dados salvos",
      description: "Agora vamos cadastrar sua localização"
    });
  };
  const fetchAddressByCEP = async (cep: string) => {
    try {
      const sanitizedCep = cep.replace(/\D/g, "");
      const response = await fetch(`https://viacep.com.br/ws/${sanitizedCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        formB.setValue("street", data.logradouro || "");
        formB.setValue("neighborhood", data.bairro || "");
        formB.setValue("city", data.localidade || "");
        formB.setValue("state", data.uf || "");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };
  const onSubmitStepB = async (data: StepBData) => {
    setStepBData(data);
    setCurrentStep("C");
    toast({
      title: "Localização salva",
      description: "Agora vamos conhecer você melhor"
    });
  };
  const handleFileUpload = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    formC.setValue("photo", file, { shouldValidate: true });
  };
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user"
        }
      });
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
        const previewUrl = URL.createObjectURL(file);
        setPhotoPreview(previewUrl);
        formC.setValue("photo", file, { shouldValidate: true });
        stopCamera();
      }, "image/jpeg", 0.92);
    }
  };

  const onlyDigits = (value: string) => value.replace(/\D/g, "");

  const parseBirthDateToISOString = (value: string) => {
    const [day, month, year] = value.split("/").map((v) => Number(v));
    const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    return utcDate.toISOString();
  };

  const onSubmitStepC = async (data: StepCData) => {
    if (!stepAData || !stepBData) {
      toast({
        title: "Cadastro incompleto",
        description: "Preencha as etapas anteriores antes de finalizar",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("nome", stepAData.name.trim());
      formData.append("cpf", onlyDigits(stepAData.cpf));
      formData.append("email", stepAData.email.trim());
      formData.append("senha", stepAData.password);
      formData.append("whatsapp", onlyDigits(stepAData.whatsapp));
      formData.append("data_nascimento", parseBirthDateToISOString(stepAData.birthDate));
      formData.append("cep", onlyDigits(stepBData.cep));
      formData.append("endereco", stepBData.street.trim());
      formData.append("numero", stepBData.number.trim());
      if (stepBData.complement?.trim()) formData.append("complemento", stepBData.complement.trim());
      formData.append("bairro", stepBData.neighborhood.trim());
      formData.append("cidade", stepBData.city.trim());
      formData.append("estado", stepBData.state.trim().toUpperCase());
      formData.append("disponivel_viajar", String(stepBData.canTravel));
      formData.append("tipo_transporte", stepBData.transportType);

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

      await createChefUser(formData);

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Bem-vindo ao time TYT"
      });
      navigate("/cadastro-chef-sucesso");
    } catch (error) {
      const apiMessage = (() => {
        if (isAxiosError(error)) {
          const data = error.response?.data;
          if (typeof data === "string") return data;
          if (data && typeof data === "object") {
            const record = data as Record<string, unknown>;
            const message = record.message;
            const err = record.error;
            if (typeof message === "string") return message;
            if (typeof err === "string") return err;
          }
          return error.message;
        }

        if (error instanceof Error) return error.message;
        return "Tente novamente em alguns instantes";
      })();

      toast({
        title: "Erro ao criar conta",
        description: String(apiMessage),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const progressValue = currentStep === "A" ? 33 : currentStep === "B" ? 67 : 100;
  return <div className="min-h-screen flex flex-col">
    {/* Header with yellow background for chef */}
    <header className="bg-tyt-yellow-500 border-b border-tyt-yellow-600 px-4 py-4 relative">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-gray-900 hover:bg-tyt-yellow-600/20">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <LogoText variant="dark" className="absolute left-1/2 transform -translate-x-1/2" />

        <div className="w-20" />
      </div>
    </header>

    <main className="flex-1 px-4 py-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span className={currentStep === "A" ? "text-tyt-yellow-700 font-medium" : ""}>
              1. Dados pessoais
            </span>
            <span className={currentStep === "B" ? "text-tyt-yellow-700 font-medium" : ""}>
              2. Localização
            </span>
            <span className={currentStep === "C" ? "text-tyt-yellow-700 font-medium" : ""}>
              3. Sobre você
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        {/* Step A - Dados Pessoais */}
        {currentStep === "A" && <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-tyt-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-8 h-8 text-gray-900" />
            </div>
            <CardTitle className="text-h2">Seus dados pessoais</CardTitle>
            <CardDescription>
              Preencha seus dados para se cadastrar como chef
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...formA}>
              <form onSubmit={formA.handleSubmit(onSubmitStepA)} className="space-y-4">
                <FormField control={formA.control} name="name" render={({
                  field
                }) => <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

                <FormField control={formA.control} name="cpf" render={({
                  field
                }) => <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <InputMask mask="999.999.999-99" value={field.value} onChange={field.onChange}>
                        {(inputProps: ComponentPropsWithoutRef<"input">) => <Input {...inputProps} placeholder="000.000.000-00" inputMode="numeric" />}
                      </InputMask>
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

                <FormField control={formA.control} name="birthDate" render={({
                  field
                }) => <FormItem>
                    <FormLabel>Data de nascimento</FormLabel>
                    <FormControl>
                      <InputMask mask="99/99/9999" value={field.value} onChange={field.onChange}>
                        {(inputProps: ComponentPropsWithoutRef<"input">) => <Input {...inputProps} placeholder="dd/mm/aaaa" />}
                      </InputMask>
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

                <FormField control={formA.control} name="whatsapp" render={({
                  field
                }) => <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl>
                      <InputMask mask="+55 (99) 99999-9999" value={field.value} onChange={field.onChange}>
                        {(inputProps: ComponentPropsWithoutRef<"input">) => <Input {...inputProps} placeholder="+55 (11) 99999-9999" inputMode="tel" />}
                      </InputMask>
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

                <FormField control={formA.control} name="email" render={({
                  field
                }) => <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

                <FormField control={formA.control} name="password" render={({
                  field
                }) => <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Crie uma senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

                <Button type="submit" className="w-full bg-tyt-yellow-500 hover:bg-tyt-yellow-600 text-gray-900" size="lg">
                  Continuar
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>}

        {/* Step B - Localização */}
        {currentStep === "B" && <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-h2">Sua localização</CardTitle>
            <CardDescription>
              Informe onde você atende
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...formB}>
              <form onSubmit={formB.handleSubmit(onSubmitStepB)} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-tyt-yellow-600" />
                  <h3 className="text-h3">Endereço</h3>
                </div>

                <FormField control={formB.control} name="cep" render={({
                  field
                }) => <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <InputMask mask="99999-999" value={field.value} onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        field.onChange(e);
                        const cepDigits = e.target.value.replace(/\D/g, "");
                        if (cepDigits.length === 8 && lastCepLookupRef.current !== cepDigits) {
                          lastCepLookupRef.current = cepDigits;
                          fetchAddressByCEP(e.target.value);
                        }
                      }} onBlur={(e: FocusEvent<HTMLInputElement>) => {
                        field.onBlur();
                        const cepDigits = e.target.value.replace(/\D/g, "");
                        if (cepDigits.length === 8 && lastCepLookupRef.current !== cepDigits) {
                          lastCepLookupRef.current = cepDigits;
                          fetchAddressByCEP(e.target.value);
                        }
                      }}>
                        {(inputProps: ComponentPropsWithoutRef<"input">) => <Input {...inputProps} placeholder="00000-000" />}
                      </InputMask>
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-3">
                    <FormField control={formB.control} name="street" render={({
                      field
                    }) => <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da rua" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  </div>
                  <FormField control={formB.control} name="number" render={({
                    field
                  }) => <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                </div>

                <FormField control={formB.control} name="complement" render={({
                  field
                }) => <FormItem>
                    <FormLabel>Complemento (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Apto, bloco, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={formB.control} name="neighborhood" render={({
                    field
                  }) => <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                  <FormField control={formB.control} name="city" render={({
                    field
                  }) => <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
                </div>

                <FormField control={formB.control} name="state" render={({
                  field
                }) => <FormItem>
                    <FormLabel>UF</FormLabel>
                    <FormControl>
                      <Input placeholder="SP" maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-h3">Logística</h3>

                  <FormField control={formB.control} name="canTravel" render={({
                    field
                  }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="text-sm">
                        Disponível para viajar
                      </FormLabel>
                    </FormItem>} />

                  <FormField control={formB.control} name="transportType" render={({
                    field
                  }) => <FormItem>
                      <FormLabel>Tipo de transporte</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione seu tipo de transporte" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="particular">Particular</SelectItem>
                          <SelectItem value="publico">Público</SelectItem>
                          <SelectItem value="aplicativo">Aplicativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>} />
                </div>

                <Button type="submit" className="w-full bg-tyt-yellow-500 hover:bg-tyt-yellow-600 text-gray-900" size="lg">
                  Continuar
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>}

        {/* Step C - Sobre você */}
        {currentStep === "C" && <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-h2">Sobre você</CardTitle>
            <CardDescription>
              Nos conte mais sobre sua experiência
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...formC}>
              <form onSubmit={formC.handleSubmit(onSubmitStepC)} className="space-y-6">
                <FormField
                  control={formC.control}
                  name="photo"
                  render={() => (
                    <FormItem>
                      <FormLabel>Foto profissional</FormLabel>
                      {!photoPreview ? (
                        <div className="space-y-4">
                          <div className="flex gap-4">
                            <Button type="button" variant="outline" onClick={startCamera} className="flex-1">
                              <Camera className="w-4 h-4 mr-2" />
                              Tirar foto
                            </Button>

                            <label className="flex-1">
                              <Button type="button" variant="outline" className="w-full" asChild>
                                <div>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Enviar arquivo
                                </div>
                              </Button>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(file);
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>

                          {cameraActive && (
                            <div className="space-y-4">
                              <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
                              <div className="flex gap-4">
                                <Button
                                  onClick={takePhoto}
                                  className="flex-1 bg-tyt-yellow-500 hover:bg-tyt-yellow-600 text-gray-900"
                                >
                                  Capturar
                                </Button>
                                <Button onClick={stopCamera} variant="outline" className="flex-1">
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <img
                            src={photoPreview}
                            alt="Foto do chef"
                            className="w-32 h-32 rounded-full object-cover mx-auto"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setPhotoPreview("");
                              formC.setValue("photo", undefined, { shouldValidate: true });
                            }}
                            className="w-full"
                          >
                            Alterar foto
                          </Button>
                        </div>
                      )}
                      <canvas
                        ref={canvasRef}
                        style={{
                          display: "none",
                        }}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField control={formC.control} name="instagram" render={({
                  field
                }) => <FormItem>
                    <FormLabel>Instagram (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="@seuusuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

                <FormField control={formC.control} name="languages" render={({
                  field
                }) => <FormItem>
                    <FormLabel>Idiomas que fala</FormLabel>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableLanguages.map(lang => <div key={lang.id} className="flex items-center space-x-2">
                        <Checkbox id={lang.id} checked={field.value.includes(lang.id)} onCheckedChange={checked => {
                          if (checked) {
                            field.onChange([...field.value, lang.id]);
                          } else {
                            field.onChange(field.value.filter((id: string) => id !== lang.id));
                          }
                        }} />
                        <Label htmlFor={lang.id} className="text-sm">
                          <span className="mr-2">{lang.flag}</span>
                          {lang.name}
                        </Label>
                      </div>)}
                    </div>
                    <FormMessage />
                  </FormItem>} />

                <FormField control={formC.control} name="specialties" render={({
                  field
                }) => <FormItem>
                    <FormLabel>Especialidades</FormLabel>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {cuisineSpecialties.map(specialty => <div key={specialty} className="flex items-center space-x-2">
                        <Checkbox id={specialty} checked={field.value.includes(specialty)} onCheckedChange={checked => {
                          if (checked) {
                            field.onChange([...field.value, specialty]);
                          } else {
                            field.onChange(field.value.filter((s: string) => s !== specialty));
                          }
                        }} />
                        <Label htmlFor={specialty} className="text-sm">
                          {specialty}
                        </Label>
                      </div>)}
                    </div>
                    <FormMessage />
                  </FormItem>} />

                <FormField control={formC.control} name="education" render={({
                  field
                }) => <FormItem>
                    <FormLabel>Escola de Formação / Origem de conhecimento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Le Cordon Bleu, autodidata, família..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

                <FormField control={formC.control} name="about" render={({
                  field
                }) => <FormItem>
                    <FormLabel>Nos fale um pouco sobre você, sua experiência e especialidades</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Conte sua história, experiências e o que te inspira na cozinha..." {...field} onChange={e => {
                        field.onChange(e);
                        setCharacterCount(e.target.value.length);
                      }} maxLength={500} rows={4} />
                    </FormControl>
                    <div className="text-sm text-gray-500 text-right">
                      {characterCount}/500 caracteres
                    </div>
                    <FormMessage />
                  </FormItem>} />

                {/* Configurar Disponibilidade */}
                <FormField control={formC.control} name="availability" render={({ field }) => (
                  <FormItem>
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
                <FormField control={formC.control} name="availableFor" render={({ field }) => (
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

                {/* Aceite dos termos */}
                <FormField control={formC.control} name="acceptTerms" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm cursor-pointer font-normal">
                        Li e aceito os{' '}
                        <a href="/termos-de-uso" target="_blank" className="text-blue-600 hover:underline">
                          termos de uso
                        </a>
                        {' '}e o{' '}
                        <a href="/contrato-prestacao-servicos" target="_blank" className="text-blue-600 hover:underline">
                          contrato de prestação de serviços
                        </a>
                        {' '}de cozinha do TYT
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )} />

                <Button type="submit" className="w-full bg-tyt-yellow-500 hover:bg-tyt-yellow-600 text-gray-900" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Enviando..." : "Finalizar cadastro"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>}
      </div>
    </main>
  </div>;
};
export default CadastroChef;
