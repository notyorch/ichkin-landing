# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dos audiencias que suelen evaluar el sitio juntas o por turnos: el dueño o director de una pyme que decide si contrata una consultoría, y el responsable de TI u operaciones que revisa si ichkin puede integrar, automatizar y ordenar los datos de sistemas que ya existen. Llegan con una operación repartida entre archivos sueltos, chats, memoria y herramientas que no se hablan entre sí.

## Product Purpose

ichkin es una consultoría tecnológica que conecta los sistemas, datos y herramientas que un equipo ya usa para que su operación deje de perder contexto entre pasos. El landing existe para que el visitante solicite un diagnóstico: una conversación inicial para entender el problema, identificar relaciones y decidir el siguiente paso útil. El éxito es una solicitud de diagnóstico de alguien con un problema real.

## Positioning

Hablas directamente con quien construye la solución. No es una consultora grande con cuentas comerciales de por medio. A eso se suma el método: primero el mapa de la operación, después la herramienta, y a veces la respuesta es no construir nada.

## Operating Context

Se contrata por servicios de consultoría y diagnóstico previo, no por producto de catálogo. Base en Mérida, Campeche (dato tomado del sistema de diseño; confirmar antes de publicarlo).

## Capabilities and Constraints

- Seis áreas de capacidad: Web (websites, interfaces, portfolios), Sistemas (ERP, CRM, CMS, ITSM, BPM), Datos (ETL, data warehouse, analytics), Inteligencia (RAG, agentes de IA, capacitación), Automatización (webhooks, serverless, workflows), Colaboración (Nextcloud, Mattermost, Plane, Penpot).
- Stack existente: Astro 7, Tailwind 4, Bricolage Grotesque e Inter. Sitio estático de una página.
- El formulario de diagnóstico es solo esqueleto visual: aún no envía ni almacena información y no hay canal de contacto. Debe seguir diciéndolo hasta que exista (hay una prueba que lo exige).
- Por decidir: canal de contacto (correo, formulario con backend u otro), dominio y despliegue.

## Brand Commitments

- Nombre siempre "ichkin", en minúsculas, incluso al inicio de una oración.
- Voz: tuteo, frases cortas, sin exclamaciones; directo, técnico sin jerga, humano y sobrio. Evita "transformación digital", "innovación tecnológica", "soluciones integrales", "potenciamos tu negocio", "sinergia", "disruptivo". Usa "sistema, datos, despliegue, equipo, claro, seguro, funcionando".
- Existe un sistema de diseño ichkin publicado como artefacto (https://claude.ai/artifact/SzPhzSGXNTCMtvvTdFJDn2) con tokens, logo y reglas de uso. Es vinculante para la identidad: wordmark oficial (nunca junto al monograma `ik`), paleta, tipografía y accesibilidad ahí definidas. La órbita está retirada como logo y solo sirve como motivo de diagrama.

## Evidence on Hand

Ninguna prueba social hoy: sin clientes, casos de éxito, testimonios, cifras ni logos de terceros. El sitio no debe inventarlos; se apoya en el método, las capacidades y la cercanía de trato. Activos reales: wordmark e ícono ik en `public/`, y copy de servicios en `src/pages/index.astro`.

## Product Principles

1. Entender antes de construir: el diagnóstico antecede a cualquier plataforma, automatización o IA.
2. Cercanía verificable: la persona que habla contigo es la que construye.
3. Claridad sobre promesa: se dice qué se hace y cómo, sin inflar ni inventar pruebas.
4. Lo que existe se conecta antes de reemplazarse: se parte de los sistemas y herramientas que el equipo ya usa.

## Accessibility & Inclusion

Sitio en español. El sistema de diseño exige contraste de 4.5:1 en texto (3:1 en texto grande, bordes de controles y foco), foco visible y respeto a `prefers-reduced-motion`.
