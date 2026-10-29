// <Encabezado> — RECURSO: la marca, los enlaces y el botón de Entrar.
// NavLink es un <Link> que además sabe si su ruta es la actual: así se
// pinta el enlace activo sin una línea de JavaScript propio.
import { Link, NavLink, useNavigate } from 'react-router';
import { useSesion } from '../sesion/SesionContext.tsx';

// La clase del enlace según si está activo o no.
function claseEnlace({ isActive }: { isActive: boolean }) {
  return isActive ? 'barra__enlace barra__enlace--activo' : 'barra__enlace';
}

export function Encabezado() {
  const { usuario, salir } = useSesion();
  const navegar = useNavigate();

  function cerrarSesion() {
    salir();
    navegar('/clases');
  }

  return (
    <header className="barra">
      <div className="barra__interior">
        <Link to="/" className="barra__marca">
          <img src="/logo.svg" alt="" />
          Gimnasio Titanes
        </Link>

        <nav>
          <ul className="barra__enlaces">
            <li><NavLink to="/clases" className={claseEnlace}>Clases</NavLink></li>
            <li><NavLink to="/mis-inscripciones" className={claseEnlace}>Mis inscripciones</NavLink></li>
          </ul>
        </nav>

        {/* Con sesión: el nombre y Salir. Sin sesión: Entrar. */}
        <div className="barra__sesion">
          {usuario ? (
            <>
              <span className="barra__usuario">{usuario.nombre}</span>
              <button className="boton boton--chico" onClick={cerrarSesion}>Salir</button>
            </>
          ) : (
            <Link to="/entrar" className="boton boton--chico">Entrar</Link>
          )}
        </div>
      </div>
    </header>
  );
}
