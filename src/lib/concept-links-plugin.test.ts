import { describe, expect, it, vi } from "vitest";
import { conceptLinksPlugin } from "./concept-links-plugin";

const visitLink = (href: unknown) => {
  const node = { type: "element", tagName: "a", properties: { href } };
  const ctx = { setProperty: vi.fn() };
  conceptLinksPlugin.element.visit(node, ctx);
  return ctx.setProperty;
};

describe("conceptLinksPlugin", () => {
  it("only visits anchors", () => {
    expect(conceptLinksPlugin.element.filter).toEqual(["a"]);
  });

  it("points a concept file link to its page", () => {
    const node = {
      type: "element",
      tagName: "a",
      properties: { href: "../../../../src/content/concepts/js-closures.md" },
    };
    const ctx = { setProperty: vi.fn() };
    conceptLinksPlugin.element.visit(node, ctx);
    expect(ctx.setProperty).toHaveBeenCalledWith(
      node,
      "href",
      "/conceptos/js-closures/",
    );
  });

  it("leaves other links and missing hrefs untouched", () => {
    expect(visitLink("https://example.com/")).not.toHaveBeenCalled();
    expect(visitLink(undefined)).not.toHaveBeenCalled();
  });
});
