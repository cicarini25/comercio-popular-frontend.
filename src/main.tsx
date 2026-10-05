import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App.tsx';
import './index.css';
import { setupServiceWorker } from './registerSW';
import ShopeeImportAdmin from './components/ShopeeImportAdmin';
import SheinImportAdmin from './components/SheinImportAdmin';

setupServiceWorker();

const currentPath = window.location.pathname.replace(/\/+$/, '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {currentPath === '/admin/importar-shopee' ? <ShopeeImportAdmin /> :
          currentPath === '/admin/importar-shein' ? <SheinImportAdmin /> : <App />}
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
