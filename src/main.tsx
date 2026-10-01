import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App.tsx';
import './index.css';
import { setupServiceWorker } from './registerSW';
import ShopeeImportAdmin from './components/ShopeeImportAdmin';

setupServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter><AuthProvider>{window.location.pathname.replace(/\/+$/, '') === '/admin/importar-shopee' ? <ShopeeImportAdmin /> : <App />}</AuthProvider></BrowserRouter>
  </StrictMode>,
);
