import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Play } from 'lucide-react';
import { getProjectBySlug } from '../../data/projects';
import styles from './ProjectDetail.module.css';

const EASE_EXPO = [0.16, 1, 0.3, 1];
const EASE_SPRING = [0.34, 1.56, 0.64, 1];

const SHAPE_RADIUS = {
  sharp: { frame: '10px', panel: '8px', media: '8px', phone: '18px', screen: '12px', card: '8px', btn: '6px', clip: 8 },
  soft: { frame: '28px', panel: '24px', media: '22px', phone: '36px', screen: '28px', card: '16px', btn: '12px', clip: 24 },
  pill: { frame: '40px', panel: '36px', media: '32px', phone: '40px', screen: '32px', card: '24px', btn: '999px', clip: 32 },
  cut: { frame: '4px', panel: '4px', media: '4px', phone: '12px', screen: '8px', card: '4px', btn: '4px', clip: 4 },
};

function themeToStyle(theme) {
  const c = theme.colors;
  const shape = SHAPE_RADIUS[theme.shape] || SHAPE_RADIUS.soft;
  const display = theme.fonts?.display || 'IBM Plex Sans';
  const body = theme.fonts?.body || display;
  const mono = theme.fonts?.mono || 'IBM Plex Mono';
  return {
    '--page': c.page,
    '--ink': c.ink,
    '--accent': c.accent,
    '--accent2': c.accent2,
    '--paper': c.paper,
    '--card': c.card,
    '--text': c.text,
    '--muted': c.muted,
    '--font-display': `'${display}', system-ui, sans-serif`,
    '--font-body': `'${body}', system-ui, sans-serif`,
    '--font-mono': `'${mono}', ui-monospace, monospace`,
    '--r-frame': shape.frame,
    '--r-panel': shape.panel,
    '--r-media': shape.media,
    '--r-phone': shape.phone,
    '--r-screen': shape.screen,
    '--r-card': shape.card,
    '--r-btn': shape.btn,
    '--clip-r': `${shape.clip}px`,
  };
}

function MotifScanlines() {
  return (
    <svg className={styles.motif} viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden>
      {Array.from({ length: 28 }, (_, i) => (
        <line key={i} x1="0" y1={i * 14 + 6} x2="400" y2={i * 14 + 6} />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <line key={`v-${i}`} x1={i * 36 + 8} y1="0" x2={i * 36 + 8} y2="400" className={styles.motifSoft} />
      ))}
    </svg>
  );
}

function MotifRules() {
  return (
    <svg className={styles.motif} viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden>
      {Array.from({ length: 18 }, (_, i) => (
        <line key={i} x1="24" y1={40 + i * 18} x2="376" y2={40 + i * 18} />
      ))}
      <line x1="48" y1="20" x2="48" y2="380" className={styles.motifAccent} />
    </svg>
  );
}

function MotifRings() {
  return (
    <svg className={styles.motif} viewBox="0 0 400 400" aria-hidden>
      {[60, 100, 140, 180].map((r) => (
        <circle key={r} cx="200" cy="200" r={r} fill="none" />
      ))}
    </svg>
  );
}

function MotifPitch() {
  return (
    <svg className={styles.motif} viewBox="0 0 400 400" preserveAspectRatio="none" aria-hidden>
      <rect x="20" y="20" width="360" height="360" fill="none" />
      <line x1="200" y1="20" x2="200" y2="380" />
      <circle cx="200" cy="200" r="48" fill="none" />
      <rect x="20" y="120" width="70" height="160" fill="none" />
      <rect x="310" y="120" width="70" height="160" fill="none" />
    </svg>
  );
}

function MotifTickets() {
  return (
    <svg className={styles.motif} viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden>
      <path
        d="M0 20 H380 a20 20 0 0 1 0 40 a20 20 0 0 1 0 40 H0"
        fill="none"
        strokeDasharray="6 10"
      />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={28 + i * 26} cy="60" r="5" className={styles.motifDot} />
      ))}
    </svg>
  );
}

function DecorLayer({ motif }) {
  switch (motif) {
    case 'scanlines':
      return <MotifScanlines />;
    case 'rules':
      return <MotifRules />;
    case 'rings':
      return <MotifRings />;
    case 'pitch':
      return <MotifPitch />;
    case 'tickets':
      return <MotifTickets />;
    default:
      return null;
  }
}

