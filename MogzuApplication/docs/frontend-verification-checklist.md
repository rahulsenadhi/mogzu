# Frontend flow verification checklist

Run after `npm run dev` with Supabase unpaused and redirect URLs configured for your dev port.

## Build

- [x] `npm run build` succeeds (automated in implementation pass)

## Auth redirects (manual)

| As role | Visit | Expected |
|---------|-------|----------|
| Logged out | `/dashboard` | `/login` |
| Corporate | `/vendor/dashboard` | `/dashboard` |
| Vendor | `/dashboard` | `/vendor/dashboard` |
| Admin | `/dashboard` | `/admin` |
| Corporate (onboarding incomplete) | `/dashboard` | `/signup/corporate/company-details` |

## Corporate golden paths

1. `/login` → sign in → `/dashboard` (or onboarding step)
2. Sidebar **Notification** → `/corporate/notifications`
3. Activity Suite **View pending approvals** → `/corporate/approvals`
4. Header bell → `/corporate/notifications`
5. `/heygenie` loads (module enabled)
6. `/assistance` redirects to `/heygenie`

## Vendor

1. `/vendor/dashboard` without auth → `/login`
2. Pending vendor status → `/vendor/verification-pending`

## Admin

1. `/admin/commissions` → admin layout + auth required
2. `/admin/login` → login form

## Partner / AM

1. `/partner/dashboard` requires partner role
2. `/am/shortlists` requires account_manager or mogzu_admin
