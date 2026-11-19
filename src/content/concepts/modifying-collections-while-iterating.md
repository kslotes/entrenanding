---
title: Modificar una colección mientras se recorre
stack: [java, javascript]
references:
  - title: "JLS 14.14.2: The enhanced for statement"
    url: https://docs.oracle.com/javase/specs/jls/se25/html/jls-14.html#jls-14.14.2
  - title: "ConcurrentModificationException (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ConcurrentModificationException.html
  - title: "ArrayList (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html
  - title: "AbstractList.modCount (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/AbstractList.html#modCount
  - title: "Iterator.remove (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Iterator.html
  - title: "Collection.removeIf (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collection.html
  - title: "MDN: Array.prototype.splice()"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
  - title: "MDN: Array.prototype.filter()"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
---

## El problema: el filtro que deja pasar elementos

Tienes un carrito y quieres quitar los productos sin stock antes de cobrar:

```js
const cart = [
  { name: "mouse", stock: 0 },
  { name: "cable", stock: 0 },
  { name: "teclado", stock: 5 },
];

for (let i = 0; i < cart.length; i++) {
  if (cart[i].stock === 0) cart.splice(i, 1);
}

console.log(cart.map((p) => p.name)); // [ 'cable', 'teclado' ]: el cable sin stock se quedó
```

No hay ningún error en la consola: el resultado simplemente está mal. En Java, el mismo patrón a veces lanza una excepción y a veces también falla en silencio. Esta página explica por qué pasa y cómo hacerlo bien en los dos lenguajes.

## Primero, los términos

- **Recorrer** o **iterar**: visitar los elementos de una colección uno por uno, normalmente con un bucle.
- **Índice**: la posición de un elemento en un arreglo o lista, empezando en `0`.
- **Iterador**: un objeto que sabe recorrer una colección. Guarda por dónde va y tiene dos operaciones básicas: "¿hay otro?" (`hasNext`) y "dame el siguiente" (`next`).
- **Mutar**: modificar una colección en el lugar, en vez de crear una nueva.
- **Modificación estructural**: un cambio que altera el tamaño de la colección, como agregar o quitar elementos. Cambiar el valor de una posición (`list.set(0, x)`) no lo es.

## La idea central

Un recorrido lleva su propia noción de "dónde estoy": un índice o un iterador. Si quitas o agregas elementos en medio del recorrido, esa posición deja de corresponder a lo que hay en la colección. Según el lenguaje, el resultado es un error o, peor, un resultado incorrecto sin ningún aviso.

## JavaScript: índices que se corren

`splice` modifica el arreglo en el lugar: MDN lo clasifica como un método que muta el arreglo. Al quitar el elemento de la posición `i`, todos los siguientes bajan una posición. Si después el bucle incrementa `i`, el elemento que acaba de ocupar la posición `i` queda sin revisar.

Paso a paso con `["a", "", "", "b"]`, quitando los strings vacíos:

| `i` | Arreglo antes     | `words[i]` | Acción                                  | Arreglo después |
| --- | ----------------- | ---------- | --------------------------------------- | --------------- |
| 0   | `["a","","","b"]` | `"a"`      | nada                                    | igual           |
| 1   | `["a","","","b"]` | `""`       | `splice(1, 1)`: todo baja uno           | `["a","","b"]`  |
| 2   | `["a","","b"]`    | `"b"`      | nada: el `""` de la posición 1 se saltó | igual           |

```js
const words = ["a", "", "", "b"];
for (let i = 0; i < words.length; i++) {
  if (words[i] === "") words.splice(i, 1);
}
console.log(words); // [ 'a', '', 'b' ]: el segundo "" nunca se revisó
```

Dos formas correctas:

```js
// 1. Recorrer de atrás hacia adelante: lo que se corre ya fue revisado.
for (let i = words.length - 1; i >= 0; i--) {
  if (words[i] === "") words.splice(i, 1);
}

// 2. Crear un arreglo nuevo con filter, sin tocar el original.
const clean = words.filter((w) => w !== "");
```

`filter` construye un arreglo nuevo con los elementos que cumplen la condición. Suele ser la opción más clara, y en frontend es la que corresponde: en React, por ejemplo, el estado no se muta, se reemplaza por un arreglo nuevo (`setCart(cart.filter((p) => p.stock > 0))`).

## Java: iteradores fail-fast

Según JLS 14.14.2, un for-each sobre una colección se traduce a un bucle con un `Iterator`:

```java
for (String name : names) { /* ... */ }

// es equivalente a:
for (Iterator<String> it = names.iterator(); it.hasNext(); ) {
  String name = it.next();
  /* ... */
}
```

