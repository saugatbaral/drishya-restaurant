import { defineConfig, loadEnv } from "vite";

/**
 * Writes robots.txt and sitemap.xml into the build, using the site address
 * from VITE_SITE_URL (.env.production). index.html reads the same value for
 * its canonical link, share tags and structured data, so the domain lives in
 * one place.
 */
function seoFiles(siteUrl) {
  return {
    name: "seo-files",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      });

      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
  </url>
</urlset>
`,
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const siteUrl = loadEnv(mode, process.cwd(), "VITE_").VITE_SITE_URL ?? "";

  // Catch a wrong address before it gets published
  if (mode === "production" && !/^https:\/\/[^/]+$/.test(siteUrl)) {
    throw new Error(
      `VITE_SITE_URL in .env.production must look like https://example.com (https, no trailing slash). Got: "${siteUrl}"`,
    );
  }

  return { plugins: [seoFiles(siteUrl)] };
});
