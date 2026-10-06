import React, {useRef} from 'react';
import {Grid2X2, Package, CookingPot, Hammer, Refrigerator, Armchair, Cpu, Gamepad2, Monitor, Laptop, Smartphone, Cable, Speaker, Headphones, Music, PawPrint, Car, Shirt, Baby, ToyBrick, Tv, Footprints, Sparkles, Coffee, ChevronDown} from 'lucide-react';
import {CATEGORIES} from '../../data/mockProducts';
const icons:Record<string,React.ElementType>={
'Todas as Categorias':Grid2X2,'Utilidades':Package,'Casa & Cozinha':CookingPot,'Casa & Construção':Hammer,'Eletrodomésticos':Refrigerator,'Móveis':Armchair,'Tecnologia':Cpu,'Games':Gamepad2,'Computadores':Monitor,'Notebook':Laptop,'Smartphones':Smartphone,'Acessórios para celulares':Cable,'Aparelhos de Som':Speaker,'Fones & Headphones':Headphones,'Instrumentos Musicais':Music,'Motos & Acessórios':Car,'Pets':PawPrint,'Moda Masculina':Shirt,'Moda Feminina':Shirt,'Moda Infantil':Baby,'Brinquedos':ToyBrick,'TVs':Tv,'Calçados':Footprints,'Cuidado & Beleza':Sparkles,'Alimentos & Bebidas':Coffee};
const categoryColors: Record<string, [string, string]> = {
 'Todas as Categorias':['#0f766e','#ccfbf1'], 'Utilidades':['#b45309','#fef3c7'],
 'Casa & Cozinha':['#c2410c','#ffedd5'], 'Casa & Construção':['#a16207','#fef9c3'],
 'Eletrodomésticos':['#0369a1','#e0f2fe'], 'Móveis':['#9a3412','#ffedd5'],
 'Tecnologia':['#4338ca','#e0e7ff'], 'Games':['#7e22ce','#f3e8ff'],
 'Computadores':['#1d4ed8','#dbeafe'], 'Notebook':['#0369a1','#e0f2fe'],
 'Smartphones':['#0e7490','#cffafe'], 'Acessórios para celulares':['#6d28d9','#ede9fe'],
 'Aparelhos de Som':['#a21caf','#fae8ff'], 'Fones & Headphones':['#be185d','#fce7f3'], 'Instrumentos Musicais':['#7c3aed','#ede9fe'],
 'Motos & Acessórios':['#b91c1c','#fee2e2'], 'Pets':['#92400e','#fef3c7'], 'Moda Masculina':['#1d4ed8','#dbeafe'],
 'Moda Feminina':['#be185d','#fce7f3'], 'Moda Infantil':['#c2410c','#ffedd5'],
 'Brinquedos':['#a16207','#fef9c3'], 'TVs':['#4338ca','#e0e7ff'],
 'Calçados':['#047857','#d1fae5'], 'Cuidado & Beleza':['#a21caf','#fae8ff'],
 'Alimentos & Bebidas':['#4d7c0f','#ecfccb']
};
export function CategoryIcon({category}:{category:string}){
 const Icon=icons[category]||Package;
 const [color,backgroundColor]=categoryColors[category]||categoryColors['Todas as Categorias'];
 return <span aria-hidden="true" className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{color,backgroundColor}}><Icon size={17} strokeWidth={2}/></span>;
}
export function CategoryPicker({value,onChange,compact=false}:{value:string;onChange:(v:string)=>void;compact?:boolean}){
 const ref=useRef<HTMLDetailsElement>(null);
 return <details ref={ref} className="relative shrink-0 border-r border-neutral-200" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node)) e.currentTarget.open=false}} onKeyDown={e=>{if(e.key==='Escape'&&ref.current){ref.current.open=false;ref.current.querySelector('summary')?.focus()}}}><summary className={`flex cursor-pointer list-none items-center gap-2 py-2.5 text-xs font-semibold ${compact?'gap-1 px-2 sm:gap-2 sm:px-3':'px-3'}`} aria-label={'Filtrar por categoria: '+value}><CategoryIcon category={value}/><span className={`${compact?'hidden sm:inline ':''}max-w-36 truncate`}>{value}</span><ChevronDown size={14}/></summary><div className="absolute left-0 top-full z-50 mt-2 max-h-80 w-72 overflow-y-auto rounded-xl border bg-white p-2 shadow-xl">{CATEGORIES.map(cat=><button type="button" key={cat} aria-pressed={value===cat} className={'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm '+(value===cat?'bg-teal-100 text-teal-900':'text-neutral-700 hover:bg-neutral-50')} onClick={()=>{onChange(cat);if(ref.current){ref.current.open=false;ref.current.querySelector('summary')?.focus()}}}><CategoryIcon category={cat}/>{cat}</button>)}</div></details>;
}
