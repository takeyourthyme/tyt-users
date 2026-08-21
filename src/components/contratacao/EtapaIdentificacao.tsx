import React, { useState, type ComponentPropsWithoutRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DadosContratacao } from "@/pages/Contratacao";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputMask from "react-input-mask";
import { login, parseLoginResponse, saveSession } from "@/services/authService";
import { createClientUser } from "@/services/clientService";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, HelpCircle } from "lucide-react";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const toDigits = (v: string) => v.replace(/\D/g, "");

const validateCpf = (value: string) => {
  const cpf = toDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (base: string, factor: number) => {
    let total = 0;
    for (let i = 0; i < base.length; i++) total += Number(base[i]) * (factor - i);
    const rem = total % 11;
    return rem < 2 ? 0 : 11 - rem;
  };
  const d1 = calc(cpf.slice(0, 9), 10);
  const d2 = calc(cpf.slice(0, 9) + String(d1), 11);
  return cpf.endsWith(`${d1}${d2}`);
};

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const cadastroSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("E-mail inválido"),
    whatsapp: z
      .string()
      .regex(/^\+55 \(\d{2}\) \d{5}-\d{4}$/, "WhatsApp inválido (+55 (XX) XXXXX-XXXX)"),
    cpf: z.string().refine(validateCpf, "CPF inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    passwordConfirm: z.string().min(6, "Confirmação obrigatória"),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.passwordConfirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As senhas não conferem",
        path: ["passwordConfirm"],
      });
    }
  });

