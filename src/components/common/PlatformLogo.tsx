import React from 'react';

import shopeeLogo from '../../assets/platforms/shopee.png';
import mercadoLivreLogo from '../../assets/platforms/mercado-livre.png';
import amazonLogo from '../../assets/platforms/amazon.png';
import aliexpressLogo from '../../assets/platforms/aliexpress.png';
import sheinLogo from '../../assets/platforms/shein.png';
import magaluLogo from '../../assets/platforms/magalu.png';

export type PlatformId = 'shopee' | 'mercadolivre' | 'amazon' | 'aliexpress' | 'shein' | 'magalu';

interface PlatformLogoProps {
  platform: PlatformId;
  className?: string;
}

const platforms: Record<PlatformId, { name: string; image: string }> = {
  shopee: { name: 'Shopee', image: shopeeLogo },
  mercadolivre: { name: 'Mercado Livre', image: mercadoLivreLogo },
  amazon: { name: 'Amazon', image: amazonLogo },
  aliexpress: { name: 'AliExpress', image: aliexpressLogo },
  shein: { name: 'Shein', image: sheinLogo },
  magalu: { name: 'Magalu', image: magaluLogo }
};

export const PLATFORM_LINKS: Record<PlatformId, string> = {
  shopee: 'https://shopee.com.br/',
  mercadolivre: 'https://www.mercadolivre.com.br/',
  amazon: 'https://www.amazon.com.br/',
  aliexpress: 'https://pt.aliexpress.com/',
  shein: 'https://onelink.shein.com/55/648fl61o0whg',
  magalu: 'https://www.magazineluiza.com.br/'
};

export const PlatformLogo: React.FC<PlatformLogoProps> = ({ platform, className = '' }) => {
  const item = platforms[platform];
  return (
    <span className={`inline-flex h-12 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm ${className}`} title={item.name} aria-label={item.name}>
      <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
    </span>
  );
};
