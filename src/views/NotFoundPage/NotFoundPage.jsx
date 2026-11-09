import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="section">
      <div className="container" style={{ textAlign: 'center', display: 'grid', gap: '1rem' }}>
        <span className="eyebrow">404</span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Página no encontrada</h1>
        <p style={{ color: 'var(--muted)', maxWidth: '32rem', marginInline: 'auto' }}>
          Esa ruta no existe en el portfolio. Vuelve al inicio o explora los proyectos.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" to="/">
            Ir al inicio
          </Link>
          <Link className="btn btn-ghost" to="/#proyectos">
            Ver proyectos
          </Link>
        </div>
      </div>
    </div>
  );
}
