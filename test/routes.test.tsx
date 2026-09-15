import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import App from '../src/App';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

const user = { id: 'test-user', name: 'Pessoa Teste', email: 'person@example.test', cpf: '52998224725', phone: '41999999999', is_seller: false };
function Path() { return <output data-testid="path">{useLocation().pathname}</output>; }
function mount(path: string) {
 return render(<MemoryRouter initialEntries={[path]}><AuthProvider><Path/><App/></AuthProvider></MemoryRouter>);
}
function mockSession() {
 localStorage.setItem('cp_token', 'test-only-token');
 vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ user }) }));
}
describe('rotas recuperadas', () => {
 for (const path of ['/', '/achadinhos', '/lojas', '/vender', '/favoritos', '/pedidos', '/sacola']) {
  test(`renderiza ${path}`, async () => {
   const view = mount(path);
   await waitFor(() => expect(view.container.querySelector('header')).not.toBeNull());
   expect(view.container.querySelector('main')).not.toBeNull();
   expect(screen.getByTestId('path').textContent).toBe(path);
   if (path === '/favoritos') expect(screen.getAllByText(/Favoritos/).length).toBeGreaterThan(0);
   if (path === '/pedidos') expect(screen.getByText('Meus Pedidos & Rastreamento')).toBeTruthy();
   if (path === '/sacola') expect(screen.getByText('Minha Sacola de Compras')).toBeTruthy();
  });
 }
 for (const path of ['/login', '/cadastro', '/conta', '/vendedor']) {
  test(`exibe autenticação em ${path} sem sessão`, async () => {
   mount(path);
   expect(await screen.findByRole('dialog', { name: /Acesse sua conta|Cadastre-se/ })).toBeTruthy();
  });
 }
 test('Minha Conta restaura user da resposta /me e Sair encerra sessão', async () => {
  mockSession(); mount('/conta');
  expect(await screen.findByText('Minha Conta — Pessoa Teste')).toBeTruthy();
  const out = screen.getByRole('button', { name: /Sair/ });
  fireEvent.click(out);
  await waitFor(() => expect(localStorage.getItem('cp_token')).toBeNull());
  expect(screen.getByTestId('path').textContent).toBe('/');
 });
 test('vendedor abre os componentes originais com sessão', async () => {
  mockSession(); mount('/vendedor');
  await waitFor(() => expect(screen.queryByRole('dialog', { name: /Acesse sua conta/ })).toBeNull());
  expect((await screen.findAllByText(/Visão Geral/)).length).toBeGreaterThan(0);
 });
 test('botões de navegação alteram a rota', async () => {
  mount('/');
  fireEvent.click(screen.getByRole('button', { name: 'Meus Pedidos' }));
  expect(screen.getByTestId('path').textContent).toBe('/pedidos');
  fireEvent.click(screen.getByRole('button', { name: 'Início' }));
  expect(screen.getByTestId('path').textContent).toBe('/');
 });
});

function AuthProbe() {
 const auth = useAuth();
 return <><button onClick={() => auth.login({ email: 'person@example.test', password: 'test-only-password' })}>Testar contrato</button><span>{auth.user?.name}</span></>;
}
test('login envia objeto email/senha ao endpoint /api/auth/login', async () => {
 const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ user, token: 'test-only-token' }) });
 vi.stubGlobal('fetch', fetchMock);
 render(<AuthProvider><AuthProbe/></AuthProvider>);
 fireEvent.click(screen.getByText('Testar contrato'));
 await screen.findByText('Pessoa Teste');
 expect(fetchMock.mock.calls[0][0]).toBe('https://comercio-popular-backend-production.up.railway.app/api/auth/login');
 expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ email: 'person@example.test', password: 'test-only-password' });
 expect(localStorage.getItem('cp_token')).toBe('test-only-token');
});

function GoogleProbe() {
 const auth = useAuth();
 return <><button onClick={() => auth.googleLogin({credential:'test-only',nonce:'test-nonce'})}>Testar Google</button><span>{auth.user?.name}</span></>;
}
test('Google confirmado pelo backend atualiza a mesma sessão', async () => {
 const fetchMock = vi.fn().mockResolvedValue({ok:true,json:async()=>({status:'authenticated',user,token:'google-test-token'})});
 vi.stubGlobal('fetch',fetchMock);
 render(<AuthProvider><GoogleProbe/></AuthProvider>);
 fireEvent.click(screen.getByText('Testar Google'));
 await screen.findByText('Pessoa Teste');
 expect(localStorage.getItem('cp_token')).toBe('google-test-token');
 expect(fetchMock.mock.calls[0][0]).toContain('/api/auth/google');
});

test('Google usa idToken esperado pelo backend enviado', async () => {
 const fetchMock = vi.fn().mockResolvedValue({ok:true,json:async()=>({user,token:'google-token'})});
 vi.stubGlobal('fetch',fetchMock);
 render(<AuthProvider><GoogleProbe/></AuthProvider>);
 fireEvent.click(screen.getByText('Testar Google'));
 await screen.findByText('Pessoa Teste');
 expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({idToken:'test-only'});
});
