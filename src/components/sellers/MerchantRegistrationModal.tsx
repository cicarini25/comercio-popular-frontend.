import React, { useEffect, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, X } from 'lucide-react';
import { SellerPlan, User } from '../../types';
import { api, MerchantApplicationPayload } from '../../services/api';
import merchantLogo from '../../assets/logo-comercio-popular-verde.png';
import { Logo } from '../common/Logo';
import { FacePresenceCheck } from './FacePresenceCheck';

interface MerchantRegistrationModalProps {
  isOpen: boolean;
  plan: SellerPlan | null;
  user: User | null;
  onClose: () => void;
}

type FormState = Omit<MerchantApplicationPayload, 'plan'> & { plan: string };

const emptyForm: FormState = {
  plan: '',
  entityType: 'PJ',
  storeName: '',
  legalName: '',
  businessActivity: '',
  street: '',
  addressNumber: '',
  neighborhood: '',
  cep: '',
  city: '',
  state: '',
  phone: '',
  email: '',
  documentNumber: '',
  website: '',
  password: ''
};

export const MerchantRegistrationModal: React.FC<MerchantRegistrationModalProps> = ({ isOpen, plan, user, onClose }) => {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !plan) return;
    setForm((previous) => ({
      ...emptyForm,
      ...previous,
      plan: plan.id,
      legalName: user?.name || previous.legalName,
      email: user?.email || previous.email,
      phone: user?.phone || previous.phone,
      documentNumber: user?.cpf || previous.documentNumber
    }));
    setConfirmPassword('');
    setError('');
    setSubmitted(false);
    setExistingApplication(null);
    if (user) {
      api.getMerchantApplications().then(({ applications }) => setExistingApplication(applications[0] || null)).catch(() => setExistingApplication(null));
    }
  }, [isOpen, plan, user]);

  if (!isOpen || !plan) return null;

  const update = (field: keyof FormState, value: string) => setForm((previous) => ({ ...previous, [field]: value }));
  const fieldClass = 'mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (form.password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }
    setBusy(true);
    try {
      await api.submitMerchantApplication(form);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar o cadastro.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-6">
      <section role="dialog" aria-modal="true" aria-label="Cadastro de comerciante" className="w-full max-w-3xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]">
        <header className="flex items-start justify-between gap-4 bg-teal-950 px-6 py-5 text-white sm:px-8">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 min-w-16 items-center justify-center rounded-2xl bg-white p-1">
              <img
                src={merchantLogo}
                alt="Comércio Popular"
                className="h-full w-full rounded-xl object-contain"
                onError={(event) => {
                  event.currentTarget.classList.add('hidden');
                  event.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Logo size="sm" showSubtitle={false} className="hidden scale-90" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-200">Cadastro de comerciante</p>
              <h2 className="mt-1 text-xl font-extrabold">{plan.name}</h2>
              <p className="mt-1 text-sm text-teal-100">Sua solicitação será analisada antes da aprovação da loja.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar cadastro" className="rounded-full p-2 text-teal-100 hover:bg-white/10"><X size={21} /></button>
        </header>

        {submitted ? (
          <div className="px-6 py-12 text-center sm:px-12">
            <CheckCircle2 className="mx-auto text-teal-700" size={54} />
            <h3 className="mt-5 text-2xl font-extrabold text-neutral-900">Cadastro enviado para análise</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-600">Recebemos os dados da sua loja. A equipe do Comércio Popular fará a análise e retornará pelo e-mail informado.</p>
            <button type="button" onClick={onClose} className="mt-7 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800">Concluir</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6 px-6 py-6 sm:px-8">
            <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-950">
              <strong>Plano selecionado:</strong> {plan.name} — {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plan.price)}/{plan.period}
            </div>

            {existingApplication?.status === 'approved_waiting_payment' && existingApplication.payment_url && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                <p className="font-extrabold">Cadastro aprovado. Falta confirmar a assinatura.</p>
                <p className="mt-1">Use o link abaixo para pagar o plano. O selo será liberado após a confirmação do Mercado Pago.</p>
                <a href={existingApplication.payment_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-xl bg-teal-700 px-4 py-2.5 font-bold text-white hover:bg-teal-800">Pagar plano aprovado</a>
              </div>
            )}

            {existingApplication?.status === 'paid' && (
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950">
                <p className="font-extrabold">Assinatura confirmada</p>
                <p className="mt-1">A loja está ativa com o selo Comerciante Parceiro Verificado.</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-neutral-800">Tipo de cadastro
                <select className={fieldClass} value={form.entityType} onChange={(event) => update('entityType', event.target.value)}>
                  <option value="PJ">Pessoa Jurídica (CNPJ)</option>
                  <option value="PF">Pessoa Física (CPF)</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-neutral-800">{form.entityType === 'PJ' ? 'CNPJ' : 'CPF'}
                <input required className={fieldClass} value={form.documentNumber} onChange={(event) => update('documentNumber', event.target.value)} placeholder={form.entityType === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'} />
              </label>
              <label className="text-sm font-semibold text-neutral-800">Nome da loja / nome fantasia
                <input required maxLength={150} className={fieldClass} value={form.storeName} onChange={(event) => update('storeName', event.target.value)} />
              </label>
              <label className="text-sm font-semibold text-neutral-800">{form.entityType === 'PJ' ? 'Razão social' : 'Nome completo'}
                <input required maxLength={180} className={fieldClass} value={form.legalName} onChange={(event) => update('legalName', event.target.value)} />
              </label>
              <label className="text-sm font-semibold text-neutral-800 sm:col-span-2">Ramo de atividade
                <input required maxLength={180} className={fieldClass} value={form.businessActivity} onChange={(event) => update('businessActivity', event.target.value)} placeholder="Ex.: roupas, alimentos, eletrônicos" />
              </label>
            </div>

            <div>
              <h3 className="border-b border-neutral-200 pb-2 text-base font-extrabold text-neutral-900">Endereço da sede</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-neutral-800 sm:col-span-2">Rua / avenida
                  <input required className={fieldClass} value={form.street} onChange={(event) => update('street', event.target.value)} />
                </label>
                <label className="text-sm font-semibold text-neutral-800">Número
                  <input required className={fieldClass} value={form.addressNumber} onChange={(event) => update('addressNumber', event.target.value)} />
                </label>
                <label className="text-sm font-semibold text-neutral-800">Bairro
                  <input required className={fieldClass} value={form.neighborhood} onChange={(event) => update('neighborhood', event.target.value)} />
                </label>
                <label className="text-sm font-semibold text-neutral-800">CEP
                  <input required className={fieldClass} value={form.cep} onChange={(event) => update('cep', event.target.value)} />
                </label>
                <label className="text-sm font-semibold text-neutral-800">Cidade
                  <input required className={fieldClass} value={form.city} onChange={(event) => update('city', event.target.value)} />
                </label>
                <label className="text-sm font-semibold text-neutral-800">Estado (UF)
                  <input required maxLength={2} className={fieldClass} value={form.state} onChange={(event) => update('state', event.target.value.toUpperCase())} placeholder="SP" />
                </label>
              </div>
            </div>

            <div>
              <h3 className="border-b border-neutral-200 pb-2 text-base font-extrabold text-neutral-900">Contato e acesso</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-neutral-800">Telefone
                  <input required type="tel" className={fieldClass} value={form.phone} onChange={(event) => update('phone', event.target.value)} />
                </label>
                <label className="text-sm font-semibold text-neutral-800">E-mail
                  <input required type="email" autoComplete="email" className={fieldClass} value={form.email} onChange={(event) => update('email', event.target.value)} />
                </label>
                <label className="text-sm font-semibold text-neutral-800">Senha de acesso
                  <span className="relative block"><input required minLength={6} type={showPassword ? 'text' : 'password'} autoComplete="new-password" className={`${fieldClass} pr-11`} value={form.password} onChange={(event) => update('password', event.target.value)} /><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-3 top-3 text-neutral-500" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span>
                </label>
                <label className="text-sm font-semibold text-neutral-800">Confirmar senha
                  <input required minLength={6} type={showPassword ? 'text' : 'password'} autoComplete="new-password" className={fieldClass} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
                </label>
                <label className="text-sm font-semibold text-neutral-800 sm:col-span-2">Site ou página da loja (opcional)
                  <input type="url" className={fieldClass} value={form.website} onChange={(event) => update('website', event.target.value)} placeholder="https://" />
                </label>
              </div>
            </div>

            <FacePresenceCheck context="seller-registration" />

            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <p className="text-xs leading-5 text-neutral-500">Ao enviar, você autoriza a análise dos dados cadastrais para aprovação da loja. O cadastro não publica produtos automaticamente.</p>
            <button type="submit" disabled={busy} className="w-full rounded-xl bg-teal-700 px-4 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-60">{busy ? 'Enviando para análise...' : 'Enviar cadastro para análise'}</button>
          </form>
        )}
      </section>
    </div>
  );
};


