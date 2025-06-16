import api from './axios'; // Asume que este 'api' es tu instancia de Axios configurada
import axios, { AxiosError } from 'axios'; // Importar axios y AxiosError para tipado de errores

// Interfaz para la respuesta de login con Google
interface GoogleLoginResponse {
  mensaje: string;
  usuario: {
    id: number;
    nombre: string;
    email: string;
    rol: string;
  };
  token: string; // El JWT que tu backend generará
}

// Interfaz para los datos que se envían al backend para crear/actualizar una propiedad
export interface PropiedadData {
  nombre: string;
  slug: string;
  tipo: string;
  precio: number;
  habitaciones?: number | null;
  baños?: number | null;
  parqueos?: number | null; // ¡NUEVO!
  metros2?: number | null; // Metros cuadrados de construcción
  estado: string;
  descripcion: string;
  ubicacion: string;
  nivel?: number | null; // ¡NUEVO!
  ascensor?: boolean | null; // ¡NUEVO!
  amueblado?: boolean | null; // ¡NUEVO!
  mantenimiento?: number | null; // ¡NUEVO!
  anoConstruccion?: number | null; // ¡NUEVO!
  gastosLegalesIncluidos?: boolean | null; // ¡NUEVO!
  disponibleDesde?: string | null; // ¡NUEVO! Tipo string para fecha, se convertirá en el backend si es necesario
  videoUrl?: string | null; // ¡NUEVO!
  tipoPropiedad?: string | null; // ¡NUEVO!

  proyectoId?: number | null; // ID del proyecto es Int en tu schema
  usuarioVendedorId: number; // El ID del vendedor que crea/actualiza la propiedad
  imageUrls: string[]; // Un array de URLs de imágenes
}


// Interfaz para los datos que se envían al backend para crear/actualizar un proyecto
export interface ProyectoData {
  id?: number; // ID del proyecto es Int en tu schema (autoincrement, opcional al crear)
  nombre: string;
  slug: string;
  descripcion: string;
  ubicacion: string;
  estado: string;
  imagenDestacada: string; // URL de la imagen destacada del proyecto
  usuarioVendedorId: number; // El ID del vendedor que crea/actualiza el proyecto

  // Propiedades adicionales que pueden ser enviadas al crear/actualizar un proyecto
  fechaEntregaEstimada?: string;
  unidadesDisponibles?: number;
  precioDesde?: number;
  amenidadesProyecto?: string[];
  // === CAMPOS AÑADIDOS para el proyecto (envío) ===
  videoUrl?: string | null; // URL del video del proyecto (si tu modelo de Prisma Proyecto lo tiene)
  imagenes?: string[];      // URLs de imágenes adicionales para el proyecto (array de URLs para el envío)
}

// Interfaz para la creación de un proyecto con propiedades anidadas
export interface CreateProjectWithPropertiesData extends ProyectoData {
  propiedadesAsociadas: Omit<PropiedadData, 'proyectoId' | 'usuarioVendedorId'>[];
}

// --- Interfaces de Respuesta que se reciben del backend para Propiedades ---
export interface PropiedadResponse extends Omit<PropiedadData, 'usuarioVendedorId' | 'imageUrls'> {
  id: number; // ID de propiedad es Int en tu schema
  createdAt: string;
  updatedAt: string;
  usuarioVendedor: { // Datos del vendedor relacionados
    id: number;
    nombre: string;
    email: string;
    telefono?: string;
    whatsapp?: string;
  };
  proyecto?: { // Será null para propiedades independientes
    id: number; // ID de proyecto también como Int
    nombre: string;
    slug: string;
    estado: string;
  };
  imagenes: { // Aquí se obtiene el array de objetos Imagen de tu schema
    id: number;
    url: string;
  }[];
}

// --- Interfaces de Respuesta que se reciben del backend para Proyectos ---
// === CORRECCIÓN CLAVE AQUÍ: Sobrescribir el tipo de 'imagenes' ===
export interface ProyectoResponse extends Omit<ProyectoData, 'usuarioVendedorId' | 'imagenes' | 'videoUrl'> {
  id: number; // ID de proyecto es Int en tu schema
  createdAt: string;
  updatedAt: string;
  usuarioVendedor: { // Datos del vendedor relacionados
    id: number;
    nombre: string;
    email: string;
    telefono?: string;
    whatsapp?: string;
  };
  propiedades: PropiedadResponse[]; // Incluye propiedades si se usa getProyectoWithProperties
  fechaEntregaEstimada?: string;
  unidadesDisponibles?: number;
  precioDesde?: number;
  amenidadesProyecto: string[];
  // === CAMPOS AÑADIDOS para la respuesta del proyecto (sobrescritura) ===
  // videoUrl debe ser String | null si la DB lo devuelve como tal
  videoUrl?: string | null;
  // `imagenes` ahora es un array de objetos { id, url }
  imagenes?: {
    id: number;
    url: string;
  }[];
}


