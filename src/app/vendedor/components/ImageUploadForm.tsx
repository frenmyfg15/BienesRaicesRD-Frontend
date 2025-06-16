'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import toast from 'react-hot-toast';
import Image from 'next/image'; // Importar el componente Image
import { uploadImage } from '@/lib/api';

interface ImageUploadFormProps {
  onImageUploadSuccess: (url: string, publicId: string) => void;
  onImageUploadError: (errorMessage: string) => void;
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

  useEffect(() => {
    setPreviewUrl(initialImageUrl || null);
  }, [initialImageUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(initialImageUrl || null);
    }
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) {
      toast.error('Por favor, selecciona una imagen para subir.');
      return;
    }

    setLoading(true);
    try {
      const result = await uploadImage(selectedFile, 'image');
      onImageUploadSuccess(result.url, result.public_id);
      toast.success('Imagen subida a Cloudinary exitosamente.');
    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : 'Error desconocido al subir la imagen.';
      onImageUploadError(errorMessage);
      toast.error(`Error al subir la imagen: ${errorMessage}`);
      setPreviewUrl(initialImageUrl || null);
    } finally {
      setLoading(false);
    }
  };

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
        id="imageUpload"
        accept="image/*"
        onChange={handleFileChange}
        className="sr-only"
        disabled={loading}
        aria-label="Seleccionar archivo de imagen"
      />
      
      <label
        htmlFor="imageUpload"
        className="cursor-pointer bg-azul-marino text-white py-2 px-4 rounded-md hover:bg-azul-marino/90 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-oro-arenoso focus:ring-offset-2"
        aria-label={selectedFile ? `Archivo seleccionado: ${selectedFile.name}` : 'Hacer clic para seleccionar una imagen'}
      >
        {selectedFile ? selectedFile.name : 'Seleccionar Imagen'}
      </label>

      {previewUrl && (
        <div className="mt-4 relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center overflow-hidden rounded-md shadow-md">
          <Image
            src={previewUrl}
            alt="Previsualización de la imagen seleccionada"
            layout="fill"
            objectFit="contain"
            className="rounded-md"
            priority // Priorizar la carga de la imagen de previsualización
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || loading}
        className="mt-4 w-full bg-verde-lima text-grafito font-semibold py-2 px-4 rounded-md hover:bg-verde-lima/90 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-verde-lima focus:ring-offset-2"
        aria-label={loading ? 'Subiendo imagen...' : 'Subir imagen seleccionada'}
      >
        {loading ? 'Subiendo...' : 'Subir Imagen'}
      </button>
    </div>
  );
};

export default ImageUploadForm;