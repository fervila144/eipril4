
# 🚀 Eipril - Catálogo Minimalista

Este es el catálogo de productos oficial de **Eipril**, construido con **Next.js 15**, **Firebase** y **Genkit AI**. Diseñado para ser rápido, elegante y fácil de gestionar.

## 🛠️ Requisitos previos

1.  Una cuenta en [GitHub](https://github.com).
2.  Una cuenta en [Netlify](https://netlify.com).
3.  Un proyecto en [Firebase Console](https://console.firebase.google.com).

## 💰 Configuración de Mercado Pago

Para habilitar los cobros en tu tienda:

1.  **Entra a tu Panel Admin**: Ve a `/admin` (asegúrate de haber iniciado sesión con tu cuenta de administrador).
2.  **Configura tu Alias**: En la pestaña **Personalización**, pon tu Alias de Mercado Pago. Esto se usará para las ventas por transferencia del carrito.
3.  **Habilita Links de Pago**:
    - Ve a la [Consola de Mercado Pago](https://www.mercadopago.com.ar/tools/checkout).
    - Crea un "Link de Pago" para cada producto.
    - En tu Panel Admin, ve a la pestaña **Mercado Pago** y pega los links correspondientes a cada producto.

## 📦 Guía de Despliegue en Netlify

1.  Crea un nuevo repositorio en GitHub y sube los archivos.
2.  Conecta con Netlify y elige el repositorio.
3.  Configura las variables de entorno (`NEXT_PUBLIC_FIREBASE_...`, `GOOGLE_GENAI_API_KEY`).
4.  Haz clic en **"Deploy site"**.

## 📱 Características principales

- **Panel Admin**: Gestión total de productos, categorías y banners.
- **Personalización**: Cambia colores y fuentes en tiempo real.
- **WhatsApp**: Integración directa para pedidos y consultas con comprobantes visuales.
- **Optimizado**: Configuración lista para producción y SEO.

---
Hecho con ❤️ para **Eipril**.
