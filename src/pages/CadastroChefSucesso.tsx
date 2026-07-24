import { useNavigate, useLocation } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LogoText from "@/components/LogoText";
import Footer from "@/components/Footer";

const CadastroChefSucesso = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentStatus = location.state?.status || "cadastro";

  const getStepCompleted = (stepIndex: number, status: string) => {
    // status: cadastro -> analise -> entrevista -> documentacao -> ativo
    const statusOrder: Record<string, number> = {
      cadastro: 0,
      analise: 1,
      entrevista: 2,
      documentacao: 3,
      ativo: 4,
    };
    const currentOrder = statusOrder[status] ?? 0;
    return stepIndex <= currentOrder;
  };

  const steps = [
    {
      title: "Enviar cadastro",
      completed: getStepCompleted(0, currentStatus)
    },
    {
      title: "Análise de perfil",
      completed: getStepCompleted(1, currentStatus)
    },
    {
      title: "Entrevista",
      completed: getStepCompleted(2, currentStatus)
    },
    {
      title: "Documentação",
      completed: getStepCompleted(3, currentStatus)
    },
    {
      title: "Conclusão",
      completed: getStepCompleted(4, currentStatus)
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#0E4684] border-b border-[#0a3769] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <LogoText variant="white" linkTo="/" />
        </div>
      </header>

      <main className="flex-1 px-4 py-8 bg-background flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-12 h-12 text-white" />
              </div>
              <CardTitle className="text-h1 text-[#0E4684] mb-2">Parabéns!</CardTitle>
              <CardDescription className="text-body text-gray-700">
                Seu cadastro foi enviado com sucesso
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Mensagem explicativa */}
              <div className="bg-[#0E4684]/10 border border-[#0E4684]/20 rounded-lg p-4">
                <p className="text-body text-gray-700 text-center">
                  Seu cadastro foi enviado e agora será avaliado pelo time da TYT.
                  Em breve entraremos em contato para dar continuidade ao processo.
                </p>
              </div>

              {/* Lista de etapas */}
              <div className="space-y-3">
                <h3 className="text-h4 font-light text-gray-900 mb-4">Etapas do Processo:</h3>

                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${step.completed
                        ? "bg-green-500"
                        : "bg-gray-300"
                        }`}
                    >
                      <Check
                        className={`w-5 h-5 ${step.completed
                          ? "text-white"
                          : "text-gray-500"
                          }`}
                      />
                    </div>
                    <span
                      className={`text-body font-medium ${step.completed
                        ? "text-gray-900"
                        : "text-gray-500"
                        }`}
                    >
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Botão */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => window.open("https://takeyourthyme.com.br/", "_blank")}
                  className="w-full bg-[#0E4684] hover:bg-[#0a3769] text-white"
                  size="lg"
                >
                  IR PARA O SITE
                </Button>
                <Button
                  onClick={() => navigate("/login/chef")}
                  variant="ghost"
                  className="w-full text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  size="lg"
                >
                  Voltar para o Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CadastroChefSucesso;
