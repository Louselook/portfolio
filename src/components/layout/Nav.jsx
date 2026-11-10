import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import styles from './Layout.module.css';

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/about', label: 'Sobre mí' },
  {
    to: '/proyectos',
    label: 'Proyectos',
    isActive: (pathname) => pathname === '/proyectos' || pathname.startsWith('/proyectos/'),
  },
  { to: '/#contacto', label: 'Contacto', hash: true },
];

function resolveProjectNav() {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.dataset.projectNav === 'light' ? 'light' : 'dark';
}

function resolveDepth(pathname, scrollY) {
  if (pathname.startsWith('/proyectos/')) {
    return resolveProjectNav() === 'light' ? 'projectLight' : 'project';
  }

  if (pathname !== '/') {
    return scrollY > 12 ? 'solid' : 'clear';
  }

  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? scrollY / max : 0;

  if (progress > 0.48) return 'deep';
  if (progress > 0.22 || scrollY > 40) return 'mid';
  return 'clear';
}

export default function Nav() {
  const location = useLocation();
  const [depth, setDepth] = useState(() =>
    resolveDepth(location.pathname, typeof window !== 'undefined' ? window.scrollY : 0),
  );
  const [open, setOpen] = useState(false);
  const useLightLogo = depth === 'deep' || depth === 'project';

  useEffect(() => {
    if (!location.pathname.startsWith('/proyectos/')) return undefined;
    const root = document.documentElement;
    const sync = () => setDepth(resolveDepth(location.pathname, window.scrollY));
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['data-project-nav'] });
    sync();
    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setDepth(resolveDepth(location.pathname, window.scrollY));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [location.pathname]);

  useEffect(() => {
    setOpen(false);
    setDepth(resolveDepth(location.pathname, window.scrollY));
  }, [location.pathname, location.hash]);

  const handleHash = (hash) => (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(hash);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setOpen(false);
    }
  };

  const depthClass = {
    clear: styles.navClear,
    mid: styles.navMid,
    deep: styles.navDeep,
    solid: styles.navSolid,
    project: styles.navProject,
    projectLight: styles.navProjectLight,
  }[depth];

  return (
    <header className={`${styles.nav} ${depthClass} ${open ? styles.navOpen : ''}`}>
      <div className={styles.navInner}>
        <Link
          to="/"
          className={styles.brand}
          aria-label="Juan Esteban Arenill Buendia, inicio"
        >
          <img
            className={styles.logoFull}
            src={
              useLightLogo
                ? '/brand/imagotipo-horizontal-light.svg'
                : '/brand/imagotipo-horizontal-color.svg'
            }
            alt="Juan Esteban Arenill Buendia"
            height={44}
          />
          <img
            className={styles.logoMark}
            src={useLightLogo ? '/brand/isotipo-light.svg' : '/brand/isotipo-color.svg'}
            alt="Juan Esteban Arenill Buendia"
            height={36}
          />
        </Link>

        <nav className={styles.links} aria-label="Principal">
          {links.map((link) =>
            link.hash ? (
              <Link
                key={link.label}
                to={link.to}
                className={styles.link}
                onClick={handleHash(link.to.replace('/#', ''))}
              >
                {link.label}
              </Link>
            ) : (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                className={({ isActive }) => {
                  const active = link.isActive
                    ? link.isActive(location.pathname)
                    : isActive;
                  return `${styles.link} ${active ? styles.linkActive : ''}`;
                }}
              >
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        <button
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className={styles.mobilePanel}>
          {links.map((link) =>
            link.hash ? (
              <Link
                key={link.label}
                to={link.to}
                className={styles.mobileLink}
                onClick={handleHash(link.to.replace('/#', ''))}
              >
                {link.label}
              </Link>
            ) : (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.end}
                className={({ isActive }) => {
                  const active = link.isActive
                    ? link.isActive(location.pathname)
                    : isActive;
                  return `${styles.mobileLink} ${active ? styles.mobileLinkActive : ''}`;
                }}
              >
                {link.label}
              </NavLink>
            )
          )}
        </div>
      )}
    </header>
  );
}
