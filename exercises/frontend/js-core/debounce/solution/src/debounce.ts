/**
 * Solución de referencia.
 *
 * `timer` vive en el closure: cada función que devuelve `debounce` tiene el
 * suyo, y sobrevive entre llamadas sin ser una variable global. Cada llamada
 * cancela el timer anterior y programa uno nuevo, así que la función original
 * solo corre cuando pasan `waitMs` milisegundos sin llamadas.
 */

/** La función que devuelve `debounce`: se llama igual que la original y se puede cancelar. */
export type Debounced<T, A extends unknown[]> = {
  (this: T, ...args: A): void;
  cancel(): void;
};

export function debounce<T, A extends unknown[]>(
  fn: (this: T, ...args: A) => void,
  waitMs: number,
): Debounced<T, A> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  // `function` (no arrow) para recibir el `this` de quien llama.
  function debounced(this: T, ...args: A): void {
    clearTimeout(timer);
    // La arrow function captura el `this` y los `args` de esta llamada.
    timer = setTimeout(() => {
      timer = undefined;
      fn.apply(this, args);
    }, waitMs);
  }

  debounced.cancel = (): void => {
    clearTimeout(timer);
    timer = undefined;
  };

  return debounced;
}
