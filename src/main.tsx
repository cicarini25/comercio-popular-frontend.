import {StrictMode, Suspense, lazy} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App.tsx';
import './index.css';
import { setupServiceWorker } from './registerSW';
const ShopeeImportAdmin = lazy(() => import('./components/ShopeeImportAdmin'));
const SheinImportAdmin = lazy(() => import('./components/SheinImportAdmin'));
const AliExpressImportAdmin = lazy(() => import('./components/AliExpressImportAdmin'));

setupServiceWorker();

const currentPath = window.location.pathname.replace(/\/+$/, '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="min-h-screen bg-neutral-50" role="status" aria-label="Carregando página" />}>
          {currentPath === '/admin/importar-shopee' ? <ShopeeImportAdmin /> :
            currentPath === '/admin/importar-shein' ? <SheinImportAdmin /> :
              currentPath === '/admin/importar-aliexpress' ? <AliExpressImportAdmin /> : <App />}
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

