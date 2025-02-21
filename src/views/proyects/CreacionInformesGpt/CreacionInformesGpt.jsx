// CreacionInformesGpt.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './CreacionInformesGpt.module.css';

// Importa tu imagen principal
import mainImage from '../../../assets/proyectsImage/proyects/Creacion Informes GPT/main.png';
import image1 from '../../../assets/proyectsImage/proyects/Creacion Informes GPT/1.png';
import image2 from '../../../assets/proyectsImage/proyects/Creacion Informes GPT/2.png';
import image3 from '../../../assets/proyectsImage/proyects/Creacion Informes GPT/3.png';

const CreacionInformesGpt = () => {
  // Desplazar hacia arriba al cargar la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.landingContainer}>
                <Link to="/" className={styles.back}>
            <span className={styles.backArrow}>◀</span>
        </Link> 
      {/* First SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroText}>
          <h1>Sistema Automatizado de Generación de Informes APA</h1>
          <p>
          El sistema convierte datos crudos de Excel en documentos combinando 
          inteligencia artificial con formato de documentos.
          </p>
        </div>
        <div className={styles.heroImage}>
          <img src={mainImage} alt="Hero" />
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className={styles.featuresSection}>
        <h2>Herramientas Principales del Proyecto</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureItem}>
            <img src="assets/studies/python.png" alt="Feature Icon" />
            <h3>Python</h3>
            <p>Lenguaje de programacion.</p>
          </div>
          <div className={styles.featureItem}>
            <img src="assets/icons/customtkinter.png" alt="Feature Icon" />
            <h3>Customtkinter</h3>
            <p>Construccion de la interfaz y carga de archivo.</p>
          </div>
          <div className={styles.featureItem}>
            <img src="assets/icons/openai.png" alt="Feature Icon" />
            <h3>Api OpenAi</h3>
            <p>Analisis de la informacion y construccion de la respuesta.</p>
          </div>
        </div>
      </section>

      {/* Introduccion */}
      <section className={styles.testimonialsSection}>
        <h2>Introducción</h2>
        <div className={styles.testimonial}>
          <p>
            Crear una solución integral para la creación automática de informes técnicos en formato 
            APA, especializada en el análisis de datos de responsabilidad extendida del productor (REP). 
            El sistema convierte datos crudos de Excel en documentos listos para auditorías, combinando 
            inteligencia artificial con formato académico riguroso.
          </p>
        </div>
      </section>

        {/* main.py*/}
        <section className={styles.pageDataSection}>
            <section className={styles.pageData}>
                <div className={styles.pageDataImg}>
                    <img src={image1} alt="interfaz main" />
                </div>
                <div className={styles.pageDataText}>
                    <h3>Extracción Inteligente de Datos (main.py)</h3>
                        <ul>
                            <li>Interfaz gráfica para selección de archivos Excel</li>
                            <li>Detección automática de hojas y estructura de datos</li>
                            <li>Filtrado avanzado de valores relevantes</li>
                            <li>Generación de archivo estructurado (extraccion.txt)</li>
                        </ul>
                </div>
            </section>
        </section>


        {/* ia2.py*/}
        <section className={styles.pageDataSection2}>
            <section className={styles.pageData}>
                <div className={styles.pageDataText}>
                    <h3>Procesamiento con IA Especializada (ia2.py)</h3>
                        <ul>
                            <li>Análisis de datos con GPT-4 Turbo</li>
                            <li>Validación contra normativa 0803/2024 y Ley 2232/2022</li>
                            <li>Generación de tablas comparativas en Markdown</li>
                            <li>Detección de brechas de cumplimiento</li>
                            <li>Detección de brechas de cumplimiento</li>
                            <li>Propuestas de mejora técnica</li>
                        </ul>
                </div>
                <div className={styles.pageDataImg}>
                    <img src={image2} alt="codigo api openai" />
                </div>
            </section>
        </section>

        {/* ia2.py*/}
        <section className={styles.pageDataSection3}>
            <section className={styles.pageData}>
                <div className={styles.pageDataImg}>
                    <img src={image3} alt="imagen doc difuminando la informacion" />
                </div>
                <div className={styles.pageDataText}>
                    <h3>Formateo Automático APA (create_doc.py)</h3>
                        <ul>
                            <li>Conversión a Word con estilos predefinidos</li>
                            <li>Aplicación de márgenes y sangrías regulatorias</li>
                            <li>Generación dinámica de índices</li>
                            <li>Exportación a carpeta Docs con timestamp</li>
                            <li>Compatibilidad con elementos académicos:</li>
                        </ul>
                </div>
            </section>
        </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
            <div className={styles.footerLeft}>
            <h3>Python 3.11.3 | OpenAI API | Markdown</h3>
            <h4>Librerías Principales:</h4>
            <ul>
                <li>Pandas (procesamiento de datos)</li>
                <li>CustomTkinter (interfaz gráfica moderna)</li>
                <li>python-docx (generación de documentos)</li>
                <li>Openpyxl (manejo avanzado de Excel)</li>
                <li>Openai (creacion del contenido del informe)</li>
            </ul>
            </div>
            <div className={styles.footerRight}>
            <h4>Flujo de Trabajo:</h4>
            <p>Excel → Pandas → GPT-4 → Markdown → Word (APA)</p>
            </div>
        </div>
        </footer>
    </div>
  );
};

export default CreacionInformesGpt;
