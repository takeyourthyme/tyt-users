import React from "react";
import { Navigate } from "react-router-dom";
import { loadSession } from "@/services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ClientRoute
 * Blocks unauthenticated users (redirects to /entrar)
 * Blocks chefs (redirects to /chef/inicio)
 */
export const ClientRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const session = loadSession();

  if (!session?.token || !session?.user) {
    return <Navigate to="/entrar" replace />;
  }

  const userType = session.user?.tipo_usuario || session.user?.tipoUsuario;

  if (userType === "chef") {
    return <Navigate to="/chef/inicio" replace />;
  }

  if (userType !== "cliente") {
    return <Navigate to="/entrar" replace />;
  }

  return <>{children}</>;
};

/**
 * ChefRoute
 * Blocks unauthenticated users (redirects to /chef/entrar)
 * Blocks clients (redirects to /inicio)
 */
export const ChefRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const session = loadSession();

  if (!session?.token || !session?.user) {
    return <Navigate to="/chef/entrar" replace />;
  }

  const userType = session.user?.tipo_usuario || session.user?.tipoUsuario;

  if (userType === "cliente") {
    return <Navigate to="/inicio" replace />;
  }

  if (userType !== "chef") {
    return <Navigate to="/chef/entrar" replace />;
  }

  return <>{children}</>;
};

/**
 * PublicClientRoute
 * Allows unauthenticated guests and logged-in clients.
 * Blocks chefs (redirects to /chef/inicio).
 * Used for pages like /cardapio, /cardapio/:id, /contratar.
 */
export const PublicClientRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const session = loadSession();

  if (session?.token && session?.user) {
    const userType = session.user?.tipo_usuario || session.user?.tipoUsuario;
    if (userType === "chef") {
      return <Navigate to="/chef/inicio" replace />;
    }
  }

  return <>{children}</>;
};

/**
 * GuestRoute
 * Allows only unauthenticated users (guests).
 * Redirects logged-in clients to /inicio.
 * Redirects logged-in chefs to /chef/inicio.
 * Used for login, signup, and reset password pages.
 */
export const GuestRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const session = loadSession();

  if (session?.token && session?.user) {
    const userType = session.user?.tipo_usuario || session.user?.tipoUsuario;
    if (userType === "chef") {
      return <Navigate to="/chef/inicio" replace />;
    }
    if (userType === "cliente") {
      return <Navigate to="/inicio" replace />;
    }
  }

  return <>{children}</>;
};
