---
title: Diseña un acortador de URL
locale: es
type: system-design
category: system-design
stack: []
seniority: [ssr, sr]
fundamentals: false
evidence:
  - type: interview-report
    url: https://github.com/CreatCodeBuild/system-design-interview-lies
  - type: interview-report
    url: https://www.hellointerview.com/community/questions/url-shortener-design/cm5svnaco01dqxszbok7e1lk1
steps:
  - Aclara los requisitos, como alias personalizados, expiración y analíticas.
  - Estima la escala, incluida la proporción entre lecturas y escrituras, las peticiones por segundo y el almacenamiento a varios años.
  - Define la API para crear un enlace corto y para redirigir.
  - Elige cómo generar los códigos cortos y cómo evitar colisiones.
  - Diseña el modelo de datos y elige el almacenamiento.
  - Agrega caché y escala el camino de lectura.
  - Analiza cuellos de botella, modos de falla y compromisos.
rubric:
  - Enuncia requisitos funcionales y no funcionales antes de diseñar.
  - Reconoce que la carga es mayoritariamente de lectura y la dimensiona con números aproximados.
  - Propone una estrategia de generación de códigos sin colisiones y explica sus compromisos.
  - Elige entre redirecciones 301 y 302 con una justificación.
  - Usa una caché delante de la base de datos para los enlaces más consultados.
  - Identifica puntos únicos de falla y cómo eliminarlos.
---

Una buena respuesta va de los requisitos a un diseño simple y luego lo escala.

- **API:** `POST /urls` devuelve un código corto; `GET /{code}` redirige. Usa `302` si necesitas analíticas de clics y `301` si quieres que los navegadores guarden la redirección en caché.
- **Generación de códigos:** codifica en base62 un ID numérico único (de un contador o de rangos de ID preasignados por servidor). Siete caracteres dan unos 3,5 billones de códigos. Aplicar un hash a la URL larga es más simple, pero requiere manejar colisiones.
- **Almacenamiento:** un almacén clave-valor o de columnas anchas indexado por código se ajusta al patrón de acceso; la asociación casi nunca cambia.
- **Camino de lectura:** las lecturas superan ampliamente a las escrituras, así que pon una caché (por ejemplo, Redis) delante del almacén y sirve las redirecciones desde la región más cercana.
- **Compromisos:** un contador central es un cuello de botella y un punto único de falla; los rangos de ID lo evitan a costa de códigos no secuenciales.
