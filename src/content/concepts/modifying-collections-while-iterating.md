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
  - title: "Iterator.remove (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Iterator.html
  - title: "Collection.removeIf (Java SE 25)"
    url: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/Collection.html
  - title: "MDN: Array.prototype.splice()"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
  - title: "MDN: Array.prototype.filter()"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
---

## El problema

Un recorrido lleva su propia noción de "dónde estoy": un índice o un iterador. Si quitas o agregas elementos en medio del recorrido, esa posición deja de corresponder a lo que hay en la colección. Según el lenguaje, el resultado es un error o, peor, un resultado incorrecto sin ningún aviso.

## JavaScript: índices que se corren

`splice` modifica el arreglo en el lugar: MDN lo clasifica como un método que muta el arreglo. Al quitar el elemento de la posición `i`, todos los siguientes bajan una posición. Si después el bucle incrementa `i`, el elemento que acaba de ocupar la posición `i` queda sin revisar:

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
const clean = original.filter((w) => w !== "");
```

`filter` construye un arreglo nuevo con los elementos que cumplen la condición. Suele ser la opción más clara cuando no necesitas modificar el arreglo original.

## Java: iteradores fail-fast

Según JLS 14.14.2, un for-each sobre una colección se traduce a un bucle con un `Iterator`. Los iteradores de `ArrayList` son **fail-fast**: si la lista cambia estructuralmente por cualquier vía que no sea el propio iterador, el iterador lanza `ConcurrentModificationException`:

```java
List<String> names = new ArrayList<>(List.of("ana", "tom", "eva", "tim"));
for (String name : names) {
  if (name.startsWith("t")) names.remove(name); // modifica la lista, no el iterador
}
// ConcurrentModificationException
```

La documentación aclara que este comportamiento **no está garantizado**: se hace "en la medida de lo posible" y sirve solo para detectar errores, nunca para depender de él. Hay casos donde el bucle simplemente termina antes:

```java
List<String> few = new ArrayList<>(List.of("ana", "tom", "tim"));
List<String> seen = new ArrayList<>();
for (String name : few) {
  seen.add(name);
  if (name.equals("tom")) few.remove(name);
}
// few = [ana, tim], seen = [ana, tom]: "tim" nunca se visitó y no hubo excepción
```

Formas correctas de quitar elementos durante un recorrido:

```java
// 1. Usar el propio iterador.
for (Iterator<String> it = list.iterator(); it.hasNext(); ) {
  if (it.next().startsWith("t")) it.remove();
}

// 2. Dejar que la colección lo haga.
list.removeIf(name -> name.startsWith("t"));
```

La documentación de `Iterator` indica que el comportamiento no está especificado si la colección se modifica de otra forma que no sea `Iterator.remove`.

## En la entrevista

- ¿Por qué quitar elementos dentro de un bucle por índice puede saltarse elementos?
- ¿Qué significa que un iterador sea fail-fast? ¿Se puede confiar en que siempre lance la excepción?
- ¿Cómo eliminas elementos de una lista de forma segura en Java y en JavaScript?
