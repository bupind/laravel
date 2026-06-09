# Setup WhatsApp wwebjs

`https://wwebjs.dev` adalah situs dokumentasi/library, bukan endpoint API. Endpoint yang dipakai aplikasi harus server Node lokal dari file `whatsapp-server.cjs`.

## Install dependencies Node

```bash
npm install
```

`whatsapp-web.js` membutuhkan Node.js v18+ dan Chromium/Puppeteer.

## Development

Jalankan Laravel, Vite, dan WhatsApp API sekaligus:

```bash
npm run dev
```

Atau pisah:

```bash
npm run dev:vite
npm run dev:whatsapp
```

Endpoint lokal:

```text
GET  http://localhost:3001/api/status
GET  http://localhost:3001/api/qr
POST http://localhost:3001/api/restart
POST http://localhost:3001/api/logout
POST http://localhost:3001/api/send
```

## Setting App

Buka Backend -> Setting App -> WhatsApp:

```text
Provider: wwebjs
Endpoint: http://localhost:3001/api/send
Token: kosongkan, kecuali WWEBJS_SECRET diisi
```

QR tidak dicetak ke console. QR hanya diambil dari backend lewat `/api/qr`.

## Env

```env
WHATSAPP_ENABLED=true
WHATSAPP_PROVIDER=wwebjs
WHATSAPP_ENDPOINT=http://localhost:3001/api/send

WWEBJS_PORT=3001
PORT=3001
WWEBJS_CLIENT_ID=default
WWEBJS_RUNTIME_PATH=storage/app/wwebjs
WWEBJS_HEADLESS=true
# WWEBJS_SECRET=isi-token-jika-mau-proteksi
```

## Production

`npm run build` hanya untuk build asset Laravel/Vite. WhatsApp server harus jalan sebagai proses Node terpisah.

Manual:

```bash
npm run start:whatsapp
```

PM2 di VPS:

```bash
npm install -g pm2
npm run pm2:whatsapp
pm2 save
```

Untuk cPanel/VPS, lihat `DEPLOY_PRODUCTION.md`.

Session WhatsApp tersimpan di `storage/app/wwebjs/`; jangan dihapus agar tidak perlu scan ulang.
