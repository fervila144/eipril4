"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, Zap, Copy, Check, Percent } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CalculationsManager() {
  const [basePrice, setBasePrice] = useState<string>('');
  const [customPercentage, setCustomPercentage] = useState<string>('7');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { toast } = useToast();

  const price = parseFloat(basePrice) || 0;
  const percentageValue = parseFloat(customPercentage) || 0;
  const percentageAmount = (price * percentageValue) / 100;
  const priceWithTax = price + percentageAmount;

  const multipliers = [2, 3, 4, 5];

  const handleCopy = (value: number, key: string) => {
    navigator.clipboard.writeText(value.toFixed(2));
    setCopiedKey(key);
    toast({
      title: "Precio copiado",
      description: `$${value.toLocaleString()} copiado al portapapeles.`,
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-2">
        <h2 className="text-4xl font-black text-foreground">Herramientas de Cálculo</h2>
        <p className="text-muted-foreground font-medium flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" /> Calcula márgenes, IVA y comisiones rápidamente.
        </p>
      </div>

      <section className="bg-white/50 dark:bg-black/20 p-8 rounded-[2.5rem] border border-primary/5 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Entrada Principal */}
          <div className="space-y-4">
            <Label htmlFor="basePrice" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Precio de Costo / Base</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary">$</span>
              <Input 
                id="basePrice"
                type="number"
                placeholder="0.00"
                className="rounded-2xl h-14 pl-10 text-xl font-black border-primary/10 bg-white dark:bg-zinc-900"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
              />
            </div>
          </div>

          {/* Configuración de Porcentaje */}
          <div className="space-y-4">
            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">IVA o Comisión (%)</Label>
            <div className="flex items-center gap-3">
              <div className="relative flex-grow">
                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />
                <Input 
                  type="number"
                  className="rounded-2xl h-14 pl-12 text-xl font-black border-primary/10 bg-white dark:bg-zinc-900"
                  value={customPercentage}
                  onChange={(e) => setCustomPercentage(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sección Porcentajes (Comisiones/IVA) */}
          <div className="space-y-4 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm uppercase tracking-widest">Resumen con {customPercentage}%</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-primary/5 shadow-sm flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-black uppercase opacity-40">Monto del {customPercentage}%</p>
                  <p className="text-xl font-black text-primary">${percentageAmount.toLocaleString()}</p>
                </div>
                <Button 
                  onClick={() => handleCopy(percentageAmount, 'perc')}
                  variant="ghost" 
                  size="icon"
                  className="rounded-full h-10 w-10 text-primary"
                >
                  {copiedKey === 'perc' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-primary/5 shadow-sm flex justify-between items-center ring-2 ring-primary/20">
                <div>
                  <p className="text-[9px] font-black uppercase opacity-40">Total (Costo + {customPercentage}%)</p>
                  <p className="text-xl font-black text-foreground">${priceWithTax.toLocaleString()}</p>
                </div>
                <Button 
                  onClick={() => handleCopy(priceWithTax, 'totalperc')}
                  variant="ghost" 
                  size="icon"
                  className="rounded-full h-10 w-10 text-primary"
                >
                  {copiedKey === 'totalperc' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Sección Multiplicadores Rápidos */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm uppercase tracking-widest">Márgenes (sobre Total con %)</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {multipliers.map((m) => {
                const result = priceWithTax * m;
                const key = `mult-${m}`;
                return (
                  <div 
                    key={m} 
                    className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-primary/5 shadow-sm space-y-2 group hover:border-primary/20 transition-all"
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary/40 block">x{m} del total</span>
                    <div className="text-lg font-black text-foreground">${result.toLocaleString()}</div>
                    <Button 
                      onClick={() => handleCopy(result, key)}
                      variant="secondary" 
                      className="w-full h-8 rounded-lg text-[9px] font-bold uppercase gap-2 bg-primary/5 hover:bg-primary/10 text-primary border-none"
                    >
                      {copiedKey === key ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      Copiar
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 bg-secondary/10 rounded-[2rem] border border-dashed border-primary/10">
          <p className="text-xs text-muted-foreground font-medium italic">
            Ahora los multiplicadores x2, x3, etc., se calculan utilizando el precio base más el porcentaje de IVA/Comisión, dándote un margen real sobre el costo total.
          </p>
        </div>
      </section>
    </div>
  );
}