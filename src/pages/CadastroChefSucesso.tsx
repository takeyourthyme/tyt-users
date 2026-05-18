import { useNavigate } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LogoText from "@/components/LogoText";

const CadastroChefSucesso = () => {
  const navigate = useNavigate();

  const steps = [
    {
      title: "Enviar cadastro",
      completed: true
    },
    {
      title: "Análise de perfil",
      completed: false
    },
    {
      title: "Entrevista",
      completed: false
    },
    {
      title: "Documentação",
      completed: false
    },
    {
      title: "Conclusão",
      completed: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-tyt-yellow-500 border-b border-tyt-yellow-600 px-4 py-4 relative">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <LogoText variant="dark" />
        </div>
      </header>

      <main className="flex-1 px-4 py-8 bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-12 h-12 text-white" />
              </div>
              <CardTitle className="text-h1 text-tyt-yellow-700 mb-2">Parabéns!</CardTitle>
              <CardDescription className="text-body text-gray-700">
                Seu cadastro foi enviado com sucesso
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Mensagem explicativa */}
              <div className="bg-tyt-yellow-50 border border-tyt-yellow-200 rounded-lg p-4">
                <p className="text-body text-gray-700 text-center">
                  Seu cadastro foi enviado e agora será avaliado pelo time da TYT.
                  Em breve entraremos em contato para dar continuidade ao processo.
                </p>
              </div>

              {/* Lista de etapas */}
              <div className="space-y-3">
                <h3 className="text-h4 font-semibold text-gray-900 mb-4">Etapas do Processo:</h3>

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
              <Button
                onClick={() => window.open("https://takeyourthyme.com.br/", "_blank")}
                className="w-full bg-tyt-yellow-500 hover:bg-tyt-yellow-600 text-gray-900"
                size="lg"
              >
                IR PARA O SITE
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CadastroChefSucesso;
