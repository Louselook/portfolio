# Brand Kit – Juan Esteban Arenill Buendia

Kit de identidad visual para el portafolio web de Juan Esteban Arenill Buendia: logos (isotipo, logotipo, imagotipo, isologo), paleta de colores, tipografía, assets web y recomendaciones de uso.

> **Para el agente que implemente la web:** lee la sección [Reglas para el agente](#reglas-para-el-agente-resumen) primero. Todo lo demás es referencia. Usa los archivos de este kit tal cual; no redibujes ni recolorees los logos.

---

## 1. Contenido del kit

```
juan-arenill-brand-kit/
├── README.md                  ← esta guía
├── logos/
│   ├── svg/                   ← formato preferido (vectorial, texto ya convertido a curvas)
│   └── png/                   ← versiones con fondo transparente, para redes o documentos
├── web/                       ← favicon, iconos PWA, imagen Open Graph, manifest
├── tokens/
│   ├── tokens.css             ← variables CSS (colores, tipografía, espaciado, modo oscuro)
│   └── brand.json             ← los mismos datos en JSON, para scripts o configuración
└── examples/starter.html      ← plantilla mínima de <head>, cabecera y logo adaptable
```

### Archivos de logo (`logos/svg/` y `logos/png/`)

| Tipo | Archivos | Qué es |
|---|---|---|
| **Isotipo** | `isotipo-color`, `isotipo-light`, `isotipo-mono-dark`, `isotipo-mono-light`, `isotipo-currentcolor` (solo SVG) | Solo el símbolo: la J con el punto naranja |
| **Logotipo** | `logotipo-color`, `logotipo-light` | Solo texto, "Juan Esteban / Arenill Buendia", con un punto naranja final |
| **Imagotipo** | `imagotipo-horizontal-color/light`, `imagotipo-vertical-color/light` | Símbolo y texto juntos pero separados |
| **Isologo** | `isologo-color`, `isologo-light` | Símbolo y texto fusionados en una insignia cuadrada |

Sufijos: `-color` = para fondos **claros**; `-light` = para fondos **oscuros** (índigo o similares); `-mono-*` = una sola tinta (sellos, impresión, bordados); `-currentcolor` = el trazo toma el color del texto CSS (`color:`), útil para SVG en línea.

### Archivos web (`web/`)

`favicon.svg` (principal) · `favicon.ico` (16/32/48, respaldo) · `favicon-32.png` · `apple-touch-icon.png` (180×180) · `icon-192.png` y `icon-512.png` (PWA) · `og-image.png` (1200×630, para compartir en redes) · `site.webmanifest`.

---

## 2. Cuándo usar cada logo

| Situación | Usar |
|---|---|
| Cabecera de la web, escritorio (≥ 720 px) | `imagotipo-horizontal` |
| Cabecera de la web, móvil | `isotipo` |
| Favicon, avatar de redes, icono de app | `web/favicon.svg` / `isotipo` |
| Pie de página, firma de correo, documentos | `logotipo` o `imagotipo-horizontal` |
| Portada, hero, tarjeta de presentación | `imagotipo-vertical` |
| Sello, insignia, perfil en redes, pegatina | `isologo` |
| Fondo oscuro (índigo, foto oscura, modo oscuro) | la versión `-light` |
| Una sola tinta (impresión, grabado) | `-mono-dark` o `-mono-light` |

### Tamaños mínimos

| Logo | Mínimo recomendado |
|---|---|
| Isotipo | 16 px de alto (el favicon ya está optimizado para esto) |
| Logotipo | 120 px de ancho |
| Imagotipo horizontal | 140 px de ancho (en la cabecera: 40–48 px de alto) |
| Imagotipo vertical | 120 px de ancho |
| Isologo | 200 px de ancho (el texto interior se vuelve ilegible por debajo) |

Si el espacio es menor que esto, cambia al **isotipo**, que es la única pieza que escala bien hacia abajo.

### Espacio libre

Deja alrededor del logo un margen mínimo igual al **diámetro del punto naranja** (≈ 18 % del alto de la J). Sin textos, bordes ni imágenes dentro de ese margen.

### Qué no hacer

- No estirar, rotar, inclinar ni cambiar las proporciones.
- No cambiar los colores fuera de las variantes incluidas (`-color`, `-light`, `-mono-*`).
- No añadir sombras, degradados, contornos ni efectos.
- No ponerlo sobre fotos o fondos con ruido sin una capa sólida detrás.
- No usar la versión `-color` sobre índigo ni la `-light` sobre crema: pierden contraste.
- No reescribir el nombre con otra fuente: el texto de los logos está convertido a curvas (Inter Medium).

---

## 3. Paleta de colores

| Rol | Nombre | HEX | Uso |
|---|---|---|---|
| Principal | **Índigo** | `#1F1B4D` | Texto, logo, botones, fondo oscuro |
| Fondo | **Crema** | `#F7F5F0` | Fondo general de la página |
| Superficie | **Blanco** | `#FFFFFF` | Tarjetas y paneles sobre crema |
| Acento | **Naranja** | `#FF6A3D` | Punto del logo, detalles gráficos, iconos grandes |
| Acento (texto) | **Naranja oscuro** | `#B8401A` | Enlaces y texto de acento sobre fondo claro |
| Acento (fondo oscuro) | **Naranja claro** | `#FF8A5C` | Punto del logo y enlaces sobre índigo |
| Texto secundario | **Gris violáceo** | `#5A5775` | Subtítulos, etiquetas, metadatos |
| Borde | **Borde crema** | `#E2DED3` | Líneas divisorias y bordes de tarjetas |

Modo oscuro: fondo `#1F1B4D`, superficie `#2A2660`, texto `#F7F5F0`, texto secundario `#BDB9D6`, borde `#3A3680`, enlaces `#FF8A5C`.

### Contraste (WCAG)

| Combinación | Ratio | Veredicto |
|---|---|---|
| Índigo sobre crema | 14.6:1 | ✅ AAA, cualquier tamaño |
| Índigo sobre blanco | 15.9:1 | ✅ AAA |
| Gris violáceo sobre crema | 6.3:1 | ✅ AA |
| Naranja oscuro sobre crema | 5.1:1 | ✅ AA (úsalo para enlaces) |
| Naranja claro sobre índigo | 6.8:1 | ✅ AA |
| Crema sobre superficie oscura | 12.5:1 | ✅ AAA |
| Gris claro sobre índigo (oscuro) | 8.4:1 | ✅ AAA |
| **Naranja `#FF6A3D` sobre crema** | **2.6:1** | ❌ **No usar para texto**: solo decorativo |
| Blanco sobre naranja `#FF6A3D` | 2.8:1 | ❌ No usar texto blanco sobre botones naranjas |
| Índigo sobre naranja `#FF6A3D` | 5.6:1 | ✅ AA (si necesitas un botón naranja, usa texto índigo) |

### Proporción recomendada

Aproximadamente **70 % crema/blanco · 20 % índigo · 10 % naranja**. El naranja es un acento: un solo elemento destacado por pantalla (un botón principal, un subrayado, un punto), nunca fondos grandes.

---

## 4. Tipografía

- **Familia:** [Inter](https://fonts.google.com/specimen/Inter) (gratuita, Google Fonts). Los logos están dibujados con Inter Medium (500).
- **Pesos:** 400 (texto), 500 (etiquetas, menú), 600 (títulos).
- **Carga:**
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap">
  ```
  Para mejor rendimiento y privacidad, se puede alojar la fuente en el propio sitio (`font-display: swap`).

| Elemento | Tamaño | Peso | Interlineado | Tracking |
|---|---|---|---|---|
| H1 | `clamp(2.25rem, 5vw, 3.5rem)` | 600 | 1.1 | -0.02em |
| H2 | `clamp(1.75rem, 3.5vw, 2.5rem)` | 600 | 1.15 | -0.015em |
| H3 | `1.25rem` – `1.5rem` | 600 | 1.3 | -0.01em |
| Cuerpo | `1rem` (16 px) | 400 | 1.65 | 0 |
| Texto pequeño / etiquetas | `0.875rem` | 500 | 1.5 | 0.02em |
| Menú | `1rem` | 500 | 1 | 0 |

Longitud de línea del texto corrido: 60–75 caracteres (`max-width: 65ch`).

---

## 5. Tokens CSS

`tokens/tokens.css` ya incluye las variables y el modo oscuro automático (`prefers-color-scheme`). Úsalo así:

```css
@import "tokens.css";
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: var(--space-6); }
.btn  { background: var(--color-ink); color: var(--bg); border-radius: var(--radius-pill); padding: var(--space-3) var(--space-6); font-weight: 500; }
```

Si el proyecto usa **Tailwind**, mapea los mismos valores en `theme.extend`:

```js
colors: { ink: "#1F1B4D", accent: "#FF6A3D", "accent-text": "#B8401A", cream: "#F7F5F0", muted: "#5A5775", border: "#E2DED3" },
fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
borderRadius: { md: "14px", lg: "24px" },
```

### Forma y estilo de componentes

- Radios generosos y redondeados (14 px en tarjetas, píldora en botones), en línea con los extremos redondeados de la J.
- Bordes finos (`1px`) en lugar de sombras. Si hace falta profundidad: una sola sombra suave, nunca varias.
- Sin degradados ni efectos de brillo; el estilo es plano y limpio.
- Botón primario: fondo índigo, texto crema. Botón secundario: borde índigo, sin relleno. El naranja no se usa de fondo de botón con texto blanco.

---

## 6. Recomendaciones para la web del portafolio

### Estructura sugerida (una sola página o secciones separadas)

1. **Hero:** nombre, una línea sobre lo que haces y un botón principal ("Ver proyectos" o "Contacto").
2. **Proyectos:** tarjetas con imagen, título, tecnologías y enlace; 3–6 proyectos bien elegidos pesan más que muchos.
3. **Sobre mí:** foto, un párrafo corto y habilidades.
4. **Contacto:** correo directo, LinkedIn/GitHub y, opcionalmente, un formulario sencillo.

### Logo en la cabecera

- Escritorio: `imagotipo-horizontal` a 40–48 px de alto. Móvil (< 720 px): `isotipo` a 36 px. El archivo `examples/starter.html` ya hace este cambio con CSS.
- Alterna a las versiones `-light` en modo oscuro con `<picture>` y `<source media="(prefers-color-scheme: dark)">`.
- El logo enlaza a la página de inicio (`href="/"`) y lleva `alt="Juan Esteban Arenill Buendia"` (o `aria-label` en el enlace).
- Para animar o recolorear el isotipo desde CSS, usa `isotipo-currentcolor.svg` **en línea** (pega el código en el HTML) y define `color:` en el contenedor.

### Rendimiento

- Usa los SVG para los logos: pesan pocos KB y se ven nítidos en cualquier pantalla. Los PNG son solo para redes y documentos.
- Imágenes de proyectos en WebP o AVIF, con `width`/`height` definidos y `loading="lazy"` fuera de la primera pantalla.
- Carga solo los pesos de Inter que uses (400, 500, 600) y `font-display: swap`.
- Objetivo: LCP < 2,5 s y CLS cercano a 0.

### Accesibilidad

- Respeta los contrastes de la tabla (no uses `#FF6A3D` para texto).
- Estado de foco visible (ya definido en `tokens.css`) y navegación completa con teclado.
- Un solo `<h1>` por página; jerarquía de títulos sin saltos.
- Texto alternativo descriptivo en imágenes de proyectos; `prefers-reduced-motion` para desactivar animaciones.
- Áreas táctiles de al menos 44 × 44 px.

### SEO y compartir

- `<title>` único, `meta description` de 140–160 caracteres y `lang="es"`.
- Open Graph y Twitter Card con `web/og-image.png` (ya incluido en `starter.html`; cambia el dominio por el real, la URL debe ser absoluta).
- `theme-color` = `#1F1B4D`. Publica `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` y `site.webmanifest` en la **raíz** del sitio.
- Añade datos estructurados `Person` (JSON-LD) con nombre, URL y perfiles sociales.

### Copiar los archivos al proyecto

```
web/*                        → raíz pública del sitio (/favicon.svg, /og-image.png, ...)
logos/svg/*                  → /assets/logos/ (o la carpeta de assets del proyecto)
tokens/tokens.css            → /styles/tokens.css
```

Actualiza las rutas en `starter.html` según la estructura real del proyecto.

---

## Reglas para el agente (resumen)

1. Usar siempre los SVG de `logos/svg/`; nunca redibujar, recolorear ni reescribir con texto el logo.
2. Cabecera: `imagotipo-horizontal` en escritorio, `isotipo` en móvil; versiones `-light` en modo oscuro.
3. Respetar tamaños mínimos y el espacio libre (diámetro del punto naranja).
4. Colores solo de la paleta; naranja `#FF6A3D` solo decorativo, nunca para texto. Enlaces: `#B8401A` en claro, `#FF8A5C` en oscuro.
5. Tipografía Inter (400/500/600) y la escala de la sección 4.
6. Importar `tokens/tokens.css` y usar sus variables en lugar de valores sueltos.
7. Colocar los archivos de `web/` en la raíz pública y cambiar `TU-DOMINIO.com` por el dominio real.
8. Incluir `alt` en el logo, un solo `<h1>`, foco visible y modo oscuro.
9. Los textos entre corchetes (`[TU TITULAR]`, `[DESCRIPCIÓN…]`) son marcadores: pedirlos al dueño, no inventarlos.

---

## Notas técnicas

- El texto de los logos (Inter Medium) está **convertido a curvas**, así que los SVG y PNG se ven igual sin tener la fuente instalada. Para cambiar el nombre o la tipografía hay que regenerar los logos; no basta con editar el texto.
- El espaciado entre letras de los logos se calculó sin kerning (pares de letras ajustados), por lo que puede diferir ligeramente de Inter renderizada en el navegador.
- El nombre completo está dividido en dos líneas ("Juan Esteban" / "Arenill Buendia"). Si en el futuro se prefiere una versión corta (por ejemplo "Juan Arenill"), se puede generar sin cambiar el isotipo.
