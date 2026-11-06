import { rewriteConceptLink } from "./exercises";

// Structural subset of Sätteri's hast visitor types, so this module does not
// import `satteri` (a transitive dependency) directly.
interface LinkNode {
  properties: Record<string, unknown>;
}

interface VisitorContext {
  setProperty(node: never, key: string, value: unknown): void;
}

/** Sätteri hast plugin: points relative concept file links to concept pages. */
export const conceptLinksPlugin = {
  name: "concept-links",
  element: {
    filter: ["a"],
    visit(node: LinkNode, ctx: VisitorContext) {
      const href = node.properties.href;
      if (typeof href !== "string") return;
      const next = rewriteConceptLink(href);
      if (next !== href) ctx.setProperty(node as never, "href", next);
    },
  },
};
