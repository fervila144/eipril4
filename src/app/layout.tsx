
"use client"

import { useEffect, useMemo } from 'react';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { useAppearanceStore } from '@/hooks/use-appearance-store';
import { CartProvider } from '@/hooks/use-cart-store';
import { ThemeChoiceOverlay } from '@/components/ThemeChoiceOverlay';

function DynamicThemeWrapper({ children }: { children: React.ReactNode }) {
  const { appearance } = useAppearanceStore();
  
  const dynamicStyles = useMemo(() => `
    :root {
      --primary: ${appearance.primaryColor || '25 30% 35%'};
      --ring: ${appearance.primaryColor || '25 30% 35%'};
    }
    body {
      font-family: '${appearance.fontFamily || 'Inter'}', sans-serif;
    }
  `, [appearance.primaryColor, appearance.fontFamily]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    if (appearance.faviconUrl) {
      const FAVICON_ID = 'dynamic-favicon';
      let link = document.getElementById(FAVICON_ID) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.id = FAVICON_ID;
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = appearance.faviconUrl;
    }
  }, [appearance.faviconUrl]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dynamicStyles }} />
      {children}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Montserrat:wght@300;400;700&family=Poppins:wght@300;400;600;700&family=Raleway:wght@300;400;700&family=Open+Sans:wght@300;400;600;700&family=Roboto:wght@300;400;700&family=Lato:wght@300;400;700&family=Oswald:wght@300;400;700&family=Merriweather:wght@300;400;700&family=Noto+Sans:wght@300;400;700&family=Nunito:wght@300;400;700&family=Source+Sans+3:wght@300;400;700&family=Quicksand:wght@300;400;700&family=Cormorant+Garamond:wght@300;400;700&family=Cinzel:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background">
        <FirebaseClientProvider>
          <CartProvider>
            <DynamicThemeWrapper>
              <ThemeChoiceOverlay />
              {children}
              <Toaster />
            </DynamicThemeWrapper>
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
