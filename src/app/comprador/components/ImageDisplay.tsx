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
  videoUrl?: string | null; // <-- Añadido prop para la URL del video
}

export default function ImageDisplay({ imageUrls, altText, videoUrl }: ImageDisplayProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);

  // Combina URLs de video e imágenes para el carrusel principal
  // El video irá al principio si existe
  const allSlidesContent = [
    ...(videoUrl ? [{ type: 'video', url: videoUrl, alt: `${altText} Video Tour` }] : []),
    ...imageUrls.map((url, idx) => ({ type: 'image', url, alt: `${altText} ${idx + 1}` })),
  ];

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
        {allSlidesContent.map((slide, idx) => (
          <SwiperSlide key={idx} className="relative flex justify-center items-center">
            {slide.type === 'video' ? (
              // Contenedor para video responsive
              <div className="w-full h-0 pb-[56.25%] relative rounded-xl overflow-hidden"> {/* 16:9 Aspect Ratio */}
                <video
                  src={slide.url}
                  controls // Mostrar controles de reproducción
                  playsInline // Mejor compatibilidad en iOS
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  aria-label={slide.alt}
                >
                  Tu navegador no soporta el tag de video.
                </video>
              </div>
            ) : (
              <Zoom>
                <img
                  src={slide.url}
                  alt={slide.alt}
                  className="w-full h-[450px] object-cover rounded-xl"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://placehold.co/800x450/cccccc/333333?text=Sin+imagen';
                  }}
                />
              </Zoom>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnails (solo para imágenes) */}
      {/* Podrías añadir un thumbnail especial para el video si tienes uno */}
      <Swiper
        modules={[Thumbs]}
        onSwiper={setThumbsSwiper}
        slidesPerView={6}
        spaceBetween={8}
        watchSlidesProgress
        className="rounded-md"
      >
        {/* Si hay video, añade un thumbnail representativo para él al principio */}
        {videoUrl && (
          <SwiperSlide key="thumb-video" className="cursor-pointer flex justify-center items-center bg-gray-200">
            {/* Puedes poner un ícono de video o una imagen de placeholder para el video */}
            <span className="text-gray-500 text-lg">🎥 Video</span>
          </SwiperSlide>
        )}
        {imageUrls.map((url, idx) => (
          <SwiperSlide key={`thumb-${idx}`} className="cursor-pointer">
            <img src={url} alt={`Thumbnail ${idx + 1}`} className="h-20 w-full object-cover rounded-md" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
