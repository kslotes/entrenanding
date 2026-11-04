/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    include: ["src/**/*.test.ts"],
    // The content tests list files with import.meta.glob. A cached transform
    // keeps a stale file list when content is added or removed, so a removed
    // concept could still pass. The suite is small; always transform fresh.
    fsModuleCache: false,
  },
});
