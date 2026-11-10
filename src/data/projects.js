import consultaCover from '../assets/proyectsImage/proyects/Consulta GPT Excel/Portada.jpg';
import consultaMain from '../assets/proyectsImage/proyects/Consulta GPT Excel/main.png';
import consulta1 from '../assets/proyectsImage/proyects/Consulta GPT Excel/1.png';
import consulta2 from '../assets/proyectsImage/proyects/Consulta GPT Excel/2.png';
import consulta3 from '../assets/proyectsImage/proyects/Consulta GPT Excel/31.png';

import informesCover from '../assets/proyectsImage/proyects/Creacion Informes GPT/Portada.jpg';
import informesMain from '../assets/proyectsImage/proyects/Creacion Informes GPT/main.png';
import informes1 from '../assets/proyectsImage/proyects/Creacion Informes GPT/1.png';
import informes2 from '../assets/proyectsImage/proyects/Creacion Informes GPT/2.png';
import informes3 from '../assets/proyectsImage/proyects/Creacion Informes GPT/3.png';

import apuestasCover from '../assets/proyectsImage/proyects/App Apuestas Mobile/Portada.jpg';
import apuestasMain from '../assets/proyectsImage/proyects/App Apuestas Mobile/main-new.png';
import apuestasProfile from '../assets/proyectsImage/proyects/App Apuestas Mobile/profile-censored.png';
import apuestasWebMockup from '../assets/proyectsImage/proyects/App Apuestas Mobile/web-home-censored.webp';
import apuestasStoreHome from '../assets/proyectsImage/proyects/App Apuestas Mobile/store-home-censored.jpg';
import apuestasStorePlay from '../assets/proyectsImage/proyects/App Apuestas Mobile/store-play-censored.jpg';
import apuestasStoreCart from '../assets/proyectsImage/proyects/App Apuestas Mobile/store-cart-censored.jpg';

import goalCover from '../assets/proyectsImage/proyects/App Goalkeeper Mobile/Portada.jpg';
import goalMain from '../assets/proyectsImage/proyects/App Goalkeeper Mobile/main.png';
import goalHome from '../assets/proyectsImage/proyects/App Goalkeeper Mobile/home.png';
import goalRoles from '../assets/proyectsImage/proyects/App Goalkeeper Mobile/roles.mp4';
import goalPartidos from '../assets/proyectsImage/proyects/App Goalkeeper Mobile/seguimiento_partidos.mp4';
import goalRendimiento from '../assets/proyectsImage/proyects/App Goalkeeper Mobile/rendimiento.mp4';
import goalAsistencias from '../assets/proyectsImage/proyects/App Goalkeeper Mobile/asistencias.mp4';
import goalDemo from '../assets/proyectsImage/proyects/App Goalkeeper Mobile/guia.mp4';

import rifadasCover from '../assets/proyectsImage/proyects/Rifadas/Portada.jpg';
import rifadasMain from '../assets/proyectsImage/proyects/Rifadas/main.png';
import rifadasGaleria from '../assets/proyectsImage/proyects/Rifadas/galeria.png';
import rifadasAfiche from '../assets/proyectsImage/proyects/Rifadas/afiche.png';
import rifadasEstudio from '../assets/proyectsImage/proyects/Rifadas/estudio.png';
import rifadasPanel from '../assets/proyectsImage/proyects/Rifadas/panel.png';
import rifadasTarifas from '../assets/proyectsImage/proyects/Rifadas/tarifas.png';