// --- Funciones de Autenticación y Usuario ---

/**
 * Registra un nuevo usuario.
 * @param data Datos del usuario a registrar (nombre, email, password, rol opcional, etc.).
 * @returns La respuesta del API.
 */
export const registerUsuarios = async (data: {
  nombre: string; // <--- cambiado de "name" a "nombre"
  email: string;
  password: string;
  rol?: string;
  telefono?: string;
  whatsapp?: string;
}) => {
  const res = await api.post('/api/auth/registro', data);
  return res.data;
};


/**
 * Inicia sesión de un usuario con email y contraseña.
 * @param data Email y contraseña del usuario.
 * @returns La respuesta del API con token y datos de usuario.
 */
export const loginUsuarios = async (data: { email: string; password: string }) => {
  const res = await api.post('/api/auth/login', data);
  return res.data;
};

/**
 * Obtiene la información del usuario autenticado.
 * @returns Datos del usuario o null si no está autenticado/hay error.
 */
export const me = async () => {
  try {
    const res = await api.get('/api/me', { withCredentials: true });
    return res.data;
  } catch (error: unknown) {
    console.error("Error al obtener información del usuario:", error);
    return null;
  }
};

/**
 * Inicia sesión con Google usando un ID token.
 * @param idToken ID Token de Google.
 * @returns La respuesta del API con mensaje, usuario y token.
 * @throws Error si la autenticación con Google falla.
 */
export const loginWithGoogle = async (idToken: string): Promise<GoogleLoginResponse> => {
  try {
    const response = await api.post<GoogleLoginResponse>(`/api/auth/google-login`, { idToken }, {
      withCredentials: true,
    });
    console.log('Login con Google exitoso en el frontend:', response.data.mensaje);
    console.log('Datos del usuario:', response.data.usuario);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('Error al iniciar sesión con Google en el frontend:', error.response?.data?.error || error.message);
      throw error.response?.data?.error || 'Error al iniciar sesión con Google.';
    }
    throw error;
  }
};

/**
 * Cierra la sesión del usuario.
 * @returns La respuesta del API.
 * @throws Error si el cierre de sesión falla.
 */
export const logout = async () => {
  try {
    const res = await api.post('/api/auth/logout', {}, { withCredentials: true });
    return res.data;
  } catch (error: unknown) {
    console.error("Error al llamar al endpoint de logout:", error);
    throw error;
  }
};

// Interfaz para la respuesta completa de la subida de archivo desde el backend
interface BackendUploadResponse {
  mensaje: string;
  archivos: Array<{
    type: 'image' | 'video';
    url: string;
    public_id: string;
  }>;
}

// Interfaz que el frontend espera de `uploadImage`
export interface UploadResponse {
  url: string;     // URL segura del archivo en Cloudinary
  public_id: string; // Public ID del archivo en Cloudinary
}

/**
 * Sube un archivo (imagen o video) a Cloudinary a través de tu endpoint de backend.
 * Se espera que el backend devuelva un array de archivos, y esta función
 * extraerá la URL y public_id del archivo subido del tipo especificado.
 * @param file El archivo (File object) a subir.
 * @param fileType El tipo de archivo ('image' o 'video'), para el nombre del campo FormData.
 * @returns La URL y public_id del archivo subido.
 * @throws Error si la subida falla o si no se encuentra una URL válida.
 */
export const uploadImage = async (file: File, fileType: 'image' | 'video'): Promise<UploadResponse> => {
  const formData = new FormData();
  // El nombre del campo en el FormData debe coincidir con lo que tu backend espera
  // 'image' para imágenes, 'video' para videos.
  const fieldName = fileType === 'image' ? 'image' : 'video';
  formData.append(fieldName, file);

  try {
    // Especifica el tipo de respuesta esperado del backend
    const res = await api.post<BackendUploadResponse>('/api/upload/image', formData, {
      headers: {
        // 'Content-Type': 'multipart/form-data' se establecerá automáticamente por el navegador
        // cuando usas FormData, no es necesario establecerlo manualmente aquí.
      },
      withCredentials: true,
    });

    // Extrae la URL y public_id del archivo del tipo correcto en el array 'archivos'
    if (res.data.archivos && res.data.archivos.length > 0) {
      const uploadedFile = res.data.archivos.find(f => f.type === fileType);
      if (uploadedFile) {
        return { url: uploadedFile.url, public_id: uploadedFile.public_id };
      } else {
        throw new Error(`El backend no devolvió una URL válida para el tipo de archivo '${fileType}'.`);
      }
    } else {
      // Si el backend no devuelve archivos, lanzar un error
      throw new Error('El backend no devolvió archivos válidos.');
    }

  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const backendErrorMessage = error.response?.data?.mensaje || error.response?.data?.error;
      console.error('Error al subir archivo desde el frontend:', backendErrorMessage || error.message);
      throw new Error(backendErrorMessage || 'Error desconocido al subir el archivo.');
    }
    throw error;
  }
};

