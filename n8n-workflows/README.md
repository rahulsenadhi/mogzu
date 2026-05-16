# Mogzu N8N Workflows

All automation workflows for Mogzu. Hosted on N8N Cloud.

## Deployment

1. Import each `.json` file via N8N Cloud → Workflows → Import
2. Set credentials for each workflow (Supabase, Resend, Razorpay)
3. Activate workflows in order listed below

## Workflows

| File | Trigger | Purpose |
|------|---------|---------|
| `vendor-sla-auto-cancel.json` | Webhook (Supabase booking INSERT) | Auto-cancel booking if vendor doesn't confirm within SLA window |
| `budget-threshold-alert.json` | Webhook (Supabase wallet UPDATE) | Notify L2/L3 approver when department spend exceeds threshold |
| `vendor-registration-tasks.json` | Webhook (Supabase vendor INSERT) | Create onboarding checklist tasks when new vendor registers |
| `festival-gifting-reminder.json` | Schedule (cron) | Remind corporates of upcoming gifting occasions |
| `booking-completion-payout.json` | Webhook (Supabase booking UPDATE status=completed) | Trigger Razorpay payout to vendor after booking marked complete |

## Environment Variables (N8N Credentials)

- `SUPABASE_URL` — project URL
- `SUPABASE_SERVICE_ROLE_KEY` — service role key (never use anon key in N8N)
- `RESEND_API_KEY` — transactional email
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — payout triggers
- `N8N_WEBHOOK_SECRET` — shared secret for webhook verification

## Webhook Registration

Supabase Database Webhooks (Table Webhooks) send POST to N8N webhook URLs.
Set up in Supabase Dashboard → Database → Webhooks.

| Table | Event | Target Workflow |
|-------|-------|----------------|
| `bookings` | INSERT | `vendor-sla-auto-cancel` |
| `wallets` | UPDATE | `budget-threshold-alert` |
| `vendors` | INSERT | `vendor-registration-tasks` |
| `bookings` | UPDATE (status=completed) | `booking-completion-payout` |
