# Practica 17 — El gimnasio: rutas protegidas e inscripciones
## Jorge Cuevas Gastelum - 00000252274
## Topico de Aplicaciones Web 7:30 - 9:00 P:M

El mismo frontend de la Practica 16, ahora con inscripciones. Mis
inscripciones solo se ve con sesion; si no hay, te manda a /entrar y al
entrar te regresa a donde ibas. Desde el detalle de una clase ya se puede
inscribir, y si la API contesta 401 la sesion se cierra sola.

Lo nuevo esta en src/componentes/RutaProtegida.tsx,
src/paginas/PaginaMisInscripciones.tsx, los servicios inscribirme y
traerMisInscripciones en src/servicios/gimnasio.ts, el interceptor de
respuesta en src/servicios/api.ts y el boton Inscribirme en PaginaClase.
useMisInscripciones viene del codigo base.

Primero hay que tener corriendo gimnasio-backend en http://localhost:3000
con el seeder cargado. Luego se levanta con `npm install` y `npm run dev` y
se abre en http://localhost:5173. Las cuentas de prueba usan la contraseña
gimnasio2026: karla@itson.mx es miembro y ana@itson.mx es entrenadora.

Las capturas estan en la carpeta evidencias/.


## Preguntas — Ejercicio 1

### 1. ¿La ruta protegida hace segura la aplicacion? ¿Que es lo que de verdad protege los datos?

No. La ruta protegida solo decide que pagina se pinta. Todo el codigo del
frontend corre en el navegador de la persona, asi que cualquiera lo puede
brincar: editar el localStorage, cambiar el codigo desde las DevTools o de
plano no usar la pagina y pedirle los datos a la API directo con curl.

Lo que de verdad protege los datos es el backend. El JwtAuthGuard revisa en
cada peticion que venga un token valido firmado con el JWT_SECRET, y si no,
contesta 401 sin dar nada. Por eso con curl sin token
GET /inscripciones/mias responde 401 aunque el frontend ni exista.

La ruta protegida es para que la experiencia sea buena: en lugar de ver una
pagina vacia con un error, te manda a entrar y luego te regresa.

### 2. Comprobar con curl que GET /inscripciones/mias sin token responde 401

```bash
curl -i http://localhost:3000/inscripciones/mias
```

Responde `HTTP/1.1 401 Unauthorized` con
`{"message":"Unauthorized","statusCode":401}`.


## Preguntas — Ejercicio 2

### 1. ¿Por que no se manda el miembroId al inscribirse?

Porque el backend ya sabe quien eres: el miembroId viene adentro del token,
y el token esta firmado, asi que no se puede cambiar sin que el backend se
de cuenta.

Si el frontend mandara el miembroId, cualquiera podria cambiar ese numero en
la peticion e inscribir a otra persona. El backend tendria que desconfiar de
el de todos modos y compararlo con el del token. Es mas simple y mas seguro
que el frontend mande solo el horarioId y que el backend saque al miembro
del token.

### 2. ¿Que diferencia hay entre un 401 y un 403?

El 401 quiere decir "no se quien eres": no mandaste token, o el token es
falso o ya vencio. Se arregla volviendo a iniciar sesion, por eso el
interceptor cierra la sesion cuando llega un 401.

El 403 quiere decir "se quien eres, pero no puedes hacer esto". Por ejemplo,
ana@itson.mx es entrenadora y no miembro, asi que al inscribirse la API
contesta 403 "Tu cuenta no es de un miembro del gimnasio". Volver a entrar
no arregla nada, por eso con un 403 la sesion no se cierra y solo se
muestra el mensaje.