// --- Funciones para Propiedades (CRUD) ---

/**
 * Crea una nueva propiedad.
 * @param data Los datos de la propiedad a crear (ahora incluye URLs de imágenes).
 * @returns La propiedad creada con mensaje de confirmación.
 */
export const createPropiedad = async (data: PropiedadData): Promise<{ mensaje: string; propiedad: PropiedadResponse }> => {
  // Ahora envía los datos como JSON, incluyendo el array de URLs de imágenes
  const res = await api.post('/api/propiedades', data);
  return res.data;
};

/**
 * Obtiene una propiedad por su SLUG.
 * @param slug El slug de la propiedad.
 * @returns La propiedad encontrada o null si no existe.
 */
export async function getPropertyBySlug(slug: string): Promise<PropiedadResponse | null> {
  try {
    const res = await api.get<{ mensaje: string; propiedad: PropiedadResponse }>(`/api/propiedades/slug/${slug}`);
    return res.data.propiedad;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
      console.warn(`Propiedad con slug '${slug}' no encontrada (404).`);
      return null;
    }
    console.error(`Error al cargar la propiedad con slug '${slug}':`, error);
    throw error;
  }
}

/**
 * Actualiza una propiedad existente por su ID.
 * @param id El ID de la propiedad (number).
 * @param data Los datos parciales de la propiedad a actualizar.
 * @returns La propiedad actualizada con mensaje de confirmación.
 */
export const updatePropiedad = async (id: number, data: Partial<PropiedadData>): Promise<{ mensaje: string; propiedad: PropiedadResponse }> => {
  const res = await api.put(`/api/propiedades/${id}`, data);
  return res.data;
};

/**
 * Elimina una propiedad por su ID.
 * @param id El ID de la propiedad a eliminar (number).
 * @returns Mensaje de confirmación de eliminación.
 */
export const deletePropiedad = async (id: number): Promise<{ mensaje: string }> => {
  const res = await api.delete(`/api/propiedades/${id}`);
  return res.data;
};

/**
 * Obtiene propiedades asociadas a un proyecto por el ID del proyecto.
 * @param proyectoId El ID del proyecto (number).
 * @returns Lista de propiedades asociadas al proyecto.
 */
export const getPropiedadesByProyectoId = async (proyectoId: number): Promise<{ mensaje: string; propiedades: PropiedadResponse[] }> => {
  const res = await api.get(`/api/propiedades/proyecto/${proyectoId}`);
  return res.data;
};


// --- Funciones para Proyectos (CRUD) ---

/**
 * Crea un nuevo proyecto.
 * @param data Los datos del proyecto a crear.
 * @returns El proyecto creado con mensaje de confirmación.
 */
export const createProyecto = async (data: ProyectoData): Promise<{ mensaje: string; proyecto: ProyectoResponse }> => {
  const res = await api.post('/api/proyectos', data);
  return res.data;
};


/**
 * Retorna todos los proyectos para el catálogo público o filtra por vendedorId.
 * @param vendedorId (Opcional) ID del vendedor para filtrar proyectos.
 * @returns Lista de proyectos.
 */
export const getProyectos = async (
  vendedorId?: number
): Promise<{ proyectos: ProyectoResponse[] }> => {
  try {
    const url = vendedorId
      ? `/api/proyectos?vendedorId=${vendedorId}`
      : '/api/proyectos';

    const res = await api.get(url, {
      withCredentials: Boolean(vendedorId), // más claro que ternario
    });

    return res.data; // <- Se espera que contenga usuarioVendedor y propiedades completas
  } catch (error: unknown) {
    console.error('Error al obtener proyectos:', error);
    throw error;
  }
};

/**
 * Obtiene un proyecto por su SLUG.
 * @param slug El slug del proyecto.
 * @returns El proyecto encontrado o null si no existe.
 */
export async function getProjectBySlug(slug: string): Promise<ProyectoResponse | null> {
  try {
    const res = await api.get<{ mensaje: string; proyecto: ProyectoResponse }>(`/api/proyectos/slug/${slug}`);
    return res.data.proyecto;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response && error.response.status === 404) {
      console.warn(`Proyecto con slug '${slug}' no encontrado (404).`);
      return null;
    }
    console.error(`Error al cargar el proyecto con slug '${slug}':`, error);
    throw error;
  }
}

