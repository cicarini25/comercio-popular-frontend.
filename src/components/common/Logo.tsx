import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  onClick
}) => {
  const iconBoxSize = size === 'sm' ? 'w-8 h-8 rounded-lg' : size === 'lg' ? 'w-13 h-13 rounded-2xl' : 'w-10 h-10 rounded-xl';
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 28 : 22;
  const titleSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const subSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-xs' : 'text-[11px]';

  return (
    <div
      id="brand-logo"
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none cursor-pointer transition-transform duration-150 active:scale-95 ${className}`}
    >
      {/* Icon: Shopping bag inside rounded teal square */}
      <div
        className={`${iconBoxSize} flex items-center justify-center shrink-0 shadow-sm transition-shadow hover:shadow`}
        style={{ backgroundColor: '#0F6E56' }}
      >
        <ShoppingBag
          size={iconSize}
          style={{ color: '#E1F5EE' }}
          strokeWidth={2.4}
        />
      </div>

      {/* Brand typography */}
      <div className="flex flex-col leading-none">
        <div className={`font-display ${titleSize} tracking-tight flex items-center gap-1.5`}>
          <span className="font-medium text-neutral-800">Comércio</span>
          <span className="font-extrabold" style={{ color: '#D85A30' }}>
            Popular
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`font-sans ${subSize} font-medium mt-0.5 tracking-normal text-neutral-500`}
          >
            preço bom pra todo mundo
          </span>
        )}
      </div>
    </div>
  );
};
