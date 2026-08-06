# 🧠 Arquitectura Principal & Orquestación de Agentes (Master Rules) - SnapSkills

## 1. 🏗️ Filosofía Inquebrantable: Spec-Driven Development (SDD)
- **CERO SUPOSICIONES:** Queda terminantemente PROHIBIDO generar lógica de negocio, manipulación del DOM en sitios de terceros o componentes de UI sin antes exigir o revisar las especificaciones exactas.
- **Validación de Permisos:** Antes de usar APIs de Chrome (`chrome.storage`, `chrome.sidePanel`, etc.), verifica que estén declaradas en el `manifest.json` y respeta estrictamente el manifiesto V3.
- **Workflow Obligatorio:** Analizar petición -> Confirmar viabilidad en Manifest V3 (revisar Side Panel, CORS y permisos) -> Generar implementación (Side Panel, Content Script o Background).

## 2. 🔀 Enrutamiento de Habilidades (Skill Routing)
Debes orquestar tus acciones invocando proactivamente los conocimientos en `.agents/skills/`:
- **Arquitectura Base Chrome Extension:** Para cualquier tarea relacionada con Manifest V3, Content Scripts, Background, paso de mensajes o el panel lateral, **OBLIGATORIO** consultar la skill `chrome-extension` (y `react-chrome-extension` si se emplea React).
- **Interfaz y Maquetación (Side Panel):** Usa `tailwindcss` (v4) para el styling del Side Panel, buscando un diseño limpio y moderno que encaje en el espacio limitado. Apóyate en `layout-patterns` y `responsive-design` (ej. grids tipo Bento, skeletal loaders).
- **Estética y Animaciones:** Para micro-interacciones premium (ej. estados de carga, hover en botones de inyectar/adjuntar), integra siempre `motion-effects` junto a `design`.
- **Textos e Idiomas:** Todo el texto visible al usuario debe respetar las reglas de la skill `i18n` para soportar múltiples idiomas sin hardcodear cadenas.

## 3. 🔌 Arquitectura SnapSkills (Chrome Extension V3)
- **Concepto Principal:** SnapSkills es una extensión multidisciplinaria (diseñadores, programadores, marketers) que funciona como un Panel Lateral (`Side Panel`). Proporciona una biblioteca universal de habilidades procedimentales (prompts expertos en Markdown).
- **Interfaz de Usuario (Side Panel):** Acompaña al usuario de manera persistente junto al chat de IA (ChatGPT, Claude, Gemini). Contiene una interfaz moderna con:
  - **Barra de Búsqueda:** Con *placeholders dinámicos* (sugiere keywords basados en la vista actual) y un botón integrado para limpiar la búsqueda.
  - **Tabs de Navegación:** Biblioteca, Guardados, Historial (búsquedas recientes), Creados (skills personalizadas) y Ajustes.
  - **Configuración (Settings):** Soporte multi-idioma (Inglés/Español) vía `next-intl`, temas Claro/Oscuro dinámicos, y configuración segura del GitHub Personal Access Token (con fallback al token de entorno).
- **Fuente de Datos:** Integración directa con GitHub (usando la Search API para búsquedas y `raw.githubusercontent.com` para descargar los archivos `SKILL.md`) para alimentar el catálogo, y `chrome.storage.local` para almacenar configuración y habilidades creadas.

## 4. ⚙️ Acciones Principales (Flujo de Acción)
Cada "skill" dentro de la extensión cuenta con cuatro acciones fundamentales a través de iconos, disponibles tanto en el listado como en la vista de detalle:
1. **Guardar (Storage):** Almacenar la habilidad en el almacenamiento local (`chrome.storage.local`) para acceso rápido. Utiliza un icono de marcador (`Bookmark`).
2. **Copiar (Clipboard):** Copia el contenido Markdown al portapapeles del usuario usando `navigator.clipboard`. Utiliza el icono `Copy` que cambia a `Check` temporalmente para confirmar la acción.
3. **Descargar MD:** Genera un archivo `.md` dinámico usando la API Blob y lo descarga automáticamente al equipo del usuario. Usa el icono `Download`.
4. **Ver en GitHub:** Abre una nueva pestaña en el navegador hacia la URL original del repositorio en GitHub (`chrome.tabs.create`). Usa el icono `ExternalLink`. *(Oculto para skills personalizadas locales).*

*(Nota: Originalmente se intentó Inyección en DOM y simulación de Adjunto, pero las fuertes restricciones y estructuras cambiantes de los frameworks reactivos (OpenAI, Anthropic) motivaron la transición a un modelo más estable basado en portapapeles y descarga de archivos).*

Además, la extensión cuenta con una **Vista de Detalle**, accesible al hacer clic sobre cualquier skill, donde se renderiza su contenido Markdown directamente en el panel lateral utilizando `react-markdown` y `remark-gfm`.

## 5. 🛑 Prevención de Alucinaciones y Reglas de Código
- **Content Scripts Especializados:** Cuidado extremo al inyectar o interactuar con los DOMs de plataformas de IA (OpenAI, Anthropic, Google). Son aplicaciones SPA complejas (React/ProseMirror) y sus selectores cambian. Usa MutationObservers y selectores resilientes. Si dudas del DOM, pregunta antes de codificar.
- **Manejo de Promesas:** Las APIs de Manifest V3 (incluyendo `chrome.sidePanel`) están basadas en promesas (`Promise`). Usa `async/await` consistentemente.
- **Estado Global:** En Manifest V3, el Service Worker (Background) se inactiva frecuentemente. Persiste siempre el estado en `chrome.storage.local` o `chrome.storage.session`. No uses variables globales estáticas.

---

# Detalles Técnicos del Proyecto (SnapSkills)

## Project Overview
- **Project Name:** SnapSkills
- **Framework**: Chrome Extension (Manifest V3)
- **Primary UI**: `side_panel.html` (Side Panel API)
- **Target Sites**: chatgpt.com, claude.ai, gemini.google.com
- **Core Functionality**: Search via GitHub API, fetch raw `.md` files, store saved and locally created skills, maintain search history, render markdown details, copy to clipboard, and download `.md` files.

## Architecture Patterns

### Side Panel & Background Worker
Asegurar que el panel lateral se abre al hacer clic en el action icon (el ícono de la extensión):
```javascript
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error("Error setting side panel behavior:", error));
});
```

### Content Scripts (DOM Injection & Text Manipulation)
Al inyectar texto en los chats de IA, es preferible despachar eventos adecuados o usar comandos que el editor enriquezca, en lugar de alterar `element.value` directamente, lo cual suele fallar en frameworks reactivos.
```javascript
// Ejemplo conceptual de inserción en editores enriquecidos
function insertTextIntoEditor(selector, text) {
  const el = document.querySelector(selector);
  if (el) {
    el.focus();
    // execCommand suele ser el más efectivo para contenteditable a pesar de estar deprecated
    document.execCommand('insertText', false, text); 
  }
}
```

### API Fetching & CORS (Background)
Recuerda que los Content Scripts pueden sufrir bloqueos de CORS o CSP de la página anfitriona (ej. ChatGPT). Si necesitas obtener los archivos Markdown raw desde GitHub o hacer peticiones a la API de GitHub, **debes hacerlo desde el Background Service Worker** y enviar la respuesta al Side Panel o al Content Script vía paso de mensajes (`chrome.runtime.sendMessage`).
