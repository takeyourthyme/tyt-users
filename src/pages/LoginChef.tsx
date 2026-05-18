import { useState, type ComponentPropsWithoutRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isAxiosError } from "axios";
import { ArrowLeft, MessageCircle, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import LogoText from "@/components/LogoText";
import { login, parseLoginResponse, saveSession } from "@/services/authService";

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
      saveSession(session);

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao painel do chef",
      });

      // Navigate to chef dashboard
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
        title: "Erro ao entrar",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with yellow background for chef */}
      <header className="bg-tyt-yellow-500 border-b border-tyt-yellow-600 px-4 py-4 relative">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-gray-900 hover:bg-tyt-yellow-600/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <LogoText variant="dark" className="absolute left-1/2 transform -translate-x-1/2" />

          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 px-4 py-12 bg-gray-50">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-tyt-yellow-500 rounded-full flex items-center justify-center mx-auto">
                <ChefHat className="w-8 h-8 text-gray-900" />
              </div>
              <CardTitle className="text-h2">Área do Chef</CardTitle>
              <CardDescription className="text-body">
                Digite seu e-mail e senha para entrar
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitLogin)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="seu@email.com" {...field} className="text-lg py-3" />
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
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Sua senha" {...field} className="text-lg py-3" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-tyt-yellow-500 hover:bg-tyt-yellow-600 text-gray-900"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </Form>

              <div className="mt-8 pt-6 border-t text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Precisa de ajuda?
                </p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="https://wa.me/5511999999999" target="_blank">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Falar no WhatsApp
                  </Link>
                </Button>

                <div className="text-sm text-gray-500">
                  Não tem conta?{" "}
                  <Link to="/cadastro-chef" className="text-tyt-yellow-700 hover:text-tyt-yellow-800 underline">
                    Cadastre-se como chef
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LoginChef;
