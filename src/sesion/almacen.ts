// sesion/almacen.ts — leer y guardar la sesión en localStorage.
// Lo usan el contexto (para arrancar con la sesión guardada) y el
// interceptor de Axios (para mandar el token en cada petición).
import type { Sesion } from '../tipos.ts';

const CLAVE = 'gimnasio.sesion';

export function leerSesion(): Sesion | null {
  const texto = localStorage.getItem(CLAVE);
  if (!texto) return null;
  try {
    return JSON.parse(texto) as Sesion;
  } catch {
    return null; // si alguien dejó basura en la clave, es como no tener sesión
  }
}

export function guardarSesion(sesion: Sesion) {
  localStorage.setItem(CLAVE, JSON.stringify(sesion));
}

export function borrarSesion() {
  localStorage.removeItem(CLAVE);
}
