
"use client"

import { useState, useEffect, useMemo, use } from 'react';
import { useProductsStore } from '@/hooks/use-products-store';
import { useCarouselStore } from '@/hooks/use-carousel-store';
import { useCategoriesStore } from '@/hooks/use-categories-store';
import { useAppearanceStore } from '@/hooks/use-appearance-store';
import { useAdminStatus } from '@/hooks/use-admin-status';
import { ProductCard } from '@/components/catalog/ProductCard';
import { Search, ShoppingBag, LayoutGrid, Edit2, Check, X, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthButton } from '@/components/auth/AuthButton';
import { CartSheet } from '@/components/cart/CartSheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const HangingLeaves = () => (
  <div className="absolute top-0 right-0 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden w-40 h-40 md:w-80 md:h-80 z-40">
    <svg viewBox="0 0 200 200" className="w-full h-full text-primary fill-current translate-x-1/4 -translate-y-1/4 rotate-12">
      <path d="M100,0 C120,50 180,60 200,100 C150,80 140,20 100,0 Z" />
      <path d="M100,0 C80,50 20,60 0,100 C50,80 60,20 100,0 Z" opacity="0.8" />
      <path d="M100,0 C110,40 150,50 160,80 C130,70 120,20 100,0 Z" transform="rotate(-20 100 0)" opacity="0.6" />
    </svg>
  </div>
);

const HangingLeavesLeft = () => (
  <div className="absolute top-0 left-0 pointer-events-none opacity-15 dark:opacity-5 overflow-hidden w-32 h-32 md:w-64 md:h-64 z-40">
    <svg viewBox="0 0 200 200" className="w-full h-full text-primary fill-current -translate-x-1/4 -translate-y-1/4 -rotate-12">
      <path d="M100,0 C120,50 180,60 200,100 C150,80 140,20 100,0 Z" />
      <path d="M100,0 C80,50 20,60 0,100 C50,80 60,20 100,0 Z" opacity="0.8" />
    </svg>
  </div>
);

interface PageProps {
  params: Promise<any>;
  searchParams: Promise<any>;
}

