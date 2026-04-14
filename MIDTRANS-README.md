# TestStore - Midtrans Integration Notes

This project uses SvelteKit + Midtrans with a custom checkout modal (no Snap popup).

## Current payment flow

1. User fills checkout form.
2. App opens a custom modal.
3. User chooses payment method (BCA/BNI/BRI Virtual Account).
4. Backend creates Midtrans charge via Core API (`/v2/charge`).
5. Modal shows VA number and lets user check status.
6. On `settlement`/`capture`, order is marked success.

## Environment variables

Create `.env` in project root:

```env
MIDTRANS_ENV=sandbox
MIDTRANS_SERVER_KEY=Mid-server-xxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxx
```

Notes:

- `MIDTRANS_ENV` must be `sandbox` or `production`.
- Core API charge uses `MIDTRANS_SERVER_KEY`.
- `MIDTRANS_CLIENT_KEY` is kept for compatibility, but not used by popup flow anymore.

## Switch to production

1. Set `MIDTRANS_ENV=production`
2. Replace keys with production keys from Midtrans production dashboard
3. Ensure your payment notification endpoint and domain are production-ready (HTTPS/public)
4. Redeploy and verify with a small live transaction

## API routes

### `POST /api/create-transaction`

Create a VA charge.

Request body:

```json
{
	"orderId": "ORDER-123",
	"total": 1500000,
	"items": [],
	"customerInfo": {},
	"paymentMethod": "bca_va"
}
```

Supported `paymentMethod`:

- `bca_va`
- `bni_va`
- `bri_va`

### `GET /api/create-transaction?orderId=...`

Check Midtrans transaction status.

## Development commands

```bash
npm run dev
npm run check
npm run lint
```
