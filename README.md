# HABIBI BOT 🤖

Habibih JPM ID — Bot WhatsApp dengan 10 fitur, powered by `@habibicox10/zapo-id`.

## Fitur

| Perintah | Fungsi |
|----------|--------|
| `.jpm <pesan>` | Broadcast ke semua grup |
| `.jpmtag <pesan>` | Broadcast + hidden tag semua member |
| `.jpmch <id@newsletter> <pesan>` | Kirim pesan ke channel |
| `.swgc <pesan>` | Kirim status ke semua grup |
| `.pushkontak <id> <pesan>` | Kirim pesan ke grup tertentu |
| `.cekidgc <link>` | Cek ID grup dari link invite |
| `.listgc` | Daftar grup yang diikuti bot |
| `.tagall [teks]` | Tag semua member grup |
| `.privacy` | Cek/ubah privacy settings akun |
| `.joingc <link>` | Join grup via link invite |
| `.menu` | Daftar perintah |
| Auto | Auto-follow 4 channel + pairing code `HABBYFAM` (bawaan lib) |

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
