import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ChefHat,
  Clock,
  DollarSign,
  MessageCircle,
  LogOut,
  Menu,
  Edit,
  BookOpen,
  User,
  UtensilsCrossed,
  CheckSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logoWhite from "@/assets/tyt-logo-white.png";
import logoCompleta from "@/assets/logo-completa.webp";
import { loadSession, clearSession } from "@/services/authService";
import { getUserPhotoUrl } from "@/services/userService";

export interface ChefMenuProps {
  hasActiveFilter?: boolean;
  onGoAgenda?: () => void;
  activeItem?: "dashboard" | "agenda" | "servicos-ativos" | "aprovacoes" | "pagamentos" | "cadastro";
}

export const ChefMenu = ({ hasActiveFilter = false, onGoAgenda, activeItem }: ChefMenuProps) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleMenuAction = (action: string) => {
    setOpen(false);
    switch (action) {
      case 'dashboard':
        navigate('/dashboard-chef');
        break;
      case 'agenda':
        if (onGoAgenda) {
          onGoAgenda();
        } else {
          navigate('/agenda-chef', { state: { scrollTo: 'proximos-compromissos', clear: true } });
        }
        break;
      case 'servicos-ativos':
        navigate('/servicos-ativos');
        break;
      case 'aprovacoes':
        navigate('/servicos-pendentes');
        break;
      case 'pagamentos':
        navigate('/meus-pagamentos');
        break;
      case 'editar-cadastro':
        navigate('/editar-cadastro-chef');
        break;
      case 'guia':
        // Navigation to chef guide
        break;
      case 'ajuda':
        window.open('https://wa.me/5511999999999', '_blank');
        break;
      case 'logout':
        clearSession();
        localStorage.removeItem("token");
        navigate('/');
        break;
    }
  };

  const session = useMemo(() => loadSession(), []);
  const chefName = (session?.user?.nome as string | undefined) ?? (session?.user?.name as string | undefined) ?? "Chef";
  const chefPhotoUrl = getUserPhotoUrl(session?.user);

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#0E4684] border-b border-[#0a3769] px-4 py-3 z-50 shadow-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Logo at Left */}
        <div className="flex-shrink-0">
          <img
            src={logoWhite}
            alt="Take Your Thyme"
            className="h-6 w-auto cursor-pointer"
            onClick={() => navigate('/dashboard-chef')}
          />
        </div>

        {/* Menu Hamburger at Right */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 animate-none flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 flex flex-col max-h-screen">
            {/* Chef Profile Card */}
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
                  {chefPhotoUrl ? (
                    <img
                      src={chefPhotoUrl}
                      alt={`Foto de perfil do Chef ${chefName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-light text-gray-800 text-sm">{chefName}</h4>
                  <p className="text-xs text-gray-600">Bem-vindo!</p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 flex-1 overflow-y-auto">
              <Button
                variant={activeItem === 'dashboard' ? 'default' : 'ghost'}
                className={activeItem === 'dashboard'
                  ? "w-full justify-start h-12 text-base bg-[#0E4684] hover:bg-[#0a3769] text-white"
                  : "w-full justify-start h-12 text-base hover:bg-gray-100"
                }
                onClick={() => handleMenuAction('dashboard')}
              >
                <ChefHat className="w-5 h-5 mr-3" />
                Dashboard
              </Button>

              <Button
                variant={(activeItem === 'agenda' && !hasActiveFilter) ? 'default' : 'ghost'}
                className={(activeItem === 'agenda' && !hasActiveFilter)
                  ? "w-full justify-start h-12 text-base bg-[#0E4684] hover:bg-[#0a3769] text-white"
                  : "w-full justify-start h-12 text-base hover:bg-gray-100"
                }
                onClick={() => handleMenuAction('agenda')}
              >
                <Calendar className="w-5 h-5 mr-3" />
                Agenda
              </Button>

              <Button
                variant={activeItem === 'servicos-ativos' ? 'default' : 'ghost'}
                className={activeItem === 'servicos-ativos'
                  ? "w-full justify-start h-12 text-base bg-[#0E4684] hover:bg-[#0a3769] text-white"
                  : "w-full justify-start h-12 text-base hover:bg-gray-100"
                }
                onClick={() => handleMenuAction('servicos-ativos')}
              >
                <UtensilsCrossed className="w-5 h-5 mr-3" />
                Serviços Ativos
              </Button>

              <Button
                variant={activeItem === 'aprovacoes' ? 'default' : 'ghost'}
                className={activeItem === 'aprovacoes'
                  ? "w-full justify-start h-12 text-base bg-[#0E4684] hover:bg-[#0a3769] text-white"
                  : "w-full justify-start h-12 text-base hover:bg-gray-100"
                }
                onClick={() => handleMenuAction('aprovacoes')}
              >
                <CheckSquare className="w-5 h-5 mr-3" />
                Aprovações Pendentes
              </Button>

              <Button
                variant={activeItem === 'pagamentos' ? 'default' : 'ghost'}
                className={activeItem === 'pagamentos'
                  ? "w-full justify-start h-12 text-base bg-[#0E4684] hover:bg-[#0a3769] text-white"
                  : "w-full justify-start h-12 text-base hover:bg-gray-100"
                }
                disabled
                onClick={() => handleMenuAction('pagamentos')}
              >
                <DollarSign className="w-5 h-5 mr-3" />
                Pagamentos
              </Button>

              <Button
                variant={activeItem === 'cadastro' ? 'default' : 'ghost'}
                className={activeItem === 'cadastro'
                  ? "w-full justify-start h-12 text-base bg-[#0E4684] hover:bg-[#0a3769] text-white"
                  : "w-full justify-start h-12 text-base hover:bg-gray-100"
                }
                onClick={() => handleMenuAction('editar-cadastro')}
              >
                <Edit className="w-5 h-5 mr-3" />
                Meu Cadastro
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-base hover:bg-gray-100"
                onClick={() => handleMenuAction('ajuda')}
              >
                <MessageCircle className="w-5 h-5 mr-3" />
                Ajuda
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-base hover:bg-gray-100"
                onClick={() => handleMenuAction('guia')}
              >
                <BookOpen className="w-5 h-5 mr-3" />
                Guia do Chef
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start h-12 text-base hover:bg-gray-100"
                onClick={() => handleMenuAction('logout')}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sair
              </Button>
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
};
