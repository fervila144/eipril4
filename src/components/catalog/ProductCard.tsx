
"use client"

import { Product } from '@/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, ShoppingCart, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/hooks/use-cart-store';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

export function ProductCard({ product, onEdit, onDelete, isAdmin }: ProductCardProps) {
  const { addItem } = useCartStore();
  const isOutOfStock = (product.stock || 0) <= 0;

  return (
    <Card className="overflow-hidden border-none bg-secondary/20 rounded-2xl flex flex-col h-full hover:shadow-xl transition-all group relative">
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name || ''}
          fill
          className={`object-cover transition-transform duration-500 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        
        {/* Cinta de Oferta Estilo "Peligro/Ribbon" */}
        {product.isOffer && (
          <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 z-20 pointer-events-none">
            <div className="absolute top-4 -right-9 w-32 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest text-center rotate-45 shadow-lg border-y border-white/20">
              Oferta
            </div>
          </div>
        )}

        {/* Overlay con iconos al hacer hover o tocar en móviles */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4 z-10 pointer-events-none group-hover:pointer-events-auto">
            <Link href={`/product/${product.id}`} className="pointer-events-auto">
              <Button 
                size="icon" 
                className="h-12 w-12 rounded-full bg-white text-black hover:bg-white/90 shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300"
                title="Ver detalles"
              >
                <Eye className="h-6 w-6" />
              </Button>
            </Link>
            <Button 
              size="icon" 
              className="h-12 w-12 rounded-full bg-primary text-white shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300 delay-75 pointer-events-auto"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem(product);
              }}
              title="Añadir al carrito"
            >
              <ShoppingCart className="h-6 w-6" />
            </Button>
          </div>
        )}

        {isOutOfStock && <Badge className="absolute top-2 left-2 bg-black/60 text-[8px] uppercase z-20">Sin stock</Badge>}
      </div>
      
      <CardContent className="p-3 flex-grow flex flex-col justify-between">
        <div>
          <p className="text-[9px] font-bold text-primary opacity-60 uppercase tracking-widest truncate">{product.category}</p>
          <h3 className="font-bold text-xs md:text-sm line-clamp-1 uppercase">{product.name}</h3>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-black text-sm text-primary">${(product.price || 0).toLocaleString()}</span>
        </div>
      </CardContent>

      {isAdmin && onEdit && onDelete && (
        <CardFooter className="p-2 pt-0 flex gap-1 z-20 relative">
          <Button variant="secondary" size="sm" className="flex-1 h-8 text-[10px] font-bold uppercase" onClick={() => onEdit(product)}>
            <Edit2 className="h-3 w-3 mr-1" /> Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/50 hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base font-bold">¿Eliminar?</AlertDialogTitle>
                <AlertDialogDescription className="text-xs">Esta acción no se puede deshacer.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="rounded-xl text-xs h-9">No</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(product.id)} className="rounded-xl h-9 text-xs bg-destructive">Sí, eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      )}
    </Card>
  );
}
