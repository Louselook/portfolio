import firebase from '../assets/iconTools/firebase.png';
import fastapi from '../assets/iconTools/fastapi.png';
import aws from '../assets/iconTools/aws.webp';
import django from '../assets/iconTools/django.svg';
import postgresql from '../assets/iconTools/postgresql.webp';
import wompi from '../assets/iconTools/wompi.png';

const STACK_ICONS = {
  Python: '/assets/studies/python.png',
  Flutter: '/assets/studies/flutter.png',
  React: '/assets/studies/react.png',
  Supabase: '/assets/studies/supabase.png',
  Firebase: firebase,
  FastAPI: fastapi,
  OpenAI: '/assets/icons/openai.png',
  CustomTkinter: '/assets/icons/customtkinter.png',
  Django: django,
  AWS: aws,
  PostgreSQL: postgresql,
  Wompi: wompi,
};

export function getStackIcon(name) {
  return STACK_ICONS[name] || '/assets/studies/react.png';
}
