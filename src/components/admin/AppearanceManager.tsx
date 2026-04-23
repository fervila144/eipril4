"use client"

import { useState, useRef, useEffect } from 'react';
import { useAppearanceStore } from '@/hooks/use-appearance-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette, Type, Image as ImageIcon, Save, Check, Upload, X, Loader2, SlidersHorizontal, Eye, MessageCircle, Smartphone, Globe, Layout } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';

const COLOR_PRESETS = [
  { name: 'Marrón Eipril', value: '25 30% 35%' },
  { name: 'Beige Lino', value: '35 30% 85%' },
  { name: 'Tierra Quemada', value: '20 40% 25%' },
  { name: 'Arena Cálida', value: '40 25% 65%' },
  { name: 'Verde Oliva Profundo', value: '100 20% 30%' },
  { name: 'Terracota Suave', value: '15 45% 55%' },
  { name: 'Gris Piedra', value: '25 5% 45%' },
  { name: 'Azul Pizarra', value: '210 20% 40%' },
];

const FONT_OPTIONS = [
  { name: 'Inter (Moderno)', value: 'Inter' },
  { name: 'Playfair Display (Elegante)', value: 'Playfair Display' },
  { name: 'Montserrat (Geométrico)', value: 'Montserrat' },
  { name: 'Poppins (Limpio)', value: 'Poppins' },
  { name: 'Raleway (Estilizado)', value: 'Raleway' },
  { name: 'Open Sans (Legible)', value: 'Open Sans' },
  { name: 'Roboto (Estándar)', value: 'Roboto' },
  { name: 'Lato (Clásico)', value: 'Lato' },
  { name: 'Oswald (Condensado)', value: 'Oswald' },
  { name: 'Merriweather (Serif)', value: 'Merriweather' },
  { name: 'Noto Sans (Global)', value: 'Noto Sans' },
  { name: 'Nunito (Redondeado)', value: 'Nunito' },
  { name: 'Source Sans 3 (Versátil)', value: 'Source Sans 3' },
  { name: 'Quicksand (Amigable)', value: 'Quicksand' },
  { name: 'Cormorant Garamond (Lujoso)', value: 'Cormorant Garamond' },
  { name: 'Cinzel (Clásico Romano)', value: 'Cinzel' },
];

