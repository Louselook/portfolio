import React, { useCallback, useEffect, useState } from 'react';
import styles from './RandomGallery.module.css';

const RandomGallery = ({ images, count = 3 }) => {
  const [photoArray, setPhotoArray] = useState([]);

  // Genera las propiedades de cada imagen.
  const generatePhoto = useCallback(() => {
    const image = images[Math.floor(Math.random() * images.length)];
    const left = Math.random() * 90; // posición horizontal en porcentaje
    const top = Math.random() * 90;  // posición vertical en porcentaje
    const duration = (10 + Math.random() * 10).toFixed(2); // duración entre 10 y 20 segundos
    const delay = (1 + Math.random() * 4).toFixed(2); // retraso para la animación entre 1 y 5 segundos
    return {
      image,
      left,
      top,
      duration,
      delay,
      id: Math.random().toString(36).substr(2, 9),
    };
  }, [images]);

  // Función para agregar una imagen, evitando duplicados en pantalla.
  const addPhoto = useCallback(() => {
    const isDuplicate = (img) => photoArray.some(photo => photo.image === img);
    let newPhoto = generatePhoto();
    let attempts = 0;
    while (isDuplicate(newPhoto.image) && attempts < 10) {
      newPhoto = generatePhoto();
      attempts++;
    }
    setPhotoArray(prev => [...prev, newPhoto]);
  }, [photoArray, generatePhoto]);

  // Agrega nuevas imágenes con un retraso aleatorio, o inmediatamente si es la primera.
  useEffect(() => {
    if (photoArray.length < count) {
      const randomDelay = photoArray.length === 0 ? 0 : 2000 + Math.random() * 7000; // 0 ms para la 1ª, luego 1-5 seg.
      const timer = setTimeout(() => {
        addPhoto();
      }, randomDelay);
      return () => clearTimeout(timer);
    }
  }, [photoArray, count, addPhoto]);

  // Remueve la imagen cuando termina su animación.
  const handleAnimationEnd = (id) => {
    setPhotoArray(prev => prev.filter(photo => photo.id !== id));
  };

  return (
    <div className={styles.gallery}>
      {photoArray.map(photo => (
        <img
          key={photo.id}
          src={photo.image}
          alt="random"
          className={styles.photo}
          style={{
            left: `${photo.left}%`,
            top: `${photo.top}%`,
            animationDuration: `${photo.duration}s`,
            animationDelay: `${photo.delay}s`,
          }}
          onAnimationEnd={() => handleAnimationEnd(photo.id)}
        />
      ))}
    </div>
  );
};

export default RandomGallery;
