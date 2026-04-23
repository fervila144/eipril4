
"use client"

import { use, useEffect, useState } from 'react';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Product } from '@/lib/types';
import { useOrdersStore } from '@/hooks/use-orders-store';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  MessageCircle, 
  ShoppingBag, 
  ShoppingCart, 
  Loader2, 
  Info, 
  Smartphone, 
  Check, 
  Copy, 
  Plus,
  Minus,
  X
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CartSheet } from '@/components/cart/CartSheet';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAppearanceStore } from '@/hooks/use-appearance-store';
import { useCartStore } from '@/hooks/use-cart-store';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { AuthButton } from '@/components/auth/AuthButton';

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
  params: Promise<{ id: string }>;
  searchParams: Promise<any>;
}

export default function ProductDetailPage(props: PageProps) {
  const params = use(props.params);
  const id = params.id;

  const db = useFirestore();
  const { appearance } = useAppearanceStore();
  const { addItem } = useCartStore();
  const { createOrder } = useOrdersStore();
  const { toast } = useToast();
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'form' | 'initial' | 'waiting' | 'success'>('form');
  const [copied, setCopied] = useState(false);
  const [currentPurchaseCode, setCurrentPurchaseCode] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerData, setCustomerData] = useState({
    name: '',
    surname: '',
    dni: '',
    phone: '',
    zipCode: '',
    address: '',
    houseNumber: ''
  });

  const productRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'products', id);
  }, [db, id]);

  const { data: product, isLoading, error } = useDoc<Product>(productRef);

  useEffect(() => {
    if (product) {
      document.title = `${product.name} | ${appearance.logoText}`;
      if (product.stock < quantity) {
        setQuantity(Math.max(1, product.stock));
      }
    }
  }, [product, appearance.logoText, quantity]);

  useEffect(() => {
    if (!isPaymentModalOpen) {
      setTimeout(() => {
        setPaymentStatus('form');
        setCustomerData({ name: '', surname: '', dni: '', phone: '', zipCode: '', address: '', houseNumber: '' });
        setCurrentPurchaseCode(null);
      }, 300);
    }
  }, [isPaymentModalOpen]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8 flex flex-col gap-8">
        <Skeleton className="h-10 w-48 rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square w-full rounded-[2rem]" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4 rounded-full" />
            <Skeleton className="h-8 w-1/4 rounded-full" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Info className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-2xl font-black">Producto no encontrado</h1>
        <Link href="/" className="mt-4"><Button>Volver al inicio</Button></Link>
      </div>
    );
  }

  const isOutOfStock = (product.stock || 0) <= 0;
  const totalPrice = product.price * quantity;
  const formattedPrice = totalPrice.toLocaleString('es-ES', { minimumFractionDigits: 0 });
  const allImages = product.images && product.images.length > 0 ? product.images : [product.imageUrl];
  const activeImage = allImages[activeImageIndex] || product.imageUrl;

  const handleCopyAlias = () => {
    const alias = appearance.mercadopagoAlias || "Eipril.Store";
    navigator.clipboard.writeText(alias);
    setCopied(true);
    toast({ title: "Alias copiado" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = createOrder({
      customerName: customerData.name,
      customerSurname: customerData.surname,
      customerDni: customerData.dni,
      customerPhone: customerData.phone,
      customerAddress: customerData.address,
      customerHouseNumber: customerData.houseNumber,
      customerZipCode: customerData.zipCode,
      totalPrice: totalPrice,
      items: [{ name: product.name, quantity: quantity, price: product.price }]
    });

    if (result) {
      setCurrentPurchaseCode(result.purchaseCode);
      setPaymentStatus('initial');
    }
  };

  const handleWhatsAppCheckout = () => {
    if (!currentPurchaseCode) return;
    const message = encodeURIComponent(`Hola, ya transferí $${formattedPrice} por ${product.name} Código: ${currentPurchaseCode}`);
    const cleanNumber = (appearance.whatsappNumber || '5491168155653').replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <HangingLeaves />
      <HangingLeavesLeft />
      <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-xl border-b border-primary/10">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold">
            <ArrowLeft className="h-5 w-5" />
            <span>Volver</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary h-5 w-5" />
            <span className="text-sm font-black uppercase">{appearance.logoText}</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <CartSheet />
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl bg-white">
              <Image src={activeImage} alt={product.name} fill className={cn("object-cover", isOutOfStock && "grayscale opacity-60")} priority />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {allImages.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImageIndex(idx)} className={cn("relative h-20 w-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-white", activeImageIndex === idx ? "border-primary" : "border-transparent opacity-60")}>
                    <Image src={img} alt={product.name} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Badge className="bg-primary/10 text-primary border-none">{product.category || 'Colección'}</Badge>
            <h2 className="text-3xl md:text-5xl font-black">{product.name}</h2>
            <div className="text-2xl md:text-4xl font-black text-primary">${(product.price * quantity).toLocaleString()}</div>
            <p className="text-lg text-foreground/70 leading-relaxed">{product.description}</p>

            <div className="flex flex-col gap-6 pt-6">
              {!isOutOfStock && (
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black uppercase opacity-40">Cantidad:</span>
                  <div className="flex items-center gap-4 bg-secondary/30 rounded-2xl p-1 px-4 h-12">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="text-primary hover:opacity-50 p-2"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-black w-6 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => Math.min(product.stock || 1, q + 1))}
                      className="text-primary hover:opacity-50 p-2"
                      disabled={quantity >= (product.stock || 0)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    {product.stock > 0 && <span className="text-[10px] font-bold opacity-30 ml-2">Stock: {product.stock}</span>}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => setIsPaymentModalOpen(true)} 
                  disabled={isOutOfStock}
                  className="flex-1 h-14 rounded-2xl bg-primary text-white font-black text-lg uppercase shadow-xl"
                >
                  {isOutOfStock ? 'Sin stock' : 'Comprar'}
                </Button>
                <Button 
                  onClick={() => !isOutOfStock && addItem(product, quantity)} 
                  disabled={isOutOfStock} 
                  variant="outline"
                  className="h-14 w-14 rounded-2xl border-primary/20 text-primary shadow-sm flex items-center justify-center p-0"
                  title="Añadir al carrito"
                >
                  <ShoppingCart className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden [&>button]:hidden">
          <div className="p-6 text-white bg-primary relative">
            <button 
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute right-6 top-6 text-white/70 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <DialogHeader>
              <DialogTitle className="text-xl font-black flex items-center gap-3 text-white uppercase">
                <Smartphone className="h-6 w-6" /> Comprar
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6">
            {paymentStatus === 'form' ? (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input required placeholder="Nombre" value={customerData.name} onChange={(e) => setCustomerData({...customerData, name: e.target.value})} className="rounded-xl" />
                  <Input required placeholder="Apellido" value={customerData.surname} onChange={(e) => setCustomerData({...customerData, surname: e.target.value})} className="rounded-xl" />
                </div>
                <Input required placeholder="DNI" value={customerData.dni} onChange={(e) => setCustomerData({...customerData, dni: e.target.value})} className="rounded-xl" />
                <Input required placeholder="Teléfono" value={customerData.phone} onChange={(e) => setCustomerData({...customerData, phone: e.target.value})} className="rounded-xl" />
                <Input required placeholder="Dirección" value={customerData.address} onChange={(e) => setCustomerData({...customerData, address: e.target.value})} className="rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                  <Input required placeholder="Nº Casa" value={customerData.houseNumber} onChange={(e) => setCustomerData({...customerData, houseNumber: e.target.value})} className="rounded-xl" />
                  <Input required placeholder="CP" value={customerData.zipCode} onChange={(e) => setCustomerData({...customerData, zipCode: e.target.value})} className="rounded-xl" />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl bg-primary font-black uppercase mt-2">Continuar</Button>
              </form>
            ) : (
              <div className="space-y-6 text-center">
                <div className="bg-secondary/20 py-4 rounded-xl">
                  <p className="text-[10px] font-black opacity-40 uppercase">Monto a transferir</p>
                  <div className="text-3xl font-black text-primary">${formattedPrice}</div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-primary">Transferir al alias:</p>
                    <div className="p-4 bg-secondary/10 dark:bg-secondary/20 rounded-xl border-2 border-dashed border-primary/20 flex items-center justify-between">
                      <div className="text-lg font-black truncate text-foreground">{appearance.mercadopagoAlias || "Eipril.Store"}</div>
                      <Button size="icon" className="rounded-full bg-primary h-10 w-10 shrink-0" onClick={handleCopyAlias}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-dashed">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Tu código de seguimiento:</p>
                    <p className="text-2xl font-black tracking-widest text-primary">{currentPurchaseCode}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase">Enviar comprobante por WhatsApp</p>
                  <Button onClick={handleWhatsAppCheckout} className="w-full h-14 rounded-xl bg-[#25D366] text-white font-black uppercase gap-2">
                    <MessageCircle className="h-5 w-5" /> Enviar Comprobante
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="p-4 bg-secondary/10">
            <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)} className="w-full font-bold uppercase">Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
