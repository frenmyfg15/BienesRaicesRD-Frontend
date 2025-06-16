'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Importar el componente Image de next/image

import {
  createPropiedad,
  uploadImage,
  getProyectos,
  UploadResponse,
} from '@/lib/api';
import { PropiedadData, ProyectoResponse } from '@/app/types/api';

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
  parqueos: yup.number()
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
  nivel: yup.number()
    .typeError('El nivel debe ser un número entero.')
    .integer('El nivel debe ser un número entero.')
    .min(0, 'El nivel no puede ser negativo.')
    .optional()
    .nullable(),
  ascensor: yup.boolean()
    .optional()
    .nullable(),
  amueblado: yup.boolean()
    .optional()
    .nullable(),
  mantenimiento: yup.number()
    .typeError('El mantenimiento debe ser un número.')
    .positive('El mantenimiento debe ser un valor positivo.')
    .optional()
    .nullable(),
  anoConstruccion: yup.number()
    .typeError('El año de construcción debe ser un número entero.')
    .integer('El año de construcción debe ser un número entero.')
    .min(1900, 'El año de construcción es inválido.')
    .max(new Date().getFullYear(), `El año de construcción no puede ser futuro.`)
    .optional()
    .nullable(),
  gastosLegalesIncluidos: yup.boolean()
    .optional()
    .nullable(),
  disponibleDesde: yup.string()
    .optional()
    .nullable(),
  videoUrl: yup.string()
    .url('Debe ser una URL válida para el video.')
    .optional()
    .nullable(),
  tipoPropiedad: yup.string()
    .optional()
    .nullable(),
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
    .required('Debes subir al menos una imagen.'),
  proyectoId: yup.number()
    .typeError('El ID del proyecto debe ser un número.')
    .integer('El ID del proyecto debe ser un número entero.')
    .positive('El ID del proyecto debe ser un valor positivo.')
    .optional()
    .nullable(),
});

interface PropiedadFormData {
  nombre: string;
  slug: string;
  tipo: string;
  precio: number;
  habitaciones: number | null;
  baños: number | null;
  parqueos: number | null;
  metros2: number | null;
  estado: string;
  descripcion: string;
  ubicacion: string;
  nivel: number | null;
  ascensor: boolean | null;
  amueblado: boolean | null;
  mantenimiento: number | null;
  anoConstruccion: number | null;
  gastosLegalesIncluidos: boolean | null;
  disponibleDesde: string | null;
  videoUrl: string | null;
  tipoPropiedad: string | null;
  imagenes: File[];
  proyectoId: number | null;
}

