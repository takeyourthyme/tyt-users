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
import { login, parseLoginResponse, saveSession } from "@/services/authService";

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
      saveSession(session);

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao Take Your Thyme",
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
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-h2">Entrar na sua conta</CardTitle>
            <CardDescription className="text-body">
              Digite seu e-mail e senha para acessar sua conta
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
                        <Input type="email" placeholder="seu@email.com" {...field} />
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
                        <Input type="password" placeholder="Sua senha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 space-y-4 text-center">
              <Link
                to="/ajuda"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Esqueci meu número?
              </Link>

              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">Não tem conta?</span>
                <Link
                  to="/cadastro"
                  className="flex items-center gap-2 text-sm text-primary hover:underline font-medium"
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
