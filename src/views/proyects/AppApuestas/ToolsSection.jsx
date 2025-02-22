// ToolsSection.jsx
import React from "react";
import styles from "./ToolsSection.module.css";

const ToolsSection = () => {
  // Sustituimos las propiedades 'icon' por la ruta de la imagen en public/assets
  const statsData = [
    {
      id: 1,
      image: "/assets/studies/flutter.png",
      value: "Flutter",
      label: "Total Downloads",
    },
    {
      id: 2,
      image: "/assets/studies/python.png",
      value: "Python",
      label: "Positive Reviews",
    },
    {
      id: 3,
      image: "/assets/studies/supabase.png",
      value: "Supabase",
      label: "Verified Mail",
    },
    {
      id: 4,
      image: "/assets/studies/render.png",
      value: "Render",
      label: "Users Worldwide",
    },
  ];

  return (
    <div className={styles.container}>
      {statsData.map((stat) => (
        <div key={stat.id} className={styles.card}>
          <div className={styles.iconContainer}>
            {/* Aquí usamos la imagen en lugar de un ícono */}
            <img
              src={stat.image}
              alt={stat.label}
              className={styles.iconImage}
            />
          </div>
          <h3 className={styles.value}>{stat.value}</h3>
          <p className={styles.label}>{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default ToolsSection;
