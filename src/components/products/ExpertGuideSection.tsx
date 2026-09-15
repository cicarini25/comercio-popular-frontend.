import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Award,
  ChevronDown,
  ChevronUp,
  Share2,
  Tag,
  ThumbsUp,
  SlidersHorizontal,
  BookmarkCheck,
  Info
} from 'lucide-react';
import { Product } from '../../types';
import { fetchExpertGuide, ExpertGuide } from '../../services/aiService';

interface ExpertGuideSectionProps {
  product: Product;
}

type FocusType = 'geral' | 'economia' | 'durabilidade' | 'uso_pratico';

export const ExpertGuideSection: React.FC<ExpertGuideSectionProps> = ({ product }) => {
  const [focus, setFocus] = useState<FocusType>('geral');
  const [guide, setGuide] = useState<ExpertGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const loadGuide = async (selectedFocus: FocusType, forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await fetchExpertGuide(product, selectedFocus, forceRefresh);
      setGuide(data);

      // Initialize checked items from the checklist defaults if not yet modified
      const initialChecked: Record<string, boolean> = {};
      data.checklist.forEach((item) => {
        initialChecked[item.id] = item.defaultChecked;
      });
      setCheckedItems(initialChecked);
    } catch (err) {
      console.error('Erro ao carregar guia:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuide(focus);
  }, [product.id, focus]);

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyTips = () => {
    if (!guide) return;
    const text = `💡 Dicas de Especialista para "${product.title}" (${product.category}):\n\n` +
      `⭐ Veredito (${guide.expertScore}/10 - ${guide.scoreLabel}):\n${guide.verdict}\n\n` +
      `📌 Dicas Chave:\n` +
      guide.tips.map((t, idx) => `${idx + 1}. [${t.tag}] ${t.title}: ${t.description}`).join('\n') +
      `\n\n👤 Ideal para:\n${guide.idealFor}\n\n` +
      `⚠️ Atenção:\n` +
      guide.attentionPoints.map((a) => `• ${a}`).join('\n') +
      `\n\nGuia gerado por IA no Comércio Popular.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const completedChecksCount = guide
    ? guide.checklist.filter((i) => checkedItems[i.id]).length
    : 0;
  const totalChecks = guide ? guide.checklist.length : 0;

  return (
    <section
      id={`section-expert-guide-${product.id}`}
      aria-label="Dicas de Especialista e Guia de Compra"
      className="mt-6 rounded-3xl bg-gradient-to-b from-teal-50/70 via-white to-neutral-50/50 border border-teal-200/80 p-5 sm:p-6 shadow-xs transition-all"
    >
      {/* Header with AI Badge and Expand/Collapse Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-100 pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 font-display flex items-center gap-1.5">
                Dicas de Especialista & Guia de Compra
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                <Sparkles size={11} /> Motor IA Gemini
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-0.5">
              Recomendações e curadoria técnica para <strong className="text-teal-900">{product.category}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            id="btn-expert-copy-tips"
            type="button"
            onClick={handleCopyTips}
            disabled={loading || !guide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-100 active:bg-neutral-200 border border-neutral-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
            title="Copiar dicas e guia para área de transferência"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            <span>{copied ? 'Copiado!' : 'Copiar Dicas'}</span>
          </button>

          <button
            id="btn-expert-regenerate"
            type="button"
            onClick={() => loadGuide(focus, true)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-100/80 hover:bg-teal-200 active:bg-teal-300 border border-teal-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Regenerar análise do especialista com IA"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-teal-700' : 'text-teal-700'} />
            <span className="hidden sm:inline">Regenerar</span>
          </button>

          <button
            id="btn-expert-toggle-expand"
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
            title={expanded ? 'Recolher guia' : 'Expandir guia'}
            aria-expanded={expanded}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4">
          {/* Focus Filter Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-neutral-400 font-semibold flex items-center gap-1 mr-1 shrink-0 text-[11px] uppercase tracking-wider">
              <SlidersHorizontal size={12} /> Foco da IA:
            </span>
            {[
              { id: 'geral', label: '🌟 Visão Geral' },
              { id: 'economia', label: '💰 Custo-Benefício' },
              { id: 'durabilidade', label: '🛡️ Durabilidade' },
              { id: 'uso_pratico', label: '⚡ Uso Prático' }
            ].map((f) => (
              <button
                key={f.id}
                id={`btn-focus-${f.id}`}
                type="button"
                onClick={() => setFocus(f.id as FocusType)}
                className={`px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap cursor-pointer text-xs ${
                  focus === f.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="space-y-3 py-4 animate-pulse">
              <div className="h-16 bg-teal-100/60 rounded-2xl w-full flex items-center px-4 gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-200"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-teal-200 rounded w-1/3"></div>
                  <div className="h-2.5 bg-teal-200/70 rounded w-2/3"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="h-28 bg-neutral-100 rounded-2xl"></div>
                <div className="h-28 bg-neutral-100 rounded-2xl"></div>
                <div className="h-28 bg-neutral-100 rounded-2xl"></div>
              </div>
              <p className="text-center text-xs text-teal-800 font-medium pt-1">
                Consultando o motor de IA para analisar especificações de {product.category}...
              </p>
            </div>
          ) : guide ? (
            <>
              {/* Expert Verdict Card */}
              <div className="p-4 rounded-2xl bg-white border border-teal-100 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800 flex items-center gap-1">
                      <Award size={14} className="text-teal-700" /> Veredito do Especialista
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {guide.scoreLabel}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium">
                    "{guide.verdict}"
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-2 sm:flex-col sm:items-end bg-teal-50/80 px-3.5 py-2 rounded-xl border border-teal-100 w-full sm:w-auto justify-between">
                  <span className="text-[10px] text-teal-800 font-bold uppercase tracking-wider">
                    Nota Especialista
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-teal-900 font-display">
                      {guide.expertScore.toFixed(1)}
                    </span>
                    <span className="text-xs font-bold text-teal-600">/10</span>
                  </div>
                </div>
              </div>

              {/* Tips Grid (3 to 4 cards) */}
              <div>
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Lightbulb size={14} className="text-amber-500" /> Dicas Chave para Esta Compra
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {guide.tips.map((tip, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-neutral-200 hover:border-teal-300 transition-all flex flex-col justify-between space-y-2 shadow-2xs"
                    >
                      <div>
                        <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-100 uppercase mb-1.5">
                          {tip.tag}
                        </span>
                        <h5 className="text-xs font-bold text-neutral-900 leading-snug">
                          {tip.title}
                        </h5>
                        <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2-Column: Ideal For vs Attention Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Ideal For */}
                <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 space-y-1.5 shadow-2xs">
                  <span className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                    <ThumbsUp size={14} className="text-teal-700" /> Perfil Ideal de Uso
                  </span>
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    {guide.idealFor}
                  </p>
                </div>

                {/* Attention Points */}
                <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1.5 shadow-2xs">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-amber-600" /> O que Saber Antes de Comprar
                  </span>
                  <ul className="text-xs text-neutral-700 space-y-1 list-disc list-inside">
                    {guide.attentionPoints.map((pt, idx) => (
                      <li key={idx} className="leading-relaxed">
                        <span className="text-neutral-700">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Interactive Pre-Purchase Checklist */}
              <div className="p-3.5 rounded-2xl bg-white border border-neutral-200 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <BookmarkCheck size={14} className="text-teal-700" /> Checklist Pré-Compra Interativo
                  </span>
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                    {completedChecksCount} de {totalChecks} conferidos
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {guide.checklist.map((item) => {
                    const isChecked = Boolean(checkedItems[item.id]);
                    return (
                      <label
                        key={item.id}
                        className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-teal-50/60 border-teal-200 text-teal-950 font-medium'
                            : 'bg-neutral-50/60 border-neutral-200 text-neutral-600 hover:bg-neutral-100/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCheck(item.id)}
                          className="mt-0.5 rounded text-teal-700 focus:ring-teal-500 cursor-pointer"
                        />
                        <span className="leading-snug">{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-xs text-neutral-500">
              Não foi possível carregar as dicas no momento.{' '}
              <button
                type="button"
                onClick={() => loadGuide(focus, true)}
                className="text-teal-700 underline font-bold"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
