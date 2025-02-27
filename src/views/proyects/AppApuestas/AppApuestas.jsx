import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './AppApuestas.module.css';
import TitleBlock from './components/TitleBlock';
import ToolsSection from "./components/ToolsSection";
import FuncCard from "./components/FuncCard";

import phoneImage from "../../../assets/proyectsImage/proyects/App Apuestas Mobile/mobile.png";

const AppApuestas = () => {

  // Desplazar hacia arriba al cargar la página
  useEffect(() => {
      window.scrollTo(0, 0); // Lleva el scroll al inicio de la página
  }, []);
  
  return (
    <>
      {/* Botón para volver */}
      <Link to="/" className={styles.back}>
        <span className={styles.backArrow}>◀</span>
      </Link>
      
      {/* Contenedor principal */}
      <div className={styles.container1}>
        
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
      <ToolsSection />

    {/* Sección nueva estilo "Take control of your money" */}
    <div className={styles.container2}>
      {/* Columna de imagen */}
      <div className={styles.imageSection}>
        {/* Círculo de fondo */}
        <div className={styles.circle}></div>
        {/* Imagen del teléfono */}
        <img
          src={phoneImage} 
          alt="Imagen Teléfono"
          className={styles.phoneImage2}
        />
      </div>
      {/* Columna de texto */}
      <div className={styles.textSection}>
        <h1 className={styles.mainTitle}>Toma el control de tu dinero</h1>
        <h2 className={styles.subTitle}>Finanzas al alcance de tu mano</h2>
        <ul className={styles.benefitsList}>
          <li>Monitoreo fácil con una sola vista de todas tus finanzas</li>
          <li>Retiros con un solo clic</li>
          <li>Recordatorios de recompensas premium</li>
        </ul>
      </div>
    </div>

    {/* Seccion de funcionalidades */}
    
    <FuncCard />

    {/* Sección nueva estilo "Take control of your money" */}
    <div className={styles.container2}>
      {/* Columna de texto */}
      <div className={styles.textSection}>
        <h1 className={styles.mainTitle}>Toma el control de tu dinero</h1>
        <h2 className={styles.subTitle}>Finanzas al alcance de tu mano</h2>
        <ul className={styles.benefitsList}>
          <li>Monitoreo fácil con una sola vista de todas tus finanzas</li>
          <li>Retiros con un solo clic</li>
          <li>Recordatorios de recompensas premium</li>
        </ul>
      </div>
      {/* Columna de imagen */}
      <div className={styles.imageSection}>
        {/* Círculo de fondo */}
        <div className={styles.circle}></div>
        {/* Imagen del teléfono */}
        <img
          src={phoneImage} 
          alt="Imagen Teléfono"
          className={styles.phoneImage2}
        />
      </div>
    </div>
    </>
  );
};

export default AppApuestas;