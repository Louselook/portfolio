import React, { useState, useEffect } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import './ImageCarousel.css';

const images = [
  require('../../assets/flutter.png'),
  require('../../assets/fastapi.webp'),
  require('../../assets/react.png'),
  require('../../assets/sqlserver.webp'),
  require('../../assets/supabase.png'),
  require('../../assets/firebase.png'),
  require('../../assets/net.png'),
];

const IconCarousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Cambia cada 3 segundos
    return () => clearInterval(interval);
  }, []);

  return (
    // <div className='carousel-container '>
      <TransitionGroup>
        <CSSTransition key={index} timeout={3500} classNames="slide">
          <img src={images[index]} alt={`Slide ${index}`} className="carousel-image" />
        </CSSTransition>
      </TransitionGroup>
    // </div>
  );
};

export default IconCarousel;
