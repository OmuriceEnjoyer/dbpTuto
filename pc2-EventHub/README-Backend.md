# EventHub API

Backend REST para la agenda cultural **EventHub**. Construido con Spring Boot 3.5, H2 in-memory y JWT.

## Inicio rápido

```bash
./mvnw spring-boot:run
```

El servidor inicia en `http://localhost:8081`.

- **Swagger UI:** http://localhost:8081/swagger-ui.html
- **H2 Console:** http://localhost:8081/h2-console  
  - JDBC URL: `jdbc:h2:mem:eventhubdb`
  - Usuario: `sa` | Contraseña: *(vacía)*

## Usuarios pre-cargados

| username | password | email |
|---|---|---|
| `municipalidad` | `password123` | eventos@muni.gob.pe |
| `club.atletico` | `password123` | contacto@clubatletico.pe |
| `utec.cultura` | `password123` | cultura@utec.edu.pe |

---

## Endpoints

### Autenticación

#### `POST /auth/register` — Registrar usuario

**Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "fullName": "string"
}
```

**Respuesta `200`:**
```json
{ "token": "eyJ..." }
```

**Errores:** `400` campos inválidos · `409` username o email ya existe

---

#### `POST /auth/login` — Iniciar sesión

**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Respuesta `200`:**
```json
{ "token": "eyJ..." }
```

**Errores:** `401` credenciales inválidas

---

### Eventos
Todos los endpoints requieren header: `Authorization: Bearer <token>`

#### `GET /events` — Listar eventos paginado

**Query params:** `page` (default `0`) · `size` (default `10`)

**Respuesta `200`:**
```json
{
  "content": [
    {
      "id": 1,
      "name": "Festival de Verano 2026",
      "description": "Gran festival de música y arte...",
      "eventDate": "2026-01-15T18:00:00",
      "location": "Parque de la Exposición, Lima",
      "maxCapacity": 5000,
      "category": "CULTURAL",
      "organizerUsername": "municipalidad"
    }
  ],
  "totalPages": 3,
  "totalElements": 8,
  "number": 0,
  "size": 10
}
```

**Categorías posibles:** `CULTURAL` · `DEPORTIVO` · `ACADEMICO`

---

#### `GET /events/{id}` — Obtener evento por ID

**Respuesta `200`:** objeto evento completo

**Errores:** `404` no encontrado

---

#### `POST /events` — Crear evento

**Body:**
```json
{
  "name": "string (requerido)",
  "description": "string (requerido)",
  "eventDate": "2026-09-01T20:00:00",
  "location": "string",
  "maxCapacity": 500,
  "category": "CULTURAL"
}
```

**Respuesta `201`:** objeto evento creado

**Errores:** `400` validación

---

#### `PUT /events/{id}` — Actualizar evento

Solo puede actualizar el organizador del evento.

**Body:** mismo esquema que POST

**Respuesta `200`:** objeto evento actualizado

**Errores:** `404` no encontrado · `403` no autorizado

---

#### `DELETE /events/{id}` — Eliminar evento

Solo puede eliminar el organizador del evento.

**Respuesta `204`:** sin contenido

**Errores:** `404` no encontrado · `403` no autorizado

---

## Estructura del proyecto

```
src/main/java/utec/cs2031/eventhub/
├── EventHubApplication.java
├── SecurityConfig.java
├── GlobalExceptionHandler.java
├── DataInitializer.java
├── auth/
│   ├── AuthController.java
│   ├── AuthService.java
│   ├── JwtUtil.java
│   ├── JwtAuthFilter.java
│   ├── LoginRequest.java
│   ├── RegisterRequest.java
│   └── AuthResponse.java
├── user/
│   ├── domain/
│   │   ├── User.java
│   │   └── UserDetailsServiceImpl.java
│   └── infrastructure/
│       └── UserRepository.java
└── event/
    ├── application/
    │   └── EventController.java
    ├── domain/
    │   ├── Event.java
    │   ├── EventCategory.java
    │   ├── EventRequest.java
    │   ├── EventResponse.java
    │   └── EventService.java
    └── infrastructure/
        └── EventRepository.java
```
