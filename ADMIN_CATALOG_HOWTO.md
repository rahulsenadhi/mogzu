# Admin how-to: add your services, vendors & tie-ups

This is the founder/admin guide for putting **real services, partners, and
in-house offerings** live on Mogzu. No code or deploys needed — everything
below is done in the admin panel, and the public catalogue updates from
Supabase automatically.

**Log in** at `/admin/login` with a `mogzu_admin` account → lands on `/admin`.

The catalogue has three kinds of offerings:

| Kind | Who fulfils it | Where you add it | Needs approval? |
|------|----------------|------------------|-----------------|
| **Mogzu Direct** | Mogzu itself (in-house) | `/admin/mogzu-direct` | No — you publish directly |
| **Vendor listing** | A third-party vendor | `/admin/vendors` + `/admin/listings` | Yes — review queue |
| **Partner / tie-up** | A reseller/agency partner | `/admin/partners` + `/admin/partner-listings` | Partner approved first |

---

## 0. Set up categories first

Listings hang off categories, so create those once up front.

1. Go to **`/admin/categories`** (Category Management).
2. Add categories per module (Gifting / Events / D Space / coworking / stay).
   Set name, icon, display order, and toggle **active**.
3. Sub-categories: set a parent category.

> Disabling a category hides its listings from corporate users automatically
> (within ~1 min). Re-enable to bring them back. (Gifting product categories
> have a dedicated screen at `/admin/products/categories`.)

---

## 1. Fastest path — Mogzu Direct (your own services)

Use this for anything Mogzu delivers in-house (entertainment, merchandise,
curated experiences). No vendor, no approval queue.

1. Go to **`/admin/mogzu-direct`** → **Add** (`/admin/mogzu-direct/new`).
2. Run the wizard: module, category, title, description, pricing
   (transparent price / "request for price"), capacity, location, photos/video,
   add-ons.
3. Publish → it shows the **"Mogzu Direct"** badge and appears in the corporate
   catalogue and on `/admin/mogzu-orders`.

This is the quickest way to get a real, bookable catalogue live while vendor
onboarding catches up.

---

## 2. Vendor services (third-party tie-ups you fulfil through a vendor)

1. **Create the vendor** — `/admin/vendors` → add business name, contact, city,
   GST/KYC. Set status **active** once verified.
2. **Enable their module(s)** — set which modules the vendor operates in
   (Gifting / Events / D Space).
3. **Create listings** — `/admin/listings` → new listing for that vendor
   (`owner_type = vendor`). It starts as **pending_approval**.
4. **Approve** — `/admin/listings/queue` (pending listings) → review → approve.
   Status flips to **active** and it goes live in the corporate catalogue.
   Edit any listing at `/admin/listings/:id`.

> Vendor applications coming in from the public `/vendor-apply` form land in
> `/admin/vendor-applications`.

---

## 3. Partner tie-ups (resellers, agencies, white-label)

For commercial partners who bring their own listings and earn commission.

1. **Add the partner** — `/admin/partners` → **New** (`/admin/partners/new`):
   type, business name, contact. Approve to generate their **referral code**.
2. **Set commercial terms** — `/admin/partners/:id/agreement`: referral %,
   reseller wholesale %, revenue share, validity.
3. **Add their listings** — `/admin/partner-listings` → **New**
   (`owner_type = partner`). These are attributed to the partner for
   commission/payout (monthly cycle at `/admin/partner-payouts`).

Partners can also self-sign-up at `/signup/partner`; referred corporates come
through `/partner-ref/:code`.

---

## 4. Enquiries & offline orders (while the portal fills up)

- **Public enquiries**: visitors submit the managed-services form on `/services`
  and the **Book a Demo** form (`/request-demo`). Both land in the lead inbox.
- **Offline / phone / referral orders**: log them yourself in **`/admin/leads`**
  (Lead Operations Hub) via staff intake — phone, WhatsApp, referral, partner,
  walk-in channels.
- Work leads through statuses: new → assigned → qualified → converted. Converted
  leads surface alongside bookings in `/admin/mogzu-orders`.

---

## 5. "Launching soon" → "live" (module gating)

Modules that aren't ready show a **"launching soon"** state to corporate users
instead of a half-empty catalogue. This is controlled in
**`/admin/platform-modules`**:

- Each module (Gifting / Events / D Space / Hey Genie) has: **enabled**, a
  **minimum active vendors** threshold, and the current **active vendor count**.
- **Hidden** = module off (`enabled` false).
- **Launching soon** = enabled but active vendors **below** the threshold.
- **Live** = enabled and active vendors **at/above** the threshold.

So to show a module as "launching soon" now: enable it and keep its threshold
above the number of live vendors/listings you've added. As you add real
vendors/listings (steps 1–3) and the count crosses the threshold, the module
**flips to live automatically** — no code change.

---

## Quick reference

| Task | Go to |
|------|-------|
| Categories | `/admin/categories` (gifting: `/admin/products/categories`) |
| In-house offering | `/admin/mogzu-direct` |
| Vendors | `/admin/vendors` |
| Vendor listings + approval | `/admin/listings`, `/admin/listings/queue` |
| Partners + terms | `/admin/partners`, `/admin/partners/:id/agreement` |
| Partner listings | `/admin/partner-listings` |
| Lead inbox / offline orders | `/admin/leads` |
| Orders | `/admin/mogzu-orders` |
| Launching-soon gating | `/admin/platform-modules` |
| Homepage/marketing content | `/admin/cms` |
