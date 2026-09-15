import React, { useEffect, useRef, useState } from 'react';


type GoogleIdentity = {
  initialize: (config: { client_id: string; nonce: string; callback: (response: { credential: string }) => void; ux_mode: string; auto_select: boolean }) => void;
  renderButton: (element: HTMLElement, options: Record<string, string>) => void;
};
declare global { interface Window { google?: { accounts: { id: GoogleIdentity } } } }
let loading: Promise<void> | undefined;
function loadGoogle() {
  if (window.google?.accounts.id) return Promise.resolve();
  if (!loading) loading = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    const timer = window.setTimeout(() => { script.remove(); loading = undefined; reject(new Error('O Google demorou para responder. Tente novamente.')); }, 15000);
    script.src = 'https://accounts.google.com/gsi/client?hl=pt-BR';
    script.async = true;
    script.onload = () => { clearTimeout(timer); resolve(); };
    script.onerror = () => { clearTimeout(timer); script.remove(); loading = undefined; reject(new Error('Não foi possível carregar o Google. Verifique sua conexão.')); };
    document.head.appendChild(script);
  });
  return loading;
}

export function GoogleSignInButton({ onCredential, disabled }: {
  onCredential: (credential: string, nonce: string) => void; disabled: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const callback = useRef(onCredential);
  callback.current = onCredential;
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    setError(''); setReady(false);
    loadGoogle().then(() => {
      const config = { clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '128303612665-5v3h250b589nt94v5bv6t6q8ufp4sup4.apps.googleusercontent.com' };
      if (!active || !host.current) return;
      if (!config.clientId?.endsWith('.apps.googleusercontent.com') || !window.google) throw new Error('Login Google indisponível.');
      const nonce = Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, '0')).join('');
      window.google.accounts.id.initialize({ client_id: config.clientId, nonce, ux_mode: 'popup', auto_select: false,
        callback: response => { if (active) callback.current(response.credential, nonce); }
      });
      host.current.replaceChildren();
      window.google.accounts.id.renderButton(host.current, { type: 'icon', theme: 'outline', size: 'large', shape: 'circle', locale: 'pt-BR' });
      setReady(true);
    }).catch(err => { if (active) setError(err instanceof Error ? err.message : 'Login Google indisponível.'); });
    return () => { active = false; };
  }, [retry]);
  return <div className="flex min-h-14 items-center justify-center rounded-xl border border-neutral-200 bg-white" title={error || 'Entrar com Google'}>
    <div ref={host} inert={disabled} className={disabled ? 'opacity-50' : ''} />
    {!ready && !error && <span role="status" className="text-xs text-neutral-500">Carregando…</span>}
    {error && <button type="button" disabled={disabled} onClick={() => setRetry(n => n + 1)} aria-label={`Tentar Google novamente: ${error}`} className="p-2 text-xs text-teal-800">Google: tentar novamente</button>}
  </div>;
}
