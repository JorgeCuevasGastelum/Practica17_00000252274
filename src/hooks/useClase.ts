// hooks/useClase.ts — el mismo patrón de useClases, pero para UNA clase.
// El id va en las dependencias: si cambia la URL (/clases/1 → /clases/2),
// el efecto se repite y se pide la clase nueva.
import { useEffect, useState } from 'react';
import { traerClase } from '../servicios/gimnasio.ts';
import { mensajeDeError } from '../servicios/api.ts';
import type { ClaseConHorarios } from '../tipos.ts';

// Lo que respondió la API, junto con la petición a la que pertenece.
interface Respuesta {
  id: number;
  peticion: string;
  clase: ClaseConHorarios | null;
  error: string | null;
}

export function useClase(id: number) {
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [intento, setIntento] = useState(0); // cambiarlo repite el efecto
  const peticion = `${id}-${intento}`;

  useEffect(() => {
    let vigente = true; // ¿este efecto sigue siendo el actual?
    const actual = `${id}-${intento}`;
    traerClase(id)
      .then((clase) => { if (vigente) setRespuesta({ id, peticion: actual, clase, error: null }); })
      .catch((e) => {
        if (vigente) setRespuesta({ id, peticion: actual, clase: null, error: mensajeDeError(e, 'No se pudo cargar la clase.') });
      });
    return () => { vigente = false; }; // la respuesta de un id viejo ya no se pinta
  }, [id, intento]);

  // ¿La respuesta guardada es de esta misma petición?
  const alDia = respuesta?.peticion === peticion;
  // Al recargar la MISMA clase (después de inscribirse) se sigue enseñando la
  // que ya teníamos mientras llega la nueva: así la página no parpadea.
  const clase = respuesta?.id === id ? respuesta.clase : null;
  const cargando = !alDia && clase === null;

  // Vuelve a pedir la clase: para reintentar o para poner los lugares al día.
  function recargar() {
    setIntento((n) => n + 1);
  }

  return {
    clase,
    error: alDia ? respuesta.error : null,
    cargando,
    recargar,
  };
}
