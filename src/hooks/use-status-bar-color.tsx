import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Routes that should have blue status bar (internal app routes)
const BLUE_STATUS_BAR_ROUTES = [
  '/dashboard-cliente',
  '/contratacao-logado', 
  '/meus-contratos',
  '/detalhes-contrato',
  '/editar-dados',
  '/gerenciar-cartoes',
  '/historico-pagamento',
  '/cardapio',
  '/prato/'
];

export const useStatusBarColor = () => {
  const location = useLocation();

  useEffect(() => {
    const isInternalRoute = BLUE_STATUS_BAR_ROUTES.some(route => 
      location.pathname.startsWith(route)
    );

    // Get meta tag elements
    const themeColorMeta = document.getElementById('theme-color') as HTMLMetaElement;
    const appleStatusBarMeta = document.getElementById('apple-status-bar-style') as HTMLMetaElement;

    if (isInternalRoute) {
      // Set blue theme for internal routes - using tyt-blue-700 (#204581)
      if (themeColorMeta) {
        themeColorMeta.content = '#204581';
      }
      if (appleStatusBarMeta) {
        appleStatusBarMeta.content = 'black-translucent';
      }
    } else {
      // Set white theme for public routes  
      if (themeColorMeta) {
        themeColorMeta.content = '#ffffff';
      }
      if (appleStatusBarMeta) {
        appleStatusBarMeta.content = 'default';
      }
    }
  }, [location.pathname]);
};