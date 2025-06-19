import React, { useCallback, useEffect, useState, useMemo } from 'react';
import styles from './RandomGallery.module.css';

const RandomGallery = ({ images, count = 3 }) => {
  const [photoArray, setPhotoArray] = useState([]);

  // Memoizar configuración basada en el tamaño de pantalla
  const config = useMemo(() => {
    const isMobile = window.innerWidth <= 480;
    
    return {
      minDuration: isMobile ? 8 : 10,
      maxDuration: isMobile ? 15 : 20,
      minDelay: 1,
      maxDelay: isMobile ? 3 : 4,
      addDelay: isMobile ? 1500 : 2000,
      addDelayRange: isMobile ? 4000 : 7000,
      maxAttempts: 8
    };
  }, []);

  // Genera las propiedades de cada imagen con mejor distribución
  const generatePhoto = useCallback(() => {
    const image = images[Math.floor(Math.random() * images.length)];
    
    // Mejores rangos de posición para evitar cortes en móviles
    const isMobile = window.innerWidth <= 480;
    const leftRange = isMobile ? 80 : 85;
    const topRange = isMobile ? 80 : 85;
    
    const left = Math.random() * leftRange;
    const top = Math.random() * topRange;
    const duration = (config.minDuration + Math.random() * (config.maxDuration - config.minDuration)).toFixed(2);
    const delay = (config.minDelay + Math.random() * (config.maxDelay - config.minDelay)).toFixed(2);
    
    return {
      image,
      left,
      top,
      duration,
      delay,
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }, [images, config]);

  // Función optimizada para agregar fotos
  const addPhoto = useCallback(() => {
    setPhotoArray(prev => {
      // Verificar si ya tenemos suficientes fotos
      if (prev.length >= count) return prev;
      
      const isDuplicate = (img) => prev.some(photo => photo.image === img);
      let newPhoto = generatePhoto();
      let attempts = 0;
      
      // Intentar evitar duplicados, pero no bloquear si hay pocos imágenes
      while (isDuplicate(newPhoto.image) && attempts < config.maxAttempts && images.length > 2) {
        newPhoto = generatePhoto();
        attempts++;
      }
      
      return [...prev, newPhoto];
    });
  }, [count, generatePhoto, config.maxAttempts, images.length]);

  // Efecto principal optimizado
  useEffect(() => {
    if (photoArray.length >= count) return;

    const isFirstPhoto = photoArray.length === 0;
    const delay = isFirstPhoto ? 100 : config.addDelay + Math.random() * config.addDelayRange;
    
    const timer = setTimeout(addPhoto, delay);
    return () => clearTimeout(timer);
  }, [photoArray.length, count, addPhoto, config.addDelay, config.addDelayRange]);

  // Remueve la imagen cuando termina su animación
  const handleAnimationEnd = useCallback((id) => {
    setPhotoArray(prev => prev.filter(photo => photo.id !== id));
  }, []);

  // Cleanup effect para limpiar cuando el componente se desmonta
  useEffect(() => {
    return () => {
      setPhotoArray([]);
    };
  }, []);

  return (
    <div className={styles.gallery}>
      {photoArray.map(photo => (
        <img
          key={photo.id}
          src={photo.image}
          alt=""
          className={styles.photo}
          style={{
            left: `${photo.left}%`,
            top: `${photo.top}%`,
            animationDuration: `${photo.duration}s`,
            animationDelay: `${photo.delay}s`,
          }}
          onAnimationEnd={() => handleAnimationEnd(photo.id)}
          loading="lazy"
          decoding="async"
        />
      ))}
    </div>
  );
};

export default React.memo(RandomGallery)
// export default RandomGallery;
