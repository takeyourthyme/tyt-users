import { Link } from "react-router-dom";
import { useState } from "react";
import { User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LogoText from "./LogoText";

const Header = () => {
  return (
    <header className="w-full bg-background border-b border-border fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <LogoText variant="dark" />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/login" 
            className="text-body text-gray-700 hover:text-primary transition-colors"
          >
            Já tenho conta
          </Link>
          <Link 
            to="/cadastro" 
            className="text-body text-gray-700 hover:text-primary transition-colors"
          >
            Criar Conta
          </Link>
        </nav>

        {/* Mobile/Tablet User Menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-background border border-border shadow-lg z-50"
            >
              <DropdownMenuItem asChild>
                <Link 
                  to="/login" 
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-muted transition-colors cursor-pointer"
                >
                  Já tenho conta
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link 
                  to="/cadastro" 
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-muted transition-colors cursor-pointer"
                >
                  Criar Conta
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;