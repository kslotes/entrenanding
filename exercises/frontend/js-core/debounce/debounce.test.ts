import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { debounce } from "./src/debounce";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("debounce", () => {
  it("no llama a la función antes de que pase la espera", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    vi.advanceTimersByTime(99);

    expect(fn).not.toHaveBeenCalled();
  });

  it("llama a la función una vez cuando pasa la espera", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("agrupa llamadas seguidas en una sola, con los últimos argumentos", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("r");
    debounced("re");
    debounced("rea");
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("rea");
  });

  it("reinicia la espera con cada llamada", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    vi.advanceTimersByTime(60);
    debounced();
    vi.advanceTimersByTime(60);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(40);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("vuelve a llamar en una ráfaga separada", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced(1);
    vi.advanceTimersByTime(100);
    debounced(2);
    vi.advanceTimersByTime(100);

    expect(fn.mock.calls).toEqual([[1], [2]]);
  });

  it("conserva el this de quien la llama", () => {
    const counter = {
      count: 0,
      increment: debounce(function (this: { count: number }) {
        this.count++;
      }, 100),
    };

    counter.increment();
    vi.advanceTimersByTime(100);

    expect(counter.count).toBe(1);
  });

  it("cancel descarta la llamada pendiente", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced.cancel();
    vi.advanceTimersByTime(100);

    expect(fn).not.toHaveBeenCalled();
  });

  it("se puede volver a usar después de cancel", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced.cancel();
    debounced();
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("cada función debounced tiene su propia espera", () => {
    const first = vi.fn();
    const second = vi.fn();
    const debouncedFirst = debounce(first, 100);
    const debouncedSecond = debounce(second, 100);

    debouncedFirst();
    vi.advanceTimersByTime(50);
    debouncedSecond();
    vi.advanceTimersByTime(50);

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(second).toHaveBeenCalledTimes(1);
  });
});
