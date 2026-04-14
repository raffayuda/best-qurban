# Midtrans Setup Guide

## 1. Get your keys

1. Login to Midtrans dashboard (sandbox or production).
2. Open **Settings -> Access Keys**.
3. Copy:
   - Server Key
   - Client Key

Use the exact key shown in your dashboard. Do not add or remove prefixes manually.

## 2. Configure `.env`

```env
MIDTRANS_ENV=sandbox
MIDTRANS_SERVER_KEY=Mid-server-xxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxx
```

For production:

```env
MIDTRANS_ENV=production
MIDTRANS_SERVER_KEY=Mid-server-xxxx
MIDTRANS_CLIENT_KEY=Mid-client-xxxx
```

## 3. Restart app

After changing `.env`:

```bash
npm run dev
```

## 4. Verify integration

1. Checkout from UI.
2. Choose VA method inside custom modal.
3. Ensure VA number appears.
4. Use "Cek Status Pembayaran" after payment.

## Troubleshooting

### `401 Unknown Merchant server_key/id`

- Server key is wrong for selected environment.
- You are mixing sandbox key with production mode (or vice versa).
- Key was copied with typo/extra character.

### Custom modal appears but invoice is not created

- Check `/api/create-transaction` response in browser network tab.
- Check server logs for Midtrans error message.

### Status never changes from pending

- Payment not completed yet.
- Callback/notification setup may be missing for your account.
