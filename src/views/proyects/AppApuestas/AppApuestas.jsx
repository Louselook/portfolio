import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AppApuestas.module.css';
import TitleBlock from './TitleBlock';
import phoneImage from './phone.png'; // Ruta de ejemplo

const AppApuestas = () => {
  return (
    <>
      {/* Botón para volver */}
      <Link to="/" className={styles.back}>
        <span className={styles.backArrow}>◀</span>
      </Link>
      
      {/* Contenedor principal */}
      <div className={styles.container}>
        
        {/* Sección Izquierda (Texto) */}
        <div className={styles.leftSection}>
          <TitleBlock />
        </div>

        {/* Sección Derecha (Figura + imagen del teléfono) */}
        <div className={styles.rightSection}>
        <div className={styles.rightSection}>
          <div className={styles.figura}></div>
          <img 
            src={phoneImage} 
            alt="Ejemplo Teléfono" 
            className={styles.phoneImage} 
          />
          </div>
        </div>
      </div>
    </>
  );
};

export default AppApuestas;
