'use client';

import React, { useState, useEffect, useRef } from 'react'; // Importa useRef
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Importa las funciones API necesarias para crear propiedades, subir imágenes y obtener proyectos
import {
  createPropiedad,
  uploadImage,
  getProyectos, // Para obtener la lista de proyectos
  PropiedadData,
  // === CAMBIO CLAVE AQUÍ: De UploadImageResponse a UploadResponse ===
  UploadResponse, // Cambiado de UploadImageResponse
  ProyectoResponse // Tipo para la respuesta de un proyecto
} from '@/lib/api';

// Esquema de validación para una propiedad
const propiedadSchema = yup.object().shape({
  nombre: yup.string().required('El nombre de la propiedad es obligatorio.'),
  slug: yup.string()
    .required('El slug de la propiedad es obligatorio (ej. "casa-en-santo-domingo").')
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug solo puede contener letras minúsculas, números y guiones. No espacios.'),
  tipo: yup.string().required('El tipo de propiedad es obligatorio (ej. "Casa", "Apartamento").'),
  precio: yup.number()
    .typeError('El precio debe ser un número.')
    .positive('El precio debe ser un valor positivo.')
    .required('El precio es obligatorio.'),
  habitaciones: yup.number()
    .typeError('Las habitaciones deben ser un número entero.')
    .integer('Las habitaciones deben ser un número entero.')
    .min(0, 'No puede haber habitaciones negativas.')
    .optional()
    .nullable(),
  baños: yup.number()
    .typeError('Los baños deben ser un número entero.')
    .integer('Los baños deben ser un número entero.')
    .min(0, 'No puede haber baños negativas.')
    .optional()
    .nullable(),
  parqueos: yup.number() // Nuevo campo
    .typeError('Los parqueos deben ser un número entero.')
    .integer('Los parqueos deben ser un número entero.')
    .min(0, 'No puede haber parqueos negativos.')
    .optional()
    .nullable(),
  metros2: yup.number()
    .typeError('Los m² deben ser un número.')
    .positive('Los m² deben ser un valor positivo.')
    .optional()
    .nullable(),
  estado: yup.string().required('El estado de la propiedad es obligatorio (ej. "En venta", "Alquiler").'),
  descripcion: yup.string().required('La descripción es obligatoria.').min(20, 'La descripción debe tener al menos 20 caracteres.'),
  ubicacion: yup.string().required('La ubicación es obligatoria.'),
  nivel: yup.number() // Nuevo campo
    .typeError('El nivel debe ser un número entero.')
    .integer('El nivel debe ser un número entero.')
    .min(0, 'El nivel no puede ser negativo.')
    .optional()
    .nullable(),
  ascensor: yup.boolean() // Nuevo campo
    .optional()
    .nullable(),
  amueblado: yup.boolean() // Nuevo campo
    .optional()
    .nullable(),
  mantenimiento: yup.number() // Nuevo campo
    .typeError('El mantenimiento debe ser un número.')
    .positive('El mantenimiento debe ser un valor positivo.')
    .optional()
    .nullable(),
  anoConstruccion: yup.number() // Nuevo campo
    .typeError('El año de construcción debe ser un número entero.')
    .integer('El año de construcción debe ser un número entero.')
    .min(1900, 'El año de construcción es inválido.')
    .max(new Date().getFullYear(), `El año de construcción no puede ser futuro.`)
    .optional()
    .nullable(),
  gastosLegalesIncluidos: yup.boolean() // Nuevo campo
    .optional()
    .nullable(),
  disponibleDesde: yup.string() // Nuevo campo (string para input type="date")
    .optional()
    .nullable(),
  videoUrl: yup.string() // Nuevo campo
    .url('Debe ser una URL válida para el video.')
    .optional()
    .nullable(),
  tipoPropiedad: yup.string() // Nuevo campo (ej. Residencial, Comercial, Turístico)
    .optional()
    .nullable(),
  // === MODIFICACIÓN CLAVE AQUÍ: Las imágenes ahora son un array de File ===
  imagenes: yup.array()
    .of(
      yup.mixed<File>()
        .test('fileType', 'Solo se permiten imágenes (JPEG, PNG, GIF, WebP).', (value) => {
          return value instanceof File && ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(value.type);
        })
        .test('fileSize', 'Cada imagen debe ser menor a 5MB.', (value) => {
          return value instanceof File && value.size <= 5 * 1024 * 1024; // 5MB
        })
    )
    .min(1, 'Debes subir al menos una imagen.')
    .required('Debes subir al menos una imagen.'), // Asegura que no sea null/undefined
  // Campo opcional para asignar a un proyecto
  proyectoId: yup.number()
    .typeError('El ID del proyecto debe ser un número.')
    .integer('El ID del proyecto debe ser un número entero.')
    .positive('El ID del proyecto debe ser un valor positivo.')
    .optional()
    .nullable(), // Permite que sea nulo si no se asigna a un proyecto
});