Los iteradores de `ArrayList` son **fail-fast** ("fallar rápido"): si la lista cambia estructuralmente por cualquier vía que no sea el propio iterador, el iterador lanza `ConcurrentModificationException` en vez de seguir con datos inconsistentes.

### Cómo lo detecta

La lista lleva un contador de modificaciones (`modCount`, documentado en `AbstractList`) que sube con cada modificación estructural. Al crearse, el iterador anota el valor. En cada `next()` compara: si el contador de la lista ya no coincide con el que anotó, lanza la excepción.

```java
List<String> names = new ArrayList<>(List.of("ana", "tom", "eva", "tim"));
for (String name : names) {
  if (name.startsWith("t")) names.remove(name); // modifica la lista, no el iterador
}
// ConcurrentModificationException
```

El nombre confunde: dice "concurrent", pero aquí hay **un solo hilo**. La documentación de `ConcurrentModificationException` lo aclara: un solo hilo que modifica una colección mientras la recorre con un iterador fail-fast también la provoca.

### No confíes en la excepción

La documentación aclara que este comportamiento **no está garantizado**: se hace "en la medida de lo posible" y sirve solo para detectar errores, nunca para depender de él. Hay casos en los que el bucle simplemente termina antes:

```java
List<String> few = new ArrayList<>(List.of("ana", "tom", "tim"));
List<String> seen = new ArrayList<>();
for (String name : few) {
  seen.add(name);
  if (name.equals("tom")) few.remove(name);
}
// few = [ana, tim], seen = [ana, tom]: "tim" nunca se visitó y no hubo excepción
```

Paso a paso: el iterador va por la posición 2 después de entregar `"tom"`. Al quitarlo, la lista queda con tamaño 2. `hasNext()` solo compara la posición con el tamaño: como los dos valen 2, responde que no hay más y el bucle termina **antes** de llegar al `next()` que habría detectado el cambio.

### Formas correctas

```java
// 1. Dejar que la colección lo haga (lo más claro).
list.removeIf(name -> name.startsWith("t"));

// 2. Usar el propio iterador: él quita el elemento y ajusta su posición.
for (Iterator<String> it = list.iterator(); it.hasNext(); ) {
  if (it.next().startsWith("t")) it.remove();
}

// 3. Crear una lista nueva, sin tocar la original.
List<String> kept = list.stream().filter(name -> !name.startsWith("t")).toList();
```

La documentación de `Iterator` indica que el comportamiento no está especificado si la colección se modifica de otra forma que no sea `Iterator.remove`.

Dónde aparece en una app real: limpiar sesiones vencidas de una lista en memoria, quitar líneas inválidas de un lote antes de guardarlo, descartar productos sin stock de un pedido. Siempre es el mismo patrón: "recorrer y quitar los que no sirven", y siempre se resuelve con `removeIf` o un filtro.

## En la entrevista

### ¿Por qué quitar elementos dentro de un bucle por índice puede saltarse elementos?

Porque al quitar el elemento de la posición `i`, todos los siguientes bajan una posición y el que estaba en `i + 1` pasa a `i`. Después el bucle hace `i++` y revisa la posición `i + 1`, así que el elemento que se movió a `i` nunca se revisa.

```js
const nums = [2, 4, 6];
for (let i = 0; i < nums.length; i++) {
  if (nums[i] % 2 === 0) nums.splice(i, 1);
}
// [4]: el 4 bajó a la posición 0 cuando el bucle ya estaba en la 1
```

La solución es recorrer de atrás hacia adelante o crear un arreglo nuevo con `filter`.

### ¿Qué significa que un iterador sea fail-fast? ¿Se puede confiar en que siempre lance la excepción?

Significa que, si detecta que la colección cambió estructuralmente por fuera de él, lanza `ConcurrentModificationException` en vez de seguir con datos inconsistentes. Lo detecta comparando un contador de modificaciones. **No** se puede confiar en él: la documentación dice que es "en la medida de lo posible" y solo sirve para detectar bugs. Por ejemplo, si quitas el penúltimo elemento, el bucle termina antes de llegar a la comprobación y no lanza nada.

### ¿Cómo eliminas elementos de una lista de forma segura en Java y en JavaScript?

En Java, con `list.removeIf(condición)` o con un `Iterator` explícito y `it.remove()`. En JavaScript, con `filter` para crear un arreglo nuevo, o recorriendo de atrás hacia adelante si tienes que modificar el original.

```java
orders.removeIf(order -> order.isCancelled());
```

```js
const active = orders.filter((order) => !order.cancelled);
```