const CrearPropiedad: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isSavingProperty, setIsSavingProperty] = useState(false);
  const [projects, setProjects] = useState<ProyectoResponse[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<PropiedadFormData>({
    defaultValues: {
      estado: 'En venta',
      imagenes: [],
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

  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProyectos(user?.id);
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

  const handleAddImageClick = (): void => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];

    if (file) {
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        toast.error('Solo se permiten imágenes (JPEG, PNG, GIF, WebP).');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Cada imagen debe ser menor a 5MB.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setImageFiles(prevFiles => {
        const newFiles = [...prevFiles, file];
        setValue('imagenes', newFiles, { shouldValidate: true, shouldDirty: true });
        return newFiles;
      });

      const newPreview = URL.createObjectURL(file);
      setImagePreviews(prevPreviews => [...prevPreviews, newPreview]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number): void => {
    setImageFiles(prevFiles => {
      const updatedFiles = prevFiles.filter((_, i) => i !== index);
      setValue('imagenes', updatedFiles, { shouldValidate: true, shouldDirty: true });
      return updatedFiles;
    });

    setImagePreviews(prevPreviews => {
      const urlToRemove = prevPreviews[index];
      URL.revokeObjectURL(urlToRemove);
      return prevPreviews.filter((_, i) => i !== index);
    });
  };

  const onSubmit = async (data: PropiedadFormData): Promise<void> => {
    if (!isAuthenticated || !user || user.rol !== 'VENDEDOR') {
      toast.error('No tienes autorización para subir propiedades. Por favor, inicia sesión como vendedor.');
      router.push('/auth/login');
      return;
    }

    if (data.imagenes.length === 0) {
      toast.error('Debes subir al menos una imagen para la propiedad.');
      return;
    }

    setIsUploadingImages(true);
    const mainToastId = toast.loading('Creando propiedad...');
    let uploadedImageUrls: string[] = [];

    try {
      toast.loading('Subiendo imágenes a Cloudinary...', { id: mainToastId });
      for (let i = 0; i < data.imagenes.length; i++) {
        const file = data.imagenes[i];
        const uploadResponse: UploadResponse = await uploadImage(file, 'image');
        uploadedImageUrls.push(uploadResponse.url);
      }
      toast.success('Imágenes subidas exitosamente.', { id: mainToastId });

      const formattedSlug = data.slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setValue('slug', formattedSlug);

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
        imageUrls: uploadedImageUrls,
        proyectoId: data.proyectoId || null,
      };

      setIsSavingProperty(true);
      toast.loading('Guardando datos de la propiedad...', { id: mainToastId });
      await createPropiedad(propiedadDataToSend);
      toast.success('¡Propiedad creada exitosamente!', { id: mainToastId });

      reset();
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      setImageFiles([]);
      setImagePreviews([]);
      router.push('/vendedor/productos');

    } catch (error) {
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
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
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

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-grafito mb-1">
            Descripción
          </label>
          <textarea
            id="descripcion"
            {...register('descripcion')}
            rows={5}
            placeholder="Introduce una descripción detallada de la propiedad..."
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

        {/* Checkboxes para Amueblado, Ascensor, Gastos Legales Incluidos */}
        <div className="flex flex-wrap -mx-2 items-center">
          <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
            <label htmlFor="amueblado" className="inline-flex items-center cursor-pointer">
              <input
                id="amueblado"
                type="checkbox"
                {...register('amueblado')}
                className="form-checkbox h-5 w-5 text-verde-lima rounded-md border-gray-300 focus:ring-oro-arenoso"
                disabled={isFormDisabled}
              />
              <span className="ml-2 text-sm font-medium text-grafito">Amueblado</span>
            </label>
          </div>
          <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
            <label htmlFor="ascensor" className="inline-flex items-center cursor-pointer">
              <input
                id="ascensor"
                type="checkbox"
                {...register('ascensor')}
                className="form-checkbox h-5 w-5 text-verde-lima rounded-md border-gray-300 focus:ring-oro-arenoso"
                disabled={isFormDisabled}
              />
              <span className="ml-2 text-sm font-medium text-grafito">Ascensor</span>
            </label>
          </div>
          <div className="w-full md:w-1/3 px-2">
            <label htmlFor="gastosLegalesIncluidos" className="inline-flex items-center cursor-pointer">
              <input
                id="gastosLegalesIncluidos"
                type="checkbox"
                {...register('gastosLegalesIncluidos')}
                className="form-checkbox h-5 w-5 text-verde-lima rounded-md border-gray-300 focus:ring-oro-arenoso"
                disabled={isFormDisabled}
              />
              <span className="ml-2 text-sm font-medium text-grafito">Gastos Legales Incluidos</span>
            </label>
          </div>
        </div>

        {/* Campo: URL de Video */}
        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium text-grafito mb-1">
            URL del Video (opcional)
          </label>
          <input
            id="videoUrl"
            type="url"
            {...register('videoUrl')}
            placeholder="Ej: https://youtube.com/watch?v=..."
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

        {/* Selector de Proyectos */}
        {projects.length > 0 && (
          <div>
            <label htmlFor="proyectoId" className="block text-sm font-medium text-grafito mb-1">
              Asignar a Proyecto (Opcional)
            </label>
            <select
              id="proyectoId"
              {...register('proyectoId')}
              className={`w-full p-3 rounded-md border text-grafito focus:outline-none focus:ring-2 focus:ring-oro-arenoso transition duration-200 ease-in-out ${
                errors.proyectoId ? 'border-red-500' : 'border-oro-arenoso'
              }`}
              aria-invalid={errors.proyectoId ? "true" : "false"}
              disabled={isFormDisabled}
            >
              <option value="">Ningún proyecto (Propiedad individual)</option>
              {projects.map((project) => (
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

        {/* Sección de Carga de Imágenes */}
        <div className="space-y-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold text-grafito">Imágenes de la Propiedad</h3>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="sr-only"
            disabled={isFormDisabled || isUploadingImages}
            aria-label="Seleccionar imagen para la propiedad"
          />
          <button
            type="button"
            onClick={handleAddImageClick}
            disabled={isFormDisabled || isUploadingImages}
            className="w-full bg-azul-marino text-white py-2 px-4 rounded-md hover:bg-azul-marino/90 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-oro-arenoso focus:ring-offset-2"
          >
            Agregar Imagen
          </button>
          {errors.imagenes && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {errors.imagenes.message as string}
            </p>
          )}

          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative w-full h-32 rounded-md overflow-hidden shadow-md">
                  <Image
                    src={src}
                    alt={`Previsualización de imagen ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-80 hover:opacity-100 transition"
                    aria-label={`Eliminar imagen ${index + 1}`}
                    disabled={isFormDisabled || isUploadingImages}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isFormDisabled}
          className="w-full bg-verde-lima text-grafito font-semibold py-3 px-6 rounded-md hover:bg-verde-lima/90 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-verde-lima focus:ring-offset-2"
        >
          {(isUploadingImages || isSavingProperty) ? 'Procesando...' : 'Crear Propiedad'}
        </button>
      </form>
    </div>
  );
};

export default CrearPropiedad;