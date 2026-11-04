# Entrenanding

[English](README.md) | Español

Entrenanding es un proyecto de código abierto para aprender, practicar y prepararse para entrevistas técnicas de trabajo. Se clona y se ejecuta en tu propia máquina: no hay sitio publicado ni cuenta. Se enfoca en lo que sirve en el trabajo real y en lo que efectivamente se pregunta en las entrevistas.

> Nombre provisional. Puede cambiar.

## Cómo funciona

1. Clonas el repositorio y levantas la aplicación en local.
2. La aplicación explica el proyecto y presenta preguntas teóricas (opción múltiple y otros tipos con evaluación automática).
3. Después pasas a ejercicios de código en tu propio editor, validados con tests: Java con JUnit para backend y TypeScript con Vitest para frontend.

## Estado

**Fase 0, pre-alfa.** La aplicación arranca y compila, pero solo muestra páginas provisionales y algunas preguntas de ejemplo. Los ejercicios de código son parte del MVP y todavía no existen.

## Requisitos previos

Instala lo siguiente antes de empezar. La columna **Verificación** muestra el comando que confirma la versión instalada.

| Herramienta                                                | Versión             | Para qué se necesita                   | Verificación     |
| ---------------------------------------------------------- | ------------------- | -------------------------------------- | ---------------- |
| [Git](https://git-scm.com/)                                | Cualquiera reciente | Clonar el repositorio                  | `git --version`  |
| [Node.js](https://nodejs.org/)                             | 24 o superior       | La aplicación y ejercicios de frontend | `node --version` |
| [pnpm](https://pnpm.io/)                                   | 10                  | Instalar dependencias                  | `pnpm --version` |
| JDK (por ejemplo [Eclipse Temurin](https://adoptium.net/)) | 25 (LTS)            | Ejercicios de backend (planificados)   | `java -version`  |

- **pnpm**: si no lo tienes, ejecuta `npm install -g pnpm@10`.
- **JDK**: no hace falta hasta que lleguen los ejercicios de backend. Sirve cualquier distribución de OpenJDK 25.
- **Maven**: no necesitarás instalarlo. Los ejercicios de backend incluirán Maven Wrapper (`./mvnw`), que descarga la versión correcta de Maven la primera vez que se usa.
- **Editor**: cualquiera. Un IDE con soporte para Java (IntelliJ IDEA, VS Code con las extensiones de Java) facilita los ejercicios de backend.

## Primeros pasos

```sh
git clone https://github.com/kslotes/entrenanding.git
cd entrenanding
pnpm install
pnpm dev
```

Abre http://localhost:4321/ en tu navegador.

| Comando      | Qué hace                                               |
| ------------ | ------------------------------------------------------ |
| `pnpm dev`   | Levanta la aplicación en local con recarga automática  |
| `pnpm test`  | Ejecuta los tests (esquema e integridad del contenido) |
| `pnpm build` | Compila la aplicación y valida todo el contenido       |

## Qué lo diferencia

| Principio                | Qué significa                                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Orientado al trabajo     | El contenido debe aplicarse al trabajo real, no a curiosidades.                                                                                                                                  |
| Respaldado por evidencia | Las preguntas teóricas deben citar al menos dos fuentes que muestren que se repiten en entrevistas reales. Los fundamentos necesarios para entender una herramienta o un lenguaje están exentos. |
| Bilingüe                 | Interfaz y contenido en español e inglés. Una pregunta puede existir en un solo idioma hasta que alguien la traduzca.                                                                            |
| Local y privado          | Todo se ejecuta en tu máquina. Tu progreso queda en tu navegador (`localStorage`). Sin cuenta y sin servidor.                                                                                    |
| Contenido como código    | Las preguntas son archivos Markdown en este repositorio y se aportan mediante pull requests.                                                                                                     |
| Herramientas reales      | Los ejercicios de código usan el JDK, JUnit y Vitest reales, las mismas herramientas del trabajo.                                                                                                |

## Tipos de pregunta

Todos los tipos de pregunta teórica se evalúan automáticamente en la aplicación.

| Tipo              | Cómo se evalúa                           |
| ----------------- | ---------------------------------------- |
| `multiple-choice` | Automática                               |
| `predict-output`  | Automática (comparación de texto)        |
| `spot-the-bug`    | Automática (línea u opción seleccionada) |

Los tipos de autoevaluación (respuestas abiertas, preguntas de comportamiento y recorridos de diseño de sistemas) volverán en una fase posterior, junto con la evaluación de respuestas con IA.

## Categorías

| Categoría       | Alcance                                      |
| --------------- | -------------------------------------------- |
| `algorithms`    | Estructuras de datos y algoritmos            |
| `frontend`      | React, Vue, Angular y la plataforma web      |
| `backend`       | Enfoque inicial en Java con Spring y Quarkus |
| `system-design` | Ejercicios de arquitectura y diseño          |

## Hoja de ruta

| Fase                       | Alcance                                                                                                                                                                                             |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Fundamentos             | Repositorio, licencias, esquema de contenido, CI que valida contenido y evidencia                                                                                                                   |
| 1. MVP                     | Navegación por categoría, stack y seniority; todos los tipos de pregunta; progreso en el navegador; contenido inicial; ejercicios de código validados con tests (Java + JUnit, TypeScript + Vitest) |
| 2. Herramientas de estudio | Repetición espaciada, modo simulacro de entrevista, exportación e importación del progreso                                                                                                          |
| 3+. Más adelante           | Evaluación de respuestas y simulacros con IA usando tu propia clave de API (recupera las preguntas abiertas, de comportamiento y de diseño de sistemas)                                             |

## Cómo contribuir

Las contribuciones son bienvenidas, en especial preguntas con evidencia y traducciones. Lee [CONTRIBUTING.es.md](CONTRIBUTING.es.md) antes de abrir un pull request.

## Licencias

| Qué                         | Licencia                           |
| --------------------------- | ---------------------------------- |
| Código                      | [MIT](LICENSE)                     |
| Contenido en `src/content/` | [CC BY-SA 4.0](LICENSE-CONTENT.md) |
