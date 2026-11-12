# Cómo contribuir a Entrenanding

Tanto el contenido como el código se aportan mediante pull requests. Las preguntas y los ejercicios viven en este repositorio, así que agregar contenido es igual que agregar código: fork, rama, commit y pull request.

El contenido se escribe en español. Los términos técnicos se dejan en inglés, como se usan en el trabajo (`bean scope`, `record`, `equals`). El código (identificadores) y los mensajes de commit van en inglés.

## Pasos rápidos

1. Haz un fork del repositorio y crea una rama a partir de `main`.
2. Agrega o edita una pregunta en `src/content/questions/<category>/<slug>.md`.
3. Si la pregunta es teórica, agrega al menos dos enlaces de evidencia.
4. Ejecuta `pnpm test` y `pnpm build`.
5. Haz commit con un mensaje que siga [Conventional Commits](https://www.conventionalcommits.org/es/).
6. Abre un pull request y completa la lista de verificación de la plantilla.

CI valida el esquema, las rutas y la evidencia en cada pull request.

## Estructura de archivos

```text
src/content/questions/
  backend/
    spring-default-bean-scope.md
```

| Parte        | Regla                                                 |
| ------------ | ----------------------------------------------------- |
| `<category>` | `algorithms`, `frontend`, `backend` o `system-design` |
| `<slug>`     | En minúsculas, separado por guiones y en inglés.      |

## Frontmatter

```yaml
title: ¿Qué scope usa Spring por defecto para un bean?
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

| Campo          | Valores                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------ |
| `title`        | La pregunta.                                                                                     |
| `type`         | `multiple-choice`, `predict-output`, `spot-the-bug`                                              |
| `category`     | `algorithms`, `frontend`, `backend`, `system-design`. Debe coincidir con la carpeta.             |
| `stack`        | Tecnologías a las que aplica la pregunta. Puede estar vacío.                                     |
| `seniority`    | Uno o más de `jr`, `ssr`, `sr`.                                                                  |
| `fundamentals` | `true` para conceptos básicos necesarios para entender una herramienta o un lenguaje.            |
| `evidence`     | Fuentes que muestran que la pregunta se repite en entrevistas reales. Ver la regla de evidencia. |

El cuerpo en Markdown contiene la respuesta modelo o la explicación, para todos los tipos.

Los campos desconocidos se rechazan: un error de tipeo como `anwser` hace fallar la validación en lugar de ignorarse en silencio.

### Campos específicos de cada tipo

| Tipo              | Campos                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `multiple-choice` | `options`: de 2 a 6 elementos `{ id, text }` con ids únicos. `answer`: el id de la opción correcta. |
| `predict-output`  | `code`, `language`, `expectedOutput`: la salida exacta, que se compara como texto.                  |
| `spot-the-bug`    | `code`, `language`, `bugLine`: el número de línea del error (empezando en 1), dentro de `code`.     |

> **Tipos pospuestos.** La aplicación solo acepta tipos que puede evaluar automáticamente. Los tipos de autoevaluación (respuestas abiertas, preguntas de comportamiento y recorridos de diseño de sistemas) y la categoría `behavioral` se posponen hasta la fase que agrega la evaluación de respuestas con IA, por lo que todavía no se aceptan contribuciones de esos tipos. Los temas de diseño de sistemas se pueden aportar con cualquiera de los tipos anteriores.

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

## Conceptos (teoría)

La teoría vive por concepto en `src/content/concepts/<slug>.md`, para que varios ejercicios y preguntas la reutilicen. Todo ejercicio debe referenciar al menos un concepto; las preguntas pueden hacerlo con el campo opcional `concepts`.

```yaml
title: Contrato de equals y hashCode
stack: [java]
references: # mínimo 1: documentación oficial o fuentes reconocidas
  - title: "Object.equals (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/Object.html
```

- Las referencias prueban que lo que dice el concepto es correcto. No confundir con `evidence`, que prueba que el tema se pregunta en entrevistas.
- La teoría explica el concepto, nunca la solución de un ejercicio.
- `pnpm test` rechaza un concepto sin referencias y cualquier referencia a un concepto que no existe.

## Ejercicios de código

Cada ejercicio de backend es un módulo de Maven en `exercises/backend/<grupo>/<slug>/` con:

- `statement.md`: el enunciado, con el mismo frontmatter común que las preguntas (`title`, `category`, `stack`, `seniority`, `fundamentals`) y `concepts`, con al menos un concepto. Agrega una sección `## Teoría` con enlaces a esos conceptos.
- `src/main/java`: el código inicial, que compila pero no pasa los tests.
- `src/test/java`: los tests que validan el ejercicio.
- `solution/src/main/java`: la solución de referencia, comentada para que se pueda aprender de ella.

Registra el módulo en `exercises/backend/pom.xml`.

Cada ejercicio de frontend vive en `exercises/frontend/<grupo>/<slug>/` con:

- `statement.md`: el enunciado, con las mismas reglas que en backend.
- `src/`: el código inicial, en TypeScript.
- `<nombre>.test.ts` en la carpeta del ejercicio: los tests, que importan desde `./src/...`.
- `solution/src/`: la solución de referencia, con los mismos nombres de archivo que `src/`. En modo solución (`--mode solution`), las importaciones de `./src/...` se resuelven a `solution/src/...`.

Antes de abrir el pull request, ejecuta `pnpm verify:exercises` (o `pnpm verify:exercises backend` / `frontend`): el código inicial debe fallar sus tests y la solución debe pasarlos, y cada ejercicio debe tener su `statement.md`. CI ejecuta la misma verificación.

### Cómo agregar un ejercicio

1. **Elige el área, el grupo y el slug.** La ruta es `exercises/<área>/<grupo>/<slug>/`, con `<área>` igual a `backend` o `frontend`. El grupo junta ejercicios del mismo tema (por ejemplo `java-core` o `js-core`); el grupo y el slug van en minúsculas, separados por guiones y en inglés.
2. **Copia un ejercicio existente como base.** Para backend, `exercises/backend/java-core/immutable-money/`; cambia el `artifactId` de su `pom.xml` por el slug y usa un paquete propio bajo `io.github.kslotes.entrenanding.exercises`. Para frontend, `exercises/frontend/js-core/debounce/`.
3. **Escribe o reutiliza la teoría.** Cada slug de `concepts` debe existir en `src/content/concepts/`. Si falta un concepto, agrégalo en el mismo pull request (ver [Conceptos](#conceptos-teoría)).
4. **Escribe el enunciado.** En la sección `## Teoría`, enlaza los conceptos con rutas relativas al `statement.md` (`../../../../src/content/concepts/<slug>.md`): funcionan en GitHub y la aplicación las convierte en enlaces a sus páginas de conceptos. Si el ejercicio no es de fundamentos (`fundamentals: false`), necesita evidencia como las preguntas (ver la [regla de evidencia](#regla-de-evidencia)).
5. **Escribe primero los tests y la solución.** Los tests prueban el comportamiento que pide el enunciado, no detalles de la implementación. Comprueba que la solución los pase:
   - Backend, desde `exercises/backend`: `./mvnw -pl <grupo>/<slug> -Psolution test` (en Windows, `.\mvnw.cmd` en lugar de `./mvnw`).
   - Frontend, desde la raíz: `pnpm exercise <grupo>/<slug> --mode solution`.
6. **Deja el código inicial.** Mismas firmas que la solución, sin la lógica: debe compilar y fallar los tests. Ejecuta el mismo comando sin `-Psolution` o sin `--mode solution` para comprobarlo.
7. **Registra el ejercicio.** Backend: agrega el módulo en `exercises/backend/pom.xml`. Ambos: agrega una fila a la tabla de ejercicios del [README](README.md#ejercicios-de-código).
8. **Verifica todo.** Ejecuta `pnpm verify:exercises` y `pnpm test`; este último valida el frontmatter del enunciado y que los conceptos referenciados existan.

## Contribuciones de código

- Agrega o actualiza pruebas cuando cambies comportamiento.
- Mantén cada pull request enfocado en un solo cambio.
- Antes de abrir el pull request, ejecuta `pnpm lint`, `pnpm format:check`, `pnpm check`, `pnpm test` y `pnpm build`.

## Mensajes de commit

Usa [Conventional Commits](https://www.conventionalcommits.org/es/). El título del pull request sigue el mismo formato. Los mensajes de commit se escriben en inglés.

| Ejemplo                                                | Cuándo                               |
| ------------------------------------------------------ | ------------------------------------ |
| `feat(content): add spring bean scopes question`       | Pregunta nueva                       |
| `feat(exercises): add immutable money exercise`        | Ejercicio nuevo                      |
| `fix(content): correct expected output in js-closures` | Corrección de contenido              |
| `feat: add category filter`                            | Nueva funcionalidad de la aplicación |
| `docs: clarify evidence rule`                          | Documentación                        |

## Licencias

Al contribuir, aceptas que tu código se licencia bajo [MIT](LICENSE) y tu contenido en `src/content/` bajo [CC BY-SA 4.0](LICENSE-CONTENT.md).
