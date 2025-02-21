import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ConsultaGptExcel.module.css';

import image_1 from '../../../assets/proyectsImage/proyects/Consulta GPT Excel/1.png';
import image_2 from '../../../assets/proyectsImage/proyects/Consulta GPT Excel/2.png';
import image_3 from '../../../assets/proyectsImage/proyects/Consulta GPT Excel/31.png';

const ConsultaGptExcel = () => {
    // Desplazar hacia arriba al cargar la página
    useEffect(() => {
        window.scrollTo(0, 0); // Lleva el scroll al inicio de la página
    }, []);

    return (
        <>
        <Link to="/" className={styles.back}>
            <span className={styles.backArrow}>◀</span>
        </Link>
        <div className={styles['contentProyect']}>
            <section className={styles['forma1']}>
                <div className={styles.forma1Text}>
                    <h1>
                        CONSULTA DE PDF's <span>APP CON GPT</span>
                    </h1>
                    <p>Esta app fue creada para automatizar y facilitar el proceso de consulta de unos parametros de documentos especificos.</p>
                </div>
                <div className={styles.forma1Image}>
                    <img 
                        src={image_1} 
                        alt="proyect main" 
                        className="mi-foto"
                    />
                </div>
            </section>
            <section className={styles['forma1']}>
                <div className={styles.forma1Image}>
                    <img 
                        src={image_2}
                        alt="Mi foto" 
                        className="mi-foto"
                    />
                </div>
                <div className={styles.forma1Text}>
                    <h1>
                        ENFOQUE Y <span>OBJETIVOS</span>
                    </h1>
                    <p>El objetivo principal fue simplificar la interacción con documentos complejos, permitiendo a los usuarios obtener respuestas rápidas y precisas sin necesidad de abrir manualmente cada archivo.</p>
                </div>
            </section>
            <section className={styles['forma1']}>
                <div className={styles.forma1Text}>
                    <h1>
                        TECNOLOGÍAS UTILIZADAS <span>EN EL PROYECTO</span>
                    </h1>
                    <p>Este proyecto MONOLITO fue creado utilizando customTK de python para la interfaz de usuario, con una integración de GPT para procesar los documentos PDF, optimizando la extracción de datos y delegando la consulta a la api de.</p>
                </div>
                <div className={styles.forma1Image}>
                    <img 
                        src={image_3}
                        alt="Imagen del proyecto" 
                        className="mi-foto"
                    />
                </div>
            </section>

            {/* <section className={styles['forma2']}>
                <div className={styles.forma2Text}>
                    <h1>
                        MAKE SOMETHING <span>MEANINGFUL</span>
                    </h1>
                    <p>Showcasing projects that inspire and captivate.</p>
                </div>
                <div className={styles.forma2Image}>
                    <img 
                        src="assets/me.png" 
                        alt="Mi foto" 
                        className="mi-foto"
                    />
                </div>
            </section> */}
        </div>
        </>
    );
};

export default ConsultaGptExcel;
