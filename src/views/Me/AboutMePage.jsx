import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { profile } from '../../data/profile';
import cvUrl from '../../assets/docs/CVJuanes.pdf_2026_8_6.pdf';
import styles from './AboutMePage.module.css';

export default function AboutMePage() {
  const reduce = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.hero}>
          <motion.div
            className={styles.copy}
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1>{profile.name}</h1>
            <p className={styles.role}>{profile.title}</p>
            <p>{profile.summary}</p>
            <div className={styles.actions}>
              <a className="btn btn-primary" href={profile.links.whatsapp} target="_blank" rel="noreferrer">
                Contactar
              </a>
              <a className="btn btn-ghost" href={cvUrl} download="CV-Juan-Esteban-Arenilla.pdf">
                Descargar CV
              </a>
              <Link className="btn btn-ghost" to="/#proyectos">
                Ver proyectos
              </Link>
            </div>
          </motion.div>
          <motion.div
            className={styles.photo}
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img src={profile.photos[0]} alt={profile.name} />
          </motion.div>
        </div>

        <section className={styles.block}>
          <h2>Estudios & skills</h2>
          <div className={styles.studies}>
            {profile.studies.map((item) => (
              <article key={item.title} className={styles.studyCard}>
                <img src={item.img} alt="" />
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.block}>
          <h2>Experiencia</h2>
          <div className={styles.list}>
            {profile.experience.map((item, index) => (
              <article key={item.title} className={styles.expItem}>
                <span className={styles.expIndex}>{String(index + 1).padStart(2, '0')}</span>
                <div className={styles.expCopy}>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