export default function CatalogPage(props: PageProps) {
  use(props.params);
  const searchParams = use(props.searchParams);

  const { products, isLoading: productsLoading } = useProductsStore();
  const { slides, isLoading: slidesLoading } = useCarouselStore();
  const { categories, isLoading: categoriesLoading } = useCategoriesStore();
  const { appearance, updateAppearance } = useAppearanceStore();
  const { isAdmin } = useAdminStatus();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [isEditingBranding, setIsEditingBranding] = useState(false);
  const [brandingData, setBrandingData] = useState({
    logoText: '',
    catalogTitle: '',
    catalogSubtitle: ''
  });

  useEffect(() => {
    if (appearance.logoText) {
      document.title = appearance.logoText;
    }
  }, [appearance.logoText]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const filteredProducts = useMemo(() => {
    let list = products || [];
    list = list.filter(p => !p.isHidden || isAdmin);
    if (selectedCategory) {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      list = list.filter(p => 
        p.name?.toLowerCase().includes(lowerTerm) || 
        p.category?.toLowerCase().includes(lowerTerm)
      );
    }
    return list;
  }, [products, searchTerm, selectedCategory, isAdmin]);

  const handleOpenBrandingEdit = () => {
    setBrandingData({
      logoText: appearance.logoText || '',
      catalogTitle: appearance.catalogTitle || '',
      catalogSubtitle: appearance.catalogSubtitle || ''
    });
    setIsEditingBranding(true);
  };

  const handleSaveBranding = () => {
    updateAppearance(brandingData);
    setIsEditingBranding(false);
  };

  return (
    <div className="min-h-screen pb-20 bg-background relative overflow-hidden">
      <HangingLeaves />
      <HangingLeavesLeft />
      
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md border-primary/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group">
            <ShoppingBag className="text-primary h-5 w-5" />
            <h1 className="text-lg font-black text-primary tracking-tighter uppercase flex items-center gap-2">
              {appearance.logoText || 'EIPRIL'}
              {isAdmin && (
                <button 
                  onClick={handleOpenBrandingEdit}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded transition-all"
                  title="Editar nombre"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input 
                placeholder="Buscar..." 
                className="pl-9 h-9 w-40 rounded-full bg-secondary/50 border-none outline-none text-xs focus:w-56 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ThemeToggle />
            <CartSheet />
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Floating Cart for Mobile */}
      <div className="sm:hidden fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 duration-700">
        <CartSheet isFloating />
      </div>

      <main className="container mx-auto px-4 py-6">
        {!searchTerm && !selectedCategory && slides.length > 0 && (
          <section className="mb-10 relative h-[250px] md:h-[400px] overflow-hidden rounded-[2rem] border bg-card shadow-sm">
            {slides.map((slide, idx) => (
              <div 
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 flex flex-col md:flex-row ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <div className="flex-1 p-6 md:p-12 flex flex-col justify-center space-y-3">
                  <h2 className="text-2xl md:text-5xl font-black leading-tight uppercase">{slide.title}</h2>
                  <p className="text-xs md:text-base text-muted-foreground line-clamp-2">{slide.subtitle}</p>
                  <Button className="w-fit rounded-full px-6 h-10 text-xs font-bold uppercase tracking-widest">Ver Ahora</Button>
                </div>
                <div className="flex-1 relative bg-secondary/10 hidden md:block">
                  {slide.imageUrl && (
                    <Image 
                      src={slide.imageUrl} 
                      alt="" 
                      fill 
                      className="object-cover" 
                      priority={idx === 0}
                    />
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        <div className="mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 group">
            <div className="relative">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter">
                  {searchTerm ? `Resultados: ${searchTerm}` : (appearance.catalogTitle || appearance.logoText || 'Eipril Store')}
                </h2>
                {isAdmin && !searchTerm && (
                  <button 
                    onClick={handleOpenBrandingEdit}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-primary/10 rounded-full transition-all"
                    title="Editar títulos"
                  >
                    <Edit2 className="h-4 w-4 text-primary" />
                  </button>
                )}
              </div>
              {appearance.catalogSubtitle && (
                <p className="text-xs md:text-sm text-muted-foreground font-medium mt-1">{appearance.catalogSubtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            <Button
              variant={selectedCategory === null ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "rounded-full px-5 text-[10px] font-black uppercase tracking-widest h-9 shrink-0",
                selectedCategory === null ? "shadow-lg shadow-primary/20" : "bg-secondary/40 hover:bg-secondary/60"
              )}
            >
              <LayoutGrid className="h-3 w-3 mr-1.5" /> Todos
            </Button>
            {categoriesLoading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0" />)
            ) : (
              categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.name ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.name === selectedCategory ? null : cat.name)}
                  className={cn(
                    "rounded-full px-5 text-[10px] font-black uppercase tracking-widest h-9 shrink-0 transition-all",
                    selectedCategory === cat.name ? "shadow-lg shadow-primary/20" : "bg-secondary/40 hover:bg-secondary/60"
                  )}
                >
                  {cat.name}
                </Button>
              ))
            )}
          </div>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-[1.5rem]" />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} isAdmin={isAdmin} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center opacity-30 animate-in fade-in duration-700">
            <ShoppingBag className="h-12 w-12 mb-4" />
            <p className="text-xs uppercase font-bold tracking-[0.2em]">No hay productos en esta selección</p>
          </div>
        )}
      </main>

      <footer className="py-10 border-t text-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
        <p>© 2026 {appearance.logoText || 'EIPRIL'}</p>
      </footer>

      <Dialog open={isEditingBranding} onOpenChange={setIsEditingBranding}>
        <DialogContent className="sm:max-w-[425px] rounded-[2.5rem] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase">Editar Identidad</DialogTitle>
            <DialogDescription>
              Cambia los nombres y textos principales de tu tienda.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-40">Nombre de la Tienda</label>
              <Input 
                value={brandingData.logoText} 
                onChange={(e) => setBrandingData({...brandingData, logoText: e.target.value})}
                className="rounded-xl h-11"
                placeholder="Ej. EIPRIL"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-40">Título del Catálogo</label>
              <Input 
                value={brandingData.catalogTitle} 
                onChange={(e) => setBrandingData({...brandingData, catalogTitle: e.target.value})}
                className="rounded-xl h-11"
                placeholder="Ej. Eipril Store"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase opacity-40">Eslogan / Subtítulo</label>
              <Input 
                value={brandingData.catalogSubtitle} 
                onChange={(e) => setBrandingData({...brandingData, catalogSubtitle: e.target.value})}
                className="rounded-xl h-11"
                placeholder="Ej. Calidad excepcional"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsEditingBranding(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleSaveBranding} className="bg-primary hover:bg-primary/90 rounded-xl px-8 font-black uppercase">Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
