// servicios/api.ts — RECURSO: se copia del código base (es el de la Práctica 14).
// UNA instancia de Axios para toda la app. Nadie más importa axios.
import axios from 'axios';
import { borrarSesion, leerSesion } from '../sesion/almacen.ts';

// Donde corre gimnasio-backend. VITE_API_URL sólo se usa al desplegar (tutorial de la Semana 10).
export const URL_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const api = axios.create({
  baseURL: URL_API,
  timeout: 5000, // si en 5 s no responde, es error
});

// Interceptor de petición: antes de salir, cada petición se lleva el token
// guardado en el encabezado Authorization. Sin sesión, sale sin él.
api.interceptors.request.use((config) => {
  const sesion = leerSesion();
  if (sesion) {
    config.headers.Authorization = `Bearer ${sesion.token}`;
  }
  return config;
});

// Interceptor de respuesta: si la API contesta 401 (token vencido, falso o
// borrado), se borra la sesión guardada y se avisa al contexto. El 401 del
// login no cuenta: ahí sólo significa contraseña equivocada.
// Se registra aquí, al cargar el módulo, y no en un useEffect: Axios arma la
// lista de interceptores cuando SALE la petición, y la primera petición de una
// página sale antes de que corran los efectos del proveedor.
let alCerrarSesion: (() => void) | null = null;

api.interceptors.response.use(undefined, (e) => {
  if (axios.isAxiosError(e) && e.response?.status === 401 && e.config?.url !== '/auth/login') {
    borrarSesion();
    alCerrarSesion?.();
  }
  return Promise.reject(e); // el error sigue su camino: la página igual muestra su mensaje
});

// El contexto se suscribe para enterarse del 401. Regresa cómo desuscribirse.
export function alRecibir401(cerrar: () => void): () => void {
  alCerrarSesion = cerrar;
  return () => {
    if (alCerrarSesion === cerrar) alCerrarSesion = null;
  };
}

// El sobre de la Práctica 9B: toda respuesta exitosa llega como { data, meta }.
export interface Sobre<T> {
  data: T;
}

// Las imágenes las sirve la API: /img/clase-01.jpg → http://localhost:3000/img/clase-01.jpg
export function urlImagen(ruta: string): string {
  return `${URL_API}${ruta}`;
}

// El mensaje que se le enseña a la persona cuando algo falla.
export function mensajeDeError(e: unknown, generico: string): string {
  if (axios.isAxiosError(e)) {
    if (e.response?.status === 401 && e.config?.url !== '/auth/login') {
      return 'Tu sesión terminó. Vuelve a entrar.';
    }
    const mensaje = e.response?.data?.message; // 400 trae un arreglo; 404 y 409, un texto
    if (Array.isArray(mensaje)) return mensaje.join('. ');
    if (typeof mensaje === 'string') return mensaje;
  }
  return generico;
}
