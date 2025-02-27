import styles from "./FuncCard.module.css";
import user from "../../../../assets/proyectsImage/proyects/App Apuestas Mobile/user.png";
import loterias from "../../../../assets/proyectsImage/proyects/App Apuestas Mobile/loterias.png";
import recargas from "../../../../assets/proyectsImage/proyects/App Apuestas Mobile/recargas.png";

const FuncCard = () => {
  return (
    <div className={styles["integ-content"]}>
      <h2 className={styles["title"]}>
        Características <span className={styles["highlight"]}>Destacadas!</span>
      </h2>
      <div className={styles["fun-card-container"]}>
        {/* Tarjeta 1 */}
        <div className={styles["fun-card"]}>
            <h4 className={styles["card-title"]}>
                <span className={styles["highlight"]}>Usuarios</span>
                <br /> Creación e inicio de sesión.
            </h4>
          <img
            src={user}
            alt="Imagen Usuario"
            className={styles.phoneImage}
          />
        </div>
        {/* Tarjeta 2 */}
        <div className={styles["fun-card"]}>
            <img
                src={loterias}
                alt="Ejemplo Teléfono"
                className={styles.phoneImage}
            />
            <h4 className={styles["card-title"]}>
                <span className={styles["highlight"]}>Loterias</span>
                <br /> Elige tu lotería, ingresa tus datos y haz tu apuesta.
            </h4>
        </div>
        {/* Tarjeta 3 */}
        <div className={styles["fun-card"]}>
            <h4 className={styles["card-title"]}>
                <span className={styles["highlight"]}>Recargas</span>
                <br /> Recarga tu cuenta para comprar tus loterías favoritas.
            </h4>
          <img
            src={recargas}
            alt="Ejemplo Teléfono"
            className={styles.phoneImage}
          />
        </div>
      </div>
    </div>
  );
};

export default FuncCard;
