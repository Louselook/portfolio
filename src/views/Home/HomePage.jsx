import React, { useEffect, useState, useRef } from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';
import {TextAnimation} from '../../utils/components/iconsTools/TextAnimation'
import IconCarousel from '../../utils/components/iconsTools/IconsCarousel';
import CarouselProyects from '../../utils/components/carrusel/carousel'
import RandomGallery from '../Me/RandomGallery';

const HomePage = () => {
  const navigate = useNavigate();
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [showTextAnimation, setShowTextAnimation] = useState(false);
  const contenedorRef = useRef(null);
  const proyectsViewsRef = useRef(null); // Nueva referencia para el contenedor de proyectos

  const goAboutMePage = () => {
    navigate('/about');
  };

  useEffect(() => {
    const textElement = document.getElementById('animated-text');
    const text = textElement.innerText;
    textElement.innerText = '';

    text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.innerText = char;
        span.className = 'letter';
        textElement.appendChild(span);

        const animationType = index % 3 === 0 ? 'fall' : index % 3 === 1 ? 'roll' : 'bounce';
        span.style.animation = `${animationType} 1s ease-in-out forwards`;
        span.style.animationDelay = `${index * 0.07}s`;
    });

    // Detecta el final de la animación del título y muestra el párrafo
    const titleAnimationDuration = text.length * 260;
    setTimeout(() => {
        setShowIntroduction(true);
    }, titleAnimationDuration);

    // Esperar 2.5 segundos antes de mostrar TextAnimation
    setTimeout(() => {
        setShowTextAnimation(true);
    }, 2500);

    return () => {
        // Limpiar los efectos y animaciones aquí si es necesario
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const proyectsViewsElement = proyectsViewsRef.current;
          const proyecTitleElement = document.querySelector('#proyecTitle-text');
          
          if (entry.isIntersecting) {
            console.log("Sección de proyectos visible");
            if (proyectsViewsElement) {
              proyectsViewsElement.style.backgroundColor = 'rgb(6, 6, 34)';
            }
            if (proyecTitleElement) {
              proyecTitleElement.style.color = 'whitesmoke';
            }
          } else {
            console.log("Sección de proyectos no visible");
            if (proyectsViewsElement) {
              proyectsViewsElement.style.backgroundColor = 'whitesmoke';
            }
            if (proyecTitleElement) {
              proyecTitleElement.style.color = 'rgb(6, 6, 34)';
            }
          }
        });
      },
      {
        threshold: 0.5, // Cambiado a 50% para mejor detección
        rootMargin: '0px 0px -20% 0px' // Activa cuando el elemento está 20% antes del final del viewport
      }
    );

    const currentRef = proyectsViewsRef.current; // Observa directamente el contenedor de proyectos

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const texts = [
    " ",
    "Back-end",
    "Front-end",
    "Databases"
  ];

  const texts2 = [
    "Back-end",
    "Front-end",
    "Data analytics",
    "Data science",
    "IA"
  ];

  const images = [
    "assets/me.png",
    "assets/me2.png",
    "assets/me3.png",
    "assets/me4.png",
  ];

  return (
    <>
      <div className='contenedor1'>
        <div className='banner1'>
          <div className='element1banner1'>
            <h1 id="animated-text">Portfolio</h1>
            <p className={`introduccion ${showIntroduction ? 'visible' : ''}`}>
              An exhibition of the work I have done,
              personal projects I have worked on,
              and my academic studies. Explore
              to learn more about my experience and skills.
            </p>
          </div>
          <div className='element2banner1'>
            <div className='sub1ElementBanner1'>
                {showTextAnimation ? (
                  <IconCarousel />
                ) : (
                  <span id="text1"></span>
                )}
            </div>
            <div className='sub2ElementBanner1'>
              <h1>
                {showTextAnimation ? (
                  <TextAnimation texts={texts} texts2={texts2}/>
                ) : (
                  <span id="text1"></span>
                )}
                <span id="text2"></span>
              </h1>
            </div>
          </div>
        </div>
        <div className='banner2' onClick={goAboutMePage}>
          <h1 id="animated-text">Acerca de mi</h1>
          <RandomGallery images={images} count={15} />
        </div>
      </div>
      
      <div className='contenedor2'>
        <div className='proyectsViews' ref={proyectsViewsRef}>
          <div className='proyecTitlebanner'>
            <h1 id="proyecTitle-text">
              COLLECTION OF PROJECTS.
            </h1>
          </div>         
          <div className='proyectsCarrucel'>
            <CarouselProyects />
          </div>
        </div>
        <div className='viewElement' ref={contenedorRef}></div>
      </div>
    </>
  );
}

export default HomePage;