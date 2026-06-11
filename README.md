# AgroGanado 360 - PMV React + TypeScript

Prototipo PMV funcional y responsivo para una plataforma SaaS agroganadera con roles, gestión de ganado, monitoreo productivo/sanitario, crowdfunding, trazabilidad tipo blockchain, clima, reportes y auditoría.

## Requisitos

- Node.js 18 o superior
- Visual Studio Code
- Cuenta de Supabase para conectar base de datos real cuando se desee

## Instalación

```bash
npm install
npm run dev
```

Abrir en el navegador la URL que muestre Vite, normalmente:

```bash
http://localhost:5173
```

## Login demo

El prototipo permite ingresar con botones de demostración:

- Administrador
- Productor
- Inversionista
- Veterinario/Técnico
- Auditor

Los datos se guardan visualmente en `localStorage`, por eso todos los botones, filtros, modales, tablas, inversiones, sensores y reportes funcionan sin backend.

## Conexión con Supabase

1. Copiar `.env.example` como `.env.local`.
2. Colocar la URL y la anon key de Supabase.
3. Cambiar:

```env
VITE_USE_SUPABASE=true
```

4. Ejecutar en Supabase el archivo `supabase_schema.sql`.
5. Reemplazar gradualmente las funciones de `src/shared/services.ts` para escribir y leer en Supabase.

El prototipo ya incluye `src/shared/supabase.ts` y una capa de servicios preparada para conexión.

## Estructura

```txt
src/
  auth/
  shared/
  roles/
    administrador/
    productor/
    inversionista/
    veterinario/
    auditor/
```

Cada rol tiene sus propios módulos dentro de su carpeta, aunque algunos usen componentes compartidos para mantener orden y reducir errores.

## Funciones incluidas

- Login demo por rol
- Sidebar en escritorio y navegación móvil
- CRUD visual de ganado, usuarios, sanidad, proyectos, clima y trazabilidad según permisos
- Filtros funcionales
- Modales funcionales
- Confirmaciones
- Inversiones simuladas
- Generación de hash de trazabilidad
- Simulación de sensores climáticos
- Reportes con gráficos
- Exportación CSV
- Auditoría visual de acciones
- Diseño responsivo tipo SaaS agroganadero
