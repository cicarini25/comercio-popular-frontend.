import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, X, XCircle } from 'lucide-react';
import { api } from '../../services/api';

type Application = {
  id: string;
  plan: string;
  entity_type: string;
  store_name: string;
  legal_name: string;
  business_activity: string;
  street: string;
  address_number: string;
  neighborhood: string;
  cep: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  document_number: string;
  status: string;
  payment_status: string;
  payment_url?: string | null;
  created_at: string;
};

export const MerchantApplicationsAdmin: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { const result = await api.getAdminMerchantApplications(); setApplications(result.applications || []); }
    catch (err) { setError(err instanceof Error ? err.message : 'Acesso administrativo não configurado.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isOpen) load(); }, [isOpen]);
  if (!isOpen) return null;

  const review = async (application: Application, status: 'approved' | 'rejected') => {
    setBusyId(application.id); setError('');
    try { const result = await api.reviewMerchantApplication(application.id, status); setApplications((current) => current.map((item) => item.id === application.id ? { ...item, status: result.status, payment_url: result.paymentUrl || item.payment_url, payment_status: result.paymentUrl ? 'pending' : item.payment_status } : item)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível concluir a análise.'); }
    finally { setBusyId(''); }
  };

  return <div className="fixed inset-0 z-[80] overflow-y-auto bg-neutral-950/60 p-4"><section role="dialog" aria-modal="true" aria-label="Análise de cadastros" className="mx-auto max-w-6xl rounded-3xl bg-white shadow-2xl"><header className="flex items-center justify-between rounded-t-3xl bg-teal-950 px-6 py-4 text-white"><div><h2 className="text-lg font-extrabold">Análise de comerciantes</h2><p className="text-xs text-teal-200">Aprovação antes da assinatura e ativação da loja.</p></div><button type="button" onClick={onClose} aria-label="Fechar análise" className="rounded-full p-2 hover:bg-white/10"><X size={20} /></button></header><main className="space-y-4 p-5 sm:p-6">{error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}{loading ? <div className="flex items-center justify-center gap-2 p-10 text-sm text-neutral-600"><Loader2 className="animate-spin" size={18} /> Carregando cadastros…</div> : applications.length === 0 ? <p className="rounded-xl bg-neutral-50 p-6 text-sm text-neutral-600">Nenhum cadastro encontrado.</p> : <div className="space-y-3">{applications.map((application) => <article key={application.id} className="rounded-2xl border border-neutral-200 p-4"><div className="flex flex-col justify-between gap-3 lg:flex-row"><div><h3 className="font-bold text-neutral-900">{application.store_name}</h3><p className="text-sm text-neutral-600">{application.legal_name} · {application.entity_type} · {application.document_number}</p><p className="text-xs text-neutral-500">{application.business_activity} · {application.city}/{application.state} · {application.email}</p><p className="mt-1 text-xs font-semibold text-neutral-600">Plano: {application.plan} · Status: {application.status} · Pagamento: {application.payment_status}</p></div><div className="flex shrink-0 items-center gap-2">{application.status === 'pending' && <><button disabled={busyId === application.id} type="button" onClick={() => review(application, 'rejected')} className="inline-flex items-center gap-1 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50"><XCircle size={15} /> Recusar</button><button disabled={busyId === application.id} type="button" onClick={() => review(application, 'approved')} className="inline-flex items-center gap-1 rounded-xl bg-teal-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><CheckCircle2 size={15} /> Aprovar</button></>}{application.payment_url && <a href={application.payment_url} target="_blank" rel="noreferrer" className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white">Abrir pagamento</a>}</div></div></article>)}</div>}</main></section></div>;
};

