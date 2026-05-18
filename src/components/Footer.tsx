import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-200 border-t border-border mt-8 md:mt-16">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 text-xs text-gray-500">
          <Link 
            to="/contato" 
            className="hover:text-primary transition-colors"
          >
            Contato
          </Link>
          <span className="hidden md:inline">•</span>
          <span className="text-center">
            © 2025 Take Your Thyme
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;