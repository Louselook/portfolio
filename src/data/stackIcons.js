import firebase from '../assets/iconTools/firebase.png';
import fastapi from '../assets/iconTools/fastapi.webp';

const STACK_ICONS = {
  Python: '/assets/studies/python.png',
  Flutter: '/assets/studies/flutter.png',
  React: '/assets/studies/react.png',
  Supabase: '/assets/studies/supabase.png',
  Firebase: firebase,
  FastAPI: fastapi,
  OpenAI: '/assets/icons/openai.png',
  CustomTkinter: '/assets/icons/customtkinter.png',
  Django: '/assets/studies/python.png',
};

export function getStackIcon(name) {
  return STACK_ICONS[name] || '/assets/studies/react.png';
}
