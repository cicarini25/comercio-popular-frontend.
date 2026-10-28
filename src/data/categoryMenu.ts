import type { LucideIcon } from 'lucide-react';
import {
  Armchair,
  Baby,
  Bike,
  Car,
  ChefHat,
  Dumbbell,
  Gamepad2,
  Grid2X2,
  Hammer,
  Home,
  Laptop,
  PawPrint,
  Refrigerator,
  Shirt,
  Smartphone,
  Sparkles,
  Tv,
  Wrench,
} from 'lucide-react';

export interface CategoryMenuItem {
  label: string;
  category: string;
}

export interface CategoryMenuGroup {
  label: string;
  icon: LucideIcon;
  items: CategoryMenuItem[];
}

// This menu mirrors the backend's official SITE_CATEGORY_TREE.
export const CATEGORY_MENU: CategoryMenuGroup[] = [
  {
    label: 'Casa, cozinha e organização',
    icon: Home,
    items: [
      { label: 'Casa & Cozinha', category: 'Casa & Cozinha' },
      { label: 'Casa & Cozinha', category: 'Casa & Cozinha' },
      { label: 'CAMA/MESA/BANHO', category: 'CAMA/MESA/BANHO' },
      { label: 'Móveis', category: 'Móveis' },
      { label: 'LUMINÁRIAS', category: 'LUMINÁRIAS' },
      { label: 'BOLSAS & MOCHILAS', category: 'BOLSAS & MOCHILAS' },
    ],
  },
  {
    label: 'Construção, elétrica e ferramentas',
    icon: Wrench,
    items: [
      { label: 'ELÉTRICA & HIDRÁULICA', category: 'ELÉTRICA & HIDRÁULICA' },
      { label: 'Ferramentas', category: 'Ferramentas' },
      { label: 'MÁQUINAS & IMPRESSORAS', category: 'MÁQUINAS & IMPRESSORAS' },
    ],
  },
  {
    label: 'Eletrodomésticos',
    icon: Refrigerator,
    items: [
      { label: 'Eletrodomésticos', category: 'Eletrodomésticos' },
      { label: 'ELETRO & ACESSÓRIOS', category: 'ELETRO & ACESSÓRIOS' },
    ],
  },
  {
    label: 'Tecnologia e eletrônicos',
    icon: Smartphone,
    items: [
      { label: 'ELETRÔNICOS', category: 'ELETRÔNICOS' },
      { label: 'RELÓGIOS', category: 'RELÓGIOS' },
      { label: 'Games', category: 'Games' },
      { label: 'Informática', category: 'Informática' },
      { label: 'Informática', category: 'Informática' },
      { label: 'Smartphones', category: 'Smartphones' },
      { label: 'Acessórios para celulares', category: 'Acessórios para celulares' },
      { label: 'Aparelhos de Som', category: 'Aparelhos de Som' },
      { label: 'Fones & Headphones', category: 'Fones & Headphones' },
      { label: 'Instrumentos Musicais', category: 'Instrumentos Musicais' },
      { label: 'TVs', category: 'TVs' },
    ],
  },
  {
    label: 'Veículos e mobilidade',
    icon: Car,
    items: [
      { label: 'AUTO & ACESSÓRIOS', category: 'AUTO & ACESSÓRIOS' },
      { label: 'MOTOS & ACESSÓRIOS', category: 'MOTOS & ACESSÓRIOS' },
      { label: 'Bike Elétrica e Acessórios', category: 'Bike Elétrica e Acessórios' },
    ],
  },
  {
    label: 'Moda e acessórios',
    icon: Shirt,
    items: [
      { label: 'MODA VERÃO PRAIA', category: 'MODA VERÃO PRAIA' },
      { label: 'Moda Masculina', category: 'Moda Masculina' },
      { label: 'Moda Feminina', category: 'Moda Feminina' },
      { label: 'CALÇADOS INFANTIS M/F', category: 'CALÇADOS INFANTIS M/F' },
      { label: 'MODA INFANTIL FEMININA', category: 'MODA INFANTIL FEMININA' },
      { label: 'MODA INFANTIL MASCULINA', category: 'MODA INFANTIL MASCULINA' },
      { label: 'ARMARINHOS & TRICÔ', category: 'ARMARINHOS & TRICÔ' },
      { label: 'Calçados Masculino', category: 'Calçados Masculino' },
      { label: 'Calçados Femininos', category: 'Calçados Femininos' },
    ],
  },
  {
    label: 'Lazer, cuidado e consumo',
    icon: Sparkles,
    items: [
      { label: 'Brinquedos', category: 'Brinquedos' },
      { label: 'Esportes & Lazer', category: 'Esportes & Lazer' },
      { label: 'Pets', category: 'Pets' },
      { label: 'Cuidado & Beleza', category: 'Cuidado & Beleza' },
      { label: 'Alimentos & Bebidas', category: 'Alimentos & Bebidas' },
      { label: 'Outros', category: 'Outros' },
    ],
  },
];

const departmentKey = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function normalizeCategoryMenuGroups(rawGroups: unknown, availableCategories: string[]): CategoryMenuGroup[] {
  const allowed = new Set(availableCategories);
  const iconByDepartment = new Map(CATEGORY_MENU.map((group) => [departmentKey(group.label), group.icon]));
  const source = Array.isArray(rawGroups) && rawGroups.length
    ? rawGroups
    : CATEGORY_MENU.map((group) => ({
        department: group.label,
        categories: group.items.map((item) => item.category),
      }));

  const groups = source.flatMap((value, index) => {
    if (!value || typeof value !== 'object') return [];
    const group = value as { department?: unknown; categories?: unknown };
    if (typeof group.department !== 'string' || !Array.isArray(group.categories)) return [];
    const items = [...new Set(group.categories.filter((category): category is string =>
      typeof category === 'string' && allowed.has(category),
    ))].map((category) => ({ label: category, category }));
    if (!items.length) return [];
    return [{
      label: group.department,
      icon: iconByDepartment.get(departmentKey(group.department)) || CATEGORY_MENU[index]?.icon || Grid2X2,
      items,
    }];
  });

  return groups.length ? groups : CATEGORY_MENU;
}

export const CATEGORY_MENU_ICON_HINTS = {
  casa: Armchair,
  cozinha: ChefHat,
  ferramentas: Hammer,
  tecnologia: Laptop,
  tv: Tv,
  esportes: Dumbbell,
  bike: Bike,
  pets: PawPrint,
  infantil: Baby,
  games: Gamepad2,
};
