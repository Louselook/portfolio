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

1. `z3312/NARRATION-TEMPLATE.md`
2. `z3312/CASE-STUDY-NARRATIVE.md` — 5 actos
3. `z3312/PROJECT-IDENTITY.md` — identidad distinta (no mismo template)
4. `z3312/PROJECT-DETAIL-UI.md` — framework UI
5. `z3312/PROJECT-SCHEMA.md`
6. `z3312/ADD-PROJECT.md`

## Implementation steps

1. Ask only for missing critical fields.
2. Expand to 5 acts + identity summary (palette, fonts, shape, motif, signature).
3. Place media under `src/assets/proyectsImage/proyects/<Name>/`.
4. Append to `projects.js` with **exactly 5 chapters** and a unique **`theme`**.
5. Do not create one-off pages; `ProjectDetail` renders by slug.
6. Differentiation check vs existing themes.
7. `npm run build`.

## Output to user

- Slug URL `/proyectos/<slug>`
- Identity summary (5 lines)
- Filters where it appears
- Missing assets if any
