# gimnasio-backend

La API del gimnasio que consume el frontend de las Prácticas 15 a 18. Es la misma API de la
Unidad II (NestJS 11 + Prisma 7 + MySQL, con JWT y roles de la Práctica 10). Se le hicieron
cuatro ajustes para que el frontend tenga lo que necesita: imágenes de las clases, registro
que crea al miembro, «mis inscripciones» e inscribirse sin mandar el `miembroId`.

---

## Requisitos

- Node 20.19 o 22.12 en adelante.
- MySQL 8 corriendo, el mismo de la Unidad II.

---

## Cómo correrlo

```bash
git clone <url-de-gimnasio-backend> gimnasio-backend
cd gimnasio-backend
npm install
cp .env.ejemplo .env                    # y pon tu contraseña de root de MySQL
npx prisma migrate dev --name inicial   # crea la base "gimnasio_web" y sus tablas
npx prisma generate                     # genera el cliente en src/generado (Prisma 7 ya no lo hace solo)
npx prisma db seed                      # 8 clases, 16 horarios, 3 miembros y 4 cuentas
npm run start:dev
```

Abre `http://localhost:3000/clases`: un JSON con `data` y `meta`. La documentación de todas las
rutas está en `http://localhost:3000/docs`.

> La base se llama **`gimnasio_web`**, no `gimnasio`. Es a propósito: así no choca con la base
> y las migraciones de la Unidad II.

---

## Cuentas de prueba

Todas usan la contraseña **`gimnasio2026`**.

| Correo | Rol | Nota |
|---|---|---|
| `karla@itson.mx` | miembro | Ya está inscrita a Yoga del lunes |
| `omar@itson.mx` | miembro | Ocupa el único lugar del horario 3 |
| `ana@itson.mx` | entrenador | |
| `admin@itson.mx` | admin | |

---

## Rutas

| Método y ruta | Quién | Qué regresa |
|---|---|---|
| `GET /clases` | cualquiera | Las 8 clases, con `categoria`, `descripcion`, `duracionMin` e `imagen` |
| `GET /clases/:id` | cualquiera | La clase **con sus horarios**, y en cada uno los lugares `disponibles` |
| `GET /img/clase-01.jpg` | cualquiera | La imagen de la clase (archivo estático) |
| `POST /auth/registro` | cualquiera | `{ nombre, correo, password }` → crea el miembro y su cuenta, y regresa el token |
| `POST /auth/login` | cualquiera | `{ correo, password }` → `{ access_token, usuario: { correo, nombre, rol } }` |
| `GET /auth/yo` | con token | Lo que viene dentro del token |
| `GET /inscripciones/mias` | con token | Las inscripciones de quien viene en el token, con su clase y horario |
| `POST /inscripciones` | con token | `{ horarioId }` → 201. El miembro sale del token |
| `GET /inscripciones` | entrenador o admin | Todas |
| `DELETE /inscripciones/:id` | entrenador o admin | Cancela |

Toda respuesta exitosa viene en el sobre de la Práctica 9B: `{ data, meta }`.

### Los errores que va a ver el frontend

| Código | Cuándo | `message` |
|---|---|---|
| 400 | Registro con datos malos | Un arreglo, uno por regla: `["el nombre es obligatorio", …]` |
| 401 | Login con contraseña equivocada | `Credenciales inválidas` |
| 401 | Ruta protegida sin token, o con el token vencido | `Unauthorized` |
| 403 | La cuenta no es de un miembro (entrenador o admin queriendo inscribirse) | `Tu cuenta no es de un miembro del gimnasio` |
| 404 | `GET /clases/99` | `No existe la clase 99` |
| 409 | Inscribirse dos veces al mismo horario | `Ya estás inscrito en este horario` |
| 409 | El horario ya no tiene lugares (prueba el 3) | `Este horario ya está lleno (cupo de 1)` |
| 409 | Registrarse con un correo que ya existe | `Ese correo ya está registrado` |

`peticiones.http` tiene todas, listas para la extensión REST Client de VS Code.

---

## Qué cambió respecto a la Práctica 10

| Archivo | Cambio |
|---|---|
| `prisma/schema.prisma` | `Clase` tiene `categoria`, `descripcion`, `duracionMin` e `imagen`; `Usuario` tiene `nombre` |
| `public/img/` y `main.ts` | Las imágenes de las clases, servidas con `useStaticAssets` |
| `main.ts` | CORS acepta también `FRONTEND_URL` (para el despliegue) |
| `clases/` | `GET /clases/:id` incluye los horarios con sus lugares disponibles; `ParseIntPipe` en el id |
| `auth/` | El registro pide `nombre`, ya no acepta `rol` ni `miembroId`, y crea al miembro en una transacción. Login y registro regresan `usuario` |
| `inscripciones/` | `GET /inscripciones/mias`; en `POST` el `miembroId` es opcional (sale del token); `GET /inscripciones` solo para el personal |
| `inscripciones/dominio/errores.ts` | Los mensajes de los 409, escritos para una persona |
| `auth/guards/roles.guard.ts` | La tarea de la Práctica 10, ya integrada |

---

## Posibles errores

| Síntoma | Causa | Qué hacer |
|---|---|---|
| `Error: Cannot find module '../src/generado/prisma/client'` al correr el seed o al arrancar | No se generó el cliente: en Prisma 7, `migrate dev` ya no corre `generate` solo | `npx prisma generate` y repetir |
| `Can't reach database server` o `Access denied for user 'root'` | MySQL apagado, o la contraseña de `.env` está mal | Revisar `DATABASE_URL` en `.env` |
| `Environment variable not found: DATABASE_URL` | No existe el `.env` | `cp .env.ejemplo .env` |
| Todas las rutas protegidas dan 401 aunque mandes el token | El `JWT_SECRET` cambió después de iniciar sesión | Volver a iniciar sesión |
| `EADDRINUSE: address already in use :::3000` | Otra API corriendo (la de la tienda, por ejemplo) | Detenerla, o `PORT=3001` en `.env` y cambiar `baseURL` en el frontend |
| En el navegador: `blocked by CORS policy` | El frontend corre en otro puerto (5174) | Cerrar el otro Vite, o agregar el puerto en `enableCors` de `main.ts` |
| Las imágenes salen rotas en el frontend | Se pidió `/img/...` al puerto de Vite | La imagen va con la dirección de la API: `http://localhost:3000/img/clase-01.jpg` |
| Ya no hay lugares, o Karla ya tiene muchas clases | Pruebas de clase | `npx prisma db seed` lo regresa todo |

---

## Archivos

```
gimnasio-backend/
├── README.md, peticiones.http, .env.ejemplo
├── prisma/            schema.prisma, seed.ts
├── prisma.config.ts
├── public/img/        clase-01.jpg … clase-08.jpg
└── src/
    ├── main.ts        CORS, pipes, filtro, interceptores, guards, estáticos y /docs
    ├── auth/          registro, login, JWT, @Publico(), @Roles()
    ├── clases/  horarios/  miembros/  inscripciones/
    ├── comun/         filtro de dominio, interceptores (logging y sobre), middleware
    └── prisma/        PrismaService
```
