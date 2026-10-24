import type { LucideIcon } from 'lucide-react';
import {
  Armchair,
  Baby,
  Bike,
  Car,
  ChefHat,
  Dumbbell,
  Gamepad2,
  Hammer,
  Home,
  Laptop,
  PawPrint,
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

export const CATEGORY_MENU: CategoryMenuGroup[] = [
  {
    label: 'Eletrônicos & Tecnologia',
    icon: Smartphone,
    items: [
      { label: 'Smartphones', category: 'Smartphones' },
      { label: 'Computadores', category: 'Computadores' },
      { label: 'Notebook', category: 'Notebook' },
      { label: 'Acessórios para celulares', category: 'Acessórios para celulares' },
      { label: 'Fones & Headphones', category: 'Fones & Headphones' },
      { label: 'Aparelhos de Som', category: 'Aparelhos de Som' },
      { label: 'Games', category: 'Games' },
      { label: 'TVs', category: 'TVs' },
    ],
  },
  {
    label: 'Casa, Cozinha & Móveis',
    icon: Home,
    items: [
      { label: 'Casa & Cozinha', category: 'Casa & Cozinha' },
      { label: 'Utilidades', category: 'Utilidades' },
      { label: 'Cama, mesa e banho', category: 'CAMA/MESA/BANHO' },
      { label: 'Eletrodomésticos', category: 'Eletrodomésticos' },
      { label: 'Móveis', category: 'Móveis' },
      { label: 'Luminárias', category: 'LUMINÁRIAS' },
      { label: 'Elétrica & Hidráulica', category: 'ELÉTRICA & HIDRÁULICA' },
      { label: 'Panelas e organização', category: 'Casa & Cozinha' },
    ],
  },
  {
    label: 'Ferramentas & Máquinas',
    icon: Wrench,
    items: [
      { label: 'Ferramentas', category: 'Ferramentas' },
      { label: 'Máquinas & Impressoras', category: 'MÁQUINAS & IMPRESSORAS' },
      { label: 'Ferramentas elétricas', category: 'Ferramentas' },
      { label: 'Oficina e manutenção', category: 'Ferramentas' },
      { label: 'Construção', category: 'Ferramentas' },
    ],
  },
  {
    label: 'Moda & Acessórios',
    icon: Shirt,
    items: [
      { label: 'Moda Feminina', category: 'Moda Feminina' },
      { label: 'Moda Masculina', category: 'Moda Masculina' },
      { label: 'Moda Infantil', category: 'MODA INFANTIL FEMININA' },
      { label: 'Bolsas & Mochilas', category: 'BOLSAS & MOCHILAS' },
      { label: 'Calçados Femininos', category: 'Calçados Femininos' },
      { label: 'Calçados Masculino', category: 'Calçados Masculino' },
      { label: 'Verão & Praia', category: 'MODA VERÃO PRAIA' },
      { label: 'Armarinhos & Tricô', category: 'ARMARINHOS & TRICÔ' },
    ],
  },
  {
    label: 'Auto, Motos & Esportes',
    icon: Car,
    items: [
      { label: 'Auto & Acessórios', category: 'AUTO & ACESSÓRIOS' },
      { label: 'Motos & Acessórios', category: 'MOTOS & ACESSÓRIOS' },
      { label: 'Esportes & Lazer', category: 'Esportes & Lazer' },
      { label: 'Bike elétrica e acessórios', category: 'Bike Elétrica e Acessórios' },
      { label: 'Fitness', category: 'Esportes & Lazer' },
      { label: 'Games e diversão', category: 'Games' },
    ],
  },
  {
    label: 'Beleza, Bebês & Pets',
    icon: Sparkles,
    items: [
      { label: 'Cuidado & Beleza', category: 'Cuidado & Beleza' },
      { label: 'Bebês e crianças', category: 'Brinquedos' },
      { label: 'Brinquedos', category: 'Brinquedos' },
      { label: 'Pets', category: 'Pets' },
      { label: 'Alimentos & Bebidas', category: 'Alimentos & Bebidas' },
    ],
  },
];

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
