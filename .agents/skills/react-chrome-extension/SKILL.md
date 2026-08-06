---
name: react-chrome-extension
description: Best practices for building Chrome Extensions with React, Vite, and Shadow DOM.
---

# Desarrollo de Extensiones de Chrome con React

## 1. 🏗️ Arquitectura General
Al usar React en una extensión de Chrome (Manifest V3), hay diferencias críticas en dónde y cómo se renderiza la UI:
- **Popups, Side Panels, Options Pages:** Funcionan como mini-SPAs (Single Page Applications) normales. React se monta en un elemento `div` base.
- **Content Scripts:** Como se inyectan en páginas de terceros (ej. Google, Freepik), **es crítico aislar los estilos de React** para que no choquen con el CSS de la página anfitriona. Se usa el **Shadow DOM** para encapsular el componente React.
- **Background (Service Worker):** No tiene acceso al DOM, por lo que React no se usa aquí. Solo TypeScript/JavaScript puro para manejar eventos y estado global.

## 2. 🔌 Inyectando React con Shadow DOM (Content Scripts)
Nunca montes React directamente en el `document.body` de una web externa. Siempre crea un contenedor, adjunta un Shadow Root y monta React ahí usando `createRoot`.

```tsx
import { createRoot } from 'react-dom/client';
// ...importaciones de componentes

function injectReactUI() {
  if (document.getElementById('mi-extension-root')) return;

  const container = document.createElement('div');
  container.id = 'mi-extension-root';
  // Posicionamiento para que flote sobre la web
  container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 2147483647;';
  document.body.appendChild(container);

  // Aislar estilos con Shadow DOM
  const shadowRoot = container.attachShadow({ mode: 'open' });

  // Inyectar el CSS compilado (si usas Tailwind v4 o similar)
  // En Vite, el CSS a menudo debe ser inyectado manualmente o configurado en el build
  const style = document.createElement('style');
  style.textContent = \`/* CSS inyectado o @import */\`;
  shadowRoot.appendChild(style);

  // Crear un div dentro del shadowRoot para que React se monte
  const reactRootDiv = document.createElement('div');
  shadowRoot.appendChild(reactRootDiv);

  // Montar React
  const root = createRoot(reactRootDiv);
  root.render(<MiComponenteReact />);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectReactUI);
} else {
  injectReactUI();
}
```

## 3. ⚛️ Estado y Comunicación
- **Sincronización de Estado:** El Side Panel y el Content Script no comparten la memoria de React (cada uno tiene su propio árbol y contexto). Para sincronizar estado, confía en `chrome.storage.local`.
- Usa `useEffect` para suscribirte a `chrome.storage.onChanged` si necesitas que la UI reaccione a cambios de estado en segundo plano o desde otra ventana.

```tsx
useEffect(() => {
  const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes.myData) {
      setLocalState(changes.myData.newValue);
    }
  };
  chrome.storage.onChanged.addListener(handleStorageChange);
  return () => chrome.storage.onChanged.removeListener(handleStorageChange);
}, []);
```

## 4. 🛠️ Configuración de Vite
Asegúrate de que `vite.config.ts` tenga el plugin de React y esté configurado para emitir múltiples puntos de entrada (sidepanel, content, background) sin inyectar scripts en un solo HTML, ya que los content scripts son JavaScript puros.

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// ...otros plugins

export default defineConfig({
  plugins: [react(), /* otros */],
  build: {
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'sidepanel.html'),
        content: resolve(__dirname, 'src/content/content.tsx'),
        background: resolve(__dirname, 'src/background/service-worker.ts'),
      },
      output: {
        entryFileNames: 'scripts/[name].js',
        chunkFileNames: 'scripts/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});
```

## 5. 💅 Tailwind v4
Para usar Tailwind dentro del Shadow DOM, es posible que necesites inyectar el archivo CSS compilado resultante dentro del `<style>` del Shadow DOM, o configurar un emisor de estilos específico. Para sidepanels y popups, un `<link rel="stylesheet">` normal en el HTML funciona perfectamente.
