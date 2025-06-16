// src/app/vendedor/components/ImageUploadForm.tsx
'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import toast from 'react-hot-toast';
import { uploadImage } from '@/lib/api'; // Asegúrate de que esta ruta sea correcta para tu `lib/api.ts`

interface ImageUploadFormProps {
  // Callback que se llama cuando la imagen se sube exitosamente
  onImageUploadSuccess: (url: string, publicId: string) => void;
  // Callback que se llama si ocurre un error durante la subida
  onImageUploadError: (errorMessage: string) => void;
  // URL de imagen inicial para previsualizar (útil para edición)
  initialImageUrl?: string;
}

const ImageUploadForm: React.FC<ImageUploadFormProps> = ({
  onImageUploadSuccess,
  onImageUploadError,
  initialImageUrl,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [loading, setLoading] = useState<boolean>(false);

  // Efecto para actualizar la previsualización si initialImageUrl cambia (ej. al editar una propiedad)
  useEffect(() => {
    setPreviewUrl(initialImageUrl || null);
  }, [initialImageUrl]);

  // Maneja la selección del archivo
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Crea una URL de objeto para la previsualización
    } else {
      setSelectedFile(null);
      setPreviewUrl(initialImageUrl || null); // Vuelve a la URL inicial si se deselecciona o no hay archivo
    }
  };

  // Maneja la subida del archivo a Cloudinary
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Por favor, selecciona una imagen para subir.');
      return;
    }

    setLoading(true);
    try {
      // Llama a tu función API para subir la imagen
      const result = await uploadImage(selectedFile, 'image');
      onImageUploadSuccess(result.url, result.public_id);
      toast.success('Imagen subida a Cloudinary exitosamente.');
      // No reseteamos selectedFile aquí para mantener la previsualización
      // hasta que el formulario principal de la propiedad se resetea o se envía.
    } catch (error: any) {
      const errorMessage = error.message || 'Error desconocido al subir la imagen.';
      onImageUploadError(errorMessage);
      toast.error(`Error al subir la imagen: ${errorMessage}`);
      setPreviewUrl(initialImageUrl || null); // Vuelve a la previsualización inicial en caso de error
    } finally {
      setLoading(false);
    }
  };

  // Limpieza de Object URLs cuando el componente se desmonte o el previewUrl cambie
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex flex-col items-center p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
      <input
        type="file"
        id="imageUpload" // Agregamos un ID para el label
        accept="image/*"
        onChange={handleFileChange}
        className="hidden" // Oculta el input de archivo por defecto
        disabled={loading}
      />
      
      {/* Etiqueta personalizada para el input de archivo */}
      <label
        htmlFor="imageUpload"
        className="cursor-pointer bg-azul-marino text-white py-2 px-4 rounded-md hover:bg-azul-marino/90 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-oro-arenoso focus:ring-offset-2"
      >
        {selectedFile ? selectedFile.name : 'Seleccionar Imagen'}
      </label>

      {previewUrl && (
        <div className="mt-4">
          <img
            src={previewUrl}
            alt="Previsualización de la imagen"
            className="max-w-xs h-auto rounded-md shadow-md object-cover max-h-48"
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || loading}
        className="mt-4 w-full bg-verde-lima text-grafito font-semibold py-2 px-4 rounded-md hover:bg-verde-lima/90 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-verde-lima focus:ring-offset-2"
      >
        {loading ? 'Subiendo...' : 'Subir Imagen'}
      </button>

      {/* Mensajes de error de Yup si el formulario principal lo usa,
          pero este componente solo maneja la lógica de subida de archivos */}
      {/* errors.imagenPrincipalUrl lo manejará el componente padre (FormPropiedadIndependiente) */}
    </div>
  );
};

export default ImageUploadForm;