function SplitHeadline({ text, as: Tag = 'h1', reduce, delay = 0, mode = 'scroll', rotateDeg = 4, ease }) {
  const lines = useMemo(() => {
    const words = String(text).split(' ');
    if (words.length <= 4) return [words];
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid), words.slice(mid)];
  }, [text]);

  if (reduce) {
    return <Tag>{text}</Tag>;
  }

  const rot = `${rotateDeg}deg`;

  return (
    <Tag>
      {lines.map((line, i) => {
        const transition = { duration: 1.1, ease, delay: delay + i * 0.1 };
        const motionProps =
          mode === 'load'
            ? {
                initial: { translateY: '110%', rotate: rot },
                animate: { translateY: '0%', rotate: '0deg' },
              }
            : {
                initial: { translateY: '110%', rotate: rot },
                whileInView: { translateY: '0%', rotate: '0deg' },
                viewport: { once: true, amount: 0.35 },
              };
        return (
          <span className={styles.ln} key={`ln-${i}`}>
            <motion.span
              {...motionProps}
              transition={transition}
              style={{ display: 'block', transformOrigin: '0% 100%' }}
            >
              {line.join(' ')}
            </motion.span>
          </span>
        );
      })}
    </Tag>
  );
}

function StackTicker({ stack, reduce, mono }) {
  const items = [...stack, ...stack];
  return (
    <div
      className={`${styles.frame} ${styles.tickerFrame} ${mono ? styles.tickerMono : ''}`}
      aria-label={stack.join(', ')}
    >
      <div className={styles.tickerTrack} style={reduce ? { animation: 'none' } : undefined}>
        {items.map((name, i) => (
          <span key={`${name}-${i}`}>{name}</span>
        ))}
      </div>
    </div>
  );
}

function FeatureSwitcher({ chapter, reduce, ease }) {
  const [index, setIndex] = useState(0);
  const feature = chapter.features[index];
  const count = chapter.features.length;

  useEffect(() => {
    if (reduce) return undefined;
    const duration = feature.duration || 8000;
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % count);
    }, duration);
    return () => clearTimeout(timer);
  }, [index, feature.duration, count, reduce]);

  const go = (dir) => {
    setIndex((prev) => (prev + dir + count) % count);
  };

  return (
    <div>
      <div className={styles.arrows}>
        <button
          type="button"
          className={styles.arrowBtn}
          aria-label="Anterior"
          onClick={() => go(-1)}
        >
          <ChevronLeft size={22} />
        </button>
        <button
          type="button"
          className={`${styles.arrowBtn} ${styles.arrowNext}`}
          aria-label="Siguiente"
          onClick={() => go(1)}
        >
          <ChevronRight size={22} />
        </button>
      </div>
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
        <motion.div
          className={styles.phoneWrap}
          key={feature.title}
          initial={reduce ? false : { y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease }}
        >
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
        </motion.div>
      </div>
    </div>
  );
}

