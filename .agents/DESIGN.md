# DESIGN.md - Sistema de Diseño: SnapSkills

## 1. Overview & Identity
El diseño de SnapSkills replica la estética exacta de **skills.sh** (basada en el Design System de Vercel). Es una interfaz utilitaria, de alto contraste, tipografía meticulosa y retroalimentación visual inmediata. Al vivir en un panel lateral (Side Panel) de Chrome, el diseño es ultracompacto y de baja carga cognitiva.

*   **Minimalismo Estructural:** Uso extensivo de bordes sutiles y fondos grises muy claros para separar contenido sin usar sombras pesadas.
*   **Identidad Vercel/Tailwind:** Uso de la escala de grises neutra y el azul característico extraído directamente del CSS original.
*   **Prosa (Markdown):** El contenido inyectado o previsualizado hereda estilos altamente optimizados para legibilidad técnica.

---

## 2. Design Tokens

### 2.1. Colors & Theme Support
El diseño inicial se basa en la paleta oscura (Dark Mode) y monocromática de skills.sh. Sin embargo, el sistema **ahora soporta Tema Claro (Light Mode)** y Tema Oscuro.
Todos los componentes deben estar construidos utilizando variables de Tailwind v4 y el prefijo `dark:` (ej. `bg-white dark:bg-black`, `text-neutral-900 dark:text-white`) para garantizar la correcta inversión de colores.

| Token | Escala (Tailwind ref) | Código HEX | Usage |
| :--- | :--- | :--- | :--- |
| **Background Base** | `neutral-950` / Black | `#000000` | Fondo principal del panel lateral y barra de búsqueda. |
| **Surface** | `neutral-900` | `#111111` | Fondo de bloques de código (ej. "npx skills init") o tarjetas. |
| **Text Primary** | `white` | `#ffffff` | Títulos principales, nombres de habilidades ("find-skills") y valores. |
| **Text Secondary**| `neutral-400` | `#a1a1aa` | Descripciones generales (ej. "Skills are reusable..."). |
| **Text Tertiary** | `neutral-500` | `#71717a` | Cabeceras de sección ("TRY IT NOW"), placeholders y sub-etiquetas. |
| **Border Default** | `neutral-800` | `#27272a` | Separadores de listas, bordes de inputs. |
| **Accent Primary** | `white` | `#ffffff` | En este diseño monocromático, el blanco puro actúa como acento para la interacción. |

### 2.2. Typography (Geist Font System)
El CSS revela el uso de la tipografía personalizada de Vercel. Si no está disponible, se usan los fallbacks del sistema.

*   **Font Family Primary:** `Geist Sans` (Fallback: `ui-sans-serif, system-ui, sans-serif`).
*   **Font Family Mono:** `Geist Mono` (Fallback: `ui-monospace, SFMono-Regular, Menlo, Monaco`). Se usa para código y etiquetas.
*   **Type Scale:**
    *   `Title`: 16px (`text-base`) - Weight: 600 (`semibold`).
    *   `Subtitle`: 14px (`text-sm`) - Weight: 500 (`medium`).
    *   `Body`: 12px (`text-xs`) - Weight: 400 (`regular`).
    *   `Action/Label`: 12px (`text-xs`) - Weight: 500 (`medium`).
*   **Line Height:** Se prioriza un leading relajado para las descripciones (`1.5` o `24px` de line-height según el CSS base).

### 2.3. Radii & Shadows
*   **Border Radius:** `--radius: .5rem;` (`8px` o `rounded-lg` en Tailwind).
*   **Shadows:** Sombra muy sutil (`shadow-sm`: `0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)`).

---

## 3. Core Components

### 3.1. Search Bar (Sticky Header)
*   **Background:** `#ffffff` en claro, `#000000` en oscuro (`bg-white dark:bg-black`).
*   **Border:** Borde inferior sutil (`border-b border-neutral-200 dark:border-neutral-800`).
*   **Text & Placeholder:** Texto contrastante, Placeholder sutil (`dark:text-neutral-500`). Los placeholders *son dinámicos* (sugieren keywords según la vista).
*   **Clear Button:** Un botón `X` (`X` icon) aparece condicionalmente cuando hay texto, permitiendo limpiar la búsqueda rápidamente.
*   **States (Focus):** Sin anillos de colores vibrantes. Borde cambia sutilmente a `#000` o `#fff` dependiendo del tema.
*   **Iconography:** Icono de lupa a la izquierda, color `#71717a` (`text-neutral-500`).

