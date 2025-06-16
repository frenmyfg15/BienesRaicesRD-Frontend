'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { useState } from 'react';
import SwiperCore from 'swiper';

interface ImageDisplayProps {
  imageUrls: string[];
  altText: string;
}

export default function ImageDisplay({ imageUrls, altText }: ImageDisplayProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);

  return (
    <div className="w-full">
      {/* Carrusel principal */}
      <Swiper
        modules={[Navigation, Thumbs]}
        navigation
        thumbs={{ swiper: thumbsSwiper }}
        spaceBetween={10}
        className="mb-4 rounded-xl"
      >
        {imageUrls.map((url, idx) => (
          <SwiperSlide key={idx}>
            <Zoom>
              <img src={url} alt={`${altText} ${idx + 1}`} className="w-full h-[450px] object-cover rounded-xl" />
            </Zoom>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnails */}
      <Swiper
        modules={[Thumbs]}
        onSwiper={setThumbsSwiper}
        slidesPerView={6}
        spaceBetween={8}
        watchSlidesProgress
        className="rounded-md"
      >
        {imageUrls.map((url, idx) => (
          <SwiperSlide key={`thumb-${idx}`} className="cursor-pointer">
            <img src={url} alt={`Thumbnail ${idx + 1}`} className="h-20 w-full object-cover rounded-md" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
