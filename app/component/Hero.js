"use client";
import React, { useRef, useState } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import './styles.css';


// import required modules
import { Autoplay, Pagination, Navigation } from 'swiper/modules';



function Hero() {
  return (
   <>
     <Swiper   spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper">
        <SwiperSlide>
          <img src="/banner3.png" alt="" className='w-full bg-cover'/>
        </SwiperSlide>

           <SwiperSlide>
          <img src="/banner4.png" alt="" className='w-full bg-cover'/>
        </SwiperSlide>

        <SwiperSlide>
          <img src="/banner1.png" alt="" className='w-full  '/>
        </SwiperSlide>

      </Swiper>
   
   </>
  )
}

export default Hero