import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ExternalLink, Play } from 'lucide-react';
import { getProjectBySlug } from '../../data/projects';
import styles from './ProjectDetail.module.css';

function FeatureSwitcher({ chapter }) {
  const [index, setIndex] = useState(0);
  const feature = chapter.features[index];

  useEffect(() => {
    const duration = feature.duration || 8000;
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % chapter.features.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [index, feature.duration, chapter.features.length]);

  return (
    <div className={styles.featureGrid}>
      <div className={styles.featureList}>
        {chapter.features.map((item, i) => (
          <button
            key={item.title}
            type="button"
            className={`${styles.featureCard} ${i === index ? styles.featureActive : ''}`}
            onClick={() => setIndex(i)}
          >
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </button>
        ))}
      </div>
      <div className={styles.phoneWrap}>
        <div className={styles.phone}>
          <div className={styles.phoneScreen}>
            {feature.media.type === 'video' ? (
              <video
                key={feature.media.src}
                src={feature.media.src}
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img src={feature.media.src} alt={feature.title} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChapterSection({ chapter, index }) {
  const reduce = useReducedMotion();
  const reverse = chapter.layout === 'text-right';

  if (chapter.layout === 'feature-switcher') {
    return (
      <motion.section
        className={styles.chapter}
        initial={reduce ? false : { opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.chapterInner} style={{ gridTemplateColumns: '1fr' }}>
          <div className={styles.chapterCopy} style={{ maxWidth: '48rem' }}>
            <h2>{chapter.title}</h2>
            <p>{chapter.body}</p>
          </div>
          <FeatureSwitcher chapter={chapter} />
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className={styles.chapter}
      initial={reduce ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.03 }}
    >
      <div
        className={`${styles.chapterInner} ${reverse ? styles.chapterInnerReverse : ''}`}
      >
        <div className={styles.chapterCopy}>
          <h2>{chapter.title}</h2>
          <p>{chapter.body}</p>
        </div>
        <div className={styles.chapterMedia}>
          {chapter.media.type === 'video' ? (
            <video src={chapter.media.src} controls playsInline preload="metadata" />
          ) : (
            <img src={chapter.media.src} alt={chapter.title} />
          )}
        </div>
      </div>
    </motion.section>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);
  const reduce = useReducedMotion();
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!project) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroMedia} aria-hidden>
          <img src={project.cover} alt="" />
          <div className={styles.heroScrim} />
        </div>
        <motion.div
          className={styles.heroContent}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <Link to="/#proyectos" className={styles.back}>
            <ArrowLeft size={18} /> Volver a proyectos
          </Link>
          <div className={styles.meta}>
            <span className="tag">{project.role}</span>
            <span className="tag">{project.type}</span>
            {project.stack.map((s) => (
              <span key={s} className="tag">
                {s}
              </span>
            ))}
          </div>
          <h1>{project.title}</h1>
          <p>{project.summary}</p>
          {(project.demoVideo || project.links?.demo) && (
            <div className={styles.heroActions}>
              {project.demoVideo && (
                <button type="button" className="btn btn-primary" onClick={() => setShowDemo(true)}>
                  <Play size={18} /> Ver demo
                </button>
              )}
              {project.links?.demo && (
                <a
                  className="btn btn-ghost"
                  href={project.links.demo}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink size={18} /> Ver sitio
                </a>
              )}
            </div>
          )}
        </motion.div>
      </section>

      {project.chapters.map((chapter, index) => (
        <ChapterSection key={`${chapter.title}-${index}`} chapter={chapter} index={index} />
      ))}

      {showDemo && project.demoVideo && (
        <div className={styles.modalOverlay} onClick={() => setShowDemo(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.closeButton}
              aria-label="Cerrar"
              onClick={() => setShowDemo(false)}
            >
              ✕
            </button>
            <video src={project.demoVideo} autoPlay controls playsInline />
          </div>
        </div>
      )}
    </div>
  );
}
