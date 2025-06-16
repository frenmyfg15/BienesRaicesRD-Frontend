// Interfaz para la respuesta de login con Google
export interface GoogleLoginResponse {
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