// app/sitemap.xml/route.js
export async function GET() {
  const baseUrl = "https://evolutiongymneza.com";

  const pages = [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/#planes`, lastModified: new Date(), priority: 0.9 },
    {
      url: `${baseUrl}/#instalaciones`,
      lastModified: new Date(),
      priority: 0.8,
    },
    { url: `${baseUrl}/#formulario`, lastModified: new Date(), priority: 0.8 },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${pages
      .map(
        (page) => `
    <url>
      <loc>${page.url}</loc>
      <lastmod>${page.lastModified.toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${page.priority}</priority>
    </url>`
      )
      .join("")}
  </urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
