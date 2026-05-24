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

// ─── sitemap.xml ─────────────────────────────────────────────────────────────
// Search-engine crawlable index of public listings + static routes. Reads
// listings where status='active' AND public_visible=true; uses the same
// anon key surface as the rss.xml route so this works pre-login.

app.get("/make-server-56765691/sitemap.xml", async (c) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const siteOrigin = Deno.env.get("MOGZU_SITE_ORIGIN") ?? "https://mogzu.in";

  const STATIC: string[] = [
    "/",
    "/explore",
    "/explore/events",
    "/explore/gifting",
    "/explore/spacex_coworking",
    "/explore/spacex_stay",
    "/security",
    "/blog",
  ];

  let listings: { id: string; updated_at: string }[] = [];
  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/listings?select=id,updated_at&status=eq.active&public_visible=eq.true&order=updated_at.desc&limit=2000`,
      {
        headers: {
          "apikey": anonKey,
          "Authorization": `Bearer ${anonKey}`,
        },
      },
    );
    if (res.ok) listings = (await res.json()) as { id: string; updated_at: string }[];
  } catch {
    // best-effort; sitemap still emits the static section.
  }

  const urlEl = (loc: string, lastmod?: string) =>
    `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod.split("T")[0]}</lastmod>` : ""}</url>`;

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    STATIC.map((p) => urlEl(`${siteOrigin}${p}`)).join("\n") +
    "\n" +
    listings
      .map((l) => urlEl(`${siteOrigin}/listings/${l.id}`, l.updated_at))
      .join("\n") +
    "\n</urlset>\n";

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
});

// ─── Razorpay create order ───────────────────────────────────────────────────
// POST /razorpay-create-order { amount, currency, kind, booking_id?,
// request_id? }. Calls Razorpay Orders API with key/secret pair and
// returns the order_id + amount for the frontend to hand to Checkout.js.
// Notes (kind, booking_id, request_id) are carried into payment.captured
// webhook so the existing handler routes to the right RPC / update.

app.post("/make-server-56765691/razorpay-create-order", async (c) => {
  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) {
    return c.json({ ok: false, error: "Razorpay keys not configured" }, 500);
  }

  let body: {
    amount?: number;
    currency?: string;
    kind?: string;
    booking_id?: string;
    request_id?: string;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: "bad json" }, 400);
  }

  const amount = Number(body.amount);
  if (!amount || amount <= 0) return c.json({ ok: false, error: "bad amount" }, 400);
  const currency = body.currency ?? "INR";

  const notes: Record<string, string> = { kind: body.kind ?? "" };
  if (body.booking_id) notes.booking_id = body.booking_id;
  if (body.request_id) notes.request_id = body.request_id;

  const basic = btoa(`${keyId}:${keySecret}`);
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${basic}`,
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // paise
      currency,
      notes,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return c.json({ ok: false, error: `razorpay: ${text}` }, 502);
  }

  const order = (await res.json()) as { id?: string; amount?: number; currency?: string };
  return c.json({ ok: true, order_id: order.id, amount: order.amount, currency: order.currency, key_id: keyId });
});

// ─── Razorpay create refund ───────────────────────────────────────────────────
// POST /razorpay-create-refund { payment_id, amount, booking_id, refund_id }.
// Uses server-side Razorpay credentials to create a gateway refund for a
// captured card/UPI payment and returns Razorpay refund id/status.
app.post("/make-server-56765691/razorpay-create-refund", async (c) => {
  const keyId = Deno.env.get("RAZORPAY_KEY_ID");
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keyId || !keySecret) {
    return c.json({ ok: false, error: "Razorpay keys not configured" }, 500);
  }

  let body: {
    payment_id?: string;
    amount?: number;
    booking_id?: string;
    refund_id?: string;
  };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: "bad json" }, 400);
  }

  const paymentId = (body.payment_id ?? "").trim();
  const amount = Number(body.amount);
  if (!paymentId) return c.json({ ok: false, error: "missing payment_id" }, 400);
  if (!amount || amount <= 0) return c.json({ ok: false, error: "bad amount" }, 400);

  const basic = btoa(`${keyId}:${keySecret}`);
  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${basic}`,
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // paise
      notes: {
        booking_id: body.booking_id ?? "",
        refund_id: body.refund_id ?? "",
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return c.json({ ok: false, error: `razorpay refund: ${text}` }, 502);
  }

  const refund = (await res.json()) as { id?: string; status?: string };
  return c.json({ ok: true, refund_id: refund.id, status: refund.status ?? "pending" });
});

// ─── Razorpay webhook ────────────────────────────────────────────────────────
// Verifies HMAC-SHA256 signature with RAZORPAY_WEBHOOK_SECRET, then routes
// the event based on notes.kind on the order:
//   wallet_topup     -> wallet_topup_confirm RPC (service_role)
//   booking_payment  -> bookings.update payment_status = 'paid'
// Idempotency is guaranteed inside the RPC (status check) and on the
// booking side by checking payment_status before update.

async function hmacHex(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

app.post("/make-server-56765691/razorpay-webhook", async (c) => {
  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
  if (!secret) return c.json({ ok: false, error: "secret not configured" }, 500);

  const sigHeader = c.req.header("x-razorpay-signature") ?? "";
  const rawBody = await c.req.text();
  const expected = await hmacHex(secret, rawBody);

  // Constant-time-ish compare.
  if (sigHeader.length !== expected.length) {
    return c.json({ ok: false, error: "bad signature" }, 401);
  }
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= sigHeader.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (mismatch !== 0) return c.json({ ok: false, error: "bad signature" }, 401);

  let payload: { event?: string; payload?: { payment?: { entity?: Record<string, unknown> } } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return c.json({ ok: false, error: "bad json" }, 400);
  }

  if (payload.event !== "payment.captured") {
    return c.json({ ok: true, skipped: payload.event ?? "unknown" });
  }

  const payment = payload.payload?.payment?.entity ?? {};
  const paymentId = String(payment.id ?? "");
  const notes = (payment.notes as Record<string, string>) ?? {};
  const kind = notes.kind;

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (kind === "wallet_topup") {
    const requestId = notes.request_id;
    if (!requestId) return c.json({ ok: false, error: "missing request_id" }, 400);

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/wallet_topup_confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ p_request_id: requestId, p_payment_ref: paymentId }),
    });
    if (!res.ok) {
      const text = await res.text();
      return c.json({ ok: false, error: `rpc failed: ${text}` }, 500);
    }
    return c.json({ ok: true, kind, request_id: requestId });
  }

  if (kind === "booking_payment") {
    const bookingId = notes.booking_id;
    if (!bookingId) return c.json({ ok: false, error: "missing booking_id" }, 400);

    const res = await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${bookingId}&payment_status=neq.paid`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        payment_status: "paid",
        payment_method: String(payment.method ?? "razorpay"),
        payment_reference: paymentId,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return c.json({ ok: false, error: `update failed: ${text}` }, 500);
    }
    return c.json({ ok: true, kind, booking_id: bookingId });
  }

  return c.json({ ok: true, skipped: `unknown kind: ${kind ?? "(none)"}` });
});

Deno.serve(app.fetch);