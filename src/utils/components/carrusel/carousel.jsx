import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import './index.css';

import { Swiper as SwiperCore, EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper';

import slide_image_1 from '../../../assets/proyectsImage/img_1.jpg';
import slide_image_2 from '../../../assets/proyectsImage/img_2.jpg';
import slide_image_3 from '../../../assets/proyectsImage/img_3.jpg';
import slide_image_4 from '../../../assets/proyectsImage/img_4.jpg';
import slide_image_5 from '../../../assets/proyectsImage/img_5.jpg';
import slide_image_6 from '../../../assets/proyectsImage/img_6.jpg';
import slide_image_7 from '../../../assets/proyectsImage/img_7.jpg';

import slide_image_hover from '../../../assets/proyectsImage/hoverView.png';

SwiperCore.use([EffectCoverflow, Pagination, Navigation, Autoplay]);

const CarouselProyects = () => {
  const swiperRef = useRef(null);

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
        centeredSlides={true}
        loop={true}
        slidesPerView={'auto'}
        loopedSlides={3}
        autoplay={{
          delay: 3000, // Cambia el delay según tus necesidades (3000 ms = 3 segundos)
          disableOnInteraction: false, // Para que el autoplay no se detenga cuando se interactúe con el carrusel
        }}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2,
        }}
        pagination={{ el: '.swiper-pagination', clickable: true }}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
          clickable: true,
        }}
        className="swiper"
      >
        <SwiperSlide>
          <article>
            <img src={slide_image_1} alt="slide_image" />
            <img src={slide_image_hover} alt="slide_image_hover" />
          </article>
        </SwiperSlide>
        <SwiperSlide>
          <article>
            <img src={slide_image_2} alt="slide_image" />
            <img src={slide_image_hover} alt="slide_image_hover" />
          </article>
        </SwiperSlide>
        <SwiperSlide>
          <article>
            <img src={slide_image_3} alt="slide_image" />
            <img src={slide_image_hover} alt="slide_image_hover" />
          </article>
        </SwiperSlide>
        <SwiperSlide>
          <article>
            <img src={slide_image_4} alt="slide_image" />
            <img src={slide_image_hover} alt="slide_image_hover" />
          </article>
        </SwiperSlide>
        <SwiperSlide>
          <article>
            <img src={slide_image_5} alt="slide_image" />
            <img src={slide_image_hover} alt="slide_image_hover" />
          </article>
        </SwiperSlide>
        <SwiperSlide>
          <article>
            <img src={slide_image_6} alt="slide_image" />
            <img src={slide_image_hover} alt="slide_image_hover" />
          </article>
        </SwiperSlide>
        <SwiperSlide>
          <article>
            <img src={slide_image_7} alt="slide_image" />
            <img src={slide_image_hover} alt="slide_image_hover" />
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
