// Datos compartidos del sitio: inicio, servicios y formulario leen de aquí.

export const services = [
  {
    key: 'Web', items: 'Websites · Interfaces · Portfolios',
    copy: 'Una presencia que explica tu valor, orienta decisiones y abre conversaciones útiles.',
    story: 'Alguien en una cafetería revisa tu portafolio y decide contratarte.',
    beats: [
      { at: 0, text: 'Alguien llega a una cafetería buscando a quién contratar.' },
      { at: 0.3, text: 'Revisa tu portafolio y entiende qué haces y cómo trabajas.' },
      { at: 0.56, text: 'Decide contratarte.' },
    ],
  },
  {
    key: 'Sistemas', items: 'ERP · CRM · CMS · ITSM · BPM',
    copy: 'ERP, CRM y procesos de código abierto, implementados y adaptados a tu operación para que dejen de vivir en archivos sueltos, chats y memoria.',
    story: 'Un equipo lleva la contabilidad en el mismo ERP, al mismo tiempo.',
    beats: [
      { at: 0, text: 'Cuatro personas, un mismo libro contable.' },
      { at: 0.3, text: 'Cada quien edita su parte y los demás la ven al instante.' },
      { at: 0.7, text: 'Un solo ERP: sin versiones sueltas por correo.' },
    ],
  },
  {
    key: 'Datos', items: 'ETL · Data warehouse · Analytics',
    copy: 'Información que llega completa, se entiende y se puede convertir en una decisión.',
    story: 'La dirección ve en un panel hacia dónde mover la empresa.',
    beats: [
      { at: 0, text: 'Los datos de toda la operación llegan a un mismo panel.' },
      { at: 0.3, text: 'Las barras y la tendencia explican qué está pasando.' },
      { at: 0.58, text: 'La dirección ve el rumbo sugerido y decide.' },
    ],
  },
  {
    key: 'Inteligencia', items: 'RAG · Agentes de IA · Capacitación',
    copy: 'IA construida alrededor de tu contexto, documentos y reglas de trabajo.',
    story: 'Un agente atiende al cliente y resuelve dudas del equipo.',
    beats: [
      { at: 0, text: 'Un cliente pregunta por su pedido.' },
      { at: 0.3, text: 'El agente responde con datos reales de tu sistema.' },
      { at: 0.52, text: 'Una persona del equipo consulta una política.' },
      { at: 0.74, text: 'El agente le entrega la respuesta y el documento.' },
    ],
  },
  {
    key: 'Automatización', items: 'Webhooks · Serverless · Workflows',
    copy: 'Conexiones que quitan pasos repetitivos sin volver opaco el proceso.',
    story: 'A las 7:00, el reporte de la semana llega solo al celular.',
    beats: [
      { at: 0, text: 'Es temprano y nadie ha tocado nada.' },
      { at: 0.12, text: 'Amanece y suena la alarma: son las 7:00.' },
      { at: 0.38, text: 'Tu ERP genera y envía el reporte de la semana.' },
      { at: 0.6, text: 'Llega al celular antes de levantarte.' },
    ],
  },
  {
    key: 'Colaboración', items: 'Nextcloud · Mattermost · Plane · Penpot',
    copy: 'Un espacio compartido para que las personas, el conocimiento y el avance sigan cerca.',
    story: 'Un equipo de diseño edita el mismo lienzo a la vez.',
    beats: [
      { at: 0, text: 'Un equipo de diseño abre el mismo lienzo.' },
      { at: 0.35, text: 'Cada cursor mueve sus piezas al mismo tiempo.' },
      { at: 0.7, text: 'La composición queda lista sin pasarse archivos.' },
    ],
  },
];

// Opciones preestablecidas del formulario. Cada valor viaja tal cual al CRM (area, need).
// El texto lleva primero lo que se entiende y, entre paréntesis, el término técnico.
export const needs = [
  { label: 'Web', prompt: '¿Qué tipo de web?', solves: 'Que te encuentren, entiendan lo que haces y te contacten.', options: ['Tienda en línea (ecommerce)', 'Sitio web', 'Portafolio', 'Otro'] },
  { label: 'Sistemas', prompt: '¿Qué sistema?', solves: 'Que tu operación deje de vivir en archivos sueltos, chats y memoria.', options: ['ERP (administración y contabilidad)', 'CRM (clientes y ventas)', 'CMS (contenidos)', 'Mesa de ayuda (ITSM)', 'Procesos (BPM)', 'Otro'] },
  { label: 'Datos', prompt: '¿Qué quieres lograr con tus datos?', solves: 'Ver con claridad cómo va tu negocio para decidir mejor.', options: ['Unir datos de varios sistemas (ETL)', 'Un almacén central de datos', 'Tableros para decidir', 'Otro'] },
  { label: 'Inteligencia', prompt: '¿Qué tipo de IA?', solves: 'Que un asistente atienda y responda con lo que tu equipo ya sabe.', options: ['Agente de IA que atienda', 'Responder dudas con tus documentos (RAG)', 'Capacitación en IA para tu equipo', 'Otro'] },
  { label: 'Automatización', prompt: '¿Qué quieres automatizar?', solves: 'Quitarte tareas repetitivas y pasos manuales.', options: ['Conectar tus herramientas', 'Flujos de trabajo', 'Tareas programadas (serverless)', 'Otro'] },
  { label: 'Colaboración', prompt: '¿Qué herramienta?', solves: 'Que tu equipo trabaje junto sin perder contexto.', options: ['Nextcloud (archivos)', 'Mattermost (chat)', 'Plane (proyectos)', 'Penpot (diseño)', 'Otro'] },
  { label: 'Aún no lo sé', prompt: '', options: [] },
];

export const steps = [
  ['Escuchar el contexto', 'Personas, procesos, información y restricciones que ya están en juego.'],
  ['Trazar las conexiones', 'Qué se debe integrar, qué se debe simplificar y qué no hace falta construir.'],
  ['Definir el siguiente paso', 'Una decisión concreta que puedas evaluar antes de comprometer más recursos.'],
];
