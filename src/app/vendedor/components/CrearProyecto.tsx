'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { createProyecto, uploadImage } from '@/lib/api';
import axios from 'axios'; // <--- ¡AÑADIDO ESTO! Importa axios para el manejo de errores
import { ProyectoData } from '@/app/types/api';

// Esquema de validación para un proyecto
const proyectoSchema = yup.object().shape({
  nombre: yup.string().required('El nombre del proyecto es obligatorio.'),
  slug: yup.string()
    .required('El slug del proyecto es obligatorio.')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug solo puede contener letras minúsculas, números y guiones.'),
  descripcion: yup.string().required('La descripción es obligatoria.').min(20, 'Mínimo 20 caracteres.'),
  ubicacion: yup.string().required('La ubicación es obligatoria.'),
  estado: yup.string().required('El estado es obligatorio.'),
  // === Nuevas validaciones para imágenes y video ===
  // `imagenesFiles` es el array de archivos File[] que se gestiona en el frontend
  imagenesFiles: yup.array()
    .of(
      yup.mixed<File>()
        .test('fileType', 'Solo se permiten imágenes (JPEG, PNG, GIF, WebP).', (value) => {
          return value instanceof File && ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(value.type);
        })
        .test('fileSize', 'Cada imagen debe ser menor a 20MB.', (value) => {
          return value instanceof File && value.size <= 20 * 1024 * 1024; // 20MB, coincide con el backend
        })
    )
    .min(1, 'Debes subir al menos una imagen para el proyecto.')
    .required('Debes subir al menos una imagen para el proyecto.'),
  // `videoFile` es el archivo File | null para el video
  videoFile: yup.mixed()
    .nullable()
    .test('fileType', 'Solo se permiten videos (MP4, WebM, Ogg).', (value) => {
      if (!value) return true; // Si no hay archivo, es válido
      return value instanceof File && ['video/mp4', 'video/webm', 'video/ogg'].includes(value.type);
    })
    .test('fileSize', 'El video debe ser menor a 20MB.', (value) => {
      if (!value) return true;
      return value instanceof File && value.size <= 20 * 1024 * 1024; // 20MB, coincide con el backend
    }),
  // `imagenDestacadaIndex` asegura que se haya seleccionado una imagen destacada
  imagenDestacadaIndex: yup.number()
    .typeError('Debes seleccionar una imagen destacada.')
    .nullable()
    .required('Debes seleccionar una imagen destacada.')
    .min(0, 'Índice de imagen destacada inválido.'),
});

// Interfaz para el tipo de datos del formulario (maneja Files localmente)
interface ProyectoFormData {
  nombre: string;
  slug: string;
  descripcion: string;
  ubicacion: string;
  estado: string;
  // Estos campos NO se registran directamente con `register` de react-hook-form
  // Son manejados por useState y luego se pasan a `setValue` para la validación
  imagenesFiles: File[]; // Los archivos de imagen reales
  videoFile: File | null; // El archivo de video real
  imagenDestacadaIndex: number | null; // Índice de la imagen destacada
  // No necesitamos `usuarioVendedorId` aquí, lo obtenemos de `useAuth`
}

