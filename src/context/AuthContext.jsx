import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

function validUser(user) {
  return user && typeof user.id === 'string' && typeof user.name === 'string' && typeof user.email === 'string';
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
      if (!validUser(response.user)) throw new Error('Resposta de sessão inválida.');
      if (active && generation.current === version) setUser(response.user);
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
    if (['googleLogin', 'facebookLogin'].includes(method) && ['registration_required', 'link_required'].includes(data.status)) {
      return data;
    }
    if (!validUser(data.user) || typeof data.token !== 'string' || !data.token) {
      throw new Error('O servidor não confirmou a sessão.');
    }
    if (version !== generation.current) throw new Error('Operação de login cancelada.');
    localStorage.setItem('cp_token', data.token);
    setUser(data.user);
    setLoading(false);
    return data;
  }

  const login = payload => authenticate('login', payload);
  const googleLogin = payload => authenticate('googleLogin', payload);
  const facebookLogin = payload => authenticate('facebookLogin', payload);
  const signup = payload => authenticate('signup', payload);

  async function completeTikTokSignup(payload) {
    const data = await api.tiktokComplete(payload);
    if (!validUser(data.user) || typeof data.token !== 'string' || !data.token) {
      throw new Error('O servidor não confirmou o cadastro com TikTok.');
    }
    generation.current += 1;
    localStorage.setItem('cp_token', data.token);
    setUser(data.user);
    setLoading(false);
    return data;
  }

  function loginWithToken(token, userData) {
    if (typeof token !== 'string' || !token) throw new Error('Token de sessão inválido.');
    generation.current += 1;
    localStorage.setItem('cp_token', token);
    setUser(validUser(userData) ? userData : null);
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
