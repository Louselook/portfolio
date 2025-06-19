import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Play,
  Shield,
  BarChart3,
  Calendar,
  Download,
  Apple,
  Smartphone,
  ListChecks
} from 'lucide-react';
import styles from './Goalkeeper.module.css';

import home from '../../../assets/proyectsImage/proyects/App Goalkeeper Mobile/home.png';

import roles from '../../../assets/proyectsImage/proyects/App Goalkeeper Mobile/roles.mp4';
import seguimientoPartidos from '../../../assets/proyectsImage/proyects/App Goalkeeper Mobile/seguimiento_partidos.mp4';
import rendimiento from '../../../assets/proyectsImage/proyects/App Goalkeeper Mobile/rendimiento.mp4';
import asistencias from '../../../assets/proyectsImage/proyects/App Goalkeeper Mobile/asistencias.mp4';

import videoDemo from '../../../assets/proyectsImage/proyects/App Goalkeeper Mobile/guia.mp4';
  
const features = [
  {
    icon: <Shield className={styles.featureIcon} />,
    title: "Roles",
    description: "Accede a funcionalidades distintas según el rol: Entrenador (admin) o Jugador (player).",
    mockup: roles,
    type: 'video',
    duration: 39000
  },
  {
    icon: <Calendar className={styles.featureIcon} />,
    title: "Seguimiento de Partidos",
    description: "Evaluación detallada de errores y aciertos en cada partido, con comentarios del entrenador.",
    mockup: seguimientoPartidos,
    type: 'video',
    duration: 30000
  },
  {
    icon: <BarChart3 className={styles.featureIcon} />,
    title: "Rendimiento",
    description: "Visualiza del rendimiento del jugador por partidos.",
    mockup: rendimiento,
    type: 'video',
    duration: 22000
  },
  {
    icon: <ListChecks className={styles.featureIcon} />,
    title: "Asistencias",
    description: "Listado de los días de asistencia y ausencias al entrenamiento, con motivo de cada falta.",
    mockup: asistencias,
    type: 'video',
    duration: 53000
  },
];

const GoalkeeperPage = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const duration = features[currentFeature].duration || 4000;
    const interval = setTimeout(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, duration);
    return () => clearTimeout(interval);
  }, [currentFeature]);


  return (
    <>
      {/* Botón para volver */}
      <Link to="/" className={styles.back}>
        <span className={styles.backArrow}>◀</span>
      </Link>

      <div className={styles.container}>
        {/* Hero Section */}
        <section className={`${styles.hero} ${isVisible ? styles.fadeIn : ''}`}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <div className={styles.badge}>
                <Shield size={16} />
                <span>Academia para Arqueros</span>
              </div>
              <h1 className={styles.heroTitle}>
                <span className={styles.heroTitleLine}>El Uno</span>
                <span className={`${styles.heroTitleLine} ${styles.highlight}`}>Academy</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Aplicación diseñada para que los entrenadores deportivos 
                lleven un control exhaustivo del desempeño de sus jugadores, 
                con especial foco en los arqueros de fútbol.
              </p>
              <div className={styles.heroButtons}>
                <button className={styles.primaryButton} onClick={() => alert("No disponible actualmente")}>
                  <Download size={20} />
                  Descargar Ahora
                  <ChevronRight size={16} />
                </button>
                <button className={styles.secondaryButton} onClick={() => setShowModal(true)}>
                  <Play size={20} />
                  Ver Demo
                </button>
              </div>

              <div className={styles.downloadBadges}>
                <div className={styles.downloadBadge}>
                  <Apple size={24} />
                  <div>
                    <div className={styles.badgeText}>Descargar en</div>
                    <div className={styles.badgeStore}>App Store</div>
                  </div>
                </div>
                <div className={styles.downloadBadge}>
                  <Smartphone size={24} />
                  <div>
                    <div className={styles.badgeText}>Disponible en</div>
                    <div className={styles.badgeStore}>Google Play</div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.heroPhone}>
              <div className={styles.phoneContainer}>
                <div className={styles.phone}>
                  <div className={styles.phoneScreen}>
                    <img src={home} alt="El Uno Academy App" className={styles.phoneImage} />
                  </div>
                </div>
                <div className={styles.floatingElements}>
                  <div className={`${styles.floatingCard} ${styles.card1}`}>
                    <BarChart3 size={20} />
                    <span>Rendimiento</span>
                  </div>
                  <div className={`${styles.floatingCard} ${styles.card2}`}>
                    <ListChecks size={20} />
                    <span>Asistencias</span>
                  </div>
                  <div className={`${styles.floatingCard} ${styles.card3}`}>
                    <Calendar size={20} />
                    <span>Partidos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.featuresContent}>
            <div className={styles.featuresHeader}>
              <h2 className={styles.sectionTitle}>
                Funcionalidades que transforman tu entrenamiento
              </h2>
              <p className={styles.sectionSubtitle}>
                Descubre todas las herramientas que necesitas para convertirte en el arquero que siempre has querido ser
              </p>
            </div>
            <div className={styles.featuresGrid}>
                            <div className={styles.featuresRight}>
                <div className={styles.featurePhoneContainer}>
                  <div className={styles.featurePhone}>
                    <div className={styles.featurePhoneScreen}>
                      {features[currentFeature].type === 'video' ? (
                        <video
                          className={styles.featurePhoneImage}
                          src={features[currentFeature].mockup}
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={features[currentFeature].mockup}
                          alt={features[currentFeature].title}
                          className={styles.featurePhoneImage}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.featuresLeft}>
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`${styles.featureCard} ${index === currentFeature ? styles.active : ''}`}
                    onClick={() => setCurrentFeature(index)}
                  >
                    {feature.icon}
                    <div className={styles.featureContent}>
                      <h3 className={styles.featureTitle}>{feature.title}</h3>
                      <p className={styles.featureDescription}>{feature.description}</p>
                    </div>
                    <ChevronRight className={styles.featureArrow} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)} // cerrar al hacer clic fuera del contenido
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()} // evitar que se cierre si se hace clic dentro del contenido
          >
            <button className={styles.closeButton} onClick={() => setShowModal(false)}>✖</button>
            <video
              src={videoDemo}
              autoPlay
              controls
              className={styles.modalVideo}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default GoalkeeperPage;
