import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-56765691/health", (c) => {
  return c.json({ status: "ok" });
});

// Phase 3 Feature 4 — RSS feed for blog_post + announcement CMS blocks.
// Reads from public.cms_blocks_live (anon-readable) and returns RSS 2.0 XML.
function xmlEscape(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

app.get("/make-server-56765691/rss.xml", async (c) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const siteOrigin = Deno.env.get("SITE_ORIGIN") ?? "https://mogzu.com";

  const url =
    `${supabaseUrl}/rest/v1/cms_blocks_live` +
    `?select=slug,kind,title,body,image_url,effective_at` +
    `&kind=in.(blog_post,announcement)` +
    `&order=effective_at.desc&limit=50`;

  const res = await fetch(url, {
    headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
  });
  if (!res.ok) {
    return c.text(`Upstream error: ${res.status}`, 502);
  }
  const rows: Array<{
    slug: string;
    kind: string;
    title: string | null;
    body: string | null;
    image_url: string | null;
    effective_at: string;
  }> = await res.json();

  const items = rows
    .map((r) => {
      const link = `${siteOrigin}/p/${r.slug}`;
      const pubDate = new Date(r.effective_at).toUTCString();
      const enclosure = r.image_url
        ? `\n      <enclosure url="${xmlEscape(r.image_url)}" type="image/jpeg" />`
        : "";
      return `    <item>
      <title>${xmlEscape(r.title)}</title>
      <link>${xmlEscape(link)}</link>
      <guid isPermaLink="true">${xmlEscape(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${xmlEscape(r.kind)}</category>${enclosure}
      <description>${xmlEscape(r.body?.slice(0, 600) ?? "")}</description>
    </item>`;
    })
    .join("\n");

  const lastBuild = rows[0]
    ? new Date(rows[0].effective_at).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Mogzu — Blog &amp; Announcements</title>
    <link>${siteOrigin}/blog</link>
    <description>Corporate events, gifting, and spaces updates from Mogzu.</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
});

Deno.serve(app.fetch);