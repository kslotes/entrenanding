/**
 * Lee statement.md en la carpeta del ejercicio y haz que pasen los tests de
 * debounce.test.ts.
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
  throw new Error("TODO");
}
