import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, LayoutGrid, List } from 'lucide-react';
import { allStacks, projects } from '../../data/projects';
import { getStackIcon } from '../../data/stackIcons';
import styles from './ProjectsPage.module.css';

function matchesTech(project, tech) {
  if (!tech) return true;
  const needle = tech.trim().toLowerCase();
  return project.stack.some((s) => s.toLowerCase() === needle);
}

export default function ProjectsPage() {
  const reduce = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();
  const [layout, setLayout] = useState('grid');
  const activeTech = searchParams.get('tech')?.trim() || '';

  const filtered = useMemo(
    () => projects.filter((p) => matchesTech(p, activeTech)),
    [activeTech],
  );

  const filterChips = useMemo(() => {
    const set = new Set(allStacks);
    if (activeTech) set.add(activeTech);
    return [...set].sort((a, b) => a.localeCompare(b, 'es'));
  }, [activeTech]);

  const setTech = (tech) => {
    if (!tech) {
      setSearchParams({}, { replace: true });
      return;
    }
    setSearchParams({ tech }, { replace: true });
  };

  return (
    <div className={styles.page}>
      <div className={`container ${styles.inner}`}>
        <motion.header
          className={styles.hero}
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.kicker}>Catálogo</p>
          <h1>Proyectos</h1>
          <p className={styles.lead}>
            {activeTech
              ? `Filtrado por ${activeTech}. Explora el grid o cambia de tecnología.`
              : 'Vista completa en grid o lista. El carrusel del inicio es solo un preview.'}
          </p>
        </motion.header>

        <div className={styles.toolbar}>
          <div className={styles.filters} role="toolbar" aria-label="Filtrar por tecnología">
            <button
              type="button"
              className={`${styles.chip} ${!activeTech ? styles.chipActive : ''}`}
              onClick={() => setTech('')}
              aria-pressed={!activeTech}
            >
              Todos
            </button>
            {filterChips.map((tech) => (
              <button
                key={tech}
                type="button"
                className={`${styles.chip} ${activeTech.toLowerCase() === tech.toLowerCase() ? styles.chipActive : ''}`}
                onClick={() => setTech(tech)}
                aria-pressed={activeTech.toLowerCase() === tech.toLowerCase()}
              >
                <img src={getStackIcon(tech)} alt="" className={styles.chipIcon} />
                {tech}
              </button>
            ))}
          </div>

          <div className={styles.layoutToggle} role="group" aria-label="Vista">
            <button
              type="button"
              className={`${styles.layoutBtn} ${layout === 'grid' ? styles.layoutBtnActive : ''}`}
              onClick={() => setLayout('grid')}
              aria-pressed={layout === 'grid'}
              aria-label="Vista en grid"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              type="button"
              className={`${styles.layoutBtn} ${layout === 'list' ? styles.layoutBtnActive : ''}`}
              onClick={() => setLayout('list')}
              aria-pressed={layout === 'list'}
              aria-label="Vista en lista"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <p>
              No hay proyectos con <strong>{activeTech}</strong> todavía.
            </p>
            <button type="button" className="btn btn-ghost" onClick={() => setTech('')}>
              Ver todos
            </button>
          </div>
        ) : (
          <ul className={layout === 'grid' ? styles.grid : styles.list}>
            {filtered.map((project, index) => (
              <motion.li
                key={project.id}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: reduce ? 0 : Math.min(index * 0.05, 0.35),
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link to={`/proyectos/${project.slug}`} className={styles.card}>
                  <div className={styles.cover}>
                    <img src={project.cover} alt="" />
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <h2>{project.title}</h2>
                      <ArrowUpRight size={18} className={styles.cardArrow} aria-hidden />
                    </div>
                    <p>{project.summary}</p>
                    <ul className={styles.stack}>
                      {project.stack.map((tech) => (
                        <li key={tech}>
                          <img src={getStackIcon(tech)} alt="" />
                          <span>{tech}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
