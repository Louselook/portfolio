---
name: portfolio-add-project
description: >-
  Add a new project to Juanes' portfolio from a short narration (stack, role,
  personal/work). Use when the user says agregar proyecto, nuevo proyecto al
  portfolio, Flutter + FastAPI, o pide documentar un case study en el catálogo.
---

# Portfolio Add Project

## When to use

User narrates a project like: “este es Flutter + Django, personal, fullstack…”.

## Required reading

Follow the docs in `z3312/`:

1. `z3312/NARRATION-TEMPLATE.md` — parse the narration
2. `z3312/PROJECT-SCHEMA.md` — fill the data model
3. `z3312/ADD-PROJECT.md` — execute the checklist

## Implementation steps

1. Ask only for missing critical fields (cover asset, slug collision, role/type).
2. Place media under `src/assets/proyectsImage/proyects/<Name>/`.
3. Import assets and append to `projects` in `src/data/projects.js`.
4. Do **not** create a one-off page component; `ProjectDetail` renders by slug.
5. Keep filter labels consistent (`Flutter`, `FastAPI`, `React`, `Python`, etc.).
6. Run `npm run build` and fix errors.

## Output to user

- Confirm slug URL `/proyectos/<slug>`
- List filters where it will appear
- Note any missing assets still needed
