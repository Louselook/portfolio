import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { useNavigate } from "react-router-dom";
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import './index.css';

import { Swiper as SwiperCore, EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper';

import slide_image_1 from '../../../assets/proyectsImage/proyects/Consulta GPT Excel/main.png';
import slide_image_2 from '../../../assets/proyectsImage/proyects/Creacion Informes GPT/main.png';
import slide_image_3 from '../../../assets/proyectsImage/proyects/App Apuestas Mobile/main.png';
import slide_image_4 from '../../../assets/proyectsImage/proyects/App Goalkeeper Mobile/main.png';


import { goConsultaGptExcel, goCreacionInformesGpt, goAppApuestas, goAppGoalkeepers } from "./navegar_proyectos";

SwiperCore.use([EffectCoverflow, Pagination, Navigation, Autoplay]);

const CarouselProyects = () => {
  const swiperRef = useRef(null);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    if (swiperRef.current?.swiper?.autoplay) {
      swiperRef.current.swiper.autoplay.stop();
    }
  };

  const handleMouseLeave = () => {
    if (swiperRef.current?.swiper?.autoplay) {
      swiperRef.current.swiper.autoplay.start();
    }
  };

  const originalProjects = [
    {
      id: 1,
      image: slide_image_1,
      hoverImage: "assets/studies/python.png",
      onClick: () => goConsultaGptExcel(navigate),
      title: "Consulta GPT Excel"
    },
    {
      id: 2,
      image: slide_image_3,
      hoverImage: "assets/studies/flutter.png", 
      onClick: () => goAppApuestas(navigate),
      title: "App de Apuestas"
    },
    {
      id: 3,
      image: slide_image_2,
      hoverImage: "assets/studies/python.png",
      onClick: () => goCreacionInformesGpt(navigate),
      title: "Creación Informes GPT"
    },
    {
      id: 4,
      image: slide_image_4, // Cambiar por la imagen correcta
      hoverImage: "assets/studies/flutter.png",
      onClick: () => goAppGoalkeepers(navigate),
      title: "App Goalkeepers"
    }
  ];

  // Duplicamos los proyectos para crear un bucle infinito más suave
  // Esto asegura que siempre haya elementos disponibles en ambas direcciones
  const projects = [
    ...originalProjects,
    ...originalProjects.map(project => ({
      ...project,
      id: project.id + 100 // IDs únicos para evitar conflictos
    })),
    ...originalProjects.map(project => ({
      ...project,
      id: project.id + 200 // IDs únicos para evitar conflictos
    }))
  ];

  return (
    <div 
      className="swiper_container" 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
    >
      <Swiper
        ref={swiperRef}
        effect={'coverflow'}
        grabCursor={true}
        loop={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        spaceBetween={30}
        // Configuración mejorada para el bucle infinito
        loopFillGroupWithBlank={true}
        loopedSlides={originalProjects.length}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
          reverseDirection: false, // Cambia a true si quieres que vaya en sentido contrario
        }}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 200,
          modifier: 1.5,
          scale: 0.9,
          slideShadows: false, // ← CAMBIO PRINCIPAL: Desactivar sombras
        }}
        pagination={{ 
          el: '.swiper-pagination', 
          clickable: true,
          dynamicBullets: true,
          // Configuración para mostrar solo los slides originales en la paginación
          type: 'bullets',
          renderBullet: function (index, className) {
            const realIndex = index % originalProjects.length;
            return '<span class="' + className + '" data-index="' + realIndex + '"></span>';
          },
        }}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
          clickable: true,
        }}
        // Configuración para mejorar el bucle infinito
        watchSlidesProgress={true}
        watchSlidesVisibility={true}
        // Configuración adicional para suavizar el bucle
        speed={800}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 20,
            coverflowEffect: {
              rotate: 20,
              depth: 100,
              modifier: 1,
              scale: 0.8,
              slideShadows: false, // También aquí
            },
          },
          640: {
            slidesPerView: 1.5,
            spaceBetween: 25,
            coverflowEffect: {
              rotate: 25,
              depth: 150,
              modifier: 1.2,
              scale: 0.85,
              slideShadows: false, // También aquí
            },
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 60,
            coverflowEffect: {
              rotate: 20,
              depth: 180,
              modifier: 1.3,
              scale: 0.9,
              slideShadows: false, // También aquí
            },
          },
          1024: {
            slidesPerView: 2.5,
            spaceBetween: 60,
            coverflowEffect: {
              rotate: 20,
              depth: 200,
              modifier: 1.5,
              scale: 0.9,
              slideShadows: false, // También aquí
            },
          },
          1200: {
            slidesPerView: 3,
            spaceBetween: 60,
            coverflowEffect: {
              rotate: 20,
              depth: 200,
              modifier: 1.5,
              scale: 0.9,
              slideShadows: false, // También aquí
            },
          },
        }}
        className="swiper"
        // Evento para manejar mejor el bucle infinito
        onSlideChange={(swiper) => {
          // Opcional: lógica adicional para el cambio de slides
        }}
      >
        {projects.map((project, index) => (
          <SwiperSlide key={`${project.id}-${index}`}>
            <article 
              onClick={project.onClick} 
              className="project-card"
              role="button"
              tabIndex={0}
              aria-label={`Ver proyecto ${project.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  project.onClick();
                }
              }}
            >
              <div className="image-container">
                <img 
                  src={project.image} 
                  alt={`Imagen del proyecto ${project.title}`}
                  className="main-image"
                />
                <img 
                  src={project.hoverImage} 
                  alt={`Tecnología usada en ${project.title}`} 
                  className="hover-image" 
                />
              </div>
              <div className="project-info">
                <h3 className="project-title">{project.title}</h3>
              </div>
            </article>
          </SwiperSlide>
        ))}

        <div className="slider-controler">
          <div className="swiper-button-prev slider-arrow">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </div>
          <div className="swiper-button-next slider-arrow">
            <ion-icon name="arrow-forward-outline"></ion-icon>
          </div>
          <div className="swiper-pagination"></div>
        </div>
      </Swiper>
    </div>
  );
}

export default CarouselProyects;