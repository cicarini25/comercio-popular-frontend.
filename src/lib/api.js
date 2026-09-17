const API_URL = (import.meta.env.VITE_API_URL || 'https://comercio-popular-backend-production.up.railway.app/api').replace(/\/+$/, '');
async function request(path, options = {}) {
  const token = localStorage.getItem('cp_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers, signal: AbortSignal.timeout(20000) });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.message || data?.error || 'Não foi possível concluir a operação.');
  if (!data || typeof data !== 'object') throw new Error('O servidor retornou uma resposta inválida.');
  return data;
}
export const api = {
  login: payload => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  signup: payload => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  googleConfig: () => request('/auth/google/config'),
  googleLogin: async payload => {
    const data = await request('/auth/google', { method: 'POST', body: JSON.stringify({ idToken: payload.credential, ...(payload.cpf ? { cpf: payload.cpf, phone: payload.phone } : {}) }) });
    return data.needsSignupInfo ? { status: 'registration_required', profile: { email: data.email, name: data.name } } : { ...data, status: data.status || 'authenticated' };
  },
  facebookConfig: () => request('/auth/facebook/config'),
  facebookLogin: payload => request('/auth/facebook', { method: 'POST', body: JSON.stringify(payload) }),
  tiktokStartUrl: () => `${API_URL}/auth/tiktok`,
  tiktokExchange: code => request('/auth/tiktok/exchange', { method: 'POST', body: JSON.stringify({ code }) }),
  tiktokComplete: payload => request('/auth/tiktok/complete', { method: 'POST', body: JSON.stringify(payload) }),
  acceptLegal: legalToken => request('/auth/legal/accept', { method: 'POST', body: JSON.stringify({ legalToken, accepted: true }) }),
  me: () => request('/auth/me')
};
