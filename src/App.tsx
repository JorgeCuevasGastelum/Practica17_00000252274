// App.tsx — el mapa de rutas del gimnasio.
import { Navigate, Route, Routes } from 'react-router';
import { Layout } from './componentes/Layout.tsx';
import { NoEncontrado } from './componentes/NoEncontrado.tsx';
import { PaginaClases } from './paginas/PaginaClases.tsx';
import { PaginaClase } from './paginas/PaginaClase.tsx';
import PaginaEntrar from './paginas/PaginaEntrar.tsx';
import PaginaRegistro from './paginas/PaginaRegistro.tsx';
import { PaginaMisInscripciones } from './paginas/PaginaMisInscripciones.tsx';
import { RutaProtegida } from './componentes/RutaProtegida.tsx';

export default function App() {
  return (
    <Routes>
      {/* Ruta de layout: no tiene path, sólo pinta el marco y su <Outlet />. */}
      <Route element={<Layout />}>
        {/* La portada redirige al catálogo. replace: no deja "/" en el historial. */}
        <Route index element={<Navigate to="/clases" replace />} />

        <Route path="clases">
          <Route index element={<PaginaClases />} />
          {/* Hija de "clases": /clases/:id */}
          <Route path=":id" element={<PaginaClase />} />
        </Route>

        <Route path="entrar" element={<PaginaEntrar />} />
        <Route path="registro" element={<PaginaRegistro />} />

        {/* Todo lo que va aquí adentro pide sesión. */}
        <Route element={<RutaProtegida />}>
          <Route path="mis-inscripciones" element={<PaginaMisInscripciones />} />
        </Route>

        {/* Cualquier otra dirección. Está DENTRO del layout: por eso lleva encabezado y pie. */}
        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  );
}
