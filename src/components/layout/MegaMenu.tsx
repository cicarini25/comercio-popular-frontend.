import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Grid2X2, Sparkles, X } from 'lucide-react';
import { CATEGORY_MENU, CategoryMenuGroup } from '../../data/categoryMenu';
import { CategoryIcon } from '../common/CategoryPicker';

interface MegaMenuProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryCounts?: Record<string, number>;
  groups?: CategoryMenuGroup[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const getCountLabel = (category: string, categoryCounts?: Record<string, number>) => {
  const count = categoryCounts?.[category];
  return typeof count === 'number' && count > 0 ? `${count.toLocaleString('pt-BR')} produtos` : null;
};

export const MegaMenu: React.FC<MegaMenuProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  groups = CATEGORY_MENU,
  open: controlledOpen,
  onOpenChange,
}) => {
  const [localOpen, setLocalOpen] = useState(false);
  const open = controlledOpen ?? localOpen;
  const setOpen = (nextOpen: boolean) => onOpenChange ? onOpenChange(nextOpen) : setLocalOpen(nextOpen);
  const [activeGroup, setActiveGroup] = useState<CategoryMenuGroup>(groups[0] || CATEGORY_MENU[0]);
  const [mobileView, setMobileView] = useState<'groups' | 'items'>('groups');
  const rootRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setOpen(false), 180);
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      cancelClose();
    };
  }, []);

  useEffect(() => {
    if (!groups.some((group) => group.label === activeGroup.label)) setActiveGroup(groups[0] || CATEGORY_MENU[0]);
  }, [groups, activeGroup.label]);

  useEffect(() => {
    if (open) setMobileView('groups');
  }, [open]);

  const chooseCategory = (category: string) => {
    onSelectCategory(category);
    setOpen(false);
    setMobileView('groups');
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
      onFocus={cancelClose}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget as Node | null;
        if (!nextTarget || !event.currentTarget.contains(nextTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        id="btn-open-category-menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onClick={() => { setMobileView('groups'); setOpen(true); }}
        className="group inline-flex min-h-10 items-center gap-2 rounded-xl bg-teal-700 px-3 py-2 text-xs font-extrabold text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:text-sm"
      >
        <Grid2X2 size={16} />
        <span className="hidden sm:inline">Todas as Categorias</span>
        <span className="sm:hidden">Categorias</span>
        <ChevronRight size={14} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>

      {open && (
        <div
          id="category-menu-desktop"
          role="dialog"
          aria-label="Menu de categorias do Comércio Popular"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
          className="absolute left-0 top-[calc(100%+0.55rem)] z-[70] hidden w-[min(92vw,960px)] overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-[0_22px_70px_rgba(4,33,25,0.18)] lg:flex"
        >
          <div className="w-64 shrink-0 border-r border-neutral-100 bg-neutral-50/80 p-3">
            <div className="flex items-center justify-between px-3 pb-3 pt-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-700">Navegue por</p>
                <h2 className="mt-1 text-sm font-black text-neutral-900">Categorias</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-white hover:text-neutral-700 focus-visible:outline-2 focus-visible:outline-teal-700"
                aria-label="Fechar menu de categorias"
              >
                <X size={15} />
              </button>
            </div>
            <div className="space-y-1">
              {groups.map((group) => {
                const Icon = group.icon;
                const isActive = activeGroup.label === group.label;
                return (
                  <button
                    key={group.label}
                    type="button"
                    onMouseEnter={() => setActiveGroup(group)}
                    onFocus={() => setActiveGroup(group)}
                    onClick={() => { setActiveGroup(group); setMobileView('items'); }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-teal-700 ${
                      isActive ? 'bg-white text-teal-800 shadow-sm' : 'text-neutral-600 hover:bg-white/80 hover:text-teal-800'
                    }`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${isActive ? 'bg-teal-100 text-teal-800' : 'bg-white text-neutral-500'}`}>
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">{group.label}</span>
                    <ChevronRight size={14} className={isActive ? 'text-teal-700' : 'text-neutral-300'} />
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => chooseCategory('Todas as Categorias')}
              className="mt-3 flex w-full items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5 text-left text-xs font-black text-teal-800 transition hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-teal-700"
            >
              <Sparkles size={14} />
              Ver todo o catálogo
            </button>
          </div>

          <div className="min-w-0 flex-1 p-6">
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-coral-700">Explore agora</p>
                <h3 className="mt-1 text-xl font-black text-neutral-950">{activeGroup.label}</h3>
                <p className="mt-1 text-xs text-neutral-500">Escolha uma categoria para abrir a vitrine filtrada.</p>
              </div>
              <span className="hidden rounded-full bg-coral-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-coral-800 sm:inline-flex">Ofertas em destaque</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {activeGroup.items.map((item) => {
                const countLabel = getCountLabel(item.category, categoryCounts);
                return (
                  <button
                    key={`${activeGroup.label}-${item.label}`}
                    type="button"
                    onClick={() => chooseCategory(item.category)}
                    className={`group/item flex min-h-[76px] flex-col items-start justify-between rounded-2xl border p-3 text-left transition hover:-translate-y-0.5 hover:border-teal-300 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                      selectedCategory === item.category ? 'border-teal-300 bg-teal-50' : 'border-neutral-100 bg-white'
                    }`}
                  >
                    <span className="flex w-full items-center justify-between gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-50 text-teal-700 transition group-hover/item:bg-white">
                        <CategoryIcon category={item.category} />
                      </span>
                      <ChevronRight size={13} className="text-neutral-300 transition group-hover/item:translate-x-0.5 group-hover/item:text-teal-700" />
                    </span>
                    <span className="mt-2 text-xs font-extrabold leading-tight text-neutral-800">{item.label}</span>
                    {countLabel && <span className="mt-1 text-[10px] font-medium text-neutral-400">{countLabel}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {open && (
        <div id="category-menu-mobile" role="dialog" aria-label="Categorias" className="absolute left-0 top-[calc(100%+0.55rem)] z-[70] block max-h-[calc(100vh-10rem)] w-[min(94vw,420px)] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-3 shadow-[0_22px_70px_rgba(4,33,25,0.18)] lg:hidden">
          <div className="flex items-center justify-between border-b border-neutral-100 px-2 pb-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-700">Navegue por</p>
              <h2 className="mt-1 text-sm font-black text-neutral-900">{mobileView === 'groups' ? 'Categorias' : activeGroup.label}</h2>
            </div>
            <div className="flex items-center gap-1">
              {mobileView === 'items' && (
                <button
                  type="button"
                  onClick={() => setMobileView('groups')}
                  className="rounded-lg px-2 py-1.5 text-[11px] font-black text-teal-700 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-teal-700"
                  aria-label="Voltar para departamentos"
                >
                  Voltar
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 focus-visible:outline-2 focus-visible:outline-teal-700"
                aria-label="Fechar categorias"
              >
                <X size={15} />
              </button>
            </div>
          </div>
          {mobileView === 'groups' ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {groups.map((group) => {
                const Icon = group.icon;
                return (
                  <button
                    key={group.label}
                    type="button"
                    onClick={() => { setActiveGroup(group); setMobileView('items'); }}
                    className="flex min-h-14 items-center gap-2 rounded-xl border border-neutral-100 px-2.5 py-2 text-left text-[11px] font-extrabold text-neutral-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-teal-700"
                  >
                    <Icon size={15} className="shrink-0" />
                    <span className="leading-tight">{group.label}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-3 rounded-xl bg-neutral-50 p-2">
              <p className="px-2 pb-1 text-[10px] font-black uppercase tracking-wide text-neutral-400">Subcategorias de {activeGroup.label}</p>
              <div className="grid grid-cols-2 gap-1">
                {activeGroup.items.map((item) => (
                  <button
                    key={`mobile-${activeGroup.label}-${item.label}`}
                    type="button"
                    onClick={() => chooseCategory(item.category)}
                    className="flex min-h-10 items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-bold text-neutral-700 hover:bg-white hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-teal-700"
                  >
                    <CategoryIcon category={item.category} />
                    <span className="leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => chooseCategory('Todas as Categorias')}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-3 py-2.5 text-xs font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            <Sparkles size={14} />
            Ver todo o catálogo
          </button>
        </div>
      )}
    </div>
  );
};