// Interfaz para el tipo de datos de una propiedad que se maneja en el formulario
interface PropiedadFormData {
  nombre: string;
  slug: string;
  tipo: string;
  precio: number;
  habitaciones: number | null;
  baños: number | null;
  parqueos: number | null; // Nuevo
  metros2: number | null;
  estado: string;
  descripcion: string;
  ubicacion: string;
  nivel: number | null; // Nuevo
  ascensor: boolean | null; // Nuevo
  amueblado: boolean | null; // Nuevo
  mantenimiento: number | null; // Nuevo
  anoConstruccion: number | null; // Nuevo
  gastosLegalesIncluidos: boolean | null; // Nuevo
  disponibleDesde: string | null; // Nuevo
  videoUrl: string | null; // Nuevo
  tipoPropiedad: string | null; // Nuevo
  // === MODIFICACIÓN CLAVE AQUÍ: Tipo de `imagenes` ahora es `File[]` ===
  imagenes: File[];
  proyectoId: number | null; // ID del proyecto opcional
}

const CrearPropiedad: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // === ESTADOS PARA LA GESTIÓN DE IMÁGENES ===
  // Almacena los objetos File de las imágenes seleccionadas
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // Almacena las URLs de previsualización para el display
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  // Referencia al input de tipo 'file' oculto para activarlo programáticamente
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingImages, setIsUploadingImages] = useState(false); // Estado de carga de imágenes
  const [isSavingProperty, setIsSavingProperty] = useState(false); // Estado de guardado de propiedad
  const [projects, setProjects] = useState<ProyectoResponse[]>([]); // Estado para la lista de proyectos

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue, // Usamos setValue para actualizar el campo 'imagenes' en react-hook-form
  } = useForm<PropiedadFormData>({
    resolver: yupResolver(propiedadSchema),
    defaultValues: {
      estado: 'En venta',
      imagenes: [], // Asegurarse de que el default sea un array vacío
      habitaciones: null,
      baños: null,
      parqueos: null,
      metros2: null,
      nivel: null,
      ascensor: false,
      amueblado: false,
      mantenimiento: null,
      anoConstruccion: null,
      gastosLegalesIncluidos: false,
      disponibleDesde: null,
      videoUrl: null,
      tipoPropiedad: null,
      proyectoId: null,
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

  // === EFECTO DE LIMPIEZA DE URLS DE PREVISUALIZACIÓN ===
  // Revoca los Object URLs cuando el componente se desmonta o las previsualizaciones se resetean.
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]); // Dependencia: re-ejecuta la limpieza si `imagePreviews` cambia de referencia (ej. un reset total)


  // Efecto para cargar los proyectos existentes
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProyectos(user?.id); // Obtener solo los proyectos del vendedor autenticado
        setProjects(response.proyectos);
      } catch (error) {
        console.error('Error al cargar los proyectos:', error);
        toast.error('Error al cargar la lista de proyectos.');
      }
    };

    if (isAuthenticated && user?.rol === 'VENDEDOR') {
      fetchProjects();
    }
  }, [isAuthenticated, user]);


  // === FUNCIONES DE GESTIÓN DE IMÁGENES ===

  /**
   * Abre el selector de archivos al hacer clic en el botón "Agregar Imagen".
   */
  const handleAddImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Maneja la selección de una imagen individual y la añade al array.
   * Realiza validación básica de tipo y tamaño de archivo.
   * @param event El evento de cambio del input de archivo.
   */
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Solo esperamos un archivo

    if (file) {
      // Validación cliente-lado: tipo de archivo
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        toast.error('Solo se permiten imágenes (JPEG, PNG, GIF, WebP).');
        // Limpiar el input para permitir seleccionar de nuevo el mismo archivo si es necesario
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      // Validación cliente-lado: tamaño de archivo (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Cada imagen debe ser menor a 5MB.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Actualiza el estado `imageFiles` con el nuevo archivo
      setImageFiles(prevFiles => {
        const newFiles = [...prevFiles, file];
        // Actualiza el campo 'imagenes' en react-hook-form para que se valide
        // === CAMBIO AQUÍ: Pasando 'image' como tipo de archivo para uploadImage ===
        setValue('imagenes', newFiles, { shouldValidate: true, shouldDirty: true });
        return newFiles;
      });

      // Crea y actualiza el estado `imagePreviews` con la URL de previsualización
      const newPreview = URL.createObjectURL(file);
      setImagePreviews(prevPreviews => [...prevPreviews, newPreview]);
    }

    // Limpiar el valor del input de archivo para permitir al usuario seleccionar el mismo archivo de nuevo si lo desea
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Elimina una imagen del array por su índice.
   * También revoca la URL de previsualización para liberar memoria.
   * @param index El índice de la imagen a eliminar.
   */
  const handleRemoveImage = (index: number) => {
    setImageFiles(prevFiles => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);
      // Actualiza el campo 'imagenes' en react-hook-form
      setValue('imagenes', updatedFiles, { shouldValidate: true, shouldDirty: true });
      return updatedFiles;
    });

    setImagePreviews(prevPreviews => {
      const urlToRemove = prevPreviews[index];
      URL.revokeObjectURL(urlToRemove); // Limpia la URL de previsualización para evitar fugas de memoria
      return prevPreviews.filter((_, i) => i !== index);
    });
  };

  // === FIN FUNCIONES DE GESTIÓN DE IMÁGENES ===

  const onSubmit = async (data: PropiedadFormData) => {
    if (!isAuthenticated || !user || user.rol !== 'VENDEDOR') {
      toast.error('No tienes autorización para subir propiedades. Por favor, inicia sesión como vendedor.');
      router.push('/auth/login');
      return;
    }

    // 1. Validar imágenes (ahora `data.imagenes` ya contendrá el array de `File`s gestionado)
    if (data.imagenes.length === 0) {
      toast.error('Debes subir al menos una imagen para la propiedad.');
      return;
    }

    setIsUploadingImages(true);
    const mainToastId = toast.loading('Creando propiedad...'); // Toast principal de carga
    let uploadedImageUrls: string[] = [];

    try {
      // 2. Subir cada imagen a Cloudinary a través del backend
      toast.loading('Subiendo imágenes a Cloudinary...', { id: mainToastId });
      for (let i = 0; i < data.imagenes.length; i++) {
        const file = data.imagenes[i]; // `data.imagenes` ahora es el array de `File`s
        // === CAMBIO CLAVE AQUÍ: Pasando 'image' como tipo de archivo para uploadImage ===
        const uploadResponse: UploadResponse = await uploadImage(file, 'image'); // Usar UploadResponse
        uploadedImageUrls.push(uploadResponse.url);
      }
      toast.success('Imágenes subidas exitosamente.', { id: mainToastId });

      // 3. Preparar los datos de la propiedad para enviar al backend
      const formattedSlug = data.slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setValue('slug', formattedSlug); // Ya se hace en useEffect, pero lo mantengo aquí por seguridad

      // Convertir 'disponibleDesde' a ISO string si existe
      const disponibleDesdeISO = data.disponibleDesde ? new Date(data.disponibleDesde).toISOString() : null;

      const propiedadDataToSend: PropiedadData = {
        nombre: data.nombre,
        slug: formattedSlug,
        tipo: data.tipo,
        precio: data.precio,
        habitaciones: data.habitaciones,
        baños: data.baños,
        parqueos: data.parqueos,
        metros2: data.metros2,
        estado: data.estado,
        descripcion: data.descripcion,
        ubicacion: data.ubicacion,
        nivel: data.nivel,
        ascensor: data.ascensor,
        amueblado: data.amueblado,
        mantenimiento: data.mantenimiento,
        anoConstruccion: data.anoConstruccion,
        gastosLegalesIncluidos: data.gastosLegalesIncluidos,
        disponibleDesde: disponibleDesdeISO,
        videoUrl: data.videoUrl,
        tipoPropiedad: data.tipoPropiedad,
        usuarioVendedorId: user.id!,
        imageUrls: uploadedImageUrls, // Aquí se pasan las URLs subidas
        // `imagenes` se excluye explícitamente ya que es un File[] y no parte de PropiedadData del backend
        proyectoId: data.proyectoId || null,
      };

      // 4. Crear la propiedad en el backend
      setIsSavingProperty(true); // Activa estado de guardado
      toast.loading('Guardando datos de la propiedad...', { id: mainToastId });
      await createPropiedad(propiedadDataToSend);
      toast.success('¡Propiedad creada exitosamente!', { id: mainToastId });

      // Resetear el formulario y la gestión de imágenes
      reset();
      // Revocar todas las URLs de previsualización que queden antes de limpiar los arrays
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImageFiles([]);
      setImagePreviews([]);
      router.push('/vendedor/productos'); // Redirige a la página de productos del vendedor

    } catch (error: unknown) {
      console.error('Error al crear propiedad:', error);
      let errorMessage = 'Error al crear propiedad. Intenta de nuevo.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.mensaje || error.response.data?.error || errorMessage;
      }
      toast.error(errorMessage, { id: mainToastId });
    } finally {
      setIsUploadingImages(false);
      setIsSavingProperty(false);
    }
  };

  // El botón de enviar estará deshabilitado si el formulario está enviando,
  // subiendo imágenes o guardando la propiedad.
  const isFormDisabled = isSubmitting || isUploadingImages || isSavingProperty;

  if (isLoading) {
    return <div className="min-h-[400px] flex items-center justify-center text-grafito">Cargando formulario de propiedad...</div>;
  }

  if (!isAuthenticated || user?.rol !== 'VENDEDOR') {
    return (
      <div className="text-center p-4 text-red-600">
        No tienes permiso para crear propiedades. Por favor, inicia sesión como vendedor.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 rounded-lg shadow-sm border border-oro-arenoso bg-white max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-grafito text-center mb-6">
        Crear Nueva Propiedad
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Campo: Nombre de la Propiedad y Slug */}
        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
            <label htmlFor="nombre" className="block text-sm font-medium text-grafito mb-1">
              Nombre de la Propiedad
            </label>
            <input
              id="nombre"
              type="text"
              {...register('nombre')}
              placeholder="Ej: Amplio apartamento"
              className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
                errors.nombre ? 'border-red-500' : 'border-oro-arenoso'
              }`}
              aria-invalid={errors.nombre ? "true" : "false"}
              disabled={isFormDisabled}
            />
            {errors.nombre && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.nombre.message as string}
              </p>
            )}
          </div>
          <div className="w-full md:w-1/2 px-2">
            <label htmlFor="slug" className="block text-sm font-medium text-grafito mb-1">
              Slug (URL amigable)
            </label>
            <input
              id="slug"
              type="text"
              {...register('slug')}
              placeholder="ej: apartamento-centro-santo-domingo"
              className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
                errors.slug ? 'border-red-500' : 'border-oro-arenoso'
              }`}
              aria-invalid={errors.slug ? "true" : "false"}
              disabled={isFormDisabled}
            />
            {errors.slug && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.slug.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Campo: Tipo de Propiedad y Precio (USD) */}
        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
            <label htmlFor="tipo" className="block text-sm font-medium text-grafito mb-1">
              Tipo de Propiedad
            </label>
            <select
              id="tipo"
              {...register('tipo')}
              className={`w-full p-3 rounded-md border text-grafito focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
                errors.tipo ? 'border-red-500' : 'border-oro-arenoso'
              }`}
              aria-invalid={errors.tipo ? "true" : "false"}
              disabled={isFormDisabled}
            >
              <option value="">Selecciona un tipo</option>
              <option value="Casa">Casa</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Solar">Solar</option>
              <option value="Local Comercial">Local Comercial</option>
              <option value="Villa">Villa</option>
            </select>
            {errors.tipo && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.tipo.message as string}
              </p>
            )}
          </div>
          <div className="w-full md:w-1/2 px-2">
            <label htmlFor="precio" className="block text-sm font-medium text-grafito mb-1">
              Precio (USD)
            </label>
            <input
              id="precio"
              type="number"
              step="0.01"
              {...register('precio')}
              placeholder="Ej: 150000.00"
              className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
                errors.precio ? 'border-red-500' : 'border-oro-arenoso'
              }`}
              aria-invalid={errors.precio ? "true" : "false"}
              disabled={isFormDisabled}
            />
            {errors.precio && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.precio.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Campo: Habitaciones, Baños y Parqueos */}
        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
            <label htmlFor="habitaciones" className="block text-sm font-medium text-grafito mb-1">
              Habitaciones
            </label>
            <input
              id="habitaciones"
              type="number"
              {...register('habitaciones')}
              placeholder="Ej: 3"
              className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
                errors.habitaciones ? 'border-red-500' : 'border-oro-arenoso'
              }`}
              aria-invalid={errors.habitaciones ? "true" : "false"}
              disabled={isFormDisabled}
            />
            {errors.habitaciones && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.habitaciones.message as string}
              </p>
            )}
          </div>
          <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
            <label htmlFor="baños" className="block text-sm font-medium text-grafito mb-1">
              Baños
            </label>
            <input
              id="baños"
              type="number"
              {...register('baños')}
              placeholder="Ej: 2"
              className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
                errors.baños ? 'border-red-500' : 'border-oro-arenoso'
              }`}
              aria-invalid={errors.baños ? "true" : "false"}
              disabled={isFormDisabled}
            />
            {errors.baños && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.baños.message as string}
              </p>
            )}
          </div>
          <div className="w-full md:w-1/3 px-2">
            <label htmlFor="parqueos" className="block text-sm font-medium text-grafito mb-1">
              Parqueos
            </label>
            <input
              id="parqueos"
              type="number"
              {...register('parqueos')}
              placeholder="Ej: 2"
              className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
                errors.parqueos ? 'border-red-500' : 'border-oro-arenoso'
              }`}
              aria-invalid={errors.parqueos ? "true" : "false"}
              disabled={isFormDisabled}
            />
            {errors.parqueos && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.parqueos.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Campo: Metros Cuadrados (m²), Nivel y Año de Construcción */}
        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
            <label htmlFor="metros2" className="block text-sm font-medium text-grafito mb-1">
              Metros Cuadrados (m²)
            </label>
            <input
              id="metros2"
              type="number"
              step="0.01"
              {...register('metros2')}
              placeholder="Ej: 120.50"
              className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
                errors.metros2 ? 'border-red-500' : 'border-oro-arenoso'
              }`}
              aria-invalid={errors.metros2 ? "true" : "false"}
              disabled={isFormDisabled}
            />
            {errors.metros2 && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.metros2.message as string}
              </p>
            )}
          </div>
          <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
            <label htmlFor="nivel" className="block text-sm font-medium text-grafito mb-1">
              Nivel
            </label>
            <input
              id="nivel"
              type="number"
              {...register('nivel')}
              placeholder="Ej: 5"
              className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
                errors.nivel ? 'border-red-500' : 'border-oro-arenoso'
              }`}
              aria-invalid={errors.nivel ? "true" : "false"}
              disabled={isFormDisabled}
            />
            {errors.nivel && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.nivel.message as string}
              </p>
            )}
          </div>
          <div className="w-full md:w-1/3 px-2">
            <label htmlFor="anoConstruccion" className="block text-sm font-medium text-grafito mb-1">
              Año de Construcción
            </label>
            <input
              id="anoConstruccion"
              type="number"
              {...register('anoConstruccion')}
              placeholder="Ej: 2020"
              className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
                errors.anoConstruccion ? 'border-red-500' : 'border-oro-arenoso'
              }`}
              aria-invalid={errors.anoConstruccion ? "true" : "false"}
              disabled={isFormDisabled}
            />
            {errors.anoConstruccion && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.anoConstruccion.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Campo: Estado y Tipo de Propiedad */}
        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
            <label htmlFor="estado" className="block text-sm font-medium text-grafito mb-1">
              Estado
            </label>
            <select
              id="estado"
              {...register('estado')}
              className={`w-full p-3 rounded-md border text-grafito focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
                errors.estado ? 'border-red-500' : 'border-oro-arenoso'
              }`}
              aria-invalid={errors.estado ? "true" : "false"}
              disabled={isFormDisabled}
            >
              <option value="">Selecciona un estado</option>
              <option value="En venta">En venta</option>
              <option value="Alquiler">Alquiler</option>
              <option value="Vendido">Vendido</option>
              <option value="Alquilado">Alquilado</option>
            </select>
            {errors.estado && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.estado.message as string}
              </p>
            )}
          </div>
          <div className="w-full md:w-1/2 px-2">
            <label htmlFor="tipoPropiedad" className="block text-sm font-medium text-grafito mb-1">
              Tipo de Propiedad (ej. Residencial)
            </label>
            <input
              id="tipoPropiedad"
              type="text"
              {...register('tipoPropiedad')}
              placeholder="Ej: Residencial, Comercial"
              className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
                errors.tipoPropiedad ? 'border-red-500' : 'border-oro-arenoso'
              }`}
              aria-invalid={errors.tipoPropiedad ? "true" : "false"}
              disabled={isFormDisabled}
            />
            {errors.tipoPropiedad && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.tipoPropiedad.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Campo: Ubicación */}
        <div>
          <label htmlFor="ubicacion" className="block text-sm font-medium text-grafito mb-1">
            Ubicación
          </label>
          <input
            id="ubicacion"
            type="text"
            {...register('ubicacion')}
            placeholder="Ej: Santo Domingo, Piantini"
            className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
              errors.ubicacion ? 'border-red-500' : 'border-oro-arenoso'
            }`}
            aria-invalid={errors.ubicacion ? "true" : "false"}
            disabled={isFormDisabled}
          />
          {errors.ubicacion && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {errors.ubicacion.message as string}
            </p>
          )}
        </div>

        {/* Campo: Mantenimiento y Disponible Desde */}
        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
            <label htmlFor="mantenimiento" className="block text-sm font-medium text-grafito mb-1">
              Mantenimiento Mensual (USD)
            </label>
            <input
              id="mantenimiento"
              type="number"
              step="0.01"
              {...register('mantenimiento')}
              placeholder="Ej: 150.00"
              className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
                errors.mantenimiento ? 'border-red-500' : 'border-oro-arenoso'
              }`}
              aria-invalid={errors.mantenimiento ? "true" : "false"}
              disabled={isFormDisabled}
            />
            {errors.mantenimiento && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.mantenimiento.message as string}
              </p>
            )}
          </div>
          <div className="w-full md:w-1/2 px-2">
            <label htmlFor="disponibleDesde" className="block text-sm font-medium text-grafito mb-1">
              Disponible Desde
            </label>
            <input
              id="disponibleDesde"
              type="date"
              {...register('disponibleDesde')}
              className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
                errors.disponibleDesde ? 'border-red-500' : 'border-oro-arenoso'
              }`}
              aria-invalid={errors.disponibleDesde ? "true" : "false"}
              disabled={isFormDisabled}
            />
            {errors.disponibleDesde && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.disponibleDesde.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Campo: Video URL */}
        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium text-grafito mb-1">
            URL del Video (Tour Virtual)
          </label>
          <input
            id="videoUrl"
            type="url"
            {...register('videoUrl')}
            placeholder="Ej: https://www.youtube.com/watch?v=..."
            className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
              errors.videoUrl ? 'border-red-500' : 'border-oro-arenoso'
            }`}
            aria-invalid={errors.videoUrl ? "true" : "false"}
            disabled={isFormDisabled}
          />
          {errors.videoUrl && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {errors.videoUrl.message as string}
            </p>
          )}
        </div>

        {/* Checkboxes para Ascensor, Amueblado, Gastos Legales Incluidos */}
        <div className="flex flex-wrap -mx-2">
          <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
            <div className="flex items-center p-3 rounded-md border border-oro-arenoso bg-white">
              <input
                id="ascensor"
                type="checkbox"
                {...register('ascensor')}
                className="h-5 w-5 text-azul-marino rounded border-gray-300 focus:ring-azul-marino"
                disabled={isFormDisabled}
              />
              <label htmlFor="ascensor" className="ml-2 block text-sm font-medium text-grafito">
                Ascensor
              </label>
            </div>
          </div>
          <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
            <div className="flex items-center p-3 rounded-md border border-oro-arenoso bg-white">
              <input
                id="amueblado"
                type="checkbox"
                {...register('amueblado')}
                className="h-5 w-5 text-azul-marino rounded border-gray-300 focus:ring-azul-marino"
                disabled={isFormDisabled}
              />
              <label htmlFor="amueblado" className="ml-2 block text-sm font-medium text-grafito">
                Amueblado
              </label>
            </div>
          </div>
          <div className="w-full md:w-1/3 px-2">
            <div className="flex items-center p-3 rounded-md border border-oro-arenoso bg-white">
              <input
                id="gastosLegalesIncluidos"
                type="checkbox"
                {...register('gastosLegalesIncluidos')}
                className="h-5 w-5 text-azul-marino rounded border-gray-300 focus:ring-azul-marino"
                disabled={isFormDisabled}
              />
              <label htmlFor="gastosLegalesIncluidos" className="ml-2 block text-sm font-medium text-grafito">
                Gastos Legales Incluidos
              </label>
            </div>
          </div>
        </div>

        {/* Campo: Descripción */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-grafito mb-1">
            Descripción Detallada
          </label>
          <textarea
            id="descripcion"
            rows={5}
            {...register('descripcion')}
            placeholder="Describe la propiedad en detalle: sus características, ventajas, entorno, etc."
            className={`w-full p-3 rounded-md border text-grafito placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
              errors.descripcion ? 'border-red-500' : 'border-oro-arenoso'
            }`}
            aria-invalid={errors.descripcion ? "true" : "false"}
            disabled={isFormDisabled}
          ></textarea>
          {errors.descripcion && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {errors.descripcion.message as string}
            </p>
          )}
        </div>

        {/* Campo: Asignar a Proyecto (Opcional) */}
        {user?.rol === 'VENDEDOR' && projects.length > 0 && (
          <div>
            <label htmlFor="proyectoId" className="block text-sm font-medium text-grafito mb-1">
              Asignar a un Proyecto (Opcional)
            </label>
            <select
              id="proyectoId"
              {...register('proyectoId')}
              className={`w-full p-3 rounded-md border text-grafito focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
                errors.proyectoId ? 'border-red-500' : 'border-oro-arenoso'
              }`}
              disabled={isFormDisabled}
            >
              <option value="">-- No asignar a un proyecto --</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.nombre}
                </option>
              ))}
            </select>
            {errors.proyectoId && (
              <p role="alert" className="mt-1 text-sm text-red-600">
                {errors.proyectoId.message as string}
              </p>
            )}
          </div>
        )}

        {/* === SECCIÓN DE CARGA DE IMÁGENES (MODIFICADA) === */}
        <div className="border border-oro-arenoso rounded-lg p-4 bg-white shadow-sm">
          <label className="block text-lg font-bold text-grafito mb-2">
            Imágenes de la Propiedad
          </label>
          {/* Input de archivo oculto */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden" // Oculta el input real
            accept="image/jpeg, image/png, image/gif, image/webp" // Define los tipos de archivo aceptados
            // No se usa `register('imagenes')` aquí porque gestionamos los archivos manualmente
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
          {/* Mensaje de error de validación de imágenes */}
          {errors.imagenes && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {errors.imagenes.message as string}
            </p>
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
                  {/* Botón para eliminar imagen */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                    aria-label={`Eliminar imagen ${index + 1}`}
                    disabled={isFormDisabled}
                  >
                    {/* Icono SVG de una 'X' o cruz */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* === FIN SECCIÓN DE CARGA DE IMÁGENES === */}


        {/* Botón de Enviar */}
        <button
          type="submit"
          className="w-full px-6 py-3 rounded-md bg-azul-marino text-white font-semibold text-lg shadow-md hover:bg-azul-oscuro focus:outline-none focus:ring-2 focus:ring-azul-marino focus:ring-offset-2 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isFormDisabled}
        >
          {isSavingProperty ? 'Guardando Propiedad...' : isUploadingImages ? 'Subiendo Imágenes...' : 'Crear Propiedad'}
        </button>
      </form>
    </div>
  );
};

export default CrearPropiedad;