function ChapterSection({ chapter, index, reduce, theme, ease, rotateDeg, shape }) {
  const isFeatures = chapter.layout === 'feature-switcher';
  const isCta = index === 4;
  const isLight = !isCta && (index === 1 || index === 3);
  const reverse = chapter.layout === 'text-right';
  const clipR = SHAPE_RADIUS[shape]?.clip ?? 24;

  const frameClass = [
    styles.frame,
    isLight ? styles.frameLight : styles.frameDark,
    isCta ? styles.frameCta : '',
  ]
    .filter(Boolean)
    .join(' ');

  if (isFeatures) {
    return (
      <motion.section
        className={frameClass}
        initial={reduce ? false : { opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease }}
      >
        <div className={styles.chapterPad}>
          <div className={styles.featDecor} aria-hidden>
            <DecorLayer motif={theme.motif} />
          </div>
          <div className={styles.featHead}>
            <span className={styles.eyebrow}>Acto {index + 1}</span>
            <SplitHeadline
              text={chapter.title}
              as="h2"
              reduce={reduce}
              rotateDeg={rotateDeg}
              ease={ease}
            />
            <p className={styles.chapterBody}>{chapter.body}</p>
          </div>
          <FeatureSwitcher chapter={chapter} reduce={reduce} ease={ease} />
        </div>
      </motion.section>
    );
  }

  if (isCta) {
    return (
      <motion.section
        className={frameClass}
        initial={reduce ? false : { borderWidth: 46, opacity: 0.9 }}
        whileInView={{ borderWidth: 10, opacity: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1.2, ease }}
      >
        <div className={styles.ctaMotif} aria-hidden>
          <DecorLayer motif={theme.motif} />
        </div>
        <div className={styles.ctaInner}>
          <span className={styles.eyebrow}>Acto {index + 1}</span>
          <SplitHeadline
            text={chapter.title}
            as="h2"
            reduce={reduce}
            rotateDeg={rotateDeg}
            ease={ease}
          />
          <p>{chapter.body}</p>
          {chapter.media && (
            <motion.div
              className={styles.ctaMedia}
              initial={reduce ? false : { y: 80, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease, delay: 0.15 }}
            >
              {chapter.media.type === 'video' ? (
                <video src={chapter.media.src} controls playsInline preload="metadata" />
              ) : (
                <img src={chapter.media.src} alt={chapter.title} />
              )}
            </motion.div>
          )}
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className={frameClass}
      initial={reduce ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease, delay: index * 0.03 }}
    >
      {!isLight && (
        <div className={styles.sectionMotif} aria-hidden>
          <DecorLayer motif={theme.motif} />
        </div>
      )}
      <div className={styles.chapterPad}>
        <div
          className={`${styles.chapterInner} ${reverse ? styles.chapterInnerReverse : ''}`}
        >
          <div className={styles.chapterCopy}>
            <span className={styles.eyebrow}>Acto {index + 1}</span>
            <SplitHeadline
              text={chapter.title}
              as="h2"
              reduce={reduce}
              rotateDeg={rotateDeg}
              ease={ease}
            />
            <p className={styles.chapterBody}>{chapter.body}</p>
          </div>
          <motion.div
            className={styles.mediaStage}
            initial={
              reduce
                ? false
                : { clipPath: `inset(0 50% 0 50% round ${clipR}px)` }
            }
            whileInView={{ clipPath: `inset(0 0 0 0 round ${clipR}px)` }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 1.2, ease }}
          >
            {chapter.media?.type === 'video' ? (
              <video src={chapter.media.src} controls playsInline preload="metadata" />
            ) : (
              <img src={chapter.media?.src} alt={chapter.title} />
            )}
          </motion.div>
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

  const theme = project?.theme;
  const ease = theme?.motion?.feel === 'spring' ? EASE_SPRING : EASE_EXPO;
  const rotateDeg = theme?.motion?.rotateDeg ?? 4;
  const shape = theme?.shape || 'soft';
  const clipR = SHAPE_RADIUS[shape]?.clip ?? 24;
  const layout = theme?.heroLayout || 'media-right';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!theme?.nav) return undefined;
    document.documentElement.dataset.projectNav = theme.nav;
    return () => {
      delete document.documentElement.dataset.projectNav;
    };
  }, [theme?.nav, slug]);

  if (!project || !theme) {
    return <Navigate to="/404" replace />;
  }

  const heroGridClass = [
    styles.heroGrid,
    layout === 'media-left' ? styles.heroMediaLeft : '',
    layout === 'stacked' ? styles.heroStacked : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={styles.landing}
      style={themeToStyle(theme)}
      data-shape={theme.shape}
      data-motif={theme.motif}
      data-feel={theme.motion?.feel || 'expo'}
      data-layout={layout}
    >
      <header className={`${styles.frame} ${styles.frameDark}`}>
        <div className={styles.heroMotif} aria-hidden>
          <DecorLayer motif={theme.motif} />
        </div>
        <div className={heroGridClass}>
          <motion.div
            className={styles.heroCopy}
            initial={reduce ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            <Link to="/#proyectos" className={styles.back}>
              <ArrowLeft size={18} /> Volver a proyectos
            </Link>
            <div className={styles.meta}>
              <span className={styles.tag}>{project.role}</span>
              <span className={styles.tag}>{project.type}</span>
              {project.stack.map((s) => (
                <span key={s} className={styles.tag}>
                  {s}
                </span>
              ))}
            </div>
            <SplitHeadline
              text={project.title}
              as="h1"
              reduce={reduce}
              delay={0.05}
              mode="load"
              rotateDeg={rotateDeg}
              ease={ease}
            />
            <p className={styles.lead}>{project.summary}</p>
            {(project.demoVideo || project.links?.demo) && (
              <div className={styles.heroActions}>
                {project.demoVideo && (
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnWhite}`}
                    onClick={() => setShowDemo(true)}
                  >
                    <Play size={18} /> Ver demo
                  </button>
                )}
                {project.links?.demo && (
                  <a
                    className={`${styles.btn} ${styles.btnLine}`}
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

          <motion.div
            className={styles.heroPanel}
            initial={
              reduce ? false : { clipPath: `inset(0 50% 0 50% round ${clipR}px)` }
            }
            animate={{ clipPath: `inset(0 0 0 0 round ${clipR}px)` }}
            transition={{ duration: 1.25, ease, delay: 0.1 }}
          >
            <div className={styles.panelMotif} aria-hidden>
              <DecorLayer motif={theme.motif} />
            </div>
            <motion.div
              className={styles.phone}
              initial={reduce ? false : { y: 140, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1.05, ease, delay: 0.2 }}
            >
              <div className={styles.phoneScreen}>
                <img src={project.cover} alt="" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </header>

      <StackTicker
        stack={project.stack}
        reduce={reduce}
        mono={theme.motif === 'scanlines'}
      />

      {project.chapters.map((chapter, index) => (
        <ChapterSection
          key={`${chapter.title}-${index}`}
          chapter={chapter}
          index={index}
          reduce={reduce}
          theme={theme}
          ease={ease}
          rotateDeg={rotateDeg}
          shape={shape}
        />
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
