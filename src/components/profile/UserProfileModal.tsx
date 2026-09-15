import React, { useEffect, useRef } from 'react';
import {
  X,
  User as UserIcon,
  ShieldCheck,
  Mail,
  Smartphone,
  CreditCard,
  Store,
  Heart,
  PackageCheck,
  LogOut
} from 'lucide-react';
import { User, Product } from '../../types';
import { ProfileNotificationCard } from './ProfileNotificationCard';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  favorites: Product[];
  ordersCount: number;
  onSelectTab: (tab: string) => void;
  onOpenSellerDashboard: () => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  favorites,
  ordersCount,
  onSelectTab,
  onOpenSellerDashboard,
  onLogout
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="bg-teal-950 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-800 text-teal-200 font-bold flex items-center justify-center text-lg shadow-inner">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 id="user-profile-modal-title" className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>Minha Conta — {user.name}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-teal-800/80 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-700">
                  <ShieldCheck size={13} className="text-teal-400" /> Conectado
                </span>
              </h2>
              <p className="text-xs text-teal-300 truncate">{user.email}</p>
            </div>
          </div>

          <button
            id="btn-close-profile-modal"
            type="button"
            onClick={onClose}
            aria-label="Fechar perfil"
            className="p-2 rounded-full hover:bg-teal-900 text-teal-300 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* User Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/80 text-xs">
            <div className="flex items-center gap-2 text-neutral-700">
              <Mail size={15} className="text-teal-700 shrink-0" />
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">E-mail</span>
                <span className="font-semibold text-neutral-800 truncate block">{user.email}</span>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center gap-2 text-neutral-700">
                <Smartphone size={15} className="text-teal-700 shrink-0" />
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">Telefone</span>
                  <span className="font-semibold text-neutral-800">{user.phone}</span>
                </div>
              </div>
            )}

            {user.cpf && (
              <div className="flex items-center gap-2 text-neutral-700">
                <CreditCard size={15} className="text-teal-700 shrink-0" />
                <div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase block">CPF</span>
                  <span className="font-semibold text-neutral-800">{user.cpf}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-neutral-700">
              <ShieldCheck size={15} className="text-teal-600 shrink-0" />
              <div>
                <span className="text-[10px] text-neutral-400 font-bold uppercase block">Segurança KYC</span>
                <span className="font-semibold text-teal-700">Biometria Facial Aprovada</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectTab('favoritos');
              }}
              className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-left hover:bg-rose-100/70 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900">Lista de Desejos</span>
                <Heart size={16} className="text-rose-600 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-xl font-black text-rose-700 mt-1">{favorites.length}</p>
              <span className="text-[11px] text-rose-800">Produtos salvos</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectTab('pedidos');
              }}
              className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-left hover:bg-teal-100/70 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-950">Meus Pedidos</span>
                <PackageCheck size={16} className="text-teal-700 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-xl font-black text-teal-800 mt-1">{ordersCount}</p>
              <span className="text-[11px] text-teal-900">Histórico de compras</span>
            </button>
          </div>

          {/* Notification Card Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Alertas & Notificações Push
            </h3>
            <ProfileNotificationCard
              wishlistCount={favorites.length}
              sampleWishlistProduct={favorites[0]}
            />
          </div>

          {/* Seller Dashboard Link if Seller */}
          {user.isSeller && (
            <div className="p-4 bg-teal-900 text-white rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Store size={20} className="text-teal-300" />
                <div>
                  <p className="text-sm font-bold">Painel do Vendedor Parceiro</p>
                  <p className="text-xs text-teal-200">Gerencie catálogo, pedidos e pagamentos</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSellerDashboard();
                }}
                className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Acessar
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 py-2 px-3 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sair da Conta</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
