import { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputMask from "react-input-mask";
import { Camera, MapPin, Check, MessageCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Validation schemas
const stepASchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  birthDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Data inválida (dd/mm/aaaa)"),
  email: z.string().email("E-mail inválido"),
  whatsapp: z.string().regex(/^\+55 \(\d{2}\) \d{5}-\d{4}$/, "WhatsApp inválido"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido"),
});

const stepBSchema = z.object({
  cep: z.string().regex(/^\d{5}-\d{3}$/, "CEP inválido"),
  street: z.string().min(1, "Logradouro é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(2, "UF é obrigatória"),
});

const stepCSchema = z.object({
  photo: z.string().optional(),
  addressProof: z.string().optional(),
});

type StepAData = z.infer<typeof stepASchema>;
type StepBData = z.infer<typeof stepBSchema>;
type StepCData = z.infer<typeof stepCSchema>;

const Cadastro = () => {
  const [currentStep, setCurrentStep] = useState<"A" | "B" | "C">("A");
  const [show2FA, setShow2FA] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [validatingOTP, setValidatingOTP] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [stepAData, setStepAData] = useState<StepAData | null>(null);
  const [stepBData, setStepBData] = useState<StepBData | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [addressProofPreview, setAddressProofPreview] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [showMissingFilesAlert, setShowMissingFilesAlert] = useState(false);
  const [missingFiles, setMissingFiles] = useState<string[]>([]);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const formA = useForm<StepAData>({
    resolver: zodResolver(stepASchema),
    defaultValues: {
      name: "",
      birthDate: "",
      email: "",
      whatsapp: "",
      cpf: "",
    },
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
    },
  });

  const formC = useForm<StepCData>({
    resolver: zodResolver(stepCSchema),
    defaultValues: {
      photo: "",
      addressProof: "",
    },
  });

  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSubmitStepA = async (data: StepAData) => {
    setStepAData(data);
    setShow2FA(true);
    startResendTimer();
    toast({
      title: "Código enviado",
      description: "Enviamos um código de verificação para seu WhatsApp",
    });
  };

  const validateOTP = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Verifique o código de 6 dígitos",
        variant: "destructive",
      });
      return;
    }

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

    setShow2FA(false);
    setCurrentStep("B");
    setValidatingOTP(false);
    setValidationProgress(0);
    
    toast({
      title: "Verificação concluída",
      description: "Agora vamos cadastrar seu endereço",
    });
  };

  const fetchAddressByCEP = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep.replace("-", "")}/json/`);
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
      title: "Endereço salvo",
      description: "Agora vamos anexar seus documentos",
    });
  };

  const handleFileUpload = (file: File, type: "photo" | "addressProof") => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === "photo") {
        setPhotoPreview(result);
        formC.setValue("photo", result);
      } else {
        setAddressProofPreview(result);
        formC.setValue("addressProof", result);
      }
    };
    reader.readAsDataURL(file);
  };

  const onSubmitStepC = async (data: StepCData) => {
    setAttemptedSubmit(true);
    
    try {
      // Simulate account creation with all data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Conta criada! Vamos começar.",
        description: "Bem-vindo ao Take Your Thyme",
      });
      
      navigate("/dashboard-cliente");
    } catch (error) {
      toast({
        title: "Erro ao criar conta",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    }
  };

  const onInvalidStepC = (errors: any) => {
    // No validation errors needed since fields are optional
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      toast({
        title: "Erro na câmera",
        description: "Não foi possível acessar a câmera",
        variant: "destructive",
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
      
      const photoDataUrl = canvas.toDataURL("image/jpeg");
      setPhotoPreview(photoDataUrl);
      formC.setValue("photo", photoDataUrl);
      stopCamera();
    }
  };

  const progressValue = currentStep === "A" ? 33 : currentStep === "B" ? 67 : 100;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span className={currentStep === "A" ? "text-primary font-medium" : ""}>
                1. Dados pessoais
              </span>
              <span className={currentStep === "B" ? "text-primary font-medium" : ""}>
                2. Endereço
              </span>
              <span className={currentStep === "C" ? "text-primary font-medium" : ""}>
                3. Anexos
              </span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          {/* Step A - Dados Pessoais */}
          {currentStep === "A" && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-h2">Seus dados pessoais</CardTitle>
                <CardDescription>
                  Preencha seus dados para criar sua conta
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Form {...formA}>
                  <form onSubmit={formA.handleSubmit(onSubmitStepA)} className="space-y-4">
                    <FormField
                      control={formA.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formA.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de nascimento</FormLabel>
                          <FormControl>
                            <InputMask
                              mask="99/99/9999"
                              value={field.value}
                              onChange={field.onChange}
                            >
                              {(inputProps: any) => (
                                <Input {...inputProps} placeholder="dd/mm/aaaa" />
                              )}
                            </InputMask>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formA.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formA.control}
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp</FormLabel>
                          <FormControl>
                            <InputMask
                              mask="+55 (99) 99999-9999"
                              value={field.value}
                              onChange={field.onChange}
                            >
                              {(inputProps: any) => (
                                <Input {...inputProps} placeholder="+55 (11) 99999-9999" inputMode="tel" />
                              )}
                            </InputMask>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formA.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <InputMask
                              mask="999.999.999-99"
                              value={field.value}
                              onChange={field.onChange}
                            >
                              {(inputProps: any) => (
                                <Input {...inputProps} placeholder="000.000.000-00" inputMode="numeric" />
                              )}
                            </InputMask>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" size="lg">
                      Continuar
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Step B - Endereço */}
          {currentStep === "B" && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-h2">Seu endereço</CardTitle>
                <CardDescription>
                  Informe seu endereço completo
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Form {...formB}>
                  <form onSubmit={formB.handleSubmit(onSubmitStepB)} className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 text-primary" />
                      <h3 className="text-h3">Informações do endereço</h3>
                    </div>

                    <FormField
                      control={formB.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <InputMask
                              mask="99999-999"
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e);
                                if (e.target.value.length === 9) {
                                  fetchAddressByCEP(e.target.value);
                                }
                              }}
                            >
                              {(inputProps: any) => (
                                <Input {...inputProps} placeholder="00000-000" />
                              )}
                            </InputMask>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formB.control}
                      name="street"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logradouro</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da rua" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formB.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input placeholder="123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={formB.control}
                      name="complement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Apto, bloco, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={formB.control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do bairro" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={formB.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da cidade" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={formB.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>UF</FormLabel>
                          <FormControl>
                            <Input placeholder="SP" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        size="lg"
                        onClick={() => setCurrentStep("A")}
                      >
                        Voltar
                      </Button>
                      <Button type="submit" className="flex-1" size="lg">
                        Avançar
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Step C - Anexos */}
          {currentStep === "C" && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-h2">Anexos</CardTitle>
                <CardDescription>
                  Envie sua foto e comprovante de endereço
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Form {...formC}>
                  <form onSubmit={formC.handleSubmit(onSubmitStepC, onInvalidStepC)} className="space-y-6">
                    {/* Foto Section */}
                    <div className="space-y-4">
                      <h3 className="text-h3 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-primary" />
                        Sua foto
                      </h3>
                      
                      <div className={`relative bg-muted rounded-lg aspect-video overflow-hidden ${attemptedSubmit && !photoPreview ? 'border-2 border-destructive' : ''}`}>
                        {!cameraActive && !photoPreview && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                              <Button type="button" onClick={startCamera} variant="outline" size="lg">
                                <Camera className="w-5 h-5 mr-2" />
                                Abrir câmera
                              </Button>
                              <span className="text-xs text-muted-foreground">ou</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.currentTarget.files?.[0];
                                  if (file) handleFileUpload(file, "photo");
                                }}
                                className="hidden"
                                id="photoUpload"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={() => document.getElementById("photoUpload")?.click()}
                              >
                                Enviar foto
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {cameraActive && (
                          <>
                            <video
                              ref={videoRef}
                              autoPlay
                              muted
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-48 h-64 border-4 border-primary rounded-full border-dashed opacity-50"></div>
                            </div>
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                              <Button type="button" onClick={takePhoto} size="lg">
                                <Camera className="w-5 h-5 mr-2" />
                                Capturar foto
                              </Button>
                            </div>
                          </>
                        )}
                        
                        {photoPreview && (
                          <div className="relative">
                            <img
                              src={photoPreview}
                              alt="Foto capturada"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 right-4">
                              <Button
                                type="button"
                                onClick={() => {
                                  setPhotoPreview("");
                                  formC.setValue("photo", "");
                                  startCamera();
                                }}
                                variant="outline"
                                size="sm"
                              >
                                Tirar nova foto
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <canvas ref={canvasRef} className="hidden" />
                    </div>

                    {/* Comprovante de Endereço Section */}
                    <div className="space-y-4">
                      <h3 className="text-h3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Comprovante de endereço
                      </h3>
                      
                      <div className={`border-2 border-dashed rounded-lg p-6 ${attemptedSubmit && !addressProofPreview ? 'border-destructive bg-destructive/5' : 'border-muted-foreground/25'}`}>
                        {!addressProofPreview ? (
                          <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                              <Camera className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              Envie uma foto do seu comprovante de endereço
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(file, "addressProof");
                                }
                              }}
                              className="hidden"
                              id="addressProof"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("addressProof")?.click()}
                            >
                              Escolher arquivo
                            </Button>
                          </div>
                        ) : (
                          <div className="relative">
                            <img
                              src={addressProofPreview}
                              alt="Comprovante de endereço"
                              className="w-full max-h-64 object-contain rounded"
                            />
                            <div className="absolute top-2 right-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setAddressProofPreview("");
                                  formC.setValue("addressProof", "");
                                }}
                              >
                                Remover
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Alert for missing files */}
                    {attemptedSubmit && missingFiles.length > 0 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Para continuar, você precisa anexar: {missingFiles.join(" e ")}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        size="lg"
                        onClick={() => setCurrentStep("B")}
                      >
                        Voltar
                      </Button>
                      <Button type="submit" className="flex-1" size="lg">
                        Criar minha conta
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 text-center">
            <p className="text-caption text-muted-foreground">
              Já tem conta?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* 2FA Modal */}
      <Dialog open={show2FA} onOpenChange={setShow2FA}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Verificação WhatsApp</DialogTitle>
            <DialogDescription className="text-center">
              Enviamos um código de 6 dígitos para seu WhatsApp.
              Digite o código abaixo para continuar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP value={otpCode} onChange={setOtpCode} maxLength={6}>
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
                onClick={validateOTP} 
                className="w-full relative overflow-hidden"
                size="lg"
                disabled={validatingOTP}
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
                      Validar
                    </>
                  )}
                </span>
              </Button>
            </div>
            
            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Reenviar código em {resendTimer}s
                </p>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={validatingOTP}
                  onClick={() => {
                    startResendTimer();
                    toast({
                      title: "Código reenviado",
                      description: "Enviamos um novo código para seu WhatsApp",
                    });
                  }}
                >
                  Reenviar código
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Cadastro;