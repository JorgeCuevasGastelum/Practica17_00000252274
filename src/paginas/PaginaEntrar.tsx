// <PaginaEntrar> — el formulario de inicio de sesión (controlado).
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useSesion } from '../sesion/SesionContext.tsx';
import { mensajeDeError } from '../servicios/api.ts';

export default function PaginaEntrar() {
  const { entrar } = useSesion();
  const navegar = useNavigate();
  // A dónde se quería ir antes de que nos mandaran aquí (lo deja RutaProtegida o el botón Inscribirme).
  const desde = (useLocation().state as { desde?: string } | null)?.desde ?? '/clases';
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault(); // sin esto el navegador recarga la página
    setError(null);
    setEnviando(true);
    try {
      await entrar(correo, password);
      navegar(desde, { replace: true }); // replace: "Atrás" no regresa al formulario
    } catch (e) {
      // 401: la API manda "Credenciales inválidas".
      setError(mensajeDeError(e, 'No se pudo iniciar sesión.'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={enviar}>
      <h1>Entrar</h1>
      {error && <p className="aviso aviso--error">{error}</p>}

      <label className="campo">
        <span className="campo__etiqueta">Correo</span>
        <input className="campo__control" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
      </label>

      <label className="campo">
        <span className="campo__etiqueta">Contraseña</span>
        <input className="campo__control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>

      <button className="boton boton--ancho" type="submit" disabled={enviando}>
        {enviando ? 'Entrando…' : 'Entrar'}
      </button>
      <p className="formulario__pie">¿No tienes cuenta? <Link to="/registro">Regístrate</Link></p>
    </form>
  );
}