export const projects = [
  {
    id: 'consulta-gpt-excel',
    slug: 'consulta-gpt-excel',
    title: 'Consulta GPT Excel',
    summary:
      'Automatiza la consulta de parámetros en PDFs con GPT: cargas el documento, preguntas y obtienes la respuesta sin abrir archivo por archivo.',
    role: 'fullstack',
    type: 'personal',
    stack: ['Python', 'CustomTkinter', 'OpenAI'],
    cover: consultaCover,
    accent: 'ink',
    theme: {
      personality: ['technical', 'precise', 'calm'],
      colors: {
        page: '#12141a',
        ink: '#0a0c10',
        accent: '#3DDC97',
        accent2: '#1a3d2e',
        paper: '#eef1f4',
        card: '#e4e8ec',
        text: '#f2f5f7',
        muted: '#9aa3ad',
      },
      fonts: {
        display: 'IBM Plex Sans',
        body: 'IBM Plex Sans',
        mono: 'IBM Plex Mono',
      },
      shape: 'sharp',
      motif: 'scanlines',
      heroLayout: 'media-right',
      motion: { feel: 'expo', rotateDeg: 0 },
      nav: 'dark',
    },
    chapters: [
      {
        layout: 'text-left',
        title: 'El problema',
        body: 'Consultar parámetros en documentos específicos era lento y manual. Había que abrir PDF tras PDF para encontrar lo mismo una y otra vez.',
        media: { type: 'image', src: consulta1 },
      },
      {
        layout: 'text-right',
        title: 'Para quién',
        body: 'Pensado para analistas y operaciones que cruzan PDFs técnicos a diario: necesitan respuestas puntuales sin perder tiempo en búsquedas manuales.',
        media: { type: 'image', src: consulta2 },
      },
      {
        layout: 'text-left',
        title: 'La solución',
        body: 'Una app de escritorio monolítica: cargas el PDF, formulas la pregunta y GPT responde sobre el contenido en la misma interfaz.',
        media: { type: 'image', src: consultaMain },
      },
      {
        layout: 'text-right',
        title: 'Cómo se usa',
        body: 'Flujo directo: seleccionar documento, escribir la consulta y revisar la respuesta. Sin salir de la app ni abrir el PDF página por página.',
        media: { type: 'image', src: consulta2 },
      },
      {
        layout: 'text-left',
        title: 'Stack y detalles técnicos',
        body: 'Python + CustomTkinter para la UI de escritorio e integración con la API de OpenAI para extracción y respuesta sobre PDFs. Rol fullstack en un solo binario de escritorio.',
        media: { type: 'image', src: consulta3 },
      },
    ],
    links: {},
    legacyPath: '/consultaGptExcel',
  },
  {
    id: 'creacion-informes-gpt',
    slug: 'creacion-informes-gpt',
    title: 'Creación Informes GPT',
    summary:
      'De Excel crudo a informes técnicos en formato APA: extracción, análisis con IA y documento listo para auditoría.',
    role: 'backend',
    type: 'personal',
    stack: ['Python', 'CustomTkinter', 'OpenAI'],
    cover: informesCover,
    accent: 'accent',
    theme: {
      personality: ['academic', 'serious', 'clear'],
      colors: {
        page: '#0c1b2a',
        ink: '#08131e',
        accent: '#7eb0d5',
        accent2: '#2a4a66',
        paper: '#f4f1ea',
        card: '#ebe6dc',
        text: '#f2f4f6',
        muted: '#9aabb8',
      },
      fonts: {
        display: 'Source Serif 4',
        body: 'Source Sans 3',
      },
      shape: 'soft',
      motif: 'rules',
      heroLayout: 'media-left',
      motion: { feel: 'expo', rotateDeg: 3 },
      nav: 'dark',
    },
    chapters: [
      {
        layout: 'text-left',
        title: 'El problema',
        body: 'Pasar de Excel crudo a un informe técnico en estilo APA consumía horas de limpieza, redacción y formato, con riesgo de inconsistencias en auditoría.',
        media: { type: 'image', src: informes1 },
      },
      {
        layout: 'text-right',
        title: 'Para quién',
        body: 'Equipos de responsabilidad extendida del productor (REP) y revisión técnica que necesitan informes trazables, coherentes y listos para entregar.',
        media: { type: 'image', src: informesMain },
      },
      {
        layout: 'text-left',
        title: 'La solución',
        body: 'Software de escritorio que orquesta extracción, análisis con IA y salida en Markdown/APA: del archivo de datos al documento revisable.',
        media: { type: 'image', src: informes2 },
      },
      {
        layout: 'text-right',
        title: 'Cómo se usa',
        body: 'Se carga el Excel, el pipeline limpia y estructura datos, OpenAI redacta y organiza el contenido, y la UI entrega el informe listo para revisar.',
        media: { type: 'image', src: informes3 },
      },
      {
        layout: 'text-left',
        title: 'Stack y detalles técnicos',
        body: 'Python para el pipeline de datos, CustomTkinter para la orquestación en escritorio y OpenAI para redacción. Enfoque backend en extracción, estructura y generación del entregable.',
        media: { type: 'image', src: informes3 },
      },
    ],
    links: {},
    legacyPath: '/creacionInformesGpt',
  },
  {
    id: 'app-apuestas',
    slug: 'app-apuestas',
    title: 'App de Apuestas',
    summary:
      'Plataforma web + app móvil de loterías en Colombia: jugar, canasta, historial, recargas y perfil. Frontend React y Flutter; la app está publicada en App Store.',
    role: 'frontend',
    type: 'work',
    stack: ['React', 'Flutter'],
    cover: apuestasCover,
    accent: 'accent',
    theme: {
      personality: ['premium', 'fast', 'bold'],
      colors: {
        page: '#0f1c2e',
        ink: '#0a1420',
        accent: '#c4a035',
        accent2: '#5c4a18',
        paper: '#ffffff',
        card: '#f3f4f6',
        text: '#f7f7f5',
        muted: '#a8b0bc',
      },
      fonts: {
        display: 'Outfit',
        body: 'Outfit',
      },
      shape: 'soft',
      motif: 'rings',
      heroLayout: 'media-right',
      motion: { feel: 'spring', rotateDeg: 5 },
      nav: 'dark',
    },
    chapters: [
      {
        layout: 'text-left',
        title: 'El problema',
        body: 'Jugar loterías desde el celular o el navegador exigía una experiencia clara: catálogo, jugada, pago y seguimiento sin fricción. El front debía sentirse rápido en web y nativo en iOS.',
        media: { type: 'image', src: apuestasStoreHome },
      },
      {
        layout: 'text-right',
        title: 'Para quién',
        body: 'Jugadores en Colombia que compran loterías online: necesitan catálogo, carrito, saldo y resultados desde la web o la app, con flujos familiares y rápidos.',
        media: { type: 'image', src: apuestasWebMockup },
      },
      {
        layout: 'text-left',
        title: 'La solución',
        body: 'Un solo producto en dos superficies: web React (landing, apuestas, carrito, resultados, perfil) y app Flutter con paridad de flujos, publicada en App Store.',
        media: { type: 'image', src: apuestasMain },
      },
      {
        layout: 'feature-switcher',
        title: 'Cómo se usa',
        body: 'Toca cada módulo: inicio, jugada, canasta y cuenta. Capturas de la UI actual publicada en App Store.',
        features: [
          {
            title: 'Inicio y loterías',
            description:
              'Home con banners, toggle loterías/resultados y cards de sorteos listos para jugar.',
            media: { type: 'image', src: apuestasStoreHome },
            duration: 8000,
          },
          {
            title: 'Jugar',
            description:
              'Número, series, fracciones y “Dame Suerte”: el flujo de apuesta en pocos toques.',
            media: { type: 'image', src: apuestasStorePlay },
            duration: 8000,
          },
          {
            title: 'Canasta y recarga',
            description:
              'Saldo, recargar y revisar jugadas antes de comprar. La canasta cierra el ciclo de compra.',
            media: { type: 'image', src: apuestasStoreCart },
            duration: 8000,
          },
          {
            title: 'Perfil y wallet',
            description:
              'Saldo, recargas, retiro, datos y seguridad en la UI actual de cuenta.',
            media: { type: 'image', src: apuestasProfile },
            duration: 8000,
          },
        ],
      },
      {
        layout: 'text-left',
        title: 'Stack y detalles técnicos',
        body: 'Flutter con BLoC y go_router publicado en App Store Connect. Web React con Context y Motion en Vercel. Rol frontend de punta a punta: UI, flujos y release iOS.',
        media: { type: 'image', src: apuestasStorePlay },
      },
    ],
    links: {},
    legacyPath: '/appApuestasFlutter',
  },
  {
    id: 'app-goalkeepers',
    slug: 'app-goalkeepers',
    title: 'App Goalkeepers',
    summary:
      'El Uno Academy: app Flutter para que entrenadores lleven el desempeño de arqueros — roles, partidos, rendimiento y asistencias.',
    role: 'fullstack',
    type: 'personal',
    stack: ['Flutter', 'Firebase'],
    cover: goalCover,
    accent: 'ink',
    theme: {
      personality: ['sporty', 'energetic', 'academy'],
      colors: {
        page: '#0d2818',
        ink: '#071a10',
        accent: '#b8f25a',
        accent2: '#3d6b28',
        paper: '#ffffff',
        card: '#eef5ea',
        text: '#f4faf2',
        muted: '#9cb39a',
      },
      fonts: {
        display: 'Space Grotesk',
        body: 'Space Grotesk',
      },
      shape: 'cut',
      motif: 'pitch',
      heroLayout: 'media-left',
      motion: { feel: 'spring', rotateDeg: 5 },
      nav: 'dark',
    },
    demoVideo: goalDemo,
    chapters: [
      {
        layout: 'text-left',
        title: 'El problema',
        body: 'Seguir el progreso de arqueros en una academia solía vivir en notas sueltas y conversaciones: sin un lugar claro para roles, partidos, rendimiento y asistencias.',
        media: { type: 'image', src: goalHome },
      },
      {
        layout: 'text-right',
        title: 'Para quién',
        body: 'Entrenadores que administran la academia y jugadores que quieren ver su progreso. Ambos roles, desde el celular.',
        media: { type: 'image', src: goalHome },
      },
      {
        layout: 'text-left',
        title: 'La solución',
        body: 'App Flutter para El Uno Academy: el entrenador administra, el jugador consulta. Partidos, rendimiento y asistencias en un solo producto móvil.',
        media: { type: 'image', src: goalMain },
      },
      {
        layout: 'feature-switcher',
        title: 'Cómo se usa',
        body: 'Toca cada módulo para verlo en acción. El video cambia al instante.',
        features: [
          {
            title: 'Roles',
            description:
              'Funciones distintas según el rol: entrenador (admin) o jugador (player).',
            media: { type: 'video', src: goalRoles },
            duration: 39000,
          },
          {
            title: 'Seguimiento de partidos',
            description:
              'Evaluación de errores y aciertos por partido, con comentarios del entrenador.',
            media: { type: 'video', src: goalPartidos },
            duration: 30000,
          },
          {
            title: 'Rendimiento',
            description: 'Visualiza el rendimiento del jugador a lo largo de los partidos.',
            media: { type: 'video', src: goalRendimiento },
            duration: 22000,
          },
          {
            title: 'Asistencias',
            description:
              'Listado de asistencias y ausencias al entrenamiento, con motivo de cada falta.',
            media: { type: 'video', src: goalAsistencias },
            duration: 53000,
          },
        ],
      },
      {
        layout: 'text-left',
        title: 'Stack y detalles técnicos',
        body: 'Flutter en el cliente y Firebase para auth, datos y sincronización. Fullstack móvil: UI, roles y persistencia en la nube.',
        media: { type: 'image', src: goalHome },
      },
    ],
    links: {},
    legacyPath: '/appGoalkeepersFlutter',
  },
  {
    id: 'rifadas',
    slug: 'rifadas',
    title: 'Rifadas',
    summary:
      'Plataforma web en Colombia para que organizadores diseñen afiches, publiquen en galería y administren números e interesados; visitantes exploran, apartan y contactan por WhatsApp. Fullstack propio con Wompi, KYC y tiempo real.',
    role: 'fullstack',
    type: 'personal',
    stack: ['React', 'Django', 'PostgreSQL', 'AWS', 'Wompi'],
    cover: rifadasCover,
    accent: 'ink',
    theme: {
      personality: ['warm', 'commercial', 'playful'],
      colors: {
        page: '#1a1214',
        ink: '#120c0e',
        accent: '#ff5a5f',
        accent2: '#8a2e32',
        paper: '#faf7f2',
        card: '#f0ebe3',
        text: '#faf7f2',
        muted: '#b5a8a4',
      },
      fonts: {
        display: 'Fraunces',
        body: 'DM Sans',
      },
      shape: 'pill',
      motif: 'tickets',
      heroLayout: 'stacked',
      motion: { feel: 'spring', rotateDeg: 3 },
      nav: 'dark',
    },
    chapters: [
      {
        layout: 'text-left',
        title: 'El problema',
        body: 'Organizar un producto para rifar solía ser un caos de Canva, Excel y chats sueltos. Quien compra tampoco tenía un lugar claro para descubrir afiches, apartar números y hablar con el organizador.',
        media: { type: 'image', src: rifadasGaleria },
      },
      {
        layout: 'text-right',
        title: 'Para quién',
        body: 'Organizadores que diseñan, publican y administran rifas, y visitantes que descubren afiches, apartan números y contactan por WhatsApp sin fricción.',
        media: { type: 'image', src: rifadasEstudio },
      },
      {
        layout: 'text-left',
        title: 'La solución',
        body: 'Plataforma web punta a punta: estudio con canvas, galería pública, panel operativo, KYC y cobro de planes. El dinero del boleto sigue entre particulares.',
        media: { type: 'image', src: rifadasMain },
      },
      {
        layout: 'feature-switcher',
        title: 'Cómo se usa',
        body: 'Marketplace, apartado en vivo, panel operativo y billing. Cada módulo muestra una capa distinta del sistema.',
        features: [
          {
            title: 'Galería y descubrimiento',
            description:
              'Visitantes buscan y filtran afiches publicados: premio, lotería, cifras y disponibilidad, sin crear cuenta.',
            media: { type: 'image', src: rifadasGaleria },
            duration: 8000,
          },
          {
            title: 'Apartar números en vivo',
            description:
              'Grid de números con estado en tiempo real (WebSockets). El interesado selecciona y escribe al organizador por WhatsApp.',
            media: { type: 'image', src: rifadasAfiche },
            duration: 8000,
          },
          {
            title: 'Panel y control operativo',
            description:
              'Borradores, productos activos, métricas de boletas y gestión del ciclo de vida: publicar, archivar y verificar identidad.',
            media: { type: 'image', src: rifadasPanel },
            duration: 8000,
          },
          {
            title: 'Planes y cobro con Wompi',
            description:
              'Suscripciones, paquetes y publicaciones unitarias. Wompi cobra solo por usar la plataforma; el dinero del boleto sigue entre particulares.',
            media: { type: 'image', src: rifadasTarifas },
            duration: 8000,
          },
        ],
      },
      {
        layout: 'text-left',
        title: 'Stack y detalles técnicos',
        body: 'React en Vercel; Django + DRF + Channels en AWS (EC2, RDS PostgreSQL, S3, Redis). Auth JWT, KYC con liveness, webhooks Wompi y producción en rifadas.com.',
        media: { type: 'image', src: rifadasPanel },
      },
    ],
    links: { demo: 'https://www.rifadas.com' },
  },
];

export const allStacks = [...new Set(projects.flatMap((p) => p.stack))].sort();
export const allRoles = [...new Set(projects.map((p) => p.role))];
export const allTypes = [...new Set(projects.map((p) => p.type))];

export function getProjectBySlug(slug) {
  return projects.find((p) => p.slug === slug);
}

export function getProjectByLegacyPath(path) {
  return projects.find((p) => p.legacyPath === path);
}
