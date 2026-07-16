# BMC Global — Cuartel General

Aplicación web que **gamifica la gestión de tareas del equipo** de BMC Global al estilo
RPG retro: cada empleado tiene un personaje, las tareas se convierten en misiones, y hay
niveles, recompensas, ranking, tienda, gacha y coleccionables.

Es un sitio **estático** (HTML + CSS + JavaScript puro, sin build) que guarda los datos en
**Supabase**.

## Estructura

```
index.html        Página principal (interfaz completa)
css/
  styles.css      Estilos
js/
  app.js          Toda la lógica: Supabase, misiones, héroes, gacha, tienda, etc.
```

## Uso en local

Abre `index.html` en el navegador. No requiere servidor ni instalación.

> Nota: al usar `fetch` contra Supabase, algunos navegadores son más estrictos abriendo
> el archivo con `file://`. Si algo no carga, sirve la carpeta con un servidor estático
> simple (por ejemplo la extensión *Live Server* de VS Code).

## Despliegue (GitHub Pages)

El proyecto está pensado para publicarse con GitHub Pages sobre la rama `main`.
Al llamarse la página principal `index.html`, la web se sirve directamente en la raíz:
`https://<usuario>.github.io/<repo>/`.

## Secciones

| Sección | Descripción |
|---|---|
| ⚔️ Misiones | Tareas reales como misiones (normales y diarias) con recompensas. |
| 🧙 Héroes | Perfiles de los personajes del equipo. |
| 🗺️ Arcos | Proyectos/objetivos que agrupan misiones. |
| 🏆 Ranking | Clasificación entre miembros. |
| ✨ Gacha | Cartas coleccionables aleatorias. |
| 🛒 Tienda | Gasto de la moneda del juego. |
| 🎒 Inventario | Objetos y cartas del jugador. |
| 📅 Calendario | Eventos y fechas. |
| 📋 Planner | Importación masiva de misiones desde CSV. |
| ⚙️ Admin | Gestión de items, clases y widgets (solo administrador). |
