import React from "react";
import { Navigate } from "react-router-dom";
import { loadSession } from "@/services/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ClientRoute
 * Blocks unauthenticated users (redirects to /login)
 * Blocks chefs (redirects to /dashboard-chef)
 */
export const ClientRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const session = loadSession();

  if (!session?.token || !session?.user) {
    return <Navigate to="/login" replace />;
  }

  const userType = session.user?.tipo_usuario || session.user?.tipoUsuario;

  if (userType === "chef") {
    return <Navigate to="/dashboard-chef" replace />;
  }

  if (userType !== "cliente") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * ChefRoute
 * Blocks unauthenticated users (redirects to /login/chef)
 * Blocks clients (redirects to /dashboard-cliente)
 */
export const ChefRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const session = loadSession();

  if (!session?.token || !session?.user) {
    return <Navigate to="/login/chef" replace />;
  }

  const userType = session.user?.tipo_usuario || session.user?.tipoUsuario;

  if (userType === "cliente") {
    return <Navigate to="/dashboard-cliente" replace />;
  }

  if (userType !== "chef") {
    return <Navigate to="/login/chef" replace />;
  }

  return <>{children}</>;
};

/**
 * PublicClientRoute
 * Allows unauthenticated guests and logged-in clients.
 * Blocks chefs (redirects to /dashboard-chef).
 * Used for pages like /pratos, /prato/:id, /contratacao.
 */
export const PublicClientRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const session = loadSession();

  if (session?.token && session?.user) {
    const userType = session.user?.tipo_usuario || session.user?.tipoUsuario;
    if (userType === "chef") {
      return <Navigate to="/dashboard-chef" replace />;
    }
  }

  return <>{children}</>;
};

/**
 * GuestRoute
 * Allows only unauthenticated users (guests).
 * Redirects logged-in clients to /dashboard-cliente.
 * Redirects logged-in chefs to /dashboard-chef.
 * Used for login, signup, and reset password pages.
 */
export const GuestRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const session = loadSession();

  if (session?.token && session?.user) {
    const userType = session.user?.tipo_usuario || session.user?.tipoUsuario;
    if (userType === "chef") {
      return <Navigate to="/dashboard-chef" replace />;
    }
    if (userType === "cliente") {
      return <Navigate to="/dashboard-cliente" replace />;
    }
  }

  return <>{children}</>;
};
