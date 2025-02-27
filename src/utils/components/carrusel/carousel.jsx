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

import { goConsultaGptExcel, goCreacionInformesGpt, goAppApuestas } from "./navegar_proyectos";

SwiperCore.use([EffectCoverflow, Pagination, Navigation, Autoplay]);

const CarouselProyects = () => {
  const swiperRef = useRef(null);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    swiperRef.current.swiper.autoplay.stop();
  };

  const handleMouseLeave = () => {
    swiperRef.current.swiper.autoplay.start();
  };

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
      slidesPerView={3}
      autoplay={{
        delay: 1000,
        disableOnInteraction: false,
      }}
      coverflowEffect={{
        rotate: 0,
        stretch: 0,
        depth: 100,
        modifier: 2,
        slideShadows: false,
      }}
      pagination={{ el: '.swiper-pagination', clickable: true }}
      navigation={{
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
        clickable: true,
      }}
      className="swiper"
    >
      {/* Consulta GPT Excel */}
      <SwiperSlide>
        <article onClick={() => goConsultaGptExcel(navigate)} style={{ cursor: 'pointer' }}>
          <img src={slide_image_1} alt="slide_image" />
          <img src="assets/studies/python.png" alt="slide_image_hover" className='hover-img' />
        </article>
      </SwiperSlide>

      {/* App de apuestas */}
      <SwiperSlide>
        <article onClick={() => goAppApuestas(navigate)} style={{ cursor: 'pointer' }}>
          <img src={slide_image_3} alt="slide_image" />
          <img src="assets/studies/flutter.png" alt="slide_image_hover" />
        </article>
      </SwiperSlide>

      {/* Creacion Informes GPT */}
      <SwiperSlide>
        <article onClick={() => goCreacionInformesGpt(navigate)} style={{ cursor: 'pointer' }}>
          <img src={slide_image_2} alt="slide_image" />
          <img src="assets/studies/python.png" alt="slide_image_hover" />
        </article>
      </SwiperSlide>

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
