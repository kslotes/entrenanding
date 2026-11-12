---
title: El botón no reordena la lista en pantalla. Encuentra el error
type: spot-the-bug
category: frontend
stack: [javascript, react]
seniority: [jr, ssr]
fundamentals: true
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

`sort` ordena el arreglo **en el lugar** y devuelve el mismo arreglo. `setItems` recibe la misma referencia que ya tenía el estado, y como React compara con `Object.is`, considera que nada cambió y omite el nuevo render.

Además, el código mutó el estado directamente, algo que React pide no hacer: los arreglos en el estado se tratan como de solo lectura.

Solución: ordenar una copia, `setItems([...items].sort((a, b) => a - b))` o `setItems(items.toSorted((a, b) => a - b))`.
