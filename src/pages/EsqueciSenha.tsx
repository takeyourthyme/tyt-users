import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { forgotPassword, resetPassword } from "@/services/authService";

const emailSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

const resetSchema = z.object({
  token: z.string().min(1, "Código é obrigatório"),
  novaSenha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmarSenha: z.string().min(6, "Confirme sua senha"),
}).superRefine((data, ctx) => {
  if (data.novaSenha !== data.confirmarSenha) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "As senhas não conferem",
      path: ["confirmarSenha"],
    });
  }
});

type EmailData = z.infer<typeof emailSchema>;
type ResetData = z.infer<typeof resetSchema>;

const EsqueciSenha = () => {
  const [step, setStep] = useState<"email" | "reset">("email");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const formEmail = useForm<EmailData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const formReset = useForm<ResetData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      token: "",
      novaSenha: "",
      confirmarSenha: "",
    },
  });

  const onSubmitEmail = async (data: EmailData) => {
    try {
      setIsSubmitting(true);
      await forgotPassword({ email: data.email.trim() });
      setEmailSentTo(data.email.trim());
      setStep("reset");
      toast({
        title: "Código enviado!",
        description: "Verifique seu e-mail para encontrar o código de recuperação.",
      });
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
        title: "Erro ao enviar código",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitReset = async (data: ResetData) => {
    try {
      setIsSubmitting(true);
      await resetPassword({ token: data.token.trim(), novaSenha: data.novaSenha });
      
      toast({
        title: "Senha alterada com sucesso!",
        description: "Você já pode fazer login com sua nova senha.",
      });
      navigate("/login");
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
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2 relative pb-2">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-2 h-8 w-8"
              onClick={() => {
                if (step === "reset") {
                  setStep("email");
                } else {
                  navigate(-1);
                }
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-h2">Recuperar Senha</CardTitle>
            <CardDescription className="text-body">
              {step === "email"
                ? "Digite seu e-mail para receber um código de recuperação."
                : `Digite o código enviado para ${emailSentTo} e crie sua nova senha.`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === "email" && (
              <Form {...formEmail}>
                <form onSubmit={formEmail.handleSubmit(onSubmitEmail)} className="space-y-6">
                  <FormField
                    control={formEmail.control}
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

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Enviar código"}
                  </Button>
                </form>
              </Form>
            )}

            {step === "reset" && (
              <Form {...formReset}>
                <form onSubmit={formReset.handleSubmit(onSubmitReset)} className="space-y-4">
                  <FormField
                    control={formReset.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de recuperação</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o código" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formReset.control}
                    name="novaSenha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Sua nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={formReset.control}
                    name="confirmarSenha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar nova senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Repita a nova senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full mt-2" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Alterando..." : "Alterar senha"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default EsqueciSenha;
