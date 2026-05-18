import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, ChefHat, Menu, CreditCard, FileText, MessageCircle, UtensilsCrossed, Clock, Book, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import LogoText from "@/components/LogoText";
import mariaProfile from "@/assets/maria-profile.jpg";
import logoCompleta from "@/assets/logo-completa.webp";

interface AppMenuProps {
  title?: string;
}

export function AppMenu({ title = "Dashboard" }: AppMenuProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Mock user data - in real app, this would come from auth context
  const userData = {
    firstName: "Maria",
    fullName: "Maria Silva"
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate("/");
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/5511999999999", "_blank");
  };

  const menuItems = [{
    icon: UtensilsCrossed,
    label: "Novo Serviço",
    route: "/contratacao-logado",
    highlighted: true
  }, {
    icon: Home,
    label: "Dashboard",
    route: "/dashboard-cliente"
  }, {
    icon: User,
    label: "Minha Conta",
    route: "/editar-dados"
  }, {
    icon: FileText,
    label: "Serviços Ativos",
    route: "/meus-contratos"
  }, {
    icon: Clock,
    label: "Histórico de Pagamento",
    route: "/historico-pagamento"
  }, {
    icon: CreditCard,
    label: "Gerenciar Cartões",
    route: "/gerenciar-cartoes"
  }, {
    icon: Book,
    label: "Ver Cardápio",
    route: "/cardapio"
  }, {
    icon: MessageCircle,
    label: "Suporte",
    action: handleWhatsApp
  }, {
    icon: LogOut,
    label: "Logout",
    action: handleLogout
  }];

  return (
    <header className="bg-tyt-blue-700 border-b border-tyt-blue-800 fixed top-0 left-0 right-0 z-50 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="text-tyt-yellow-400 flex-shrink-0">
          <LogoText linkTo="/dashboard-cliente" />
        </div>
        
        {/* Menu Hamburger */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 flex-shrink-0">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 flex flex-col max-h-screen">
            <SheetHeader className="flex-shrink-0">
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Gerencie sua conta e serviços
              </SheetDescription>
            </SheetHeader>
            
            {/* Maria's Welcome Card */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <img 
                    src={mariaProfile} 
                    alt="Foto de perfil da Maria" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm">{userData.fullName}</h4>
                  <p className="text-xs text-gray-600">Bem-vinda!</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 space-y-1 flex-1 overflow-y-auto">
              {menuItems.map((item, index) => (
                <Button 
                  key={index} 
                  variant={item.highlighted ? "default" : "ghost"}
                  className={`w-full justify-start h-10 ${
                    item.highlighted 
                      ? "bg-tyt-blue-700 hover:bg-tyt-blue-800 text-white" 
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.route) {
                      navigate(item.route);
                    }
                    setIsMenuOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
            
            {/* Logo no final do menu */}
            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-center flex-shrink-0">
              <img 
                src={logoCompleta} 
                alt="Logo Take Your Thyme" 
                className="h-6 w-auto opacity-80"
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}