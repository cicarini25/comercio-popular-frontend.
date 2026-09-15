import React from 'react';
import { Logo } from '../common/Logo';
import {
  ShieldCheck,
  Truck,
  QrCode,
  CreditCard,
  Lock,
  Flame,
  Store,
  ExternalLink,
  Heart
} from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: string) => void;
  onOpenSellerSection: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab, onOpenSellerSection }) => {
  return (
    <footer className="bg-neutral-900 text-neutral-300 border-t border-neutral-800 mt-16 text-xs">
      {/* Top Value Propositions Strip */}
      <div className="border-b border-neutral-800 py-8 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-900/60 text-teal-400 flex items-center justify-center shrink-0">
              <QrCode size={20} />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">Pix e Cartão em até 12x</h5>
              <p className="text-neutral-400 text-xs mt-0.5">
                Pagamentos integrados com split automático e confirmação imediata.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-900/60 text-teal-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">Segurança em 2 Camadas</h5>
              <p className="text-neutral-400 text-xs mt-0.5">
                Verificação por biometria e SMS em preparação.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-900/60 text-teal-400 flex items-center justify-center shrink-0">
              <Flame size={20} className="text-coral-400" />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">Achadinhos Verificados</h5>
              <p className="text-neutral-400 text-xs mt-0.5">
                Curadoria diária de promoções no Mercado Livre, Shopee, Amazon e AliExpress.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-900/60 text-teal-400 flex items-center justify-center shrink-0">
              <Store size={20} />
            </div>
            <div>
              <h5 className="font-bold text-white text-sm">Assinatura Barata p/ Lojista</h5>
              <p className="text-neutral-400 text-xs mt-0.5">
                Zero comissão sobre vendas para comerciantes parceiros locais.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Col 1: Brand & Manifesto */}
        <div className="space-y-3 md:col-span-1">
          <div className="bg-white p-2 rounded-2xl w-fit">
            <Logo size="md" />
          </div>
          <p className="text-neutral-400 text-xs leading-relaxed">
            O marketplace brasileiro híbrido que conecta os melhores achadinhos de grandes redes e empodera pequenos comerciantes locais com tecnologia e tráfego pago constante.
          </p>
          <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs">
            <Lock size={13} />
            <span>Ambiente 100% Criptografado</span>
          </div>
        </div>

        {/* Col 2: Achadinhos & Afiliados */}
        <div className="space-y-2.5">
          <h5 className="font-bold text-white text-sm">Achadinhos de Afiliados</h5>
          <ul className="space-y-1.5 text-neutral-400">
            <li>
              <button
                onClick={() => onSelectTab('achadinhos')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Ofertas Shopee Virais
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('achadinhos')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Melhores do Mercado Livre
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('achadinhos')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Achadinhos Amazon Brasil
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('achadinhos')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Importações AliExpress
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('achadinhos')}
                className="hover:text-white transition-colors cursor-pointer text-coral-400 font-semibold"
              >
                🔥 Produtos abaixo de R$ 50
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectTab('favoritos')}
                className="hover:text-rose-400 transition-colors cursor-pointer text-rose-300 font-medium flex items-center gap-1.5"
              >
                <Heart size={12} className="fill-rose-400 text-rose-400" />
                <span>Minha Lista de Favoritos</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Área do Vendedor */}
        <div className="space-y-2.5">
          <h5 className="font-bold text-white text-sm">Comerciantes Parceiros</h5>
          <ul className="space-y-1.5 text-neutral-400">
            <li>
              <button
                onClick={onOpenSellerSection}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Planos de Assinatura (a partir de R$ 39,90)
              </button>
            </li>
            <li>
              <button
                onClick={onOpenSellerSection}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Como Funciona o Split de Pagamento
              </button>
            </li>
            <li>
              <button
                onClick={onOpenSellerSection}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Vantagens do Frete por Conta do Vendedor
              </button>
            </li>
            <li>
              <button
                onClick={onOpenSellerSection}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Selo de Comerciante Verificado
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Segurança & Contato */}
        <div className="space-y-2.5">
          <h5 className="font-bold text-white text-sm">Segurança & Automação</h5>
          <ul className="space-y-1.5 text-neutral-400">
            <li>Biometria facial — em preparação</li>
            <li>Verificação por SMS — em preparação</li>
            <li>Atendimento inteligente via WhatsApp e n8n</li>
            <li>Split de pagamento Mercado Pago / Pagar.me</li>
          </ul>
          <div className="pt-2">
            <a
              href="https://wa.me/5541996184115?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20o%20Com%C3%A9rcio%20Popular"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors"
            >
              <span>Suporte Oficial WhatsApp</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Disclaimer */}
      <div className="border-t border-neutral-800 py-6 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-neutral-500 text-[11px]">
          <p>
            © {new Date().getFullYear()} Comércio Popular Ltda. CNPJ: 49.821.042/0001-90. Todos os direitos reservados.
          </p>
          <p className="flex items-center gap-1">
            Feito com dedicação para o comércio brasileiro.
          </p>
        </div>
      </div>
    </footer>
  );
};
