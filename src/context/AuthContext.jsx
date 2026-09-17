import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

function validUser(user) {
  return user && typeof user.id === 'string' && typeof user.name === 'string';
}

function normalizeUser(user) {
  if (!validUser(user)) return null;
  return {
    ...user,
    email: typeof user.email === 'string' ? user.email : '',
    cpf: user.cpf || '',
    phone: user.phone || '',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const generation = useRef(0);

  useEffect(() => {
    let active = true;
    const version = generation.current;
    if (!localStorage.getItem('cp_token')) {
      setLoading(false);
      return undefined;
    }

    api.me().then((response) => {
      const normalized = normalizeUser(response.user);
      if (!normalized) throw new Error('Resposta de sessão inválida.');
      if (active && generation.current === version) setUser(normalized);
    }).catch(() => {
      if (active && generation.current === version) {
        localStorage.removeItem('cp_token');
        setUser(null);
      }
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, []);

  async function authenticate(method, payload) {
    const version = ++generation.current;
    const data = await api[method](payload);
    if (['googleLogin', 'facebookLogin'].includes(method) && ['registration_required', 'link_required', 'legal_required'].includes(data.status)) {
      return data;
    }
    const normalized = normalizeUser(data.user);
    if (!normalized || typeof data.token !== 'string' || !data.token) {
      throw new Error('O servidor não confirmou a sessão.');
    }
    if (version !== generation.current) throw new Error('Operação de login cancelada.');
    localStorage.setItem('cp_token', data.token);
    setUser(normalized);
    setLoading(false);
    return { ...data, user: normalized };
  }

  const login = payload => authenticate('login', payload);
  const googleLogin = payload => authenticate('googleLogin', payload);
  const facebookLogin = payload => authenticate('facebookLogin', payload);
  const signup = payload => authenticate('signup', payload);

  async function completeTikTokSignup(payload) {
    const data = await api.tiktokComplete(payload);
    const normalized = normalizeUser(data.user);
    if (!normalized || typeof data.token !== 'string' || !data.token) {
      throw new Error('O servidor não confirmou o cadastro com TikTok.');
    }
    generation.current += 1;
    localStorage.setItem('cp_token', data.token);
    setUser(normalized);
    setLoading(false);
    return { ...data, user: normalized };
  }

  async function acceptSocialLegal(legalToken) {
    const data = await api.acceptLegal(legalToken);
    const normalized = normalizeUser(data.user);
    if (!normalized || typeof data.token !== 'string' || !data.token) {
      throw new Error('O servidor não confirmou a aceitação das regras.');
    }
    generation.current += 1;
    localStorage.setItem('cp_token', data.token);
    setUser(normalized);
    setLoading(false);
    return { ...data, user: normalized };
  }

  function loginWithToken(token, userData) {
    if (typeof token !== 'string' || !token) throw new Error('Token de sessão inválido.');
    generation.current += 1;
    localStorage.setItem('cp_token', token);
    setUser(normalizeUser(userData));
    setLoading(false);
  }

  function logout() {
    generation.current += 1;
    localStorage.removeItem('cp_token');
    setUser(null);
    setLoading(false);
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      googleLogin,
      facebookLogin,
      completeTikTokSignup,
      acceptSocialLegal,
      loginWithToken,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
