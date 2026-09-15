import React, { useState, useEffect, useId } from 'react';
import { SlidersHorizontal, RotateCcw, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (range: [number, number]) => void;
  onReset?: () => void;
  matchingCount?: number;
  className?: string;
}

export const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
  onReset,
  matchingCount,
  className = ''
}) => {
  const [minVal, setMinVal] = useState<number>(value[0]);
  const [maxVal, setMaxVal] = useState<number>(value[1]);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const minInputId = useId();
  const maxInputId = useId();

  // Sync internal state with props if external changes happen
  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value]);

  const isFiltered = minVal > min || maxVal < max;

  // Safe percentage calculations for the track highlight
  const safeRange = Math.max(1, max - min);
  const minPercent = Math.min(100, Math.max(0, ((minVal - min) / safeRange) * 100));
  const maxPercent = Math.min(100, Math.max(0, ((maxVal - min) / safeRange) * 100));

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxVal - 5);
    const clamped = Math.max(min, val);
    setMinVal(clamped);
    onChange([clamped, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minVal + 5);
    const clamped = Math.min(max, val);
    setMaxVal(clamped);
    onChange([minVal, clamped]);
  };

  const handleMinDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    if (isNaN(raw)) return;
    const clamped = Math.max(min, Math.min(raw, maxVal - 1));
    setMinVal(clamped);
    onChange([clamped, maxVal]);
  };

  const handleMaxDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = Number(e.target.value);
    if (isNaN(raw)) return;
    const clamped = Math.min(max, Math.max(raw, minVal + 1));
    setMaxVal(clamped);
    onChange([minVal, clamped]);
  };

  const handlePreset = (presetMin: number, presetMax: number) => {
    const clampedMin = Math.max(min, presetMin);
    const clampedMax = Math.min(max, presetMax);
    setMinVal(clampedMin);
    setMaxVal(clampedMax);
    onChange([clampedMin, clampedMax]);
  };

  const handleReset = () => {
    setMinVal(min);
    setMaxVal(max);
    if (onReset) {
      onReset();
    } else {
      onChange([min, max]);
    }
  };

  return (
    <div
      id="price-range-filter-card"
      className={`bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs transition-all ${className}`}
    >
      {/* Header with Title and Toggle for Mobile */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <SlidersHorizontal size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                Faixa de Preço
              </span>
              {isFiltered && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                  Filtro Ativo
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500">
              {formatCurrency(minVal)} até {formatCurrency(maxVal)}
              {matchingCount !== undefined && (
                <span className="ml-1 font-medium text-teal-700">
                  ({matchingCount} {matchingCount === 1 ? 'produto' : 'produtos'})
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isFiltered && (
            <button
              id="btn-reset-price-filter"
              type="button"
              onClick={handleReset}
              className="text-xs text-neutral-500 hover:text-red-600 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Resetar filtro de preço"
            >
              <RotateCcw size={12} />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}
          <button
            id="btn-toggle-price-filter"
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="sm:hidden p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
            aria-label={isExpanded ? 'Recolher filtro de preço' : 'Expandir filtro de preço'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-2">
          {/* Dual Range Slider Element */}
          <div className="relative pt-3 pb-2 px-1">
            {/* Background Track */}
            <div className="relative h-2 w-full rounded-full bg-neutral-200">
              {/* Highlight Active Range Bar */}
              <div
                className="absolute h-2 rounded-full bg-teal-600 transition-all duration-75"
                style={{
                  left: `${minPercent}%`,
                  width: `${Math.max(0, maxPercent - minPercent)}%`
                }}
              />
            </div>

            {/* Minimum Handle Slider */}
            <input
              id={minInputId}
              type="range"
              min={min}
              max={max}
              step={1}
              value={minVal}
              onChange={handleMinChange}
              aria-label="Preço mínimo"
              className="absolute left-0 top-3 w-full h-2 appearance-none bg-transparent pointer-events-none z-20 cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto
                [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-teal-700 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing
                [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform
                [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto
                [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-teal-700 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
                [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing"
            />

            {/* Maximum Handle Slider */}
            <input
              id={maxInputId}
              type="range"
              min={min}
              max={max}
              step={1}
              value={maxVal}
              onChange={handleMaxChange}
              aria-label="Preço máximo"
              className="absolute left-0 top-3 w-full h-2 appearance-none bg-transparent pointer-events-none z-20 cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto
                [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-teal-700 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing
                [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform
                [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto
                [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-teal-700 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white
                [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:active:cursor-grabbing"
            />
          </div>

          {/* Min and Max Direct Inputs Row */}
          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="flex flex-col">
              <label htmlFor="input-min-price-number" className="text-[11px] font-semibold text-neutral-500 mb-1">
                Mínimo (R$)
              </label>
              <div className="relative rounded-xl border border-neutral-200 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 bg-neutral-50/60 overflow-hidden">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-semibold">
                  R$
                </span>
                <input
                  id="input-min-price-number"
                  type="number"
                  min={min}
                  max={maxVal - 1}
                  step={1}
                  value={minVal}
                  onChange={handleMinDirectInput}
                  className="w-full pl-8 pr-2 py-1.5 text-xs font-bold text-neutral-900 bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="input-max-price-number" className="text-[11px] font-semibold text-neutral-500 mb-1">
                Máximo (R$)
              </label>
              <div className="relative rounded-xl border border-neutral-200 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 bg-neutral-50/60 overflow-hidden">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 font-semibold">
                  R$
                </span>
                <input
                  id="input-max-price-number"
                  type="number"
                  min={minVal + 1}
                  max={max}
                  step={1}
                  value={maxVal}
                  onChange={handleMaxDirectInput}
                  className="w-full pl-8 pr-2 py-1.5 text-xs font-bold text-neutral-900 bg-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Quick Filter Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1 mr-1">
              <Tag size={11} /> Faixas:
            </span>
            <button
              id="btn-preset-all-prices"
              type="button"
              onClick={handleReset}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                !isFiltered
                  ? 'bg-teal-700 text-white font-bold'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              Todos
            </button>
            <button
              id="btn-preset-under-50"
              type="button"
              onClick={() => handlePreset(min, 50)}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                minVal === min && maxVal === 50
                  ? 'bg-teal-700 text-white font-bold'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              Até R$ 50
            </button>
            <button
              id="btn-preset-50-100"
              type="button"
              onClick={() => handlePreset(50, 100)}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                minVal === 50 && maxVal === 100
                  ? 'bg-teal-700 text-white font-bold'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              R$ 50 a R$ 100
            </button>
            <button
              id="btn-preset-100-200"
              type="button"
              onClick={() => handlePreset(100, 200)}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                minVal === 100 && maxVal === 200
                  ? 'bg-teal-700 text-white font-bold'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              R$ 100 a R$ 200
            </button>
            <button
              id="btn-preset-over-200"
              type="button"
              onClick={() => handlePreset(200, max)}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                minVal === 200 && maxVal === max
                  ? 'bg-teal-700 text-white font-bold'
                  : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
              }`}
            >
              Acima de R$ 200
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
