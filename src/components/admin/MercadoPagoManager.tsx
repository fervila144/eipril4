
"use client"

import { useProductsStore } from '@/hooks/use-products-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smartphone, Link as LinkIcon, Save, Loader2, Search, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

export function MercadoPagoManager() {
  const { products, isLoading, updateProduct } = useProductsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [localLinks, setLocalLinks] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSave = (id: string) => {
    const link = localLinks[id];
    if (link === undefined) return;
    setSavingId(id);
    updateProduct(id, { mpLink: link });
    setTimeout(() => {
      setSavingId(null);
      toast({ title: "Enlace guardado" });
    }, 500);
  };

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">Mercado Pago</h2>
          <p className="text-sm text-muted-foreground">Gestiona enlaces de pago individuales.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
          <Input placeholder="Buscar..." className="pl-9 h-10 rounded-xl" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="space-y-3">
        {filteredProducts.map((p) => (
          <Card key={p.id} className="rounded-2xl border-none bg-secondary/10">
            <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
              <div className="relative h-12 w-12 rounded-lg overflow-hidden shrink-0"><img src={p.imageUrl} className="object-cover fill" alt=""/></div>
              <div className="flex-1 w-full">
                <p className="font-bold text-sm truncate">{p.name}</p>
                <p className="text-xs text-primary font-black">${p.price.toLocaleString()}</p>
              </div>
              <div className="flex w-full md:w-auto gap-2 items-center">
                <Input 
                  placeholder="Link mpago.la/..."
                  className="h-10 rounded-lg text-xs md:w-80"
                  value={localLinks[p.id] !== undefined ? localLinks[p.id] : (p.mpLink || '')}
                  onChange={(e) => setLocalLinks(prev => ({ ...prev, [p.id]: e.target.value }))}
                />
                <Button size="icon" onClick={() => handleSave(p.id)} disabled={savingId === p.id} className="shrink-0 h-10 w-10">
                  {savingId === p.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
