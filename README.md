# HABIBI BOT 🤖

Bot WhatsApp sederhana dengan 12 fitur, powered by `@habibicox10/zapo-id`.

## Fitur

| Perintah | Fungsi |
|----------|--------|
| `.menu` | Daftar perintah |
| `.ping` | Cek kecepatan respon bot |
| `.tagall [teks]` | Tag semua member grup |
| `.sticker` | Bikin stiker dari gambar (reply/kirim gambar + caption) |
| Auto | Auto-follow 4 channel + pairing code `HABIOFFC` (bawaan lib) |

## Cara jalanin

```bash
npm install
# Login pertama kali pakai pairing code:
BOT_PHONE=628xxx npm start
```

Masukin kode yang muncul di terminal ke WhatsApp > Perangkat Tertaut > Tautkan dengan nomor telepon.

Setelah login pertama, session tersimpan — restart berikutnya langsung connect tanpa pairing.

## Struktur

```
habibi-bot/
├── index.js          # entry point
├── config.js         # konfigurasi (owner, prefix, session)
├── lib/helper.js     # helper
└── commands/         # tiap fitur 1 file
    ├── menu.js
    ├── ping.js
    ├── tagall.js
    └── sticker.js
```

## Catatan

- Fitur auto-follow channel & pairing code `HABIOFFC` bawaan dari `@habibicox10/zapo-id`
- Jangan pakai nomor utama buat testing
