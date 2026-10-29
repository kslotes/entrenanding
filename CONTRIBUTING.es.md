# Cómo contribuir a Entrenanding

[English](CONTRIBUTING.md) | Español

Tanto el contenido como el código se aportan mediante pull requests. Las preguntas viven en este repositorio como archivos Markdown, así que agregar una pregunta es igual que agregar código: fork, rama, commit y pull request.

> **Provisional.** El proyecto está en la Fase 0. La estructura de archivos y el esquema de frontmatter descritos aquí son un borrador hasta que se complete la tarea del esquema de contenido (T0.4). La validación automática en CI también llegará durante la Fase 0. Mientras tanto, quienes revisan verifican estas reglas manualmente.

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

## Frontmatter (borrador)

```yaml
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
```

| Campo          | Valores                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------ |
| `locale`       | `en`, `es`. Debe coincidir con la carpeta.                                                 |
| `type`         | `open`, `multiple-choice`, `predict-output`, `spot-the-bug`, `behavioral`, `system-design` |
| `category`     | Debe coincidir con la carpeta.                                                             |
| `stack`        | Tecnologías a las que aplica la pregunta.                                                  |
| `seniority`    | Niveles a los que apunta la pregunta.                                                      |
| `fundamentals` | `true` para conceptos básicos necesarios para entender una herramienta o un lenguaje.      |
| `evidence`     | Fuentes que muestran que la pregunta se repite en entrevistas reales.                      |

Los campos específicos de cada tipo (opciones, salida esperada, rúbrica, etc.) se documentarán junto con el esquema.

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
