'use client'; // Necesario para usar Hooks de React

import React, { useState, useEffect } from 'react';

// Interfaz para las propiedades del componente ImageGallery
interface ImageGalleryProps {
  images: string[]; // Array de URLs de las imágenes
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  // Estado para la imagen principal que se muestra
  // Inicializa con la primera imagen del array o un placeholder si no hay imágenes
  const [mainImage, setMainImage] = useState<string>(
    images && images.length > 0
      ? images[0]
      : 'https://placehold.co/1200x800/cccccc/333333?text=Imagen+No+Disponible'
  );

  // Efecto para actualizar la imagen principal si el array de imágenes cambia
  useEffect(() => {
    if (images && images.length > 0 && mainImage !== images[0]) {
      setMainImage(images[0]);
    }
  }, [images, mainImage]);

  // Función para manejar errores de carga de imagen
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null; // Evita bucles infinitos en caso de error repetido
    e.currentTarget.src = 'https://placehold.co/1200x800/cccccc/333333?text=Imagen+No+Disponible'; // URL de imagen de respaldo
  };

  const handleThumbnailError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = 'https://placehold.co/80x64/dddddd/aaaaaa?text=Img'; // URL de imagen de respaldo para miniaturas
  };


  return (
    <div className="w-full relative">
      {/* Contenedor de la imagen principal */}
      <div className="w-full aspect-w-16 aspect-h-9 overflow-hidden rounded-t-xl bg-gray-200">
        <img
          src={mainImage}
          alt="Imagen principal de la propiedad"
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </div>

      {/* Contenedor de miniaturas (solo se muestra si hay más de una imagen) */}
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2 p-4 bg-gray-100 border-t border-gray-200 justify-center">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Miniatura ${index + 1}`}
              className={`w-20 h-16 object-cover rounded-md cursor-pointer border-2 ${
                mainImage === img ? 'border-azul-marino' : 'border-transparent'
              } hover:border-azul-marino transition-all duration-200`}
              onClick={() => setMainImage(img)}
              onError={handleThumbnailError}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery; // Exportar el componente
