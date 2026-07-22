import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 pt-20">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-light mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-4">Oops! Página não encontrada</p>
          <Link to="/" className="text-[#004B2A] hover:underline">
            Voltar para o início
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
