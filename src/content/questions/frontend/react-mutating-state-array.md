---
title: El botón no reordena la lista en pantalla. Encuentra el error
type: spot-the-bug
category: frontend
stack: [javascript, react]
seniority: [jr, ssr]
fundamentals: true
concepts: [react-state]
language: jsx
code: |
  function SortedList() {
    const [items, setItems] = useState([3, 1, 2]);

    function sortItems() {
      setItems(items.sort((a, b) => a - b));
    }

    return (
      <>
        <button onClick={sortItems}>Ordenar</button>
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </>
    );
  }
bugLine: 5
---

El error está en `setItems(items.sort((a, b) => a - b))`: `sort` ordena el array **en el lugar** (lo muta) y devuelve **el mismo array**. `setItems` recibe la misma referencia que ya tenía el estado, React compara con `Object.is`, cree que nada cambió y no vuelve a renderizar.

```jsx
const before = items;
const after = items.sort((a, b) => a - b); // ordena el array del estado y lo devuelve

after === before; // true: es el mismo objeto
setItems(after); // React: "mismo valor que antes" -> no hay render nuevo
```

**Por qué React funciona así:** para saber si tiene que volver a dibujar, React no revisa el contenido del array elemento por elemento, sino si la **referencia** es otra. Es una comparación instantánea, pero solo funciona si tratas el estado como de solo lectura y entregas un array nuevo cada vez que cambia.

**La consecuencia práctica:** el array sí quedó ordenado en memoria, pero la pantalla sigue mostrando el orden viejo. El cambio puede "aparecer de golpe" más tarde, cuando otro estado provoque un render, lo que hace el bug muy confuso de depurar.

**La solución:** ordenar una copia y pasar el array nuevo:

```jsx
function sortItems() {
  setItems(items.toSorted((a, b) => a - b)); // array nuevo: React detecta el cambio
  // o, en entornos sin toSorted:
  // setItems([...items].sort((a, b) => a - b));
}
```

Lo mismo vale para los otros métodos que mutan: `push`, `splice`, `reverse` o asignar `items[0] = x`. Sobre el estado se usan los que devuelven un array nuevo: `toSorted`, `map`, `filter`, `concat` o el spread `[...items]`.
