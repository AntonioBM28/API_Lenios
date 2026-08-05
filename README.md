# 🪵 Leños Rellenos API

Backend REST para **Leños Rellenos**, negocio de comida artesanal.
Construido con **NestJS + TypeORM + Supabase (Postgres)**.

---

## 🚀 Inicio rápido

```bash
# 1. Clonar e instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# → Editar .env con las credenciales de Supabase

# 3. Levantar en modo desarrollo
npm run start:dev

# 4. Verificar que funciona
curl http://localhost:3000/health

# 5. Explorar la API
# → Abrir http://localhost:3000/api/docs en el navegador
```

---

## 🐳 Entorno completo con Docker

Levanta **FrontEnd + BackEnd + Base de datos** con un solo comando, sin instalar Node ni Postgres localmente.

**Requisito:** clona `API_Lenios` y `App_Lenios` como carpetas **hermanas** dentro del mismo directorio padre (el `docker-compose.yml` referencia `App_Lenios` con una ruta relativa `../App_Lenios`):

```
proyectos/
├── API_Lenios/    ← ejecuta el comando desde aquí
└── App_Lenios/
```

```bash
cd API_Lenios
docker compose up --build
```

Esto levanta:

| Servicio | URL | Descripción |
|---|---|---|
| `web` (FrontEnd) | http://localhost:5173 | React + Vite servido como estático por Nginx |
| `api` (BackEnd) | http://localhost:3000 | NestJS API — Swagger en `/api/docs` |
| `postgres` (BD) | localhost:5432 | Postgres 16 local (reemplaza a Supabase solo en local) |

Para bajar todo (y borrar los datos de la BD local): `docker compose down -v`.

**Notas importantes:**
- Todos los valores en `docker-compose.yml` son de **desarrollo local únicamente** (contraseñas y secretos de ejemplo, PIN admin `1234`). Producción sigue usando Supabase + variables de entorno reales configuradas en el proveedor de nube — nunca este archivo.
- `DB_SSL=false` se usa solo aquí porque el Postgres local no tiene SSL configurado; en producción (Supabase) el default sigue siendo `true` (ver `src/config/env.validation.ts`).
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` llevan valores dummy en el compose: la validación de entorno (Joi) los exige, pero el código todavía no los usa en runtime (reservados para storage/auth/realtime futuros).
- El primer arranque del `api` puede reintentar la conexión un par de veces mientras Postgres termina de inicializar — es normal, `depends_on: condition: service_healthy` ya espera el healthcheck de Postgres antes de arrancar.

Para reconstruir solo un servicio tras cambiar código: `docker compose up --build api` (o `web`).

---

## ⚙️ CI/CD (GitHub Actions)

| Workflow | Se dispara | Qué hace |
|---|---|---|
| `.github/workflows/ci.yml` | PR hacia `develop` o `main` | `npm ci` → lint → tests (Jest) → build |
| `.github/workflows/cd.yml` | Push a `main` (merge de PR) | Repite test+build y, si pasan, dispara el deploy hook de Render |

**Setup único (una vez que el repo esté en GitHub):**

1. Crea un **Web Service** en [Render](https://render.com) (plan gratis) apuntando a este repo, `Runtime: Docker`.
2. Configura ahí las variables de entorno reales de producción (Supabase, JWT_SECRET, etc. — igual que tu `.env`, pero nunca subas ese archivo).
3. En el servicio → **Settings → Deploy Hook**, copia la URL.
4. En GitHub: `Settings → Secrets and variables → Actions → New repository secret` → nombre `RENDER_DEPLOY_HOOK_URL`, valor la URL copiada.

Desde ahí, cada push a `main` (después de que pasen los tests) dispara un deploy automático.

---

## 📁 Estructura de carpetas

```
src/
├── common/                     # Código compartido global
│   ├── filters/                # AllExceptionsFilter (errores en JSON consistente)
│   ├── pipes/                  # Pipes personalizados (futuros)
│   ├── decorators/             # Decoradores personalizados (futuros)
│   └── interceptors/           # Interceptores (futuros)
│
├── config/                     # Configuración tipada
│   ├── env.validation.ts       # Schema Joi → falla rápido si faltan vars de env
│   └── app.config.ts           # Namespaces de configuración (app, database, supabase)
│
├── database/                   # Base de datos
│   ├── database.module.ts      # TypeOrmModule.forRootAsync → Supabase/Postgres
│   ├── data-source.ts          # DataSource para TypeORM CLI (solo migraciones)
│   └── migrations/             # Archivos de migración generados automáticamente
│
├── health/                     # Health check
│   ├── health.controller.ts    # GET /health → verifica API + DB
│   └── health.module.ts
│
├── modules/                    # Módulos de negocio
│   ├── products/               # Catálogo de productos
│   ├── categories/             # Categorías del menú
│   ├── orders/                 # Pedidos y sus detalles
│   ├── business-hours/         # Horarios de atención
│   └── auth/                   # Acceso simple del admin (PIN + JWT corto)
│
├── app.module.ts               # Módulo raíz
└── main.ts                     # Bootstrap: CORS, Swagger, ValidationPipe, filtros
```

---

## 🏗️ Arquitectura Limpia (Clean Architecture)

Cada módulo de negocio sigue esta estructura de 4 capas:

```
modules/[nombre]/
├── domain/             ← NÚCLEO del negocio
│   ├── [entity].ts           Entidad de dominio PURA (sin frameworks)
│   ├── [repo].interface.ts   Puerto (interfaz) del repositorio
│   └── value-objects/        Objetos de valor con reglas de dominio
│
├── application/        ← CASOS DE USO
│   ├── use-cases/            Lógica de aplicación (orquesta el dominio)
│   ├── dtos/                 DTOs de entrada/salida (interfaces de app)
│   └── [module].service.ts   Servicio NestJS que expone los casos de uso
│
├── infrastructure/     ← IMPLEMENTACIONES CONCRETAS
│   ├── entities/             Entidades TypeORM (@Entity, @Column, etc.)
│   └── repositories/         Implementación de IRepository con TypeORM
│
└── presentation/       ← INTERFAZ HTTP
    ├── [module].controller.ts   Endpoints REST
    └── dtos/                    DTOs con class-validator + @ApiProperty