type LoginData = z.infer<typeof loginSchema>;
type CadastroData = z.infer<typeof cadastroSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  dados: DadosContratacao;
  onAvancar: (dados: Partial<DadosContratacao>) => void;
  onVoltar: () => void;
  onLogin: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const EtapaIdentificacao: React.FC<Props> = ({ dados, onAvancar, onVoltar, onLogin }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Login Form ─────────────────────────────────────────────────────────────
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = async (data: LoginData) => {
    try {
      setIsSubmitting(true);
      const response = await login({ email: data.email.trim(), password: data.password });
      const session = parseLoginResponse(response);

      const userType = session.user?.tipo_usuario || session.user?.tipoUsuario;
      if (userType && userType !== "cliente") {
        toast({
          variant: "destructive",
          title: "Acesso não permitido",
          description:
            userType === "chef"
              ? "Esta conta pertence a um Chef. Use a área de login para Chefs."
              : "Esta área é exclusiva para clientes.",
        });
        return;
      }

      saveSession(session);
      onLogin();
      onAvancar({});
    } catch (error) {
      const description = isAxiosError(error)
        ? ((error.response?.data as { message?: string } | undefined)?.message ??
          "Verifique suas credenciais e tente novamente.")
        : "Verifique suas credenciais e tente novamente.";
      toast({ title: "Não foi possível fazer login", description, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Cadastro Form ──────────────────────────────────────────────────────────
  const cadastroForm = useForm<CadastroData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      name: "",
      email: "",
      whatsapp: "",
      cpf: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const handleCadastro = async (data: CadastroData) => {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("nome", data.name.trim());
      formData.append("email", data.email.trim());
      formData.append("senha", data.password);
      formData.append("whatsapp", toDigits(data.whatsapp));
      formData.append("cpf", toDigits(data.cpf));

      await createClientUser(formData);

      // Auto-login após cadastro
      const response = await login({ email: data.email.trim(), password: data.password });
      const session = parseLoginResponse(response);
      saveSession(session);

      toast({
        title: "Conta criada com sucesso!",
        description: "Continuando com sua contratação…",
      });

      onLogin();
      onAvancar({});
    } catch (error) {
      const apiMessage = (() => {
        if (isAxiosError(error)) {
          const payload = error.response?.data;
          if (typeof payload === "string") return payload;
          if (payload && typeof payload === "object") {
            const rec = payload as Record<string, unknown>;
            if (typeof rec.message === "string") return rec.message;
            if (typeof rec.error === "string") return rec.error;
          }
          return error.message;
        }
        if (error instanceof Error) return error.message;
        return "Tente novamente em alguns instantes.";
      })();
      toast({ title: "Erro ao criar conta", description: String(apiMessage), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-light text-gray-900">Login</h1>
        <p className="text-sm text-gray-500">
          Faça login com seus dados para continuar com sua contratação
        </p>
      </div>

      <Card className="border border-gray-100 shadow-sm rounded-xl">
        <CardContent className="p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="gap-2">
                <LogIn className="w-4 h-4" />
                Entrar
              </TabsTrigger>
              <TabsTrigger value="cadastro" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Criar Conta
              </TabsTrigger>
            </TabsList>

            {/* ── Tab: Login ─────────────────────────────────────────────── */}
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-[#004B2A]">E-mail</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="seu@email.com"
                            className="h-10 border-gray-200 focus-visible:ring-[#004B2A]"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-[#004B2A]">Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Sua senha"
                            className="h-10 border-gray-200 focus-visible:ring-[#004B2A]"
                            autoComplete="current-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-[#004B2A] hover:bg-[#00381F] text-white font-medium text-sm rounded-md transition-colors"
                  >
                    {isSubmitting ? "Entrando…" : "Entrar"}
                  </Button>

                  <div className="text-center pt-1">
                    <a
                      href="/recuperar-senha"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#004B2A] transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Esqueci minha senha
                    </a>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* ── Tab: Cadastro ──────────────────────────────────────────── */}
            <TabsContent value="cadastro">
              <Form {...cadastroForm}>
                <form onSubmit={cadastroForm.handleSubmit(handleCadastro)} className="space-y-4">
                  <FormField
                    control={cadastroForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-[#004B2A]">Nome completo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Seu nome"
                            className="h-10 border-gray-200 focus-visible:ring-[#004B2A]"
                            autoComplete="name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={cadastroForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-[#004B2A]">E-mail</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="seu@email.com"
                            className="h-10 border-gray-200 focus-visible:ring-[#004B2A]"
                            autoComplete="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={cadastroForm.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-[#004B2A]">WhatsApp</FormLabel>
                        <FormControl>
                          <InputMask
                            mask="+55 (99) 99999-9999"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                          >
                            {(inputProps: ComponentPropsWithoutRef<"input">) => (
                              <Input
                                {...inputProps}
                                placeholder="+55 (11) 99999-9999"
                                className="h-10 border-gray-200 focus-visible:ring-[#004B2A]"
                                autoComplete="tel"
                                inputMode="numeric"
                              />
                            )}
                          </InputMask>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={cadastroForm.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-[#004B2A]">CPF</FormLabel>
                        <FormControl>
                          <InputMask
                            mask="999.999.999-99"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                          >
                            {(inputProps: ComponentPropsWithoutRef<"input">) => (
                              <Input
                                {...inputProps}
                                placeholder="000.000.000-00"
                                className="h-10 border-gray-200 focus-visible:ring-[#004B2A]"
                                inputMode="numeric"
                              />
                            )}
                          </InputMask>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={cadastroForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-[#004B2A]">Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            className="h-10 border-gray-200 focus-visible:ring-[#004B2A]"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={cadastroForm.control}
                    name="passwordConfirm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-[#004B2A]">Confirmar senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Repita sua senha"
                            className="h-10 border-gray-200 focus-visible:ring-[#004B2A]"
                            autoComplete="new-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-[#004B2A] hover:bg-[#00381F] text-white font-medium text-sm rounded-md transition-colors"
                  >
                    {isSubmitting ? "Criando conta…" : "Criar conta e continuar"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Voltar */}
      <div className="flex justify-start">
        <Button variant="outline" onClick={onVoltar} disabled={isSubmitting}>
          Voltar
        </Button>
      </div>
    </div>
  );
};
