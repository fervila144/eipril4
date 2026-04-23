
"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Product } from '@/lib/types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageIcon, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCategoriesStore } from '@/hooks/use-categories-store';

interface ProductFormProps {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id' | 'createdAt'>) => void;
}

const EMPTY_DATA = {
  name: '',
  description: '',
  price: 0,
  stock: 1,
  imageUrl: '',
  images: [] as string[],
  imageNames: [] as string[],
  category: '',
  isHidden: false,
  isOffer: false
};

export function ProductForm({ product, isOpen, onClose, onSubmit }: ProductFormProps) {
  const { toast } = useToast();
  const { categories } = useCategoriesStore();
  const [isUploading, setIsUploading] = useState<number | null>(null);
  const [formData, setFormData] = useState(EMPTY_DATA);

  useEffect(() => {
    if (!isOpen) return;
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        stock: product.stock ?? 1,
        imageUrl: product.imageUrl || '',
        images: product.images || (product.imageUrl ? [product.imageUrl] : []),
        imageNames: product.imageNames || [],
        category: product.category || (categories[0]?.name || 'General'),
        isHidden: !!product.isHidden,
        isOffer: !!product.isOffer
      });
    } else {
      setFormData({ ...EMPTY_DATA, category: categories[0]?.name || 'General' });
    }
  }, [product, isOpen, categories]);

  // Función para comprimir y redimensionar la imagen antes de subirla
  const processImage = (file: File): Promise<{ base64: string, name: string }> => {
    return new Promise((resolve, reject) => {
      if (file.size > 5.5 * 1024 * 1024) {
        return reject('El archivo supera los 5MB');
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionar si es muy grande (máximo 1200px)
          const MAX_SIZE = 1200;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Comprimir a JPEG con calidad 0.7 para asegurar que el base64 sea < 1MB
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          resolve({ base64: compressedBase64, name: file.name });
        };
        img.onerror = () => reject('Error al cargar la imagen');
      };
      reader.onerror = () => reject('Error al leer el archivo');
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(index);
    try {
      const { base64, name } = await processImage(file);
      setFormData(prev => {
        const newImages = [...prev.images];
        const newNames = [...prev.imageNames];
        newImages[index] = base64;
        newNames[index] = name;
        return { 
          ...prev, 
          images: newImages, 
          imageNames: newNames,
          imageUrl: newImages[0] || '' 
        };
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Error de imagen", 
        description: String(error) 
      });
    } finally {
      setIsUploading(null);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      const newNames = prev.imageNames.filter((_, i) => i !== index);
      return { 
        ...prev, 
        images: newImages, 
        imageNames: newNames,
        imageUrl: newImages[0] || '' 
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      toast({ variant: "destructive", title: "Falta imagen", description: "Carga al menos una foto." });
      return;
    }
    
    onSubmit({
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      imageUrl: formData.images[0]
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[2rem] border-none">
        <DialogHeader>
          <DialogTitle className="text-lg font-black uppercase">{product ? 'Editar' : 'Nuevo Producto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase opacity-60">Nombre</Label>
              <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-9 rounded-xl text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase opacity-60">Precio ($)</Label>
              <Input type="number" required value={formData.price || ''} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="h-9 rounded-xl text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase opacity-60">Stock</Label>
              <Input type="number" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} className="h-9 rounded-xl text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-bold uppercase opacity-60">Categoría</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                <SelectTrigger className="h-9 rounded-xl text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-xl">
                  {categories.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-xl flex-1">
              <Switch checked={formData.isHidden} onCheckedChange={(v) => setFormData({...formData, isHidden: v})} />
              <Label className="text-[10px] font-bold uppercase">Ocultar</Label>
            </div>
            <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-xl flex-1">
              <Switch checked={formData.isOffer} onCheckedChange={(v) => setFormData({...formData, isOffer: v})} />
              <Label className="text-[10px] font-bold uppercase text-primary">Oferta</Label>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[10px] font-bold uppercase opacity-60">Descripción</Label>
            <Textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="h-20 rounded-xl text-xs resize-none" />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase opacity-60">Imágenes (Hasta 5MB - Se comprimen automáticamente)</Label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="aspect-square relative group">
                  <input type="file" id={`f-${i}`} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, i)} />
                  {formData.images[i] ? (
                    <div className="h-full w-full rounded-xl overflow-hidden border bg-white">
                      <img src={formData.images[i]} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1">
                        <span className="text-[8px] text-white font-bold text-center break-all line-clamp-2">
                          {formData.imageNames[i]}
                        </span>
                      </div>
                      <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-destructive text-white p-1 rounded-full shadow-lg z-10"><X className="h-2.5 w-2.5" /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => document.getElementById(`f-${i}`)?.click()} className="h-full w-full border-2 border-dashed rounded-xl flex items-center justify-center bg-secondary/20 hover:bg-secondary/40 transition-colors">
                      {isUploading === i ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <ImageIcon className="h-4 w-4 opacity-20" />}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl h-9 text-xs">Cancelar</Button>
            <Button type="submit" className="rounded-xl h-9 text-xs px-8 uppercase font-bold" disabled={isUploading !== null}>
              {product ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
