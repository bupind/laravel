# Setup WhatsApp wwebjs — dalam 1 project Laravel

`https://wwebjs.dev` adalah situs dokumentasi/library, bukan endpoint API. Endpoint yang dipakai aplikasi harus server Node lokal dari file `whatsapp-server.cjs`.

## 1. Install dependencies Node

```bash
npm install
```

> `whatsapp-web.js` membutuhkan Node.js v18+ dan Chromium/Puppeteer. Dokumentasi resmi `whatsapp-web.js` juga menyarankan `--no-sandbox` dan `--disable-setuid-sandbox` untuk environment tanpa GUI/root.

## 2. Jalankan server

Terminal 1 — Laravel:

```bash
php artisan serve
```

Terminal 2 — Vite + wwebjs:

```bash
npm run dev
```

Atau pisah:

```bash
npm run dev:vite
npm run dev:whatsapp
```

## 3. Setting di Setting App

Buka **Backend → Setting App → tab Service → WhatsApp**:

| Field | Value |
|---|---|
| Provider | `wwebjs` |
| Endpoint | `http://localhost:3001/api/send` |
| Token | kosongkan, kecuali Anda set `WWEBJS_SECRET` |

Klik **Scan QR Login**. Laravel otomatis mengambil QR dari:

```text
http://localhost:3001/api/qr
```

## 4. Cek manual kalau QR belum muncul

Buka di browser:

```text
http://localhost:3001/api/status
http://localhost:3001/api/qr
```

Restart client wwebjs:

```bash
curl -X POST http://localhost:3001/api/restart
```

Di Windows PowerShell:

```powershell
Invoke-RestMethod -Method Post http://localhost:3001/api/restart
```

## 5. Env opsional

```env
WHATSAPP_ENABLED=true
WHATSAPP_PROVIDER=wwebjs
WHATSAPP_ENDPOINT=http://localhost:3001/api/send

# Opsional untuk node whatsapp-server.cjs
WWEBJS_PORT=3001
WWEBJS_CLIENT_ID=default
WWEBJS_DATA_PATH=.wwebjs_auth
WWEBJS_HEADLESS=true
# WWEBJS_SECRET=isi-token-jika-mau-proteksi
```

Kalau `WHATSAPP_ENDPOINT` atau Setting App diisi `https://wwebjs.dev`, QR tidak akan muncul karena alamat itu bukan server bot.

## 6. Production

Jalankan wwebjs sebagai service terpisah dengan PM2:

```bash
npm install -g pm2
pm2 start whatsapp-server.cjs --name wwebjs
pm2 save
```

Session WhatsApp tersimpan di folder `.wwebjs_auth/`; jangan dihapus agar tidak perlu scan ulang.
