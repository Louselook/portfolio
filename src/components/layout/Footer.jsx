import { Github, Linkedin, MessageCircle, FileDown } from 'lucide-react';
import { profile } from '../../data/profile';
import cvUrl from '../../assets/docs/CVJuanes.pdf_2026_8_6.pdf';
import styles from './Layout.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <img
              className={styles.footerLogo}
              src="/brand/logotipo-light.svg"
              alt="Juan Esteban Arenill Buendia"
            />
            <p>{profile.title}</p>
          </div>
          <div className={styles.socials}>
            <a
              className={styles.social}
              href={profile.links.whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a
              className={styles.social}
              href={profile.links.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              <Linkedin size={16} /> LinkedIn
            </a>
            <a
              className={styles.social}
              href={profile.links.github}
              target="_blank"
              rel="noreferrer"
            >
              <Github size={16} /> GitHub
            </a>
            <a className={styles.social} href={cvUrl} download="CV-Juan-Esteban-Arenilla.pdf">
              <FileDown size={16} /> CV
            </a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>Portfolio · {new Date().getFullYear()}</span>
          <span>Flutter · FastAPI · React · Python</span>
        </div>
      </div>
    </footer>
  );
}
