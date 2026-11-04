import { defineConfig } from "vitest/config";

// Frontend exercises, kept out of `pnpm test` because their starter code fails
// on purpose.
//
//   pnpm exercise js-core/debounce                   starter code (what you edit)
//   pnpm exercise js-core/debounce --mode solution   reference solution

const EXERCISE_SRC = /^(.*\/exercises\/frontend\/[^/]+\/[^/]+)\/src\//;

export default defineConfig(({ mode }) => ({
  plugins:
    mode === "solution"
      ? [
          {
            // An exercise's imports of `src/...` resolve to `solution/src/...`.
            // The tests stay the same.
            name: "use-reference-solutions",
            enforce: "pre",
            async resolveId(source, importer, options) {
              if (!importer || !source.startsWith(".")) return null;
              const resolved = await this.resolve(source, importer, {
                ...options,
                skipSelf: true,
              });
              const match = resolved && EXERCISE_SRC.exec(resolved.id);
              if (!resolved || !match) return null;
              return resolved.id.replace(
                `${match[1]}/src/`,
                `${match[1]}/solution/src/`,
              );
            },
          },
        ]
      : [],
  test: {
    include: ["exercises/frontend/**/*.test.{ts,tsx}"],
  },
}));
