import logoWhite from '@/assets/tyt-logo-white.png';
import logoDark from '@/assets/tyt-logo-dark.png';
import { Link } from "react-router-dom";

const LogoText = ({ 
  className = "", 
  variant = "white", 
  linkTo = "/" 
}: { 
  className?: string, 
  variant?: "white" | "dark",
  linkTo?: string 
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <Link to={linkTo}>
        <img 
          src={variant === "white" ? logoWhite : logoDark} 
          alt="Take Your Thyme" 
          className="h-6 w-auto cursor-pointer"
        />
      </Link>
    </div>
  );
};

export default LogoText;