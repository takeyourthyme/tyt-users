const Footer = () => {
  return (
    <footer className="w-full bg-[#A6D8B526] border-t border-gray-200/50 py-3 mt-auto min-h-[47px] flex items-center">
      <div className="mx-auto px-4 sm:px-6 w-full">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[11px] text-[#666666] leading-tight text-center">
          <span>
            <strong className="font-semibold text-[#444444]">Contato</strong>{" "}
            <a href="mailto:contato@takeyourthyme.com" className="hover:text-[#004B2A] transition-colors">
              contato@takeyourthyme.com
            </a>
          </span>

          <span>
            <strong className="font-semibold text-[#444444]">Instagram</strong>{" "}
            <a href="https://instagram.com/takeyourthymebr" target="_blank" rel="noopener noreferrer" className="hover:text-[#004B2A] transition-colors">
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