export function AppearanceManager() {
  const { appearance, updateAppearance, isLoading } = useAppearanceStore();
  const [localSettings, setLocalSettings] = useState(appearance);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const { toast } = useToast();
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const getHSLValues = (hslString: string) => {
    const matches = hslString.match(/(\d+)\s+(\d+)%\s+(\d+)%/);
    if (matches) {
      return {
        h: parseInt(matches[1]),
        s: parseInt(matches[2]),
        l: parseInt(matches[3])
      };
    }
    return { h: 25, s: 30, l: 35 };
  };

  const [customHSL, setCustomHSL] = useState(getHSLValues(appearance.primaryColor));

  useEffect(() => {
    setLocalSettings(appearance);
    setCustomHSL(getHSLValues(appearance.primaryColor));
  }, [appearance]);

  const handleCustomColorChange = (key: 'h' | 's' | 'l', value: number[]) => {
    const newHSL = { ...customHSL, [key]: value[0] };
    setCustomHSL(newHSL);
    const hslString = `${newHSL.h} ${newHSL.s}% ${newHSL.l}%`;
    setLocalSettings({ ...localSettings, primaryColor: hslString });
  };

  const handleSave = () => {
    updateAppearance(localSettings);
    toast({
      title: "Cambios guardados",
      description: "La apariencia de la tienda ha sido actualizada con éxito.",
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Imagen demasiado grande",
        description: "El límite es de 5MB.",
      });
      return;
    }

    const setLoading = type === 'logo' ? setIsUploadingLogo : setIsUploadingFavicon;
    setLoading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const field = type === 'logo' ? 'logoUrl' : 'faviconUrl';
      setLocalSettings(prev => ({ ...prev, [field]: reader.result as string }));
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const dynamicPreviewStyles = `
    :root {
      --primary: ${localSettings.primaryColor} !important;
      --ring: ${localSettings.primaryColor} !important;
    }
    body, h1, h2, h3, h4, h5, h6, .font-headline {
      font-family: '${localSettings.fontFamily}', sans-serif !important;
    }
  `;

  if (isLoading) return <div className="flex justify-center py-20"><Palette className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-4 pb-20">
      <style dangerouslySetInnerHTML={{ __html: dynamicPreviewStyles }} />
      
      <div className="space-y-2">
        <h2 className="text-4xl font-black text-foreground">Personalización</h2>
        <p className="text-muted-foreground font-medium flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" /> Ajusta los colores, fuentes e identidad visual.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <section className="bg-white/50 dark:bg-black/20 p-8 rounded-[2.5rem] border border-primary/5 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl"><ImageIcon className="h-5 w-5 text-primary" /></div>
              <h3 className="text-xl font-bold">Identidad de Marca</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Logo Principal</Label>
                <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
                <div className="relative aspect-[3/1] rounded-2xl border-2 border-dashed border-primary/10 bg-secondary/10 overflow-hidden flex items-center justify-center group">
                  {localSettings.logoUrl ? (
                    <>
                      <img src={localSettings.logoUrl} alt="Logo" className="h-full w-full object-contain p-4" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => logoInputRef.current?.click()} className="rounded-full">Cambiar</Button>
                        <Button size="icon" variant="destructive" onClick={() => setLocalSettings({...localSettings, logoUrl: ''})} className="rounded-full h-8 w-8"><X className="h-4 w-4" /></Button>
                      </div>
                    </>
                  ) : (
                    <Button variant="ghost" className="flex flex-col gap-2 h-full w-full" onClick={() => logoInputRef.current?.click()}>
                      {isUploadingLogo ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                      <span className="text-xs font-bold uppercase">Subir Logo (Máx 5MB)</span>
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Favicon (Ícono pestaña)</Label>
                <input type="file" ref={faviconInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'favicon')} />
                <div className="relative h-20 w-20 rounded-2xl border-2 border-dashed border-primary/10 bg-secondary/10 overflow-hidden flex items-center justify-center group">
                  {localSettings.faviconUrl ? (
                    <>
                      <img src={localSettings.faviconUrl} alt="Favicon" className="h-10 w-10 object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        <Button size="icon" variant="secondary" onClick={() => faviconInputRef.current?.click()} className="rounded-full h-8 w-8"><Upload className="h-3 w-3" /></Button>
                        <Button size="icon" variant="destructive" onClick={() => setLocalSettings({...localSettings, faviconUrl: ''})} className="rounded-full h-8 w-8"><X className="h-3 w-3" /></Button>
                      </div>
                    </>
                  ) : (
                    <Button variant="ghost" className="flex flex-col gap-1 h-full w-full" onClick={() => faviconInputRef.current?.click()}>
                      {isUploadingFavicon ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoText" className="text-[10px] font-black uppercase tracking-widest opacity-40">Nombre de la Tienda</Label>
                <Input 
                  id="logoText"
                  value={localSettings.logoText}
                  onChange={(e) => setLocalSettings({...localSettings, logoText: e.target.value})}
                  className="rounded-xl h-11"
                  placeholder="Ej. EIPRIL"
                />
              </div>
            </div>
          </section>

          <section className="bg-white/50 dark:bg-black/20 p-8 rounded-[2.5rem] border border-primary/5 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl"><Layout className="h-5 w-5 text-primary" /></div>
              <h3 className="text-xl font-bold">Textos del Catálogo</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="catalogTitle" className="text-[10px] font-black uppercase tracking-widest opacity-40">Título Principal</Label>
                <Input 
                  id="catalogTitle"
                  value={localSettings.catalogTitle}
                  onChange={(e) => setLocalSettings({...localSettings, catalogTitle: e.target.value})}
                  className="rounded-xl h-11"
                  placeholder="Ej. Eipril Store"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="catalogSubtitle" className="text-[10px] font-black uppercase tracking-widest opacity-40">Eslogan o Subtítulo</Label>
                <Input 
                  id="catalogSubtitle"
                  value={localSettings.catalogSubtitle}
                  onChange={(e) => setLocalSettings({...localSettings, catalogSubtitle: e.target.value})}
                  className="rounded-xl h-11"
                  placeholder="Ej. Calidad excepcional en cada detalle"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-white/50 dark:bg-black/20 p-8 rounded-[2.5rem] border border-primary/5 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl"><Palette className="h-5 w-5 text-primary" /></div>
              <h3 className="text-xl font-bold">Colores y Estilo</h3>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Color Primario</Label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      setLocalSettings({ ...localSettings, primaryColor: color.value });
                      setCustomHSL(getHSLValues(color.value));
                    }}
                    className={`h-10 rounded-xl border-2 ${localSettings.primaryColor === color.value ? 'border-primary' : 'border-transparent'}`}
                    style={{ backgroundColor: `hsl(${color.value})` }}
                  />
                ))}
              </div>
              
              <div className="space-y-4 pt-4 border-t border-primary/5">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase"><span>Tono</span><span>{customHSL.h}°</span></div>
                  <Slider value={[customHSL.h]} max={360} onValueChange={(v) => handleCustomColorChange('h', v)} />
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-40">Tipografía Principal</Label>
              <Select value={localSettings.fontFamily} onValueChange={(v) => setLocalSettings({...localSettings, fontFamily: v})}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {FONT_OPTIONS.map(f => <SelectItem key={f.value} value={f.value}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="bg-white/50 dark:bg-black/20 p-8 rounded-[2.5rem] border border-primary/5 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl"><MessageCircle className="h-5 w-5 text-primary" /></div>
              <h3 className="text-xl font-bold">Canales y Pagos</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mp-alias" className="text-[10px] font-black uppercase tracking-widest opacity-40">Alias Mercado Pago</Label>
                <Input id="mp-alias" value={localSettings.mercadopagoAlias} onChange={(e) => setLocalSettings({...localSettings, mercadopagoAlias: e.target.value})} className="rounded-xl h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-[10px] font-black uppercase tracking-widest opacity-40">WhatsApp de contacto</Label>
                <Input id="whatsapp" value={localSettings.whatsappNumber} onChange={(e) => setLocalSettings({...localSettings, whatsappNumber: e.target.value})} className="rounded-xl h-11" />
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-primary/10">
        <Button 
          onClick={handleSave} 
          className="bg-primary hover:bg-primary/90 rounded-2xl h-14 px-10 gap-3 text-lg font-black shadow-xl text-white"
        >
          <Save className="h-5 w-5" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}