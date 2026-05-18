import { useNavigate } from "react-router-dom";
import { ChefHat, Users, Info, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
const Index = () => {
  const navigate = useNavigate();
  const handleClienteClick = () => {
    navigate("/contratacao");
  };
  const handleChefClick = () => {
    navigate("/cadastro-chef");
  };
  return <div className="min-h-screen flex flex-col pt-20">
      <Header />
      
      {/* Hero Section */}
      <section className="flex-1 px-4 py-12 md:py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-h2 md:text-h1 lg:text-6xl mb-4 md:mb-6 max-w-4xl mx-auto leading-tight">
            Chefs pessoais, menus incríveis, 
            <span className="italic text-primary"> na sua casa</span>
          </h1>
          
          <p className="text-body md:text-h4 text-gray-600 mb-12 md:mb-16 max-w-2xl mx-auto">Conectamos você aos melhores chefs para cozinhar semanalmente em sua casa ou evento. Sabores únicos, experiências inesquecíveis.</p>
          
          {/* Service Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Card Cliente */}
            <Card className="bg-tyt-yellow-500 text-gray-900 hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4 h-full">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm">
                  <Users className="w-8 h-8" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <h3 className="text-h4 font-semibold">Sou Cliente</h3>
                  <p className="text-body opacity-90 leading-relaxed">Quero contratar um chef de cozinha para minha casa ou evento</p>
                </div>
                
                <div className="w-full space-y-2">
                  <Button 
                    size="lg"
                    className="w-full group bg-tyt-blue-700 text-white hover:bg-tyt-blue-800"
                    onClick={handleClienteClick}
                  >
                    Contratar
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="w-full group"
                    onClick={() => navigate("/login")}
                  >
                    Minha Conta
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Card Chef */}
            <Card className="bg-tyt-blue-700 text-white hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4 h-full">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm">
                  <ChefHat className="w-8 h-8" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <h3 className="text-h4 font-semibold">Sou Chef</h3>
                  <p className="text-body opacity-90 leading-relaxed">Quero fazer parte do time TYT e oferecer meus serviços culinários</p>
                </div>
                
                <div className="w-full space-y-2">
                  <Button 
                    variant="accent"
                    size="lg"
                    className="w-full group"
                    onClick={handleChefClick}
                  >
                    Me cadastrar
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button 
                    size="lg"
                    className="w-full group bg-white text-tyt-blue-700 hover:bg-gray-100"
                    onClick={() => navigate("/login/chef")}
                  >
                    Fazer Login
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Card Saiba Mais */}
            <ServiceCard 
              title="Saiba Mais" 
              description="Acesse nosso site para conhecer mais sobre nós" 
              icon={<Info className="w-8 h-8" />} 
              variant="secondary" 
              onClick={() => console.log("Learn more")} 
            />
          </div>
        </div>
      </section>
      
      <Footer />
    </div>;
};
export default Index;