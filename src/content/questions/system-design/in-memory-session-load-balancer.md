---
title: Pasas de 1 a 3 instancias detrás de un balanceador round-robin y los usuarios pierden la sesión al azar. ¿Cuál es la solución más robusta?
type: multiple-choice
category: system-design
stack: []
seniority: [jr, ssr]
fundamentals: true
concepts: [stateless-services]
options:
  - id: a
    text: Guardar la sesión en un almacén compartido, como Redis, al que accedan todas las instancias
  - id: b
    text: Activar sticky sessions para que cada usuario vaya siempre a la misma instancia
  - id: c
    text: Aumentar la memoria de cada instancia para que la sesión no se pierda
  - id: d
    text: Volver a una sola instancia más grande
answer: a
---

La respuesta es **a**: la sesión vive en la memoria de la instancia que atendió la primera petición, y round-robin manda la siguiente a otra que no la conoce. Si la sesión va a un almacén compartido, cualquier instancia la encuentra.

```text
antes:   petición 1 -> instancia 1 (guarda la sesión)   petición 2 -> instancia 2 (no la tiene)
después: petición 1 -> instancia 1 -> Redis              petición 2 -> instancia 2 -> Redis (la encuentra)
```

**Por qué funciona:** las instancias quedan **sin estado**: no recuerdan nada entre peticiones, todo el estado está en Redis. En Spring, Spring Session hace este cambio sin tocar el código que usa `HttpSession`.

**La consecuencia práctica:** puedes agregar, reiniciar o apagar instancias sin que nadie pierda su carrito ni su login.

**Las otras opciones:**

- `b`: las sticky sessions esconden el problema; si esa instancia cae o se reinicia, el usuario pierde la sesión igual y el tráfico se reparte peor.
- `c`: la memoria no es el problema; la sesión existe, pero en otra instancia.
- `d`: funciona, pero renuncia al escalado horizontal y deja un único punto de falla.
