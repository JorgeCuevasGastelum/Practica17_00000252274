// <PaginaClase> — el detalle de una clase con sus horarios.
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { useClase } from '../hooks/useClase.ts';
import { useSesion } from '../sesion/SesionContext.tsx';
import { inscribirme } from '../servicios/gimnasio.ts';
import { mensajeDeError, urlImagen } from '../servicios/api.ts';
import { Cargando } from '../componentes/Cargando.tsx';
import { MensajeError } from '../componentes/MensajeError.tsx';

interface Aviso {
  tipo: 'exito' | 'error';
  texto: string;
}

export function PaginaClase() {
  // useParams siempre regresa texto: "1", no 1. Se convierte antes de usarlo.
  const { id } = useParams();
  const { clase, cargando, error, recargar } = useClase(Number(id));
  const { usuario } = useSesion();
  const navigate = useNavigate();
  const ubicacion = useLocation();
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [enviando, setEnviando] = useState<number | null>(null); // el horario que se está mandando

  async function inscribir(horarioId: number) {
    // Sin sesión no hay a quién inscribir: a /entrar, y de regreso a esta clase.
    if (!usuario) {
      navigate('/entrar', { state: { desde: ubicacion.pathname } });
      return;
    }
    setAviso(null);
    setEnviando(horarioId);
    try {
      await inscribirme(horarioId);
      setAviso({ tipo: 'exito', texto: '¡Listo! Quedaste inscrito en este horario.' });
      recargar(); // los lugares disponibles cambiaron: se pide la clase otra vez
    } catch (e) {
      // 409: ya inscrito o lleno. 403: la cuenta no es de un miembro.
      setAviso({ tipo: 'error', texto: mensajeDeError(e, 'No se pudo hacer la inscripción.') });
    } finally {
      setEnviando(null);
    }
  }

  if (cargando) return <Cargando />;
  if (error || !clase) {
    return <MensajeError mensaje={error ?? 'No se encontró la clase.'} onReintentar={recargar} />;
  }

  return (
    <>
      <Link to="/clases" className="detalle__volver">← Todas las clases</Link>

      <article className="detalle">
        <img className="detalle__imagen" src={urlImagen(clase.imagen)} alt={clase.nombre} />
        <div className="detalle__datos">
          <span className={`etiqueta etiqueta--${clase.categoria}`}>{clase.categoria}</span>
          <h1>{clase.nombre}</h1>
          <p className="pagina__bajada">{clase.descripcion} · {clase.duracionMin} min</p>

          <h2>Horarios</h2>
          {aviso && <p className={`aviso aviso--${aviso.tipo}`}>{aviso.texto}</p>}
          <ul className="horarios">
            {clase.horarios.map((h) => (
              <li key={h.id} className="horario">
                <div>
                  <div className="horario__dia">{h.dia} · {h.horaInicio}</div>
                  <div className="horario__meta">
                    {h.entrenador} · {h.disponibles} de {h.cupoMaximo} lugares
                  </div>
                </div>
                {h.disponibles === 0 ? (
                  <span className="horario__lleno">Lleno</span>
                ) : (
                  <button
                    className="boton boton--chico"
                    onClick={() => inscribir(h.id)}
                    disabled={enviando !== null}
                  >
                    {enviando === h.id ? 'Inscribiendo…' : 'Inscribirme'}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </>
  );
}
