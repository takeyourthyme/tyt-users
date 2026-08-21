import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadSession } from "@/services/authService";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const session = loadSession();
    if (session?.token && session?.user) {
      const userType = session.user?.tipo_usuario || session.user?.tipoUsuario;
      if (userType === "chef") {
        navigate("/chef/inicio", { replace: true });
        return;
      } else if (userType === "cliente") {
        navigate("/inicio", { replace: true });
        return;
      }
    }
    navigate("/entrar", { replace: true });
  }, [navigate]);

  return null;
};

export default Index;