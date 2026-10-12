const config = require('../config')

module.exports = {
    name: 'menu',
    description: 'Tampilkan daftar perintah',
    async run({ client, chatJid }) {
        const text =
            `*${config.botName}* 🤖\n\n` +
            `Daftar perintah:\n` +
            `• ${config.prefix}menu — daftar perintah\n` +
            `• ${config.prefix}ping — cek kecepatan bot\n` +
            `• ${config.prefix}tagall [teks] — tag semua member grup\n` +
            `• ${config.prefix}sticker — reply gambar untuk jadi stiker\n` +
            `• ${config.prefix}jpm <pesan> — broadcast ke semua grup\n` +
            `• ${config.prefix}listgc — daftar grup bot\n` +
            `• ${config.prefix}pushkontak <id> <pesan> — kirim ke grup tertentu\n` +
            `• ${config.prefix}joingc <link> — join grup via link\n` +
            `• ${config.prefix}cekidch <link> — cek ID channel\n` +
            `• ${config.prefix}jpmtag <pesan> — broadcast + tag semua\n` +
            `• ${config.prefix}swgc <pesan> — status ke semua grup (eksperimental)\n` +
            `• ${config.prefix}poll <tanya> | <opsi1> | <opsi2> — bikin polling\n` +
            `• ${config.prefix}promote — reply/mention jadi admin\n` +
            `• ${config.prefix}demote — reply/mention turunkan admin\n` +
            `• ${config.prefix}kick — reply/mention keluarkan\n` +
            `• ${config.prefix}privacy — cek/ubah privacy akun\n` +
            `• ${config.prefix}call <nomor> — telepon + putar pesan suara\n` +
            `• ${config.prefix}linkgc — ambil link grup\n` +
            `• ${config.prefix}gcinfo — info detail grup\n` +
            `• ${config.prefix}open / close — buka/tutup grup\n` +
            `• ${config.prefix}setname / setdesc — ganti nama/deskripsi\n` +
            `• ${config.prefix}revokelink — reset link invite\n` +
            `• ${config.prefix}leave — bot keluar grup\n` +
            `• ${config.prefix}button <teks> | <tbl1> | <tbl2> — pesan + tombol (eksperimental)\n\n` +
            `_Powered by @habibicox10/zapo-id_`
        await client.message.send(chatJid, text)
    }
}
