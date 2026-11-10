import aws from '../assets/iconTools/aws.webp';
import django from '../assets/iconTools/django.svg';
import fastapi from '../assets/iconTools/fastapi.png';
import firebase from '../assets/iconTools/firebase.png';
import flutter from '../assets/iconTools/flutter.png';
import postgresql from '../assets/iconTools/postgresql.webp';
import python from '../assets/iconTools/python.webp';
import react from '../assets/iconTools/react.png';
import sqlserver from '../assets/iconTools/sqlserver.webp';
import supabase from '../assets/iconTools/supabase.png';
import wompi from '../assets/iconTools/wompi.png';

/** All tool icons that orbit the hero logo (must stay in sync with iconTools/). */
export const HERO_TOOLS = [
  'Python',
  'Flutter',
  'React',
  'Supabase',
  'Firebase',
  'FastAPI',
  'Django',
  'AWS',
  'PostgreSQL',
  'Wompi',
  'SQL Server',
];

const STACK_ICONS = {
  Python: python,
  Flutter: flutter,
  React: react,
  Supabase: supabase,
  Firebase: firebase,
  FastAPI: fastapi,
  OpenAI: '/assets/icons/openai.png',
  CustomTkinter: '/assets/icons/customtkinter.png',
  Django: django,
  AWS: aws,
  PostgreSQL: postgresql,
  Wompi: wompi,
  'SQL Server': sqlserver,
};

export function getStackIcon(name) {
  return STACK_ICONS[name] || react;
}