```

### Regla de dependencias

```
presentation → application → domain
infrastructure → domain (implementa las interfaces)
```

> **Dominio** no conoce NestJS, TypeORM ni Express.
> **Aplicación** no conoce TypeORM ni Express, solo interfaces del dominio.
> **Infraestructura** implementa los puertos del dominio con TypeORM.
> **Presentación** transforma HTTP ↔ Application DTOs.

---

## 🧩 Patrones de diseño

Cinco patrones presentes en el BackEnd (Actividad 3, criterio 2). Los marcados con 📝 tienen un docblock explícito (`Patrón: ...`) en el archivo de origen; los otros dos se evidencian en la estructura del código.

| # | Patrón | Dónde | Documentado |
|---|---|---|---|
| 1 | Repository | `modules/*/domain/*.repository.interface.ts` + `modules/*/infrastructure/typeorm-*.repository.ts` | 📝 `order.repository.interface.ts`, `product.repository.interface.ts` |
| 2 | Factory Method | `database/database.module.ts` (`TypeOrmModule.forRootAsync({ useFactory })`) | 📝 |
| 3 | Strategy | `modules/auth/domain/token-issuer.interface.ts` + `infrastructure/jwt-token-issuer.service.ts` | 📝 |
| 4 | Dependency Injection | Contenedor IoC de NestJS: tokens `Symbol` (`ORDER_REPOSITORY`, `PRODUCT_REPOSITORY`, etc.) inyectados vía `providers` en cada `*.module.ts` | Estructural (no requiere docblock aparte) |
| 5 | Data Mapper | `modules/*/infrastructure/*.mapper.ts` (`OrderMapper`, `CustomerMapper`, `ProductMapper`, etc.) — traducen entidad ORM ↔ entidad de dominio | Estructural (no requiere docblock aparte) |

---

## 🗄️ Base de datos

```bash
# Generar una migración (después de crear/modificar entidades ORM)
npm run migration:generate --name=CreateProductsTable

# Ejecutar migraciones pendientes
npm run migration:run

# Revertir la última migración
npm run migration:revert

# Ver estado de las migraciones
npm run migration:show
```

---

## 🌐 Variables de entorno

| Variable | Descripción | Requerida |
|---|---|---|
| `PORT` | Puerto del servidor | No (default: 3000) |
| `NODE_ENV` | Entorno de ejecución | No (default: development) |
| `SUPABASE_DB_HOST` | Host de Postgres en Supabase | ✅ |
| `SUPABASE_DB_PORT` | Puerto de Postgres | No (default: 5432) |
| `SUPABASE_DB_USER` | Usuario de Postgres | ✅ |
| `SUPABASE_DB_PASSWORD` | Contraseña de Postgres | ✅ |
| `SUPABASE_DB_NAME` | Nombre de la base de datos | ✅ |
| `SUPABASE_URL` | URL del proyecto Supabase | ✅ |
| `SUPABASE_ANON_KEY` | Clave anónima de Supabase | ✅ |
| `WHATSAPP_BUSINESS_NUMBER` | Número de WhatsApp del negocio (E.164 sin "+") | ✅ |
| `ADMIN_ACCESS_CODE_HASH` | Hash **bcrypt** del PIN del panel admin (nunca el PIN en texto plano — ver sección de hashing abajo) | ✅ |
| `JWT_SECRET` | Secreto para firmar los JWT de sesión del admin | ✅ |
| `JWT_ADMIN_EXPIRATION` | Vida del token de sesión del admin | No (default: 12h) |

---

## 🔐 Autenticación del panel admin

El caso de estudio pide explícitamente **evitar un login complejo**: el negocio
tiene un único operador, así que el acceso es un código (PIN) validado en el
servidor, no un sistema de usuarios/roles.

**Flujo:**

1. `POST /auth/admin/login` con `{ "code": "<PIN>" }`.
   - Código correcto → `200` con `{ token, expiresIn }`.
   - Código incorrecto → `401` con mensaje genérico ("Código incorrecto").
   - Limitado a **5 intentos por minuto por IP** (`@nestjs/throttler`) para
     dificultar fuerza bruta sobre un PIN corto.
2. Guarda el `token` recibido (en el cliente: memoria/sessionStorage, no hace
   falta persistirlo más allá de la sesión del navegador).
3. Envíalo en cada llamada administrativa como header:
   `Authorization: Bearer <token>`.
4. El token expira solo (`JWT_ADMIN_EXPIRATION`, 12h por defecto). No hay
   "logout" en el servidor ni revocación: cerrar sesión es simplemente dejar
   de enviar el token. No hay refresh token ni recuperación de PIN — si se
   pierde/cambia el acceso, se genera un nuevo hash (ver sección siguiente)
   y se actualiza `ADMIN_ACCESS_CODE_HASH` en el `.env`.

**Endpoints protegidos con `AdminGuard`** (requieren el header `Authorization`):
`POST/PATCH/DELETE /products` (+ `PATCH /products/:id/stock`),
`POST/PATCH/DELETE /categories`, `PUT /business-hours`,
`GET/PATCH/DELETE /orders` (el `POST /orders` del checkout del cliente es público).

En Swagger (`/api/docs`) los endpoints protegidos muestran un candado 🔒:
haz login con `POST /auth/admin/login`, copia el `token`, y pégalo en el botón
**Authorize** (arriba a la derecha) para probarlos desde la UI.

---

## 🔑 Hashing del PIN de acceso

El PIN del admin **nunca se guarda ni se compara en texto plano** — se trata
con el mismo cuidado que una contraseña, aunque no exista una tabla de
usuarios (es un acceso de un único operador, decisión intencional del caso
de estudio). En su lugar, `.env` guarda el **hash bcrypt** del PIN
(`ADMIN_ACCESS_CODE_HASH`), y `LoginAdminUseCase` verifica el código
recibido con `bcrypt.compare()` en vez de `===`.

Se eligió **bcrypt** sobre Argon2 porque no requiere un binario nativo
adicional a lo que ya trae el paquete `bcrypt` (maduro, muy usado en el
ecosistema NestJS) y su costo configurable (factor **12** aquí) alcanza de
sobra para un único login humano — no hace falta el ajuste fino de
memoria/paralelismo que ofrece Argon2 para este caso de uso tan simple.

**Generar el hash de tu PIN:**

```bash
npm run hash:pin -- 1234
```

Esto imprime el hash bcrypt correspondiente y la línea lista para copiar a
tu `.env`:

```
Hash generado (bcrypt, costo 12):

$2b$12$7Sauaw4Rd9FiHTGxhsvZou7Znvl63bs0RupRvsJaQMZewbkegm7Fi

Agrega esto a tu .env:

ADMIN_ACCESS_CODE_HASH=$2b$12$7Sauaw4Rd9FiHTGxhsvZou7Znvl63bs0RupRvsJaQMZewbkegm7Fi
```

> ⚠️ En producción usa un PIN más largo/aleatorio que el ejemplo (`1234`) y
> un `JWT_SECRET` largo y aleatorio (ej. `openssl rand -hex 32`). El PIN en
> texto plano no se guarda en ningún archivo ni log — genera el hash, cópialo
> a `.env`, y olvida el PIN de la terminal (`history -c` si lo tipeaste).

**Si `ADMIN_ACCESS_CODE_HASH` falta o no tiene formato de hash bcrypt válido**,
la app **no arranca**: la validación de entorno (Joi) y `LoginAdminUseCase`
fallan rápido al inicio con un mensaje claro, en vez de fallar silenciosamente
en cada intento de login.

**Cómo evidenciar este criterio** (hashing de contraseñas): abre `.env` y
confirma que la variable es `ADMIN_ACCESS_CODE_HASH=$2b$12$...` — una cadena
bcrypt de 60 caracteres, no el PIN legible. El PIN en texto plano no aparece
en ningún archivo del repositorio, ni en `.env`, ni en `.env.example` (que
solo trae un hash de ejemplo, comentado como referencia de formato).

---

## 🕵️ Trazabilidad, Bitácoras de Auditoría y Transferencias de Datos

El módulo `audit-log` registra **quién, cuándo y qué acción** se realizó
sobre datos personales/recursos sensibles, sin escribir nunca el dato
personal en sí — solo IDs de referencia y metadata técnica.

**Acciones auditadas:** login del admin (éxito/fallo), alta/baja de pedidos,
cambio de estado de pedido, alta/edición/baja de productos, actualización de
horario, y la transferencia de datos a WhatsApp al confirmar un pedido.

**Consulta (solo lectura):**

```
GET /audit-logs                          (requiere token admin)
GET /audit-logs?accion=ORDER_CREATED
GET /audit-logs?entidad=pedido
GET /audit-logs?desde=2026-08-01T00:00:00.000Z&hasta=2026-08-31T23:59:59.999Z
GET /audit-logs?limit=50&offset=0        (paginado, límite máx. 200)
```

**Regla de oro:** `audit_logs` nunca contiene nombre, teléfono ni dirección —
solo `entidad_id` (UUID) y `metadata` técnica (ej. `{ estadoAnterior,
estadoNuevo }`, `{ camposActualizados: [...] }`, `{ canal: 'whatsapp' }`).
La IP se captura vía `RequestContextInterceptor` (interceptor global en
`common/interceptors/`) y se reenvía a cada use case con el decorador
`@AuditContext()` — el interceptor solo sabe de HTTP (IP/método/ruta), la
decisión de qué acción de negocio auditar vive en cada use case.

**Transferencias de Datos (consentimiento):** `POST /orders` ahora exige
`consentimientoAceptado: true` en el body — si falta o es `false`, responde
`400` (el backend valida esto de forma independiente al checkbox del
frontend). Al crear el pedido se persiste `consentimiento_aceptado` y
`consentimiento_fecha` en la tabla `pedidos`, y se registra un evento
`WHATSAPP_TRANSFER` en la bitácora como evidencia concreta de que la
transferencia a un tercero (WhatsApp) ocurrió con consentimiento y de
cuándo ocurrió.

> ⚠️ TODO de integración: el frontend ya implementó el checkbox de
> consentimiento (no pre-marcado), pero su llamada a `POST /orders` debe
> actualizarse para enviar `consentimientoAceptado` en el body — mientras
> tanto, cualquier request sin ese campo recibirá `400`.

---

## 📡 Endpoints disponibles

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/health` | Estado de API y base de datos |
| `GET` | `/api/docs` | Swagger UI (solo en development) |

> Los endpoints de negocio (products, categories, orders, etc.)
> se implementarán requerimiento por requerimiento.

---

## 🔒 Formato de errores

Todos los errores de la API tienen el mismo formato JSON:

```json
{
  "statusCode": 400,
  "message": ["name must be a string", "price must be a positive number"],
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/products"
}
```

---

## 🧱 Módulos de negocio (estado actual)

| Módulo | Estado | RF |
|---|---|---|
| `products` | ✅ Implementado | RF1, RF5 |
| `categories` | ✅ Implementado | RF1 |
| `orders` | ✅ Implementado | RF2, RF3, RF4 |
| `business-hours` | ✅ Implementado | RF6 |
| `auth` | ✅ Implementado | RF8 |
