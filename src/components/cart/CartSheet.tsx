
"use client"

import { useState, useEffect } from 'react';
import { ShoppingCart, ShoppingBag, X, MessageCircle, Plus, Minus, Trash2, Smartphone, Copy, Check, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as SheetPrimitiveRoot from "@radix-ui/react-dialog";
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/hooks/use-cart-store';
import { useOrdersStore } from '@/hooks/use-orders-store';
import { useAppearanceStore } from '@/hooks/use-appearance-store';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

function CustomSheet({ trigger, children }: { trigger: React.ReactNode, children: React.ReactNode }) {
  return (
    <SheetPrimitiveRoot.Root>
      <SheetPrimitiveRoot.Trigger asChild>{trigger}</SheetPrimitiveRoot.Trigger>
      <SheetPrimitiveRoot.Portal>
        <SheetPrimitiveRoot.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <SheetPrimitiveRoot.Content className="fixed z-50 gap-4 bg-background p-0 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 inset-y-0 right-0 h-full w-full sm:max-w-md border-l border-primary/5 rounded-l-[3rem] overflow-hidden flex flex-col">
          <SheetPrimitiveRoot.Title className="sr-only">Carrito</SheetPrimitiveRoot.Title>
          <SheetPrimitiveRoot.Description className="sr-only">Gestiona tus productos.</SheetPrimitiveRoot.Description>
          {children}
          <SheetPrimitiveRoot.Close className="absolute right-6 top-6 rounded-full p-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors focus:outline-none">
            <X className="h-5 w-5" />
          </SheetPrimitiveRoot.Close>
        </SheetPrimitiveRoot.Content>
      </SheetPrimitiveRoot.Portal>
    </SheetPrimitiveRoot.Root>
  );
}

export function CartSheet({ isFloating = false }: { isFloating?: boolean }) {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCartStore();
  const { createOrder } = useOrdersStore();
  const { appearance } = useAppearanceStore();
  const { toast } = useToast();
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'form' | 'initial' | 'waiting' | 'success'>('form');
  const [copied, setCopied] = useState(false);
  const [currentPurchaseCode, setCurrentPurchaseCode] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState({
    name: '',
    surname: '',
    dni: '',
    phone: '',
    zipCode: '',
    address: '',
    houseNumber: ''
  });

  const MP_ALIAS = appearance.mercadopagoAlias || "Eipril.Store";

  useEffect(() => {
    if (!isPaymentModalOpen) {
      setTimeout(() => {
        setPaymentStatus('form');
        setCustomerData({ name: '', surname: '', dni: '', phone: '', zipCode: '', address: '', houseNumber: '' });
        setCurrentPurchaseCode(null);
      }, 300);
    }
  }, [isPaymentModalOpen]);

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
      items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price }))
    });
    if (result) {
      setCurrentPurchaseCode(result.purchaseCode);
      setPaymentStatus('initial');
    }
  };

  const handleCopyAlias = () => {
    navigator.clipboard.writeText(MP_ALIAS);
    setCopied(true);
    toast({ title: "Alias copiado" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppCheckout = () => {
    if (!currentPurchaseCode) return;
    const itemsList = items.map(item => item.name).join(', ');
    const message = encodeURIComponent(`Hola, ya transferí $${totalPrice.toLocaleString()} por ${itemsList} Código: ${currentPurchaseCode}`);
    const cleanNumber = (appearance.whatsappNumber || '5491168155653').replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  const standardTrigger = (
    <button className="flex flex-col items-center gap-0.5 group px-2 py-1 rounded-xl hover:bg-primary/10 transition-colors relative">
      <div className="p-1 text-primary/70 group-hover:text-primary transition-colors relative">
        <ShoppingCart className="h-5 w-5" />
        {totalItems > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-primary text-white border-background rounded-full text-[8px]">
            {totalItems}
          </Badge>
        )}
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-primary/50 group-hover:text-primary leading-none">Carrito</span>
    </button>
  );

  const floatingTrigger = (
    <button className="flex items-center justify-center bg-primary text-white w-14 h-14 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group relative border-4 border-background">
      <ShoppingCart className="h-6 w-6" />
      {totalItems > 0 && (
        <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 bg-destructive text-white border-2 border-background rounded-full text-[10px] font-black animate-in zoom-in">
          {totalItems}
        </Badge>
      )}
    </button>
  );

  return (
    <>
      <CustomSheet trigger={isFloating ? floatingTrigger : standardTrigger}>
        <div className="h-full flex flex-col">
          <div className="p-8 pb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-primary tracking-tight uppercase">Carrito</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase">{totalItems} ARTÍCULOS</p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-grow px-8">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center opacity-40">
                <ShoppingCart className="h-12 w-12 mb-4" />
                <p className="text-sm font-bold">Carrito vacío</p>
              </div>
            ) : (
              <div className="space-y-6 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-16 rounded-xl overflow-hidden bg-white shrink-0">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col justify-between flex-grow">
                      <div>
                        <h4 className="font-bold text-sm line-clamp-1 uppercase">{item.name}</h4>
                        <p className="text-primary font-black text-xs">${item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-secondary/50 rounded-lg p-1">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1"><Minus className="h-3 w-3" /></button>
                          <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                            className="p-1"
                            disabled={item.quantity >= (item.stock || 999)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="text-destructive/40 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {items.length > 0 && (
            <div className="p-8 bg-white/50 border-t border-primary/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-bold uppercase text-xs">Total</span>
                <span className="text-2xl font-black text-primary">${totalPrice.toLocaleString()}</span>
              </div>
              <Button onClick={() => setIsPaymentModalOpen(true)} className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase text-sm">Comprar</Button>
            </div>
          )}
        </div>
      </CustomSheet>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl [&>button]:hidden">
          <div className="p-6 text-white bg-primary relative">
            <button 
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute right-6 top-6 text-white/70 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <DialogTitle className="text-xl font-black uppercase flex items-center gap-2">
              <Smartphone className="h-6 w-6" /> Comprar
            </DialogTitle>
          </div>
          <div className="p-6">
            {paymentStatus === 'form' ? (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input required placeholder="Nombre" value={customerData.name} onChange={e => setCustomerData({...customerData, name: e.target.value})} className="rounded-xl h-11" />
                  <Input required placeholder="Apellido" value={customerData.surname} onChange={e => setCustomerData({...customerData, surname: e.target.value})} className="rounded-xl h-11" />
                </div>
                <Input required placeholder="DNI" value={customerData.dni} onChange={e => setCustomerData({...customerData, dni: e.target.value})} className="rounded-xl h-11" />
                <Input required placeholder="Teléfono" value={customerData.phone} onChange={e => setCustomerData({...customerData, phone: e.target.value})} className="rounded-xl h-11" />
                <Input required placeholder="Dirección" value={customerData.address} onChange={e => setCustomerData({...customerData, address: e.target.value})} className="rounded-xl h-11" />
                <div className="grid grid-cols-2 gap-3">
                  <Input required placeholder="Nº Casa" value={customerData.houseNumber} onChange={e => setCustomerData({...customerData, houseNumber: e.target.value})} className="rounded-xl h-11" />
                  <Input required placeholder="CP" value={customerData.zipCode} onChange={e => setCustomerData({...customerData, zipCode: e.target.value})} className="rounded-xl h-11" />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl bg-primary font-black uppercase mt-2">Continuar</Button>
              </form>
            ) : paymentStatus === 'initial' ? (
              <div className="space-y-6 text-center">
                <div className="bg-secondary/20 py-4 rounded-xl">
                  <p className="text-[10px] font-black opacity-40 uppercase">Total a pagar</p>
                  <p className="text-3xl font-black text-primary">${totalPrice.toLocaleString()}</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase text-primary">Transferir al alias:</p>
                    <div className="p-4 bg-secondary/10 dark:bg-secondary/20 rounded-xl border-2 border-dashed border-primary/20 flex items-center justify-between">
                      <p className="font-black truncate text-sm text-foreground">{MP_ALIAS}</p>
                      <Button size="icon" className="h-10 w-10 rounded-full shrink-0" onClick={handleCopyAlias}>
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
            ) : (
              <div className="py-12 flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="font-black uppercase text-xs">Verificando...</p>
              </div>
            )}
          </div>
          <DialogFooter className="p-4 bg-secondary/10">
            <Button variant="ghost" onClick={() => { setIsPaymentModalOpen(false); if (paymentStatus === 'initial') clearCart(); }} className="w-full font-bold uppercase text-xs">Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
