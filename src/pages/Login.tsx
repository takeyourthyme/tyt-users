import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { HelpCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import IllustrationOrder from "@/assets/illustration-order";
import { login, parseLoginResponse, saveSession, clearSession } from "@/services/authService";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginData = z.infer<typeof loginSchema>;

const Login = () => {
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
      if (userType && userType !== "cliente") {
        clearSession();
        toast({
          variant: "destructive",
          title: "Erro de acesso",
          description: userType === "chef" 
            ? "Esta conta pertence a um Chef. Por favor, acesse a área de login para Chefs." 
            : "Esta área de login é exclusiva para clientes.",
        });
        return;
      }

      saveSession(session);

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao Take Your Thyme",
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
        title: "Erro ao entrar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5F4]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12 pt-20">
        <Card className="w-full max-w-[448px] bg-white border border-gray-100 shadow-sm rounded-xl p-2 sm:p-4">
          <CardHeader className="text-center space-y-2 pb-6">
            <IllustrationOrder className="mx-auto mb-2" />
            <CardTitle className="text-2xl font-serif font-normal text-gray-900">
              Entrar na sua conta
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-500">
              Digite seu e-mail e senha para acessar sua conta
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitLogin)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs sm:text-sm font-medium text-[#004B2A]">
                        E-mail
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          className="h-10 border-gray-200 focus-visible:ring-[#004B2A]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs sm:text-sm font-medium text-[#004B2A]">
                        Senha
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Sua senha"
                          className="h-10 border-gray-200 focus-visible:ring-[#004B2A]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 bg-[#004B2A] hover:bg-[#00381F] text-white font-medium text-sm rounded-md transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>

            <div className="pt-2 space-y-3 text-center">
              <div>
                <Link
                  to="/recuperar-senha"
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-[#004B2A] transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  Esqueci minha senha
                </Link>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs">
                <span className="text-gray-500">Não tem conta?</span>
                <Link
                  to="/cadastro"
                  className="inline-flex items-center gap-1 text-[#004B2A] hover:underline font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  Criar Conta
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
