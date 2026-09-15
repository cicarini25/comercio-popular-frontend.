import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
type FacebookSDK = { init: (options: object) => void; login: (callback: (r: { authResponse?: { accessToken: string } }) => void, options: object) => void };
declare global { interface Window { FB?: FacebookSDK } }
let sdk: Promise<void> | undefined;
function load() {
  if (window.FB) return Promise.resolve();
  if (!sdk) sdk = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    const fail = () => { clearTimeout(timer); script.remove(); sdk = undefined; reject(new Error('Não foi possível carregar o Facebook. Tente novamente.')); };
    const timer = window.setTimeout(fail, 15000);
    script.src = 'https://connect.facebook.net/pt_BR/sdk.js'; script.async = true;
    script.onload = () => { if (!window.FB) { fail(); return; } clearTimeout(timer); resolve(); };
    script.onerror = fail; document.head.appendChild(script);
  });
  return sdk;
}
export function FacebookSignInButton({ disabled, onToken, onError }: { disabled: boolean; onToken: (token: string) => void; onError: (message: string) => void }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [opening, setOpening] = useState(false);
  useEffect(() => {
    let active = true;
    setError(''); setReady(false);
    Promise.all([api.facebookConfig(), load()]).then(([config]) => {
      if (!active) return;
      if (!/^\d+$/.test(config.appId) || !window.FB) throw new Error('Facebook não configurado.');
      window.FB.init({ appId: config.appId, version: config.version, cookie: false, xfbml: false });
      setReady(true);
    }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [retry]);
  function click() {
    if (error) { onError(error); setRetry(n => n + 1); return; }
    if (!ready || !window.FB) return;
    if (location.protocol !== 'https:') { onError('Para testar o Facebook, abra a loja em um endereço HTTPS autorizado na Meta.'); return; }
    setOpening(true);
    try {
      window.FB.login(response => {
        setOpening(false);
        if (response.authResponse?.accessToken) onToken(response.authResponse.accessToken);
        else onError('Login cancelado ou não autorizado no Facebook.');
      }, { scope: 'public_profile,email', return_scopes: true });
    } catch { setOpening(false); onError('Não foi possível abrir o Facebook. Verifique se o navegador bloqueou a janela.'); }
  }
  return <button type="button" disabled={disabled || opening || (!ready && !error)} onClick={click} aria-label="Entrar com Facebook" title={error || 'Entrar com Facebook'} className="flex h-14 items-center justify-center rounded-xl border border-neutral-200 bg-white hover:border-teal-600 focus-visible:outline-2 focus-visible:outline-teal-700 disabled:opacity-50">
    <span aria-hidden="true" style={{display:'block',width:35.2,height:35.2,backgroundImage:'url(/social-provider-logos.jpg)',backgroundSize:'112.64px 63.36px',backgroundPosition:'-73.425px -22.385px'}} />
  </button>;
}
