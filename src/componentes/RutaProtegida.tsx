// <RutaProtegida> — una ruta de layout que sólo deja pasar con sesión.
// Sin sesión manda a /entrar y le deja dicho a dónde se quería ir (state.desde),
// para que PaginaEntrar regrese ahí después de iniciar sesión.
import { Navigate, Outlet, useLocation } from 'react-router';
import { useSesion } from '../sesion/SesionContext.tsx';

export function RutaProtegida() {
  const { usuario } = useSesion();
  const ubicacion = useLocation();

  if (!usuario) {
    return <Navigate to="/entrar" replace state={{ desde: ubicacion.pathname }} />;
  }
  return <Outlet />;
}
