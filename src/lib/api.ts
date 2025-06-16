// @ts-nocheck
import api from './axios';
import axios from 'axios';

export const registerUsuarios = async (data: any): Promise<any> => {
  const res = await api.post('/api/auth/registro', data);
  return res.data;
};

export const loginUsuarios = async (data: any): Promise<any> => {
  const res = await api.post('/api/auth/login', data);
  return res.data;
};

export const me = async () => {
  try {
    const res = await api.get('/api/me', { withCredentials: true });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // No loguear ni lanzar error: el usuario simplemente no está autenticado
      return null;
    }
    console.error('Error real en /api/me:', error);
    return null;
  }
};


export const loginWithGoogle = async (idToken: string) => {
  try {
    const response = await api.post(`/api/auth/google-login`, { idToken }, {
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

export const logout = async () => {
  try {
    const res = await api.post('/api/auth/logout', {}, { withCredentials: true });
    return res.data;
  } catch (error: unknown) {
    console.error("Error al llamar al endpoint de logout:", error);
    throw error;
  }
};

interface BackendUploadResponse {
  mensaje: string;
  archivos: Array<{
    type: 'image' | 'video';
    url: string;
    public_id: string;
  }>;
}

export interface UploadResponse {
  url: string;
  public_id: string;
}

export const uploadImage = async (file: File, fileType: 'image' | 'video') => {
  const formData = new FormData();
  const fieldName = fileType === 'image' ? 'image' : 'video';
  formData.append(fieldName, file);

  try {
    const res = await api.post('/api/upload/image', formData, {
      headers: {},
      withCredentials: true,
    });

    if (res.data.archivos && res.data.archivos.length > 0) {
      const uploadedFile = res.data.archivos.find((f: any) => f.type === fileType);
      if (uploadedFile) {
        return { url: uploadedFile.url, public_id: uploadedFile.public_id };
      } else {
        throw new Error(`El backend no devolvió una URL válida para el tipo de archivo '${fileType}'.`);
      }
    } else {
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

export const createPropiedad = async (data: any) => {
  const res = await api.post('/api/propiedades', data);
  return res.data;
};

export async function getPropertyBySlug(slug: string) {
  try {
    const res = await api.get(`/api/propiedades/slug/${slug}`);
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

export const updatePropiedad = async (id: number, data: any) => {
  const res = await api.put(`/api/propiedades/${id}`, data);
  return res.data;
};

export const deletePropiedad = async (id: number) => {
  const res = await api.delete(`/api/propiedades/${id}`);
  return res.data;
};

export const getPropiedadesByProyectoId = async (proyectoId: number) => {
  const res = await api.get(`/api/propiedades/proyecto/${proyectoId}`);
  return res.data;
};

export const createProyecto = async (data: any) => {
  const res = await api.post('/api/proyectos', data);
  return res.data;
};

export const getProyectos = async (
  vendedorId?: any
) => {
  try {
    const url = vendedorId
      ? `/api/proyectos?vendedorId=${vendedorId}`
      : '/api/proyectos';

    const res = await api.get(url, {
      withCredentials: Boolean(vendedorId),
    });

    return res.data;
  } catch (error: unknown) {
    console.error('Error al obtener proyectos:', error);
    throw error;
  }
};

export async function getProjectBySlug(slug: string) {
  try {
    const res = await api.get(`/api/proyectos/slug/${slug}`);
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

export const getProyectoWithProperties = async (id: number) => {
  const res = await api.get(`/api/proyectos/${id}/with-properties`);
  return res.data;
};

export const updateProyecto = async (id: number, data: any) => {
  const res = await api.put(`/api/proyectos/${id}`, data);
  return res.data;
};

export const deleteProyecto = async (id: number) => {
  const res = await api.delete(`/api/proyectos/${id}`);
  return res.data;
};

export const getMisPropiedades = async () => {
  try {
    const res = await api.get('/api/vendedor/mis-propiedades', { withCredentials: true });
    return res.data;
  } catch (error: unknown) {
    console.error("Error al obtener mis propiedades:", error);
    throw error;
  }
};

export const getMisPropiedadesIndependientes = async () => {
  try {
    const res = await api.get('/api/vendedor/mis-independientes', { withCredentials: true });
    return res.data;
  } catch (error: unknown) {
    console.error("Error al obtener mis propiedades independientes:", error);
    throw error;
  }
};

export const getPublicProperties = async () => {
  try {
    const res = await api.get('/api/propiedades', { withCredentials: false });
    return res.data;
  } catch (error: unknown) {
    console.error("Error al obtener propiedades públicas para el catálogo:", error);
    throw error;
  }
};

interface FavoriteResponse {
  id: number;
  createdAt: string;
  type: 'propiedad' | 'proyecto';
  item: any;
}

export const toggleFavorite = async (itemId: number, itemType: any) => {
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

export const getFavorites = async () => {
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
