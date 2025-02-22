import React from 'react';
import styles from './TitleBlock.module.css';

const TitleBlock = () => {
  return (
    <div className={styles.titleBlock}>
      <h1>Aplicacion de apuestas con Flutter</h1>
      <p>Esta aplicacion fue desarrollada para facilitarle la compra de loterias a los usuarios.</p>
      <button className={styles.ctaButton}>Saber mas...</button>
    </div>
  );
};

export default TitleBlock;