### 3.2. Skill Cards (Leaderboard Style)
Basado en la lista de habilidades de skills.sh, las tarjetas no son "cajas" cerradas, sino filas (rows) separadas por líneas.
*   **Container:** Fondo transparente (`bg-transparent`), borde inferior `1px solid #27272a`.
*   **Layout:** Flexbox row (`flex-row`), alineación vertical centrada. Espaciado horizontal generoso.
*   **Typography:** Nombre del skill en `#ffffff`, autor/repo en `#71717a`.

### 3.3. Action Buttons (Icon Grid)
La interacción se basa en botones de icono sin texto visible (con tooltips), diseñados para ahorrar espacio y mantener un aspecto técnico.
*   **Icon Buttons**: Fondo transparente (`bg-transparent`), color de icono `#a1a1aa` (neutral-400), padding sutil (`p-1.5`), hover con fondo `#111111` (`neutral-900`) y color `#ffffff` (white).
*   **Disabled State**: Reducción de opacidad (`opacity-50`) cuando una acción (como descargar) está en curso o inhabilitada temporalmente.

### 3.4. Markdown Editor View
Vista para crear o editar habilidades localmente (Custom Skills).
*   **Header Tabs (Edit/Preview):** Pestañas tipo toggle en la parte superior del editor. La pestaña activa utiliza color `#ffffff` y borde inferior blanco. La inactiva usa `#71717a` (neutral-500).
*   **Format Helpers:** Barra de herramientas pequeña debajo de los tabs con iconos (Bold, Italic, Code, List) en `#a1a1aa` y hover `#ffffff` con fondo `#27272a`.
*   **Textarea:** Fondo negro puro, fuente monoespaciada (`font-mono`) y sin bordes (`outline-none`) para minimizar el ruido visual.

---

## 4. Layouts & Patterns

### 4.1. Global Grid System
*   **Container Width:** Fluido (`w-full`), diseñado para encajar en el límite de un Chrome Side Panel (típicamente `320px - 400px`).
*   **Global Padding:** `16px` (`p-4`) alrededor de los bordes del panel.
*   **Item Spacing:** `12px` (`gap-3`) entre cada tarjeta de habilidad.

### 4.2. Iconography Patterns
Para mantener la coherencia visual, se recomiendan íconos de trazo limpio (1.5px o 2px de grosor).

*   **Marca:** `Zap` o `Terminal` (en color `#ffffff` para mantener el monocromatismo).
*   **Navegación:** `Database` (Librería), `Bookmark` (Guardados), `History` (Historial), `PenTool` (Creados), `Settings` (Ajustes).
*   **Acciones:**
    *   Guardar: `Bookmark` (Relleno sólido cuando está activo)
    *   Copiar: `Copy` (Cambia temporalmente a `Check` verde tras copiar)
    *   Descargar: `Download` (Muestra `Loader2` animado durante carga)
    *   Ver en GitHub: `ExternalLink`
*   **Editor:**
    *   Crear Nuevo: `Plus` (En el header principal, acompañado de un texto descriptivo)
    *   Vistas: `Edit2` (Editar código), `Eye` (Preview)
    *   Formato: `Bold`, `Italic`, `Code`, `List`

### 4.3. Internacionalización (i18n)
*   **Zero Hardcoding:** Ninguna cadena de texto visible para el usuario (incluyendo placeholders y tooltips) debe estar hardcodeada.
*   **Sistema:** Se utiliza un patrón similar a `next-intl` (ej. `t('key')`) para extraer textos de diccionarios JSON en `src/messages/`. El diseño de los contenedores debe contemplar que la longitud del texto puede variar drásticamente entre el inglés y el español.
