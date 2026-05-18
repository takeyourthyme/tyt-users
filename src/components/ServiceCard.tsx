import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  variant: "primary" | "secondary" | "accent";
  onClick: () => void;
  className?: string;
  buttonText?: string;
  clickable?: boolean;
}

const ServiceCard = ({ 
  title, 
  description, 
  icon, 
  variant, 
  onClick, 
  className = "",
  buttonText,
  clickable = false
}: ServiceCardProps) => {
  const navigate = useNavigate();
  const getCardStyle = () => {
    switch (variant) {
      case "primary":
        return "bg-tyt-yellow-500 text-gray-900 hover:shadow-xl";
      case "secondary":
        return "bg-card hover:bg-gray-200/50 text-card-foreground hover:shadow-lg";
      case "accent":
        return "bg-tyt-blue-700 text-white hover:shadow-xl";
      default:
        return "bg-card text-card-foreground hover:shadow-lg";
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case "primary":
        return "outline";
      case "accent":
        return "accent";
      default:
        return "default";
    }
  };

  return (
    <Card 
      className={`${getCardStyle()} transition-all duration-300 ${clickable ? "cursor-pointer transform hover:-translate-y-1" : variant === "accent" ? "cursor-default" : "cursor-pointer transform hover:-translate-y-1"} ${className}`}
      onClick={clickable ? onClick : (variant === "accent" ? undefined : onClick)}
    >
      <CardContent className="p-6 flex flex-col items-center text-center gap-4 h-full">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm">
          {icon}
        </div>
        
        <div className="flex-1 space-y-2">
          <h3 className="text-h4 font-semibold">{title}</h3>
          <p className="text-body opacity-90 leading-relaxed">{description}</p>
        </div>
        
        <Button 
          variant={getButtonVariant()}
          size="lg"
          className="w-full group"
          onClick={(e) => {
            if (!clickable) {
              e.stopPropagation();
            }
            if (variant === "primary") {
              onClick();
            } else if (variant === "secondary") {
              window.open("https://takeyourthy.me/", "_blank");
            } else if (variant === "accent") {
              onClick();
            }
          }}
        >
          {buttonText || (variant === "primary" ? "Começar" : variant === "secondary" ? "Saiba mais" : "Entrar")}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;