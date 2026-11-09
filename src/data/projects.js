import consultaMain from '../assets/proyectsImage/proyects/Consulta GPT Excel/main.png';
import consulta1 from '../assets/proyectsImage/proyects/Consulta GPT Excel/1.png';
import consulta2 from '../assets/proyectsImage/proyects/Consulta GPT Excel/2.png';
import consulta3 from '../assets/proyectsImage/proyects/Consulta GPT Excel/31.png';

import informesMain from '../assets/proyectsImage/proyects/Creacion Informes GPT/main.png';
import informes1 from '../assets/proyectsImage/proyects/Creacion Informes GPT/1.png';
import informes2 from '../assets/proyectsImage/proyects/Creacion Informes GPT/2.png';
import informes3 from '../assets/proyectsImage/proyects/Creacion Informes GPT/3.png';

import apuestasMain from '../assets/proyectsImage/proyects/App Apuestas Mobile/main.png';
import apuestasMobile from '../assets/proyectsImage/proyects/App Apuestas Mobile/mobile.png';
import apuestasUser from '../assets/proyectsImage/proyects/App Apuestas Mobile/user.png';
import apuestasLoterias from '../assets/proyectsImage/proyects/App Apuestas Mobile/loterias.png';
import apuestasRecargas from '../assets/proyectsImage/proyects/App Apuestas Mobile/recargas.png';

import goalMain from '../assets/proyectsImage/proyects/App Goalkeeper Mobile/main.png';
import goalHome from '../assets/proyectsImage/proyects/App Goalkeeper Mobile/home.png';
import goalRoles from '../assets/proyectsImage/proyects/App Goalkeeper Mobile/roles.mp4';
import goalPartidos from '../assets/proyectsImage/proyects/App Goalkeeper Mobile/seguimiento_partidos.mp4';
import goalRendimiento from '../assets/proyectsImage/proyects/App Goalkeeper Mobile/rendimiento.mp4';
import goalAsistencias from '../assets/proyectsImage/proyects/App Goalkeeper Mobile/asistencias.mp4';
import goalDemo from '../assets/proyectsImage/proyects/App Goalkeeper Mobile/guia.mp4';

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
    cover: consultaMain,
    accent: 'ink',
    chapters: [
      {
        layout: 'text-left',
        title: 'El problema',
        body: 'Consultar parámetros en documentos específicos era lento y manual. Había que abrir PDF tras PDF para encontrar lo mismo una y otra vez.',
        media: { type: 'image', src: consulta1 },
      },
      {
        layout: 'text-right',
        title: 'La interacción',
        body: 'La app concentra la carga del documento y la consulta en una sola interfaz. El usuario pregunta; GPT responde sobre el contenido.',
        media: { type: 'image', src: consulta2 },
      },
      {
        layout: 'text-left',
        title: 'Stack del monolito',
        body: 'Python + CustomTkinter para la UI de escritorio, con integración a la API de OpenAI para extracción y respuesta sobre PDFs.',
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
    cover: informesMain,
    accent: 'accent',
    chapters: [
      {
        layout: 'text-left',
        title: 'De datos a informe',
        body: 'El sistema toma datos de Excel y construye informes técnicos con estilo académico, pensados para responsabilidad extendida del productor (REP).',
        media: { type: 'image', src: informesMain },
      },
      {
        layout: 'text-right',
        title: 'Extracción inteligente',
        body: 'Un pipeline en Python limpia y estructura la información antes de pedirle a OpenAI que redacte y organice el contenido.',
        media: { type: 'image', src: informes1 },
      },
      {
        layout: 'text-left',
        title: 'Construcción del documento',
        body: 'La interfaz con CustomTkinter orquesta carga, procesamiento y salida en Markdown/APA listo para revisar.',
        media: { type: 'image', src: informes2 },
      },
      {
        layout: 'text-right',
        title: 'Resultado final',
        body: 'El entregable reduce horas de redacción manual y deja un informe coherente, trazable y listo para auditoría.',
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
      'App Flutter para operar loterías, recargas y usuarios con backend en Python/Supabase: control rápido desde el celular.',
    role: 'fullstack',
    type: 'personal',
    stack: ['Flutter', 'Python', 'Supabase'],
    cover: apuestasMain,
    accent: 'accent',
    chapters: [
      {
        layout: 'text-left',
        title: 'Operar desde el bolsillo',
        body: 'Una experiencia móvil pensada para velocidad: ver operaciones, usuarios y movimientos sin fricción.',
        media: { type: 'image', src: apuestasMobile },
      },
      {
        layout: 'text-right',
        title: 'Usuarios',
        body: 'Gestión de perfiles y acceso para mantener el flujo de negocio ordenado desde la app.',
        media: { type: 'image', src: apuestasUser },
      },
      {
        layout: 'text-left',
        title: 'Loterías',
        body: 'Módulo dedicado a productos de lotería con una UI clara para consulta y operación.',
        media: { type: 'image', src: apuestasLoterias },
      },
      {
        layout: 'text-right',
        title: 'Recargas',
        body: 'Recargas con feedback inmediato. Stack Flutter + Python + Supabase para sincronizar estado en tiempo real.',
        media: { type: 'image', src: apuestasRecargas },
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
    cover: goalMain,
    accent: 'ink',
    demoVideo: goalDemo,
    chapters: [
      {
        layout: 'text-left',
        title: 'El Uno Academy',
        body: 'Aplicación para academias de arqueros: el entrenador administra, el jugador ve su progreso. Todo desde el celular.',
        media: { type: 'image', src: goalHome },
      },
      {
        layout: 'feature-switcher',
        title: 'Funcionalidades que transforman el entrenamiento',
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
    ],
    links: {},
    legacyPath: '/appGoalkeepersFlutter',
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
