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
  videoUrl?: string | null;
}

export default function ImageDisplay({ imageUrls, altText, videoUrl }: ImageDisplayProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperCore | null>(null);

  // Filtramos solo imágenes válidas
  const filteredImages = imageUrls.filter((url) =>
    /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
  );

  return (
    <div className="w-full space-y-10">
      {/* Carrusel de imágenes */}
      {filteredImages.length > 0 && (
        <>
          <Swiper
            modules={[Navigation, Thumbs]}
            navigation
            thumbs={{ swiper: thumbsSwiper }}
            spaceBetween={10}
            touchRatio={1}
            grabCursor={true}
            className="mb-4 rounded-xl"
          >
            {filteredImages.map((url, idx) => (
              <SwiperSlide key={idx} className="relative flex justify-center items-center">
                <Zoom>
                  <img
                    src={url}
                    alt={`${altText} ${idx + 1}`}
                    className="w-full h-[450px] object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://placehold.co/800x450/cccccc/333333?text=Sin+imagen';
                    }}
                  />
                </Zoom>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Miniaturas responsivas */}
          <Swiper
            modules={[Thumbs]}
            onSwiper={setThumbsSwiper}
            spaceBetween={8}
            watchSlidesProgress
            breakpoints={{
              0: { slidesPerView: 3 },
              640: { slidesPerView: 4 },
              1024: { slidesPerView: 6 },
            }}
            className="rounded-md"
          >
            {filteredImages.map((url, idx) => (
              <SwiperSlide key={`thumb-${idx}`} className="cursor-pointer">
                <img
                  src={url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="h-20 w-full object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://placehold.co/120x80?text=No+thumb';
                  }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </>
      )}

      {/* Video (solo si existe) */}
      {videoUrl && (
        <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden shadow-lg">
          <iframe
            src={videoUrl}
            title="Tour virtual"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      )}
    </div>
  );
}
