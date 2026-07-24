import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { ChefHat, HelpCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import LogoText from "@/components/LogoText";
import Footer from "@/components/Footer";
import { login, parseLoginResponse, saveSession, clearSession } from "@/services/authService";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginData = z.infer<typeof loginSchema>;

const LoginChef = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmitLogin = async (data: LoginData) => {
    try {
      setIsSubmitting(true);
      const response = await login({ email: data.email.trim(), password: data.password });
      const session = parseLoginResponse(response);

      const userType = session.user?.tipo_usuario || session.user?.tipoUsuario;
      if (userType && userType !== "chef") {
        clearSession();
        toast({
          variant: "destructive",
          title: "Erro de acesso",
          description: userType === "cliente"
            ? "Esta conta pertence a um Cliente. Por favor, acesse a área de login para Clientes."
            : "Esta área de login é exclusiva para Chefs.",
        });
        return;
      }

      saveSession(session);

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao painel do chef",
      });

      // Navigate to chef dashboard
      navigate("/dashboard-chef");
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        const payload = error.response.data;
        if (payload && typeof payload === "object") {
          const record = payload as Record<string, unknown>;
          if (record.code === "CHEF_REGISTRATION_PENDING") {
            toast({
              title: "Cadastro em análise",
              description: "Redirecionando para o acompanhamento do seu cadastro...",
            });
            navigate("/cadastro-chef-sucesso", { state: { status: record.status } });
            return;
          }
        }
      }

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
        title: "Erro ao entrar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with blue background for chef and logo on the left */}
      <header className="bg-[#0E4684] border-b border-[#0a3769] px-4 sm:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <LogoText variant="white" linkTo="/login/chef" />
        </div>
      </header>

      <main className="flex-1 px-4 py-12 bg-background flex items-center justify-center">
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-lg border border-gray-200/70 rounded-xl bg-white p-6 sm:p-8">
            <div className="text-center space-y-3 mb-6">
              <div className="w-14 h-14 bg-[#0E4684] rounded-full flex items-center justify-center mx-auto">
                <ChefHat className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bodoni text-gray-900 font-light">Área do Chef</h1>
              <p className="text-sm text-gray-500">
                Digite seu e-mail e senha para entrar
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">E-mail</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="seu@email.com" {...field} className="h-10 text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Sua senha" {...field} className="h-10 text-sm" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-[#0E4684] hover:bg-[#0a3769] text-white font-medium h-11 mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 pt-4 text-center space-y-3">
              <Link
                to="/esqueci-senha"
                className="inline-flex items-center justify-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-gray-400" />
                Esqueci minha senha
              </Link>

              <div className="text-sm text-gray-500 flex items-center justify-center gap-1.5 pt-1">
                <span>Não tem conta?</span>
                <Link to="/cadastro-chef" className="text-[#0E4684] hover:underline font-medium inline-flex items-center gap-1">
                  <UserPlus className="w-4 h-4 text-[#0E4684]" />
                  Criar Conta
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginChef;