const CrearProyecto: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // === ESTADOS PARA LA GESTIÓN DE ARCHIVOS ===
  // Almacena los objetos File de las imágenes seleccionadas
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // Almacena las URLs de previsualización para las imágenes
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  // Almacena el objeto File del video seleccionado
  const [videoFile, setVideoFile] = useState<File | null>(null);
  // Almacena la URL de previsualización para el video
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  // Índice de la imagen seleccionada como destacada
  const [imagenDestacadaIndex, setImagenDestacadaIndex] = useState<number | null>(null);

  // Referencias a los inputs de tipo 'file' ocultos
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger, // Importar trigger para validar campos específicos
  } = useForm<ProyectoFormData>({
    defaultValues: {
      estado: 'En construcción',
      imagenesFiles: [], // Default empty array for files
      videoFile: null,   // Default null for video file
      imagenDestacadaIndex: null,
    },
  });

  const watchedNombre = watch('nombre');

  // Efecto para generar el slug automáticamente
  useEffect(() => {
    if (watchedNombre) {
      const suggestedSlug = watchedNombre
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
      setValue('slug', suggestedSlug, { shouldValidate: true });
    } else {
      setValue('slug', '', { shouldValidate: true });
    }
  }, [watchedNombre, setValue]);

  // === Efecto para gestionar URLs de previsualización y limpiar memoria ===
  useEffect(() => {
    // Generar previsualizaciones de imágenes
    const newImagePreviews: string[] = imageFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(newImagePreviews);

    // Generar previsualización de video
    const newVideoPreview = videoFile ? URL.createObjectURL(videoFile) : null;
    setVideoPreview(newVideoPreview);

    // Función de limpieza: revoca todas las URLs de objeto para liberar memoria
    return () => {
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));
      if (newVideoPreview) {
        URL.revokeObjectURL(newVideoPreview);
      }
    };
  }, [imageFiles, videoFile]); // Dependencias: se re-ejecuta cuando cambian los archivos

  // Efecto para sincronizar los estados de archivo con react-hook-form para la validación
  useEffect(() => {
    setValue('imagenesFiles', imageFiles, { shouldValidate: true, shouldDirty: true });
    setValue('videoFile', videoFile, { shouldValidate: true, shouldDirty: true });
    setValue('imagenDestacadaIndex', imagenDestacadaIndex, { shouldValidate: true, shouldDirty: true });
  }, [imageFiles, videoFile, imagenDestacadaIndex, setValue]);


  // === FUNCIONES DE GESTIÓN DE IMÁGENES ===

  /**
   * Abre el selector de archivos para añadir una imagen.
   */
  const handleAddImageClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  /**
   * Maneja el cambio del input de imagen y añade el archivo al estado.
   * @param event El evento de cambio del input.
   */
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Esperamos un solo archivo

    if (file) {
      // Validaciones básicas de tipo y tamaño (Yup también las hace, pero esto da feedback inmediato)
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        toast.error('Solo se permiten imágenes (JPEG, PNG, GIF, WebP).');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error('Cada imagen debe ser menor a 20MB.');
        return;
      }

      setImageFiles(prevFiles => [...prevFiles, file]);
    }
    // Limpiar el valor del input para permitir seleccionar el mismo archivo de nuevo
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    trigger('imagenesFiles'); // Forzar la validación de yup
  };

  /**
   * Elimina una imagen del array por su índice.
   * @param index El índice de la imagen a eliminar.
   */
  const handleRemoveImage = (index: number) => {
    setImageFiles(prevFiles => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);
      // Ajustar el índice de imagen destacada si la eliminada era la destacada
      if (imagenDestacadaIndex === index) {
        setImagenDestacadaIndex(null);
      } else if (imagenDestacadaIndex !== null && index < imagenDestacadaIndex) {
        // Si se elimina una imagen anterior a la destacada, decrementar el índice destacada
        setImagenDestacadaIndex(prevIndex => (prevIndex !== null ? prevIndex - 1 : null));
      }
      return updatedFiles;
    });
    trigger('imagenesFiles'); // Forzar la validación de yup
  };

  /**
   * Abre el selector de archivos para añadir un video.
   */
  const handleAddVideoClick = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  /**
   * Maneja el cambio del input de video y establece el archivo.
   * @param event El evento de cambio del input.
   */
  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validaciones de video
      if (!['video/mp4', 'video/webm', 'video/ogg'].includes(file.type)) {
        toast.error('Solo se permiten videos (MP4, WebM, Ogg).');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error('El video debe ser menor a 20MB.');
        return;
      }
      setVideoFile(file);
    } else {
      setVideoFile(null);
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = ''; // Limpiar el input
    }
    trigger('videoFile'); // Forzar la validación de yup
  };

  /**
   * Elimina el video seleccionado.
   */
  const handleRemoveVideo = () => {
    setVideoFile(null);
    trigger('videoFile'); // Forzar la validación de yup
  };


  const onSubmit = async (data: ProyectoFormData) => {
    if (!isAuthenticated || !user || user.rol !== 'VENDEDOR') {
      toast.error('Debes iniciar sesión como vendedor.');
      router.push('/auth/login');
      return;
    }

    // Validación extra para asegurar que las imágenes y el índice destacada están listos
    if (!data.imagenesFiles || data.imagenesFiles.length === 0) {
      toast.error('Debes subir al menos una imagen para el proyecto.');
      return;
    }
    if (data.imagenDestacadaIndex === null || !data.imagenesFiles[data.imagenDestacadaIndex]) {
      toast.error('Debes seleccionar una imagen destacada.');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Creando proyecto...');

    try {
      // 1. Subir todas las imágenes del proyecto
      toast.loading('Subiendo imágenes del proyecto...', { id: toastId });
      // === CAMBIO AQUÍ: Pasar 'image' como tipo de archivo ===
      const uploadedImageResponses = await Promise.all(imageFiles.map(file => uploadImage(file, 'image')));
      const imageUrls = uploadedImageResponses.map(img => img.url);

      // 2. Obtener la URL de la imagen destacada
      const imagenDestacadaUrl = imageUrls[data.imagenDestacadaIndex];

      // 3. Subir el video si existe
      let videoUrl: string | null = null;
      if (videoFile) {
        toast.loading('Subiendo video del proyecto...', { id: toastId });
        // === CAMBIO AQUÍ: Pasar 'video' como tipo de archivo ===
        const uploadedVideoResponse = await uploadImage(videoFile, 'video');
        videoUrl = uploadedVideoResponse.url;
      }

      toast.success('Archivos multimedia subidos exitosamente.', { id: toastId });

      // 4. Preparar los datos del proyecto para enviar al backend
      const formattedSlug = data.slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      const proyectoData: ProyectoData = {
        nombre: data.nombre,
        slug: formattedSlug,
        descripcion: data.descripcion,
        ubicacion: data.ubicacion,
        estado: data.estado,
        imagenDestacada: imagenDestacadaUrl, // La URL de la imagen destacada
        usuarioVendedorId: user.id,
        videoUrl: videoUrl, // La URL del video
        imagenes: imageUrls, // Todas las URLs de las imágenes (para una posible galería del proyecto)
        // No se incluyen `imagenesFiles`, `videoFile`, `imagenDestacadaIndex` porque son para el frontend
      };

      // 5. Crear el proyecto en el backend
      toast.loading('Guardando datos del proyecto...', { id: toastId });
      const response = await createProyecto(proyectoData);
      toast.success('Proyecto creado con éxito.', { id: toastId });

      // Resetear el formulario y los estados
      reset();
      setImageFiles([]);
      setImagePreviews([]);
      setVideoFile(null);
      setVideoPreview(null);
      setImagenDestacadaIndex(null);
      router.push('/vendedor/productos'); // Redirige a la página de productos del vendedor

    } catch (err: unknown) { // Cambiado 'any' a 'unknown' para mejor tipado
      console.error('Error al crear proyecto:', err);
      let errorMessage = 'Error al crear proyecto. Intenta de nuevo.';
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.mensaje || err.response.data?.error || errorMessage;
      }
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  // El botón de enviar estará deshabilitado si el formulario está en proceso
  const isFormDisabled = isProcessing;

  if (isLoading) return <div className="p-4 text-center text-grafito">Cargando formulario de proyecto...</div>;

  if (!isAuthenticated || user?.rol !== 'VENDEDOR') {
    return <div className="p-4 text-center text-red-600">Acceso denegado. No tienes permiso para crear proyectos. Por favor, inicia sesión como vendedor.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl border border-oro-arenoso">
      <h2 className="text-3xl font-bold text-grafito text-center mb-6">
        Crear Nuevo Proyecto
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Campos de texto generales */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-grafito mb-1">Nombre</label>
          <input
            id="nombre"
            type="text"
            {...register('nombre')}
            className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-azul-marino transition duration-200 ease-in-out ${
              errors.nombre ? 'border-red-500' : 'border-oro-arenoso'
            }`}
            disabled={isFormDisabled}
          />
          {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>}
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-grafito mb-1">Slug</label>
          <input
            id="slug"
            type="text"
            {...register('slug')}
            className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-azul-marino transition duration-200 ease-in-out ${
              errors.slug ? 'border-red-500' : 'border-oro-arenoso'
            }`}
            disabled={isFormDisabled}
          />
          {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
        </div>
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-grafito mb-1">Descripción</label>
          <textarea
            id="descripcion"
            rows={4}
            {...register('descripcion')}
            className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-azul-marino transition duration-200 ease-in-out ${
              errors.descripcion ? 'border-red-500' : 'border-oro-arenoso'
            }`}
            disabled={isFormDisabled}
          />
          {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion.message}</p>}
        </div>
        <div>
          <label htmlFor="ubicacion" className="block text-sm font-medium text-grafito mb-1">Ubicación</label>
          <input
            id="ubicacion"
            type="text"
            {...register('ubicacion')}
            className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-azul-marino transition duration-200 ease-in-out ${
              errors.ubicacion ? 'border-red-500' : 'border-oro-arenoso'
            }`}
            disabled={isFormDisabled}
          />
          {errors.ubicacion && <p className="mt-1 text-sm text-red-600">{errors.ubicacion.message}</p>}
        </div>
        <div>
          <label htmlFor="estado" className="block text-sm font-medium text-grafito mb-1">Estado</label>
          <select
            id="estado"
            {...register('estado')}
            className={`w-full p-3 rounded-md border text-grafito focus:outline-none focus:ring-2 focus:ring-azul-marino transition duration-200 ease-in-out ${
              errors.estado ? 'border-red-500' : 'border-oro-arenoso'
            }`}
            disabled={isFormDisabled}
          >
            <option value="En construcción">En construcción</option>
            <option value="Terminado">Terminado</option>
            <option value="Preventa">Preventa</option>
          </select>
          {errors.estado && <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>}
        </div>

        {/* Sección de Carga de Imágenes */}
        <div className="border border-oro-arenoso rounded-lg p-4 bg-white shadow-sm">
          <label className="block text-lg font-bold text-grafito mb-2">
            Imágenes del Proyecto
          </label>
          {/* Input de archivo oculto para imágenes */}
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/jpeg, image/png, image/gif, image/webp"
            disabled={isFormDisabled}
          />
          {/* Botón personalizado para agregar imagen */}
          <button
            type="button"
            onClick={handleAddImageClick}
            className="w-full px-4 py-3 rounded-md bg-oro-arenoso text-white font-semibold shadow-sm hover:bg-oro-brillante focus:outline-none focus:ring-2 focus:ring-oro-arenoso focus:ring-offset-2 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isFormDisabled}
          >
            Agregar Imagen
          </button>
          {/* Mensajes de error de validación para `imagenesFiles` y `imagenDestacadaIndex` */}
          {errors.imagenesFiles && (
            <p className="mt-2 text-sm text-red-600">{errors.imagenesFiles.message}</p>
          )}
          {errors.imagenDestacadaIndex && (
            <p className="mt-2 text-sm text-red-600">{errors.imagenDestacadaIndex.message}</p>
          )}

          {/* Previsualizaciones de Imágenes */}
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden shadow-md group border border-gray-200">
                  <img
                    src={src}
                    alt={`Previsualización ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  {/* Botones de acción */}
                  <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out">
                    {/* Botón Eliminar */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="bg-red-600 text-white rounded-full p-1 leading-none text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                      aria-label="Eliminar imagen"
                      disabled={isFormDisabled}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {/* Botón Destacada */}
                    <button
                      type="button"
                      onClick={() => setImagenDestacadaIndex(index)}
                      className={`text-white rounded-full p-1 leading-none text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                        imagenDestacadaIndex === index ? 'bg-blue-600' : 'bg-gray-500'
                      }`}
                      aria-label="Marcar como imagen destacada"
                      disabled={isFormDisabled}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.683-1.536 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.78.565-1.835-.197-1.536-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.92 8.72a1 1 0 01.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sección de Carga de Video */}
        <div className="border border-oro-arenoso rounded-lg p-4 bg-white shadow-sm">
          <label className="block text-lg font-bold text-grafito mb-2">
            Video del Proyecto (Opcional)
          </label>
          {/* Input de archivo oculto para video */}
          <input
            type="file"
            ref={videoInputRef}
            onChange={handleVideoChange}
            className="hidden"
            accept="video/mp4, video/webm, video/ogg"
            disabled={isFormDisabled}
          />
          {/* Botón personalizado para agregar video */}
          <button
            type="button"
            onClick={handleAddVideoClick}
            className="w-full px-4 py-3 rounded-md bg-naranja text-white font-semibold shadow-sm hover:bg-naranja-oscuro focus:outline-none focus:ring-2 focus:ring-naranja focus:ring-offset-2 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isFormDisabled || videoFile !== null} // Deshabilita si ya hay un video
          >
            {videoFile ? 'Cambiar Video' : 'Agregar Video'}
          </button>
          {errors.videoFile && (
            <p className="mt-2 text-sm text-red-600">{errors.videoFile.message}</p>
          )}

          {/* Previsualización de Video */}
          {videoPreview && (
            <div className="mt-4 relative rounded-lg overflow-hidden shadow-md border border-gray-200">
              <video src={videoPreview} controls className="w-full h-48 object-cover rounded-lg" />
              {/* Botón para eliminar video */}
              <button
                type="button"
                onClick={handleRemoveVideo}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 leading-none text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                aria-label="Eliminar video"
                disabled={isFormDisabled}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Botón de Enviar */}
        <button
          type="submit"
          className="w-full px-6 py-3 rounded-md bg-azul-marino text-white font-semibold text-lg shadow-md hover:bg-azul-oscuro focus:outline-none focus:ring-2 focus:ring-azul-marino focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isFormDisabled}
        >
          {isProcessing ? 'Procesando...' : 'Crear Proyecto'}
        </button>
      </form>
    </div>
  );
};

export default CrearProyecto;
