import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getStackIcon } from '../../data/stackIcons';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import styles from './ProjectsCarousel.module.css';

const FLOAT_VARIANTS = ['floatNE', 'floatNW', 'floatSE', 'floatSW', 'floatDrift'];

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function floatStyleFor(seedKey, index) {
  const seed = hashSeed(`${seedKey}:${index}`);
  const variant = FLOAT_VARIANTS[seed % FLOAT_VARIANTS.length];
  const duration = 4.4 + (seed % 28) / 10; // 4.4s – 7.1s
  const delay = ((seed >>> 5) % 16) / 10; // 0s – 1.5s
  const amp = 0.75 + ((seed >>> 9) % 10) / 20; // 0.75 – 1.2
  return {
    variant,
    style: {
      '--float-duration': `${duration}s`,
      '--float-delay': `${delay}s`,
      '--float-amp': amp,
    },
  };
}

export default function ProjectsCarousel({ items }) {
  const navigate = useNavigate();
  const swiperRef = useRef(null);

  const slides = useMemo(() => {
    if (items.length === 0) return [];
    if (items.length >= 6) return items;
    const copies = Math.ceil(6 / items.length);
    return Array.from({ length: copies }, (_, copy) =>
      items.map((project) => ({
        ...project,
        _slideKey: `${project.id}-${copy}`,
      }))
    ).flat();
  }, [items]);

  if (!items.length) {
    return <p style={{ color: 'var(--muted)' }}>Aún no hay proyectos para mostrar.</p>;
  }

  return (
    <div
      className={styles.wrap}
      onMouseEnter={() => swiperRef.current?.autoplay?.stop()}
      onMouseLeave={() => swiperRef.current?.autoplay?.start()}
    >
      <button
        type="button"
        className={`${styles.navBtn} ${styles.prev}`}
        aria-label="Anterior"
        onClick={() => swiperRef.current?.slidePrev()}
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        className={`${styles.navBtn} ${styles.next}`}
        aria-label="Siguiente"
        onClick={() => swiperRef.current?.slideNext()}
      >
        <ChevronRight size={22} />
      </button>

      <Swiper
        modules={[EffectCoverflow, Autoplay]}
        effect="coverflow"
        grabCursor
        centeredSlides
        loop
        loopAdditionalSlides={3}
        slidesPerView="auto"
        spaceBetween={36}
        watchSlidesProgress
        coverflowEffect={{
          rotate: 14,
          stretch: -12,
          depth: 180,
          modifier: 1.1,
          slideShadows: false,
        }}
        autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        speed={850}
        className={styles.swiper}
        style={{ overflow: 'visible' }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {slides.map((project) => (
          <SwiperSlide key={project._slideKey || project.id} className={styles.slide}>
            {/* Hitbox estable: no se transforma, evita el titileo del hover */}
            <div
              className={styles.cardShell}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/proyectos/${project.slug}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/proyectos/${project.slug}`);
                }
              }}
            >
              <article className={styles.card}>
                <img src={project.cover} alt="" className={styles.cardBg} />

                <div className={styles.cardCharacter} aria-hidden>
                  <div className={styles.techRow}>
                    {project.stack.map((tech, techIndex) => {
                      const float = floatStyleFor(
                        `${project._slideKey || project.id}-${tech}`,
                        techIndex
                      );
                      return (
                        <button
                          key={tech}
                          type="button"
                          className={`${styles.techBubble} ${styles[float.variant]}`}
                          style={float.style}
                          title={`Ver proyectos con ${tech}`}
                          aria-label={`Ver proyectos con ${tech}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/proyectos?tech=${encodeURIComponent(tech)}`);
                          }}
                        >
                          <img src={getStackIcon(tech)} alt="" />
                        </button>
                      );
                    })}
                  </div>
                  <span className={styles.hoverHint}>Ver proyecto</span>
                </div>

                <div className={styles.caption}>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                </div>
              </article>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
