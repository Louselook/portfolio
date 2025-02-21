import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './AboutMePage.module.css'
import ContactMe from './contact/ContactMe'

const AboutMePage = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <>
    <Link to="/" className={styles['back']}>
      <span className={styles['back-arrow']}>◀</span>
    </Link>
    <div className={styles['content']}>
      <div className={styles['presentation']}>
        <div>
          <h1>I'm Juan Esteban Arenilla Buendia</h1>
          <p>Developer & Cybernetics systems engineering</p>
          <button className={styles['contact-button']} onClick={togglePopup}>
            Contact me!
          </button>
        </div>
        <img 
            src="assets/me.png" 
            alt="Mi foto" 
            className={styles["mi-foto"]}
          />
      </div>

      <div className={styles['study']}>
        <h3>Studies & skills</h3>
        <div className={`row ${styles['study-content']}`}>
          {studyCard({ title: 'Universidad', subtitle: 'Ingenieria en sistemas ciberneticos', img: "assets/studies/usb.png" })}
          {studyCard({ title: 'Python', subtitle: 'Desarrollo backend y automatizaciones', img: "assets/studies/python.png"})}
          {studyCard({ title: 'Flutter', subtitle: 'Desarrollo apps multiplataforma', img: "assets/studies/flutter.png"})}
        
          {studyCard({ title: 'React', subtitle: 'Desarrollo web', img: "assets/studies/react.png" })}
          {studyCard({ title: 'Sql', subtitle: 'Consultas y análisis de datos"', img: "assets/studies/sql.png" })}
        </div>
      </div>
    </div>
    <ContactMe isOpen={isPopupOpen} onClose={togglePopup} />
  </>
  )
}

export default AboutMePage

const studyCard = ({title, subtitle, img}) => {
  return (
    <div className={styles['studyCard']}>
      <img 
        src={img} 
        alt="icon studies" 
        className={styles["icon-studies"]}
      />
      <div className={styles["info-studyCard"]}>
        <h3 className={styles["text-Title"]}>{title}</h3>
        <p className={styles["text-Subtitle"]}>{subtitle}</p>
      </div>
    </div>
  )
}