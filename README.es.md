# Entrenanding

[English](README.md) | Español

Entrenanding es una aplicación web de código abierto para aprender, practicar y prepararse para entrevistas técnicas de trabajo. Se enfoca en lo que sirve en el trabajo real y en lo que efectivamente se pregunta en las entrevistas.

> Nombre provisional. Puede cambiar antes del lanzamiento público.

## Estado

**Fase 0, pre-alfa. Todavía no hay nada ejecutable.**

Por ahora el repositorio contiene las licencias y la documentación para contribuir. Los comandos de instalación, ejecución y pruebas se agregarán aquí cuando exista la estructura base de la aplicación.

## Qué lo diferencia

| Principio                | Qué significa                                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Orientado al trabajo     | El contenido debe aplicarse al trabajo real, no a curiosidades.                                                                                                                                  |
| Respaldado por evidencia | Las preguntas teóricas deben citar al menos dos fuentes que muestren que se repiten en entrevistas reales. Los fundamentos necesarios para entender una herramienta o un lenguaje están exentos. |
| Bilingüe                 | Interfaz y contenido en español e inglés. Una pregunta puede existir en un solo idioma hasta que alguien la traduzca.                                                                            |
| Privado por defecto      | Tu progreso queda en tu navegador (`localStorage`). Sin cuenta y sin backend.                                                                                                                    |
| Contenido como código    | Las preguntas son archivos Markdown en este repositorio y se aportan mediante pull requests.                                                                                                     |

## Tipos de pregunta

Ninguno de los tipos requiere ejecutar código. Todos se evalúan automáticamente.

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

| Fase                       | Alcance                                                                                                                                                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Fundamentos             | Repositorio, licencias, esquema de contenido, CI que valida contenido y evidencia, primer despliegue                                                                                                              |
| 1. MVP                     | Navegación por categoría, stack y seniority; todos los tipos de pregunta; progreso en el navegador; contenido inicial                                                                                             |
| 2. Herramientas de estudio | Repetición espaciada, modo simulacro de entrevista, exportación e importación del progreso                                                                                                                        |
| 3+. Más adelante           | Práctica ejecutable, cuentas y sincronización opcionales, evaluación de respuestas y simulacros con IA usando tu propia clave de API (recupera las preguntas abiertas, de comportamiento y de diseño de sistemas) |

## Cómo contribuir

Las contribuciones son bienvenidas, en especial preguntas con evidencia y traducciones. Lee [CONTRIBUTING.es.md](CONTRIBUTING.es.md) antes de abrir un pull request.

## Licencias

| Qué                         | Licencia                           |
| --------------------------- | ---------------------------------- |
| Código                      | [MIT](LICENSE)                     |
| Contenido en `src/content/` | [CC BY-SA 4.0](LICENSE-CONTENT.md) |