/**
 * Obtiene un proyecto con todas sus propiedades asociadas.
 * @param id El ID del proyecto (number).
 * @returns El proyecto con sus propiedades.
 */
export const getProyectoWithProperties = async (id: number): Promise<{ mensaje: string; proyecto: ProyectoResponse }> => {
  const res = await api.get(`/api/proyectos/${id}/with-properties`);
  return res.data;
};

/**
 * Actualiza un proyecto existente por su ID.
 * @param id El ID del proyecto (number).
 * @param data Los datos parciales del proyecto a actualizar.
 * @returns El proyecto actualizado con mensaje de confirmación.
 */
export const updateProyecto = async (id: number, data: Partial<ProyectoData>): Promise<{ mensaje: string; proyecto: ProyectoResponse }> => {
  const res = await api.put(`/api/proyectos/${id}`, data);
  return res.data;
};

/**
 * Elimina un proyecto por su ID.
 * @param id El ID del proyecto a eliminar (number).
 * @returns Mensaje de confirmación de eliminación.
 */
export const deleteProyecto = async (id: number): Promise<{ mensaje: string }> => {
  const res = await api.delete(`/api/proyectos/${id}`);
  return res.data;
};

// --- Funciones Específicas del Vendedor ---

/**
 * Retorna todas las propiedades (independientes y asociadas a proyectos) del vendedor autenticado.
 * Requiere autenticación.
 * @returns Lista de propiedades del vendedor.
 */
export const getMisPropiedades = async (): Promise<{ mensaje: string; propiedades: PropiedadResponse[] }> => {
  try {
    const res = await api.get('/api/vendedor/mis-propiedades', { withCredentials: true });
    return res.data;
  } catch (error: unknown) {
    console.error("Error al obtener mis propiedades:", error);
    throw error;
  }
};

/**
 * Retorna solo las propiedades del vendedor autenticado que NO están asociadas a ningún proyecto.
 * Requiere autenticación.
 * @returns Lista de propiedades independientes del vendedor.
 */
export const getMisPropiedadesIndependientes = async (): Promise<{ mensaje: string; propiedades: PropiedadResponse[] }> => {
  try {
    const res = await api.get('/api/vendedor/mis-independientes', { withCredentials: true });
    return res.data;
  } catch (error: unknown) {
    console.error("Error al obtener mis propiedades independientes:", error);
    throw error;
  }
};

// --- FUNCIÓN para el catálogo público ---
/**
 * Retorna todas las propiedades disponibles para el catálogo público.
 * Asume que esta ruta existe en tu backend para propiedades públicas: GET /api/propiedades.
 * No requiere autenticación.
 * @returns Lista de propiedades públicas.
 */
export const getPublicProperties = async (): Promise<{ mensaje: string; propiedades: PropiedadResponse[] }> => {
  try {
    const res = await api.get('/api/propiedades', { withCredentials: false });
    return res.data;
  } catch (error: unknown) {
    console.error("Error al obtener propiedades públicas para el catálogo:", error);
    throw error;
  }
};

// Interfaz para la respuesta de favoritos
export interface FavoriteResponse {
  id: number;
  createdAt: string;
  type: 'propiedad' | 'proyecto';
  item: PropiedadResponse | ProyectoResponse; // El objeto de la propiedad o el proyecto
}

/**
 * Alterna el estado de favorito de una propiedad o proyecto.
 * @param itemId El ID de la propiedad o proyecto.
 * @param itemType El tipo de elemento ('propiedad' o 'proyecto').
 * @returns Un objeto que indica si el elemento fue añadido o eliminado, y un mensaje.
 */
export const toggleFavorite = async (itemId: number, itemType: 'propiedad' | 'proyecto'): Promise<{ mensaje: string; favorited: boolean }> => {
  try {
    const res = await api.post('/api/auth/favorites', { itemId, itemType });
    return res.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || error.message;
      console.error(`Error al alternar favorito para ${itemType} ${itemId}:`, errorMessage);
      throw new Error(errorMessage);
    }
    throw error;
  }
};

/**
 * Obtiene la lista de favoritos del usuario autenticado.
 * @returns Una lista de objetos favoritos.
 */
export const getFavorites = async (): Promise<{ mensaje: string; favoritos: FavoriteResponse[] }> => {
  try {
    const res = await api.get('/api/auth/favorites');
    return res.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || error.message;
      console.error('Error al obtener favoritos:', errorMessage);
      throw new Error(errorMessage);
    }
    throw error;
  }
};
