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
    if (!localStorage.getItem('cp_token')) { setLoading(false); return; }
    api.me().then(response => {
      if (!validUser(response.user)) throw new Error('Resposta de sessão inválida.');
      if (active && generation.current === version) setUser(response.user);
    }).catch(() => {
      if (active && generation.current === version) { localStorage.removeItem('cp_token'); setUser(null); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function authenticate(method, payload) {
    const version = ++generation.current;
    const data = await api[method](payload);
    if (['googleLogin', 'facebookLogin'].includes(method) && ['registration_required', 'link_required'].includes(data.status)) {
      if (!data.profile || typeof data.profile.email !== 'string' || typeof data.profile.name !== 'string') throw new Error('Resposta de autenticação inválida.');
      return data;
    }
    if (!validUser(data.user) || typeof data.token !== 'string' || !data.token) throw new Error('O servidor não confirmou a sessão.');
    if (version !== generation.current) throw new Error('Operação de login cancelada.');
    localStorage.setItem('cp_token', data.token);
    setUser(data.user); setLoading(false);
    return data;
  }
  const login = payload => authenticate('login', payload);
  const googleLogin = payload => authenticate('googleLogin', payload);
  const facebookLogin = payload => authenticate('facebookLogin', payload);
  const signup = payload => authenticate('signup', payload);
  function logout() {
    generation.current++;
    localStorage.removeItem('cp_token');
    setUser(null); setLoading(false);
  }
  return <AuthContext.Provider value={{ user, loading, login, signup, googleLogin, facebookLogin, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
