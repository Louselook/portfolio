import React from "react";
import styles from "./ContactMe.module.css";

const ContactMe = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const links = [
    {
      href: "https://wa.me/+573224976097",
      img: "assets/icons/whatsapp.png",
      alt: "WhatsApp",
      className: styles.whatsapp,
    },
    {
      href: "https://www.linkedin.com/in/juanes-arenilla-514a84265/",
      img: "assets/icons/linkedin.png",
      alt: "LinkedIn",
      className: styles.linkedin,
    },
    {
      href: "https://github.com/Louselook",
      img: "assets/icons/github.png",
      alt: "GitHub",
      className: styles.github,
    },
  ];

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <button className={styles.closeButton} onClick={onClose}>
          ✖
        </button>
        <div className={styles['info-contact-me']}>
            <h2>Contact Me</h2>
            <p className={styles['info-text-1']}>
                ¡Gracias por visitar mi página! Aquí tienes mi información de contacto para comunicarte conmigo.  
                Si tienes consultas, proyectos interesantes o buscas colaboración en desarrollo de software o soluciones tecnológicas, no dudes en escribirme.  
            </p>
            <p className={styles['info-text-2']}>+57 3224976097</p>
            <p className={styles['info-text-2']}>juanes.arenilla@gmail.com</p>
        </div>
        <div className={styles.links}>
          {links.map((link, index) => (
            <LinkCard
              key={index}
              href={link.href}
              img={link.img}
              alt={link.alt}
              className={link.className}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const LinkCard = ({ href, img, alt, className }) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      <img src={img} alt={alt} className={styles.icon} />
    </a>
  );
};

export default ContactMe;
