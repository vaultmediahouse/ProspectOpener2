# Vault Media House

Phase 1 showcase and conversion website for the Vault Media House verified lead marketplace.

## Local setup

1. Copy `.env.example` to `.env.local` and set `DATABASE_URL` and a long `SESSION_SECRET`.
2. Start PostgreSQL and create the `prospectopener2` database.
3. Run `npm run db:migrate` once, then `npm run db:seed`.
4. Start the website with `npm run dev`.

Google OAuth requires `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and a callback URL of `/api/auth/google/callback`.

Razorpay checkout requires `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. Configure the webhook endpoint at `/api/payments/razorpay/webhook` for `payment.captured` and `payment.failed` events.

Set `NEXT_PUBLIC_APP_URL` to the public website URL and `CUSTOMER_APP_URL` / `NEXT_PUBLIC_CUSTOMER_APP_URL` to the future customer application URL.

Set `ADMIN_EMAIL` to the email address that should be treated as the first admin account. Anyone signing in with that email will be elevated server-side to `ADMIN`; regular customer registration never exposes an admin role picker.

## Validation

- `npm run lint`
- `npm run build`
