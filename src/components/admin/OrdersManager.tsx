
'use client';

import { useOrdersStore } from '@/hooks/use-orders-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2, 
  Trash2, 
  User, 
  Calendar, 
  ShoppingBag,
  Loader2,
  Hash,
  MapPin,
  Phone,
  Search,
  ClipboardList
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function OrdersManager() {
  const { orders, isLoading, confirmOrder, deleteOrder } = useOrdersStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Solo filtramos si hay un término de búsqueda, de lo contrario no mostramos nada
  const filteredOrders = searchTerm.trim() === '' 
    ? [] 
    : orders.filter(o => 
        o.purchaseCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerSurname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerDni?.includes(searchTerm)
      );

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">Verificación de Pedidos</h2>
          <p className="text-muted-foreground font-medium text-sm">Ingresa el código que recibiste por WhatsApp para verificar los datos.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Ingresa el código de 6 dígitos..." 
            className="pl-10 h-11 rounded-xl font-bold uppercase tracking-widest"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {searchTerm.trim() === '' ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-secondary/5 rounded-[2rem] border border-dashed border-primary/10">
            <ClipboardList className="h-12 w-12 text-primary/20 mb-4" />
            <h3 className="font-bold uppercase text-xs text-muted-foreground">Esperando búsqueda...</h3>
            <p className="text-[10px] uppercase tracking-widest opacity-40 mt-2">Ingresa un código para ver los detalles del cliente</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-destructive/5 rounded-[2rem] border border-dashed border-destructive/20">
            <ShoppingBag className="h-12 w-12 text-destructive/20 mb-4" />
            <h3 className="font-bold uppercase text-xs text-destructive">No se encontró ningún pedido</h3>
            <p className="text-[10px] uppercase tracking-widest text-destructive/60 mt-2">Verifica que el código sea correcto</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className={cn(
                "bg-white dark:bg-black/40 p-6 rounded-[2rem] border transition-all relative overflow-hidden animate-in fade-in zoom-in duration-300",
                order.status === 'confirmed' ? "border-green-500/30" : "border-primary/5 shadow-sm"
              )}
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-grow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 px-3 py-1 rounded-lg flex items-center gap-2">
                        <Hash className="h-4 w-4 text-primary" />
                        <span className="text-lg font-black tracking-widest text-primary">{order.purchaseCode}</span>
                      </div>
                      <Badge variant={order.status === 'confirmed' ? 'default' : 'secondary'} className="rounded-full uppercase text-[9px] h-6 px-3">
                        {order.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      {order.createdAt?.seconds ? format(new Date(order.createdAt.seconds * 1000), 'd MMM, HH:mm', { locale: es }) : 'Reciente'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-primary/40 tracking-widest">Cliente</p>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary/60" />
                        </div>
                        <div>
                          <p className="font-bold text-sm uppercase">{order.customerName} {order.customerSurname}</p>
                          <p className="text-xs text-muted-foreground">DNI: {order.customerDni}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-primary mt-1">
                        <Phone className="h-3 w-3" /> {order.customerPhone}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-primary/40 tracking-widest">Entrega</p>
                      <div className="space-y-1">
                        <p className="text-sm font-bold flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary/40" />
                          {order.customerAddress} {order.customerHouseNumber}
                        </p>
                        <p className="text-xs text-muted-foreground ml-6 uppercase">CP: {order.customerZipCode}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[9px] font-black uppercase text-primary/40 tracking-widest">Compra</p>
                      <div className="space-y-1">
                        <p className="text-xl font-black text-primary">${order.totalPrice.toLocaleString()}</p>
                        <div className="flex flex-wrap gap-1">
                          {order.items?.map((item: any, i: number) => (
                            <Badge key={i} variant="outline" className="text-[9px] rounded-md font-bold py-0 h-5">
                              {item.name} x{item.quantity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 justify-center">
                  {order.status === 'pending' && (
                    <Button 
                      onClick={() => confirmOrder(order.id)}
                      className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 px-6 font-bold gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Confirmar
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    onClick={() => deleteOrder(order.id)}
                    className="text-destructive/50 hover:text-destructive hover:bg-destructive/10 rounded-xl h-12 px-6 font-bold"
                  >
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
