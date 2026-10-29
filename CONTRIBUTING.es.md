# Cómo contribuir a Entrenanding

[English](CONTRIBUTING.md) | Español

Tanto el contenido como el código se aportan mediante pull requests. Las preguntas viven en este repositorio como archivos Markdown, así que agregar una pregunta es igual que agregar código: fork, rama, commit y pull request.

> **Fase 0.** El esquema de contenido en `src/content/schema.ts` valida el frontmatter descrito aquí cuando se compila el sitio. La validación automática en CI llegará durante la Fase 0. Mientras tanto, quienes revisan verifican estas reglas manualmente.

## Pasos rápidos

1. Haz un fork del repositorio y crea una rama a partir de `main`.
2. Agrega o edita una pregunta en `src/content/questions/<locale>/<category>/<slug>.md`.
3. Si la pregunta es teórica, agrega al menos dos enlaces de evidencia.
4. Haz commit con un mensaje que siga [Conventional Commits](https://www.conventionalcommits.org/es/).
5. Abre un pull request y completa la lista de verificación de la plantilla.

## Estructura de archivos

```text
src/content/questions/
  en/
    backend/
      spring-bean-scopes.md
  es/
    backend/
      spring-bean-scopes.md
```

| Parte        | Regla                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| `<locale>`   | `en` o `es`                                                                                                   |
| `<category>` | `algorithms`, `frontend`, `backend`, `behavioral` o `system-design`                                           |
| `<slug>`     | En minúsculas, separado por guiones y en inglés. El mismo slug en ambos idiomas identifica la misma pregunta. |

## Frontmatter

```yaml
title: ¿Qué scope usa Spring por defecto para un bean?
locale: es
type: multiple-choice
category: backend
stack: [java, spring]
seniority: [ssr, sr]
fundamentals: false # true = no requiere evidencia
evidence: # obligatoria (mínimo 2) cuando fundamentals es false
  - type: interview-report # Glassdoor, Blind, publicación pública
    url: https://...
  - type: job-posting
    url: https://...
options:
  - id: a
    text: singleton
  - id: b
    text: prototype
answer: a
```

| Campo          | Valores                                                                                            |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `title`        | La pregunta, en el idioma del archivo.                                                             |
| `locale`       | `en`, `es`. Debe coincidir con la carpeta.                                                         |
| `type`         | `open`, `multiple-choice`, `predict-output`, `spot-the-bug`, `behavioral`, `system-design`         |
| `category`     | `algorithms`, `frontend`, `backend`, `behavioral`, `system-design`. Debe coincidir con la carpeta. |
| `stack`        | Tecnologías a las que aplica la pregunta. Puede estar vacío.                                       |
| `seniority`    | Uno o más de `jr`, `ssr`, `sr`.                                                                    |
| `fundamentals` | `true` para conceptos básicos necesarios para entender una herramienta o un lenguaje.              |
| `evidence`     | Fuentes que muestran que la pregunta se repite en entrevistas reales. Ver la regla de evidencia.   |

El cuerpo en Markdown contiene la respuesta modelo o la explicación, para todos los tipos.

Los campos desconocidos se rechazan: un error de tipeo como `anwser` hace fallar la validación en lugar de ignorarse en silencio.

### Campos específicos de cada tipo

| Tipo              | Campos                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `open`            | Ninguno.                                                                                            |
| `multiple-choice` | `options`: de 2 a 6 elementos `{ id, text }` con ids únicos. `answer`: el id de la opción correcta. |
| `predict-output`  | `code`, `language`, `expectedOutput`: la salida exacta, que se compara como texto.                  |
| `spot-the-bug`    | `code`, `language`, `bugLine`: el número de línea del error (empezando en 1), dentro de `code`.     |
| `behavioral`      | `checklist`: uno o más ítems de autoevaluación STAR.                                                |
| `system-design`   | `steps`: uno o más pasos de la guía. `rubric`: uno o más criterios para evaluar la respuesta.       |

## Regla de evidencia

Entrenanding solo incluye preguntas teóricas que efectivamente se hacen en entrevistas.

- Cuando `fundamentals: false`, la pregunta necesita **al menos 2** entradas de evidencia.
- Cada entrada tiene un `type` y una `url` pública.
- Cuando `fundamentals: true`, la evidencia es opcional. Úsalo solo para conceptos básicos necesarios para entender una herramienta o un lenguaje, no para evitar la regla.

| Tipo de evidencia  | Ejemplos                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `interview-report` | Una reseña en Glassdoor, un hilo en Blind, una publicación pública que describe una entrevista |
| `job-posting`      | Una oferta de trabajo que incluye el tema como requisito                                       |

Enlaza las fuentes. No copies su texto en el repositorio.

## Traducciones

- Cada idioma es un archivo separado con el mismo slug.
- Los metadatos deben coincidir entre idiomas: `type`, `category`, `stack`, `seniority`, `fundamentals` y `evidence`. Solo cambian `locale` y el texto.
- Una pregunta puede existir en un solo idioma. El sitio mostrará un aviso de "aún no traducida" con un enlace a la versión disponible.
- Traducir una pregunta existente es una contribución valiosa por sí sola.

## Contribuciones de código

- Agrega o actualiza pruebas cuando cambies comportamiento.
- Mantén cada pull request enfocado en un solo cambio.
- Los comandos de herramientas, lint y pruebas se documentarán aquí cuando exista la estructura base de la aplicación.

## Mensajes de commit

Usa [Conventional Commits](https://www.conventionalcommits.org/es/). El título del pull request sigue el mismo formato. Los mensajes de commit se escriben en inglés.

| Ejemplo                                                | Cuándo                               |
| ------------------------------------------------------ | ------------------------------------ |
| `feat(content): add spring bean scopes question`       | Pregunta nueva                       |
| `feat(content): translate spring bean scopes to es`    | Traducción nueva                     |
| `fix(content): correct expected output in js-closures` | Corrección de contenido              |
| `feat: add category filter`                            | Nueva funcionalidad de la aplicación |
| `docs: clarify evidence rule`                          | Documentación                        |

## Licencias

Al contribuir, aceptas que tu código se licencia bajo [MIT](LICENSE) y tu contenido en `src/content/` bajo [CC BY-SA 4.0](LICENSE-CONTENT.md).
