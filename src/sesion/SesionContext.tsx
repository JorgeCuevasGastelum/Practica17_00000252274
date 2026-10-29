// sesion/SesionContext.tsx — la sesión de toda la app.
// El proveedor guarda quién inició sesión; cualquier componente la lee con
// useSesion(), sin pasarla por props de padre a hijo.
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as api from '../servicios/sesion.ts';
import { alRecibir401 } from '../servicios/api.ts';
import { borrarSesion, guardarSesion, leerSesion } from './almacen.ts';
import type { Sesion, Usuario } from '../tipos.ts';

interface ValorSesion {
  usuario: Usuario | null;
  entrar: (correo: string, password: string) => Promise<void>;
  registrar: (nombre: string, correo: string, password: string) => Promise<void>;
  salir: () => void;
}

// null por defecto: así useSesion sabe cuándo se usó fuera del proveedor.
const SesionContext = createContext<ValorSesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  // Arranca con lo que haya en localStorage: la sesión sobrevive a recargar.
  const [sesion, setSesion] = useState<Sesion | null>(leerSesion);

  // Cuando la API responde 401, la sesión se cierra sola. Si estabas en una
  // ruta protegida, RutaProtegida te manda a /entrar en ese mismo momento.
  // (api.ts ya borró el localStorage; aquí sólo se vacía el estado.)
  useEffect(() => alRecibir401(() => setSesion(null)), []);

  function iniciar(nueva: Sesion) {
    guardarSesion(nueva);
    setSesion(nueva);
  }

  async function entrar(correo: string, password: string) {
    iniciar(await api.entrar(correo, password));
  }

  async function registrar(nombre: string, correo: string, password: string) {
    iniciar(await api.registrar(nombre, correo, password));
  }

  function salir() {
    borrarSesion();
    setSesion(null);
  }

  return (
    <SesionContext.Provider value={{ usuario: sesion?.usuario ?? null, entrar, registrar, salir }}>
      {children}
    </SesionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- el hook va junto a su contexto
export function useSesion() {
  const valor = useContext(SesionContext);
  if (!valor) {
    throw new Error('useSesion se usó fuera de <SesionProvider>');
  }
  return valor;
}
