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
    const titleAnimationDuration = text.length * 260; // Duración total de la animación del título
    setTimeout(() => {
        setShowIntroduction(true);
    }, titleAnimationDuration);

        // Esperar 5 segundos antes de mostrar TextAnimation
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
        const proyectsViewsElement = document.querySelector('.proyectsViews');
        const proyecTitleElement = document.querySelector('#proyecTitle-text');
        if (entry.isIntersecting && entry.intersectionRatio === 1) {
          console.log("Elemento visible");
          proyectsViewsElement.style.backgroundColor = 'rgb(6, 6, 34)';
          proyecTitleElement.style.color = 'whitesmoke'
        } else {
          console.log("Elemento No visible");
          proyectsViewsElement.style.backgroundColor = 'whitesmoke';
          proyecTitleElement.style.color = 'rgb(6, 6, 34)'
        }
      });
    },
    {
      threshold: 1.0 // 1.0 significa que el 100% del elemento debe estar visible
    }
  );

  const currentRef = contenedorRef.current; // Almacena la referencia actual en una variable local

  if (currentRef) {
    observer.observe(currentRef);
  }

  return () => {
    if (currentRef) {
      observer.unobserve(currentRef);
    }
  };
}, []); // Asegúrate de pasar un arreglo vacío como segundo argumento para que el efecto se ejecute solo una vez


  const texts = [
    " ",
    "Back-end",
    "Front-end",
    // "Data analytics",
    // "Data science",
    "Databases"
    // "by @GevStack"
  ];

  const texts2 = [
    "Back-end",
    "Front-end",
    "Data analytics",
    "Data science",
    "IA"
    // "by @GevStack"
  ];

  const images = [
    "assets/me.png",
    "assets/me2.png",
    "assets/me3.png",
    "assets/me4.png",
    // Agrega más rutas de imágenes
  ];

  return (
    <>
      <div className='contenedor1'>
        <div className='banner1'>
          <div className='element1banner1'>
            <h1 id="animated-text">Portfolio</h1>
            <p className={`introduccion ${showIntroduction ? 'visible' : ''}`}>
              {/* Una exposición de los trabajos que he realizado, 
              proyectos personales en los que he trabajado, 
              y mis estudios académicos. Explora 
              para conocer más sobre mi experiencia y habilidades. */}
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
                  <TextAnimation texts={texts}  texts2={texts2}/>
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
      <div 
        className='contenedor2'>
        <div className='proyectsViews'>
          <div className='banner1' >
            <div className='proyecTitlebanner'>
              <h1 id="proyecTitle-text">
                {/* COLECCION DE PROYECTOS PERSONALES */}
                COLLECTION OF PERSONAL PROJECTS.
              </h1>
            </div>
          </div>         
          <div className='proyectsCarrucel'  >
            <CarouselProyects />
          </div>
        </div>
        <div className='viewElement' ref={contenedorRef}></div>
      </div>
      
    </>
  );
}

export default HomePage;
