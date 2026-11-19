# AGENTS.md

Guía para agentes (y personas) que trabajen en este repo. El **qué y para quién** está en [PRODUCT.md](PRODUCT.md); aquí va el **cómo**.

## Qué es

Sitio de **ichkin**, una consultoría tecnológica de una sola persona: implementa y conecta herramientas **de código abierto** (ERP, CRM, procesos, Nextcloud, etc.) y desarrolla a medida solo cuando hace falta. Audiencia: dueños y responsables de TI de pymes. Idioma del sitio: **español, tuteo**.

Páginas: Inicio (`/`), Servicios (`/servicios/`), Nosotros (`/nosotros/`), Aviso de privacidad (`/aviso-de-privacidad/`).

## Comandos

```powershell
npm run dev      # servidor en http://127.0.0.1:4321 (también: .claude/launch.json, nombre "dev")
npm run build    # sitio estático en dist/
npm test         # node --test tests/landing.test.mjs
```

Stack: Astro 7, Tailwind 4 (tokens en `src/styles/global.css`), Three.js + GSAP (solo en la sección 3D), sin framework de UI.

## Estructura

- `src/pages/` — las cuatro páginas. `index.astro` concentra inicio, sección 3D y formulario.
- `src/components/` — `Header.astro` (menú con versión móvil) y `Footer.astro` (logo grande, enlaces, aviso).
- `src/data/services.js` — **fuente única** de las seis áreas (`services`), las opciones del formulario (`needs`) y los pasos del método (`steps`). Inicio, Servicios, Nosotros y el formulario leen de aquí.
- `src/scripts/scene/` — escenas 3D: `kit.js` (materiales, personas, pantallas), una maqueta por área (`web.js`, `sistemas.js`, `datos.js`, `inteligencia.js`, `automatizacion.js`, `colaboracion.js`), `ui.js` (narración, pasos, navegación) e `index.js` (motor y scroll).
- `public/brand/` y `public/favicon.svg` — logos oficiales. `src/assets/fonts/` — Inter.

## Sistema de diseño (vinculante)

Viene del artefacto "ichkin" (tokens, logo, reglas). Resumen operativo:

- **Escrito siempre "ichkin"**, en minúscula, aun al inicio de frase o titular.
- Superficie `marfil`, tinta `carbon`; `petroleo` solo para datos, diagramas y enlaces; **cobre = un solo detalle** (punto del botón primario, punto del wordmark). Nunca rellenos de cobre.
- Titulares: Bricolage Grotesque 600, interletraje −2 %, minúscula de oración. Texto: Inter. Un solo `display` por pantalla.
- Botones píldora: primario = tinta + punto cobre; secundario = borde fino. **Sin sombras**; separa con filetes de 1 px.
- Wordmark o monograma, **nunca ambos** en la misma pieza. La órbita está **retirada** (no usarla ni como adorno).
- Contraste 4.5:1; foco visible; respeta `prefers-reduced-motion`.
- Voz: directa, sobria, sin exclamaciones. Evitar: "transformación digital", "soluciones integrales", "sinergia", "disruptivo".

## Decisiones de contenido que no hay que deshacer

- **Posicionamiento:** ichkin **no** es una plataforma ni un software propio de marca; implementa herramientas abiertas. No escribir "un sistema que organiza" ni invitar a pedidos de desarrollo desde cero. Lo a medida es la excepción.
- **Sin pruebas inventadas:** no hay clientes, casos, cifras, testimonios, años de experiencia ni fotos del equipo. Hay una prueba que lo vigila.
- **Sin promesas sin confirmar:** no se publica plazo de respuesta, NDA ni "marca registrada" (la marca aún no está registrada en el IMPI). No usar "®".
- Lenguaje de negocio en las opciones del formulario; el término técnico va entre paréntesis.

## Formulario de contacto

En `index.astro`. Campos: `area`, `need`, `message`, `name`, `email`, `phone` y el señuelo `website` (debe llegar vacío). Solo se exige nombre, correo **o** WhatsApp (basta uno) y el área; la descripción es obligatoria con "Otro" o "Aún no lo sé".

Se conecta poniendo la URL en `data-endpoint` del `<form>` (previsto: Worker de Cloudflare → Frappe CRM, con Turnstile). **Mientras esté vacío no finge éxito:** avisa que aún no recibe mensajes. Al conectarlo hay que actualizar el aviso de privacidad (hoy dice que no se recopilan datos) y que lo revise un abogado.

## Sección 3D de capacidades

Pantalla completa y fija: una habitación a la vez, narración por pasos que avanza con el scroll, degradado entre habitaciones, puntos de navegación y botón "Saltar". Notas:

- Se carga bajo demanda (`import()` cuando la sección está por aparecer). Estados en `data-state` de la sección: `idle` (lista normal), `ready` (3D activo), `fallback` (sin WebGL o con error: lista legible).
- Los pasos de cada área (`beats` en `services.js`) están **sincronizados con los umbrales de la escena** (`update(t, p)` de cada maqueta). Si cambias uno, revisa el otro.
- Calidad adaptativa y densidad de píxeles limitada en táctil (1,5). El panel de vista previa renderiza por software (~2 fps): sirve para ver la composición, **no** para medir fluidez; eso se prueba en un teléfono real.

## Pruebas

`tests/landing.test.mjs` lee el **código fuente** (no renderiza). Comprueba, entre otras cosas, las seis áreas, el formulario, el posicionamiento, el menú y la transición entre páginas. Al mover texto entre archivos, ajusta la prueba que lo lee.

## Trampas conocidas

- Windows con Smart App Control activado bloquea el binario nativo de Astro: desactívalo o usa WSL.
- Si el servidor de desarrollo devuelve 500 tras crear un archivo importado, haz `touch` del archivo que lo importa (módulo en caché).
- Al editar archivos con salto de línea CRLF, las sustituciones multilínea con scripts pueden fallar en silencio; verifica con `npm test`.
- Las transiciones entre páginas son nativas (`@view-transition`): no animan en Firefox, y es correcto.

## Pendiente (decisiones del dueño)

Dominio y despliegue (previsto: Cloudflare Pages gratis); correo/WhatsApp de contacto visible; responsable y domicilio en el aviso de privacidad; plazo real de respuesta; NDA y revisión legal; registro de marca; vista previa para compartir (`og:`), `noindex` hasta el lanzamiento.
