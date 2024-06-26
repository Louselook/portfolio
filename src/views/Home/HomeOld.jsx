import React, { useEffect, useState  } from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = ["Back-End", "Front-End", "IA"];

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
}, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 1000); // Cambia de palabra cada 2 segundos

    return () => clearInterval(intervalId);
  }, [words.length]);

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
              <h1>Tecnologias</h1>
            </div>
            <div className='sub2ElementBanner1'>
              <h1>{words[currentWordIndex]}</h1>
            </div>
          </div>
        </div>
        <div className='banner2' onClick={goAboutMePage}>
          Sobre Me
        </div>
      </div>
      <div className='contenedor2'></div>
    </>
  );
}

export default HomePage;
