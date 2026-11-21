# Guía Rápida — PC2 Lab: React + TypeScript + Axios + React Router

> Esta guía está pensada para copiarse **a mano** como apunte de examen. El archivo `snippets-pc-2.md` que te dio el profesor es distinto: ese lo vas a poder **abrir tal cual** durante el examen, así que no necesitas copiar ese código a mano — solo necesitas entender qué hace, cuándo usarlo, y qué ajustes concretos hacerle una vez que lo pegues en tu proyecto real. Esta guía te explica exactamente eso, paso a paso, sin asumir que ya sabes qué cambiar.

---

## Índice

0. [Checklist de arranque](#0-checklist-de-arranque)
0.1. [Cómo usar esta guía junto con los snippets del profesor](#01-cómo-usar-esta-guía-junto-con-los-snippets-del-profesor)
1. [Proxy de Vite (evitar CORS)](#1-proxy-de-vite-evitar-cors)
2. [Tipos (`types/`)](#2-tipos-types)
3. [Cliente Axios: instancia compartida + interceptores](#3-cliente-axios-instancia-compartida--interceptores)
4. [Hook `useLocalStorage` y `AuthContext`](#4-hook-uselocalstorage-y-authcontext)
5. [Rutas protegidas (`ProtectedRoute`)](#5-rutas-protegidas-protectedroute)
6. [Servicios (`services/`)](#6-servicios-services)
7. [Páginas (`pages/`) — patrones genéricos](#7-páginas-pages--patrones-genéricos)
8. [Layouts y enrutamiento anidado con `Outlet`](#8-layouts-y-enrutamiento-anidado-con-outlet)
9. [Componentes reutilizables comunes](#9-componentes-reutilizables-comunes)
10. [⚠️ Patrón a vigilar: recursos sin endpoint GET](#10-️-patrón-a-vigilar-recursos-sin-endpoint-get)
11. [Rutas dinámicas con `useParams`](#11-rutas-dinámicas-con-useparams)
12. [Errores comunes / Debugging rápido](#12-errores-comunes--debugging-rápido)

---

## 0. Checklist de arranque

```bash
# 1. Crear proyecto
pnpm create vite@latest
# → elegir nombre, luego "React" y "TypeScript"

cd nombre-del-proyecto
pnpm install

# 2. Instalar dependencias adicionales
pnpm add axios react-router-dom

# 3. Levantar el backend (en otra terminal, dentro del repo del backend)
./mvnw spring-boot:run
# revisa el README del backend para confirmar el puerto (normalmente http://localhost:8080)

# 4. Levantar el frontend
pnpm dev
# corre en http://localhost:5173
```

Estructura de carpetas sugerida dentro de `src/` (puedes usar otros nombres, pero si copias los snippets del profesor **tal cual**, presta atención a las rutas de import — ver sección 0.1 y 3):

```
src/
├── api/
│   └── axios.ts
├── components/
│   ├── ProtectedRoute.tsx
│   ├── Layout.tsx
│   ├── LayoutLogin.tsx
│   ├── Navbar.tsx
│   ├── Button.tsx
│   ├── FormField.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorMessage.tsx
│   └── ConfirmModal.tsx
├── context/
│   └── AuthContext.tsx
├── hooks/
│   ├── useFetch.ts
│   └── useLocalStorage.ts
├── pages/
│   ├── RegisterPage.tsx
│   ├── LoginPage.tsx
│   ├── LogoutPage.tsx
│   ├── ListPage.tsx
│   └── DetailPage.tsx
├── services/
│   └── resourceService.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

**Primer paso siempre, antes de escribir código:** abre el README/enunciado del backend y anota en un papel aparte:
1. El puerto del backend (para configurarlo en el proxy de Vite).
2. Los campos exactos de cada payload (register/login/recurso principal).
3. Qué endpoints tienen GET y cuáles solo POST/DELETE (ver sección 10).
4. Qué endpoints requieren token y cuáles son públicos.
5. El formato exacto de un mensaje de error del backend (para el tipo `ApiError`, sección 2).

---

## 0.1. Cómo usar esta guía junto con los snippets del profesor

El archivo del profesor (`snippets-pc-2.md`) trae varios bloques de código ya listos: patrones de interceptores de Axios, un hook de `localStorage`, y un ejemplo de enrutamiento con layouts, entre otros. **Vas a poder abrir ese archivo durante el examen y copiar esos bloques directamente** — no hace falta que los memorices ni que los copies a mano en tus apuntes. Esta guía se enfoca en el patrón de interceptores para Axios (sección 3), que es el que vamos a usar de forma consistente en todo el proyecto.

Lo que sí necesitas tener a mano (en esta guía, escrita por ti) es:

1. **Qué hace cada snippet** — para saber cómo encaja dentro de la arquitectura general del proyecto (dónde va, qué otro archivo depende de él).
2. **Qué le falta al snippet** — algunos bloques del profesor asumen que ya existen ciertos archivos (un contexto de auth, un componente `Layout`) que él no te da armados — tienes que crearlos tú, y esta guía te dice exactamente cómo. En esta guía **usamos Proxy de Vite en vez de un archivo `constants.ts`** para simplificar — si un snippet del profesor menciona `constants.API_HOST`, la sección 3 te muestra exactamente qué cambiarle para que funcione igual sin ese archivo.
3. **Qué ajustar** — algunos snippets usan rutas de import relativas que solo van a funcionar si tu proyecto tiene exactamente la misma estructura de carpetas del profesor. Si organizas tus archivos distinto (como hacemos en esta guía, con `context/AuthContext.tsx` en vez de `components/auth/useAuth.ts`), tienes que cambiar esas líneas de import — esta guía te muestra el "antes/después" exacto en cada caso.

**Flujo recomendado durante el examen:**
1. Abre `snippets-pc-2.md` y esta guía lado a lado.
2. Para cada archivo que vayas a crear, revisa primero en esta guía si hay un snippet oficial del profesor para eso.
3. Si lo hay, cópialo del archivo del profesor directamente a tu proyecto.
4. Vuelve a esta guía y aplica los ajustes puntuales que se indican en la sección correspondiente (nombres de archivo, imports, tipos que debes definir tú).
5. Si algo no compila o no funciona, revisa la sección 12 (Errores comunes).

---

## 1. Proxy de Vite (evitar CORS)

Usamos **únicamente** el proxy de Vite en toda esta guía — no vamos a crear ningún archivo `constants.ts`. Es una sola configuración, en un solo archivo que ya existe (`vite.config.ts`), y no tienes que inventar ni completar nada adicional.

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // ajusta el puerto según el README del backend
        changeOrigin: true,
      },
    },
  },
})
```

**Cómo funciona:** cualquier petición que tu frontend haga a una ruta que empiece con `/api` es interceptada por el servidor de desarrollo de Vite y reenviada internamente hacia el backend. Desde el punto de vista del navegador, la petición nunca sale de `localhost:5173` — por eso no hay problema de CORS.

**Regla que vas a repetir en todo el proyecto:** cualquier `baseURL` de Axios que definas (sección 3) siempre va a ser la ruta relativa `'/api'` — nunca la URL completa del backend.

---

## 2. Tipos (`types/`)

```typescript
// types/index.ts

// --- Auth (prácticamente idéntico en cualquier backend de este curso) ---
export interface RegisterPayload {
  email: string
  password: string
  name: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
}

// --- Error del backend — usado por el interceptor de respuesta (sección 3).
//     AJUSTA los campos según cómo el backend estructure sus errores;
//     revisa el README para ver un ejemplo real de una respuesta 400/403/500 ---
export interface ApiError {
  message: string
}

// --- Recurso principal — renombra "Resource" y ajusta los campos
//     según el README del backend que te toque ---
export interface Resource {
  id: number
  title: string
  // ...otros campos según la documentación del backend
}

// --- Payload para un recurso "derivado" del usuario
//     (ej. favoritos, carrito, inscripciones, asistencia) ---
export interface UserResourceLink {
  resourceId: number
  status?: string
}
```

---

## 3. Cliente Axios: instancia compartida + interceptores

Esta es la única forma que usamos en toda esta guía para adjuntar el JWT automáticamente a las peticiones: una instancia de Axios compartida, con interceptores. Funciona igual para endpoints públicos y protegidos (si no hay token, simplemente no agrega el header, sin lanzar error), y tus `services/` pueden ser funciones normales de TypeScript — no dependen de estar "dentro" de un componente de React.

```typescript
// api/axios.ts
import axios from 'axios'
import type { InternalAxiosRequestConfig, AxiosError } from 'axios'
import type { ApiError } from '../types'

const api = axios.create({
  baseURL: '/api', // ruta relativa — el proxy de Vite (sección 1) la reenvía al backend
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de REQUEST: agrega el token si existe (copiado del snippet "Interceptors in Axios")
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

// Interceptor de RESPONSE: si el backend responde 401, la sesión ya no es válida
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login' // ajusta a la ruta real de tu login, ej. /auth/login
    }
    return Promise.reject(error)
  },
)

export default api
```

**Ajuste importante si copias el snippet del profesor tal cual:** en su hoja, el bloque de interceptores viene suelto, asumiendo que ya existe una variable `api`. Tú tienes que **pegarlo después** de la línea `axios.create(...)`, no antes — un interceptor solo se puede agregar sobre una instancia que ya existe.

Con este enfoque, cualquier `service` simplemente importa `api` y lo usa directamente (ver sección 6) — no hace falta ningún hook adicional.

---

## 4. Hook `useLocalStorage` y `AuthContext`

El profesor te da este hook genérico para sincronizar un valor con `localStorage`:

```typescript
// hooks/useLocalStorage.ts (snippet del profesor, cópialo tal cual)
import { useState } from "react";

export const useLocalStorage = (keyName: string, defaultValue: string): [string, (value: string) => void] => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const value = window.localStorage.getItem(keyName);
            if (value) {
                return value;
            } else {
                window.localStorage.setItem(keyName, defaultValue);
                return defaultValue;
            }
        } catch (err) {
            return defaultValue;
        }
    });

    const setValue = (newValue: string) => {
        try {
            window.localStorage.setItem(keyName, newValue);
        } catch (err) {
            console.log(err);
        }

        setStoredValue(newValue);
    };

    return [storedValue, setValue];
};
```

**Detalle importante que el snippet no explica:** este hook **solo maneja strings**. Si en algún momento necesitas guardar algo que no es un string plano (por ejemplo, una lista de IDs de favoritos, ver sección 10), tienes que convertirlo tú mismo con `JSON.stringify` al guardar y `JSON.parse` al leer:

```typescript
const [linkedIdsRaw, setLinkedIdsRaw] = useLocalStorage('linkedIds', '[]')
const linkedIds: number[] = JSON.parse(linkedIdsRaw)

const updateLinkedIds = (newIds: number[]) => {
  setLinkedIdsRaw(JSON.stringify(newIds))
}
```

### `AuthContext.tsx` usando `useLocalStorage`

```tsx
// context/AuthContext.tsx
import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import api from '../api/axios'
import type { LoginPayload, RegisterPayload, AuthResponse } from '../types'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface AuthContextType {
  token: string
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useLocalStorage('token', '')

  const login = async (payload: LoginPayload) => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    setToken(data.token)
  }

  const register = async (payload: RegisterPayload) => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    setToken(data.token)
  }

  const logout = () => {
    setToken('')
  }

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de un <AuthProvider>')
  return ctx
}
```

**Fíjate en un detalle sutil:** `token` aquí nunca es `null` — es un string vacío (`''`) cuando no hay sesión, porque `useLocalStorage` siempre trabaja con strings. `isAuthenticated: !!token` sigue funcionando igual, porque en JavaScript un string vacío `''` se evalúa como `false` (es "falsy"), y cualquier string con contenido se evalúa como `true`.

**Si NO quieres usar `useLocalStorage`** (por ejemplo, porque prefieres manejar `token: string | null` explícitamente), también puedes escribir el `AuthContext` con `useState` + `localStorage.getItem/setItem` manual, como en versiones anteriores de esta guía — ambos enfoques son válidos, elige el que te resulte más cómodo de recordar y sé consistente.

---

## 5. Rutas protegidas (`ProtectedRoute`)

```tsx
// components/ProtectedRoute.tsx
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace /> {/* ajusta la ruta a donde vive tu Login */}
  }

  return <>{children}</>
}
```

Este componente es compatible tal cual con el patrón de layouts de la sección 8 (`<ProtectedRoute><Layout /></ProtectedRoute>`), porque simplemente renderiza lo que reciba como `children` si el usuario está autenticado.

---

## 6. Servicios (`services/`)

Este patrón usa la instancia compartida `api` de la sección 3.

```typescript
// services/resourceService.ts
import api from '../api/axios'
import type { Resource } from '../types'

export const getResources = async (): Promise<Resource[]> => {
  const { data } = await api.get<Resource[]>('/resource/list') // ajusta la ruta según el README
  return data
}

export const getResourceById = async (id: number): Promise<Resource> => {
  const { data } = await api.get<Resource>(`/resource/${id}`)
  return data
}

export const addToUserList = async (resourceId: number): Promise<void> => {
  await api.post('/user/resource-link', { resourceId })
}

export const removeFromUserList = async (resourceId: number): Promise<void> => {
  await api.delete('/user/resource-link', { data: { resourceId } })
}
```

> ⚠️ Para un `DELETE` con body en Axios, el payload va dentro de un objeto de configuración con la clave `data`. `api.delete('/ruta', payload)` **no funciona**; tiene que ser `api.delete('/ruta', { data: payload })`.

---

## 7. Páginas (`pages/`) — patrones genéricos

### Custom hook `useFetch` (evita repetir `useState`+`useEffect` en cada página de listado)

```typescript
// hooks/useFetch.ts
import { useState, useEffect } from 'react'

export function useFetch<T>(fetchFn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchFn()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch(() => {
        if (!cancelled) setError('Ocurrió un error al cargar los datos.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true // cleanup: evita actualizar estado si el componente se desmontó antes de que la petición termine
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error }
}
```

### `RegisterPage.tsx`

```tsx
// pages/RegisterPage.tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FormField } from '../components/FormField'
import { Button } from '../components/Button'
import { ErrorMessage } from '../components/ErrorMessage'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register({ email, password, name })
      navigate('/') // o la ruta principal de la app
    } catch (err) {
      setError('No se pudo registrar. Revisa los datos ingresados.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Registro</h1>
      <ErrorMessage message={error} />
      <FormField label="Nombre" value={name} onChange={setName} required />
      <FormField label="Correo" type="email" value={email} onChange={setEmail} required />
      <FormField label="Contraseña" type="password" value={password} onChange={setPassword} required />
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Registrando...' : 'Registrarse'}
      </Button>
    </form>
  )
}
```

### `LoginPage.tsx`

```tsx
// pages/LoginPage.tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FormField } from '../components/FormField'
import { Button } from '../components/Button'
import { ErrorMessage } from '../components/ErrorMessage'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      setError('Credenciales inválidas.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Iniciar sesión</h1>
      <ErrorMessage message={error} />
      <FormField label="Correo" type="email" value={email} onChange={setEmail} required />
      <FormField label="Contraseña" type="password" value={password} onChange={setPassword} required />
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Ingresando...' : 'Ingresar'}
      </Button>
    </form>
  )
}
```

### `LogoutPage.tsx`

El ejemplo de rutas del profesor incluye una ruta `/auth/logout`, pero no trae el componente — lo tienes que crear tú:

```tsx
// pages/LogoutPage.tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LogoutPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    logout()
    navigate('/auth/login')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // solo queremos que esto corra una vez, al montar el componente

  return <p>Cerrando sesión...</p>
}
```

### Página de listado genérica — `ListPage.tsx`

```tsx
// pages/ListPage.tsx
import { useState } from 'react'
import { useFetch } from '../hooks/useFetch'
import { getResources, addToUserList, removeFromUserList } from '../services/resourceService'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Button } from '../components/Button'

export function ListPage() {
  const { data: resources, loading, error } = useFetch(getResources, [])
  const [linkedIds, setLinkedIds] = useState<number[]>([]) // ver sección 10

  const toggleLink = async (resourceId: number) => {
    const isLinked = linkedIds.includes(resourceId)
    try {
      if (isLinked) {
        await removeFromUserList(resourceId)
        setLinkedIds((prev) => prev.filter((id) => id !== resourceId))
      } else {
        await addToUserList(resourceId)
        setLinkedIds((prev) => [...prev, resourceId])
      }
    } catch (err) {
      console.error('Error al actualizar', err)
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div>
      <h1>Lista</h1>
      <ul>
        {resources?.map((resource) => (
          <li key={resource.id}>
            <span>{resource.title}</span>
            <Button onClick={() => toggleLink(resource.id)}>
              {linkedIds.includes(resource.id) ? 'Quitar' : 'Agregar'}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Página de detalle: ver sección 11 (patrón con `useParams`).

---

## 8. Layouts y enrutamiento anidado con `Outlet`

Esta sección reemplaza el enrutamiento "plano" de versiones anteriores por el patrón exacto que aparece en tu hoja de snippets: **rutas anidadas con layouts compartidos**. Es distinto de simplemente listar todas las rutas una tras otra, así que te explico el concepto completo antes de mostrar el código, porque el snippet del profesor **no funciona solo** — le faltan piezas que tienes que construir tú.

### El concepto: `<Outlet />`

**Definición intuitiva:** un layout es como un marco de fotos con un espacio vacío en el medio — el marco (navbar, estructura general) es siempre el mismo, pero lo que va dentro del espacio vacío cambia según en qué ruta estés. Ese "espacio vacío" en React Router se llama `<Outlet />`.

**Definición técnica:** cuando anidas elementos `<Route>` dentro de otro `<Route>`, el `element` del `<Route>` padre actúa como un layout compartido. Para que las rutas hijas realmente se muestren en pantalla, el componente que uses como layout **debe** incluir un `<Outlet />` (importado de `react-router-dom`) en el lugar exacto donde quieres que aparezca el contenido de la ruta hija activa.

**Esto es lo más importante de toda esta sección:** el snippet de rutas que te dio el profesor usa `<LayoutLogin />` y `<Layout />` como si ya existieran, pero **no te da el código de esos dos componentes**. Si copias el snippet de rutas tal cual y no creas `Layout`/`LayoutLogin` con un `<Outlet />` adentro, la URL va a cambiar correctamente al navegar, pero **la pantalla se va a quedar en blanco** — porque no hay ningún lugar definido donde insertar la página.

### `Layout.tsx` y `LayoutLogin.tsx` (tienes que crearlos tú, no vienen en el snippet)

```tsx
// components/Layout.tsx
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function Layout() {
  return (
    <div>
      <Navbar />
      <main>
        <Outlet /> {/* Aquí se inserta la página de la ruta hija activa (Home, etc.) */}
      </main>
    </div>
  )
}
```

```tsx
// components/LayoutLogin.tsx
import { Outlet } from 'react-router-dom'

export function LayoutLogin() {
  return (
    <div>
      {/* Login/Register normalmente no necesitan Navbar, por eso este layout es más simple */}
      <Outlet />
    </div>
  )
}
```

### Sintaxis paso a paso: cómo se arma un "grupo de rutas" con layout

Antes de ver el `App.tsx` completo, vamos a diseccionar la sintaxis en piezas pequeñas, porque a primera vista `<Route element={...}>` sin un `path` puede confundir si nunca lo habías visto.

**La fórmula genérica es esta:**

```tsx
<Route element={<NombreDelLayout />}>            {/* (1) Route "padre" — layout route, SIN path */}
  <Route path="/ruta-a" element={<PaginaA />} />  {/* (2) Route "hijo" — sí tiene path, esta es la que se compara con la URL */}
  <Route path="/ruta-b" element={<PaginaB />} />  {/* (2) puedes poner tantos hijos como quieras dentro del mismo grupo */}
</Route>
```

- **(1) El `<Route>` de afuera nunca tiene `path`.** Esto es intencional, no un descuido: no representa ninguna URL por sí mismo. Su único trabajo es decir "todas mis rutas hijas comparten este mismo layout (`NombreDelLayout`)". React Router llama a esto una *layout route*.
- **(2) Los `<Route>` de adentro sí tienen `path` y `element`.** Estas son las únicas que realmente se comparan contra la URL del navegador. Cuando la URL coincide con `/ruta-a`, React Router renderiza `NombreDelLayout`, y dentro del `<Outlet />` de ese layout inserta `<PaginaA />`.
- Fíjate que cada `path` hijo empieza con `/` (ej. `/ruta-a`, no `ruta-a`). Esto es porque el `<Route>` padre no tiene ningún `path` propio con el cual "concatenarse" — cada path hijo se compara tal cual contra la URL completa, como si fuera una ruta de primer nivel.

**Puedes repetir este bloque completo varias veces, como hermanos, dentro de un mismo `<Routes>`** — cada grupo es completamente independiente de los demás:

```tsx
<Routes>
  <Route element={<LayoutA />}>
    <Route path="/x" element={<PaginaX />} />
  </Route>

  <Route element={<LayoutB />}>
    <Route path="/y" element={<PaginaY />} />
  </Route>
</Routes>
```
React Router revisa **todas** las rutas hijas de **todos** los grupos, encuentra cuál `path` coincide con la URL actual, y solo entonces renderiza el layout padre correspondiente a esa ruta específica. No importa cuántos grupos tengas ni en qué orden los escribas — por eso es válido tener un grupo para páginas públicas y otro grupo separado para páginas protegidas, aunque ambos usen técnicamente el mismo componente `Layout`.

**Ejemplo mínimo para practicar mentalmente (sin `ProtectedRoute` todavía, para no mezclar dos conceptos a la vez):**

```tsx
function PublicLayout() {
  return (
    <div>
      <p>Menú público</p>
      <Outlet />
    </div>
  )
}

function PrivateLayout() {
  return (
    <div>
      <p>Menú privado</p>
      <Outlet />
    </div>
  )
}

function Home() { return <h1>Home</h1> }
function Dashboard() { return <h1>Dashboard</h1> }

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route element={<PrivateLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}
```

Sigue el rastro tú mismo antes de seguir leyendo:
- Si visitas `/` → la única `path` que coincide es la de dentro del primer grupo → se renderiza `<PublicLayout>` con `<Home />` insertado en su `<Outlet />` → en pantalla ves "Menú público" + "Home".
- Si visitas `/dashboard` → la única `path` que coincide es la del segundo grupo → se renderiza `<PrivateLayout>` con `<Dashboard />` insertado en su `<Outlet />` → en pantalla ves "Menú privado" + "Dashboard".

**Ahora sí, agregando `ProtectedRoute` a la fórmula** — esto es exactamente el caso que preguntaste, ya anotado línea por línea:

```tsx
<Route element={<Layout />}>                                     {/* Grupo 1: layout público, sin chequeo de auth */}
  <Route path="/" element={<ListPage />} />                       {/* "/" usa este layout, cualquiera puede verla */}
</Route>

<Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>     {/* Grupo 2: mismo Layout, pero envuelto en ProtectedRoute */}
  <Route path="/auth/logout" element={<LogoutPage />} />          {/* "/auth/logout" pasa primero por el chequeo de auth */}
</Route>
```

**Cómo leer el `element` del Grupo 2 de adentro hacia afuera:** `<ProtectedRoute><Layout /></ProtectedRoute>` significa "`Layout` es el `children` que recibe `ProtectedRoute`". Recuerda el `ProtectedRoute` de la sección 5: si `isAuthenticated` es `false`, ni siquiera llega a renderizar lo que tiene adentro — redirige a `/auth/login` con `<Navigate>`. Si `isAuthenticated` es `true`, entonces sí renderiza su `children` (`<Layout />`), y ese `Layout` recién ahí muestra su `<Outlet />` con la página que corresponda.

**Resumen del recorrido completo cuando visitas `/auth/logout` estando logueado:**
1. React Router encuentra que `path="/auth/logout"` está dentro del Grupo 2.
2. Renderiza el `element` de ese grupo: `<ProtectedRoute><Layout /></ProtectedRoute>`.
3. `ProtectedRoute` revisa `isAuthenticated` → es `true` → renderiza su `children`, que es `<Layout />`.
4. `Layout` se dibuja (Navbar, etc.) y en su `<Outlet />` React Router inserta la página que realmente coincidió: `<LogoutPage />`.

Si en el paso 3 `isAuthenticated` hubiera sido `false`, el proceso se detiene ahí mismo — nunca se llega a dibujar `Layout` ni `LogoutPage`, y en su lugar el navegador te manda a `/auth/login`.

### `App.tsx` — snippet del profesor ya integrado con los layouts de arriba

```tsx
// App.tsx
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LayoutLogin } from './components/LayoutLogin'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RegisterPage } from './pages/RegisterPage'
import { LoginPage } from './pages/LoginPage'
import { LogoutPage } from './pages/LogoutPage'
import { ListPage } from './pages/ListPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<LayoutLogin />}>
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
        </Route>
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<ListPage />} />
          <Route path="/auth/logout" element={<LogoutPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
```

**Ajuste importante en `main.tsx`:** fíjate que en este patrón, `<AuthProvider>` está **dentro** de `App.tsx`, envolviendo `<Routes>`. Por lo tanto, tu `main.tsx` **no debe volver a envolver `<App />` con `<AuthProvider>`** — si lo haces en ambos lugares, terminas con dos contextos de autenticación distintos y separados, y el estado de sesión no se compartiría correctamente entre ellos. Deja `main.tsx` así, solo con `<BrowserRouter>`:

```tsx
// main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

**Nota sobre rutas públicas vs. la lista principal:** en el snippet original del profesor, `/` (la página principal) está **dentro** del grupo protegido (envuelto en `ProtectedRoute`). Si en tu enunciado el listado principal debe verse sin estar logueado (público) pero solo agregar/quitar de una lista personal requiere sesión, mueve esa ruta a su propio grupo público, tal como se explicó paso a paso más arriba (sección "Sintaxis paso a paso" — ahí está el mismo ejemplo, anotado línea por línea).

### `Navbar.tsx`

Esta versión asume el caso **mixto**: el mismo `Layout` (y por lo tanto el mismo `Navbar`) se usa tanto para rutas públicas como protegidas (como en el ejemplo de la sección anterior, donde `/` es pública pero `/auth/logout` no). Por eso necesita revisar `isAuthenticated` y decidir qué mostrar:

```tsx
// components/Navbar.tsx (versión mixta: pública + privada)
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Navbar() {
  const { isAuthenticated } = useAuth()

  return (
    <nav>
      <Link to="/">Inicio</Link>
      {isAuthenticated ? (
        <Link to="/auth/logout">Cerrar sesión</Link>
      ) : (
        <>
          <Link to="/auth/login">Login</Link>
          <Link to="/auth/register">Registro</Link>
        </>
      )}
    </nav>
  )
}
```

### `Navbar.tsx` — versión por defecto, si **todas** las rutas de tu app son privadas

Si en tu enunciado el `Layout` (el que trae el `Navbar`) **siempre** está envuelto en `ProtectedRoute` — es decir, nunca hay una ruta pública que use ese mismo layout — puedes simplificar bastante el componente:

```tsx
// components/Navbar.tsx (versión por defecto: todo detrás de ProtectedRoute)
import { Link } from 'react-router-dom'

export function Navbar() {
  return (
    <nav>
      <Link to="/">Inicio</Link>
      <Link to="/resource">Otra sección</Link> {/* agrega aquí más enlaces según tu enunciado */}
      <Link to="/auth/logout">Cerrar sesión</Link>
    </nav>
  )
}
```

**Por qué ya no hace falta el `isAuthenticated` ni el `useAuth()`:** este `Navbar` solo se renderiza dentro de `Layout`, y `Layout` solo se renderiza cuando `ProtectedRoute` ya confirmó que el usuario está logueado (revisa el recorrido paso a paso de la sección anterior — si no estuviera autenticado, `ProtectedRoute` redirige a `/auth/login` **antes** de que `Layout` llegue siquiera a dibujarse). Como la única forma de que este `Navbar` aparezca en pantalla es que ya haya sesión activa, revisar `isAuthenticated` otra vez adentro sería una verificación redundante — siempre va a ser `true` en ese punto. Por eso el enlace de "Cerrar sesión" se muestra directo, sin condicional, y no hay rama para Login/Registro (esas viven en `LayoutLogin`, que es un componente completamente aparte).

**Cuál usar:** si tu enunciado tiene aunque sea una sola ruta pública que comparta `Layout` con las privadas (como el ejemplo de "/" público de la sección anterior), usa la versión mixta. Si literalmente todo lo que usa `Layout` requiere sesión (y lo público vive solo en `LayoutLogin`), usa esta versión por defecto — es más simple y hay menos lógica de la que preocuparte bajo presión de tiempo.

---

## 9. Componentes reutilizables comunes

### `Button.tsx`

```tsx
// components/Button.tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function Button({ children, ...rest }: ButtonProps) {
  return <button {...rest}>{children}</button>
}
```
`...rest` recoge cualquier otra prop nativa de un `<button>` (`onClick`, `disabled`, `type`, etc.) sin tener que declararlas todas manualmente.

### `FormField.tsx` (input controlado + label, genérico para cualquier campo de texto)

```tsx
// components/FormField.tsx
interface FormFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
}

export function FormField({ label, value, onChange, type = 'text', required = false }: FormFieldProps) {
  const id = label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  )
}
```

### `LoadingSpinner.tsx`

```tsx
// components/LoadingSpinner.tsx
export function LoadingSpinner() {
  return <p>Cargando...</p>
}
```

### `ErrorMessage.tsx`

```tsx
// components/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string | null
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null
  return <p role="alert">{message}</p>
}
```

### `ConfirmModal.tsx` (confirmación antes de una acción destructiva)

```tsx
// components/ConfirmModal.tsx
interface ConfirmModalProps {
  open: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({ open, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null // renderizado condicional: no se monta nada si open es false

  return (
    <div>
      <p>{message}</p>
      <button onClick={onConfirm}>Confirmar</button>
      <button onClick={onCancel}>Cancelar</button>
    </div>
  )
}
```

Uso típico dentro de una página de listado:
```tsx
const [confirmId, setConfirmId] = useState<number | null>(null)

<ConfirmModal
  open={confirmId !== null}
  message="¿Seguro que deseas eliminar este elemento?"
  onConfirm={() => {
    if (confirmId !== null) removeFromUserList(confirmId)
    setConfirmId(null)
  }}
  onCancel={() => setConfirmId(null)}
/>
```

### `Card.tsx` (contenedor genérico con `children`)

```tsx
// components/Card.tsx
import type { ReactNode } from 'react'

interface CardProps {
  title: string
  children: ReactNode
}

export function Card({ title, children }: CardProps) {
  return (
    <div>
      <h3>{title}</h3>
      {children}
    </div>
  )
}
```

---

## 10. ⚠️ Patrón a vigilar: recursos sin endpoint GET

En ejercicios anteriores de este curso, es común que el backend exponga **solo `POST` y `DELETE`** para un recurso "derivado" del usuario (favoritos, carrito, inscripciones, asistencia, etc.), **sin un `GET` que te permita recuperar esa lista ya guardada**. No asumas que existe — revisa el README del backend con cuidado antes de escribir el `service`.

Si te encuentras con este caso, tienes dos estrategias válidas:

1. **Estado local en memoria:** mantén un `useState<number[]>` con los IDs relevantes, elevado (*Lifting State Up*) al componente común más cercano para que las páginas que lo necesiten lo compartan. Funciona bien durante una sesión de uso, pero se resetea al recargar la página.
2. **Persistir con el hook `useLocalStorage`** de la sección 4 (recuerda: solo maneja strings, así que necesitas `JSON.stringify`/`JSON.parse`):
   ```typescript
   const [linkedIdsRaw, setLinkedIdsRaw] = useLocalStorage('linkedIds', '[]')
   const linkedIds: number[] = JSON.parse(linkedIdsRaw)
   const updateLinkedIds = (newIds: number[]) => setLinkedIdsRaw(JSON.stringify(newIds))
   ```

**No pierdas tiempo buscando un endpoint GET que no existe** — si el enunciado no lo menciona ni el README lo documenta, probablemente el diseño del ejercicio espera que manejes ese estado del lado del cliente.

---

## 11. Rutas dinámicas con `useParams`

Útil cuando el enunciado pide "ver detalle de un producto/evento/curso", o cuando un recurso depende de otro (ej. canciones de un álbum, sesiones de un evento, notas de un curso).

**La sintaxis en tres piezas que tienen que coincidir entre sí (si una no coincide con las otras dos, `id` te va a llegar como `undefined`):**

```tsx
<Route path="/resource/:id" element={<DetailPage />} />   {/* (1) el nombre después de ":" define el parámetro */}
```
```tsx
const { id } = useParams<{ id: string }>()                {/* (2) la clave "id" debe ser idéntica a la de (1) */}
```
```tsx
<Link to={`/resource/${resource.id}`}>...</Link>          {/* (3) el valor real que reemplaza a ":id" en la URL */}
```
- **(1)** es la *definición* del parámetro — el `:` le dice a React Router "esta parte de la URL es variable, guárdala bajo el nombre `id`".
- **(2)** es la *lectura* del parámetro dentro del componente — el nombre `id` entre las llaves `{ id: string }` tiene que escribirse **exactamente igual** al nombre que pusiste después de `:` en (1). Si en la ruta hubieras escrito `:resourceId`, aquí tendrías que leer `const { resourceId } = useParams<{ resourceId: string }>()`.
- **(3)** es un ejemplo de *navegación* hacia esa ruta — construyes el string de la URL insertando el valor real donde antes estaba `:id`.

```tsx
// pages/DetailPage.tsx
import { useParams } from 'react-router-dom'
import { useFetch } from '../hooks/useFetch'
import { getResourceById } from '../services/resourceService'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'

export function DetailPage() {
  const { id } = useParams<{ id: string }>() // siempre llega como string desde la URL
  const resourceId = Number(id)

  const { data: resource, loading, error } = useFetch(
    () => getResourceById(resourceId),
    [resourceId], // se re-ejecuta si cambia el id en la URL
  )

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!resource) return <p>No encontrado</p>

  return (
    <div>
      <h1>{resource.title}</h1>
    </div>
  )
}
```

Registro de la ruta (dentro del grupo de layout que corresponda, sección 8):
```tsx
<Route path="/resource/:id" element={<DetailPage />} />
```

Navegación desde la lista:
```tsx
<Link to={`/resource/${resource.id}`}>{resource.title}</Link>
```

Si un sub-recurso depende de dos IDs (ej. `/api/albums/:albumId/songs`), el patrón es idéntico, solo que `useParams<{ albumId: string }>()` y el `service` recibe ese id como argumento:
```typescript
export const getSubResources = async (parentId: number) => {
  const { data } = await api.get(`/parent/${parentId}/sub-resource`)
  return data
}
```

---

## 12. Errores comunes / Debugging rápido

| Síntoma | Causa probable | Solución |
|---|---|---|
| Error de CORS en la consola del navegador | No configuraste el proxy en `vite.config.ts`, o estás llamando a la URL completa (`http://localhost:8080/...`) en vez de la relativa (`/api/...`) | Revisa la sección 1; usa siempre rutas relativas empezando en `/api` |
| `403 Forbidden` en un endpoint que debería funcionar | El interceptor de Axios no se está aplicando, el token no se guardó bien, o expiró | Verifica en la pestaña *Network* de DevTools que el header `Authorization: Bearer ...` esté presente |
| La pantalla se queda en blanco al navegar, aunque la URL cambia correctamente | Tu componente `Layout`/`LayoutLogin` no tiene un `<Outlet />` | Revisa la sección 8 — el `<Outlet />` es obligatorio en cualquier layout usado en rutas anidadas |
| El estado de sesión "se pierde" entre partes de la app, o el login no persiste | Tienes `<AuthProvider>` duplicado (una vez en `main.tsx` y otra en `App.tsx`) | Déjalo en un solo lugar — revisa la nota de la sección 8 |
| Error de import: "Cannot find module '...'" | Copiaste un snippet del profesor sin ajustar la ruta relativa a tu propia estructura de carpetas | Cuenta cuántas carpetas hay entre el archivo real y el destino del import, y ajusta la ruta en consecuencia |
| Un elemento agregado "desaparece" al recargar la página | Comportamiento esperado si el backend no tiene GET para ese recurso — ver sección 10 | Persiste el estado con `useLocalStorage` si necesitas que sobreviva a un refresh |
| `DELETE` no envía el body / el backend responde 400 en un DELETE | Olvidaste envolver el payload en `{ data: ... }` | `api.delete('/ruta', { data: { resourceId } })`, nunca `api.delete('/ruta', { resourceId })` |
| La lista nunca se llena, aunque el `axios` parece correcto | Olvidaste el `await`, o el `useEffect`/`useFetch` no tiene las dependencias correctas | Revisa que el hook tenga `[]` (o las dependencias correctas) |
| Warning: *"Each child in a list should have a unique key prop"* | Falta el atributo `key` en el `.map()` que renderiza la lista | Agrega `key={item.id}` |
| El navegador redirige a `/auth/login` en bucle infinito | El interceptor de respuesta redirige a `/login` en cada 401, y esa misma ruta está intentando hacer una llamada protegida por error | Verifica que las páginas de login/register nunca llamen a un endpoint que requiera token |
| Error de TypeScript: "Property 'X' does not exist on type..." | El tipo/interface no coincide con la forma real de la respuesta del backend | Revisa el README con cuidado — copia los campos exactos de los ejemplos JSON de respuesta |
| `useParams` devuelve `undefined` para el id | El nombre del parámetro en la ruta (`:id`) no coincide con la clave usada en `useParams<{ id: string }>()` | Asegúrate de que el nombre en la definición de la ruta y en `useParams` sea idéntico |
| El servidor de Vite no refleja cambios de `vite.config.ts` | Cambios en `vite.config.ts` no se recargan en caliente | Reinicia `pnpm dev` manualmente después de tocar ese archivo |

---

### Recordatorio final de flujo completo (de memoria, en orden)

1. `pnpm create vite@latest` → React + TypeScript
2. `pnpm add axios react-router-dom`
3. Configurar el proxy en `vite.config.ts` (sección 1) — no crear `constants.ts`
4. Anotar campos exactos de payloads y qué endpoints tienen GET (sección 10)
5. Crear `types/index.ts`, incluyendo `ApiError` (sección 2)
6. Crear `api/axios.ts` con la instancia compartida y los interceptores (sección 3)
7. Crear `hooks/useLocalStorage.ts` (copiado del snippet) y `context/AuthContext.tsx` (sección 4)
8. Crear `ProtectedRoute` (sección 5)
9. Crear componentes comunes (`Button`, `FormField`, `LoadingSpinner`, `ErrorMessage`) — sección 9
10. Crear `services/` para el recurso principal (sección 6)
11. Crear páginas: Register, Login, Logout, Lista, Detalle (sección 7 y 11)
12. Crear `Layout`/`LayoutLogin` con `<Outlet />` y armar `App.tsx` con rutas anidadas (sección 8)
13. Ajustar `main.tsx` para no duplicar `<AuthProvider>` (sección 8)
14. Probar en el navegador con DevTools → pestaña *Network* abierta

> Recuerda que en tu hoja de snippets también tienes la lista de documentación oficial (React, TypeScript, Vite, Axios, etc.) por si necesitas consultar algo puntual durante el examen.
