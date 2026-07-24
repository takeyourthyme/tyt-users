import { useLocation } from "react-router-dom";
import { loadSession } from "@/services/authService";

interface FooterProps {
  variant?: "client" | "chef";
}

const Footer = ({ variant }: FooterProps) => {
  const location = useLocation();
  const session = loadSession();

  const isChefRoute =
    variant === "chef" ||
    session?.user?.tipo_usuario === "chef" ||
    location.pathname.includes("chef") ||
    location.pathname.includes("ordem") ||
    location.pathname.includes("servicos-ativos") ||
    location.pathname.includes("servico-detalhes") ||
    location.pathname.includes("meus-pagamentos");

  const bgClass = isChefRoute
    ? "bg-[#0E4684]/10 border-t border-[#0E4684]/20"
    : "bg-[#A6D8B526] border-t border-gray-200/50";

  const textColorClass = isChefRoute ? "text-[#0E4684]" : "text-[#666666]";
  const boldColorClass = isChefRoute ? "text-[#0E4684]" : "text-[#444444]";
  const hoverClass = isChefRoute ? "hover:text-[#0E4684] hover:underline" : "hover:text-[#004B2A]";

  return (
    <footer className={`w-full ${bgClass} py-3 mt-auto min-h-[47px] flex items-center transition-colors`}>
      <div className="mx-auto px-4 sm:px-6 w-full">
        <div className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[11px] ${textColorClass} leading-tight text-center`}>
          <span>
            <strong className={`font-semibold ${boldColorClass}`}>Contato</strong>{" "}
            <a href="mailto:contato@takeyourthyme.com" className={`${hoverClass} transition-colors`}>
              contato@takeyourthyme.com
            </a>
          </span>

          <span>
            <strong className={`font-semibold ${boldColorClass}`}>Instagram</strong>{" "}
            <a href="https://instagram.com/takeyourthymebr" target="_blank" rel="noopener noreferrer" className={`${hoverClass} transition-colors`}>
              takeyourthymebr
            </a>
          </span>

          <span>
            © 2026 Take Your Thyme - Todos os direitos reservados. Nome Fantasia TYT - CNPJ 57.310.363/0001-40 - Rua Mario Prandini, 775 - Centro, Itapeva - SP, 18.400-170. Você recebeu este e-mail porque realizou uma transação na plataforma Take Your Thyme. Este é um e-mail transacional obrigatório.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;