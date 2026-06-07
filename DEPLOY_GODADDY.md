# Deploying Mogzu landing + portal to mogzu.com (GoDaddy)

Mogzu is a Vite/React **single-page app** with a Supabase backend. GoDaddy
shared hosting can't run a build pipeline, so the flow is: **build locally →
upload the `dist/` folder to `public_html`**. The Supabase backend (database,
auth, edge functions) keeps running on Supabase — GoDaddy only serves the
static front-end.

> Works for the landing + the whole portal (booking, admin, dashboards). All
> dynamic data comes from Supabase over HTTPS; GoDaddy just hosts static files.

---

## 0. Confirm your GoDaddy plan type (one-time)

| Plan | SPA routing file | Notes |
|------|------------------|-------|
| **cPanel / Linux Hosting** (most common) | `.htaccess` (already bundled — see below) | Recommended. Do nothing extra. |
| **Windows / Plesk Hosting** | `web.config` | Use the snippet in §6 instead of `.htaccess`. |
| **Domain only (no hosting plan)** | — | You can't host static files here. Either buy a GoDaddy hosting plan, or keep the domain and point DNS at a free static host (Vercel/Netlify/Cloudflare Pages). Ask before going this route. |

Check at GoDaddy → **My Products**. If you see "cPanel Admin", you're on Linux.

---

## 1. Set production env values

```powershell
cd "C:\Mogzu Figma Cursor\MogzuApplication"
copy .env.production.example .env.production
```

Edit `.env.production` and fill in real values (Supabase URL + anon key, WhatsApp
number, Razorpay **public** key id, Turnstile site key). Only `VITE_*` values
are read; they get baked into the static bundle. **Never put secrets**
(Razorpay secret, Resend/N8N/cron keys) here — those stay in Supabase Edge
Function secrets. `.env.production` is gitignored; do not commit it.

---

## 2. Build

```powershell
cd "C:\Mogzu Figma Cursor\MogzuApplication"
npm install
npm run build
```

Output lands in `MogzuApplication\dist\`. The SPA routing file
(`public/.htaccess`) is copied into `dist/` automatically.

---

## 3. Upload to public_html

**Option A — cPanel File Manager (no extra tools)**
1. GoDaddy → cPanel → **File Manager** → open `public_html`.
2. Delete the GoDaddy placeholder (`index.html` / "coming soon") if present.
3. Zip the **contents** of `dist/` (not the `dist` folder itself), upload the
   zip into `public_html`, then **Extract** it there.
4. Confirm `index.html`, `assets/`, and `.htaccess` sit directly in
   `public_html` (enable "Show Hidden Files (dotfiles)" to see `.htaccess`).

**Option B — FTP (FileZilla)**
1. Get FTP credentials from GoDaddy (cPanel → FTP Accounts).
2. Upload everything inside `dist/` to `/public_html`, including `.htaccess`.

> Re-deploy = rebuild (§2) and re-upload `dist/` contents, overwriting.

---

## 4. Point the domain + enable HTTPS

- If the domain's hosting is this cPanel account, `mogzu.com` already serves
  `public_html`. Otherwise set the primary domain / docroot to `public_html`.
- Enable SSL: cPanel → **SSL/TLS Status** → run **AutoSSL** (free Let's
  Encrypt). Wait until the padlock is green before relying on the HTTPS
  redirect in `.htaccess`.

---

## 5. Verify (smoke test)

- [ ] `https://mogzu.com` loads the landing page.
- [ ] Hard-refresh on a deep link — `https://mogzu.com/services` and
      `https://mogzu.com/about` — load (no 404). ✅ confirms `.htaccess` works.
- [ ] Browser DevTools console is free of Supabase/env errors.
- [ ] Submit the **Book a Demo** form (`https://mogzu.com/request-demo`) → it
      shows success, and the lead appears in **/admin → Leads** inbox.
- [ ] Managed-services enquiry on `/services` submits successfully.

---

## 6. Windows/Plesk only — `web.config`

If on Windows hosting, `.htaccess` is ignored. Add a `web.config` to
`public_html` instead:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

---

## Notes

- **Subfolder hosting** (e.g. `mogzu.com/app`): set `base: '/app/'` in
  `vite.config.ts` before building. For the root domain, no change needed.
- **Offline orders keep flowing** regardless of deploy: staff log enquiries via
  the admin lead intake; online visitors use the public enquiry + demo forms —
  all into the same Supabase `public_leads` inbox.
