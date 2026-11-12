// Filters for the question list. Pure and import-free: it runs in the browser
// and reads/writes the query string (`?categoria=backend&stack=java`).

export const filterGroups = ["categoria", "stack", "seniority"] as const;
export type FilterGroup = (typeof filterGroups)[number];

/** Selected values per group; an empty group means "any". */
export type Filters = Record<FilterGroup, string[]>;

/** Values each group accepts, taken from the content. */
export type FilterOptions = Record<FilterGroup, readonly string[]>;

/** What a question exposes to the filters. */
export interface Filterable {
  categoria: string;
  stack: readonly string[];
  seniority: readonly string[];
}

export const emptyFilters = (): Filters => ({
  categoria: [],
  stack: [],
  seniority: [],
});

/** Unknown values are dropped so a stale or edited link never hides everything. */
export function parseFilters(search: string, options: FilterOptions): Filters {
  const params = new URLSearchParams(search);
  const filters = emptyFilters();
  for (const group of filterGroups) {
    const values = (params.get(group) ?? "").split(",");
    filters[group] = [...new Set(values)].filter((value) =>
      options[group].includes(value),
    );
  }
  return filters;
}

export function serializeFilters(filters: Filters): string {
  // Built by hand so commas stay readable instead of becoming %2C.
  const parts = filterGroups
    .filter((group) => filters[group].length > 0)
    .map(
      (group) => `${group}=${filters[group].map(encodeURIComponent).join(",")}`,
    );
  return parts.length > 0 ? `?${parts.join("&")}` : "";
}

/** OR within a group, AND across groups. */
export function matchesFilters(item: Filterable, filters: Filters): boolean {
  const values: Record<FilterGroup, readonly string[]> = {
    categoria: [item.categoria],
    stack: item.stack,
    seniority: item.seniority,
  };
  return filterGroups.every(
    (group) =>
      filters[group].length === 0 ||
      filters[group].some((value) => values[group].includes(value)),
  );
}
