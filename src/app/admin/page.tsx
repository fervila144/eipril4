
"use client"

import { useState, useEffect } from 'react';
import { useProductsStore } from '@/hooks/use-products-store';
import { ProductCard } from '@/components/catalog/ProductCard';
import { ProductForm } from '@/components/catalog/ProductForm';
import { Button } from '@/components/ui/button';
import { Plus, Search, ArrowLeft, Loader2, LayoutGrid, Image as ImageIcon, Palette, FolderOpen, ShieldCheck, Calculator, ShoppingBag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthButton } from '@/components/auth/AuthButton';
import { useAdminStatus } from '@/hooks/use-admin-status';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarouselManager } from '@/components/admin/CarouselManager';
import { AppearanceManager } from '@/components/admin/AppearanceManager';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { AdminManager } from '@/components/admin/AdminManager';
import { CalculationsManager } from '@/components/admin/CalculationsManager';
import { OrdersManager } from '@/components/admin/OrdersManager';
import { useAppearanceStore } from '@/hooks/use-appearance-store';

export default function AdminPage() {
  const { products, isLoading, addProduct, updateProduct, deleteProduct } = useProductsStore();
  const { isAdmin, isSuperAdmin, isLoading: isAdminLoading } = useAdminStatus();
  const { appearance } = useAppearanceStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  useEffect(() => {
    document.title = `Admin - ${appearance.logoText}`;
  }, [appearance.logoText]);

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  if (isAdminLoading) return (
    <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-xl font-black mb-4 uppercase">Acceso Restringido</h1>
      <Link href="/"><Button variant="outline">Volver</Button></Link>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 bg-background">
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-primary/10 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-sm font-black uppercase tracking-tighter">
              {appearance.logoText} <span className="text-primary">ADMIN</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="bg-secondary/30 p-1 rounded-xl mb-6 flex overflow-x-auto no-scrollbar">
            <TabsTrigger value="products" className="rounded-lg px-4 gap-2 text-xs font-bold transition-all shrink-0">
              <LayoutGrid className="h-3.5 w-3.5" /> Productos
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg px-4 gap-2 text-xs font-bold transition-all shrink-0">
              <ShoppingBag className="h-3.5 w-3.5" /> Pedidos
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg px-4 gap-2 text-xs font-bold transition-all shrink-0">
              <FolderOpen className="h-3.5 w-3.5" /> Categorías
            </TabsTrigger>
            <TabsTrigger value="carousel" className="rounded-lg px-4 gap-2 text-xs font-bold transition-all shrink-0">
              <ImageIcon className="h-3.5 w-3.5" /> Carrusel
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-lg px-4 gap-2 text-xs font-bold transition-all shrink-0">
              <Palette className="h-3.5 w-3.5" /> Estilo
            </TabsTrigger>
            <TabsTrigger value="calculations" className="rounded-lg px-4 gap-2 text-xs font-bold transition-all shrink-0">
              <Calculator className="h-3.5 w-3.5" /> Cálculos
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="admins" className="rounded-lg px-4 gap-2 text-xs font-bold transition-all shrink-0">
                <ShieldCheck className="h-3.5 w-3.5" /> Accesos
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="products">
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-9 h-10 rounded-xl bg-secondary/20 border-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={handleAddClick} className="rounded-xl px-6 font-bold h-10">
                <Plus className="h-4 w-4 mr-2" /> 
                <span className="font-bold">Nuevo Producto</span>
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredProducts.map((p) => (
                  <ProductCard 
                    key={p.id} 
                    product={p} 
                    onEdit={handleEdit}
                    onDelete={deleteProduct}
                    isAdmin={true}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders"><OrdersManager /></TabsContent>
          <TabsContent value="categories"><CategoryManager /></TabsContent>
          <TabsContent value="carousel"><CarouselManager /></TabsContent>
          <TabsContent value="appearance"><AppearanceManager /></TabsContent>
          <TabsContent value="calculations"><CalculationsManager /></TabsContent>
          {isSuperAdmin && <TabsContent value="admins"><AdminManager /></TabsContent>}
        </Tabs>
      </main>

      <ProductForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        product={editingProduct}
        onSubmit={(data) => editingProduct ? updateProduct(editingProduct.id, data) : addProduct(data)}
      />
    </div>
  );
}
