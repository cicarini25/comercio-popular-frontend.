import React, { useEffect, useState, useRef } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { User } from '../../types';
import { validateCPF, maskCPF, maskPhone } from '../../utils/formatters';
import { Logo } from '../common/Logo';
import { FacebookSignInButton } from './FacebookSignInButton';
import { GoogleSignInButton } from './GoogleSignInButton';
import { mapApiUser } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Instagram } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, initialMode = 'signup' }) => {
  const { login, signup, googleLogin, facebookLogin } = useAuth();
  const [socialPending, setSocialPending] = useState<{ provider: 'Google' | 'Facebook'; credential?: string; nonce?: string; accessToken?: string; action: 'register' | 'link' } | null>(null);
  const pendingRequest = useRef(false);
  const [stage, setStage] = useState(1);
  const [providerNotice, setProviderNotice] = useState('');
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (isOpen) { setMode(initialMode); setStage(1); setProviderNotice(''); setError(''); setPassword(''); setSocialPending(null); }
  }, [isOpen, initialMode]);
  if (!isOpen) return null;

  const complete = (user: any) => { onSuccess(mapApiUser(user)); setSocialPending(null); setPassword(''); };
  const googleCredential = async (credential: string, nonce: string) => {
    if (pendingRequest.current) return;
    pendingRequest.current = true; setBusy(true); setError(''); setProviderNotice('');
    try {
      const response = await googleLogin({ credential, nonce });
      if (response.status === 'authenticated') { complete(response.user); return; }
      const action = response.status === 'link_required' ? 'link' : 'register';
      setSocialPending({ provider: 'Google', credential, nonce, action });
      setMode(action === 'link' ? 'login' : 'signup');
      setName(response.profile.name); setEmail(response.profile.email); setPassword('');
      setCpf(''); setPhone(''); setStage(2);
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível entrar com o Google.'); }
    finally { pendingRequest.current = false; setBusy(false); }
  };

  const facebookToken = async (accessToken: string) => {
    if (pendingRequest.current) return;
    pendingRequest.current = true; setBusy(true); setError(''); setProviderNotice('');
    try {
      const response = await facebookLogin({ accessToken });
      if (response.status === 'authenticated') { complete(response.user); return; }
      const action = response.status === 'link_required' ? 'link' : 'register';
      setSocialPending({ provider: 'Facebook', accessToken, action });
      setMode(action === 'link' ? 'login' : 'signup');
      setName(response.profile.name); setEmail(response.profile.email); setPassword('');
      setCpf(''); setPhone(''); setStage(2);
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível entrar com Facebook.'); }
    finally { pendingRequest.current = false; setBusy(false); }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (pendingRequest.current) return;
    setError('');
    if (stage === 1) { setStage(2); return; }
    if (mode === 'signup' && !validateCPF(cpf)) { setError('Confira os dígitos do CPF.'); return; }
    if (mode === 'signup' && !/^\d{10,11}$/.test(phone.replace(/\D/g, ''))) { setError('Informe o telefone com DDD.'); return; }
    pendingRequest.current = true;
    setBusy(true);
    try {
      if (socialPending) {
        const response = await (socialPending.provider === 'Facebook' ? facebookLogin : googleLogin)({ ...socialPending, name: name.trim(), password,
          cpf: cpf.replace(/\D/g, ''), phone: phone.replace(/\D/g, '') });
        if (response.status !== 'authenticated') throw new Error('Volte e escolha sua conta novamente.');
        complete(response.user);
        return;
      }
      const response = mode === 'signup'
        ? await signup({ name: name.trim(), email: email.trim(), password, cpf: cpf.replace(/\D/g, ''), phone: phone.replace(/\D/g, '') })
        : await login({ email: email.trim(), password });
      onSuccess(mapApiUser(response.user));
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir. Tente novamente.');
    } finally { pendingRequest.current = false; setBusy(false); }
  };
  const fieldClass = 'w-full rounded-xl border border-neutral-300 bg-neutral-50 p-3 text-base outline-none focus:border-teal-700';
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
    <section role="dialog" aria-modal="true" aria-labelledby="auth-title" className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
      <header className="flex items-center justify-between border-b border-neutral-100 p-5"><Logo /><button type="button" aria-label="Fechar cadastro" disabled={busy} onClick={onClose}><X /></button></header>
      <div className="space-y-4 p-6">
        <div className="flex rounded-xl bg-neutral-100 p-1">{(['signup', 'login'] as const).map(item => <button key={item} disabled={busy} type="button" onClick={() => { setSocialPending(null); setPassword(''); setMode(item); setStage(1); setProviderNotice(''); setError(''); }} className={`flex-1 rounded-lg p-2 text-sm ${mode === item ? 'bg-white text-teal-800 shadow-sm' : 'text-neutral-600'}`}>{item === 'signup' ? 'Criar conta' : 'Entrar com senha'}</button>)}</div>
        <h2 id="auth-title" className="text-center text-xl font-bold">{mode === 'signup' ? 'Cadastre-se no Comércio Popular' : 'Acesse sua conta'}</h2>
        <div className="flex items-center justify-between text-sm text-neutral-600" aria-live="polite"><span>Etapa {stage} de 2</span><span>{stage === 1 ? 'Identificação' : mode === 'signup' ? 'Dados e senha' : 'Senha'}</span></div>
        {stage === 1 && <>
          <div className="grid grid-cols-4 gap-2">
            <GoogleSignInButton onCredential={googleCredential} disabled={busy} />
            <FacebookSignInButton disabled={busy} onToken={facebookToken} onError={setError} />
            {['TikTok', 'Instagram'].map(provider => <button disabled={busy} type="button" key={provider} aria-label={`Entrar com ${provider} — indisponível`} title={`Entrar com ${provider} — indisponível`} onClick={() => setProviderNotice(provider === 'Instagram' ? 'O Instagram oferece conexão para contas profissionais. Para entrar na loja, use seu e-mail.' : `O acesso com ${provider} ainda não foi ativado. Continue com seu e-mail e senha.`)} className="flex h-14 items-center justify-center rounded-xl border border-neutral-200 bg-white hover:border-teal-600 focus-visible:outline-2 focus-visible:outline-teal-700">
              {provider === 'Instagram' ? <Instagram aria-hidden="true" size={32} className="text-pink-600" /> : <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M16.6 2c.4 2.8 2 4.5 4.4 4.7v3.2a9.2 9.2 0 0 1-4.4-1.3v7.1a6.3 6.3 0 1 1-5.4-6.2v3.3a3.1 3.1 0 1 0 2.2 3V2z" /></svg>}
            </button>)}
          </div>
          {providerNotice && <p role="status" className="rounded-xl bg-teal-50 p-3 text-sm text-teal-900">{providerNotice}</p>}
          <div className="flex items-center gap-3 text-sm text-neutral-500"><span className="h-px flex-1 bg-neutral-200" />Continue com e-mail<span className="h-px flex-1 bg-neutral-200" /></div>
        </>}
        <form onSubmit={submit} className="space-y-3">
          {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <fieldset disabled={busy} className="space-y-3">
            {socialPending && <>
              <p className="rounded-xl bg-teal-50 p-3 text-sm text-teal-900">{socialPending.action === 'link'
                ? `Este e-mail já tem cadastro. Confirme sua senha do Comércio Popular para vincular o ${socialPending.provider}.`
                : socialPending.provider === 'Google' ? 'Complete seu CPF e telefone para entrar com Google.' : 'Complete seu cadastro e crie uma senha da loja para também entrar com e-mail.'}</p>
              <label className="block text-sm">E-mail do {socialPending.provider}<input readOnly type="email" className={fieldClass} value={email} /></label>
              {socialPending.action === 'register' && <label className="block text-sm">Nome completo<input required maxLength={150} autoComplete="name" className={fieldClass} value={name} onChange={e => setName(e.target.value)} /></label>}
            </>}
            {stage === 1 && mode === 'signup' && <label className="block text-sm">Nome completo<input required maxLength={150} autoComplete="name" className={fieldClass} value={name} onChange={e => setName(e.target.value)} /></label>}
            {stage === 1 && <label className="block text-sm">E-mail<input type="email" required maxLength={150} autoComplete="email" className={fieldClass} value={email} onChange={e => setEmail(e.target.value)} /></label>}
            {stage === 2 && mode === 'signup' && <><label className="block text-sm">CPF<input required inputMode="numeric" maxLength={14} className={fieldClass} value={cpf} onChange={e => setCpf(maskCPF(e.target.value))} /></label><label className="block text-sm">Telefone com DDD<input required type="tel" autoComplete="tel" className={fieldClass} value={phone} onChange={e => setPhone(maskPhone(e.target.value))} /></label></>}
            {stage === 2 && socialPending?.provider !== 'Google' && <label className="block text-sm">Senha<div className="relative"><input required minLength={6} type={visible ? 'text' : 'password'} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} className={`${fieldClass} pr-12`} value={password} onChange={e => setPassword(e.target.value)} /><button type="button" aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-3 top-3" onClick={() => setVisible(!visible)}>{visible ? <EyeOff /> : <Eye />}</button></div></label>}
            <button type="submit" className="w-full rounded-xl bg-teal-700 p-3 font-semibold text-white disabled:opacity-60">{busy ? 'Aguarde...' : stage === 1 ? 'Continuar' : socialPending?.action === 'link' ? 'Vincular e entrar' : mode === 'signup' ? 'Criar conta' : 'Entrar'}</button>
            {stage === 2 && <button type="button" onClick={() => { setSocialPending(null); setPassword(''); setStage(1); setError(''); }} className="w-full rounded-xl border border-neutral-200 p-3">Voltar</button>}
          </fieldset>
        </form>
      </div>
    </section>
  </div>;
};
